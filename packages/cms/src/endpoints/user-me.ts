import type { Endpoint } from 'payload'

/**
 * GET /api/users/me - Get current user profile
 */
export const getUserMeEndpoint: Endpoint = {
  path: '/users/me',
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
      // Get full user data with relationships
      const user = await req.payload.findByID({
        collection: 'users',
        id: req.user.id,
        depth: 2, // Include related data
      })

      // Remove sensitive fields before sending response
      const { password, salt, resetPasswordToken, resetPasswordExpiration, ...safeUser } = user
      
      return new Response(JSON.stringify({
        success: true,
        user: safeUser
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch user profile',
        message: 'An error occurred while retrieving your profile information'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

/**
 * PUT /api/users/me - Update current user profile
 */
export const updateUserMeEndpoint: Endpoint = {
  path: '/users/me',
  method: 'put',
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
      const updateData = await req.json()

      // Remove sensitive fields from update data to prevent unauthorized changes
      const { 
        password, 
        salt, 
        resetPasswordToken, 
        resetPasswordExpiration,
        role, // Prevent role escalation
        ...allowedUpdates 
      } = updateData

      // Update user profile
      const updatedUser = await req.payload.update({
        collection: 'users',
        id: req.user.id,
        data: allowedUpdates,
        depth: 2
      })

      // Remove sensitive fields before sending response
      const { 
        password: pwd, 
        salt: s, 
        resetPasswordToken: rpt, 
        resetPasswordExpiration: rpe,
        ...safeUser 
      } = updatedUser
      
      return new Response(JSON.stringify({
        success: true,
        user: safeUser,
        message: 'Profile updated successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error updating user profile:', error)
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return new Response(JSON.stringify({ 
          error: 'Validation failed',
          message: 'Please check your input data',
          details: error.data || error.message
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        error: 'Failed to update user profile',
        message: 'An error occurred while updating your profile'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}