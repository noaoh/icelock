module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "standard-with-typescript",
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                "**.*.ts",
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
            parser: '@typescript-eslint/parser',
            project: './tsconfig.json',
            tsconfigRootDir: __dirname,
    },
    "ignorePatterns": [
        "node_modules/",
        "dist/"
    ],
    "settings": {
        "import/resolver": {
            typescript: true,
            node: true
        }
    }
}
