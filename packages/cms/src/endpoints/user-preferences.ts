import type { Endpoint } from 'payload'

/**
 * GET /api/users/me/preferences - Get current user's preferences
 */
export const getUserPreferencesEndpoint: Endpoint = {
  path: '/users/me/preferences',
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
      // Get user with all preference relationships
      const user = await req.payload.findByID({
        collection: 'users',
        id: req.user.id,
        depth: 3, // Include nested preference data
      })

      // Extract preferences from user data
      const preferences = {
        flight: user.flightPreferences || null,
        hotel: user.hotelPreferences || null,
        activity: user.activityPreferences || null,
        dining: user.diningPreferences || null,
        general: {
          timezone: user.timezone || null,
          currency: user.preferredCurrency || 'USD',
          language: user.preferredLanguage || 'en',
          notifications: user.notificationSettings || {
            email: true,
            push: true,
            sms: false
          }
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        preferences
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch user preferences',
        message: 'An error occurred while retrieving your preferences'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

/**
 * PATCH /api/users/me/preferences - Update current user's preferences
 */
export const updateUserPreferencesEndpoint: Endpoint = {
  path: '/users/me/preferences',
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
      const updateData = await req.json()
      const { flight, hotel, activity, dining, general } = updateData

      let updatedUser = await req.payload.findByID({
        collection: 'users',
        id: req.user.id,
        depth: 1
      })

      // Update flight preferences
      if (flight) {
        if (updatedUser.flightPreferences) {
          await req.payload.update({
            collection: 'flight-preferences',
            id: updatedUser.flightPreferences,
            data: flight
          })
        } else {
          const newFlightPrefs = await req.payload.create({
            collection: 'flight-preferences',
            data: {
              ...flight,
              user: req.user.id
            }
          })
          await req.payload.update({
            collection: 'users',
            id: req.user.id,
            data: { flightPreferences: newFlightPrefs.id }
          })
        }
      }

      // Update hotel preferences
      if (hotel) {
        if (updatedUser.hotelPreferences) {
          await req.payload.update({
            collection: 'hotel-preferences',
            id: updatedUser.hotelPreferences,
            data: hotel
          })
        } else {
          const newHotelPrefs = await req.payload.create({
            collection: 'hotel-preferences',
            data: {
              ...hotel,
              user: req.user.id
            }
          })
          await req.payload.update({
            collection: 'users',
            id: req.user.id,
            data: { hotelPreferences: newHotelPrefs.id }
          })
        }
      }

      // Update activity preferences
      if (activity) {
        if (updatedUser.activityPreferences) {
          await req.payload.update({
            collection: 'activity-preferences',
            id: updatedUser.activityPreferences,
            data: activity
          })
        } else {
          const newActivityPrefs = await req.payload.create({
            collection: 'activity-preferences',
            data: {
              ...activity,
              user: req.user.id
            }
          })
          await req.payload.update({
            collection: 'users',
            id: req.user.id,
            data: { activityPreferences: newActivityPrefs.id }
          })
        }
      }

      // Update dining preferences
      if (dining) {
        if (updatedUser.diningPreferences) {
          await req.payload.update({
            collection: 'dining-preferences',
            id: updatedUser.diningPreferences,
            data: dining
          })
        } else {
          const newDiningPrefs = await req.payload.create({
            collection: 'dining-preferences',
            data: {
              ...dining,
              user: req.user.id
            }
          })
          await req.payload.update({
            collection: 'users',
            id: req.user.id,
            data: { diningPreferences: newDiningPrefs.id }
          })
        }
      }

      // Update general preferences (stored directly on user)
      if (general) {
        const userUpdateData = {}
        if (general.timezone) userUpdateData.timezone = general.timezone
        if (general.currency) userUpdateData.preferredCurrency = general.currency
        if (general.language) userUpdateData.preferredLanguage = general.language
        if (general.notifications) userUpdateData.notificationSettings = general.notifications

        if (Object.keys(userUpdateData).length > 0) {
          await req.payload.update({
            collection: 'users',
            id: req.user.id,
            data: userUpdateData
          })
        }
      }

      // Fetch updated preferences
      const finalUser = await req.payload.findByID({
        collection: 'users',
        id: req.user.id,
        depth: 3
      })

      const preferences = {
        flight: finalUser.flightPreferences || null,
        hotel: finalUser.hotelPreferences || null,
        activity: finalUser.activityPreferences || null,
        dining: finalUser.diningPreferences || null,
        general: {
          timezone: finalUser.timezone || null,
          currency: finalUser.preferredCurrency || 'USD',
          language: finalUser.preferredLanguage || 'en',
          notifications: finalUser.notificationSettings || {
            email: true,
            push: true,
            sms: false
          }
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        preferences,
        message: 'Preferences updated successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error updating user preferences:', error)
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return new Response(JSON.stringify({ 
          error: 'Validation failed',
          message: 'Please check your preference data',
          details: error.data || error.message
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        error: 'Failed to update user preferences',
        message: 'An error occurred while updating your preferences'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}