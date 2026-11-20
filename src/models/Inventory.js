const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Medicine', 'Vaccine', 'Feed', 'Equipment', 'Supplement', 'Other']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  minQuantity: {
    type: Number,
    default: 5
  },
  unitPrice: {
    type: Number,
    min: 0
  },
  supplier: {
    name: String,
    contact: String
  },
  // true once a low-stock push has been sent; reset when restocked
  lowStockNotified: {
    type: Boolean,
    default: false
  },
  expiryDate: Date,
  batchNumber: String,
  location: String,
  notes: String
}, {
  timestamps: true
});

// Virtual for low stock status
inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minQuantity;
});

// Index for faster queries
inventorySchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);