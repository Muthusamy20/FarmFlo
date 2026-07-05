const aiService = require('../services/aiService');

exports.getInsights = async (req, res, next) => {
  try {
    const farmId = req.query.farmId || null;
    const predictions = await aiService.getPredictions(farmId);
    const recommendations = await aiService.getOpenAIRecommendations(predictions);
    res.json({ predictions, recommendations });
  } catch (err) { next(err); }
};
