const { Op, fn, col } = require('sequelize');
const {
  MilkProduction, EggProduction, FeedInventory, HealthRecord,
  Vaccination, Cow, Goat, PoultryBatch, Expense, Income, Sale,
} = require('../models');

const linearRegression = (points) => {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y || 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  points.forEach(({ x, y }) => {
    sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
  });
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
};

const movingAverage = (values, window = 7) => {
  if (values.length === 0) return 0;
  const slice = values.slice(-window);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
};

const forecastSeries = (historical, days = 7) => {
  const points = historical.map((h, i) => ({ x: i, y: h.value }));
  const { slope, intercept } = linearRegression(points);
  const avg = movingAverage(historical.map((h) => h.value));
  const forecasts = [];
  for (let i = 1; i <= days; i++) {
    const regValue = intercept + slope * (points.length + i - 1);
    forecasts.push({
      day: i,
      predicted: Math.max(0, Math.round((regValue * 0.6 + avg * 0.4) * 100) / 100),
    });
  }
  return forecasts;
};

exports.getPredictions = async (farmId) => {
  const base = { deleted_at: null };
  if (farmId) base.farm_id = farmId;
  const days = 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [milkData, eggData, feedData] = await Promise.all([
    MilkProduction.findAll({
      where: { ...base, collection_date: { [Op.gte]: startDate } },
      attributes: ['collection_date', [fn('SUM', col('total_milk')), 'total']],
      group: ['collection_date'], order: [['collection_date', 'ASC']], raw: true,
    }),
    EggProduction.findAll({
      where: { ...base, collection_date: { [Op.gte]: startDate } },
      attributes: ['collection_date', [fn('SUM', col('saleable_eggs')), 'total']],
      group: ['collection_date'], order: [['collection_date', 'ASC']], raw: true,
    }),
    FeedInventory.findAll({ where: base, attributes: ['remaining_stock', 'daily_feed_consumption'] }),
  ]);

  const milkHistorical = milkData.map((d) => ({ date: d.collection_date, value: parseFloat(d.total) }));
  const eggHistorical = eggData.map((d) => ({ date: d.collection_date, value: parseInt(d.total) }));

  const sickCount = await HealthRecord.count({
    where: { ...base, recovery_status: { [Op.in]: ['under_treatment', 'critical'] } },
  });
  const overdueVacc = await Vaccination.count({
    where: { ...base, next_due_date: { [Op.lt]: new Date() }, status: { [Op.ne]: 'completed' } },
  });
  const totalMortality = await PoultryBatch.sum('mortality', { where: base }) || 0;
  const totalBirds = await PoultryBatch.sum('total_birds', { where: base }) || 1;
  const mortalityRate = (totalMortality / totalBirds) * 100;

  const diseaseRisk = Math.min(100, Math.round(
    sickCount * 15 + overdueVacc * 10 + mortalityRate * 2 + (new Date().getMonth() >= 5 && new Date().getMonth() <= 8 ? 10 : 0)
  ));

  const [monthIncome, monthExpense, monthSales] = await Promise.all([
    Income.sum('amount', { where: { ...base, income_date: { [Op.gte]: startDate } } }),
    Expense.sum('amount', { where: { ...base, expense_date: { [Op.gte]: startDate } } }),
    Sale.sum('total', { where: { ...base, sale_date: { [Op.gte]: startDate } } }),
  ]);

  const revenue = (parseFloat(monthIncome) || 0) + (parseFloat(monthSales) || 0);
  const expenses = parseFloat(monthExpense) || 0;
  const productionTrend = milkHistorical.length >= 2
    ? (milkHistorical[milkHistorical.length - 1].value - milkHistorical[0].value) / milkHistorical[0].value * 100
    : 0;

  const performanceScore = Math.min(100, Math.max(0, Math.round(
    50 + productionTrend * 0.3 - (expenses / (revenue || 1)) * 20 - mortalityRate - diseaseRisk * 0.2
  )));

  const feedStock = feedData.reduce((s, f) => s + parseFloat(f.remaining_stock || 0), 0);
  const avgDailyFeed = feedData.length ? feedStock / 30 : 0;

  return {
    milkForecast: forecastSeries(milkHistorical),
    eggForecast: forecastSeries(eggHistorical),
    feedForecast: forecastSeries(
      milkHistorical.length ? milkHistorical.map((m) => ({ ...m, value: m.value * 0.5 })) : [{ value: avgDailyFeed }]
    ),
    diseaseRisk,
    performanceScore,
    metrics: { revenue, expenses, productionTrend, mortalityRate, feedStock },
    milkHistorical,
    eggHistorical,
  };
};

exports.getOpenAIRecommendations = async (predictions) => {
  if (!process.env.OPENAI_API_KEY) {
    return {
      available: false,
      message: 'Configure OPENAI_API_KEY for smart recommendations',
      recommendations: [
        predictions.diseaseRisk > 50
          ? 'High disease risk detected. Schedule veterinary checkups and review vaccination records.'
          : 'Disease risk is manageable. Maintain regular health monitoring.',
        predictions.performanceScore < 60
          ? 'Farm performance below target. Review feed efficiency and reduce unnecessary expenses.'
          : 'Farm performance is good. Continue current management practices.',
        predictions.metrics.feedStock < 100
          ? 'Feed stock is low. Reorder feed supplies to avoid production disruption.'
          : 'Feed inventory levels are adequate.',
      ],
    };
  }

  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `As a farm management advisor, provide 3 brief actionable recommendations based on: disease risk ${predictions.diseaseRisk}/100, performance score ${predictions.performanceScore}/100, revenue ${predictions.metrics.revenue}, expenses ${predictions.metrics.expenses}, feed stock ${predictions.metrics.feedStock}. Format as numbered list.`,
      }],
      max_tokens: 300,
    });
    const text = response.choices[0]?.message?.content || '';
    return {
      available: true,
      recommendations: text.split('\n').filter((l) => l.trim()).slice(0, 5),
    };
  } catch (err) {
    return {
      available: false,
      message: 'AI service temporarily unavailable',
      recommendations: ['Monitor animal health daily', 'Track feed consumption trends', 'Review vaccination schedules'],
    };
  }
};
