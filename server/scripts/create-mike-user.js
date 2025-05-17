import bcrypt from 'bcryptjs';
import { sequelize } from '../src/config/database.js';
import User from '../src/models/user.model.js';

async function createMikeUser() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: 'mike@mike.mike' } });
    
    if (existingUser) {
      console.log('User with email mike@mike.mike already exists.');
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('mikemeu', salt);

    // Create the user
    const user = await User.create({
      email: 'mike@mike.mike',
      password: hashedPassword,
      first_name: 'Mike',
      last_name: 'User',
      role: 'admin',
      status: 'active',
      two_factor_enabled: false
    });

    console.log('User created successfully:', {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      status: user.status
    });

  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the function
createMikeUser();
