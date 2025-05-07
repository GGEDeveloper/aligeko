const express = require('express');
const router = express.Router();
const companyInfoController = require('../controllers/companyInfoController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// GET company info (público)
router.get('/', companyInfoController.getCompanyInfo);

// PUT company info (apenas admin)
router.put('/', authenticate, authorizeAdmin, companyInfoController.updateCompanyInfo);

module.exports = router; 