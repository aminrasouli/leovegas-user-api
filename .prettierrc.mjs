export default {
  "singleQuote": true,
  "trailingComma": "all",
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    '^(@nest|nest)(.*)$',
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '^@/(.*)$',
    '^[./]',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderGroupNamespaceSpecifiers: true,
}
