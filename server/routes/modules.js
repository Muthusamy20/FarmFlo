const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const upload = require('../config/upload');
const c = require('../controllers/moduleControllers');

const router = express.Router();
router.use(authenticate);

const crudRoutes = (path, controller, uploadField = null) => {
  const r = express.Router();
  r.get('/', controller.getAll);
  r.get('/:id', controller.getById);
  if (uploadField) {
    r.post('/', upload.single(uploadField), controller.create);
    r.put('/:id', upload.single(uploadField), controller.update);
  } else {
    r.post('/', controller.create);
    r.put('/:id', controller.update);
  }
  r.delete('/:id', controller.remove);
  return r;
};

router.use('/farms', crudRoutes('farms', c.farmController, 'image'));
router.use('/cows', crudRoutes('cows', c.cowController, 'image'));
router.use('/goats', crudRoutes('goats', c.goatController, 'image'));
router.use('/poultry', crudRoutes('poultry', c.poultryController, 'image'));
router.use('/feed', crudRoutes('feed', c.feedController));
router.use('/milk', crudRoutes('milk', c.milkController));
router.use('/eggs', crudRoutes('eggs', c.eggController));
router.use('/health', crudRoutes('health', c.healthController));
router.use('/vaccinations', crudRoutes('vaccinations', c.vaccinationController));
router.use('/breeding', crudRoutes('breeding', c.breedingController));
router.use('/customers', crudRoutes('customers', c.customerController));
router.use('/sales', crudRoutes('sales', c.saleController));
router.use('/expenses', crudRoutes('expenses', c.expenseController));
router.use('/income', crudRoutes('income', c.incomeController));

module.exports = router;
