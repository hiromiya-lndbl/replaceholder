/* eslint-env node */

module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 9,
  },
  globals: {
    browser: true,
  },
  rules: {
    'semi': ['error', 'always'],
    'indent': ['error', 2, { SwitchCase: 1, }],
    'quotes': ['error', 'single', {
      'allowTemplateLiterals': true,
      'avoidEscape': true,
    }],
  },
};
