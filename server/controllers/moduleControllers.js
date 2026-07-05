const createCrudController = require('./crudFactory');
const {
  Farm, Cow, Goat, PoultryBatch, FeedInventory, MilkProduction, EggProduction,
  HealthRecord, Vaccination, BreedingRecord, Customer, Sale, Expense, Income,
} = require('../models');

exports.farmController = createCrudController(Farm, {
  moduleName: 'farm',
  searchFields: ['name', 'farm_code', 'owner_name'],
  farmScoped: false,
  imageField: 'image',
});

exports.cowController = createCrudController(Cow, {
  moduleName: 'cow',
  searchFields: ['cow_code', 'tag_number', 'breed'],
  include: [{ association: 'farm', attributes: ['id', 'name'] }],
});

exports.goatController = createCrudController(Goat, {
  moduleName: 'goat',
  searchFields: ['goat_code', 'breed'],
  include: [{ association: 'farm', attributes: ['id', 'name'] }],
});

exports.poultryController = createCrudController(PoultryBatch, {
  moduleName: 'poultry',
  searchFields: ['batch_code', 'bird_type', 'breed'],
  include: [{ association: 'farm', attributes: ['id', 'name'] }],
});

exports.feedController = createCrudController(FeedInventory, {
  moduleName: 'feed',
  searchFields: ['feed_name', 'feed_type', 'supplier'],
});

exports.milkController = createCrudController(MilkProduction, {
  moduleName: 'milk',
  searchFields: ['notes'],
  include: [
    { association: 'cow', attributes: ['id', 'cow_code', 'breed'] },
    { association: 'farm', attributes: ['id', 'name'] },
  ],
  beforeCreate: async (data) => {
    data.total_milk =
      (parseFloat(data.morning_milk) || 0) +
      (parseFloat(data.evening_milk) || 0);
  },
  beforeUpdate: async (data) => {
    if (
      data.morning_milk !== undefined ||
      data.evening_milk !== undefined
    ) {
      data.total_milk =
        (parseFloat(data.morning_milk) || 0) +
        (parseFloat(data.evening_milk) || 0);
    }
  },
});

exports.eggController = createCrudController(EggProduction, {
  moduleName: 'egg',
  searchFields: ['notes'],
  include: [
    { association: 'poultryBatch', attributes: ['id', 'batch_code', 'bird_type'] },
    { association: 'farm', attributes: ['id', 'name'] },
  ],
  beforeCreate: async (data) => {
    const collected = parseInt(data.eggs_collected) || 0;
    const damaged = parseInt(data.damaged_eggs) || 0;
    data.saleable_eggs = collected - damaged;
  },
});

exports.healthController = createCrudController(HealthRecord, {
  moduleName: 'health',
  searchFields: ['disease', 'medicine', 'doctor'],
});

exports.vaccinationController = createCrudController(Vaccination, {
  moduleName: 'vaccination',
  searchFields: ['vaccine', 'doctor'],
});

exports.breedingController = createCrudController(BreedingRecord, {
  moduleName: 'breeding',
  searchFields: ['offspring_details'],
});

exports.customerController = createCrudController(Customer, {
  moduleName: 'customer',
  searchFields: ['name', 'email', 'phone'],
});

exports.saleController = createCrudController(Sale, {
  moduleName: 'sale',
  searchFields: ['product_name', 'invoice_number'],
  include: [
    { association: 'customer', attributes: ['id', 'name'] },
    { association: 'farm', attributes: ['id', 'name'] },
  ],
  beforeCreate: async (data) => {
    data.total = (parseFloat(data.quantity) || 0) * (parseFloat(data.price) || 0);
  },
});

exports.expenseController = createCrudController(Expense, {
  moduleName: 'expense',
  searchFields: ['description', 'category'],
});

exports.incomeController = createCrudController(Income, {
  moduleName: 'income',
  searchFields: ['source'],
});