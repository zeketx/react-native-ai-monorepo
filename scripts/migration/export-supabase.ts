#!/usr/bin/env ts-node

/**
 * Supabase Data Export Script
 * 
 * Exports all data from Supabase tables to JSON files for migration to Payload CMS.
 * Run this script before starting the migration process.
 * 
 * Usage:
 *   npx ts-node scripts/migration/export-supabase.ts
 * 
 * Environment Variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_KEY - Service role key (not anon key)
 *   EXPORT_DIR - Directory to save exported data (default: ./migration-data)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const EXPORT_DIR = process.env.EXPORT_DIR || './migration-data';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL - Your Supabase project URL');
  console.error('   SUPABASE_SERVICE_KEY - Your service role key');
  process.exit(1);
}

// Initialize Supabase client with service key for full access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ExportResult {
  table: string;
  count: number;
  success: boolean;
  error?: string;
}

class SupabaseExporter {
  private exportDir: string;
  private results: ExportResult[] = [];

  constructor(exportDir: string) {
    this.exportDir = exportDir;
    this.ensureExportDirectory();
  }

  private ensureExportDirectory(): void {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
      console.log(`📁 Created export directory: ${this.exportDir}`);
    }
  }

  private async exportTable(
    tableName: string, 
    fileName: string,
    selectQuery: string = '*',
    additionalOptions: any = {}
  ): Promise<ExportResult> {
    console.log(`🔄 Exporting ${tableName}...`);
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(selectQuery)
        .order('created_at', { ascending: true, ...additionalOptions });

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      const filePath = path.join(this.exportDir, `${fileName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      const result: ExportResult = {
        table: tableName,
        count: data?.length || 0,
        success: true,
      };

      console.log(`✅ Exported ${result.count} records from ${tableName} to ${fileName}.json`);
      return result;

    } catch (error) {
      const result: ExportResult = {
        table: tableName,
        count: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };

      console.error(`❌ Failed to export ${tableName}: ${result.error}`);
      return result;
    }
  }

  private async exportAuthUsers(): Promise<ExportResult> {
    console.log(`🔄 Exporting auth.users...`);
    
    try {
      // Use the Supabase Admin API to get auth users
      const { data, error } = await supabase.auth.admin.listUsers();

      if (error) {
        throw new Error(`Auth API error: ${error.message}`);
      }

      const users = data.users.map(user => ({
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_sign_in_at: user.last_sign_in_at,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
      }));

      const filePath = path.join(this.exportDir, 'auth_users.json');
      fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

      const result: ExportResult = {
        table: 'auth.users',
        count: users.length,
        success: true,
      };

      console.log(`✅ Exported ${result.count} auth users to auth_users.json`);
      return result;

    } catch (error) {
      const result: ExportResult = {
        table: 'auth.users',
        count: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };

      console.error(`❌ Failed to export auth.users: ${result.error}`);
      return result;
    }
  }

  private async exportStorageFiles(): Promise<ExportResult> {
    console.log(`🔄 Exporting storage files metadata...`);
    
    try {
      // List all buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        throw new Error(`Storage buckets error: ${bucketsError.message}`);
      }

      const allFiles: any[] = [];

      // Get files from each bucket
      for (const bucket of buckets) {
        const { data: files, error: filesError } = await supabase.storage
          .from(bucket.name)
          .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

        if (filesError) {
          console.warn(`⚠️  Warning: Could not list files from bucket ${bucket.name}: ${filesError.message}`);
          continue;
        }

        const bucketFiles = files.map(file => ({
          bucket: bucket.name,
          name: file.name,
          size: file.metadata?.size,
          mimetype: file.metadata?.mimetype,
          created_at: file.created_at,
          updated_at: file.updated_at,
          last_accessed_at: file.last_accessed_at,
          // Get public URL
          public_url: supabase.storage.from(bucket.name).getPublicUrl(file.name).data.publicUrl,
        }));

        allFiles.push(...bucketFiles);
      }

      const filePath = path.join(this.exportDir, 'storage_files.json');
      fs.writeFileSync(filePath, JSON.stringify(allFiles, null, 2));

      const result: ExportResult = {
        table: 'storage',
        count: allFiles.length,
        success: true,
      };

      console.log(`✅ Exported ${result.count} storage files metadata to storage_files.json`);
      return result;

    } catch (error) {
      const result: ExportResult = {
        table: 'storage',
        count: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };

      console.error(`❌ Failed to export storage files: ${result.error}`);
      return result;
    }
  }

  public async exportAllData(): Promise<void> {
    console.log('🚀 Starting Supabase data export...\n');

    // Export auth users first
    this.results.push(await this.exportAuthUsers());

    // Export profile and application tables
    const tables = [
      {
        table: 'user_profiles',
        file: 'user_profiles',
        select: '*, user_id',
      },
      {
        table: 'client_profiles', 
        file: 'client_profiles',
        select: '*',
      },
      {
        table: 'trips',
        file: 'trips',
        select: '*, client_id, organizer_id, created_by',
      },
      {
        table: 'trip_itineraries',
        file: 'trip_itineraries',
        select: '*, trip_id',
      },
      {
        table: 'trip_documents',
        file: 'trip_documents', 
        select: '*, trip_id',
      },
      {
        table: 'trip_activities',
        file: 'trip_activities',
        select: '*, trip_id',
      },
      {
        table: 'user_preferences',
        file: 'user_preferences',
        select: '*, user_id',
      },
      {
        table: 'client_contracts',
        file: 'client_contracts',
        select: '*, client_id',
      },
      {
        table: 'client_activity_logs',
        file: 'client_activity_logs',
        select: '*, client_id, user_id',
      },
      {
        table: 'email_allowlist',
        file: 'email_allowlist',
        select: '*',
      },
    ];

    // Export each table
    for (const { table, file, select } of tables) {
      const result = await this.exportTable(table, file, select);
      this.results.push(result);
    }

    // Export storage files metadata
    this.results.push(await this.exportStorageFiles());

    // Generate export summary
    await this.generateSummary();

    console.log('\n🎉 Export completed!');
  }

  private async generateSummary(): Promise<void> {
    const summary = {
      export_date: new Date().toISOString(),
      total_tables: this.results.length,
      successful_exports: this.results.filter(r => r.success).length,
      failed_exports: this.results.filter(r => !r.success).length,
      total_records: this.results.reduce((sum, r) => sum + r.count, 0),
      results: this.results,
      environment: {
        supabase_url: SUPABASE_URL,
        export_directory: this.exportDir,
        node_version: process.version,
      },
    };

    const summaryPath = path.join(this.exportDir, 'export_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log('\n📊 Export Summary:');
    console.log(`   Total tables: ${summary.total_tables}`);
    console.log(`   Successful: ${summary.successful_exports}`);
    console.log(`   Failed: ${summary.failed_exports}`);
    console.log(`   Total records: ${summary.total_records}`);
    console.log(`   Summary saved to: ${summaryPath}`);

    if (summary.failed_exports > 0) {
      console.log('\n❌ Failed exports:');
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`   - ${r.table}: ${r.error}`));
    }
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    const exporter = new SupabaseExporter(EXPORT_DIR);
    await exporter.exportAllData();
    process.exit(0);
  } catch (error) {
    console.error('💥 Export failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { SupabaseExporter };