const { Op, fn, col, literal } = require('sequelize');
const {
  Farm, Cow, Goat, PoultryBatch, FeedInventory, MilkProduction, EggProduction,
  Vaccination, BreedingRecord, Sale, Expense, Income, ActivityLog, Notification,
} = require('../models');
const { getFarmFilter } = require('../middleware/rbac');

const today = () => new Date().toISOString().split('T')[0];
const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

exports.getSummary = async (req, res, next) => {
  try {
    const farmFilter = req.user.role === 'admin' ? {} : getFarmFilter(req.user);
    const notDeleted = { deleted_at: null };
    const farmWhere = { ...notDeleted, ...farmFilter };
    const todayStr = today();
    const monthStartStr = monthStart();

    const [
      totalFarms, totalCows, totalGoats, poultryBatches,
      todayMilk, todayEggs, feedItems, sickCows, sickGoats,
      vaccinationsDue, pregnantCows, pregnantGoats,
      monthlyIncome, monthlyExpenses, totalSales,
    ] = await Promise.all([
      Farm.count({ where: farmWhere }),
      Cow.count({ where: farmWhere }),
      Goat.count({ where: farmWhere }),
      PoultryBatch.findAll({ where: farmWhere, attributes: ['total_birds'] }),
      MilkProduction.sum('total_milk', { where: { ...farmWhere, collection_date: todayStr } }),
      EggProduction.sum('saleable_eggs', { where: { ...farmWhere, collection_date: todayStr } }),
      FeedInventory.findAll({ where: farmWhere, attributes: ['remaining_stock', 'low_stock_alert'] }),
      Cow.count({ where: { ...farmWhere, health_status: 'sick' } }),
      Goat.count({ where: { ...farmWhere, health_status: 'sick' } }),
      Vaccination.count({
        where: {
          ...farmWhere,
          next_due_date: { [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
          status: { [Op.ne]: 'completed' },
        },
      }),
      Cow.count({ where: { ...farmWhere, pregnancy_status: 'pregnant' } }),
      Goat.count({ where: { ...farmWhere, pregnancy_status: 'pregnant' } }),
      Income.sum('amount', { where: { ...farmWhere, income_date: { [Op.gte]: monthStartStr } } }),
      Expense.sum('amount', { where: { ...farmWhere, expense_date: { [Op.gte]: monthStartStr } } }),
      Sale.sum('total', { where: { ...farmWhere, sale_date: { [Op.gte]: monthStartStr } } }),
    ]);

    const totalPoultry = poultryBatches.reduce((s, b) => s + (b.total_birds || 0), 0);
    const feedStock = feedItems.reduce((s, f) => s + parseFloat(f.remaining_stock || 0), 0);
    const lowStockCount = feedItems.filter((f) => parseFloat(f.remaining_stock) <= parseFloat(f.low_stock_alert)).length;

    const income = parseFloat(monthlyIncome) || 0;
    const expenses = parseFloat(monthlyExpenses) || 0;
    const sales = parseFloat(totalSales) || 0;

    res.json({
      cards: {
        totalFarms, totalCows, totalGoats, totalPoultry,
        todayMilk: parseFloat(todayMilk) || 0,
        todayEggs: parseInt(todayEggs) || 0,
        feedStock, lowStockCount,
        sickAnimals: sickCows + sickGoats,
        vaccinationsDue,
        pregnantAnimals: pregnantCows + pregnantGoats,
        monthlyIncome: income,
        monthlyExpenses: expenses,
        totalSales: sales,
        profit: income + sales - expenses,
      },
    });
  } catch (err) { next(err); }
};

exports.getCharts = async (req, res, next) => {
  try {
    const farmFilter = req.user.role === 'admin' ? {} : getFarmFilter(req.user);
    const notDeleted = { deleted_at: null };
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const milkData = await MilkProduction.findAll({
      where: { ...notDeleted, ...farmFilter, collection_date: { [Op.gte]: startDate } },
      attributes: ['collection_date', [fn('SUM', col('total_milk')), 'total']],
      group: ['collection_date'],
      order: [['collection_date', 'ASC']],
      raw: true,
    });

    const eggData = await EggProduction.findAll({
      where: { ...notDeleted, ...farmFilter, collection_date: { [Op.gte]: startDate } },
      attributes: ['collection_date', [fn('SUM', col('saleable_eggs')), 'total']],
      group: ['collection_date'],
      order: [['collection_date', 'ASC']],
      raw: true,
    });

    const [cowCount, goatCount, poultrySum] = await Promise.all([
      Cow.count({ where: { ...notDeleted, ...farmFilter } }),
      Goat.count({ where: { ...notDeleted, ...farmFilter } }),
      PoultryBatch.sum('total_birds', { where: { ...notDeleted, ...farmFilter } }),
    ]);

    const monthStartStr = monthStart();
    const [incomeByDay, expenseByDay] = await Promise.all([
      Income.findAll({
        where: { ...notDeleted, ...farmFilter, income_date: { [Op.gte]: monthStartStr } },
        attributes: ['income_date', [fn('SUM', col('amount')), 'total']],
        group: ['income_date'], order: [['income_date', 'ASC']], raw: true,
      }),
      Expense.findAll({
        where: { ...notDeleted, ...farmFilter, expense_date: { [Op.gte]: monthStartStr } },
        attributes: ['expense_date', [fn('SUM', col('amount')), 'total']],
        group: ['expense_date'], order: [['expense_date', 'ASC']], raw: true,
      }),
    ]);

    res.json({
      milkProduction: milkData.map((d) => ({ date: d.collection_date, value: parseFloat(d.total) })),
      eggProduction: eggData.map((d) => ({ date: d.collection_date, value: parseInt(d.total) })),
      animalDistribution: { cows: cowCount, goats: goatCount, poultry: parseInt(poultrySum) || 0 },
      revenue: incomeByDay.map((d) => ({ date: d.income_date, value: parseFloat(d.total) })),
      expenses: expenseByDay.map((d) => ({ date: d.expense_date, value: parseFloat(d.total) })),
    });
  } catch (err) { next(err); }
};

exports.getRecentActivities = async (req, res, next) => {
  try {
    const logs = await ActivityLog.findAll({
      include: [{ association: 'user', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
      limit: 20,
    });
    res.json(logs);
  } catch (err) { next(err); }
};

exports.getCalendarEvents = async (req, res, next) => {
  try {
    const farmFilter = req.user.role === 'admin' ? {} : getFarmFilter(req.user);
    const [vaccinations, breedings] = await Promise.all([
      Vaccination.findAll({
        where: { deleted_at: null, ...farmFilter, next_due_date: { [Op.not]: null } },
        attributes: ['id', 'vaccine', 'next_due_date', 'animal_type'],
        limit: 50,
      }),
      BreedingRecord.findAll({
        where: { deleted_at: null, ...farmFilter, expected_delivery: { [Op.not]: null } },
        attributes: ['id', 'expected_delivery', 'animal_type', 'pregnancy_status'],
        limit: 50,
      }),
    ]);

    const events = [
      ...vaccinations.map((v) => ({
        id: `v-${v.id}`, title: `Vaccination: ${v.vaccine}`, date: v.next_due_date, type: 'vaccination',
      })),
      ...breedings.map((b) => ({
        id: `b-${b.id}`, title: `Expected Delivery (${b.animal_type})`, date: b.expected_delivery, type: 'breeding',
      })),
    ];
    res.json(events);
  } catch (err) { next(err); }
};
