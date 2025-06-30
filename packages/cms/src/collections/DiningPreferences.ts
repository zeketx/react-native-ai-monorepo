import type { CollectionConfig } from 'payload'

export const DiningPreferences: CollectionConfig = {
  slug: 'dining-preferences',
  admin: {
    useAsTitle: 'client',
    defaultColumns: ['client', 'dietaryRestrictions', 'updatedAt'],
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
      name: 'dietaryRestrictions',
      type: 'array',
      fields: [
        {
          name: 'restriction',
          type: 'select',
          options: [
            { label: 'Vegetarian', value: 'vegetarian' },
            { label: 'Vegan', value: 'vegan' },
            { label: 'Pescatarian', value: 'pescatarian' },
            { label: 'Gluten-Free', value: 'gluten-free' },
            { label: 'Dairy-Free/Lactose Intolerant', value: 'dairy-free' },
            { label: 'Nut Allergy', value: 'nut-allergy' },
            { label: 'Shellfish Allergy', value: 'shellfish-allergy' },
            { label: 'Egg Allergy', value: 'egg-allergy' },
            { label: 'Soy Allergy', value: 'soy-allergy' },
            { label: 'Kosher', value: 'kosher' },
            { label: 'Halal', value: 'halal' },
            { label: 'Low Sodium', value: 'low-sodium' },
            { label: 'Diabetic-Friendly', value: 'diabetic' },
            { label: 'Low Carb/Keto', value: 'low-carb' },
            { label: 'Paleo', value: 'paleo' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'severity',
          type: 'select',
          options: [
            { label: 'Life-threatening Allergy', value: 'severe' },
            { label: 'Strong Intolerance', value: 'moderate' },
            { label: 'Preference/Mild Sensitivity', value: 'mild' },
          ],
          defaultValue: 'mild',
        },
        {
          name: 'details',
          type: 'textarea',
          admin: {
            description: 'Additional details about the restriction or allergy',
          },
        },
      ],
    },
    {
      name: 'cuisinePreferences',
      type: 'group',
      fields: [
        {
          name: 'preferred',
          type: 'array',
          fields: [
            {
              name: 'cuisine',
              type: 'select',
              options: [
                { label: 'Italian', value: 'italian' },
                { label: 'French', value: 'french' },
                { label: 'Chinese', value: 'chinese' },
                { label: 'Japanese', value: 'japanese' },
                { label: 'Thai', value: 'thai' },
                { label: 'Indian', value: 'indian' },
                { label: 'Mexican', value: 'mexican' },
                { label: 'Greek', value: 'greek' },
                { label: 'Spanish', value: 'spanish' },
                { label: 'Korean', value: 'korean' },
                { label: 'Vietnamese', value: 'vietnamese' },
                { label: 'Mediterranean', value: 'mediterranean' },
                { label: 'Middle Eastern', value: 'middle-eastern' },
                { label: 'American', value: 'american' },
                { label: 'British', value: 'british' },
                { label: 'German', value: 'german' },
                { label: 'Scandinavian', value: 'scandinavian' },
                { label: 'African', value: 'african' },
                { label: 'Latin American', value: 'latin-american' },
                { label: 'Fusion', value: 'fusion' },
                { label: 'Local/Regional', value: 'local' },
              ],
            },
            {
              name: 'enthusiasm',
              type: 'select',
              options: [
                { label: 'Love it - Must try', value: 'high' },
                { label: 'Enjoy it - Include when possible', value: 'medium' },
                { label: 'Curious - Open to trying', value: 'low' },
              ],
              defaultValue: 'medium',
            },
          ],
        },
        {
          name: 'disliked',
          type: 'array',
          fields: [
            {
              name: 'cuisine',
              type: 'text',
              required: true,
            },
            {
              name: 'reason',
              type: 'text',
              admin: {
                description: 'Reason for dislike (e.g., too spicy, unfamiliar)',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'diningStyle',
      type: 'group',
      fields: [
        {
          name: 'restaurantTypes',
          type: 'array',
          fields: [
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Fine Dining', value: 'fine-dining' },
                { label: 'Casual Dining', value: 'casual' },
                { label: 'Fast Casual', value: 'fast-casual' },
                { label: 'Food Trucks/Street Food', value: 'street-food' },
                { label: 'Local Favorites', value: 'local-favorites' },
                { label: 'Tourist Restaurants', value: 'tourist' },
                { label: 'Hidden Gems', value: 'hidden-gems' },
                { label: 'Chain Restaurants', value: 'chains' },
                { label: 'Hotel Restaurants', value: 'hotel' },
                { label: 'Rooftop/Scenic Dining', value: 'scenic' },
                { label: 'Historic/Themed Restaurants', value: 'themed' },
              ],
            },
            {
              name: 'preference',
              type: 'select',
              options: [
                { label: 'Love', value: 'love' },
                { label: 'Like', value: 'like' },
                { label: 'Neutral', value: 'neutral' },
                { label: 'Avoid', value: 'avoid' },
              ],
              defaultValue: 'neutral',
            },
          ],
        },
        {
          name: 'adventurousness',
          type: 'select',
          options: [
            { label: 'Very Adventurous - Try anything new', value: 'high' },
            { label: 'Moderately Adventurous - Some new foods', value: 'medium' },
            { label: 'Conservative - Stick to familiar foods', value: 'low' },
          ],
          defaultValue: 'medium',
        },
        {
          name: 'spiceLevel',
          type: 'select',
          options: [
            { label: 'Love Very Spicy Food', value: 'very-spicy' },
            { label: 'Enjoy Moderately Spicy', value: 'medium-spicy' },
            { label: 'Mild Spice Only', value: 'mild' },
            { label: 'No Spice/Heat', value: 'none' },
          ],
          defaultValue: 'mild',
        },
      ],
    },
    {
      name: 'mealPreferences',
      type: 'group',
      fields: [
        {
          name: 'breakfast',
          type: 'group',
          fields: [
            {
              name: 'preference',
              type: 'select',
              options: [
                { label: 'Large Breakfast', value: 'large' },
                { label: 'Continental/Light Breakfast', value: 'light' },
                { label: 'Just Coffee/Tea', value: 'minimal' },
                { label: 'Skip Breakfast', value: 'skip' },
              ],
              defaultValue: 'light',
            },
            {
              name: 'timing',
              type: 'select',
              options: [
                { label: 'Early (6-8 AM)', value: 'early' },
                { label: 'Standard (8-10 AM)', value: 'standard' },
                { label: 'Late (10 AM-12 PM)', value: 'late' },
                { label: 'Flexible', value: 'flexible' },
              ],
              defaultValue: 'standard',
            },
          ],
        },
        {
          name: 'lunch',
          type: 'group',
          fields: [
            {
              name: 'preference',
              type: 'select',
              options: [
                { label: 'Full Meal', value: 'full' },
                { label: 'Light Meal', value: 'light' },
                { label: 'Snacks Only', value: 'snacks' },
                { label: 'Skip Lunch', value: 'skip' },
              ],
              defaultValue: 'light',
            },
            {
              name: 'timing',
              type: 'select',
              options: [
                { label: 'Early (11 AM-1 PM)', value: 'early' },
                { label: 'Standard (1-3 PM)', value: 'standard' },
                { label: 'Late (3-5 PM)', value: 'late' },
                { label: 'Flexible', value: 'flexible' },
              ],
              defaultValue: 'standard',
            },
          ],
        },
        {
          name: 'dinner',
          type: 'group',
          fields: [
            {
              name: 'preference',
              type: 'select',
              options: [
                { label: 'Multi-course Dinner', value: 'multi-course' },
                { label: 'Standard Dinner', value: 'standard' },
                { label: 'Light Dinner', value: 'light' },
                { label: 'Early Dinner', value: 'early' },
              ],
              defaultValue: 'standard',
            },
            {
              name: 'timing',
              type: 'select',
              options: [
                { label: 'Early (5-7 PM)', value: 'early' },
                { label: 'Standard (7-9 PM)', value: 'standard' },
                { label: 'Late (9-11 PM)', value: 'late' },
                { label: 'Very Late (11 PM+)', value: 'very-late' },
              ],
              defaultValue: 'standard',
            },
          ],
        },
      ],
    },
    {
      name: 'specialOccasions',
      type: 'group',
      fields: [
        {
          name: 'celebrationMeals',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Include special celebration meals (birthdays, anniversaries, etc.)',
          },
        },
        {
          name: 'cookingExperiences',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Interest in cooking classes or food tours',
          },
        },
        {
          name: 'wineOrBeveragePairings',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Interest in wine tastings or beverage pairings',
          },
        },
      ],
    },
    {
      name: 'budgetRange',
      type: 'group',
      fields: [
        {
          name: 'dailyBudget',
          type: 'number',
          admin: {
            description: 'Preferred daily food budget (USD)',
          },
        },
        {
          name: 'splurgeMeals',
          type: 'number',
          admin: {
            description: 'Number of high-end/splurge meals per trip',
          },
        },
        {
          name: 'budgetMeals',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Include budget-friendly options',
          },
        },
      ],
    },
    {
      name: 'beveragePreferences',
      type: 'group',
      fields: [
        {
          name: 'alcohol',
          type: 'select',
          options: [
            { label: 'Enjoy All Types', value: 'all' },
            { label: 'Wine Only', value: 'wine-only' },
            { label: 'Beer Only', value: 'beer-only' },
            { label: 'Spirits Only', value: 'spirits-only' },
            { label: 'Occasional/Social Drinking', value: 'occasional' },
            { label: 'No Alcohol', value: 'none' },
          ],
          defaultValue: 'occasional',
        },
        {
          name: 'coffee',
          type: 'select',
          options: [
            { label: 'Coffee Enthusiast', value: 'enthusiast' },
            { label: 'Regular Coffee Drinker', value: 'regular' },
            { label: 'Occasional', value: 'occasional' },
            { label: 'Tea Preferred', value: 'tea' },
            { label: 'Neither', value: 'neither' },
          ],
          defaultValue: 'regular',
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional dining preferences, allergies, or requirements',
      },
    },
  ],
}