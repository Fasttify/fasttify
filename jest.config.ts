import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
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
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'packages/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'context/**/*.{js,jsx,ts,tsx}',
    'middlewares/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
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
