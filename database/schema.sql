-- FarmFlo Database Schema
CREATE DATABASE IF NOT EXISTS farmflo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmflo;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  avatar VARCHAR(255) DEFAULT NULL,
  assigned_farm_id INT DEFAULT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  refresh_token TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  notification_prefs JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(50) NOT NULL,
  details TEXT,
  ip VARCHAR(45) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_activity_created (created_at)
);

CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id, is_read)
);

-- Farms
CREATE TABLE IF NOT EXISTS farms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  address TEXT,
  contact VARCHAR(20),
  farm_type ENUM('dairy', 'goat', 'poultry', 'mixed') NOT NULL DEFAULT 'mixed',
  capacity INT DEFAULT 0,
  image VARCHAR(255) DEFAULT NULL,
  created_by INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

ALTER TABLE users ADD FOREIGN KEY (assigned_farm_id) REFERENCES farms(id) ON DELETE SET NULL;

-- Cows
CREATE TABLE IF NOT EXISTS cows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_id INT NOT NULL,
  cow_code VARCHAR(20) NOT NULL,
  rfid_qr VARCHAR(50) DEFAULT NULL,
  tag_number VARCHAR(50) DEFAULT NULL,
  breed VARCHAR(100) DEFAULT NULL,
  age DECIMAL(5,2) DEFAULT NULL,
  weight DECIMAL(8,2) DEFAULT NULL,
  gender ENUM('male', 'female') DEFAULT 'female',
  date_of_birth DATE DEFAULT NULL,
  purchase_date DATE DEFAULT NULL,
  purchase_cost DECIMAL(12,2) DEFAULT NULL,
  lactation_status ENUM('lactating', 'dry', 'heifer') DEFAULT 'heifer',
  pregnancy_status ENUM('not_pregnant', 'pregnant', 'delivered') DEFAULT 'not_pregnant',
  milk_yield DECIMAL(8,2) DEFAULT 0,
  health_status ENUM('healthy', 'sick', 'under_treatment', 'recovered') DEFAULT 'healthy',
  vaccination_status ENUM('up_to_date', 'due', 'overdue') DEFAULT 'up_to_date',
  image VARCHAR(255) DEFAULT NULL,
  created_by INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_cows_farm (farm_id)
);

-- Goats
CREATE TABLE IF NOT EXISTS goats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_id INT NOT NULL,
  goat_code VARCHAR(20) NOT NULL,
  rfid_qr VARCHAR(50) DEFAULT NULL,
  breed VARCHAR(100) DEFAULT NULL,
  age DECIMAL(5,2) DEFAULT NULL,
  weight DECIMAL(8,2) DEFAULT NULL,
  gender ENUM('male', 'female') DEFAULT 'female',
  pregnancy_status ENUM('not_pregnant', 'pregnant', 'delivered') DEFAULT 'not_pregnant',
  health_status ENUM('healthy', 'sick', 'under_treatment', 'recovered') DEFAULT 'healthy',
  vaccination_status ENUM('up_to_date', 'due', 'overdue') DEFAULT 'up_to_date',
  purchase_date DATE DEFAULT NULL,
  purchase_cost DECIMAL(12,2) DEFAULT NULL,
  image VARCHAR(255) DEFAULT NULL,
  created_by INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_goats_farm (farm_id)
);

-- Poultry
CREATE TABLE IF NOT EXISTS poultry_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_id INT NOT NULL,
  batch_code VARCHAR(20) NOT NULL,
  bird_type VARCHAR(50) NOT NULL,
  breed VARCHAR(100) DEFAULT NULL,
  total_birds INT NOT NULL DEFAULT 0,
  age DECIMAL(5,2) DEFAULT NULL,
  feed_type VARCHAR(100) DEFAULT NULL,
  daily_feed_consumption DECIMAL(10,2) DEFAULT NULL,
  mortality INT DEFAULT 0,
  vaccination_status ENUM('up_to_date', 'due', 'overdue') DEFAULT 'up_to_date',
  health_status ENUM('healthy', 'sick', 'under_treatment') DEFAULT 'healthy',
  egg_production INT DEFAULT 0,
  image VARCHAR(255) DEFAULT NULL,
  created_by INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_poultry_farm (farm_id)
);

-- Feed Inventory
CREATE TABLE IF NOT EXISTS feed_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_id INT NOT NULL,
  feed_name VARCHAR(150) NOT NULL,
  feed_type VARCHAR(100) DEFAULT NULL,
  animal_type ENUM('cow', 'goat', 'poultry', 'all') DEFAULT 'all',
  quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'kg',
  cost DECIMAL(12,2) DEFAULT 0,
  supplier VARCHAR(150) DEFAULT NULL,
  purchase_date DATE DEFAULT NULL,
  remaining_stock DECIMAL(12,2) NOT NULL DEFAULT 0,
  low_stock_alert DECIMAL(12,2) DEFAULT 10,
  created_by INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Milk Production
CREATE TABLE IF NOT EXISTS milk_production (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_id INT NOT NULL,
  cow_id INT NOT NULL,
  morning_milk DECIMAL(8,2) DEFAULT 0,
  evening_milk DECIMAL(8,2) DEFAULT 0,
  total_milk DECIMAL(8,2) DEFAULT 0,
  fat_percentage DECIMAL(5,2) DEFAULT NULL,
  quality ENUM('A', 'B', 'C') DEFAULT 'A',
  collection_date DATE NOT NULL,
  notes TEXT,
  created_by INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_milk_date (collection_date)
);

-- Egg Production
CREATE TABLE IF NOT EXISTS egg_production (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_id INT NOT NULL,
  poultry_batch_id INT NOT NULL,
  eggs_collected INT NOT NULL DEFAULT 0,
  damaged_eggs INT DEFAULT 0,
  saleable_eggs INT DEFAULT 0,
  collection_date DATE NOT NULL,
  notes TEXT,
  created_by INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (poultry_batch_id) REFERENCES poultry_batches(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_egg_date (collection_date)
);

-- Health Records
CREATE TABLE IF NOT EXISTS health_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_id INT NOT NULL,
  animal_type ENUM('cow', 'goat', 'poultry') NOT NULL,
  animal_id INT NOT NULL,
  disease VARCHAR(150) DEFAULT NULL,
  symptoms TEXT,
  medicine VARCHAR(200) DEFAULT NULL,
  treatment TEXT,
  doctor VARCHAR(100) DEFAULT NULL,
  treatment_date DATE NOT NULL,
  recovery_status ENUM('under_treatment', 'recovering', 'recovered', 'critical') DEFAULT 'under_treatment',
  notes TEXT,
  created_by INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Vaccinations
CREATE TABLE IF NOT EXISTS vaccinations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_id INT NOT NULL,
  animal_type ENUM('cow', 'goat', 'poultry') NOT NULL,
  animal_id INT NOT NULL,
  vaccine VARCHAR(150) NOT NULL,
  vaccination_date DATE NOT NULL,
  next_due_date DATE DEFAULT NULL,
  doctor VARCHAR(100) DEFAULT NULL,
  status ENUM('completed', 'scheduled', 'overdue') DEFAULT 'completed',
  created_by INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_vacc_due (next_due_date)
);

-- Breeding Records
CREATE TABLE IF NOT EXISTS breeding_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_id INT NOT NULL,
  animal_type ENUM('cow', 'goat') NOT NULL,
  animal_id INT NOT NULL,
  artificial_insemination BOOLEAN DEFAULT FALSE,
  pregnancy_status ENUM('not_pregnant', 'pregnant', 'delivered', 'failed') DEFAULT 'not_pregnant',
  expected_delivery DATE DEFAULT NULL,
  delivery_date DATE DEFAULT NULL,
  offspring_details TEXT,
  created_by INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_id INT DEFAULT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  address TEXT,
  created_by INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Sales
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_id INT NOT NULL,
  customer_id INT DEFAULT NULL,
  product_type ENUM('milk', 'eggs', 'cow', 'goat', 'poultry', 'manure', 'other') NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  payment_method ENUM('cash', 'bank_transfer', 'upi', 'cheque', 'credit') DEFAULT 'cash',
  invoice_number VARCHAR(50) DEFAULT NULL,
  payment_status ENUM('paid', 'pending', 'partial') DEFAULT 'paid',
  sale_date DATE NOT NULL,
  created_by INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_sales_date (sale_date)
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_id INT NOT NULL,
  category ENUM('feed', 'medicine', 'electricity', 'water', 'equipment', 'salaries', 'maintenance', 'transport', 'miscellaneous') NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  notes TEXT,
  created_by INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_expense_date (expense_date)
);

-- Income
CREATE TABLE IF NOT EXISTS income (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_id INT NOT NULL,
  source VARCHAR(150) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  income_date DATE NOT NULL,
  notes TEXT,
  created_by INT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_income_date (income_date)
);

-- Seed Users (Admin@123 / User@123)
INSERT INTO users (name, email, password_hash, role, email_verified) VALUES
('Farm Admin', 'admin@farmflo.com', '$2b$12$o8UMj8SO/yuyYnQnvQ1xa.tka4oTvmBHAs2uOylPupdnnLpDvApKq', 'admin', TRUE),
('Farm User', 'user@farmflo.com', '$2b$12$maU1Mh.SrsWGWQ5/gmjxeeAs23F8R5XkotID6T7qyrKWvTZKGC0AS', 'user', TRUE);

INSERT INTO system_settings (setting_key, setting_value) VALUES
('farm_info', '{"name":"FarmFlo Demo Farm","address":"123 Green Valley Road","contact":"+91-9876543210"}'),
('notification_settings', '{"vaccination":true,"lowStock":true,"sickAnimals":true,"pregnancy":true,"milkReminder":true,"eggReminder":true}');

-- Sample farm data
INSERT INTO farms (farm_code, name, owner_name, address, contact, farm_type, capacity, created_by) VALUES
('FM001', 'Green Valley Dairy', 'John Farmer', '123 Green Valley Road, Rural District', '+91-9876543210', 'mixed', 500, 1),
('FM002', 'Sunrise Poultry', 'Jane Farmer', '456 Sunrise Lane, Rural District', '+91-9876543211', 'poultry', 2000, 1);

UPDATE users SET assigned_farm_id = 1 WHERE id = 2;

INSERT INTO cows (farm_id, cow_code, tag_number, breed, age, weight, gender, lactation_status, pregnancy_status, milk_yield, health_status, created_by) VALUES
(1, 'CW001', 'TAG-001', 'Holstein', 4.5, 550, 'female', 'lactating', 'not_pregnant', 25.5, 'healthy', 1),
(1, 'CW002', 'TAG-002', 'Jersey', 3.2, 420, 'female', 'lactating', 'pregnant', 18.0, 'healthy', 1);

INSERT INTO goats (farm_id, goat_code, breed, age, weight, gender, health_status, created_by) VALUES
(1, 'GT001', 'Boer', 2.5, 45, 'female', 'healthy', 1),
(1, 'GT002', 'Nubian', 1.8, 38, 'male', 'healthy', 1);

INSERT INTO poultry_batches (farm_id, batch_code, bird_type, breed, total_birds, age, feed_type, daily_feed_consumption, egg_production, created_by) VALUES
(2, 'PL001', 'Layer', 'Rhode Island Red', 500, 6, 'Layer Feed', 50, 420, 1);

INSERT INTO feed_inventory (farm_id, feed_name, feed_type, animal_type, quantity, unit, cost, supplier, purchase_date, remaining_stock, low_stock_alert, created_by) VALUES
(1, 'Dairy Feed Premium', 'Concentrate', 'cow', 500, 'kg', 15000, 'AgriSupply Co', CURDATE(), 350, 50, 1),
(2, 'Layer Feed', 'Pellet', 'poultry', 200, 'kg', 8000, 'PoultryFeed Ltd', CURDATE(), 120, 30, 1);

INSERT INTO milk_production (farm_id, cow_id, morning_milk, evening_milk, total_milk, fat_percentage, quality, collection_date, created_by) VALUES
(1, 1, 12.5, 13.0, 25.5, 4.2, 'A', CURDATE(), 1),
(1, 2, 9.0, 9.0, 18.0, 4.5, 'A', CURDATE(), 1);

INSERT INTO egg_production (farm_id, poultry_batch_id, eggs_collected, damaged_eggs, saleable_eggs, collection_date, created_by) VALUES
(2, 1, 430, 10, 420, CURDATE(), 1);

INSERT INTO customers (farm_id, name, phone, address, created_by) VALUES
(1, 'Local Dairy Co-op', '+91-9123456789', 'Market Road, Town Center', 1),
(2, 'Fresh Eggs Mart', '+91-9234567890', 'High Street, Town Center', 1);

INSERT INTO sales (farm_id, customer_id, product_type, product_name, quantity, price, total, payment_method, invoice_number, payment_status, sale_date, created_by) VALUES
(1, 1, 'milk', 'Fresh Milk', 100, 55, 5500, 'bank_transfer', 'INV-001', 'paid', CURDATE(), 1),
(2, 2, 'eggs', 'Farm Fresh Eggs', 300, 8, 2400, 'cash', 'INV-002', 'paid', CURDATE(), 1);

INSERT INTO expenses (farm_id, category, description, amount, expense_date, created_by) VALUES
(1, 'feed', 'Monthly feed purchase', 15000, CURDATE(), 1),
(1, 'electricity', 'Farm electricity bill', 3500, CURDATE(), 1);

INSERT INTO income (farm_id, source, amount, income_date, created_by) VALUES
(1, 'Milk Sales', 5500, CURDATE(), 1),
(2, 'Egg Sales', 2400, CURDATE(), 1);
