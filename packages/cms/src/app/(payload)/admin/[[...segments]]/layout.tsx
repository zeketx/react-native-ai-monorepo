/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'

import { RootLayout } from '@payloadcms/next/layouts'

import config from '@payload-config'

import './custom.scss'

type Args = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'ClientSync CMS',
  description: 'Travel platform content management system',
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config}>{children}</RootLayout>
)

export default Layout