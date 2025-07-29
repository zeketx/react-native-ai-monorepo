#!/usr/bin/env ts-node

/**
 * Data Transformation Script
 * 
 * Transforms exported Supabase data into Payload CMS format.
 * This script processes the JSON files created by export-supabase.ts
 * and converts them to the format expected by Payload collections.
 * 
 * Usage:
 *   npx ts-node scripts/migration/transform-data.ts
 * 
 * Environment Variables:
 *   EXPORT_DIR - Directory containing exported data (default: ./migration-data)
 *   OUTPUT_DIR - Directory to save transformed data (default: ./migration-data/transformed)
 */

import * as fs from 'fs';
import * as path from 'path';

// Configuration
const EXPORT_DIR = process.env.EXPORT_DIR || './migration-data';
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(EXPORT_DIR, 'transformed');

interface TransformationResult {
  collection: string;
  originalCount: number;
  transformedCount: number;
  success: boolean;
  error?: string;
}

interface SupabaseUser {
  id: string;
  email: string;
  email_confirmed_at: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  user_metadata?: any;
  app_metadata?: any;
}

interface SupabaseUserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'client' | 'organizer' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface PayloadUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'organizer' | 'admin';
  phone?: string;
  emailVerified: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

class DataTransformer {
  private exportDir: string;
  private outputDir: string;
  private results: TransformationResult[] = [];

  constructor(exportDir: string, outputDir: string) {
    this.exportDir = exportDir;
    this.outputDir = outputDir;
    this.ensureOutputDirectory();
  }

  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      console.log(`📁 Created output directory: ${this.outputDir}`);
    }
  }

  private loadJsonFile<T>(fileName: string): T[] {
    const filePath = path.join(this.exportDir, `${fileName}.json`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private saveJsonFile<T>(fileName: string, data: T[]): void {
    const filePath = path.join(this.outputDir, `${fileName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  private convertUuidToString(uuid: string): string {
    // Payload expects string IDs, so we keep UUIDs as strings
    return uuid;
  }

  private formatDate(dateString: string | null): string {
    if (!dateString) return new Date().toISOString();
    return new Date(dateString).toISOString();
  }

  public async transformUsers(): Promise<TransformationResult> {
    console.log('🔄 Transforming users...');

    try {
      const authUsers = this.loadJsonFile<SupabaseUser>('auth_users');
      const userProfiles = this.loadJsonFile<SupabaseUserProfile>('user_profiles');

      // Create a map of user profiles by user_id for quick lookup
      const profileMap = new Map<string, SupabaseUserProfile>();
      userProfiles.forEach(profile => profileMap.set(profile.user_id, profile));

      const transformedUsers: PayloadUser[] = authUsers.map(user => {
        const profile = profileMap.get(user.id);

        return {
          id: this.convertUuidToString(user.id),
          email: user.email,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          role: profile?.role || 'client',
          phone: profile?.phone,
          emailVerified: !!user.email_confirmed_at,
          avatar: profile?.avatar_url,
          createdAt: this.formatDate(user.created_at),
          updatedAt: this.formatDate(user.updated_at),
          lastLoginAt: user.last_sign_in_at ? this.formatDate(user.last_sign_in_at) : undefined,
        };
      });

      this.saveJsonFile('users', transformedUsers);

      const result: TransformationResult = {
        collection: 'users',
        originalCount: authUsers.length,
        transformedCount: transformedUsers.length,
        success: true,
      };

      console.log(`✅ Transformed ${result.transformedCount} users`);
      return result;

    } catch (error) {
      const result: TransformationResult = {
        collection: 'users',
        originalCount: 0,
        transformedCount: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };

      console.error(`❌ Failed to transform users: ${result.error}`);
      return result;
    }
  }

  public async transformClients(): Promise<TransformationResult> {
    console.log('🔄 Transforming clients...');

    try {
      const clientProfiles = this.loadJsonFile<any>('client_profiles');

      const transformedClients = clientProfiles.map((client: any) => ({
        id: this.convertUuidToString(client.id),
        user: this.convertUuidToString(client.user_id),
        companyName: client.company_name || '',
        industry: client.industry || '',
        title: client.title || '',
        department: client.department || '',
        businessPhone: client.business_phone || '',
        businessEmail: client.business_email || '',
        tier: client.tier || 'standard',
        status: client.status || 'active',
        preferredContactMethod: client.preferred_contact_method || 'email',
        travelFrequency: client.travel_frequency || 'occasional',
        averageTripDuration: client.average_trip_duration || 0,
        loyaltyPoints: client.loyalty_points || 0,
        membershipLevel: client.membership_level || 'bronze',
        creditLimit: client.credit_limit || 0,
        currency: client.currency || 'USD',
        createdAt: this.formatDate(client.created_at),
        updatedAt: this.formatDate(client.updated_at),
        lastActivityAt: client.last_activity_at ? this.formatDate(client.last_activity_at) : undefined,
      }));

      this.saveJsonFile('clients', transformedClients);

      const result: TransformationResult = {
        collection: 'clients',
        originalCount: clientProfiles.length,
        transformedCount: transformedClients.length,
        success: true,
      };

      console.log(`✅ Transformed ${result.transformedCount} clients`);
      return result;

    } catch (error) {
      const result: TransformationResult = {
        collection: 'clients',
        originalCount: 0,
        transformedCount: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };

      console.error(`❌ Failed to transform clients: ${result.error}`);
      return result;
    }
  }

  public async transformTrips(): Promise<TransformationResult> {
    console.log('🔄 Transforming trips...');

    try {
      const trips = this.loadJsonFile<any>('trips');

      const transformedTrips = trips.map((trip: any) => {
        // Parse destinations from JSON if it's a string
        let destinations = [];
        if (trip.destinations) {
          destinations = typeof trip.destinations === 'string' 
            ? JSON.parse(trip.destinations) 
            : trip.destinations;
        }

        // Parse travelers from JSON if it's a string
        let travelers = [];
        if (trip.travelers) {
          travelers = typeof trip.travelers === 'string'
            ? JSON.parse(trip.travelers)
            : trip.travelers;
        }

        return {
          id: this.convertUuidToString(trip.id),
          title: trip.title,
          description: trip.description || '',
          client: this.convertUuidToString(trip.client_id),
          organizer: trip.organizer_id ? this.convertUuidToString(trip.organizer_id) : undefined,
          travelers: travelers.map((t: any) => typeof t === 'string' ? t : this.convertUuidToString(t)),
          type: trip.type,
          status: trip.status,
          priority: trip.priority || 'medium',
          startDate: this.formatDate(trip.start_date),
          endDate: this.formatDate(trip.end_date),
          destinations: destinations,
          estimatedBudget: trip.estimated_budget || 0,
          actualBudget: trip.actual_budget || 0,
          currency: trip.currency || 'USD',
          accommodationPreference: trip.accommodation_preference,
          transportationPreference: trip.transportation_preference,
          notes: trip.notes || '',
          createdAt: this.formatDate(trip.created_at),
          updatedAt: this.formatDate(trip.updated_at),
          createdBy: this.convertUuidToString(trip.created_by),
        };
      });

      this.saveJsonFile('trips', transformedTrips);

      const result: TransformationResult = {
        collection: 'trips',
        originalCount: trips.length,
        transformedCount: transformedTrips.length,
        success: true,
      };

      console.log(`✅ Transformed ${result.transformedCount} trips`);
      return result;

    } catch (error) {
      const result: TransformationResult = {
        collection: 'trips',
        originalCount: 0,
        transformedCount: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };

      console.error(`❌ Failed to transform trips: ${result.error}`);
      return result;
    }
  }

  public async transformUserPreferences(): Promise<TransformationResult> {
    console.log('🔄 Transforming user preferences...');

    try {
      const preferences = this.loadJsonFile<any>('user_preferences');

      const transformedPreferences = preferences.map((pref: any) => {
        // Parse notifications JSON if it's a string
        let notifications = {};
        if (pref.notifications) {
          notifications = typeof pref.notifications === 'string'
            ? JSON.parse(pref.notifications)
            : pref.notifications;
        }

        return {
          id: this.convertUuidToString(pref.id),
          user: this.convertUuidToString(pref.user_id),
          language: pref.language || 'en',
          theme: pref.theme || 'light',
          notifications: notifications,
          locationEnabled: pref.location_enabled || false,
          createdAt: this.formatDate(pref.created_at),
          updatedAt: this.formatDate(pref.updated_at),
        };
      });

      this.saveJsonFile('userPreferences', transformedPreferences);

      const result: TransformationResult = {
        collection: 'userPreferences',
        originalCount: preferences.length,
        transformedCount: transformedPreferences.length,
        success: true,
      };

      console.log(`✅ Transformed ${result.transformedCount} user preferences`);
      return result;

    } catch (error) {
      const result: TransformationResult = {
        collection: 'userPreferences',
        originalCount: 0,
        transformedCount: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };

      console.error(`❌ Failed to transform user preferences: ${result.error}`);
      return result;
    }
  }

  public async transformMedia(): Promise<TransformationResult> {
    console.log('🔄 Transforming media files...');

    try {
      const storageFiles = this.loadJsonFile<any>('storage_files');
      const tripDocuments = this.loadJsonFile<any>('trip_documents');

      // Transform storage files to media format
      const mediaFiles = storageFiles.map((file: any) => ({
        id: `storage-${file.bucket}-${file.name.replace(/[^a-zA-Z0-9]/g, '-')}`,
        filename: file.name,
        mimeType: file.mimetype || 'application/octet-stream',
        filesize: file.size || 0,
        url: file.public_url,
        alt: file.name,
        createdAt: this.formatDate(file.created_at),
        updatedAt: this.formatDate(file.updated_at),
        // Additional metadata
        bucket: file.bucket,
        source: 'supabase-storage',
      }));

      // Transform trip documents to media format
      const documentMedia = tripDocuments.map((doc: any) => ({
        id: this.convertUuidToString(doc.id),
        filename: doc.filename || 'document',
        mimeType: doc.type || 'application/octet-stream',
        filesize: doc.size || 0,
        url: doc.url,
        alt: doc.filename || 'Trip document',
        trip: this.convertUuidToString(doc.trip_id),
        createdAt: this.formatDate(doc.created_at),
        updatedAt: this.formatDate(doc.updated_at),
        source: 'trip-document',
      }));

      const allMedia = [...mediaFiles, ...documentMedia];
      this.saveJsonFile('media', allMedia);

      const result: TransformationResult = {
        collection: 'media',
        originalCount: storageFiles.length + tripDocuments.length,
        transformedCount: allMedia.length,
        success: true,
      };

      console.log(`✅ Transformed ${result.transformedCount} media files`);
      return result;

    } catch (error) {
      const result: TransformationResult = {
        collection: 'media',
        originalCount: 0,
        transformedCount: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };

      console.error(`❌ Failed to transform media: ${result.error}`);
      return result;
    }
  }

  public async transformAllData(): Promise<void> {
    console.log('🚀 Starting data transformation...\n');

    // Transform collections in dependency order
    this.results.push(await this.transformUsers());
    this.results.push(await this.transformClients());
    this.results.push(await this.transformUserPreferences());
    this.results.push(await this.transformMedia());
    this.results.push(await this.transformTrips()); // Last because it references other collections

    // Generate transformation summary
    await this.generateSummary();

    console.log('\n🎉 Transformation completed!');
  }

  private async generateSummary(): Promise<void> {
    const summary = {
      transformation_date: new Date().toISOString(),
      total_collections: this.results.length,
      successful_transformations: this.results.filter(r => r.success).length,
      failed_transformations: this.results.filter(r => !r.success).length,
      total_original_records: this.results.reduce((sum, r) => sum + r.originalCount, 0),
      total_transformed_records: this.results.reduce((sum, r) => sum + r.transformedCount, 0),
      results: this.results,
      environment: {
        export_directory: this.exportDir,
        output_directory: this.outputDir,
        node_version: process.version,
      },
    };

    const summaryPath = path.join(this.outputDir, 'transformation_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log('\n📊 Transformation Summary:');
    console.log(`   Total collections: ${summary.total_collections}`);
    console.log(`   Successful: ${summary.successful_transformations}`);
    console.log(`   Failed: ${summary.failed_transformations}`);
    console.log(`   Original records: ${summary.total_original_records}`);
    console.log(`   Transformed records: ${summary.total_transformed_records}`);
    console.log(`   Summary saved to: ${summaryPath}`);

    if (summary.failed_transformations > 0) {
      console.log('\n❌ Failed transformations:');
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`   - ${r.collection}: ${r.error}`));
    }
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    const transformer = new DataTransformer(EXPORT_DIR, OUTPUT_DIR);
    await transformer.transformAllData();
    process.exit(0);
  } catch (error) {
    console.error('💥 Transformation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { DataTransformer };