# 🚀 ClientSync Startup Guide

Quick guide to get both CMS and mobile app running with basic authentication.

## ✅ Prerequisites

- Node.js 20+
- PNPM 8+
- Environment files configured

## 🏃‍♂️ Quick Start (5 minutes)

### 1. Start Payload CMS (Backend)
```bash
# From root directory
pnpm dev:cms
```

**Expected Result**: 
- CMS runs on http://localhost:3001
- Opens admin panel in browser
- Creates SQLite database (`packages/cms/data.db`)

### 2. Create Admin User
1. Open http://localhost:3001/admin
2. Fill in admin user form:
   - Email: `admin@clientsync.com`
   - Password: `admin123!`
3. Click "Create First User"

### 3. Start Mobile App (Frontend)
```bash
# In new terminal
pnpm dev:mobile
```

**Expected Result**:
- Expo dev server starts
- QR code appears for device testing
- Web version available at http://localhost:19006

## 🧪 Testing the Connection

### Verify CMS is Working:
```bash
# Quick CMS backend test
pnpm test:cms

# Or manual curl tests
curl http://localhost:3001/api/health
curl http://localhost:3001/api/users
```

### Test Mobile App Integration:
```bash
# Run connection test (after fixing TypeScript)
cd packages/mobile-app
node src/test-payload-connection.ts

# Or check TypeScript compilation
pnpm --filter mobile-app tsc:check
```

## 📱 Mobile App Testing

1. **Open in Browser**: Navigate to http://localhost:19006
2. **Login Screen**: Should show ClientSync login form
3. **Test Registration**:
   - Click "Don't have an account? Sign up"
   - Enter email/password
   - Should create user in CMS
4. **Test Login**: 
   - Use registered credentials
   - Should authenticate via CMS

## 🔧 Troubleshooting

### CMS Won't Start
- Check `.env` file in `packages/cms/`
- Verify `PAYLOAD_SECRET` is set
- Port 3001 not in use

### Mobile App Can't Connect
- Check `.env.local` has `EXPO_PUBLIC_CMS_API_URL=http://localhost:3001/api`
- CMS must be running first
- Check network/firewall settings

### Authentication Fails
- Verify user exists in CMS admin panel
- Check browser network tab for API errors
- Ensure both apps use same localhost

## 🎯 What You Can Test Now

### CMS Admin Panel (http://localhost:3001/admin)
- ✅ User management
- ✅ Collections (Users, Clients, Trips, etc.)
- ✅ Media uploads
- ✅ Content management

### Mobile App (http://localhost:19006)
- ✅ User registration
- ✅ User login/logout
- ✅ Authentication state management
- ✅ Navigation protection
- ⚠️  Data CRUD (needs API endpoints)

## 🔄 Development Workflow

```bash
# Start both services
pnpm dev:all      # Starts CMS + Mobile App

# Individual services
pnpm dev:cms      # Just CMS (3001)
pnpm dev:mobile   # Just mobile app

# Validation
pnpm verify-setup # Full system check
pnpm check-env    # Environment validation
```

## 🎉 Success Indicators

You have basic end-to-end functionality when:

1. **CMS Admin** loads at localhost:3001
2. **Mobile App** loads at localhost:19006
3. **Registration** creates users in CMS
4. **Login** authenticates through CMS
5. **Protected routes** work in mobile app

## 🚧 Next Steps

Current capabilities are basic authentication. To add full functionality:

1. **CS-PC-004**: API Endpoints (CRUD operations)
2. **CS-PC-005**: Mobile Services (trip management, preferences)
3. **CS-PC-006**: Data Migration (import existing data)
4. **Shared Package**: Cross-package utilities

**Estimated time to full functionality**: 2-3 hours

## 📊 Architecture Overview

```
Mobile App (Expo)     →    Payload CMS (Next.js)    →    SQLite DB
:19006                     :3001                          data.db

Authentication Flow:
1. Mobile: POST /api/users (register)
2. Mobile: POST /api/users/login (authenticate)  
3. CMS: Returns JWT token
4. Mobile: Stores token for API calls
```

Ready to start building! 🎯