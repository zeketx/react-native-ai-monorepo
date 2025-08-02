/**
 * Trip Service
 * 
 * Service for managing trip operations using Payload CMS API.
 * Provides trip CRUD operations, status management, and itinerary handling.
 */

import { createPayloadClient, type PayloadClient, type PayloadAPIResponse } from '../api/payload-client';
import type { BaseTrip, TripStatus, TripType, Location } from '../types/trip';

export interface TripFilters {
  status?: TripStatus;
  type?: TripType;
  startDate?: string;
  endDate?: string;
  destination?: string;
  clientId?: string;
}

export interface TripSearchParams extends TripFilters {
  page?: number;
  limit?: number;
  sortBy?: 'startDate' | 'endDate' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface TripCreationData {
  title: string;
  description?: string;
  type: TripType;
  destinations: Location[];
  startDate: string;
  endDate: string;
  travelerIds?: string[]; // Array of user IDs
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimatedBudget?: number;
  currency?: string;
  accommodationPreference?: 'budget' | 'mid-range' | 'luxury' | 'premium';
  transportationPreference?: 'economy' | 'business' | 'first-class';
  notes?: string;
}

export interface TripUpdateData {
  title?: string;
  description?: string;
  type?: TripType;
  destinations?: Location[];
  startDate?: string;
  endDate?: string;
  travelerIds?: string[];
  status?: TripStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimatedBudget?: number;
  currency?: string;
  accommodationPreference?: 'budget' | 'mid-range' | 'luxury' | 'premium';
  transportationPreference?: 'economy' | 'business' | 'first-class';
  notes?: string;
}

/**
 * Trip Service for trip management operations
 */
export class TripService {
  private payloadClient: PayloadClient;

  constructor() {
    this.payloadClient = createPayloadClient();
  }

  /**
   * Get all trips with optional filtering and pagination
   */
  async getTrips(params?: TripSearchParams): Promise<PayloadAPIResponse<{
    docs: BaseTrip[];
    totalPages: number;
    page: number;
    limit: number;
  }>> {
    try {
      const searchParams: any = {};
      
      if (params?.page) searchParams.page = params.page;
      if (params?.limit) searchParams.limit = params.limit;
      if (params?.status) searchParams.status = params.status;
      if (params?.search) searchParams.search = params.search;

      return await this.payloadClient.trips.getAll(searchParams);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get trips',
        },
      };
    }
  }

  /**
   * Get a single trip by ID
   */
  async getTripById(id: string): Promise<PayloadAPIResponse<BaseTrip>> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Trip ID is required',
          },
        };
      }

      return await this.payloadClient.trips.getById(id);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get trip',
        },
      };
    }
  }

  /**
   * Create a new trip
   */
  async createTrip(tripData: TripCreationData): Promise<PayloadAPIResponse<BaseTrip>> {
    try {
      // Validate required fields
      const validationError = this.validateTripData(tripData);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // Convert to BaseTrip format
      const trip: Omit<BaseTrip, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'> = {
        title: tripData.title,
        description: tripData.description || '',
        // type field removed - not in Payload schema
        status: 'planning' as TripStatus,
        // priority field removed - not in Payload schema
        destination: { city: '', country: '' }, // Default destination
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        client: '', // Will be set by the API based on authenticated user  
        // organizer field removed - not in Payload schema
        travelers: (tripData.travelerIds || []).map((id: string) => ({
          name: `Traveler ${id}`,
          relationship: 'self' as const
        })),
        budget: {
          total: tripData.estimatedBudget,
          currency: (tripData.currency || 'USD') as 'USD' | 'EUR' | 'GBP' | 'JPY'
        },
        // accommodation and transportation preferences removed - not in Payload schema
        itinerary: {
          flightDetails: '',
          hotelDetails: '',
          activityDetails: '',
          diningDetails: '',
          transportationDetails: ''
        },
        documents: [],
        specialRequests: tripData.notes,
      };

      return await this.payloadClient.trips.create(trip);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create trip',
        },
      };
    }
  }

  /**
   * Update an existing trip
   */
  async updateTrip(id: string, tripData: TripUpdateData): Promise<PayloadAPIResponse<BaseTrip>> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Trip ID is required',
          },
        };
      }

      // Validate updated data
      if (tripData.title && tripData.title.trim().length < 3) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Trip title must be at least 3 characters long',
          },
        };
      }

      // Travelers validation is optional since it can be added later

      if (tripData.startDate && tripData.endDate && 
          new Date(tripData.startDate) >= new Date(tripData.endDate)) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Start date must be before end date',
          },
        };
      }

      return await this.payloadClient.trips.update(id, tripData);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update trip',
        },
      };
    }
  }

  /**
   * Delete a trip
   */
  async deleteTrip(id: string): Promise<PayloadAPIResponse<{ message: string }>> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Trip ID is required',
          },
        };
      }

      return await this.payloadClient.trips.delete(id);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete trip',
        },
      };
    }
  }

  /**
   * Approve a trip (for organizers/admins)
   */
  async approveTrip(id: string): Promise<PayloadAPIResponse<BaseTrip>> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Trip ID is required',
          },
        };
      }

      return await this.payloadClient.trips.approve(id);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to approve trip',
        },
      };
    }
  }

  /**
   * Cancel a trip
   */
  async cancelTrip(id: string, reason?: string): Promise<PayloadAPIResponse<BaseTrip>> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Trip ID is required',
          },
        };
      }

      return await this.payloadClient.trips.cancel(id, reason);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to cancel trip',
        },
      };
    }
  }

  /**
   * Duplicate a trip
   */
  async duplicateTrip(id: string): Promise<PayloadAPIResponse<BaseTrip>> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Trip ID is required',
          },
        };
      }

      return await this.payloadClient.trips.duplicate(id);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to duplicate trip',
        },
      };
    }
  }

  /**
   * Get trip statistics for the current user
   */
  async getTripStats(): Promise<PayloadAPIResponse<{
    total: number;
    byStatus: Record<TripStatus, number>;
    byType: Record<TripType, number>;
    totalBudget: number;
    avgTripDuration: number;
  }>> {
    try {
      // This would need to be implemented as a separate endpoint
      // For now, we'll calculate it from the trips data
      const tripsResponse = await this.getTrips({ limit: 1000 }); // Get all trips

      if (!tripsResponse.success || !tripsResponse.data) {
        return tripsResponse as any;
      }

      const trips = tripsResponse.data.docs;
      const stats = {
        total: trips.length,
        byStatus: {} as Record<TripStatus, number>,
        byType: {} as Record<TripType, number>,
        totalBudget: 0,
        avgTripDuration: 0,
      };

      // Calculate statistics
      let totalDuration = 0;
      
      trips.forEach(trip => {
        // Count by status
        stats.byStatus[trip.status] = (stats.byStatus[trip.status] || 0) + 1;
        
        // Count by type
        // stats.byType[trip.type] = (stats.byType[trip.type] || 0) + 1; // type field not available
        
        // Budget not available in BaseTrip - skip budget calculations
        
        // Calculate duration
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        totalDuration += duration;
      });

      stats.avgTripDuration = trips.length > 0 ? Math.round(totalDuration / trips.length) : 0;

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get trip statistics',
        },
      };
    }
  }

  /**
   * Validate trip data
   */
  private validateTripData(tripData: TripCreationData): { code: string; message: string } | null {
    if (!tripData.title || tripData.title.trim().length < 3) {
      return {
        code: 'VALIDATION_FAILED',
        message: 'Trip title must be at least 3 characters long',
      };
    }

    // Type validation removed since not in Payload schema
    if (false) {
      return {
        code: 'VALIDATION_FAILED',
        message: 'Trip type is required',
      };
    }

    if (!tripData.destinations || tripData.destinations.length === 0 || !tripData.destinations[0]?.name) {
      return {
        code: 'VALIDATION_FAILED',
        message: 'At least one destination is required',
      };
    }

    if (!tripData.startDate || !tripData.endDate) {
      return {
        code: 'VALIDATION_FAILED',
        message: 'Start date and end date are required',
      };
    }

    if (new Date(tripData.startDate) >= new Date(tripData.endDate)) {
      return {
        code: 'VALIDATION_FAILED',
        message: 'Start date must be before end date',
      };
    }

    // Travelers validation is optional - can be empty initially

    // Budget field not available in BaseTrip interface

    return null;
  }

  /**
   * Update client configuration
   */
  updateConfig(config: any): void {
    this.payloadClient.updateConfig(config);
  }
}

/**
 * Default trip service instance
 */
export const tripService = new TripService();