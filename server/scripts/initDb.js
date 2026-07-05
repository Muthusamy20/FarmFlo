require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, SystemSetting, Farm, Cow, Goat, PoultryBatch, FeedInventory, MilkProduction, EggProduction, Customer, Sale, Expense, Income } = require('../models');

async function init() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL');

    await sequelize.sync({ alter: true });
    console.log('Database synced');

    const userCount = await User.count();
    if (userCount === 0) {
      const adminHash = await bcrypt.hash('Admin@123', 12);
      const userHash = await bcrypt.hash('User@123', 12);

      await User.bulkCreate([
        { name: 'Farm Admin', email: 'admin@farmflo.com', password_hash: adminHash, role: 'admin', email_verified: true },
        { name: 'Farm User', email: 'user@farmflo.com', password_hash: userHash, role: 'user', email_verified: true },
      ]);

      await SystemSetting.bulkCreate([
        { setting_key: 'farm_info', setting_value: { name: 'FarmFlo Demo Farm', address: '123 Green Valley Road', contact: '+91-9876543210' } },
        { setting_key: 'notification_settings', setting_value: { vaccination: true, lowStock: true, sickAnimals: true, pregnancy: true, milkReminder: true, eggReminder: true } },
      ]);

      const farms = await Farm.bulkCreate([
        { farm_code: 'FM001', name: 'Green Valley Dairy', owner_name: 'John Farmer', address: '123 Green Valley Road', contact: '+91-9876543210', farm_type: 'mixed', capacity: 500, created_by: 1 },
        { farm_code: 'FM002', name: 'Sunrise Poultry', owner_name: 'Jane Farmer', address: '456 Sunrise Lane', contact: '+91-9876543211', farm_type: 'poultry', capacity: 2000, created_by: 1 },
      ]);

      await User.update({ assigned_farm_id: farms[0].id }, { where: { id: 2 } });

      const cows = await Cow.bulkCreate([
        { farm_id: 1, cow_code: 'CW001', tag_number: 'TAG-001', breed: 'Holstein', age: 4.5, weight: 550, gender: 'female', lactation_status: 'lactating', milk_yield: 25.5, health_status: 'healthy', created_by: 1 },
        { farm_id: 1, cow_code: 'CW002', tag_number: 'TAG-002', breed: 'Jersey', age: 3.2, weight: 420, gender: 'female', lactation_status: 'lactating', pregnancy_status: 'pregnant', milk_yield: 18, health_status: 'healthy', created_by: 1 },
      ]);

      await Goat.bulkCreate([
        { farm_id: 1, goat_code: 'GT001', breed: 'Boer', age: 2.5, weight: 45, gender: 'female', health_status: 'healthy', created_by: 1 },
        { farm_id: 1, goat_code: 'GT002', breed: 'Nubian', age: 1.8, weight: 38, gender: 'male', health_status: 'healthy', created_by: 1 },
      ]);

      const batch = await PoultryBatch.create({ farm_id: 2, batch_code: 'PL001', bird_type: 'Layer', breed: 'Rhode Island Red', total_birds: 500, age: 6, feed_type: 'Layer Feed', daily_feed_consumption: 50, egg_production: 420, created_by: 1 });

      await FeedInventory.bulkCreate([
        { farm_id: 1, feed_name: 'Dairy Feed Premium', feed_type: 'Concentrate', animal_type: 'cow', quantity: 500, remaining_stock: 350, low_stock_alert: 50, cost: 15000, supplier: 'AgriSupply Co', purchase_date: new Date(), created_by: 1 },
        { farm_id: 2, feed_name: 'Layer Feed', feed_type: 'Pellet', animal_type: 'poultry', quantity: 200, remaining_stock: 120, low_stock_alert: 30, cost: 8000, supplier: 'PoultryFeed Ltd', purchase_date: new Date(), created_by: 1 },
      ]);

      const today = new Date().toISOString().split('T')[0];
      await MilkProduction.bulkCreate([
        { farm_id: 1, cow_id: cows[0].id, morning_milk: 12.5, evening_milk: 13, total_milk: 25.5, fat_percentage: 4.2, quality: 'A', collection_date: today, created_by: 1 },
        { farm_id: 1, cow_id: cows[1].id, morning_milk: 9, evening_milk: 9, total_milk: 18, fat_percentage: 4.5, quality: 'A', collection_date: today, created_by: 1 },
      ]);

      await EggProduction.create({ farm_id: 2, poultry_batch_id: batch.id, eggs_collected: 430, damaged_eggs: 10, saleable_eggs: 420, collection_date: today, created_by: 1 });

      const customers = await Customer.bulkCreate([
        { farm_id: 1, name: 'Local Dairy Co-op', phone: '+91-9123456789', address: 'Market Road', created_by: 1 },
        { farm_id: 2, name: 'Fresh Eggs Mart', phone: '+91-9234567890', address: 'High Street', created_by: 1 },
      ]);

      await Sale.bulkCreate([
        { farm_id: 1, customer_id: customers[0].id, product_type: 'milk', product_name: 'Fresh Milk', quantity: 100, price: 55, total: 5500, payment_method: 'bank_transfer', invoice_number: 'INV-001', payment_status: 'paid', sale_date: today, created_by: 1 },
        { farm_id: 2, customer_id: customers[1].id, product_type: 'eggs', product_name: 'Farm Fresh Eggs', quantity: 300, price: 8, total: 2400, payment_method: 'cash', invoice_number: 'INV-002', payment_status: 'paid', sale_date: today, created_by: 1 },
      ]);

      await Expense.bulkCreate([
        { farm_id: 1, category: 'feed', description: 'Monthly feed purchase', amount: 15000, expense_date: today, created_by: 1 },
        { farm_id: 1, category: 'electricity', description: 'Farm electricity bill', amount: 3500, expense_date: today, created_by: 1 },
      ]);

      await Income.bulkCreate([
        { farm_id: 1, source: 'Milk Sales', amount: 5500, income_date: today, created_by: 1 },
        { farm_id: 2, source: 'Egg Sales', amount: 2400, income_date: today, created_by: 1 },
      ]);

      console.log('Seed data created');
    } else {
      console.log('Database already seeded');
    }

    console.log('Init complete');
    process.exit(0);
  } catch (err) {
    console.error('Init failed:', err.message);
    process.exit(1);
  }
}

init();
