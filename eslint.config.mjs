import globals from 'globals';
import pluginJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import jest from 'eslint-plugin-jest';

export default [
  pluginJs.configs.recommended,
  {
    ignores: [
      'dist/',
      '*.json'
    ], // отключение проверок для папок
  },
  {
    // определение стандарта и парсинга
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  {
    // files: ['src/**/*.js'],
    rules: {
      indent: [
        'error', 2
      ], // отступы, авто
      semi: [
        'error', 'always'
      ], // точка с запятой, авто
      'no-unused-vars': 'off', // не используемые переменные
      'no-console': 'off', // console.log
      'no-var': 'error',
    },
  },
  {
    files: [ '*.config.*' ], // правила для конфигов
    rules: {
      'no-underscore-dangle': [ 'off' ], // двойное подчеркивание перед/после переменной
      'import/no-extraneous-dependencies': 'off', // импорт из дев-зависимостей
    },
  },
  {
    files: [
      '**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'
    ],
    plugins: { jest },
    rules: { ...jest.configs.recommended.rules },
  },
  {
    plugins: { '@stylistic/js': stylistic, },
    rules: {
      'max-len': [
        'error', { code: 120 }
      ], // длинна строки, нет авто
      quotes: [
        'error', 'single'
      ], // одинарные кавычки, авто
      'object-curly-spacing': [
        'error', 'always'
      ], // пробелы внутри объекта
      'no-multi-spaces': [
        'error',
        {
          exceptions: {
            'Property': false,
            'BinaryExpression': true,
            'VariableDeclarator': true,
            'ImportDeclaration': true
          }
        }
      ], // убираем много пробелов в разных местах, авто
      'key-spacing': [
        'error', { 'mode': 'strict' }
      ],
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': [
        'error', {
          max: 1, // одна внутренняя
          maxBOF: 1, // одна сверху в импортах
        }
      ], // пустые строки, авто
    },
  },
];