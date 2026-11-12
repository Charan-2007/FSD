import mongoose from 'mongoose';

const MedicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide medicine name'],
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    dosage: {
      type: String,
      trim: true,
      default: '', // e.g. '500mg'
    },
    manufacturer: {
      type: String,
      trim: true,
      default: '',
    },
    batchNumber: {
      type: String,
      trim: true,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    supplier: {
      name: { type: String, default: '' },
      contact: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Medicine', MedicineSchema);
