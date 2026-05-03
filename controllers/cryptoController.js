const Crypto = require('../models/Crypto');

// ─── @desc    Get all cryptocurrencies
// ─── @route   GET /api/crypto
// ─── @access  Public
const getAllCryptos = async (req, res) => {
  try {
    const cryptos = await Crypto.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cryptos.length,
      data: cryptos,
    });
  } catch (err) {
    console.error('Get all cryptos error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch cryptocurrencies.' });
  }
};

// ─── @desc    Get top gainers (highest 24h % change, descending)
// ─── @route   GET /api/crypto/gainers
// ─── @access  Public
const getTopGainers = async (req, res) => {
  try {
    const gainers = await Crypto.find({ change24h: { $gt: 0 } })
      .sort({ change24h: -1 }) // Highest first
      .limit(20);

    res.status(200).json({
      success: true,
      count: gainers.length,
      data: gainers,
    });
  } catch (err) {
    console.error('Get gainers error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch top gainers.' });
  }
};

// ─── @desc    Get newest listings (sorted by creation date, descending)
// ─── @route   GET /api/crypto/new
// ─── @access  Public
const getNewListings = async (req, res) => {
  try {
    const newListings = await Crypto.find()
      .sort({ createdAt: -1 }) // Most recently added first
      .limit(20);

    res.status(200).json({
      success: true,
      count: newListings.length,
      data: newListings,
    });
  } catch (err) {
    console.error('Get new listings error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch new listings.' });
  }
};

// ─── @desc    Add a new cryptocurrency
// ─── @route   POST /api/crypto
// ─── @access  Public (or Private — protect as needed)
const addCrypto = async (req, res) => {
  try {
    const { name, symbol, price, image, change24h } = req.body;

    // Validate required fields
    if (!name || !symbol || price === undefined || change24h === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, symbol, price, and change24h.',
      });
    }

    // Check for duplicate symbol
    const existing = await Crypto.findOne({ symbol: symbol.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A cryptocurrency with symbol "${symbol.toUpperCase()}" already exists.`,
      });
    }

    const crypto = await Crypto.create({
      name,
      symbol,
      price: Number(price),
      image: image || '',
      change24h: Number(change24h),
    });

    res.status(201).json({
      success: true,
      message: 'Cryptocurrency added successfully.',
      data: crypto,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    console.error('Add crypto error:', err);
    res.status(500).json({ success: false, message: 'Could not add cryptocurrency.' });
  }
};

module.exports = { getAllCryptos, getTopGainers, getNewListings, addCrypto };
