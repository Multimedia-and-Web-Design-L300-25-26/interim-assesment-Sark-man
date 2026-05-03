const mongoose = require('mongoose');

const cryptoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Cryptocurrency name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    symbol: {
      type: String,
      required: [true, 'Symbol is required'],
      trim: true,
      uppercase: true,
      maxlength: [10, 'Symbol cannot exceed 10 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    change24h: {
      type: Number,
      required: [true, '24h change percentage is required'],
      // e.g. +2.5 means up 2.5%, -1.3 means down 1.3%
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index for fast sorting ────────────────────────────────────────────────────
cryptoSchema.index({ change24h: -1 });
cryptoSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Crypto', cryptoSchema);
