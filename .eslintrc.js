module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true,
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 12,
    },
    rules: {
        'no-var': 'error',
        indent: ['error', 4],
        'max-len': ['error', { code: 100 }],
        'no-plusplus': 'off',
        'no-await-in-loop': 'off',
        'global-require': 'off',
        'no-multiple-empty-lines': 'off',
        'no-constant-condition': 'off',
        'semi': ['error', 'never'],
        'arrow-body-style': ['error', 'as-needed'],
        'implicit-arrow-linebreak': 'off',
        'function-paren-newline': 'off',
        'object-curly-newline': 'off',
    }
}
