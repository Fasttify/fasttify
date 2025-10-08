import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
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

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
