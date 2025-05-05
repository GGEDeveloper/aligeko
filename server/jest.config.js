module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/tests/',
    '/src/config/',
    '/src/migrations/'
  ],
  coverageDirectory: './coverage',
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,
  setupFilesAfterEnv: ['./tests/setup.js'], // This file can be created if needed for test setup
  testTimeout: 10000, // 10 seconds to account for database operations
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!speakeasy|qrcode)'
  ]
}; 