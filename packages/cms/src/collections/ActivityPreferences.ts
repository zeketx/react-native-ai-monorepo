import type { CollectionConfig } from 'payload'

export const ActivityPreferences: CollectionConfig = {
  slug: 'activity-preferences',
  dbName: 'activity_prefs',
  admin: {
    useAsTitle: 'client',
    defaultColumns: ['client', 'activityLevel', 'updatedAt'],
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
      name: 'activityLevel',
      type: 'select',
      options: [
        {
          label: 'Low - Relaxed pace, minimal physical activity',
          value: 'low',
        },
        {
          label: 'Moderate - Some walking and light activities',
          value: 'moderate',
        },
        {
          label: 'High - Active adventures and physical challenges',
          value: 'high',
        },
        {
          label: 'Mixed - Combination of relaxing and active',
          value: 'mixed',
        },
      ],
      defaultValue: 'moderate',
      required: true,
    },
    {
      name: 'interests',
      type: 'array',
      fields: [
        {
          name: 'category',
          type: 'select',
          options: [
            { label: 'Arts & Culture', value: 'arts-culture' },
            { label: 'Museums & Galleries', value: 'museums' },
            { label: 'Historical Sites', value: 'historical' },
            { label: 'Architecture', value: 'architecture' },
            { label: 'Local Markets & Shopping', value: 'shopping' },
            { label: 'Food & Culinary', value: 'culinary' },
            { label: 'Nightlife & Entertainment', value: 'nightlife' },
            { label: 'Music & Concerts', value: 'music' },
            { label: 'Theater & Shows', value: 'theater' },
            { label: 'Sports Events', value: 'sports-events' },
            { label: 'Nature & Parks', value: 'nature' },
            { label: 'Beaches & Water', value: 'beaches' },
            { label: 'Wildlife & Safaris', value: 'wildlife' },
            { label: 'Adventure Sports', value: 'adventure' },
            { label: 'Hiking & Trekking', value: 'hiking' },
            { label: 'Water Sports', value: 'water-sports' },
            { label: 'Photography', value: 'photography' },
            { label: 'Wellness & Spa', value: 'wellness' },
            { label: 'Spiritual & Religious', value: 'spiritual' },
            { label: 'Local Experiences', value: 'local-experiences' },
          ],
        },
        {
          name: 'level',
          type: 'select',
          options: [
            { label: 'Very Interested', value: 'high' },
            { label: 'Somewhat Interested', value: 'medium' },
            { label: 'Casual Interest', value: 'low' },
          ],
          defaultValue: 'medium',
        },
        {
          name: 'notes',
          type: 'text',
          admin: {
            description: 'Specific interests within this category',
          },
        },
      ],
    },
    {
      name: 'activityTypes',
      type: 'group',
      fields: [
        {
          name: 'preferred',
          type: 'array',
          fields: [
            {
              name: 'activity',
              type: 'select',
              options: [
                { label: 'City Tours', value: 'city-tours' },
                { label: 'Food Tours', value: 'food-tours' },
                { label: 'Walking Tours', value: 'walking-tours' },
                { label: 'Bike Tours', value: 'bike-tours' },
                { label: 'Boat Tours', value: 'boat-tours' },
                { label: 'Private Tours', value: 'private-tours' },
                { label: 'Group Tours', value: 'group-tours' },
                { label: 'Self-Guided Exploration', value: 'self-guided' },
                { label: 'Classes & Workshops', value: 'classes' },
                { label: 'Outdoor Adventures', value: 'outdoor' },
                { label: 'Cultural Experiences', value: 'cultural' },
                { label: 'Relaxation Activities', value: 'relaxation' },
              ],
            },
            {
              name: 'priority',
              type: 'number',
              defaultValue: 1,
              admin: {
                description: 'Priority ranking (1 = highest)',
              },
            },
          ],
        },
        {
          name: 'avoided',
          type: 'array',
          fields: [
            {
              name: 'activity',
              type: 'text',
              required: true,
            },
            {
              name: 'reason',
              type: 'text',
              admin: {
                description: 'Reason for avoiding (e.g., health, personal preference)',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'timePreferences',
      type: 'group',
      dbName: 'time_prefs',
      fields: [
        {
          name: 'preferredTimes',
          type: 'array',
          dbName: 'pref_times',
          fields: [
            {
              name: 'timeOfDay',
              type: 'select',
              dbName: 'time_of_day',
              options: [
                { label: 'Early Morning (6-9 AM)', value: 'early-morning' },
                { label: 'Morning (9 AM-12 PM)', value: 'morning' },
                { label: 'Afternoon (12-5 PM)', value: 'afternoon' },
                { label: 'Evening (5-8 PM)', value: 'evening' },
                { label: 'Night (8 PM+)', value: 'night' },
              ],
            },
            {
              name: 'preference',
              type: 'select',
              options: [
                { label: 'Strongly Prefer', value: 'strong' },
                { label: 'Prefer', value: 'prefer' },
                { label: 'Avoid', value: 'avoid' },
              ],
            },
          ],
        },
        {
          name: 'pacePreference',
          type: 'select',
          options: [
            { label: 'Packed Schedule - See everything possible', value: 'packed' },
            { label: 'Moderate Pace - Balanced itinerary', value: 'moderate' },
            { label: 'Relaxed - Plenty of downtime', value: 'relaxed' },
            { label: 'Flexible - Decide day by day', value: 'flexible' },
          ],
          defaultValue: 'moderate',
        },
        {
          name: 'restDays',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Include dedicated rest/free days in longer trips',
          },
        },
      ],
    },
    {
      name: 'accessibility',
      type: 'group',
      dbName: 'access',
      fields: [
        {
          name: 'mobilityRequirements',
          type: 'array',
          dbName: 'mobility_reqs',
          fields: [
            {
              name: 'requirement',
              type: 'select',
              options: [
                { label: 'Wheelchair Accessible', value: 'wheelchair' },
                { label: 'Limited Walking Ability', value: 'limited-walking' },
                { label: 'No Stairs', value: 'no-stairs' },
                { label: 'Elevator Access Required', value: 'elevator' },
                { label: 'Accessible Restrooms', value: 'accessible-restrooms' },
                { label: 'Visual Impairment Support', value: 'visual-support' },
                { label: 'Hearing Impairment Support', value: 'hearing-support' },
              ],
            },
            {
              name: 'details',
              type: 'textarea',
            },
          ],
        },
        {
          name: 'physicalLimitations',
          type: 'textarea',
          admin: {
            description: 'Any physical limitations or health considerations',
          },
        },
      ],
    },
    {
      name: 'budget',
      type: 'group',
      fields: [
        {
          name: 'dailyBudget',
          type: 'number',
          admin: {
            description: 'Preferred daily budget for activities (USD)',
          },
        },
        {
          name: 'splurgeActivities',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Open to occasional high-end/splurge activities',
          },
        },
        {
          name: 'freeActivities',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Include free activities and attractions',
          },
        },
      ],
    },
    {
      name: 'groupPreferences',
      type: 'group',
      fields: [
        {
          name: 'groupSize',
          type: 'select',
          options: [
            { label: 'Solo Activities', value: 'solo' },
            { label: 'Small Groups (2-6 people)', value: 'small' },
            { label: 'Medium Groups (7-15 people)', value: 'medium' },
            { label: 'Large Groups (16+ people)', value: 'large' },
            { label: 'No Preference', value: 'no-preference' },
          ],
          defaultValue: 'no-preference',
        },
        {
          name: 'socialLevel',
          type: 'select',
          options: [
            { label: 'Very Social - Love meeting new people', value: 'high' },
            { label: 'Moderately Social - Some interaction is fine', value: 'medium' },
            { label: 'Prefer Privacy - Minimal interaction', value: 'low' },
          ],
          defaultValue: 'medium',
        },
      ],
    },
    {
      name: 'seasonalConsiderations',
      type: 'array',
      fields: [
        {
          name: 'season',
          type: 'select',
          options: [
            { label: 'Spring', value: 'spring' },
            { label: 'Summer', value: 'summer' },
            { label: 'Fall/Autumn', value: 'fall' },
            { label: 'Winter', value: 'winter' },
          ],
        },
        {
          name: 'preferences',
          type: 'textarea',
          admin: {
            description: 'Specific preferences for this season',
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional activity preferences or requirements',
      },
    },
  ],
}