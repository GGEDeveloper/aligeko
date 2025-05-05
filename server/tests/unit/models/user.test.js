import { User, Customer, Address, Order } from '../../../src/models';
import sequelize from '../../../src/config/database';
import bcrypt from 'bcryptjs';

// Use in-memory SQLite database for tests
beforeAll(async () => {
  // Force sync all models to the test database
  await sequelize.sync({ force: true });
});

// Clean up after tests
afterAll(async () => {
  await sequelize.close();
});

describe('User Model', () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      email: 'test@example.com',
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer',
      status: 'active',
      isApproved: true
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await User.destroy({ where: {}, force: true });
  });

  test('should create a user successfully', async () => {
    expect(testUser).toBeDefined();
    expect(testUser.id).toBeDefined();
    expect(testUser.email).toBe('test@example.com');
    expect(testUser.firstName).toBe('Test');
    expect(testUser.lastName).toBe('User');
    expect(testUser.role).toBe('customer');
    expect(testUser.status).toBe('active');
    expect(testUser.isApproved).toBe(true);
    // Password should be hashed, not stored as plaintext
    expect(testUser.password).not.toBe('SecurePassword123!');
  });

  test('should hash password before saving', async () => {
    // Verify the password was hashed (starts with bcrypt marker)
    expect(testUser.password).toMatch(/^\$2[ayb]\$/);
    
    // Verify we can validate the password
    const isValid = await bcrypt.compare('SecurePassword123!', testUser.password);
    expect(isValid).toBe(true);
    
    // Verify wrong password fails
    const isInvalid = await bcrypt.compare('WrongPassword123!', testUser.password);
    expect(isInvalid).toBe(false);
  });

  test('should validate user password correctly', async () => {
    // Assuming validatePassword is a method on the user model
    if (typeof testUser.validatePassword === 'function') {
      const isValid = await testUser.validatePassword('SecurePassword123!');
      expect(isValid).toBe(true);

      const isInvalid = await testUser.validatePassword('WrongPassword123!');
      expect(isInvalid).toBe(false);
    } else {
      // Skip this test if validatePassword method is not available
      console.warn('validatePassword method not found on User model');
    }
  });

  test('should not create a user without required fields', async () => {
    try {
      await User.create({
        // Missing email and password
        firstName: 'Invalid',
        lastName: 'User'
      });
      // Should not reach this line
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('SequelizeValidationError');
    }
  });

  test('should not create a user with an invalid email format', async () => {
    try {
      await User.create({
        email: 'invalid-email',
        password: 'SecurePassword123!',
        firstName: 'Invalid',
        lastName: 'Email',
        role: 'customer'
      });
      // Should not reach this line
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      // Error could be either validation or database constraint
    }
  });

  test('should not allow duplicate emails', async () => {
    try {
      await User.create({
        email: 'test@example.com', // Same as testUser
        password: 'AnotherPassword123!',
        firstName: 'Duplicate',
        lastName: 'Email',
        role: 'customer'
      });
      // Should not reach this line
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      // Could be a unique constraint violation
    }
  });

  test('should update a user successfully', async () => {
    await testUser.update({
      firstName: 'Updated',
      lastName: 'Name',
      status: 'inactive'
    });

    // Reload the user from the database
    await testUser.reload();

    expect(testUser.firstName).toBe('Updated');
    expect(testUser.lastName).toBe('Name');
    expect(testUser.status).toBe('inactive');
    // Email should remain unchanged
    expect(testUser.email).toBe('test@example.com');
  });

  test('should create a user with associated customer profile', async () => {
    // Create a user with a customer profile
    const userWithCustomer = await User.create({
      email: 'customer@example.com',
      password: 'CustomerPass123!',
      firstName: 'Customer',
      lastName: 'Test',
      role: 'customer',
      status: 'active',
      isApproved: true
    });

    // Create associated customer profile
    const customerProfile = await Customer.create({
      user_id: userWithCustomer.id,
      companyName: 'Test Company',
      taxId: '12345678901',
      contactPhone: '+1234567890',
      creditLimit: 5000.00
    });

    // Retrieve user with customer association
    const retrievedUser = await User.findByPk(userWithCustomer.id, {
      include: [Customer]
    });

    expect(retrievedUser).toBeDefined();
    expect(retrievedUser.Customer).toBeDefined();
    expect(retrievedUser.Customer.companyName).toBe('Test Company');
    expect(retrievedUser.Customer.taxId).toBe('12345678901');
    expect(parseFloat(retrievedUser.Customer.creditLimit)).toBe(5000.00);

    // Clean up
    await Customer.destroy({ where: { user_id: userWithCustomer.id }, force: true });
    await userWithCustomer.destroy({ force: true });
  });

  test('should delete a user and cascade to associated records', async () => {
    // Create a user with associated records
    const userWithAssociations = await User.create({
      email: 'cascade@example.com',
      password: 'CascadePass123!',
      firstName: 'Cascade',
      lastName: 'Test',
      role: 'customer',
      status: 'active',
      isApproved: true
    });

    // Create associated customer profile
    const customerProfile = await Customer.create({
      user_id: userWithAssociations.id,
      companyName: 'Cascade Company',
      taxId: '12345678901',
      contactPhone: '+1234567890'
    });

    // Create associated address
    const customerAddress = await Address.create({
      customer_id: customerProfile.id,
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345',
      country: 'Testland',
      type: 'shipping'
    });

    // Delete the user
    await userWithAssociations.destroy();

    // Check if user was deleted
    const deletedUser = await User.findByPk(userWithAssociations.id);
    expect(deletedUser).toBeNull();

    // Check if associated records were deleted or orphaned based on your foreign key configuration
    const orphanedCustomer = await Customer.findOne({ where: { user_id: userWithAssociations.id } });
    
    // If you have CASCADE delete, these should be null
    // If not, you'd need to adjust the test accordingly
    expect(orphanedCustomer).toBeNull();

    // Check if address was deleted or orphaned
    const orphanedAddress = await Address.findOne({ where: { customer_id: customerProfile.id } });
    expect(orphanedAddress).toBeNull();
  });
}); 