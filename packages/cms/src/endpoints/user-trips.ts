import type { Endpoint } from 'payload'

/**
 * GET /api/users/me/trips - Get current user's trips
 */
export const getUserTripsEndpoint: Endpoint = {
  path: '/users/me/trips',
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
      const { limit = 10, page = 1, status, search } = req.query

      // Build query conditions
      const whereConditions = {
        or: [
          { organizer: { equals: req.user.id } }, // User is the organizer
          { participants: { contains: req.user.id } } // User is a participant
        ]
      }

      // Add status filter if provided
      if (status && status !== 'all') {
        whereConditions.status = { equals: status }
      }

      // Add search filter if provided
      if (search) {
        whereConditions.or = [
          ...whereConditions.or,
          { title: { contains: search } },
          { destination: { contains: search } }
        ]
      }

      // Fetch user's trips
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
      console.error('Error fetching user trips:', error)
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch user trips',
        message: 'An error occurred while retrieving your trips'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

/**
 * GET /api/users/search - Search users for trip invitations
 */
export const searchUsersEndpoint: Endpoint = {
  path: '/users/search',
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
      const { q, limit = 10 } = req.query

      if (!q || (q as string).length < 2) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Search query must be at least 2 characters long'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const searchQuery = q as string

      // Search users by name or email (excluding current user)
      const users = await req.payload.find({
        collection: 'users',
        where: {
          and: [
            { id: { not_equals: req.user.id } }, // Exclude current user
            { status: { equals: 'active' } }, // Only active users
            {
              or: [
                { firstName: { contains: searchQuery } },
                { lastName: { contains: searchQuery } },
                { email: { contains: searchQuery } }
              ]
            }
          ]
        },
        limit: parseInt(limit as string),
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          role: true
        }
      })

      return new Response(JSON.stringify({
        success: true,
        users: users.docs
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error searching users:', error)
      return new Response(JSON.stringify({ 
        error: 'Failed to search users',
        message: 'An error occurred while searching for users'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

/**
 * GET /api/users/{id} - Get user profile by ID
 */
export const getUserByIdEndpoint: Endpoint = {
  path: '/users/:id',
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
          error: 'User ID is required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Fetch user profile (limited public information)
      const user = await req.payload.findByID({
        collection: 'users',
        id: id as string,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          role: true,
          createdAt: true,
          // Don't include sensitive information like email, phone, etc.
        }
      })

      if (!user) {
        return new Response(JSON.stringify({
          success: false,
          error: 'User not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Check if user is active
      if (user.status !== 'active') {
        return new Response(JSON.stringify({
          success: false,
          error: 'User profile not available'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({
        success: true,
        user
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error fetching user by ID:', error)
      
      if (error.name === 'CastError' || error.message?.includes('Invalid ID')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid user ID format'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        error: 'Failed to fetch user profile',
        message: 'An error occurred while retrieving the user profile'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}