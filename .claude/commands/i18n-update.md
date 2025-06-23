# Update Internationalization

Run the complete internationalization workflow to extract, collect, and process translations:

```bash
pnpm fbtee
```

This command executes the full i18n pipeline:

1. **Extract strings** (`pnpm fbtee:manifest`) - Scans `src/` for `<fbt>` tags
2. **Collect translations** (`pnpm fbtee:collect`) - Generates `source_strings.json`  
3. **Process translations** (`pnpm fbtee:translate`) - Updates files in `src/translations/`

After running this command, review the generated translation files and update any missing translations for supported locales (currently English and Japanese).