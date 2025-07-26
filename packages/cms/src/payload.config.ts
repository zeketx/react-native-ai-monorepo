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

import { checkAllowlistEndpoint } from './endpoints/check-allowlist'
import { passwordResetEndpoint, passwordResetConfirmEndpoint } from './endpoints/password-reset'
import { getUserMeEndpoint, updateUserMeEndpoint } from './endpoints/user-me'
import { registerEndpoint } from './endpoints/auth-register'
import { verifyEmailEndpoint, resendVerificationEndpoint } from './endpoints/auth-verify'
import { refreshTokenEndpoint, logoutEndpoint } from './endpoints/auth-refresh'
import { getUserPreferencesEndpoint, updateUserPreferencesEndpoint } from './endpoints/user-preferences'
import { getUserTripsEndpoint, searchUsersEndpoint, getUserByIdEndpoint } from './endpoints/user-trips'
import { 
  getTripsEndpoint, 
  getTripByIdEndpoint, 
  createTripEndpoint, 
  updateTripEndpoint, 
  deleteTripEndpoint, 
  updateTripStatusEndpoint 
} from './endpoints/trips-crud'

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
  endpoints: [
    checkAllowlistEndpoint,
    passwordResetEndpoint,
    passwordResetConfirmEndpoint,
    getUserMeEndpoint,
    updateUserMeEndpoint,
    registerEndpoint,
    verifyEmailEndpoint,
    resendVerificationEndpoint,
    refreshTokenEndpoint,
    logoutEndpoint,
    getUserPreferencesEndpoint,
    updateUserPreferencesEndpoint,
    getUserTripsEndpoint,
    searchUsersEndpoint,
    getUserByIdEndpoint,
    getTripsEndpoint,
    getTripByIdEndpoint,
    createTripEndpoint,
    updateTripEndpoint,
    deleteTripEndpoint,
    updateTripStatusEndpoint,
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