import type { CollectionConfig } from 'payload'

export const FlightPreferences: CollectionConfig = {
  slug: 'flight-preferences',
  dbName: 'flight_prefs',
  admin: {
    useAsTitle: 'client',
    defaultColumns: ['client', 'class', 'seatPreference', 'updatedAt'],
  },
  access: {
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
    create: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'organizer' || user?.role === 'client'
    },
    update: ({ req: { user } }) => {
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
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      required: true,
      unique: true,
      admin: {
        description: 'Client these preferences belong to',
      },
    },
    {
      name: 'class',
      type: 'select',
      options: [
        {
          label: 'Economy',
          value: 'economy',
        },
        {
          label: 'Premium Economy',
          value: 'premium-economy',
        },
        {
          label: 'Business',
          value: 'business',
        },
        {
          label: 'First Class',
          value: 'first',
        },
      ],
      defaultValue: 'economy',
      required: true,
      admin: {
        description: 'Preferred flight class (may be limited by client tier)',
      },
    },
    {
      name: 'seatPreference',
      type: 'select',
      options: [
        {
          label: 'Window',
          value: 'window',
        },
        {
          label: 'Aisle',
          value: 'aisle',
        },
        {
          label: 'Middle (if needed)',
          value: 'middle',
        },
        {
          label: 'No Preference',
          value: 'no-preference',
        },
      ],
      defaultValue: 'no-preference',
    },
    {
      name: 'seatLocation',
      type: 'select',
      options: [
        {
          label: 'Front of Plane',
          value: 'front',
        },
        {
          label: 'Middle of Plane',
          value: 'middle',
        },
        {
          label: 'Back of Plane',
          value: 'back',
        },
        {
          label: 'Near Exit Row',
          value: 'exit-row',
        },
        {
          label: 'No Preference',
          value: 'no-preference',
        },
      ],
      defaultValue: 'no-preference',
    },
    {
      name: 'preferredAirlines',
      type: 'array',
      fields: [
        {
          name: 'airline',
          type: 'text',
          required: true,
          admin: {
            description: 'Airline name or code (e.g., "Delta", "DL")',
          },
        },
        {
          name: 'priority',
          type: 'number',
          defaultValue: 1,
          admin: {
            description: 'Priority ranking (1 = highest preference)',
          },
        },
      ],
      admin: {
        description: 'Preferred airlines in order of preference',
      },
    },
    {
      name: 'avoidedAirlines',
      type: 'array',
      fields: [
        {
          name: 'airline',
          type: 'text',
          required: true,
        },
        {
          name: 'reason',
          type: 'text',
          admin: {
            description: 'Optional reason for avoiding this airline',
          },
        },
      ],
    },
    {
      name: 'mealPreference',
      type: 'select',
      options: [
        {
          label: 'Standard Meal',
          value: 'standard',
        },
        {
          label: 'Vegetarian',
          value: 'vegetarian',
        },
        {
          label: 'Vegan',
          value: 'vegan',
        },
        {
          label: 'Kosher',
          value: 'kosher',
        },
        {
          label: 'Halal',
          value: 'halal',
        },
        {
          label: 'Gluten-Free',
          value: 'gluten-free',
        },
        {
          label: 'Low Sodium',
          value: 'low-sodium',
        },
        {
          label: 'Diabetic',
          value: 'diabetic',
        },
        {
          label: 'No Meal',
          value: 'no-meal',
        },
      ],
      defaultValue: 'standard',
    },
    {
      name: 'loyaltyPrograms',
      type: 'array',
      fields: [
        {
          name: 'airline',
          type: 'text',
          required: true,
        },
        {
          name: 'membershipNumber',
          type: 'text',
          required: true,
        },
        {
          name: 'tier',
          type: 'select',
          options: [
            { label: 'Basic', value: 'basic' },
            { label: 'Silver', value: 'silver' },
            { label: 'Gold', value: 'gold' },
            { label: 'Platinum', value: 'platinum' },
            { label: 'Diamond', value: 'diamond' },
          ],
        },
      ],
    },
    {
      name: 'specialRequests',
      type: 'array',
      fields: [
        {
          name: 'request',
          type: 'select',
          options: [
            { label: 'Wheelchair Assistance', value: 'wheelchair' },
            { label: 'Extra Legroom', value: 'extra-legroom' },
            { label: 'Pet Travel', value: 'pet' },
            { label: 'Unaccompanied Minor', value: 'minor' },
            { label: 'Medical Equipment', value: 'medical' },
            { label: 'Fragile Items', value: 'fragile' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'details',
          type: 'textarea',
          admin: {
            description: 'Additional details about the special request',
          },
        },
      ],
    },
    {
      name: 'travelTimes',
      type: 'group',
      fields: [
        {
          name: 'preferredDepartureTime',
          type: 'select',
          options: [
            { label: 'Early Morning (6-9 AM)', value: 'early-morning' },
            { label: 'Morning (9 AM-12 PM)', value: 'morning' },
            { label: 'Afternoon (12-6 PM)', value: 'afternoon' },
            { label: 'Evening (6-9 PM)', value: 'evening' },
            { label: 'Night (9 PM-6 AM)', value: 'night' },
            { label: 'No Preference', value: 'no-preference' },
          ],
          defaultValue: 'no-preference',
        },
        {
          name: 'maxLayoverDuration',
          type: 'number',
          admin: {
            description: 'Maximum acceptable layover duration in hours',
          },
        },
        {
          name: 'directFlightsOnly',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Prefer direct flights when possible',
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional flight preferences or requirements',
      },
    },
  ],
}