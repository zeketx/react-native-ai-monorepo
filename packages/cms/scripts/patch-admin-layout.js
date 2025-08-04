#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const layoutPath = path.join(__dirname, '../src/app/(payload)/admin/[[...segments]]/layout.tsx');

const patchedContent = `/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'
import type { ServerFunctionClient } from 'payload'

import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import React from 'react'

import config from '@payload-config'

import './custom.scss'

type Args = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'ClientSync CMS',
  description: 'Travel platform content management system',
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout`;

try {
  fs.writeFileSync(layoutPath, patchedContent);
  console.log('✅ Admin layout patched successfully');
} catch (error) {
  console.error('❌ Failed to patch admin layout:', error);
  process.exit(1);
}