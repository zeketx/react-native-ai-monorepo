#!/usr/bin/env ts-node

/**
 * Payload CMS Import Script
 * 
 * Imports transformed data into Payload CMS using the Local API.
 * This script processes the JSON files created by transform-data.ts
 * and creates records in Payload collections.
 * 
 * Usage:
 *   npx ts-node scripts/migration/import-payload.ts
 * 
 * Environment Variables:
 *   PAYLOAD_CONFIG_PATH - Path to Payload config file (default: ./payload.config.js)
 *   INPUT_DIR - Directory containing transformed data (default: ./migration-data/transformed)
 *   BATCH_SIZE - Number of records to process at once (default: 100)
 *   DRY_RUN - Set to 'true' to preview without making changes (default: false)
 */

import * as fs from 'fs';
import * as path from 'path';

// Configuration
const PAYLOAD_CONFIG_PATH = process.env.PAYLOAD_CONFIG_PATH || './payload.config.js';
const INPUT_DIR = process.env.INPUT_DIR || './migration-data/transformed';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '100', 10);
const DRY_RUN = process.env.DRY_RUN === 'true';

interface ImportResult {
  collection: string;
  totalRecords: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
  success: boolean;
}

class PayloadImporter {
  private payload: any;
  private inputDir: string;
  private batchSize: number;
  private dryRun: boolean;
  private results: ImportResult[] = [];

  constructor(inputDir: string, batchSize: number = 100, dryRun: boolean = false) {
    this.inputDir = inputDir;
    this.batchSize = batchSize;
    this.dryRun = dryRun;
  }

  private async initializePayload(): Promise<void> {
    try {
      // Import Payload dynamically
      const { default: payload } = await import('payload');
      
      if (!fs.existsSync(PAYLOAD_CONFIG_PATH)) {
        throw new Error(`Payload config not found at: ${PAYLOAD_CONFIG_PATH}`);
      }

      // Initialize Payload with local API
      await payload.init({
        local: true,
        secret: process.env.PAYLOAD_SECRET || 'development-secret-key',
      });

      this.payload = payload;
      console.log('✅ Payload initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Payload:', error);
      throw error;
    }
  }

  private loadJsonFile<T>(fileName: string): T[] {
    const filePath = path.join(this.inputDir, `${fileName}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private async importCollection<T>(
    collectionSlug: string,
    fileName: string,
    preprocessData?: (data: T[]) => T[]
  ): Promise<ImportResult> {
    console.log(`🔄 Importing ${collectionSlug}...`);

    const result: ImportResult = {
      collection: collectionSlug,
      totalRecords: 0,
      successfulImports: 0,
      failedImports: 0,
      errors: [],
      success: false,
    };

    try {
      let data = this.loadJsonFile<T>(fileName);
      
      if (preprocessData) {
        data = preprocessData(data);
      }

      result.totalRecords = data.length;

      if (data.length === 0) {
        console.log(`ℹ️  No data to import for ${collectionSlug}`);
        result.success = true;
        return result;
      }

      if (this.dryRun) {
        console.log(`🔍 DRY RUN: Would import ${data.length} records to ${collectionSlug}`);
        result.successfulImports = data.length;
        result.success = true;
        return result;
      }

      // Import in batches to avoid memory issues
      for (let i = 0; i < data.length; i += this.batchSize) {
        const batch = data.slice(i, i + this.batchSize);
        console.log(`   Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(data.length / this.batchSize)} (${batch.length} records)`);

        for (const record of batch) {
          try {
            await this.payload.create({
              collection: collectionSlug,
              data: record,
            });
            result.successfulImports++;
          } catch (error) {
            result.failedImports++;
            const errorMessage = error instanceof Error ? error.message : String(error);
            result.errors.push(`Record ${JSON.stringify(record).substring(0, 100)}...: ${errorMessage}`);
            
            // Log first few errors, then summarize
            if (result.errors.length <= 5) {
              console.error(`   ❌ Import error: ${errorMessage}`);
            }
          }
        }
      }

      result.success = result.failedImports === 0;
      console.log(`✅ Imported ${result.successfulImports}/${result.totalRecords} records to ${collectionSlug}`);

      if (result.failedImports > 0) {
        console.warn(`⚠️  ${result.failedImports} records failed to import`);
      }

      return result;

    } catch (error) {
      result.success = false;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(errorMessage);
      console.error(`❌ Failed to import ${collectionSlug}: ${errorMessage}`);
      return result;
    }
  }

  private async importUsers(): Promise<ImportResult> {
    return this.importCollection('users', 'users', (users: any[]) => {
      // Preprocess users to ensure passwords are handled
      return users.map(user => ({
        ...user,
        // Payload requires a password field for users, but we'll handle this separately
        // The password will need to be set through a separate process or reset flow
        password: 'temp-password-needs-reset',
        passwordResetRequired: true,
      }));
    });
  }

  private async importClients(): Promise<ImportResult> {
    return this.importCollection('clients', 'clients');
  }

  private async importTrips(): Promise<ImportResult> {
    return this.importCollection('trips', 'trips', (trips: any[]) => {
      // Ensure all required fields are present
      return trips.map(trip => ({
        ...trip,
        // Set default values for required fields that might be missing
        priority: trip.priority || 'medium',
        currency: trip.currency || 'USD',
        itinerary: trip.itinerary || [],
        documents: trip.documents || [],
      }));
    });
  }

  private async importUserPreferences(): Promise<ImportResult> {
    return this.importCollection('userPreferences', 'userPreferences');
  }

  private async importMedia(): Promise<ImportResult> {
    return this.importCollection('media', 'media', (mediaFiles: any[]) => {
      // Filter out media files that don't have valid URLs
      return mediaFiles.filter(file => file.url && file.filename);
    });
  }

  public async importAllData(): Promise<void> {
    console.log('🚀 Starting Payload CMS import...\n');

    if (this.dryRun) {
      console.log('🔍 DRY RUN MODE - No data will be modified\n');
    }

    // Initialize Payload
    await this.initializePayload();

    // Import collections in dependency order
    // Users first (no dependencies)
    this.results.push(await this.importUsers());
    
    // Then collections that depend on users
    this.results.push(await this.importClients());
    this.results.push(await this.importUserPreferences());
    this.results.push(await this.importMedia());
    
    // Finally, trips (depends on users and clients)
    this.results.push(await this.importTrips());

    // Generate import summary
    await this.generateSummary();

    console.log('\n🎉 Import completed!');
  }

  private async generateSummary(): Promise<void> {
    const summary = {
      import_date: new Date().toISOString(),
      dry_run: this.dryRun,
      total_collections: this.results.length,
      successful_collections: this.results.filter(r => r.success).length,
      failed_collections: this.results.filter(r => !r.success).length,
      total_records: this.results.reduce((sum, r) => sum + r.totalRecords, 0),
      successful_imports: this.results.reduce((sum, r) => sum + r.successfulImports, 0),
      failed_imports: this.results.reduce((sum, r) => sum + r.failedImports, 0),
      results: this.results,
      environment: {
        payload_config_path: PAYLOAD_CONFIG_PATH,
        input_directory: this.inputDir,
        batch_size: this.batchSize,
        node_version: process.version,
      },
    };

    const summaryPath = path.join(this.inputDir, 'import_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log('\n📊 Import Summary:');
    console.log(`   Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE IMPORT'}`);
    console.log(`   Total collections: ${summary.total_collections}`);
    console.log(`   Successful collections: ${summary.successful_collections}`);
    console.log(`   Failed collections: ${summary.failed_collections}`);
    console.log(`   Total records: ${summary.total_records}`);
    console.log(`   Successful imports: ${summary.successful_imports}`);
    console.log(`   Failed imports: ${summary.failed_imports}`);
    console.log(`   Summary saved to: ${summaryPath}`);

    if (summary.failed_collections > 0) {
      console.log('\n❌ Failed collections:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   - ${r.collection}: ${r.errors[0] || 'Unknown error'}`);
          if (r.errors.length > 1) {
            console.log(`     (${r.errors.length - 1} more errors)`);
          }
        });
    }

    if (summary.failed_imports > 0) {
      console.log('\n⚠️  Some individual records failed to import.');
      console.log('   Check the detailed logs above for specific errors.');
      console.log('   Consider running the validation script to identify data issues.');
    }

    if (!this.dryRun && summary.successful_imports > 0) {
      console.log('\n🔐 Post-Import Actions Required:');
      console.log('   1. Reset passwords for all imported users');
      console.log('   2. Verify user email addresses');
      console.log('   3. Check file uploads and media references');
      console.log('   4. Validate relationships between collections');
      console.log('   5. Run the validation script to ensure data integrity');
    }
  }

  public async cleanup(): Promise<void> {
    // Close Payload connection if needed
    if (this.payload) {
      // Payload local API doesn't require explicit cleanup
      console.log('✅ Payload cleanup completed');
    }
  }
}

// Main execution
async function main(): Promise<void> {
  const importer = new PayloadImporter(INPUT_DIR, BATCH_SIZE, DRY_RUN);

  try {
    await importer.importAllData();
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  } finally {
    await importer.cleanup();
  }

  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main();
}

export { PayloadImporter };