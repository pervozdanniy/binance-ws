module.exports = {
  settings: {
    "import/resolver": {
      typescript: {}
    }
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir : __dirname,
    project: ['tsconfig.json'],
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier'
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'prettier/prettier': 'error',
    'padding-line-between-statements': [
      "error",
      { blankLine: "always", prev: "*", next: "return" },
      { blankLine: "always", prev: "*", next: "throw" },
      { blankLine: "always", prev: "*", next: "export" },
      { blankLine: "any", prev: "export", next: "export" },
      { blankLine: "never", prev: "import", next: "import" },
    ],
    'import/newline-after-import': 'error',
    'no-console': 'warn'
  },
};
