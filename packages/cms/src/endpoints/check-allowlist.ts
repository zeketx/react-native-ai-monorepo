import type { Endpoint } from 'payload'

/**
 * Check Allowlist Endpoint
 * 
 * Validates if an email address is allowed to register for the platform.
 * This endpoint checks against an allowlist collection or configuration
 * to determine if a user can create an account.
 */
export const checkAllowlistEndpoint: Endpoint = {
  path: '/auth/check-allowlist',
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

      // Check if email is in allowlist
      // For now, we'll implement a simple domain-based allowlist
      // This can be enhanced later with a proper allowlist collection
      const allowedDomains = [
        'gmail.com',
        'outlook.com',
        'hotmail.com',
        'yahoo.com',
        'icloud.com',
        'protonmail.com',
        'example.com', // For testing
      ]

      const emailDomain = email.toLowerCase().split('@')[1]
      const isAllowed = allowedDomains.includes(emailDomain)

      if (!isAllowed) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Email domain not authorized for registration. Please contact support.',
            allowed: false,
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Check if user already exists
      const existingUser = await req.payload.find({
        collection: 'users',
        where: {
          email: {
            equals: email.toLowerCase(),
          },
        },
        limit: 1,
      })

      if (existingUser.docs.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'An account with this email address already exists',
            allowed: false,
          }),
          {
            status: 409,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Email is allowed and doesn't exist
      return new Response(
        JSON.stringify({
          success: true,
          allowed: true,
          message: 'Email is authorized for registration',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (error) {
      console.error('Allowlist check error:', error)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error during allowlist check',
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