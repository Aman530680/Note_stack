const { Note, User } = require('../models');

// GET /api/analytics/top-downloads
exports.topDownloads = async (req, res) => {
  try {
    const data = await Note.find({ status: 'Approved' })
      .select('title downloads subject')
      .sort({ downloads: -1 })
      .limit(10);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/leaderboard
exports.leaderboard = async (req, res) => {
  try {
    const data = await User.find({ role: 'student' })
      .select('name email contributionScore coins')
      .sort({ contributionScore: -1 })
      .limit(10);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/subject-stats
exports.subjectStats = async (req, res) => {
  try {
    const data = await Note.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: '$subject', count: { $sum: 1 }, totalDownloads: { $sum: '$downloads' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/weekly-uploads
exports.weeklyUploads = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const data = await Note.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing days with 0
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = data.find(x => x._id === dateStr);
      result.push({ date: dateStr, count: found ? found.count : 0 });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/overview
exports.overview = async (req, res) => {
  try {
    const [totalNotes, totalUsers, totalDownloads] = await Promise.all([
      Note.countDocuments({ status: 'Approved' }),
      User.countDocuments({ role: 'student' }),
      Note.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }])
    ]);
    res.json({
      success: true,
      data: {
        totalNotes,
        totalUsers,
        totalDownloads: totalDownloads[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
