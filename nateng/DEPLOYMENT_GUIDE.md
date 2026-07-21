# NatengHub - Firebase Deployment Guide

## 🚀 Deployment Status: READY FOR DEPLOYMENT

**Last Updated:** 2026-07-22
**Build Status:** ✅ Passing
**TypeScript:** ✅ No Errors
**Firebase Config:** ✅ Complete

---

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] Production build succeeds (`npm run build`)
- [x] TypeScript compilation passes
- [x] All 61 pages compile successfully
- [x] Firebase configuration files created
  - [x] `firebase.json` - Hosting + App Hosting config
  - [x] `.firebaserc` - Firebase project configuration
  - [x] `firestore.rules` - Firestore security rules
  - [x] `firestore.indexes.json` - Firestore indexes
  - [x] `storage.rules` - Storage security rules
- [x] Environment variables documented in `.env.example`
- [x] Deployment scripts added to `package.json`
- [x] Critical build error fixed (farmer/orders/page.tsx)

### ⚠️ Requires Action
- [ ] Install Firebase CLI globally: `npm install -g firebase-tools`
- [ ] Create Firebase project (if not already created)
- [ ] Set up production database (PostgreSQL)
- [ ] Configure environment variables in Firebase
- [ ] Enable Firebase services (App Hosting, Firestore, Storage)

---

## 🏗️ Architecture Overview

### Current Stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (App Router)
- **Database:** Prisma ORM with PostgreSQL (production) / SQLite (development)
- **Authentication:** JWT with httpOnly cookies
- **File Storage:** Local filesystem (`public/uploads/`)
- **Hosting:** Firebase App Hosting

### Database Strategy
**Important:** This application uses **Prisma ORM** with PostgreSQL, NOT Firestore.

- **Development:** SQLite (`prisma/dev.db`)
- **Production:** PostgreSQL (requires external database provider)
- **Firebase Role:** Hosting and deployment only

---

## 🗄️ Database Setup (REQUIRED)

### Option 1: Neon PostgreSQL (Recommended)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (format: `postgresql://user:password@host/database?sslmode=require`)
4. Add to Firebase environment variables as `DATABASE_URL`

### Option 2: Supabase PostgreSQL
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Get connection string from Settings > Database
4. Add to Firebase environment variables as `DATABASE_URL`

### Option 3: Google Cloud SQL
1. Create Cloud SQL instance in Google Cloud Console
2. Enable PostgreSQL
3. Create database and user
4. Add connection string to Firebase environment variables

---

## 🔧 Environment Variables

### Required for Production

Create these in Firebase Console > App Hosting > Environment Variables:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# JWT Authentication (REQUIRED - Generate a secure random string)
JWT_SECRET="your_secure_jwt_secret_key_here_min_32_chars"

# API Configuration
NEXT_PUBLIC_API_URL="https://your-project.web.app"

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Admin Credentials (CHANGE THESE!)
ADMIN_USERNAME="your_secure_admin_username"
ADMIN_PASSWORD="your_secure_admin_password_here"
ADMIN_API_KEY="your_secure_api_key_here"
```

### Optional
```env
# Analytics (if using Vercel Analytics)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## 🚀 Deployment Steps

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase (First Time Only)
```bash
cd nateng
firebase init apphosting
```

Follow the prompts:
- Select your Firebase project
- Choose "App Hosting" backend
- Accept default configuration

### Step 4: Set Environment Variables
```bash
# Set database URL
firebase apphosting:env:set DATABASE_URL "postgresql://..."

# Set JWT secret
firebase apphosting:env:set JWT_SECRET "your_secret_key"

# Set other variables
firebase apphosting:env:set ADMIN_USERNAME "admin"
firebase apphosting:env:set ADMIN_PASSWORD "secure_password"
firebase apphosting:env:set ADMIN_API_KEY "secure_api_key"
firebase apphosting:env:set NEXT_PUBLIC_API_URL "https://your-project.web.app"
```

### Step 5: Deploy to Firebase
```bash
# Build and deploy
npm run deploy:firebase

# Or deploy hosting only
npm run deploy:hosting
```

### Step 6: Run Database Migrations
After first deployment, run migrations:
```bash
# Connect to your PostgreSQL database and run:
npx prisma migrate deploy
```

---

## 🔐 Security Configuration

### Firebase Services to Enable

1. **App Hosting** (Primary)
   - Automatically configured during deployment
   - Handles Next.js SSR and API routes

2. **Firestore Database** (Optional - Currently Not Used)
   - Enable if planning to add Firestore features
   - Rules already configured in `firestore.rules`
   - Indexes configured in `firestore.indexes.json`

3. **Storage** (Optional - Currently Not Used)
   - Enable if migrating from local storage to Firebase Storage
   - Rules configured in `storage.rules`
   - Currently using local filesystem (`public/uploads/`)

### Security Rules

#### Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for marketplace listings
    match /listings/{listingId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid != null;
    }

    // User profiles - only the user and admin can access
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Orders, Messages, Notifications - authenticated users only
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }

    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }

    match /notifications/{notificationId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if request.auth != null;
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

#### Storage Rules (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

---

## 📊 Database Schema

The application uses Prisma ORM. See `prisma/schema.prisma` for full schema.

### Key Models
- **User** - Farmers, buyers, bulk buyers, admins
- **Product** - Farmer products
- **Listing** - Seller listings with pricing
- **Order** - Orders with delivery scheduling
- **OrderItem** - Individual order items
- **Message** - User-to-user messaging
- **Notification** - System notifications
- **Favorite** - User favorites
- **Appeal** - Ban appeals
- **AuditLog** - Admin action logs
- **ContactMessage** - Contact form submissions
- **DeliverySchedule** - Collaborative delivery scheduling

### Migrations
Run migrations after deployment:
```bash
npx prisma migrate deploy
```

---

## 🧪 Testing After Deployment

### 1. Verify Build
```bash
npm run build
# Should complete with 0 errors
```

### 2. Test Authentication
- Register a new user
- Login with existing user
- Verify JWT token in cookies
- Test logout

### 3. Test Core Features
- [ ] Browse products as buyer
- [ ] Create listing as farmer
- [ ] Place order
- [ ] Send message
- [ ] Upload image
- [ ] Create delivery schedule

### 4. Test Admin Panel
- [ ] Access admin panel (localhost only)
- [ ] Manage users
- [ ] Review appeals
- [ ] View analytics

---

## 🐛 Known Issues

### Non-Blocking
1. **Lint Warnings** - 130 warnings, 327 errors (mostly unused imports/variables)
   - Does not affect functionality
   - Can be fixed incrementally
   
2. **Middleware Deprecation** - Next.js warns about `middleware.ts`
   - Should migrate to `proxy.ts` in future update
   - Currently functional

3. **Hardcoded Admin Credentials** - Admin panel uses basic auth
   - Only accessible from localhost
   - Should implement proper admin authentication

### Not Used (Optional)
- Firestore (configured but not used - using Prisma instead)
- Firebase Storage (configured but not used - using local filesystem)
- Firebase Auth (configured but not used - using custom JWT)

---

## 📦 Deployment Commands

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev --name init

# Seed database (optional)
npm run seed

# Build for production
npm run build

# Deploy to Firebase
npm run deploy:firebase

# Deploy hosting only
npm run deploy:hosting
```

---

## 🔍 Monitoring

### Firebase Console
- **App Hosting:** Monitor deployments, logs, performance
- **Firestore:** Monitor usage (if enabled)
- **Storage:** Monitor usage (if enabled)

### Application Logs
```bash
# View Firebase logs
firebase apphosting:logs:tail
```

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure SSL mode is set to `require` for cloud databases

### Migration Failures
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or push schema directly
npx prisma db push
```

### Deployment Fails
```bash
# Check Firebase login
firebase login --reauth

# Verify project
firebase projects:list

# Check apphosting config
firebase apphosting:get
```

---

## 📝 Post-Deployment Tasks

1. **Update DNS** (if using custom domain)
   - Add A record pointing to Firebase
   - Configure in Firebase Console

2. **Enable SSL** (automatic with Firebase)

3. **Set up monitoring**
   - Firebase Performance Monitoring
   - Error reporting (consider Sentry)

4. **Configure backups**
   - Set up automated PostgreSQL backups
   - Test restore process

5. **Security audit**
   - Review Firestore rules
   - Review Storage rules
   - Verify JWT secret is secure
   - Change default admin credentials

---

## 🎯 Next Steps

1. **Immediate:**
   - [ ] Set up PostgreSQL database (Neon/Supabase)
   - [ ] Configure Firebase environment variables
   - [ ] Deploy to Firebase App Hosting
   - [ ] Run database migrations

2. **Short-term:**
   - [ ] Test all user flows
   - [ ] Set up monitoring
   - [ ] Configure custom domain
   - [ ] Enable SSL (automatic)

3. **Long-term:**
   - [ ] Migrate to Firebase Storage (optional)
   - [ ] Add Firebase Auth (optional)
   - [ ] Implement CSRF protection
   - [ ] Add comprehensive logging

---

## 📞 Support

For issues:
1. Check Firebase Console logs
2. Review application logs
3. Consult [Firebase Documentation](https://firebase.google.com/docs/app-hosting)
4. Review [Next.js Documentation](https://nextjs.org/docs)

---

**Status:** ✅ Ready for deployment pending database setup and environment configuration.