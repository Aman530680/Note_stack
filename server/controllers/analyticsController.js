const { Note, User } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/db');

exports.topDownloads = async (req, res) => {
  try {
    const data = await Note.findAll({
      where: { status: 'Approved' },
      attributes: ['title', 'downloads', 'subject'],
      order: [['downloads', 'DESC']],
      limit: 10
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.leaderboard = async (req, res) => {
  try {
    const data = await User.findAll({
      where: { role: 'student' },
      attributes: ['name', 'email', 'contributionScore', 'coins'],
      order: [['contributionScore', 'DESC']],
      limit: 10
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.subjectStats = async (req, res) => {
  try {
    const data = await Note.findAll({
      where: { status: 'Approved' },
      attributes: [
        'subject',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('downloads')), 'totalDownloads']
      ],
      group: ['subject'],
      order: [[literal('count'), 'DESC']],
      limit: 10,
      raw: true
    });
    const formatted = data.map(d => ({ _id: d.subject, count: parseInt(d.count), totalDownloads: parseInt(d.totalDownloads) || 0 }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.weeklyUploads = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const data = await Note.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      attributes: [
        [fn('TO_CHAR', col('createdAt'), 'YYYY-MM-DD'), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('TO_CHAR', col('createdAt'), 'YYYY-MM-DD')],
      raw: true
    });

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = data.find(x => x.date === dateStr);
      result.push({ date: dateStr, count: found ? parseInt(found.count) : 0 });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.overview = async (req, res) => {
  try {
    const [totalNotes, totalUsers, downloadsResult] = await Promise.all([
      Note.count({ where: { status: 'Approved' } }),
      User.count({ where: { role: 'student' } }),
      Note.findOne({ attributes: [[fn('SUM', col('downloads')), 'total']], raw: true })
    ]);
    res.json({
      success: true,
      data: {
        totalNotes,
        totalUsers,
        totalDownloads: parseInt(downloadsResult?.total) || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
