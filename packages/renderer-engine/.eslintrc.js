module.exports = {
  extends: [
    '../.eslintrc.js',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Reglas específicas para el paquete renderer-engine
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',

    // Reglas específicas para el motor de renderizado
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',

    // Reglas para manejo de errores
    '@typescript-eslint/no-throw-literal': 'error',
    '@typescript-eslint/prefer-readonly': 'warn',

    // Reglas para performance
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
  },
  env: {
    node: true,
    es2020: true,
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js', '*.d.ts'],
};
