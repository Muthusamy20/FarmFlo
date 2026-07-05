const reportService = require('../services/reportService');

exports.generate = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { from, to, farmId, format = 'json' } = req.query;
    const report = await reportService.generateReport(type, { from, to, farmId });

    if (format === 'pdf') {
      const buffer = await reportService.toPDF(report);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report.pdf"`);
      return res.send(buffer);
    }
    if (format === 'xlsx') {
      const buffer = await reportService.toExcel(report);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report.xlsx"`);
      return res.send(buffer);
    }
    if (format === 'csv') {
      const csv = reportService.toCSV(report);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
      return res.send(csv);
    }
    res.json(report);
  } catch (err) { next(err); }
};

exports.getTypes = (req, res) => {
  res.json({
    types: [
      'daily', 'weekly', 'monthly', 'annual',
      'milk-production', 'egg-production', 'animal-health',
      'vaccination', 'sales', 'expense', 'profit-loss',
    ],
  });
};
