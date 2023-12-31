module.exports = {
    env: {
        commonjs: true,
        es6: true,
        node: true
    },
    extends: [
        'standard'
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parserOptions: {
        ecmaVersion: 2018
    },
    rules: {
        'space-before-function-paren': 'off',
        'indent': 'off',
        'padded-blocks': 'off',
        'semi': [
            'error',
            'always'
        ]
    }
}
