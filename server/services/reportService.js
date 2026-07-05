const { Op, fn, col } = require('sequelize');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const {
  MilkProduction, EggProduction, HealthRecord, Vaccination,
  Sale, Expense, Income, Cow, Goat,
} = require('../models');

const getDateRange = (type, from, to) => {
  const now = new Date();
  let start, end = to || now.toISOString().split('T')[0];

  if (from) {
    start = from;
  } else {
    switch (type) {
      case 'daily':
        start = end;
        break;
      case 'weekly':
        start = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'annual':
        start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }
  }
  return { start, end };
};

const buildWhere = (farmId, start, end, dateField = 'created_at') => {
  const where = { deleted_at: null };
  if (farmId) where.farm_id = farmId;
  return where;
};

const dateFilter = (field, start, end) => ({ [field]: { [Op.between]: [start, end] } });

exports.generateReport = async (type, { from, to, farmId }) => {
  const { start, end } = getDateRange(type, from, to);
  const base = buildWhere(farmId, start, end);
  let title = `${type} Report`;
  let headers = [];
  let rows = [];

  switch (type) {
    case 'milk':
    case 'milk-production': {
      title = 'Milk Production Report';
      headers = ['Date', 'Cow ID', 'Morning', 'Evening', 'Total', 'Fat %', 'Quality'];
      const data = await MilkProduction.findAll({
        where: { ...base, ...dateFilter('collection_date', start, end) },
        include: [{ association: 'cow', attributes: ['cow_code'] }],
        order: [['collection_date', 'DESC']],
      });
      rows = data.map((d) => [
        d.collection_date, d.cow?.cow_code || d.cow_id,
        d.morning_milk, d.evening_milk, d.total_milk, d.fat_percentage, d.quality,
      ]);
      break;
    }
    case 'egg':
    case 'egg-production': {
      title = 'Egg Production Report';
      headers = ['Date', 'Batch', 'Collected', 'Damaged', 'Saleable'];
      const data = await EggProduction.findAll({
        where: { ...base, ...dateFilter('collection_date', start, end) },
        include: [{ association: 'poultryBatch', attributes: ['batch_code'] }],
        order: [['collection_date', 'DESC']],
      });
      rows = data.map((d) => [
        d.collection_date, d.poultryBatch?.batch_code || d.poultry_batch_id,
        d.eggs_collected, d.damaged_eggs, d.saleable_eggs,
      ]);
      break;
    }
    case 'health':
    case 'animal-health': {
      title = 'Animal Health Report';
      headers = ['Date', 'Animal Type', 'Disease', 'Treatment', 'Recovery Status'];
      const data = await HealthRecord.findAll({
        where: { ...base, ...dateFilter('treatment_date', start, end) },
        order: [['treatment_date', 'DESC']],
      });
      rows = data.map((d) => [d.treatment_date, d.animal_type, d.disease, d.treatment, d.recovery_status]);
      break;
    }
    case 'vaccination': {
      title = 'Vaccination Report';
      headers = ['Date', 'Animal Type', 'Vaccine', 'Next Due', 'Status'];
      const data = await Vaccination.findAll({
        where: { ...base, ...dateFilter('vaccination_date', start, end) },
        order: [['vaccination_date', 'DESC']],
      });
      rows = data.map((d) => [d.vaccination_date, d.animal_type, d.vaccine, d.next_due_date, d.status]);
      break;
    }
    case 'sales': {
      title = 'Sales Report';
      headers = ['Date', 'Product', 'Qty', 'Price', 'Total', 'Payment Status'];
      const data = await Sale.findAll({
        where: { ...base, ...dateFilter('sale_date', start, end) },
        order: [['sale_date', 'DESC']],
      });
      rows = data.map((d) => [d.sale_date, d.product_name, d.quantity, d.price, d.total, d.payment_status]);
      break;
    }
    case 'expense': {
      title = 'Expense Report';
      headers = ['Date', 'Category', 'Description', 'Amount'];
      const data = await Expense.findAll({
        where: { ...base, ...dateFilter('expense_date', start, end) },
        order: [['expense_date', 'DESC']],
      });
      rows = data.map((d) => [d.expense_date, d.category, d.description, d.amount]);
      break;
    }
    case 'profit-loss':
    case 'profit': {
      title = 'Profit & Loss Report';
      headers = ['Type', 'Source/Category', 'Amount'];
      const [incomes, expenses, sales] = await Promise.all([
        Income.findAll({ where: { ...base, ...dateFilter('income_date', start, end) } }),
        Expense.findAll({ where: { ...base, ...dateFilter('expense_date', start, end) } }),
        Sale.findAll({ where: { ...base, ...dateFilter('sale_date', start, end) } }),
      ]);
      rows = [
        ...incomes.map((i) => ['Income', i.source, i.amount]),
        ...sales.map((s) => ['Sales', s.product_name, s.total]),
        ...expenses.map((e) => ['Expense', e.category, -parseFloat(e.amount)]),
      ];
      const totalIncome = incomes.reduce((s, i) => s + parseFloat(i.amount), 0)
        + sales.reduce((s, i) => s + parseFloat(i.total), 0);
      const totalExpense = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
      rows.push(['', 'NET PROFIT', totalIncome - totalExpense]);
      break;
    }
    default: {
      title = `${type.charAt(0).toUpperCase() + type.slice(1)} Report`;
      headers = ['Metric', 'Value'];
      const [milk, eggs, salesTotal, expenseTotal] = await Promise.all([
        MilkProduction.sum('total_milk', { where: { ...base, ...dateFilter('collection_date', start, end) } }),
        EggProduction.sum('saleable_eggs', { where: { ...base, ...dateFilter('collection_date', start, end) } }),
        Sale.sum('total', { where: { ...base, ...dateFilter('sale_date', start, end) } }),
        Expense.sum('amount', { where: { ...base, ...dateFilter('expense_date', start, end) } }),
      ]);
      rows = [
        ['Period', `${start} to ${end}`],
        ['Total Milk (L)', parseFloat(milk) || 0],
        ['Total Eggs', parseInt(eggs) || 0],
        ['Total Sales', parseFloat(salesTotal) || 0],
        ['Total Expenses', parseFloat(expenseTotal) || 0],
        ['Cows', await Cow.count({ where: base })],
        ['Goats', await Goat.count({ where: base })],
      ];
    }
  }

  return { title, headers, rows, period: { start, end } };
};

exports.toPDF = (report) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);

  doc.fontSize(20).text(report.title, { align: 'center' });
  doc.fontSize(10).text(`Period: ${report.period.start} to ${report.period.end}`, { align: 'center' });
  doc.moveDown();

  const colWidth = 500 / report.headers.length;
  doc.fontSize(9).font('Helvetica-Bold');
  report.headers.forEach((h, i) => doc.text(h, 50 + i * colWidth, doc.y, { width: colWidth, continued: i < report.headers.length - 1 }));
  doc.moveDown(0.5);
  doc.font('Helvetica');
  report.rows.forEach((row) => {
    row.forEach((cell, i) => doc.text(String(cell ?? ''), 50 + i * colWidth, doc.y, { width: colWidth, continued: i < row.length - 1 }));
    doc.moveDown(0.3);
  });
  doc.end();
});

exports.toExcel = async (report) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Report');
  ws.addRow(report.headers);
  report.rows.forEach((r) => ws.addRow(r));
  ws.getRow(1).font = { bold: true };
  return wb.xlsx.writeBuffer();
};

exports.toCSV = (report) => {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [report.headers.map(escape).join(',')];
  report.rows.forEach((r) => lines.push(r.map(escape).join(',')));
  return lines.join('\n');
};
