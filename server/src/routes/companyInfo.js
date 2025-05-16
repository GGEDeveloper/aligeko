import express from 'express';
const router = express.Router();
import { getCompanyInfo, updateCompanyInfo } from '../controllers/companyInfoController.js';
import { requireAuth, authorizeAdmin } from '../middleware/auth.js';

// GET company info (público)
router.get('/', getCompanyInfo);

// PUT company info (apenas admin)
router.put('/', requireAuth, authorizeAdmin, updateCompanyInfo);

export default router;