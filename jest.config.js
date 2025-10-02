module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/amplify/functions/.*/src/package.json',
    '<rootDir>/__mocks__/amplify_outputs.json.js',
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
  collectCoverageFrom: ['**/*.{js,jsx,ts,tsx}', '!**/*.d.ts', '!**/node_modules/**', '!**/.next/**', '!**/coverage/**'],
};
