const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'user'), defaultValue: 'user' },
  avatar: DataTypes.STRING(255),
  assigned_farm_id: DataTypes.INTEGER,
  email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  refresh_token: DataTypes.TEXT,
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  theme: { type: DataTypes.STRING(20), defaultValue: 'light' },
  language: { type: DataTypes.STRING(10), defaultValue: 'en' },
  notification_prefs: DataTypes.JSON,
}, { tableName: 'users' });

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  token_hash: { type: DataTypes.STRING(255), allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
}, { tableName: 'password_reset_tokens', updatedAt: false });

const EmailVerificationToken = sequelize.define('EmailVerificationToken', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  token_hash: { type: DataTypes.STRING(255), allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
}, { tableName: 'email_verification_tokens', updatedAt: false });

const ActivityLog = sequelize.define('ActivityLog', {
  user_id: DataTypes.INTEGER,
  action: { type: DataTypes.STRING(100), allowNull: false },
  module: { type: DataTypes.STRING(50), allowNull: false },
  details: DataTypes.TEXT,
  ip: DataTypes.STRING(45),
}, { tableName: 'activity_logs', updatedAt: false });

const SystemSetting = sequelize.define('SystemSetting', {
  setting_key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  setting_value: { type: DataTypes.JSON, allowNull: false },
}, { tableName: 'system_settings', createdAt: false });

const Notification = sequelize.define('Notification', {
  user_id: DataTypes.INTEGER,
  title: { type: DataTypes.STRING(200), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  link: DataTypes.STRING(255),
}, { tableName: 'notifications', updatedAt: false });

const Farm = sequelize.define('Farm', {
  farm_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  owner_name: { type: DataTypes.STRING(100), allowNull: false },
  address: DataTypes.TEXT,
  contact: DataTypes.STRING(20),
  farm_type: { type: DataTypes.ENUM('dairy', 'goat', 'poultry', 'mixed'), defaultValue: 'mixed' },
  capacity: { type: DataTypes.INTEGER, defaultValue: 0 },
  image: DataTypes.STRING(255),
  created_by: DataTypes.INTEGER,
  deleted_at: DataTypes.DATE,
}, { tableName: 'farms', paranoid: false });

const Cow = sequelize.define('Cow', {
  farm_id: { type: DataTypes.INTEGER, allowNull: false },
  cow_code: { type: DataTypes.STRING(20), allowNull: false },
  rfid_qr: DataTypes.STRING(50),
  tag_number: DataTypes.STRING(50),
  breed: DataTypes.STRING(100),
  age: DataTypes.DECIMAL(5, 2),
  weight: DataTypes.DECIMAL(8, 2),
  gender: { type: DataTypes.ENUM('male', 'female'), defaultValue: 'female' },
  date_of_birth: DataTypes.DATEONLY,
  purchase_date: DataTypes.DATEONLY,
  purchase_cost: DataTypes.DECIMAL(12, 2),
  lactation_status: { type: DataTypes.ENUM('lactating', 'dry', 'heifer'), defaultValue: 'heifer' },
  pregnancy_status: { type: DataTypes.ENUM('not_pregnant', 'pregnant', 'delivered'), defaultValue: 'not_pregnant' },
  milk_yield: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
  health_status: { type: DataTypes.ENUM('healthy', 'sick', 'under_treatment', 'recovered'), defaultValue: 'healthy' },
  vaccination_status: { type: DataTypes.ENUM('up_to_date', 'due', 'overdue'), defaultValue: 'up_to_date' },
  image: DataTypes.STRING(255),
  created_by: DataTypes.INTEGER,
  deleted_at: DataTypes.DATE,
}, { tableName: 'cows' });

const Goat = sequelize.define('Goat', {
  farm_id: { type: DataTypes.INTEGER, allowNull: false },
  goat_code: { type: DataTypes.STRING(20), allowNull: false },
  rfid_qr: DataTypes.STRING(50),
  breed: DataTypes.STRING(100),
  age: DataTypes.DECIMAL(5, 2),
  weight: DataTypes.DECIMAL(8, 2),
  gender: { type: DataTypes.ENUM('male', 'female'), defaultValue: 'female' },
  pregnancy_status: { type: DataTypes.ENUM('not_pregnant', 'pregnant', 'delivered'), defaultValue: 'not_pregnant' },
  health_status: { type: DataTypes.ENUM('healthy', 'sick', 'under_treatment', 'recovered'), defaultValue: 'healthy' },
  vaccination_status: { type: DataTypes.ENUM('up_to_date', 'due', 'overdue'), defaultValue: 'up_to_date' },
  purchase_date: DataTypes.DATEONLY,
  purchase_cost: DataTypes.DECIMAL(12, 2),
  image: DataTypes.STRING(255),
  created_by: DataTypes.INTEGER,
  deleted_at: DataTypes.DATE,
}, { tableName: 'goats' });

const PoultryBatch = sequelize.define('PoultryBatch', {
  farm_id: { type: DataTypes.INTEGER, allowNull: false },
  batch_code: { type: DataTypes.STRING(20), allowNull: false },
  bird_type: { type: DataTypes.STRING(50), allowNull: false },
  breed: DataTypes.STRING(100),
  total_birds: { type: DataTypes.INTEGER, defaultValue: 0 },
  age: DataTypes.DECIMAL(5, 2),
  feed_type: DataTypes.STRING(100),
  daily_feed_consumption: DataTypes.DECIMAL(10, 2),
  mortality: { type: DataTypes.INTEGER, defaultValue: 0 },
  vaccination_status: { type: DataTypes.ENUM('up_to_date', 'due', 'overdue'), defaultValue: 'up_to_date' },
  health_status: { type: DataTypes.ENUM('healthy', 'sick', 'under_treatment'), defaultValue: 'healthy' },
  egg_production: { type: DataTypes.INTEGER, defaultValue: 0 },
  image: DataTypes.STRING(255),
  created_by: DataTypes.INTEGER,
  deleted_at: DataTypes.DATE,
}, { tableName: 'poultry_batches' });

const FeedInventory = sequelize.define('FeedInventory', {
  farm_id: { type: DataTypes.INTEGER, allowNull: false },
  feed_name: { type: DataTypes.STRING(150), allowNull: false },
  feed_type: DataTypes.STRING(100),
  animal_type: { type: DataTypes.ENUM('cow', 'goat', 'poultry', 'all'), defaultValue: 'all' },
  quantity: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  unit: { type: DataTypes.STRING(20), defaultValue: 'kg' },
  cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  supplier: DataTypes.STRING(150),
  purchase_date: DataTypes.DATEONLY,
  remaining_stock: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  low_stock_alert: { type: DataTypes.DECIMAL(12, 2), defaultValue: 10 },
  created_by: DataTypes.INTEGER,
  deleted_at: DataTypes.DATE,
}, { tableName: 'feed_inventory' });

const MilkProduction = sequelize.define('MilkProduction', {
  farm_id: { type: DataTypes.INTEGER, allowNull: false },
  cow_id: { type: DataTypes.INTEGER, allowNull: false },
  morning_milk: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
  evening_milk: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
  total_milk: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
  fat_percentage: DataTypes.DECIMAL(5, 2),
  quality: { type: DataTypes.ENUM('A', 'B', 'C'), defaultValue: 'A' },
  collection_date: { type: DataTypes.DATEONLY, allowNull: false },
  notes: DataTypes.TEXT,
  created_by: DataTypes.INTEGER,
  deleted_at: DataTypes.DATE,
}, { tableName: 'milk_production' });

const EggProduction = sequelize.define('EggProduction', {
  farm_id: { type: DataTypes.INTEGER, allowNull: false },
  poultry_batch_id: { type: DataTypes.INTEGER, allowNull: false },
  eggs_collected: { type: DataTypes.INTEGER, defaultValue: 0 },
  damaged_eggs: { type: DataTypes.INTEGER, defaultValue: 0 },
  saleable_eggs: { type: DataTypes.INTEGER, defaultValue: 0 },
  collection_date: { type: DataTypes.DATEONLY, allowNull: false },
  notes: DataTypes.TEXT,
  created_by: DataTypes.INTEGER,
  deleted_at: DataTypes.DATE,
}, { tableName: 'egg_production' });

const HealthRecord = sequelize.define('HealthRecord', {
  farm_id: { type: DataTypes.INTEGER, allowNull: false },
  animal_type: { type: DataTypes.ENUM('cow', 'goat', 'poultry'), allowNull: false },
  animal_id: { type: DataTypes.INTEGER, allowNull: false },
  disease: DataTypes.STRING(150),
  symptoms: DataTypes.TEXT,
  medicine: DataTypes.STRING(200),
  treatment: DataTypes.TEXT,
  doctor: DataTypes.STRING(100),
  treatment_date: { type: DataTypes.DATEONLY, allowNull: false },
  recovery_status: { type: DataTypes.ENUM('under_treatment', 'recovering', 'recovered', 'critical'), defaultValue: 'under_treatment' },
  notes: DataTypes.TEXT,
  created_by: DataTypes.INTEGER,
  deleted_at: DataTypes.DATE,
}, { tableName: 'health_records' });

const Vaccination = sequelize.define('Vaccination', {
  farm_id: { type: DataTypes.INTEGER, allowNull: false },
  animal_type: { type: DataTypes.ENUM('cow', 'goat', 'poultry'), allowNull: false },
  animal_id: { type: DataTypes.INTEGER, allowNull: false },
  vaccine: { type: DataTypes.STRING(150), allowNull: false },
  vaccination_date: { type: DataTypes.DATEONLY, allowNull: false },
  next_due_date: DataTypes.DATEONLY,
  doctor: DataTypes.STRING(100),
  status: { type: DataTypes.ENUM('completed', 'scheduled', 'overdue'), defaultValue: 'completed' },
  created_by: DataTypes.INTEGER,
  deleted_at: DataTypes.DATE,
}, { tableName: 'vaccinations' });

const BreedingRecord = sequelize.define('BreedingRecord', {
  farm_id: { type: DataTypes.INTEGER, allowNull: false },
  animal_type: { type: DataTypes.ENUM('cow', 'goat'), allowNull: false },
  animal_id: { type: DataTypes.INTEGER, allowNull: false },
  artificial_insemination: { type: DataTypes.BOOLEAN, defaultValue: false },
  pregnancy_status: { type: DataTypes.ENUM('not_pregnant', 'pregnant', 'delivered', 'failed'), defaultValue: 'not_pregnant' },
  expected_delivery: DataTypes.DATEONLY,
  delivery_date: DataTypes.DATEONLY,
  offspring_details: DataTypes.TEXT,
  created_by: DataTypes.INTEGER,
  deleted_at: DataTypes.DATE,
}, { tableName: 'breeding_records' });

const Customer = sequelize.define('Customer', {
  farm_id: DataTypes.INTEGER,
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: DataTypes.STRING(150),
  phone: DataTypes.STRING(20),
  address: DataTypes.TEXT,
  created_by: DataTypes.INTEGER,
  deleted_at: DataTypes.DATE,
}, { tableName: 'customers' });

const Sale = sequelize.define('Sale', {
  farm_id: { type: DataTypes.INTEGER, allowNull: false },
  customer_id: DataTypes.INTEGER,
  product_type: { type: DataTypes.ENUM('milk', 'eggs', 'cow', 'goat', 'poultry', 'manure', 'other'), allowNull: false },
  product_name: { type: DataTypes.STRING(150), allowNull: false },
  quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  payment_method: { type: DataTypes.ENUM('cash', 'bank_transfer', 'upi', 'cheque', 'credit'), defaultValue: 'cash' },
  invoice_number: DataTypes.STRING(50),
  payment_status: { type: DataTypes.ENUM('paid', 'pending', 'partial'), defaultValue: 'paid' },
  sale_date: { type: DataTypes.DATEONLY, allowNull: false },
  created_by: DataTypes.INTEGER,
  deleted_at: DataTypes.DATE,
}, { tableName: 'sales' });

const Expense = sequelize.define('Expense', {
  farm_id: { type: DataTypes.INTEGER, allowNull: false },
  category: { type: DataTypes.ENUM('feed', 'medicine', 'electricity', 'water', 'equipment', 'salaries', 'maintenance', 'transport', 'miscellaneous'), allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  expense_date: { type: DataTypes.DATEONLY, allowNull: false },
  notes: DataTypes.TEXT,
  created_by: DataTypes.INTEGER,
  deleted_at: DataTypes.DATE,
}, { tableName: 'expenses' });

const Income = sequelize.define('Income', {
  farm_id: { type: DataTypes.INTEGER, allowNull: false },
  source: { type: DataTypes.STRING(150), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  income_date: { type: DataTypes.DATEONLY, allowNull: false },
  notes: DataTypes.TEXT,
  created_by: DataTypes.INTEGER,
  deleted_at: DataTypes.DATE,
}, { tableName: 'income' });

// Associations
User.belongsTo(Farm, { foreignKey: 'assigned_farm_id', as: 'assignedFarm' });
Farm.hasMany(Cow, { foreignKey: 'farm_id', as: 'cows' });
Farm.hasMany(Goat, { foreignKey: 'farm_id', as: 'goats' });
Farm.hasMany(PoultryBatch, { foreignKey: 'farm_id', as: 'poultryBatches' });
Farm.hasMany(FeedInventory, { foreignKey: 'farm_id', as: 'feedItems' });
Farm.hasMany(MilkProduction, { foreignKey: 'farm_id', as: 'milkRecords' });
Farm.hasMany(EggProduction, { foreignKey: 'farm_id', as: 'eggRecords' });
Farm.hasMany(HealthRecord, { foreignKey: 'farm_id', as: 'healthRecords' });
Farm.hasMany(Vaccination, { foreignKey: 'farm_id', as: 'vaccinations' });
Farm.hasMany(BreedingRecord, { foreignKey: 'farm_id', as: 'breedingRecords' });
Farm.hasMany(Sale, { foreignKey: 'farm_id', as: 'sales' });
Farm.hasMany(Expense, { foreignKey: 'farm_id', as: 'expenses' });
Farm.hasMany(Income, { foreignKey: 'farm_id', as: 'incomeRecords' });
Cow.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });
Goat.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });
PoultryBatch.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });
MilkProduction.belongsTo(Cow, { foreignKey: 'cow_id', as: 'cow' });
MilkProduction.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });
EggProduction.belongsTo(PoultryBatch, { foreignKey: 'poultry_batch_id', as: 'poultryBatch' });
EggProduction.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });
Sale.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Sale.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  PasswordResetToken,
  EmailVerificationToken,
  ActivityLog,
  SystemSetting,
  Notification,
  Farm,
  Cow,
  Goat,
  PoultryBatch,
  FeedInventory,
  MilkProduction,
  EggProduction,
  HealthRecord,
  Vaccination,
  BreedingRecord,
  Customer,
  Sale,
  Expense,
  Income,
};
