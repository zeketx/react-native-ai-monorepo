# Data Migration Scripts

This directory contains scripts and documentation for migrating data from Supabase to Payload CMS.

## Quick Start

### Prerequisites
- Node.js 16+ and npm/pnpm
- Access to Supabase instance (service role key)
- Payload CMS instance configured and accessible
- TypeScript and ts-node installed

### Environment Setup
```bash
# Copy and configure environment file
cp .env.example .env

# Required variables
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_KEY=your-service-role-key
PAYLOAD_CONFIG_PATH=./payload.config.js
PAYLOAD_SECRET=your-payload-secret
```

### Complete Migration Process

```bash
# Install dependencies
cd scripts/migration
npm install

# Option 1: Run all steps sequentially
npm run migrate:all

# Option 2: Run each step individually
npm run export      # Export from Supabase
npm run transform   # Transform data format
npm run import      # Import to Payload CMS
npm run validate    # Validate migration success

# Option 3: Dry run (test without making changes)
npm run migrate:dry
```

## Scripts Overview

### 1. Export Script (`export-supabase.ts`)
Exports all data from Supabase tables and storage to JSON files.

**Features:**
- Exports auth users, profiles, and application data
- Handles Supabase Storage files metadata
- Generates export summary with statistics
- Error handling and retry logic

**Usage:**
```bash
npx ts-node export-supabase.ts
# or
npm run export
```

**Output:**
- `auth_users.json` - Authentication users
- `user_profiles.json` - User profile data
- `client_profiles.json` - Client information
- `trips.json` - Trip data
- `storage_files.json` - File metadata
- `export_summary.json` - Export statistics

### 2. Transform Script (`transform-data.ts`)
Transforms exported Supabase data into Payload CMS format.

**Features:**
- Converts UUIDs to string IDs
- Maps relational data to Payload relationships
- Transforms JSON fields to structured objects
- Validates data integrity during transformation

**Usage:**
```bash
npx ts-node transform-data.ts
# or
npm run transform
```

**Output:**
- `transformed/users.json` - Users for Payload
- `transformed/clients.json` - Client data
- `transformed/trips.json` - Trip data
- `transformed/media.json` - Media files
- `transformed/userPreferences.json` - User preferences
- `transformed/transformation_summary.json` - Transform statistics

### 3. Import Script (`import-payload.ts`)
Imports transformed data into Payload CMS collections.

**Features:**
- Batch processing for large datasets
- Dry run mode for testing
- Relationship validation
- Progress tracking and error reporting

**Usage:**
```bash
# Dry run (test mode)
DRY_RUN=true npx ts-node import-payload.ts
# or
npm run import:dry

# Live import
npx ts-node import-payload.ts
# or
npm run import
```

**Output:**
- Data imported to Payload collections
- `import_summary.json` - Import statistics and errors

### 4. Validation Script (`validate-migration.ts`)
Validates migration success by comparing original and migrated data.

**Features:**
- Record count validation
- Data integrity checks
- Relationship validation
- Comprehensive reporting

**Usage:**
```bash
npx ts-node validate-migration.ts
# or
npm run validate
```

**Output:**
- Console validation report
- `validation_report.json` - Detailed validation results

### 5. Test Script (`test-migration.ts`)
Tests the entire migration process with staging data.

**Features:**
- End-to-end migration testing
- Performance timing
- Error detection
- Staging environment validation

**Usage:**
```bash
# Set staging environment variables first
STAGING_SUPABASE_URL=your-staging-url
STAGING_SUPABASE_SERVICE_KEY=your-staging-key

npx ts-node test-migration.ts
# or
npm run test:staging
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | Yes | - |
| `SUPABASE_SERVICE_KEY` | Service role key (full access) | Yes | - |
| `PAYLOAD_CONFIG_PATH` | Path to Payload config file | No | `./payload.config.js` |
| `PAYLOAD_SECRET` | Payload secret key | Yes | - |
| `EXPORT_DIR` | Export data directory | No | `./migration-data` |
| `OUTPUT_DIR` | Transformed data directory | No | `./migration-data/transformed` |
| `BATCH_SIZE` | Import batch size | No | `100` |
| `DRY_RUN` | Enable dry run mode | No | `false` |

### File Structure
```
migration-data/
├── auth_users.json           # Original Supabase users
├── user_profiles.json        # User profile data
├── client_profiles.json      # Client data
├── trips.json               # Trip data
├── storage_files.json       # File metadata
├── export_summary.json      # Export statistics
└── transformed/
    ├── users.json           # Transformed users
    ├── clients.json         # Transformed clients
    ├── trips.json          # Transformed trips
    ├── media.json          # Transformed media
    ├── userPreferences.json # User preferences
    ├── transformation_summary.json
    ├── import_summary.json
    └── validation_report.json
```

## Migration Checklist

### Pre-Migration
- [ ] Staging environment tested successfully
- [ ] Database backups created
- [ ] Environment variables configured
- [ ] Team notifications sent
- [ ] Maintenance mode prepared (if needed)

### During Migration
- [ ] Export completed successfully
- [ ] Transformation completed without errors
- [ ] Dry run import validated
- [ ] Live import completed
- [ ] Validation passed all checks

### Post-Migration
- [ ] Application functionality verified
- [ ] User authentication tested
- [ ] Performance monitoring active
- [ ] User password reset emails sent
- [ ] Support team notified
- [ ] Documentation updated

## Troubleshooting

### Common Issues

**Export Failures:**
- Check Supabase service key permissions
- Verify network connectivity
- Review table names and schemas

**Transformation Errors:**
- Validate JSON field formats
- Check for null values in required fields
- Verify relationship mappings

**Import Failures:**
- Ensure Payload collections are configured
- Check data type mismatches
- Verify relationship targets exist

**Validation Issues:**
- Review schema mappings
- Check for missing relationships
- Validate data transformations

### Error Recovery

**Partial Import Failure:**
1. Review import_summary.json for errors
2. Fix data issues in transformed files
3. Re-run import with corrected data
4. Validate again

**Complete Import Failure:**
1. Restore Payload database from backup
2. Review transformation logic
3. Fix issues and re-run transformation
4. Attempt import again

### Performance Optimization

**Large Datasets:**
- Increase batch size for imports
- Use database connection pooling
- Monitor memory usage during processing
- Consider running during off-peak hours

**Slow Imports:**
- Reduce batch size if memory issues
- Optimize Payload collection indexes
- Disable unnecessary Payload hooks during import
- Use database direct writes if possible

## Support

### Getting Help
1. Check this README and migration plan documentation
2. Review error logs and summaries
3. Search for similar issues in project documentation
4. Contact the development team

### Reporting Issues
When reporting issues, include:
- Script being run
- Environment variables (without secrets)
- Error messages
- Relevant log files
- Steps to reproduce

### Emergency Contacts
See MIGRATION_PLAN.md for emergency contacts and escalation procedures.

## Migration Scripts API Reference

Each migration script can be imported and used programmatically:

```typescript
import { SupabaseExporter } from './export-supabase';
import { DataTransformer } from './transform-data';
import { PayloadImporter } from './import-payload';
import { MigrationValidator } from './validate-migration';

// Example programmatic usage
const exporter = new SupabaseExporter('./my-export-dir');
await exporter.exportAllData();

const transformer = new DataTransformer('./my-export-dir', './my-output-dir');
await transformer.transformAllData();

const importer = new PayloadImporter('./my-output-dir', 100, false);
await importer.importAllData();

const validator = new MigrationValidator('./my-export-dir', './my-output-dir');
const summary = await validator.validateAllCollections();
```

## Contributing

When modifying migration scripts:
1. Update TypeScript types for any schema changes
2. Add appropriate error handling
3. Update validation logic
4. Test with staging data
5. Update documentation

## License

These migration scripts are part of the main project and follow the same licensing terms.