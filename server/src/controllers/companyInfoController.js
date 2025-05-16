import CompanyInfo from '../models/companyInfo.js';

// GET /api/company-info
export const getCompanyInfo = async (req, res) => {
  try {
    const info = await CompanyInfo.findOne();
    if (!info) return res.status(404).json({ message: 'Company info not found' });
    res.json(info);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT/PATCH /api/company-info
export const updateCompanyInfo = async (req, res) => {
  try {
    let info = await CompanyInfo.findOne();
    if (!info) {
      info = await CompanyInfo.create(req.body);
    } else {
      await info.update(req.body);
    }
    res.json(info);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 