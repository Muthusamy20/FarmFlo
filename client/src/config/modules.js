export const farmTypes = [
  { value: 'dairy', label: 'Dairy' }, { value: 'goat', label: 'Goat' },
  { value: 'poultry', label: 'Poultry' }, { value: 'mixed', label: 'Mixed' },
];

export const genderOptions = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }];
export const healthOptions = [
  { value: 'healthy', label: 'Healthy' }, { value: 'sick', label: 'Sick' },
  { value: 'under_treatment', label: 'Under Treatment' }, { value: 'recovered', label: 'Recovered' },
];
export const pregnancyOptions = [
  { value: 'not_pregnant', label: 'Not Pregnant' }, { value: 'pregnant', label: 'Pregnant' }, { value: 'delivered', label: 'Delivered' },
];
export const lactationOptions = [
  { value: 'lactating', label: 'Lactating' }, { value: 'dry', label: 'Dry' }, { value: 'heifer', label: 'Heifer' },
];
export const vaccOptions = [
  { value: 'up_to_date', label: 'Up to Date' }, { value: 'due', label: 'Due' }, { value: 'overdue', label: 'Overdue' },
];
export const qualityOptions = [{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }];
export const animalTypes = [{ value: 'cow', label: 'Cow' }, { value: 'goat', label: 'Goat' }, { value: 'poultry', label: 'Poultry' }];
export const productTypes = [
  { value: 'milk', label: 'Milk' }, { value: 'eggs', label: 'Eggs' }, { value: 'cow', label: 'Cow' },
  { value: 'goat', label: 'Goat' }, { value: 'poultry', label: 'Poultry' }, { value: 'manure', label: 'Manure' }, { value: 'other', label: 'Other' },
];
export const paymentMethods = [
  { value: 'cash', label: 'Cash' }, { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' }, { value: 'cheque', label: 'Cheque' }, { value: 'credit', label: 'Credit' },
];
export const paymentStatus = [{ value: 'paid', label: 'Paid' }, { value: 'pending', label: 'Pending' }, { value: 'partial', label: 'Partial' }];
export const expenseCategories = [
  { value: 'feed', label: 'Feed' }, { value: 'medicine', label: 'Medicine' }, { value: 'electricity', label: 'Electricity' },
  { value: 'water', label: 'Water' }, { value: 'equipment', label: 'Equipment' }, { value: 'salaries', label: 'Salaries' },
  { value: 'maintenance', label: 'Maintenance' }, { value: 'transport', label: 'Transport' }, { value: 'miscellaneous', label: 'Miscellaneous' },
];
export const recoveryOptions = [
  { value: 'under_treatment', label: 'Under Treatment' }, { value: 'recovering', label: 'Recovering' },
  { value: 'recovered', label: 'Recovered' }, { value: 'critical', label: 'Critical' },
];
export const vaccStatus = [{ value: 'completed', label: 'Completed' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'overdue', label: 'Overdue' }];
export const breedingStatus = [
  { value: 'not_pregnant', label: 'Not Pregnant' }, { value: 'pregnant', label: 'Pregnant' },
  { value: 'delivered', label: 'Delivered' }, { value: 'failed', label: 'Failed' },
];
export const feedAnimalTypes = [
  { value: 'cow', label: 'Cow' }, { value: 'goat', label: 'Goat' }, { value: 'poultry', label: 'Poultry' }, { value: 'all', label: 'All' },
];

export const moduleConfigs = {
  farms: {
    title: 'Farm Management', subtitle: 'Manage multiple farm operations', resource: 'farms',
    columns: [
      { key: 'farm_code', label: 'Farm ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'owner_name', label: 'Owner', sortable: true },
      { key: 'farm_type', label: 'Type' },
      { key: 'capacity', label: 'Capacity' },
      { key: 'contact', label: 'Contact' },
    ],
    fields: [
      { name: 'farm_code', label: 'Farm ID', required: true },
      { name: 'name', label: 'Farm Name', required: true },
      { name: 'owner_name', label: 'Owner Name', required: true },
      { name: 'address', label: 'Address', type: 'textarea', col: 12 },
      { name: 'contact', label: 'Contact' },
      { name: 'farm_type', label: 'Farm Type', type: 'select', options: farmTypes },
      { name: 'capacity', label: 'Capacity', type: 'number' },
      { name: 'image', label: 'Farm Image', type: 'file', col: 12 },
    ],
    imageField: 'image',
  },
  cows: {
    title: 'Cow Management', subtitle: 'Track dairy cattle records', resource: 'cows',
    columns: [
      { key: 'cow_code', label: 'Cow ID', sortable: true },
      { key: 'tag_number', label: 'Tag' },
      { key: 'breed', label: 'Breed' },
      { key: 'gender', label: 'Gender' },
      { key: 'lactation_status', label: 'Lactation' },
      { key: 'milk_yield', label: 'Milk Yield' },
      { key: 'health_status', label: 'Health' },
    ],
    fields: [
      { name: 'farm_id', label: 'Farm ID', type: 'number', required: true },
      { name: 'cow_code', label: 'Cow ID', required: true },
      { name: 'rfid_qr', label: 'RFID / QR Code' },
      { name: 'tag_number', label: 'Tag Number' },
      { name: 'breed', label: 'Breed' },
      { name: 'age', label: 'Age', type: 'number', step: '0.1' },
      { name: 'weight', label: 'Weight (kg)', type: 'number' },
      { name: 'gender', label: 'Gender', type: 'select', options: genderOptions },
      { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
      { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
      { name: 'purchase_cost', label: 'Purchase Cost', type: 'number' },
      { name: 'lactation_status', label: 'Lactation Status', type: 'select', options: lactationOptions },
      { name: 'pregnancy_status', label: 'Pregnancy Status', type: 'select', options: pregnancyOptions },
      { name: 'milk_yield', label: 'Milk Yield', type: 'number' },
      { name: 'health_status', label: 'Health Status', type: 'select', options: healthOptions },
      { name: 'vaccination_status', label: 'Vaccination', type: 'select', options: vaccOptions },
      { name: 'image', label: 'Image', type: 'file', col: 12 },
    ],
    imageField: 'image',
  },
  goats: {
    title: 'Goat Management', subtitle: 'Manage goat farm records', resource: 'goats',
    columns: [
      { key: 'goat_code', label: 'Goat ID', sortable: true },
      { key: 'breed', label: 'Breed' },
      { key: 'gender', label: 'Gender' },
      { key: 'pregnancy_status', label: 'Pregnancy' },
      { key: 'health_status', label: 'Health' },
    ],
    fields: [
      { name: 'farm_id', label: 'Farm ID', type: 'number', required: true },
      { name: 'goat_code', label: 'Goat ID', required: true },
      { name: 'rfid_qr', label: 'RFID / QR Code' },
      { name: 'breed', label: 'Breed' },
      { name: 'age', label: 'Age', type: 'number', step: '0.1' },
      { name: 'weight', label: 'Weight (kg)', type: 'number' },
      { name: 'gender', label: 'Gender', type: 'select', options: genderOptions },
      { name: 'pregnancy_status', label: 'Pregnancy', type: 'select', options: pregnancyOptions },
      { name: 'health_status', label: 'Health', type: 'select', options: healthOptions },
      { name: 'vaccination_status', label: 'Vaccination', type: 'select', options: vaccOptions },
      { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
      { name: 'purchase_cost', label: 'Purchase Cost', type: 'number' },
      { name: 'image', label: 'Image', type: 'file', col: 12 },
    ],
    imageField: 'image',
  },
  poultry: {
    title: 'Poultry Management', subtitle: 'Manage poultry batches', resource: 'poultry',
    columns: [
      { key: 'batch_code', label: 'Batch ID', sortable: true },
      { key: 'bird_type', label: 'Bird Type' },
      { key: 'breed', label: 'Breed' },
      { key: 'total_birds', label: 'Total Birds' },
      { key: 'egg_production', label: 'Egg Production' },
      { key: 'health_status', label: 'Health' },
    ],
    fields: [
      { name: 'farm_id', label: 'Farm ID', type: 'number', required: true },
      { name: 'batch_code', label: 'Batch ID', required: true },
      { name: 'bird_type', label: 'Bird Type', required: true },
      { name: 'breed', label: 'Breed' },
      { name: 'total_birds', label: 'Total Birds', type: 'number' },
      { name: 'age', label: 'Age', type: 'number', step: '0.1' },
      { name: 'feed_type', label: 'Feed Type' },
      { name: 'daily_feed_consumption', label: 'Daily Feed (kg)', type: 'number' },
      { name: 'mortality', label: 'Mortality', type: 'number' },
      { name: 'vaccination_status', label: 'Vaccination', type: 'select', options: vaccOptions },
      { name: 'health_status', label: 'Health', type: 'select', options: healthOptions },
      { name: 'egg_production', label: 'Egg Production', type: 'number' },
      { name: 'image', label: 'Batch Image', type: 'file', col: 12 },
    ],
    imageField: 'image',
  },
  feed: {
    title: 'Feed Management', subtitle: 'Track feed inventory and stock levels', resource: 'feed',
    columns: [
      { key: 'feed_name', label: 'Feed Name', sortable: true },
      { key: 'feed_type', label: 'Type' },
      { key: 'animal_type', label: 'Animal' },
      { key: 'remaining_stock', label: 'Stock' },
      { key: 'unit', label: 'Unit' },
      { key: 'supplier', label: 'Supplier' },
    ],
    fields: [
      { name: 'farm_id', label: 'Farm ID', type: 'number', required: true },
      { name: 'feed_name', label: 'Feed Name', required: true },
      { name: 'feed_type', label: 'Feed Type' },
      { name: 'animal_type', label: 'Animal Type', type: 'select', options: feedAnimalTypes },
      { name: 'quantity', label: 'Quantity', type: 'number' },
      { name: 'unit', label: 'Unit', defaultValue: 'kg' },
      { name: 'cost', label: 'Cost', type: 'number' },
      { name: 'supplier', label: 'Supplier' },
      { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
      { name: 'remaining_stock', label: 'Remaining Stock', type: 'number' },
      { name: 'low_stock_alert', label: 'Low Stock Alert', type: 'number', defaultValue: 10 },
    ],
  },
  milk: {
    title: 'Milk Production', subtitle: 'Record daily milk collection', resource: 'milk',
    columns: [
      { key: 'collection_date', label: 'Date', sortable: true },
      { key: 'cow_id', label: 'Cow ID' },
      { key: 'morning_milk', label: 'Morning' },
      { key: 'evening_milk', label: 'Evening' },
      { key: 'total_milk', label: 'Total' },
      { key: 'fat_percentage', label: 'Fat %' },
      { key: 'quality', label: 'Quality' },
    ],
    fields: [
      { name: 'farm_id', label: 'Farm ID', type: 'number', required: true },
      { name: 'cow_id', label: 'Cow ID', type: 'number', required: true },
      { name: 'morning_milk', label: 'Morning Milk (L)', type: 'number' },
      { name: 'evening_milk', label: 'Evening Milk (L)', type: 'number' },
      { name: 'fat_percentage', label: 'Fat %', type: 'number' },
      { name: 'quality', label: 'Quality', type: 'select', options: qualityOptions },
      { name: 'collection_date', label: 'Collection Date', type: 'date', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea', col: 12 },
    ],
  },
  eggs: {
    title: 'Egg Production', subtitle: 'Record daily egg collection', resource: 'eggs',
    columns: [
      { key: 'collection_date', label: 'Date', sortable: true },
      { key: 'poultry_batch_id', label: 'Batch ID' },
      { key: 'eggs_collected', label: 'Collected' },
      { key: 'damaged_eggs', label: 'Damaged' },
      { key: 'saleable_eggs', label: 'Saleable' },
    ],
    fields: [
      { name: 'farm_id', label: 'Farm ID', type: 'number', required: true },
      { name: 'poultry_batch_id', label: 'Poultry Batch ID', type: 'number', required: true },
      { name: 'eggs_collected', label: 'Eggs Collected', type: 'number' },
      { name: 'damaged_eggs', label: 'Damaged Eggs', type: 'number' },
      { name: 'collection_date', label: 'Date', type: 'date', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea', col: 12 },
    ],
  },
  health: {
    title: 'Health Management', subtitle: 'Maintain medical records', resource: 'health',
    columns: [
      { key: 'treatment_date', label: 'Date', sortable: true },
      { key: 'animal_type', label: 'Animal' },
      { key: 'animal_id', label: 'Animal ID' },
      { key: 'disease', label: 'Disease' },
      { key: 'recovery_status', label: 'Recovery' },
    ],
    fields: [
      { name: 'farm_id', label: 'Farm ID', type: 'number', required: true },
      { name: 'animal_type', label: 'Animal Type', type: 'select', options: animalTypes, required: true },
      { name: 'animal_id', label: 'Animal ID', type: 'number', required: true },
      { name: 'disease', label: 'Disease' },
      { name: 'symptoms', label: 'Symptoms', type: 'textarea', col: 12 },
      { name: 'medicine', label: 'Medicine' },
      { name: 'treatment', label: 'Treatment', type: 'textarea', col: 12 },
      { name: 'doctor', label: 'Doctor' },
      { name: 'treatment_date', label: 'Treatment Date', type: 'date', required: true },
      { name: 'recovery_status', label: 'Recovery Status', type: 'select', options: recoveryOptions },
      { name: 'notes', label: 'Notes', type: 'textarea', col: 12 },
    ],
  },
  vaccinations: {
    title: 'Vaccination', subtitle: 'Track vaccination schedules', resource: 'vaccinations',
    columns: [
      { key: 'vaccination_date', label: 'Date', sortable: true },
      { key: 'animal_type', label: 'Animal' },
      { key: 'vaccine', label: 'Vaccine' },
      { key: 'next_due_date', label: 'Next Due' },
      { key: 'status', label: 'Status' },
    ],
    fields: [
      { name: 'farm_id', label: 'Farm ID', type: 'number', required: true },
      { name: 'animal_type', label: 'Animal Type', type: 'select', options: animalTypes, required: true },
      { name: 'animal_id', label: 'Animal ID', type: 'number', required: true },
      { name: 'vaccine', label: 'Vaccine', required: true },
      { name: 'vaccination_date', label: 'Vaccination Date', type: 'date', required: true },
      { name: 'next_due_date', label: 'Next Due Date', type: 'date' },
      { name: 'doctor', label: 'Doctor' },
      { name: 'status', label: 'Status', type: 'select', options: vaccStatus },
    ],
  },
  breeding: {
    title: 'Breeding Management', subtitle: 'Track breeding and delivery records', resource: 'breeding',
    columns: [
      { key: 'animal_type', label: 'Animal' },
      { key: 'animal_id', label: 'Animal ID' },
      { key: 'pregnancy_status', label: 'Pregnancy' },
      { key: 'expected_delivery', label: 'Expected Delivery' },
      { key: 'delivery_date', label: 'Delivery Date' },
    ],
    fields: [
      { name: 'farm_id', label: 'Farm ID', type: 'number', required: true },
      { name: 'animal_type', label: 'Animal Type', type: 'select', options: [{ value: 'cow', label: 'Cow' }, { value: 'goat', label: 'Goat' }], required: true },
      { name: 'animal_id', label: 'Animal ID', type: 'number', required: true },
      { name: 'artificial_insemination', label: 'Artificial Insemination', type: 'checkbox' },
      { name: 'pregnancy_status', label: 'Pregnancy Status', type: 'select', options: breedingStatus },
      { name: 'expected_delivery', label: 'Expected Delivery', type: 'date' },
      { name: 'delivery_date', label: 'Delivery Date', type: 'date' },
      { name: 'offspring_details', label: 'Offspring Details', type: 'textarea', col: 12 },
    ],
  },
  sales: {
    title: 'Sales Management', subtitle: 'Manage farm product sales', resource: 'sales',
    columns: [
      { key: 'sale_date', label: 'Date', sortable: true },
      { key: 'product_name', label: 'Product' },
      { key: 'quantity', label: 'Qty' },
      { key: 'total', label: 'Total' },
      { key: 'payment_status', label: 'Status' },
    ],
    fields: [
      { name: 'farm_id', label: 'Farm ID', type: 'number', required: true },
      { name: 'customer_id', label: 'Customer ID', type: 'number' },
      { name: 'product_type', label: 'Product Type', type: 'select', options: productTypes, required: true },
      { name: 'product_name', label: 'Product Name', required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'payment_method', label: 'Payment Method', type: 'select', options: paymentMethods },
      { name: 'invoice_number', label: 'Invoice Number' },
      { name: 'payment_status', label: 'Payment Status', type: 'select', options: paymentStatus },
      { name: 'sale_date', label: 'Sale Date', type: 'date', required: true },
    ],
  },
  customers: {
    title: 'Customer Management', subtitle: 'Manage customer records', resource: 'customers',
    columns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
    ],
    fields: [
      { name: 'farm_id', label: 'Farm ID', type: 'number' },
      { name: 'name', label: 'Name', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone' },
      { name: 'address', label: 'Address', type: 'textarea', col: 12 },
    ],
  },
  expenses: {
    title: 'Expense Management', subtitle: 'Track farm expenses', resource: 'expenses',
    columns: [
      { key: 'expense_date', label: 'Date', sortable: true },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
      { key: 'amount', label: 'Amount' },
    ],
    fields: [
      { name: 'farm_id', label: 'Farm ID', type: 'number', required: true },
      { name: 'category', label: 'Category', type: 'select', options: expenseCategories, required: true },
      { name: 'description', label: 'Description', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'expense_date', label: 'Date', type: 'date', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea', col: 12 },
    ],
  },
  income: {
    title: 'Income Management', subtitle: 'Track farm income', resource: 'income',
    columns: [
      { key: 'income_date', label: 'Date', sortable: true },
      { key: 'source', label: 'Source' },
      { key: 'amount', label: 'Amount' },
    ],
    fields: [
      { name: 'farm_id', label: 'Farm ID', type: 'number', required: true },
      { name: 'source', label: 'Source', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'income_date', label: 'Date', type: 'date', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea', col: 12 },
    ],
  },
};
