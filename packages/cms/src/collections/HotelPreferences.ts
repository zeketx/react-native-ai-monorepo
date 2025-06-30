import type { CollectionConfig } from 'payload'

export const HotelPreferences: CollectionConfig = {
  slug: 'hotel-preferences',
  admin: {
    useAsTitle: 'client',
    defaultColumns: ['client', 'category', 'roomType', 'updatedAt'],
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
      name: 'category',
      type: 'select',
      options: [
        {
          label: 'Budget (1-2 stars)',
          value: 'budget',
        },
        {
          label: 'Standard (3 stars)',
          value: 'standard',
        },
        {
          label: 'Premium (4 stars)',
          value: 'premium',
        },
        {
          label: 'Luxury (5 stars)',
          value: 'luxury',
        },
        {
          label: 'Ultra-Luxury',
          value: 'ultra-luxury',
        },
      ],
      defaultValue: 'standard',
      required: true,
      admin: {
        description: 'Preferred hotel category (may be limited by client tier)',
      },
    },
    {
      name: 'hotelChains',
      type: 'group',
      fields: [
        {
          name: 'preferred',
          type: 'array',
          fields: [
            {
              name: 'chain',
              type: 'text',
              required: true,
              admin: {
                description: 'Hotel chain name (e.g., "Marriott", "Hilton")',
              },
            },
            {
              name: 'loyaltyNumber',
              type: 'text',
              admin: {
                description: 'Loyalty program membership number',
              },
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
          name: 'avoided',
          type: 'array',
          fields: [
            {
              name: 'chain',
              type: 'text',
              required: true,
            },
            {
              name: 'reason',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'roomType',
      type: 'select',
      options: [
        {
          label: 'Standard Room',
          value: 'standard',
        },
        {
          label: 'Deluxe Room',
          value: 'deluxe',
        },
        {
          label: 'Suite',
          value: 'suite',
        },
        {
          label: 'Executive Suite',
          value: 'executive-suite',
        },
        {
          label: 'Presidential Suite',
          value: 'presidential-suite',
        },
      ],
      defaultValue: 'standard',
      required: true,
    },
    {
      name: 'bedPreference',
      type: 'select',
      options: [
        {
          label: 'Single/Twin Bed',
          value: 'single',
        },
        {
          label: 'Double Bed',
          value: 'double',
        },
        {
          label: 'Queen Bed',
          value: 'queen',
        },
        {
          label: 'King Bed',
          value: 'king',
        },
        {
          label: 'Two Double Beds',
          value: 'two-double',
        },
        {
          label: 'No Preference',
          value: 'no-preference',
        },
      ],
      defaultValue: 'no-preference',
    },
    {
      name: 'roomFeatures',
      type: 'array',
      fields: [
        {
          name: 'feature',
          type: 'select',
          options: [
            { label: 'Ocean View', value: 'ocean-view' },
            { label: 'City View', value: 'city-view' },
            { label: 'High Floor', value: 'high-floor' },
            { label: 'Low Floor', value: 'low-floor' },
            { label: 'Balcony', value: 'balcony' },
            { label: 'Kitchenette', value: 'kitchenette' },
            { label: 'Living Area', value: 'living-area' },
            { label: 'Work Desk', value: 'work-desk' },
            { label: 'Bathtub', value: 'bathtub' },
            { label: 'Walk-in Shower', value: 'walk-in-shower' },
            { label: 'Non-smoking', value: 'non-smoking' },
            { label: 'Smoking Allowed', value: 'smoking' },
            { label: 'Pet Friendly', value: 'pet-friendly' },
            { label: 'Accessible Room', value: 'accessible' },
          ],
        },
        {
          name: 'priority',
          type: 'select',
          options: [
            { label: 'Must Have', value: 'must-have' },
            { label: 'Preferred', value: 'preferred' },
            { label: 'Nice to Have', value: 'nice-to-have' },
          ],
          defaultValue: 'preferred',
        },
      ],
    },
    {
      name: 'hotelAmenities',
      type: 'array',
      fields: [
        {
          name: 'amenity',
          type: 'select',
          options: [
            { label: 'Swimming Pool', value: 'pool' },
            { label: 'Fitness Center', value: 'gym' },
            { label: 'Spa Services', value: 'spa' },
            { label: 'Business Center', value: 'business-center' },
            { label: 'Conference Rooms', value: 'conference' },
            { label: 'Restaurant', value: 'restaurant' },
            { label: 'Room Service', value: 'room-service' },
            { label: 'Laundry Service', value: 'laundry' },
            { label: 'Concierge Service', value: 'concierge' },
            { label: 'Valet Parking', value: 'valet' },
            { label: 'Free Parking', value: 'free-parking' },
            { label: 'Airport Shuttle', value: 'airport-shuttle' },
            { label: 'Free WiFi', value: 'wifi' },
            { label: 'Pet Services', value: 'pet-services' },
          ],
        },
        {
          name: 'importance',
          type: 'select',
          options: [
            { label: 'Essential', value: 'essential' },
            { label: 'Important', value: 'important' },
            { label: 'Nice to Have', value: 'nice-to-have' },
          ],
          defaultValue: 'nice-to-have',
        },
      ],
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'preferred',
          type: 'select',
          options: [
            { label: 'City Center', value: 'city-center' },
            { label: 'Business District', value: 'business-district' },
            { label: 'Tourist Area', value: 'tourist-area' },
            { label: 'Near Airport', value: 'airport' },
            { label: 'Beach/Waterfront', value: 'beach' },
            { label: 'Quiet/Residential', value: 'quiet' },
            { label: 'Shopping District', value: 'shopping' },
            { label: 'Entertainment District', value: 'entertainment' },
          ],
        },
        {
          name: 'proximityRequirements',
          type: 'array',
          fields: [
            {
              name: 'landmark',
              type: 'text',
              admin: {
                description: 'Specific location, landmark, or address',
              },
            },
            {
              name: 'maxDistance',
              type: 'number',
              admin: {
                description: 'Maximum distance in kilometers',
              },
            },
            {
              name: 'transportation',
              type: 'select',
              options: [
                { label: 'Walking Distance', value: 'walking' },
                { label: 'Public Transport', value: 'public' },
                { label: 'Taxi/Rideshare', value: 'taxi' },
                { label: 'Any', value: 'any' },
              ],
              defaultValue: 'any',
            },
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
            { label: 'Early Check-in', value: 'early-checkin' },
            { label: 'Late Check-out', value: 'late-checkout' },
            { label: 'Welcome Amenities', value: 'welcome-amenities' },
            { label: 'Extra Pillows/Blankets', value: 'extra-bedding' },
            { label: 'Connecting Rooms', value: 'connecting-rooms' },
            { label: 'Quiet Room', value: 'quiet-room' },
            { label: 'Room Upgrade', value: 'upgrade' },
            { label: 'Special Occasion', value: 'special-occasion' },
            { label: 'Accessibility Needs', value: 'accessibility' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'details',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'budgetRange',
      type: 'group',
      fields: [
        {
          name: 'minPerNight',
          type: 'number',
          admin: {
            description: 'Minimum acceptable price per night (USD)',
          },
        },
        {
          name: 'maxPerNight',
          type: 'number',
          admin: {
            description: 'Maximum budget per night (USD)',
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
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional hotel preferences or requirements',
      },
    },
  ],
}