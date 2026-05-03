const express = require('express');
const router = express.Router();
const {
  getAllCryptos,
  getTopGainers,
  getNewListings,
  addCrypto,
} = require('../controllers/cryptoController');

// NOTE: Specific routes (/gainers, /new) MUST come before the root route
// to prevent Express from treating "gainers" as a dynamic :id param.

// GET /api/crypto/gainers  — top gainers by 24h % change
router.get('/gainers', getTopGainers);

// GET /api/crypto/new  — newest listings
router.get('/new', getNewListings);

// GET /api/crypto  — all cryptocurrencies
router.get('/', getAllCryptos);

// POST /api/crypto  — add a new cryptocurrency
router.post('/', addCrypto);

module.exports = router;
