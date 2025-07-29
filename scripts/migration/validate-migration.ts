#!/usr/bin/env ts-node

/**
 * Migration Validation Script
 * 
 * Validates that the data migration was successful by comparing
 * the original Supabase data with the imported Payload data.
 * 
 * Usage:
 *   npx ts-node scripts/migration/validate-migration.ts
 * 
 * Environment Variables:
 *   PAYLOAD_CONFIG_PATH - Path to Payload config file (default: ./payload.config.js)
 *   EXPORT_DIR - Directory containing original exported data (default: ./migration-data)
 *   TRANSFORMED_DIR - Directory containing transformed data (default: ./migration-data/transformed)
 */

import * as fs from 'fs';
import * as path from 'path';

// Configuration
const PAYLOAD_CONFIG_PATH = process.env.PAYLOAD_CONFIG_PATH || './payload.config.js';
const EXPORT_DIR = process.env.EXPORT_DIR || './migration-data';
const TRANSFORMED_DIR = process.env.TRANSFORMED_DIR || path.join(EXPORT_DIR, 'transformed');

interface ValidationResult {
  collection: string;
  originalCount: number;
  transformedCount: number;
  payloadCount: number;
  missingRecords: number;
  extraRecords: number;
  dataIntegrityIssues: string[];
  relationshipIssues: string[];
  success: boolean;
}

interface ValidationSummary {
  totalCollections: number;
  passedValidations: number;
  failedValidations: number;
  totalOriginalRecords: number;
  totalPayloadRecords: number;
  overallSuccess: boolean;
  criticalIssues: string[];
  warnings: string[];
}

class MigrationValidator {
  private payload: any;
  private exportDir: string;
  private transformedDir: string;
  private results: ValidationResult[] = [];

  constructor(exportDir: string, transformedDir: string) {
    this.exportDir = exportDir;
    this.transformedDir = transformedDir;
  }

  private async initializePayload(): Promise<void> {
    try {
      const { default: payload } = await import('payload');
      
      if (!fs.existsSync(PAYLOAD_CONFIG_PATH)) {
        throw new Error(`Payload config not found at: ${PAYLOAD_CONFIG_PATH}`);
      }

      await payload.init({
        local: true,
        secret: process.env.PAYLOAD_SECRET || 'development-secret-key',
      });

      this.payload = payload;
      console.log('✅ Payload initialized for validation');

    } catch (error) {
      console.error('❌ Failed to initialize Payload:', error);
      throw error;
    }
  }

  private loadJsonFile<T>(filePath: string): T[] {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private async getPayloadCollectionData(collectionSlug: string): Promise<any[]> {
    try {
      const result = await this.payload.find({
        collection: collectionSlug,
        limit: 10000, // Adjust based on expected data size
        pagination: false,
      });

      return result.docs || [];
    } catch (error) {
      console.error(`❌ Failed to fetch ${collectionSlug} from Payload:`, error);
      return [];
    }
  }

  private validateCollection(
    collectionName: string,
    originalData: any[],
    transformedData: any[],
    payloadData: any[]
  ): ValidationResult {
    console.log(`🔍 Validating ${collectionName}...`);

    const result: ValidationResult = {
      collection: collectionName,
      originalCount: originalData.length,
      transformedCount: transformedData.length,
      payloadCount: payloadData.length,
      missingRecords: 0,
      extraRecords: 0,
      dataIntegrityIssues: [],
      relationshipIssues: [],
      success: false,
    };

    // Check record counts
    if (result.transformedCount !== result.originalCount) {
      result.dataIntegrityIssues.push(
        `Transformation count mismatch: ${result.originalCount} original vs ${result.transformedCount} transformed`
      );
    }

    if (result.payloadCount !== result.transformedCount) {
      result.missingRecords = Math.max(0, result.transformedCount - result.payloadCount);
      result.extraRecords = Math.max(0, result.payloadCount - result.transformedCount);
      
      if (result.missingRecords > 0) {
        result.dataIntegrityIssues.push(`${result.missingRecords} records missing in Payload`);
      }
      if (result.extraRecords > 0) {
        result.dataIntegrityIssues.push(`${result.extraRecords} extra records in Payload`);
      }
    }

    // Validate data integrity (sample check)
    if (payloadData.length > 0 && transformedData.length > 0) {
      this.validateDataIntegrity(transformedData, payloadData, result);
    }

    // Check relationships
    this.validateRelationships(collectionName, payloadData, result);

    result.success = result.dataIntegrityIssues.length === 0 && result.relationshipIssues.length === 0;

    if (result.success) {
      console.log(`✅ ${collectionName} validation passed`);
    } else {
      console.log(`❌ ${collectionName} validation failed with ${result.dataIntegrityIssues.length + result.relationshipIssues.length} issues`);
    }

    return result;
  }

  private validateDataIntegrity(transformedData: any[], payloadData: any[], result: ValidationResult): void {
    // Sample a few records to check data integrity
    const sampleSize = Math.min(10, transformedData.length);
    const transformedMap = new Map(transformedData.map(item => [item.id, item]));

    for (let i = 0; i < sampleSize; i++) {
      const payloadRecord = payloadData[i];
      const transformedRecord = transformedMap.get(payloadRecord.id);

      if (!transformedRecord) {
        result.dataIntegrityIssues.push(`Record ${payloadRecord.id} exists in Payload but not in transformed data`);
        continue;
      }

      // Check key fields
      this.compareRecordFields(transformedRecord, payloadRecord, result);
    }
  }

  private compareRecordFields(transformed: any, payload: any, result: ValidationResult): void {
    const keyFields = ['email', 'title', 'name', 'status', 'createdAt'];
    
    for (const field of keyFields) {
      if (transformed[field] !== undefined && payload[field] !== undefined) {
        if (transformed[field] !== payload[field]) {
          result.dataIntegrityIssues.push(
            `Field mismatch for record ${payload.id}: ${field} (${transformed[field]} vs ${payload[field]})`
          );
        }
      }
    }
  }

  private validateRelationships(collectionName: string, payloadData: any[], result: ValidationResult): void {
    if (payloadData.length === 0) return;

    const sample = payloadData[0];

    switch (collectionName) {
      case 'clients':
        this.validateClientRelationships(payloadData, result);
        break;
      case 'trips':
        this.validateTripRelationships(payloadData, result);
        break;
      case 'userPreferences':
        this.validateUserPreferencesRelationships(payloadData, result);
        break;
    }
  }

  private validateClientRelationships(clients: any[], result: ValidationResult): void {
    const invalidClients = clients.filter(client => !client.user || typeof client.user !== 'string');
    
    if (invalidClients.length > 0) {
      result.relationshipIssues.push(`${invalidClients.length} clients have invalid user relationships`);
    }
  }

  private validateTripRelationships(trips: any[], result: ValidationResult): void {
    const invalidTrips = trips.filter(trip => 
      !trip.client || 
      typeof trip.client !== 'string' ||
      !trip.createdBy ||
      typeof trip.createdBy !== 'string'
    );
    
    if (invalidTrips.length > 0) {
      result.relationshipIssues.push(`${invalidTrips.length} trips have invalid relationships`);
    }

    // Check travelers array
    const tripsWithInvalidTravelers = trips.filter(trip => 
      trip.travelers && 
      (!Array.isArray(trip.travelers) || trip.travelers.some((t: any) => typeof t !== 'string'))
    );

    if (tripsWithInvalidTravelers.length > 0) {
      result.relationshipIssues.push(`${tripsWithInvalidTravelers.length} trips have invalid travelers`);
    }
  }

  private validateUserPreferencesRelationships(preferences: any[], result: ValidationResult): void {
    const invalidPrefs = preferences.filter(pref => !pref.user || typeof pref.user !== 'string');
    
    if (invalidPrefs.length > 0) {
      result.relationshipIssues.push(`${invalidPrefs.length} user preferences have invalid user relationships`);
    }
  }

  public async validateAllCollections(): Promise<ValidationSummary> {
    console.log('🚀 Starting migration validation...\n');

    await this.initializePayload();

    // Define collections to validate
    const collections = [
      { name: 'users', originalFile: 'auth_users.json', transformedFile: 'users.json', payloadCollection: 'users' },
      { name: 'clients', originalFile: 'client_profiles.json', transformedFile: 'clients.json', payloadCollection: 'clients' },
      { name: 'trips', originalFile: 'trips.json', transformedFile: 'trips.json', payloadCollection: 'trips' },
      { name: 'userPreferences', originalFile: 'user_preferences.json', transformedFile: 'userPreferences.json', payloadCollection: 'userPreferences' },
      { name: 'media', originalFile: 'storage_files.json', transformedFile: 'media.json', payloadCollection: 'media' },
    ];

    // Validate each collection
    for (const collection of collections) {
      const originalData = this.loadJsonFile(path.join(this.exportDir, collection.originalFile));
      const transformedData = this.loadJsonFile(path.join(this.transformedDir, collection.transformedFile));
      const payloadData = await this.getPayloadCollectionData(collection.payloadCollection);

      const result = this.validateCollection(
        collection.name,
        originalData,
        transformedData,
        payloadData
      );

      this.results.push(result);
    }

    return this.generateValidationSummary();
  }

  private generateValidationSummary(): ValidationSummary {
    const summary: ValidationSummary = {
      totalCollections: this.results.length,
      passedValidations: this.results.filter(r => r.success).length,
      failedValidations: this.results.filter(r => !r.success).length,
      totalOriginalRecords: this.results.reduce((sum, r) => sum + r.originalCount, 0),
      totalPayloadRecords: this.results.reduce((sum, r) => sum + r.payloadCount, 0),
      overallSuccess: this.results.every(r => r.success),
      criticalIssues: [],
      warnings: [],
    };

    // Collect critical issues and warnings
    this.results.forEach(result => {
      if (result.missingRecords > 0) {
        summary.criticalIssues.push(`${result.collection}: ${result.missingRecords} missing records`);
      }
      
      result.dataIntegrityIssues.forEach(issue => {
        if (issue.includes('missing') || issue.includes('mismatch')) {
          summary.criticalIssues.push(`${result.collection}: ${issue}`);
        } else {
          summary.warnings.push(`${result.collection}: ${issue}`);
        }
      });

      result.relationshipIssues.forEach(issue => {
        summary.criticalIssues.push(`${result.collection}: ${issue}`);
      });
    });

    return summary;
  }

  public async printValidationReport(summary: ValidationSummary): Promise<void> {
    console.log('\n📊 Migration Validation Report:');
    console.log('=' .repeat(50));
    
    console.log(`📈 Overview:`);
    console.log(`   Total collections validated: ${summary.totalCollections}`);
    console.log(`   Passed validations: ${summary.passedValidations}`);
    console.log(`   Failed validations: ${summary.failedValidations}`);
    console.log(`   Original records: ${summary.totalOriginalRecords}`);
    console.log(`   Payload records: ${summary.totalPayloadRecords}`);
    console.log(`   Overall success: ${summary.overallSuccess ? '✅ YES' : '❌ NO'}`);

    console.log('\n📋 Collection Details:');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${result.collection}: ${result.payloadCount}/${result.originalCount} records`);
      
      if (!result.success) {
        [...result.dataIntegrityIssues, ...result.relationshipIssues].forEach(issue => {
          console.log(`      - ${issue}`);
        });
      }
    });

    if (summary.criticalIssues.length > 0) {
      console.log('\n🚨 Critical Issues:');
      summary.criticalIssues.forEach(issue => console.log(`   - ${issue}`));
    }

    if (summary.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      summary.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    // Save detailed report
    const reportPath = path.join(this.transformedDir, 'validation_report.json');
    const report = {
      validation_date: new Date().toISOString(),
      summary,
      detailed_results: this.results,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    if (summary.overallSuccess) {
      console.log('\n🎉 Migration validation completed successfully!');
      console.log('   Your data has been migrated correctly.');
    } else {
      console.log('\n⚠️  Migration validation found issues.');
      console.log('   Please review the issues above and consider re-running the migration.');
    }
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    const validator = new MigrationValidator(EXPORT_DIR, TRANSFORMED_DIR);
    const summary = await validator.validateAllCollections();
    await validator.printValidationReport(summary);
    
    // Exit with error code if validation failed
    process.exit(summary.overallSuccess ? 0 : 1);
    
  } catch (error) {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { MigrationValidator };