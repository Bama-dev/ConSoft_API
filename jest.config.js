module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[tj]s'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  setupFiles: ['dotenv/config'],
  testTimeout: 30000,
};


