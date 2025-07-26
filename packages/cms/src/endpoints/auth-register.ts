import type { Endpoint } from 'payload'

/**
 * User Registration Endpoint
 * 
 * Handles user registration with allowlist validation.
 * This endpoint creates new user accounts after checking allowlist status.
 */
export const registerEndpoint: Endpoint = {
  path: '/auth/register',
  method: 'post',
  handler: async (req) => {
    try {
      const { email, password, passwordConfirm, firstName, lastName } = req.body

      // Validate required fields
      if (!email || !password || !passwordConfirm || !firstName || !lastName) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'All fields are required: email, password, passwordConfirm, firstName, lastName',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Validate password confirmation
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

      // Check allowlist (similar logic to check-allowlist endpoint)
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
      const existingUsers = await req.payload.find({
        collection: 'users',
        where: {
          email: {
            equals: email.toLowerCase(),
          },
        },
        limit: 1,
      })

      if (existingUsers.docs.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'An account with this email address already exists',
          }),
          {
            status: 409,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Create new user
      const newUser = await req.payload.create({
        collection: 'users',
        data: {
          email: email.toLowerCase(),
          password,
          firstName,
          lastName,
          role: 'client', // Default role
          status: 'active',
        },
      })

      // Remove sensitive information before returning
      const { password: pwd, salt, resetPasswordToken, resetPasswordExpiration, ...safeUser } = newUser

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Account created successfully',
          user: safeUser,
        }),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (error) {
      console.error('Registration error:', error)
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Validation failed',
            details: error.data || error.message,
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error during registration',
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