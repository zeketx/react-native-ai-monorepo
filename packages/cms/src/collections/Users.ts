import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Organizer',
          value: 'organizer',
        },
        {
          label: 'Client',
          value: 'client',
        },
      ],
      defaultValue: 'client',
      required: true,
    },
  ],
}