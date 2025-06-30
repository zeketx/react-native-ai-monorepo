import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'updatedAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      // Admins and organizers can see all media
      if (user?.role === 'admin' || user?.role === 'organizer') {
        return true
      }
      // Clients can only see media they uploaded or that's associated with their trips
      if (user?.role === 'client') {
        return {
          or: [
            {
              uploadedBy: {
                equals: user.id,
              },
            },
            // TODO: Add relationship filter for trip-related media
          ],
        }
      }
      return false
    },
    create: ({ req: { user } }) => {
      return !!user // Any authenticated user can upload media
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'organizer') {
        return true
      }
      if (user?.role === 'client') {
        return {
          uploadedBy: {
            equals: user.id,
          },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => {
      if (user?.role === 'admin') {
        return true
      }
      if (user?.role === 'organizer' || user?.role === 'client') {
        return {
          uploadedBy: {
            equals: user.id,
          },
        }
      }
      return false
    },
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Alt text for accessibility (required for images)',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: {
        description: 'Optional caption or description',
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        description: 'User who uploaded this file',
      },
    },
    {
      name: 'relatedTo',
      type: 'group',
      fields: [
        {
          name: 'trip',
          type: 'relationship',
          relationTo: 'trips',
          admin: {
            description: 'Trip this media is associated with',
          },
        },
        {
          name: 'client',
          type: 'relationship',
          relationTo: 'clients',
          admin: {
            description: 'Client this media is associated with',
          },
        },
      ],
    },
    {
      name: 'category',
      type: 'select',
      options: [
        {
          label: 'Trip Photo',
          value: 'trip-photo',
        },
        {
          label: 'Document',
          value: 'document',
        },
        {
          label: 'Passport/ID',
          value: 'passport',
        },
        {
          label: 'Visa',
          value: 'visa',
        },
        {
          label: 'Insurance',
          value: 'insurance',
        },
        {
          label: 'Boarding Pass',
          value: 'boarding-pass',
        },
        {
          label: 'Hotel Confirmation',
          value: 'hotel-confirmation',
        },
        {
          label: 'Activity Voucher',
          value: 'voucher',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
      admin: {
        description: 'Category of media for organization',
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this media can be viewed publicly (for trip galleries, etc.)',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
      admin: {
        description: 'Tags for organizing and searching media',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // Automatically set uploadedBy to current user
        if (req.user) {
          data.uploadedBy = req.user.id
        }
        return data
      },
    ],
  },
}