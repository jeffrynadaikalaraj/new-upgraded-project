const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

exports.getMetrics = asyncHandler(async (req, res, next) => {
  // 1. Database Health
  const dbState = mongoose.connection.readyState;
  let dbStatus = 'Unknown';
  if (dbState === 0) dbStatus = 'Disconnected';
  if (dbState === 1) dbStatus = 'Connected';
  if (dbState === 2) dbStatus = 'Connecting';
  if (dbState === 3) dbStatus = 'Disconnecting';

  // 2. Global Chat & Message Metrics (for the specific user to preserve privacy)
  // Or we could make this an admin-only endpoint in a real app, but for personal OS, it's per-user.
  const userId = req.user.id;

  const totalChats = await Chat.countDocuments({ userId });
  const aiMessages = await Message.find({ userId, role: 'assistant' }).select('latencyMs model timestamp');
  
  const totalAIMessages = aiMessages.length;

  let totalLatency = 0;
  let validLatencyCount = 0;
  
  // Model distribution
  const modelUsage = {};
  
  // Latency over time (grouped by day)
  const latencyByDay = {};

  aiMessages.forEach(msg => {
    // Model aggregation
    const model = msg.model || 'unknown';
    modelUsage[model] = (modelUsage[model] || 0) + 1;

    // Latency aggregation
    if (msg.latencyMs) {
      totalLatency += msg.latencyMs;
      validLatencyCount++;

      // Daily grouping
      const dateString = new Date(msg.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
      if (!latencyByDay[dateString]) {
        latencyByDay[dateString] = { sum: 0, count: 0 };
      }
      latencyByDay[dateString].sum += msg.latencyMs;
      latencyByDay[dateString].count += 1;
    }
  });

  const averageLatencyMs = validLatencyCount > 0 ? Math.round(totalLatency / validLatencyCount) : 0;

  // Format chart data for frontend
  const modelChartData = Object.keys(modelUsage).map(modelName => ({
    name: modelName,
    value: modelUsage[modelName]
  }));

  const latencyChartData = Object.keys(latencyByDay).sort().map(date => ({
    date,
    avgLatency: Math.round(latencyByDay[date].sum / latencyByDay[date].count)
  }));

  res.status(200).json({
    success: true,
    data: {
      health: {
        database: dbStatus,
        api: 'Online'
      },
      stats: {
        totalChats,
        totalAIMessages,
        averageLatencyMs
      },
      charts: {
        modelUsage: modelChartData,
        latencyTrends: latencyChartData
      }
    }
  });
});
