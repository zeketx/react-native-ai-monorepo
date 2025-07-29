#!/usr/bin/env ts-node

/**
 * Migration Testing Script
 * 
 * Tests the migration process with sample data in a staging environment.
 * This script helps verify that all migration scripts work correctly before
 * running the actual migration.
 * 
 * Usage:
 *   npx ts-node scripts/migration/test-migration.ts
 * 
 * Environment Variables:
 *   STAGING_SUPABASE_URL - Staging Supabase project URL
 *   STAGING_SUPABASE_SERVICE_KEY - Staging service role key
 *   STAGING_PAYLOAD_CONFIG - Path to staging Payload config
 *   TEST_DATA_SIZE - Number of test records to create (default: 10)
 */

import * as fs from 'fs';
import * as path from 'path';
import { SupabaseExporter } from './export-supabase';
import { DataTransformer } from './transform-data';
import { PayloadImporter } from './import-payload';
import { MigrationValidator } from './validate-migration';

// Configuration
const STAGING_SUPABASE_URL = process.env.STAGING_SUPABASE_URL;
const STAGING_SUPABASE_SERVICE_KEY = process.env.STAGING_SUPABASE_SERVICE_KEY;
const STAGING_PAYLOAD_CONFIG = process.env.STAGING_PAYLOAD_CONFIG || './payload.staging.config.js';
const TEST_DATA_SIZE = parseInt(process.env.TEST_DATA_SIZE || '10', 10);
const TEST_DIR = './migration-test-data';

interface TestResult {
  step: string;
  success: boolean;
  duration: number;
  recordsProcessed: number;
  error?: string;
}

class MigrationTester {
  private testDir: string;
  private results: TestResult[] = [];

  constructor(testDir: string) {
    this.testDir = testDir;
    this.ensureTestDirectory();
  }

  private ensureTestDirectory(): void {
    if (fs.existsSync(this.testDir)) {
      // Clean up previous test data
      fs.rmSync(this.testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(this.testDir, { recursive: true });
    console.log(`📁 Created test directory: ${this.testDir}`);
  }

  private async timeExecution<T>(
    stepName: string,
    operation: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      return { result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      throw { error, duration };
    }
  }

  public async testExport(): Promise<TestResult> {
    console.log('🧪 Testing data export...');

    try {
      const { result, duration } = await this.timeExecution('export', async () => {
        // Set environment variables for test export
        process.env.SUPABASE_URL = STAGING_SUPABASE_URL;
        process.env.SUPABASE_SERVICE_KEY = STAGING_SUPABASE_SERVICE_KEY;
        process.env.EXPORT_DIR = this.testDir;

        const exporter = new SupabaseExporter(this.testDir);
        await exporter.exportAllData();
        
        // Count exported records
        const summaryPath = path.join(this.testDir, 'export_summary.json');
        const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
        return summary.total_records;
      });

      const testResult: TestResult = {
        step: 'export',
        success: true,
        duration,
        recordsProcessed: result,
      };

      console.log(`✅ Export test passed: ${result} records in ${duration}ms`);
      return testResult;

    } catch (error: any) {
      const testResult: TestResult = {
        step: 'export',
        success: false,
        duration: error.duration || 0,
        recordsProcessed: 0,
        error: error.error?.message || String(error),
      };

      console.error(`❌ Export test failed: ${testResult.error}`);
      return testResult;
    }
  }

  public async testTransform(): Promise<TestResult> {
    console.log('🧪 Testing data transformation...');

    try {
      const { result, duration } = await this.timeExecution('transform', async () => {
        const transformer = new DataTransformer(this.testDir, path.join(this.testDir, 'transformed'));
        await transformer.transformAllData();
        
        // Count transformed records
        const summaryPath = path.join(this.testDir, 'transformed', 'transformation_summary.json');
        const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
        return summary.total_transformed_records;
      });

      const testResult: TestResult = {
        step: 'transform',
        success: true,
        duration,
        recordsProcessed: result,
      };

      console.log(`✅ Transform test passed: ${result} records in ${duration}ms`);
      return testResult;

    } catch (error: any) {
      const testResult: TestResult = {
        step: 'transform',
        success: false,
        duration: error.duration || 0,
        recordsProcessed: 0,
        error: error.error?.message || String(error),
      };

      console.error(`❌ Transform test failed: ${testResult.error}`);
      return testResult;
    }
  }

  public async testImport(): Promise<TestResult> {
    console.log('🧪 Testing data import (dry run)...');

    try {
      const { result, duration } = await this.timeExecution('import', async () => {
        // Set environment variables for test import
        process.env.PAYLOAD_CONFIG_PATH = STAGING_PAYLOAD_CONFIG;
        process.env.INPUT_DIR = path.join(this.testDir, 'transformed');
        
        const importer = new PayloadImporter(
          path.join(this.testDir, 'transformed'),
          50, // smaller batch size for testing
          true  // dry run
        );
        
        await importer.importAllData();
        
        // Count records that would be imported
        const summaryPath = path.join(this.testDir, 'transformed', 'import_summary.json');
        const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
        return summary.successful_imports;
      });

      const testResult: TestResult = {
        step: 'import',
        success: true,
        duration,
        recordsProcessed: result,
      };

      console.log(`✅ Import test passed: ${result} records would be imported in ${duration}ms`);
      return testResult;

    } catch (error: any) {
      const testResult: TestResult = {
        step: 'import',
        success: false,
        duration: error.duration || 0,
        recordsProcessed: 0,
        error: error.error?.message || String(error),
      };

      console.error(`❌ Import test failed: ${testResult.error}`);
      return testResult;
    }
  }

  public async runFullTest(): Promise<void> {
    console.log('🚀 Starting migration test suite...\n');

    // Validate environment
    if (!STAGING_SUPABASE_URL || !STAGING_SUPABASE_SERVICE_KEY) {
      console.error('❌ Missing staging environment variables:');
      console.error('   STAGING_SUPABASE_URL');
      console.error('   STAGING_SUPABASE_SERVICE_KEY');
      process.exit(1);
    }

    // Run test steps in sequence
    this.results.push(await this.testExport());
    
    if (this.results[0].success) {
      this.results.push(await this.testTransform());
      
      if (this.results[1].success) {
        this.results.push(await this.testImport());
      }
    }

    // Generate test report
    await this.generateTestReport();
  }

  private async generateTestReport(): Promise<void> {
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    const successfulSteps = this.results.filter(r => r.success).length;
    const totalRecords = this.results.reduce((sum, r) => sum + r.recordsProcessed, 0);

    const report = {
      test_date: new Date().toISOString(),
      test_environment: 'staging',
      total_steps: this.results.length,
      successful_steps: successfulSteps,
      total_duration_ms: totalDuration,
      total_records_processed: totalRecords,
      overall_success: this.results.every(r => r.success),
      results: this.results,
      environment: {
        staging_supabase_url: STAGING_SUPABASE_URL,
        staging_payload_config: STAGING_PAYLOAD_CONFIG,
        test_directory: this.testDir,
        node_version: process.version,
      },
    };

    const reportPath = path.join(this.testDir, 'test_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 Migration Test Report:');
    console.log('=' .repeat(40));
    console.log(`   Test Environment: ${report.test_environment}`);
    console.log(`   Total Steps: ${report.total_steps}`);
    console.log(`   Successful Steps: ${report.successful_steps}`);
    console.log(`   Total Duration: ${(report.total_duration_ms / 1000).toFixed(2)}s`);
    console.log(`   Records Processed: ${report.total_records_processed}`);
    console.log(`   Overall Success: ${report.overall_success ? '✅ YES' : '❌ NO'}`);

    console.log('\n📋 Step Details:');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const duration = (result.duration / 1000).toFixed(2);
      console.log(`   ${status} ${result.step}: ${result.recordsProcessed} records in ${duration}s`);
      
      if (!result.success && result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    if (report.overall_success) {
      console.log('\n🎉 All migration tests passed!');
      console.log('   The migration process is ready for production use.');
    } else {
      console.log('\n⚠️  Some migration tests failed.');
      console.log('   Please fix the issues before running the production migration.');
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    fs.rmSync(this.testDir, { recursive: true, force: true });
    console.log('   Test data cleaned up.');
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    const tester = new MigrationTester(TEST_DIR);
    await tester.runFullTest();
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { MigrationTester };