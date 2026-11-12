import express from 'express';
import Medicine from '../models/Medicine.js';

const router = express.Router();

// GET all medicines with search & filter
router.get('/', async (req, res) => {
  try {
    const { search, category, lowStock, expired } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    let medicines = await Medicine.find(query).sort({ createdAt: -1 });

    if (lowStock === 'true') {
      medicines = medicines.filter(med => med.quantity <= med.minThreshold);
    }

    if (expired === 'true') {
      const now = new Date();
      medicines = medicines.filter(med => new Date(med.expiryDate) < now);
    }

    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET inventory statistics summary
router.get('/stats/summary', async (req, res) => {
  try {
    const medicines = await Medicine.find();
    const totalItems = medicines.length;
    const totalStock = medicines.reduce((acc, curr) => acc + curr.quantity, 0);
    const totalValue = medicines.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
    
    const now = new Date();
    const lowStockCount = medicines.filter(m => m.quantity <= m.minThreshold).length;
    const expiredCount = medicines.filter(m => new Date(m.expiryDate) < now).length;

    // Categories list
    const categories = [...new Set(medicines.map(m => m.category))];

    res.json({
      totalItems,
      totalStock,
      totalValue: Number(totalValue.toFixed(2)),
      lowStockCount,
      expiredCount,
      categories,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single medicine
router.get('/:id', async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id);
    if (!med) return res.status(404).json({ error: 'Medicine not found' });
    res.json(med);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new medicine
router.post('/', async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    const saved = await medicine.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update medicine
router.put('/:id', async (req, res) => {
  try {
    const updated = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Medicine not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE medicine
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Medicine.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Medicine not found' });
    res.json({ message: 'Medicine removed successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
