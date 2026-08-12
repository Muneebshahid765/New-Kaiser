// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Ignore build, node_modules, and generated folders
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**', 'coverage/**', 'generated/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended, // Basic TypeScript rules only
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
    },
  },
  {
    rules: {
      // ── 1. Disable 'any' & Unsafe Type Checks ──────────────────────────────
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',

      // ── 2. Disable Non-Null Assertion (req.rawBody! wala '!' operator) ───────
      '@typescript-eslint/no-non-null-assertion': 'off',

      // ── 3. Disable Template String & Async Strictness ───────────────────────
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/require-await': 'off',

      // ── 4. Disable Unused Vars & Empty Interfaces ───────────────────────────
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',

      // ── 5. Prettier Formatting Warnings Only ────────────────────────────────
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);