import type { CollectionConfig } from 'payload'

export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'tier', 'createdAt'],
  },
  access: {
    // Clients can only read their own data
    read: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'organizer') {
        return true
      }
      if (user?.role === 'client') {
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
    // Only admins and organizers can create/update/delete clients
    create: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'organizer'
    },
    update: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'organizer'
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      admin: {
        description: 'Associated user account for this client',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Full name of the client',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'Primary email address',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Primary phone number',
      },
    },
    {
      name: 'dateOfBirth',
      type: 'date',
      admin: {
        description: 'Date of birth for age-restricted activities and travel documents',
      },
    },
    {
      name: 'emergencyContact',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
          admin: {
            description: 'Emergency contact full name',
          },
        },
        {
          name: 'phone',
          type: 'text',
          admin: {
            description: 'Emergency contact phone number',
          },
        },
        {
          name: 'relationship',
          type: 'text',
          admin: {
            description: 'Relationship to client (e.g., spouse, parent, friend)',
          },
        },
      ],
    },
    {
      name: 'tier',
      type: 'select',
      options: [
        {
          label: 'Standard',
          value: 'standard',
        },
        {
          label: 'Premium',
          value: 'premium',
        },
        {
          label: 'Platinum',
          value: 'platinum',
        },
      ],
      defaultValue: 'standard',
      required: true,
      admin: {
        description: 'Client tier determines available services and pricing',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Inactive',
          value: 'inactive',
        },
        {
          label: 'Pending',
          value: 'pending',
        },
      ],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'preferences',
      type: 'group',
      fields: [
        {
          name: 'flightPreferences',
          type: 'relationship',
          relationTo: 'flight-preferences',
          hasMany: false,
        },
        {
          name: 'hotelPreferences',
          type: 'relationship',
          relationTo: 'hotel-preferences',
          hasMany: false,
        },
        {
          name: 'activityPreferences',
          type: 'relationship',
          relationTo: 'activity-preferences',
          hasMany: false,
        },
        {
          name: 'diningPreferences',
          type: 'relationship',
          relationTo: 'dining-preferences',
          hasMany: false,
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about the client (not visible to client)',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Set status to active when a client completes onboarding
        if (operation === 'update' && data.preferences?.flightPreferences) {
          data.status = 'active'
        }
        return data
      },
    ],
  },
}