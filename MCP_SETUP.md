# MCP (Model Context Protocol) Setup Guide

## Overview
This project uses MCP to integrate with Supabase for enhanced database operations and management.

## Setup Instructions

### 1. Copy Configuration
```bash
cp .mcp.json.example .mcp.json
```

### 2. Update Configuration
Edit `.mcp.json` and replace:
- `<your-project-ref>` with your Supabase project reference ID
- Update the `envFile` path if needed (default: `.env.supabase`)

### 3. Environment Variables
Ensure your `.env.supabase` file contains:
```
SUPABASE_ACCESS_TOKEN=your_service_role_key_here
```

### 4. Security Notes
- **NEVER** commit `.mcp.json` to version control
- **NEVER** share your service role key
- The `.mcp.json` file is already in `.gitignore`
- Use `.mcp.json.example` as a template for team members

## Available MCP Commands
Once configured, the Supabase MCP server provides:
- Database query capabilities
- Table management
- User authentication management
- Real-time subscription handling

## Troubleshooting
- Ensure you have the latest `@supabase/mcp-server-supabase` package
- Verify your project reference ID is correct
- Check that your service role key has proper permissions