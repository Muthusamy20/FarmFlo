const cron = require('node-cron');
const { Op } = require('sequelize');
const {
  Notification, Vaccination, FeedInventory, Cow, Goat, BreedingRecord,
} = require('../models');

const createNotification = async (title, message, type, link = null, userId = null) => {
  const existing = await Notification.findOne({
    where: { title, message, created_at: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
  if (!existing) {
    await Notification.create({ user_id: userId, title, message, type, link });
  }
};

const runDailyAlerts = async () => {
  try {
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const dueVaccinations = await Vaccination.count({
      where: {
        deleted_at: null,
        next_due_date: { [Op.lte]: weekFromNow },
        status: { [Op.in]: ['scheduled', 'overdue'] },
      },
    });
    if (dueVaccinations > 0) {
      await createNotification(
        'Vaccinations Due',
        `${dueVaccinations} vaccination(s) due within 7 days`,
        'vaccination', '/vaccinations'
      );
    }

    const lowStock = await FeedInventory.findAll({
      where: { deleted_at: null },
    });
    const lowCount = lowStock.filter((f) => parseFloat(f.remaining_stock) <= parseFloat(f.low_stock_alert)).length;
    if (lowCount > 0) {
      await createNotification(
        'Low Feed Stock',
        `${lowCount} feed item(s) below minimum stock level`,
        'low_stock', '/feed'
      );
    }

    const sickAnimals = await Cow.count({ where: { deleted_at: null, health_status: 'sick' } })
      + await Goat.count({ where: { deleted_at: null, health_status: 'sick' } });
    if (sickAnimals > 0) {
      await createNotification(
        'Sick Animals Alert',
        `${sickAnimals} animal(s) currently marked as sick`,
        'health', '/health'
      );
    }

    const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const dueDeliveries = await BreedingRecord.count({
      where: {
        deleted_at: null,
        pregnancy_status: 'pregnant',
        expected_delivery: { [Op.lte]: twoWeeks },
      },
    });
    if (dueDeliveries > 0) {
      await createNotification(
        'Pregnancy Reminder',
        `${dueDeliveries} expected delivery(ies) within 14 days`,
        'breeding', '/breeding'
      );
    }

    await createNotification(
      'Daily Collection Reminder',
      'Remember to record today\'s milk and egg production',
      'reminder', '/dashboard'
    );

    console.log('[FarmFlo] Daily notification alerts generated');
  } catch (err) {
    console.error('[FarmFlo] Notification cron error:', err.message);
  }
};

const startNotificationCron = () => {
  cron.schedule('0 6 * * *', runDailyAlerts);
  if (process.env.NODE_ENV === 'development') {
    setTimeout(runDailyAlerts, 5000);
  }
};

module.exports = { startNotificationCron, runDailyAlerts };
