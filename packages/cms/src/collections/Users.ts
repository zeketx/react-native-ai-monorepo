import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: {
      generateEmailHTML: ({ req, token, user }) => {
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}`
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Welcome to ClientSync!</h1>
            <p>Hello ${user.firstName || 'there'},</p>
            <p>Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${url}</p>
            <p>This link will expire in 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              If you didn't create an account with ClientSync, you can safely ignore this email.
            </p>
          </div>
        `
      },
      generateEmailSubject: () => 'Verify your ClientSync account',
    },
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role', 'createdAt'],
  },
  fields: [
    // Personal Information
    {
      name: 'firstName',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'Enter first name',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'Enter last name',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        placeholder: '+1 (555) 123-4567',
      },
    },
    
    // Account Information
    {
      name: 'role',
      type: 'select',
      options: [
        {
          label: 'Super Admin',
          value: 'super-admin',
        },
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Travel Organizer',
          value: 'organizer',
        },
        {
          label: 'Premium Client',
          value: 'premium-client',
        },
        {
          label: 'Standard Client',
          value: 'client',
        },
      ],
      defaultValue: 'client',
      required: true,
      admin: {
        description: 'User role determines access permissions',
      },
    },
    
    // Profile Information
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Profile picture',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        placeholder: 'Tell us about yourself...',
        rows: 3,
      },
    },
    
    // Preferences
    {
      name: 'preferences',
      type: 'group',
      fields: [
        {
          name: 'notifications',
          type: 'group',
          fields: [
            {
              name: 'email',
              type: 'checkbox',
              defaultValue: true,
              label: 'Email notifications',
            },
            {
              name: 'push',
              type: 'checkbox',
              defaultValue: true,
              label: 'Push notifications',
            },
            {
              name: 'sms',
              type: 'checkbox',
              defaultValue: false,
              label: 'SMS notifications',
            },
          ],
        },
        {
          name: 'privacy',
          type: 'group',
          fields: [
            {
              name: 'profilePublic',
              type: 'checkbox',
              defaultValue: false,
              label: 'Make profile public',
            },
            {
              name: 'shareData',
              type: 'checkbox',
              defaultValue: false,
              label: 'Share data for analytics',
            },
          ],
        },
      ],
    },
    
    // Mobile App Specific
    {
      name: 'mobileSettings',
      type: 'group',
      fields: [
        {
          name: 'deviceTokens',
          type: 'array',
          fields: [
            {
              name: 'token',
              type: 'text',
              required: true,
            },
            {
              name: 'platform',
              type: 'select',
              options: [
                { label: 'iOS', value: 'ios' },
                { label: 'Android', value: 'android' },
                { label: 'Web', value: 'web' },
              ],
            },
            {
              name: 'active',
              type: 'checkbox',
              defaultValue: true,
            },
          ],
          admin: {
            description: 'Push notification device tokens',
          },
        },
        {
          name: 'lastLoginAt',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
            readOnly: true,
          },
        },
      ],
      admin: {
        condition: (data) => data.role === 'client' || data.role === 'premium-client',
      },
    },
    
    // Status and Metadata
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
      ],
      defaultValue: 'active',
      admin: {
        description: 'Account status',
        condition: (data) => data.role === 'admin' || data.role === 'super-admin',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // Update last login time when user logs in
        if (operation === 'update' && req.user?.id === doc.id) {
          // This runs after a user updates their own profile
          req.payload.logger.info(`User ${doc.email} updated their profile`)
        }
      },
    ],
    beforeChange: [
      async ({ data, req, operation }) => {
        // Set last login time on authentication
        if (operation === 'update' && req.user?.id === data.id) {
          if (data.mobileSettings) {
            data.mobileSettings.lastLoginAt = new Date().toISOString()
          }
        }
        return data
      },
    ],
  },
  access: {
    // Users can read their own profile and admins can read all
    read: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'super-admin') {
        return true
      }
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    // Users can update their own profile and admins can update all
    update: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'super-admin') {
        return true
      }
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    // Only admins can delete users
    delete: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'super-admin'
    },
  },
}