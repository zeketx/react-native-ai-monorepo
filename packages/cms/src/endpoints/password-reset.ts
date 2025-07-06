import type { Endpoint } from 'payload'

/**
 * Password Reset Request Endpoint
 * 
 * Handles password reset requests by sending a reset email to the user.
 * This endpoint validates the email and triggers the password reset flow.
 */
export const passwordResetEndpoint: Endpoint = {
  path: '/auth/forgot-password',
  method: 'post',
  handler: async (req) => {
    try {
      const { email } = req.body

      if (!email) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Email address is required',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid email format',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Find user by email
      const users = await req.payload.find({
        collection: 'users',
        where: {
          email: {
            equals: email.toLowerCase(),
          },
        },
        limit: 1,
      })

      // Always return success to prevent email enumeration attacks
      // This is a security best practice - don't reveal if email exists
      const baseResponse = {
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      }

      if (users.docs.length === 0) {
        // User doesn't exist, but we still return success
        return new Response(
          JSON.stringify(baseResponse),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      const user = users.docs[0]

      // Check if user account is active
      if (user.status === 'suspended' || user.status === 'inactive') {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Account is not active. Please contact support.',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Use Payload's built-in forgot password functionality
      try {
        await req.payload.forgotPassword({
          collection: 'users',
          data: {
            email: email.toLowerCase(),
          },
        })

        return new Response(
          JSON.stringify(baseResponse),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      } catch (forgotPasswordError) {
        console.error('Forgot password error:', forgotPasswordError)
        
        // Still return success to prevent information disclosure
        return new Response(
          JSON.stringify(baseResponse),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }
    } catch (error) {
      console.error('Password reset endpoint error:', error)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error during password reset',
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
 * Password Reset Confirmation Endpoint
 * 
 * Handles the actual password reset with the token from the email.
 */
export const passwordResetConfirmEndpoint: Endpoint = {
  path: '/auth/reset-password',
  method: 'post',
  handler: async (req) => {
    try {
      const { token, password, passwordConfirm } = req.body

      if (!token || !password || !passwordConfirm) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Token, password, and password confirmation are required',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      if (password !== passwordConfirm) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Passwords do not match',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Validate password strength
      if (password.length < 8) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Password must be at least 8 characters long',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Use Payload's built-in reset password functionality
      try {
        const result = await req.payload.resetPassword({
          collection: 'users',
          data: {
            token,
            password,
          },
        })

        if (result) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Password has been successfully reset',
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
              error: 'Invalid or expired reset token',
            }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )
        }
      } catch (resetError) {
        console.error('Password reset confirmation error:', resetError)
        
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid or expired reset token',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }
    } catch (error) {
      console.error('Password reset confirmation endpoint error:', error)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error during password reset',
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