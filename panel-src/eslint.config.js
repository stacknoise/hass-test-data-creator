import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    plugins: { jsdoc },
    rules: {
      // Concept 13.5: every class, function and method has a one-line TSDoc comment.
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: false,
          require: { FunctionDeclaration: true, ClassDeclaration: true, MethodDefinition: true },
          contexts: ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration'],
          checkConstructors: false,
        },
      ],
      'jsdoc/require-description': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  { files: ['src/**/*.test.ts'], rules: { 'jsdoc/require-jsdoc': 'off' } },
);
