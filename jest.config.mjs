import nextJest from 'next/jest.js';
import { setMaxListeners } from 'node:events';

setMaxListeners(20, process);

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/test/**/*.test.{js,jsx,ts,tsx}', '<rootDir>/test/**/*.spec.{js,jsx,ts,tsx}'],
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
    '^@/packages/theme-editor/(.*)$': '<rootDir>/packages/theme-editor/src/$1',
    '^@/packages/theme-editor$': '<rootDir>/packages/theme-editor/src',
    '^@/api/(.*)$': '<rootDir>/src/app/api/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'packages/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/test/**',
    '!**/__tests__/**',
    '!**/*.test.*',
    '!**/*.spec.*',
  ],
};

export default createJestConfig(config);
