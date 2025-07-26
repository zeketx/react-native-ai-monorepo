import type { Endpoint } from 'payload'

/**
 * Email Verification Endpoint
 * 
 * Handles email verification for newly registered users.
 * This endpoint verifies email addresses using tokens sent via email.
 */
export const verifyEmailEndpoint: Endpoint = {
  path: '/auth/verify-email',
  method: 'post',
  handler: async (req) => {
    try {
      const { token } = req.body

      if (!token) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Verification token is required',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Use Payload's built-in email verification functionality
      try {
        const result = await req.payload.verifyEmail({
          collection: 'users',
          token,
        })

        if (result) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Email verified successfully',
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
              error: 'Invalid or expired verification token',
            }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )
        }
      } catch (verifyError) {
        console.error('Email verification error:', verifyError)
        
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid or expired verification token',
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
      console.error('Email verification endpoint error:', error)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error during email verification',
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
 * Resend Verification Email Endpoint
 * 
 * Resends verification email for users who haven't verified their email.
 */
export const resendVerificationEndpoint: Endpoint = {
  path: '/auth/resend-verification',
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

      // Always return success to prevent email enumeration
      const baseResponse = {
        success: true,
        message: 'If an account with this email exists and is unverified, a verification email has been sent.',
      }

      if (users.docs.length === 0) {
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

      // Check if user is already verified
      if (user.emailVerified) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Email address is already verified',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Resend verification email using Payload's functionality
      try {
        await req.payload.sendEmail({
          to: user.email,
          subject: 'Verify your email address',
          html: `<p>Please click the link below to verify your email address:</p>
                 <a href="${process.env.EXPO_PUBLIC_PAYLOAD_URL}/verify-email?token=${user.emailVerificationToken}">Verify Email</a>`,
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
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        
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
      console.error('Resend verification endpoint error:', error)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error during verification email resend',
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