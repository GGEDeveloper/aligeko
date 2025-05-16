import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

class User extends Model {
  // Method to validate password
  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name'
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name'
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'customer',
    field: 'role'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    field: 'status'
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  },
  reset_password_token: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'reset_password_token'
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reset_password_expires'
  },
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'two_factor_enabled'
  },
  two_factor_secret: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'two_factor_secret'
  },
  verification_token: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'verification_token'
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    // Hash password before saving
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

export default User; 