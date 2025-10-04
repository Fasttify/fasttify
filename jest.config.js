module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '<rootDir>/test/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/test/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/test/**/?(*.)+(spec|test).{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/amplify/functions/.*/src/package.json',
    '<rootDir>/__mocks__/amplify_outputs.json.js',
    '<rootDir>/test/unit/liquid-tags/setup.ts',
  ],
  moduleNameMapper: {
    '^@/liquid-forge/(.*)$': '<rootDir>/packages/liquid-forge/$1',
    '^@/liquid-forge$': '<rootDir>/packages/liquid-forge',
    '^@/tenant-domains/(.*)$': '<rootDir>/packages/tenant-domains/$1',
    '^@/tenant-domains$': '<rootDir>/packages/tenant-domains',
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  collectCoverageFrom: [
    'test/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],
};
