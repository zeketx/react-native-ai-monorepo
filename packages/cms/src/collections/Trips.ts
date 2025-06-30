import type { CollectionConfig } from 'payload'

export const Trips: CollectionConfig = {
  slug: 'trips',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'status', 'startDate', 'endDate'],
  },
  access: {
    // Clients can only see their own trips
    read: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'organizer') {
        return true
      }
      if (user?.role === 'client') {
        return {
          client: {
            equals: user.id,
          },
        }
      }
      return false
    },
    // Only admins and organizers can create/update trips
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
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Trip title (e.g., "Paris Business Trip", "Tokyo Vacation")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Detailed description of the trip',
      },
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      required: true,
      admin: {
        description: 'Client this trip belongs to',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Trip start date',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Trip end date',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Planning',
          value: 'planning',
        },
        {
          label: 'Confirmed',
          value: 'confirmed',
        },
        {
          label: 'In Progress',
          value: 'in-progress',
        },
        {
          label: 'Completed',
          value: 'completed',
        },
        {
          label: 'Cancelled',
          value: 'cancelled',
        },
      ],
      defaultValue: 'planning',
      required: true,
    },
    {
      name: 'destination',
      type: 'group',
      fields: [
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'country',
          type: 'text',
          required: true,
        },
        {
          name: 'airport',
          type: 'text',
          admin: {
            description: 'Primary destination airport code',
          },
        },
      ],
    },
    {
      name: 'budget',
      type: 'group',
      fields: [
        {
          name: 'total',
          type: 'number',
          admin: {
            description: 'Total trip budget in USD',
          },
        },
        {
          name: 'currency',
          type: 'select',
          options: [
            { label: 'USD', value: 'USD' },
            { label: 'EUR', value: 'EUR' },
            { label: 'GBP', value: 'GBP' },
            { label: 'JPY', value: 'JPY' },
          ],
          defaultValue: 'USD',
        },
      ],
    },
    {
      name: 'travelers',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'dateOfBirth',
          type: 'date',
        },
        {
          name: 'relationship',
          type: 'select',
          options: [
            { label: 'Self', value: 'self' },
            { label: 'Spouse', value: 'spouse' },
            { label: 'Child', value: 'child' },
            { label: 'Parent', value: 'parent' },
            { label: 'Sibling', value: 'sibling' },
            { label: 'Friend', value: 'friend' },
            { label: 'Colleague', value: 'colleague' },
            { label: 'Other', value: 'other' },
          ],
          defaultValue: 'self',
        },
      ],
      admin: {
        description: 'List of all travelers on this trip',
      },
    },
    {
      name: 'itinerary',
      type: 'group',
      fields: [
        {
          name: 'flightDetails',
          type: 'textarea',
          admin: {
            description: 'Flight booking details and information',
          },
        },
        {
          name: 'hotelDetails',
          type: 'textarea',
          admin: {
            description: 'Hotel booking details and information',
          },
        },
        {
          name: 'activityDetails',
          type: 'textarea',
          admin: {
            description: 'Activity bookings and details',
          },
        },
        {
          name: 'diningDetails',
          type: 'textarea',
          admin: {
            description: 'Restaurant reservations and dining details',
          },
        },
        {
          name: 'transportationDetails',
          type: 'textarea',
          admin: {
            description: 'Ground transportation and transfer details',
          },
        },
      ],
    },
    {
      name: 'documents',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Passport', value: 'passport' },
            { label: 'Visa', value: 'visa' },
            { label: 'Travel Insurance', value: 'insurance' },
            { label: 'Boarding Pass', value: 'boarding-pass' },
            { label: 'Hotel Confirmation', value: 'hotel-confirmation' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'notes',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'specialRequests',
      type: 'textarea',
      admin: {
        description: 'Any special requests or accommodations needed',
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes for organizers (not visible to client)',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Auto-update status based on dates
        if (operation === 'update') {
          const now = new Date()
          const startDate = new Date(data.startDate)
          const endDate = new Date(data.endDate)
          
          if (now >= startDate && now <= endDate && data.status === 'confirmed') {
            data.status = 'in-progress'
          } else if (now > endDate && data.status === 'in-progress') {
            data.status = 'completed'
          }
        }
        return data
      },
    ],
  },
}