import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Clients } from './collections/Clients'
import { Trips } from './collections/Trips'
import { FlightPreferences } from './collections/FlightPreferences'
import { HotelPreferences } from './collections/HotelPreferences'
import { ActivityPreferences } from './collections/ActivityPreferences'
import { DiningPreferences } from './collections/DiningPreferences'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Clients,
    Trips,
    FlightPreferences,
    HotelPreferences,
    ActivityPreferences,
    DiningPreferences,
    Media,
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'YOUR_SECRET_HERE',
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: './data.db',
    },
  }),
  cors: [
    process.env.EXPO_PUBLIC_PAYLOAD_URL || 'http://localhost:3000',
    'http://localhost:19006', // Expo web dev server
    'http://localhost:19007', // Expo dev tools
  ],
  csrf: [
    process.env.EXPO_PUBLIC_PAYLOAD_URL || 'http://localhost:3000',
    'http://localhost:19006',
    'http://localhost:19007',
  ],
})