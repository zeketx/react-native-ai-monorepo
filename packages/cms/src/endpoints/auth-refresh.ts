import type { Endpoint } from 'payload'

/**
 * Token Refresh Endpoint
 * 
 * Handles JWT token refresh for authenticated users.
 * This endpoint allows users to refresh their access tokens without re-authentication.
 */
export const refreshTokenEndpoint: Endpoint = {
  path: '/auth/refresh-token',
  method: 'post',
  handler: async (req) => {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Refresh token is required',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      try {
        // Use Payload's built-in token refresh functionality
        const result = await req.payload.refresh({
          collection: 'users',
          token: refreshToken,
        })

        if (result.user && result.token) {
          // Remove sensitive information from user object
          const { password, salt, resetPasswordToken, resetPasswordExpiration, ...safeUser } = result.user

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Token refreshed successfully',
              token: result.token,
              user: safeUser,
              exp: result.exp, // Token expiration time
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Invalid or expired refresh token',
            }),
            {
              status: 401,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError)
        
        // Handle different types of refresh errors
        if (refreshError.message?.includes('expired') || refreshError.message?.includes('invalid')) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Invalid or expired refresh token',
            }),
            {
              status: 401,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: false,
            error: 'Token refresh failed',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }
    } catch (error) {
      console.error('Refresh token endpoint error:', error)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error during token refresh',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
  },
}

/**
 * Logout Endpoint
 * 
 * Handles user logout by invalidating the current session/token.
 */
export const logoutEndpoint: Endpoint = {
  path: '/auth/logout',
  method: 'post',
  handler: async (req) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Not authenticated',
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      try {
        // Use Payload's built-in logout functionality
        await req.payload.logout({
          collection: 'users',
          req,
        })

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Logged out successfully',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      } catch (logoutError) {
        console.error('Logout error:', logoutError)
        
        // Even if logout fails, we can still return success
        // as the client will clear local tokens
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Logged out successfully',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }
    } catch (error) {
      console.error('Logout endpoint error:', error)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error during logout',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
  },
}