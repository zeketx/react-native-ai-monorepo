import type { Endpoint } from 'payload'

/**
 * GET /api/trips - Get trips with filtering and search
 */
export const getTripsEndpoint: Endpoint = {
  path: '/trips',
  method: 'get',
  handler: async (req) => {
    // Check authentication
    if (!req.user) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this endpoint'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const { 
        limit = 10, 
        page = 1, 
        status, 
        search, 
        organizer, 
        startDate, 
        endDate 
      } = req.query

      // Build query conditions
      let whereConditions = {
        or: [
          { organizer: { equals: req.user.id } }, // User is the organizer
          { participants: { contains: req.user.id } } // User is a participant
        ]
      }

      // Add status filter if provided
      if (status && status !== 'all') {
        whereConditions.status = { equals: status }
      }

      // Add organizer filter if provided
      if (organizer) {
        whereConditions.organizer = { equals: organizer }
      }

      // Add date range filter if provided
      if (startDate) {
        whereConditions.startDate = { greater_than_equal: startDate }
      }
      if (endDate) {
        whereConditions.endDate = { less_than_equal: endDate }
      }

      // Add search filter if provided
      if (search) {
        whereConditions.or = [
          ...whereConditions.or,
          { title: { contains: search } },
          { destination: { contains: search } },
          { description: { contains: search } }
        ]
      }

      // Fetch trips
      const trips = await req.payload.find({
        collection: 'trips',
        where: whereConditions,
        limit: parseInt(limit as string),
        page: parseInt(page as string),
        depth: 2, // Include organizer and participant details
        sort: '-createdAt' // Most recent first
      })

      return new Response(JSON.stringify({
        success: true,
        trips: trips.docs,
        totalDocs: trips.totalDocs,
        totalPages: trips.totalPages,
        page: trips.page,
        hasPrevPage: trips.hasPrevPage,
        hasNextPage: trips.hasNextPage,
        prevPage: trips.prevPage,
        nextPage: trips.nextPage
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error fetching trips:', error)
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch trips',
        message: 'An error occurred while retrieving trips'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

/**
 * GET /api/trips/{id} - Get trip details by ID
 */
export const getTripByIdEndpoint: Endpoint = {
  path: '/trips/:id',
  method: 'get',
  handler: async (req) => {
    // Check authentication
    if (!req.user) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this endpoint'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const { id } = req.params

      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Trip ID is required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Fetch trip with full details
      const trip = await req.payload.findByID({
        collection: 'trips',
        id: id as string,
        depth: 3 // Include all nested relationships
      })

      if (!trip) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Trip not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Check if user has access to this trip
      const isOrganizer = trip.organizer.id === req.user.id
      const isParticipant = trip.participants?.some(p => p.id === req.user.id)
      
      if (!isOrganizer && !isParticipant) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Access denied to this trip'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({
        success: true,
        trip,
        permissions: {
          canEdit: isOrganizer,
          canInvite: isOrganizer,
          canDelete: isOrganizer
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error fetching trip by ID:', error)
      
      if (error.name === 'CastError' || error.message?.includes('Invalid ID')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid trip ID format'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        error: 'Failed to fetch trip',
        message: 'An error occurred while retrieving the trip'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

/**
 * POST /api/trips - Create new trip
 */
export const createTripEndpoint: Endpoint = {
  path: '/trips',
  method: 'post',
  handler: async (req) => {
    // Check authentication
    if (!req.user) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this endpoint'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const tripData = await req.json()

      // Validate required fields
      const { title, destination, startDate, endDate } = tripData

      if (!title || !destination || !startDate || !endDate) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing required fields: title, destination, startDate, endDate'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Validate dates
      const start = new Date(startDate)
      const end = new Date(endDate)
      const now = new Date()

      if (start >= end) {
        return new Response(JSON.stringify({
          success: false,
          error: 'End date must be after start date'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (start < now) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Start date cannot be in the past'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Create trip with user as organizer
      const newTrip = await req.payload.create({
        collection: 'trips',
        data: {
          ...tripData,
          organizer: req.user.id,
          status: 'planning', // Default status
          participants: tripData.participants || [], // Initialize empty if not provided
          createdBy: req.user.id
        }
      })

      return new Response(JSON.stringify({
        success: true,
        message: 'Trip created successfully',
        trip: newTrip
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error creating trip:', error)
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return new Response(JSON.stringify({ 
          error: 'Validation failed',
          message: 'Please check your trip data',
          details: error.data || error.message
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        error: 'Failed to create trip',
        message: 'An error occurred while creating the trip'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

/**
 * PATCH /api/trips/{id} - Update trip
 */
export const updateTripEndpoint: Endpoint = {
  path: '/trips/:id',
  method: 'patch',
  handler: async (req) => {
    // Check authentication
    if (!req.user) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this endpoint'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const { id } = req.params
      const updateData = await req.json()

      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Trip ID is required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Fetch existing trip to check permissions
      const existingTrip = await req.payload.findByID({
        collection: 'trips',
        id: id as string,
        depth: 1
      })

      if (!existingTrip) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Trip not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Check if user is the organizer (only organizer can edit)
      if (existingTrip.organizer !== req.user.id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Only the trip organizer can edit this trip'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Validate dates if they're being updated
      if (updateData.startDate || updateData.endDate) {
        const startDate = updateData.startDate ? new Date(updateData.startDate) : new Date(existingTrip.startDate)
        const endDate = updateData.endDate ? new Date(updateData.endDate) : new Date(existingTrip.endDate)

        if (startDate >= endDate) {
          return new Response(JSON.stringify({
            success: false,
            error: 'End date must be after start date'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        })
        }
      }

      // Prevent changing organizer
      delete updateData.organizer
      delete updateData.createdBy

      // Update trip
      const updatedTrip = await req.payload.update({
        collection: 'trips',
        id: id as string,
        data: {
          ...updateData,
          updatedBy: req.user.id
        },
        depth: 2
      })

      return new Response(JSON.stringify({
        success: true,
        message: 'Trip updated successfully',
        trip: updatedTrip
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error updating trip:', error)
      
      if (error.name === 'CastError' || error.message?.includes('Invalid ID')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid trip ID format'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        return new Response(JSON.stringify({ 
          error: 'Validation failed',
          message: 'Please check your trip data',
          details: error.data || error.message
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        error: 'Failed to update trip',
        message: 'An error occurred while updating the trip'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

/**
 * DELETE /api/trips/{id} - Delete trip
 */
export const deleteTripEndpoint: Endpoint = {
  path: '/trips/:id',
  method: 'delete',
  handler: async (req) => {
    // Check authentication
    if (!req.user) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this endpoint'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const { id } = req.params

      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Trip ID is required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Fetch existing trip to check permissions
      const existingTrip = await req.payload.findByID({
        collection: 'trips',
        id: id as string,
        depth: 1
      })

      if (!existingTrip) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Trip not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Check if user is the organizer (only organizer can delete)
      if (existingTrip.organizer !== req.user.id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Only the trip organizer can delete this trip'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Delete trip
      await req.payload.delete({
        collection: 'trips',
        id: id as string
      })

      return new Response(JSON.stringify({
        success: true,
        message: 'Trip deleted successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error deleting trip:', error)
      
      if (error.name === 'CastError' || error.message?.includes('Invalid ID')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid trip ID format'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        error: 'Failed to delete trip',
        message: 'An error occurred while deleting the trip'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

/**
 * PATCH /api/trips/{id}/status - Update trip status
 */
export const updateTripStatusEndpoint: Endpoint = {
  path: '/trips/:id/status',
  method: 'patch',
  handler: async (req) => {
    // Check authentication
    if (!req.user) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this endpoint'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const { id } = req.params
      const { status } = await req.json()

      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Trip ID is required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (!status) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Status is required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Validate status value
      const validStatuses = ['planning', 'booked', 'active', 'completed', 'cancelled']
      if (!validStatuses.includes(status)) {
        return new Response(JSON.stringify({
          success: false,
          error: `Status must be one of: ${validStatuses.join(', ')}`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Fetch existing trip to check permissions
      const existingTrip = await req.payload.findByID({
        collection: 'trips',
        id: id as string,
        depth: 1
      })

      if (!existingTrip) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Trip not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Check if user is the organizer (only organizer can change status)
      if (existingTrip.organizer !== req.user.id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Only the trip organizer can change the trip status'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Update trip status
      const updatedTrip = await req.payload.update({
        collection: 'trips',
        id: id as string,
        data: {
          status,
          updatedBy: req.user.id
        },
        depth: 2
      })

      return new Response(JSON.stringify({
        success: true,
        message: 'Trip status updated successfully',
        trip: updatedTrip
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error updating trip status:', error)
      
      if (error.name === 'CastError' || error.message?.includes('Invalid ID')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid trip ID format'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        error: 'Failed to update trip status',
        message: 'An error occurred while updating the trip status'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}