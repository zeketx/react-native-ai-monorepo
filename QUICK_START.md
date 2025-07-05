# 🚀 Quick Start - Get Both Services Running NOW

## Prerequisites Check (30 seconds)
```bash
node diagnose-startup.js
```

## Start Both Services (2 minutes)

### Terminal 1 - Start CMS Backend
```bash
cd packages/cms
pnpm install  # Only if node_modules missing
pnpm dev
```

**Expected Output:**
```
> @my-rn-app/cms@1.0.0 dev
> cross-env NODE_OPTIONS="--no-deprecation" next dev -p 3001

▲ Next.js 15.0.3
- Local: http://localhost:3001
```

✅ **CMS is ready when you see:** Browser opens at http://localhost:3001/admin

### Terminal 2 - Start Mobile App
```bash
cd packages/mobile-app
pnpm install  # Only if node_modules missing
pnpm dev
```

**Expected Output:**
```
Starting Metro Bundler
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▀▄█▀ ▀▄▀█ ▄▄▄▄▄ █
█ █   █ █▄▀ █▄█▀ █ █   █ █
█ █▄▄▄█ █ ▄█▀▄▀▄ █ █▄▄▄█ █
█▄▄▄▄▄▄▄█ █ █ ▀ █▄▄▄▄▄▄▄█

› Metro waiting on exp://192.168.1.x:19000
› Web is waiting on http://localhost:19006
```

✅ **Mobile app is ready when you see:** QR code and web URL

## Test Both Services (1 minute)

### 1. Open Both in Browser
- **CMS Admin**: http://localhost:3001/admin
- **Mobile Web**: http://localhost:19006

### 2. Create Admin User (CMS)
1. Go to http://localhost:3001/admin
2. Fill form:
   - Email: `admin@test.com`
   - Password: `password123`
3. Click "Create First User"

### 3. Test from Mobile App
1. Go to http://localhost:19006
2. You should see the login screen
3. Try to register a new user
4. Check CMS admin panel for the new user

## Common Issues & Fixes

### CMS Won't Start
```bash
# Error: PAYLOAD_SECRET not set
# Fix: Already configured in packages/cms/.env

# Error: Port 3001 in use
lsof -ti:3001 | xargs kill -9  # Kill process on port
```

### Mobile App Won't Start
```bash
# Error: Metro bundler issues
cd packages/mobile-app
rm -rf node_modules
pnpm install
npx expo start --clear  # Clear cache
```

### Can't Connect Mobile to CMS
```bash
# Check environment variables
cat packages/mobile-app/.env.local | grep CMS
# Should show:
# EXPO_PUBLIC_CMS_API_URL=http://localhost:3001/api
# EXPO_PUBLIC_PAYLOAD_URL=http://localhost:3001
```

## What Works Now ✅
- CMS admin panel
- Mobile app login screen  
- Basic user registration (creates users in CMS)
- Authentication flow

## What Doesn't Work Yet ❌
- Supabase integration (using Payload auth instead)
- Data operations beyond auth
- Trip management, preferences, etc.

## Success Checklist
- [ ] CMS running on http://localhost:3001
- [ ] Mobile app on http://localhost:19006
- [ ] Can create admin user in CMS
- [ ] Can see login screen in mobile app
- [ ] Registration creates users in CMS

If all boxes checked = **SUCCESS!** 🎉

## Still Having Issues?
Run diagnostics and share the output:
```bash
node diagnose-startup.js
pnpm test:cms
```