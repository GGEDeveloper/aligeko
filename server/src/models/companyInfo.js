import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CompanyInfo = sequelize.define('CompanyInfo', {
  address: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  businessHours: { type: DataTypes.STRING, allowNull: false },
  facebook: { type: DataTypes.STRING },
  instagram: { type: DataTypes.STRING },
  linkedin: { type: DataTypes.STRING },
  whatsapp: { type: DataTypes.STRING }
}, {
  tableName: 'company_info',
  timestamps: true
});

export default CompanyInfo;