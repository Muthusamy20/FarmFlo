const { Op } = require('sequelize');
const {
  Farm, Cow, Goat, PoultryBatch, Customer,
} = require('../models');

exports.globalSearch = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    if (q.length < 2) return res.json({ results: [] });

    const like = { [Op.like]: `%${q}%` };
    const notDeleted = { deleted_at: null };
    const limit = 5;

    const [farms, cows, goats, poultry, customers] = await Promise.all([
      Farm.findAll({ where: { ...notDeleted, [Op.or]: [{ name: like }, { farm_code: like }] }, limit, attributes: ['id', 'name', 'farm_code'] }),
      Cow.findAll({ where: { ...notDeleted, [Op.or]: [{ cow_code: like }, { tag_number: like }, { breed: like }] }, limit, attributes: ['id', 'cow_code', 'breed', 'farm_id'] }),
      Goat.findAll({ where: { ...notDeleted, [Op.or]: [{ goat_code: like }, { breed: like }] }, limit, attributes: ['id', 'goat_code', 'breed', 'farm_id'] }),
      PoultryBatch.findAll({ where: { ...notDeleted, [Op.or]: [{ batch_code: like }, { bird_type: like }] }, limit, attributes: ['id', 'batch_code', 'bird_type', 'farm_id'] }),
      Customer.findAll({ where: { ...notDeleted, [Op.or]: [{ name: like }, { phone: like }] }, limit, attributes: ['id', 'name', 'phone'] }),
    ]);

    const results = [
      ...farms.map((f) => ({ type: 'farm', id: f.id, label: f.name, sub: f.farm_code, link: `/farms` })),
      ...cows.map((c) => ({ type: 'cow', id: c.id, label: c.cow_code, sub: c.breed, link: `/cows` })),
      ...goats.map((g) => ({ type: 'goat', id: g.id, label: g.goat_code, sub: g.breed, link: `/goats` })),
      ...poultry.map((p) => ({ type: 'poultry', id: p.id, label: p.batch_code, sub: p.bird_type, link: `/poultry` })),
      ...customers.map((c) => ({ type: 'customer', id: c.id, label: c.name, sub: c.phone, link: `/customers` })),
    ];

    res.json({ results });
  } catch (err) { next(err); }
};
