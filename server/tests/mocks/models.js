// Mock models for testing purposes
const mockUser = {
  id: 'test-user-id',
  email: 'twofa@test.com',
  firstName: 'Test',
  lastName: 'User',
  password: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF', // Mock bcrypt hash
  role: 'customer',
  isApproved: true,
  status: 'active',
  companyName: 'Test Company',
  twoFactorEnabled: false,
  twoFactorSecret: null,
  twoFactorBackupCodes: null,
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  validatePassword: jest.fn().mockImplementation((password) => 
    password === 'SecurePass123!' ? true : false
  ),
  save: jest.fn().mockImplementation(function() {
    this.updatedAt = new Date();
    return Promise.resolve(this);
  }),
  toJSON: jest.fn().mockImplementation(function() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      status: this.status,
      companyName: this.companyName,
      isApproved: this.isApproved,
      twoFactorEnabled: this.twoFactorEnabled,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }),
  update: jest.fn().mockImplementation((data) => {
    Object.assign(this, data);
    this.updatedAt = new Date();
    return Promise.resolve([1, [this]]);
  })
};

const createUserMock = (overrides = {}) => {
  return {
    ...mockUser,
    ...overrides,
    toJSON: jest.fn().mockImplementation(function() {
      return {
        id: this.id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        role: this.role,
        status: this.status,
        companyName: this.companyName,
        isApproved: this.isApproved,
        twoFactorEnabled: this.twoFactorEnabled,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    }),
    save: jest.fn().mockImplementation(function() {
      this.updatedAt = new Date();
      return Promise.resolve(this);
    }),
    update: jest.fn().mockImplementation(function(data) {
      Object.assign(this, data);
      this.updatedAt = new Date();
      return Promise.resolve([1, [this]]);
    })
  };
};

const User = {
  create: jest.fn().mockImplementation((data) => {
    const user = createUserMock({
      ...data,
      id: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return Promise.resolve(user);
  }),
  findOne: jest.fn().mockImplementation(({ where }) => {
    if (where.email === mockUser.email) {
      return Promise.resolve(createUserMock());
    }
    return Promise.resolve(null);
  }),
  findByPk: jest.fn().mockImplementation((id) => {
    if (id === 'test-user-id') {
      return Promise.resolve(createUserMock());
    }
    return Promise.resolve(null);
  }),
  update: jest.fn().mockImplementation((data, query) => {
    return Promise.resolve([1, [createUserMock(data)]]);
  }),
  destroy: jest.fn().mockImplementation(() => Promise.resolve(1))
};

export default {
  User
};

export { User }; 