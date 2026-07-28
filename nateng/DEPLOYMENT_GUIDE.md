# NatengHub — Complete Deployment Guide

> **Read this first:** This guide is written for beginners. If you've never deployed a web application before, follow each step in order. Do not skip steps.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Option 1: Vercel + Firebase](#option-1-vercel--firebase)
- [Option 2: Vercel Full Stack](#option-2-vercel-full-stack)
- [Architecture Comparison](#architecture-comparison)
- [Recommendation](#recommendation)

---

## Overview

### What This Application Does

NatengHub is a marketplace connecting Benguet farmers with buyers. It has:

- User registration and login (Farmers, Buyers, Bulk Buyers, Admins)
- Product listings with search and filtering
- Shopping cart and checkout
- Order management with delivery scheduling
- Messaging between buyers and sellers
- Admin dashboard for user management
- File uploads (profile photos, product images)

### Current Architecture

```
Frontend: Next.js 16 (React 19) with App Router
Backend:  Next.js API Routes (serverless functions)
Database: Prisma ORM + SQLite (local file)
Auth:     JWT tokens in httpOnly cookies
Storage:  Local filesystem (public/uploads/)
```

### Why Deployment Requires Changes

The application was built for local development using SQLite and local file storage. These technologies **cannot** run on cloud platforms like Vercel because:

| Technology | Problem | Solution |
|------------|---------|----------|
| SQLite | Needs write access to a file on disk. Serverless functions are read-only. | Switch to PostgreSQL |
| Local file uploads | Files saved to `public/uploads/` are lost on every deployment | Switch to cloud storage (Vercel Blob, AWS S3, Cloudinary) |
| Local image paths | Image URLs point to `/uploads/filename.jpg` which don't exist in the cloud | Use cloud storage URLs |

---

## Prerequisites

### What You Need to Install

| Tool | Why | Download |
|------|-----|----------|
| **Node.js** | Runs JavaScript on your computer | https://nodejs.org (download LTS version, currently 20.x or 22.x) |
| **Git** | Version control, required to push code to GitHub | https://git-scm.com/downloads |
| **Visual Studio Code** | Code editor (you already have this) | https://code.visualstudio.com |
| **Vercel CLI** | Deploy from your terminal | Run `npm install -g vercel` after installing Node.js |

### How to Check If They're Installed

Open a terminal (Command Prompt or PowerShell) and run these commands one at a time:

```bash
node --version
# Expected: v20.x.x or v22.x.x

npm --version
# Expected: 10.x.x or 11.x.x

git --version
# Expected: git version 2.x.x

vercel --version
# Expected: Vercel CLI 3x.x.x
```

> **If a command is not found**, install that tool from the links above, close and reopen your terminal, then try again.

### Accounts You Need to Create

| Account | Why | Sign Up |
|---------|-----|---------|
| **GitHub** | Host your code so Vercel can read it | https://github.com/signup |
| **Vercel** | Deploy your application | https://vercel.com/signup (sign in with GitHub) |
| **Neon** (Option 2) | Host your PostgreSQL database | https://neon.tech (sign in with GitHub) |
| **Vercel Blob** (Option 2) | Host file uploads | Included with Vercel account |

---

## Option 1: Vercel + Firebase

> **⚠️ Warning:** This option requires a **significant rewrite** of the application. Firebase uses a completely different data model (Firestore documents/collections vs. SQL tables) and authentication system. This is not a simple deployment — it's a re-architecture.

### Architecture

```
Frontend (Next.js on Vercel)  →  Firebase
                                   ├── Firestore (Database)
                                   ├── Firebase Auth (Login)
                                   ├── Firebase Storage (Files)
                                   └── Cloud Functions (APIs)
```

### Phase 1 — Setup Firebase Project

**What you're doing:** Creating a Firebase project to host your backend services.

**Why:** Firebase provides database, authentication, file storage, and serverless functions — everything you need for the backend.

**Steps:**

1. Go to https://console.firebase.google.com
2. Click **"Create a project"**
3. Enter project name: `nateng-hub`
4. Click **"Continue"**
5. **Disable** Google Analytics (not needed)
6. Click **"Create project"**
7. Wait ~30 seconds for the project to be created
8. Click **"Continue"**

**What you should see:** The Firebase console dashboard with your project name at the top.

#### Enable Firestore (Database)

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll secure it later)
4. Click **"Next"**
5. Select a region closest to your users (e.g., `asia-southeast1` for Philippines)
6. Click **"Enable"**

**What you should see:** Firestore dashboard with your empty database.

#### Enable Authentication

1. In the left sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Under **"Sign-in method"**, click **"Email/Password"**
4. Toggle **"Enable"** to ON
5. Click **"Save"**

#### Enable Storage

1. In the left sidebar, click **"Storage"**
2. Click **"Get started"**
3. Select **"Start in test mode"**
4. Click **"Done"**

#### Get Firebase Config

1. Click the **gear icon** (Settings) next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"**
4. Click the **"Web"** icon (`</>`)
5. Register app nickname: `nateng-hub-web`
6. Click **"Register app"**
7. Copy the `firebaseConfig` object that appears. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "nateng-hub.firebaseapp.com",
  projectId: "nateng-hub",
  storageBucket: "nateng-hub.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**Save this somewhere safe** — you'll need it later.

#### Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify it installed:

```bash
firebase --version
# Expected: 13.x.x
```

Login to Firebase:

```bash
firebase login
```

This will open a browser window. Sign in with the same Google account you used for Firebase. Click **"Allow"** when prompted.

#### Initialize Firebase in Your Project

```bash
c:
cd \Nateng\nateng
firebase init
```

This will ask you several questions. Answer them like this:

1. **"Which Firebase features do you want to set up?"** Use arrow keys to select:
   - [X] Firestore
   - [X] Functions
   - [X] Storage
   - Press **Enter** when done

2. **"Select a default Firebase project for this directory:"**
   - Select `nateng-hub` (the project you created)

3. **"What language would you like to use to write Cloud Functions?"**
   - Select **JavaScript** (simple and compatible)

4. **"Do you want to use ESLint?"**
   - Type `N` and press Enter

5. **"Do you want to install dependencies with npm now?"**
   - Type `Y` and press Enter

6. **"What file should be used for Firestore rules?"**
   - Press Enter (accept default: `firestore.rules`)

7. **"What file should be used for Firestore indexes?"**
   - Press Enter (accept default: `firestore.indexes.json`)

8. **"What file should be used for Storage rules?"**
   - Press Enter (accept default: `storage.rules`)

**What you should see:** Firebase created several files in your project:

- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `functions/` directory with `index.js` and `package.json`

---

### Phase 2 — Rewrite the Backend for Firebase

> **This is the hard part.** The entire data access layer must be rewritten from Prisma/SQL to Firebase/Firestore.

#### What Changes

| Current | Firebase Replacement |
|---------|---------------------|
| `lib/prisma.ts` | Firebase Admin SDK |
| `lib/auth.ts` + `lib/jwt.ts` | Firebase Auth SDK |
| Prisma schema/models | Firestore collections |
| SQL queries | Firestore queries |
| File upload via `/api/upload` | Firebase Storage |
| All API routes (`/api/*/route.ts`) | Firebase Cloud Functions |

#### Step 1: Install Firebase SDKs

In your project root:

```bash
npm install firebase firebase-admin
```

#### Step 2: Create Firebase Client Config

Create `lib/firebase-client.ts`:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
```

#### Step 3: Create Firebase Admin Config

Create `lib/firebase-admin.ts`:

```javascript
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
```

#### Step 4: Restructure Data for Firestore

Firestore is **not** a SQL database. It uses **documents** and **collections**. Here's how your data maps:

**Prisma Model → Firestore Collection/Document**

```
User → /users/{userId}
  ├── name: string
  ├── email: string
  ├── role: string ("farmer", "buyer", "bulkBuyer", "admin")
  ├── phone: string
  ├── isBanned: boolean
  └── createdAt: timestamp

Product → /products/{productId}
  ├── name: string
  ├── description: string
  ├── farmerId: string (references /users/{userId})
  ├── imageUrl: string
  └── createdAt: timestamp

Listing → /listings/{listingId}
  ├── productId: string
  ├── sellerId: string
  ├── priceCents: number
  ├── quantity: number
  ├── available: boolean
  └── createdAt: timestamp

Order → /orders/{orderId}
  ├── buyerId: string
  ├── sellerId: string
  ├── totalCents: number
  ├── status: string
  ├── items: array (embedded)
  └── createdAt: timestamp
```

#### Step 5: Rewrite Key API Routes as Cloud Functions

Each file in `app/api/*/route.ts` needs to be rewritten as a Firebase Cloud Function in `functions/index.js`.

**Example — User Registration (`functions/index.js`):**

```javascript
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.registerUser = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password, role } = req.body;

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Store user data in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      name,
      email,
      role: role || "buyer",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isBanned: false,
    });

    return res.status(201).json({
      user: {
        id: userRecord.uid,
        name,
        email,
        role: role || "buyer",
      },
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
```

This must be repeated for **every API route** in the application (~25 routes).

---

### Phase 3 — Deploy Firebase Backend

**What you're doing:** Deploying your Cloud Functions, Firestore rules, and Storage rules to Firebase.

**Why:** So your backend is live on the internet.

**Steps:**

1. Open a terminal and navigate to your project:

```bash
c:
cd \Nateng\nateng
```

2. Deploy everything:

```bash
firebase deploy
```

This will take 2-5 minutes. You'll see output like:

```
=== Deploying to 'nateng-hub'...

i  deploying functions, firestore, storage
i  functions: creating function registerUser...
✓  functions: created function registerUser
i  firestore: deploying rules...
✓  firestore: released rules
i  storage: deploying rules...
✓  storage: released rules

✓  Deploy complete!
```

**What you should see:** "Deploy complete!" with no errors.

#### Test Your API

Find your function URL in the Firebase console:

1. Go to Firebase Console → Your Project
2. Click **"Functions"** in the left sidebar
3. You'll see a list of your functions with URLs like:

   `https://us-central1-nateng-hub.cloudfunctions.net/registerUser`

Test it with curl or Postman:

```bash
curl -X POST https://us-central1-nateng-hub.cloudfunctions.net/registerUser \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Farmer","email":"test@example.com","password":"password123","role":"farmer"}'
```

**Expected response:**
```json
{"user":{"id":"abc123","name":"Test Farmer","email":"test@example.com","role":"farmer"}}
```

---

### Phase 4 — Update the Frontend

**What you're doing:** Replacing all Prisma/fetch calls with Firebase SDK calls.

#### Update `lib/auth.ts`

Replace the current fetch-based auth with Firebase Auth:

```javascript
import { auth } from "./firebase-client";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

export async function login(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return {
    id: result.user.uid,
    email: result.user.email!,
    name: result.user.displayName || "",
    role: "buyer", // You'll need to fetch this from Firestore
  };
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: string
) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  // Also save user data to Firestore
  return {
    id: result.user.uid,
    email: result.user.email!,
    name,
    role,
  };
}

export async function logout() {
  await signOut(auth);
}
```

#### Update API Client

Replace `lib/api-client.ts` — instead of calling `/api/products`, call Firebase directly:

```javascript
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase-client";

export const productsAPI = {
  getAll: async () => {
    const snapshot = await getDocs(collection(db, "products"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
  getById: async (id: string) => {
    const doc = await getDoc(doc(db, "products", id));
    return { id: doc.id, ...doc.data() };
  },
  // ... etc
};
```

---

### Phase 5 — Deploy Frontend to Vercel

Follow **Phase 4 of Option 2** below — the Vercel deployment steps are identical.

Skip the database migration steps (you're using Firebase, not PostgreSQL).

---

## Option 2: Vercel Full Stack

> **✅ Recommended.** This option keeps your current Prisma + Next.js architecture and deploys everything together on Vercel. Requires migrating SQLite → PostgreSQL.

### Architecture

```
Vercel
├── Frontend (Next.js pages)
├── Backend (Next.js API Routes = Vercel Functions)
├── Database: Neon PostgreSQL (hosted elsewhere, connected via Prisma)
├── Storage: Vercel Blob (for file uploads)
└── Auth: JWT (stays the same)
```

---

### Phase 1 — Prepare Your Project for Production

#### Step 1: Create a `.env.production` File

Create `.env.production` in your project root:

```bash
# Database - get these from Neon after setting up your database
DATABASE_URL="postgresql://user:password@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# JWT Secret - generate a random 64-character string
JWT_SECRET="your-64-character-random-secret-here-change-this-in-production"

# Vercel Blob - for file uploads
BLOB_READ_WRITE_TOKEN="your-blob-token-here"

# App URL
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

> **⚠️ IMPORTANT:** Never commit this file to GitHub. It contains secrets.

#### Step 2: Generate a Strong JWT Secret

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output — that's your JWT_SECRET. It will look like:
`a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1`

---

### Phase 2 — Set Up PostgreSQL Database with Neon

**What you're doing:** Creating a cloud-hosted PostgreSQL database to replace SQLite.

**Why:** Vercel serverless functions can't write to a local SQLite file. They need a remote database.

#### Steps:

1. Go to https://neon.tech
2. Click **"Sign Up"** and sign in with GitHub
3. Click **"Create a project"**
4. Project name: `nateng-hub`
5. Region: Select **"Singapore"** (closest to Philippines)
6. Click **"Create project"**

**What you should see:** A dashboard with your database connection string. It looks like:

```
postgresql://neondb_owner:xxxxxxxx@ep-yourserver-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

7. Click the **"Copy"** button to copy this string.
8. Save it — you'll use it as `DATABASE_URL`.

#### Update Prisma Schema for PostgreSQL

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ... rest of your models stay exactly the same
```

The change is: `provider = "sqlite"` → `provider = "postgresql"` and `url = "file:./dev.db"` → `url = env("DATABASE_URL")`

#### Install Prisma PostgreSQL Dependencies

```bash
npm install @prisma/client
npm install -D prisma
```

#### Run the Migration

```bash
npx prisma migrate dev --name init
```

This creates the tables in your Neon PostgreSQL database.

#### Verify the Migration

```bash
npx prisma studio
```

This opens a browser window showing your database tables. Click through to verify data is structured correctly.

> **Common Mistake:** If you get an SSL error, make sure your `DATABASE_URL` includes `?sslmode=require` at the end.

---

### Phase 3 — Set Up Cloud Storage for File Uploads

**What you're doing:** Replacing local file storage with Vercel Blob (cloud storage).

**Why:** Files saved to `public/uploads/` on Vercel are lost on every deployment. Vercel Blob stores files permanently.

#### Step 1: Install Vercel Blob

```bash
npm install @vercel/blob
```

#### Step 2: Update `app/api/upload/route.ts`

Replace the current implementation with Vercel Blob:

```javascript
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = `${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({ imageUrl: blob.url });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
```

#### Step 3: Update Image URLs

Anywhere in the code that constructs image URLs like `/uploads/filename.jpg` needs to use the Vercel Blob URL instead.

For product images stored in the database, migrate them to use the full URL from Vercel Blob.

---

### Phase 4 — Deploy to Vercel

#### Step 1: Push Code to GitHub

1. Open a terminal in your project directory:

```bash
c:
cd \Nateng\nateng
```

2. Initialize Git (if not already done):

```bash
git init
git add .
git commit -m "Initial commit"
```

3. Create a GitHub repository:
   - Go to https://github.com/new
   - Repository name: `nateng-hub`
   - Click **"Create repository"**
   - Do NOT check any boxes (no README, no .gitignore)

4. Connect your local repo to GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/nateng-hub.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

**What you should see:**
```
Enumerating objects: 500, done.
Counting objects: 100% (500/500), done.
Delta compression using up to 8 threads
Compressing objects: 100% (300/300), done.
Writing objects: 100% (500/500), 2.50 MiB | 1.00 MiB/s, done.
Total 500 (delta 200), reused 0 (delta 0)
To https://github.com/YOUR_USERNAME/nateng-hub.git
 * [new branch]      main -> main
```

#### Step 2: Connect Vercel to GitHub

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Click **"Install GitHub App"** if prompted
4. Find and select your `nateng-hub` repository
5. Click **"Import"**

#### Step 3: Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Build Command** | `npx prisma generate && next build` |
| **Output Directory** | (leave blank — default) |
| **Install Command** | `npm install` |

> **Why the build command includes `prisma generate`:** Prisma needs to generate its client code. This command must run before `next build` so your code can import `@prisma/client`.

#### Step 4: Add Environment Variables

Click **"Environment Variables"** and add these one at a time:

| Name | Value | Branch |
|------|-------|--------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string | All |
| `JWT_SECRET` | The 64-character string you generated earlier | All |
| `BLOB_READ_WRITE_TOKEN` | Your Vercel Blob token | All |
| `NEXT_PUBLIC_APP_URL` | Will be your domain once deployed | All |

> **How to get `BLOB_READ_WRITE_TOKEN`:**
>
> 1. Go to Vercel Dashboard → Storage
> 2. Click **"Create Database"** → **"Blob"**
> 3. Follow prompts to create a Blob store
> 4. Copy the `BLOB_READ_WRITE_TOKEN` value

#### Step 5: Deploy

Click **"Deploy"**

**What you should see:** A progress page showing:

```
vercel@latest
Installing dependencies...
Detected Next.js 16 framework
Running "npx prisma generate"
Running "next build"
✓ Compiled successfully
✓ TypeScript check passed
✓ Generating static pages (61/61)
✓ Finalizing page optimization
✓ Deployment complete
```

**Your app is now live at:** `https://nateng-hub.vercel.app`

---

### Phase 5 — Connect Frontend to Backend

**What you're doing:** Making sure your frontend can talk to your backend APIs.

Since you deployed everything together on Vercel, the frontend and backend are on the **same domain**. API calls like `fetch('/api/products')` work automatically because they're relative URLs.

**No CORS configuration needed** — same-origin requests don't need CORS.

#### Verify API Routes

Test each major API endpoint:

```bash
# Test health endpoint
curl https://nateng-hub.vercel.app/api/health

# Expected:
{"status":"ok","timestamp":"2026-07-27T..."}

# Test products
curl https://nateng-hub.vercel.app/api/products

# Expected:
{"data":[...]} or {"data":[]} (empty if no products)
```

---

### Phase 6 — Custom Domain

**What you're doing:** Using your own domain name instead of `nateng-hub.vercel.app`.

**Why:** It looks professional and is easier for users to remember.

#### Steps:

1. Buy a domain name from a registrar like Namecheap, GoDaddy, or Google Domains
2. Go to your Vercel project dashboard
3. Click **"Settings"** → **"Domains"**
4. Enter your domain (e.g., `natenghub.com`)
5. Click **"Add"**

Vercel will show you DNS records to add:

```
Type: CNAME
Name: @ or www
Value: cname.vercel-dns.com
```

6. Go to your domain registrar's DNS settings
7. Add the CNAME record shown above
8. Wait 5-30 minutes for DNS to propagate

**What you should see:** Your domain appears as "Valid" in Vercel after DNS propagates.

> **HTTPS is automatic:** Vercel issues a free SSL certificate for your domain. No configuration needed.

---

### Phase 7 — Testing Checklist

Go through each item and verify it works on your live deployment:

```
✅ Website loads at your URL
✅ Registration works (create Farmer, Buyer, Bulk Buyer accounts)
✅ Login works for all account types
✅ Logout works
✅ Session persists on page refresh
✅ Browse products
✅ Search/filter products
✅ Add items to cart
✅ Update cart quantity
✅ Remove items from cart
✅ Checkout/create order
✅ View order status
✅ Messages between buyers and farmers
✅ Delivery scheduling works
✅ Favorite listings
✅ Farmer dashboard loads
✅ Buyer dashboard loads
✅ Bulk buyer flows work
✅ Admin panel loads (localhost only)
✅ Admin can manage users
✅ Profile photo upload
✅ Contact form submission
✅ Mobile responsive (check on phone)
✅ All pages render without 404 errors
✅ API health endpoint returns OK
```

---

### Phase 8 — Troubleshooting

| # | Problem | Cause | Solution |
|---|---------|-------|----------|
| 1 | Build fails: "Can't find module '@prisma/client'" | Prisma client not generated | Add `npx prisma generate` to build command in Vercel |
| 2 | Build fails: "DATABASE_URL is not set" | Missing env var | Add `DATABASE_URL` to Vercel environment variables |
| 3 | Build fails: "JWT_SECRET is not set" | Missing env var | Add `JWT_SECRET` to Vercel environment variables |
| 4 | Login returns 500 error | Database connection failed | Check `DATABASE_URL` is correct and the database is running |
| 5 | Login returns "Unauthorized" | JWT secret mismatch | Make sure `JWT_SECRET` is set and consistent |
| 6 | File upload fails | Local storage path doesn't exist on Vercel | Migrate to Vercel Blob or AWS S3 |
| 7 | Images don't load | Image paths are local | Use cloud storage URLs instead |
| 8 | Application loads slowly | Cold start on serverless functions | Add a cron job to keep functions warm, or upgrade to Pro |
| 9 | Database connection timed out | Neon free tier goes to sleep after inactivity | Use Neon's "scale to zero" config or upgrade to paid tier |
| 10 | CORS error in browser | API is on different domain | For Vercel Full Stack: not needed (same domain). For Firebase: see below |
| 11 | CORS error (Firebase) | Frontend and Cloud Functions on different domains | Add `Access-Control-Allow-Origin: *` header to all Cloud Functions |
| 12 | Prisma migration fails | PostgreSQL schema mismatch | Run `npx prisma migrate dev` and push migration to GitHub |
| 13 | "Relation does not exist" error | Migration not applied | Create initial migration with `npx prisma migrate dev --name init` |
| 14 | 404 on page refresh | No fallback routing configured | Vercel handles this automatically for Next.js — check if routes are correct |
| 15 | 504 Gateway Timeout | Function execution exceeded limit | Optimize database queries or increase function timeout in Vercel |
| 16 | "Cannot read property of undefined" | Missing environment variable | Check all env vars are set in Vercel dashboard |
| 17 | Auth session doesn't persist | httpOnly cookie domain mismatch | Set `NEXT_PUBLIC_APP_URL` to match your domain |
| 18 | Admin page not restricted | Middleware not working | Verify middleware.ts has the correct matcher for `/admin/*` |
| 19 | Sitemap doesn't include all pages | `siteUrl` not configured | Update `next-sitemap` config with your domain |
| 20 | PDF/export doesn't work | Missing server-side dependency | Install required packages as regular dependencies (not devDependencies) |
| 21 | CSS animations not working | Missing `tw-animate-css` import | Verify `@import "tw-animate-css"` is in `app/globals.css` |
| 22 | Prisma Studio won't connect to Neon | SSL connection issue | Add `?sslmode=require` to your `DATABASE_URL` |
| 23 | "Too many connections" error | Neon free tier connection limit | Reduce Prisma connection pool or upgrade Neon plan |
| 24 | Function timed out deploying | Large npm packages | Run `npm prune --production` before deploy, check bundle size |
| 25 | Form submission fails silently | CORS or network error | Open browser DevTools → Network tab to see actual error |
| 26 | "Invalid `prisma.user.create()` invocation" | Schema mismatch | Run `npx prisma generate` after schema changes |
| 27 | Email notifications not sending | No email service configured | Add SendGrid, Resend, or similar email provider |
| 28 | Rate limiting blocks legitimate users | In-memory rate limiter doesn't work across serverless instances | Replace with database-backed rate limiter or skip for MVP |
| 29 | "Failed to fetch" errors | API route not deployed | Check Vercel deployment logs for function errors |
| 30 | Images return 403 | Hotlinking protection | Configure CORS and image access rules in blob storage |

---

### Phase 9 — Maintenance

#### How to Redeploy After Code Changes

**Automatic (recommended):**
Every time you push to GitHub's `main` branch, Vercel automatically redeploys:

```bash
git add .
git commit -m "Describe your changes here"
git push origin main
```

**Manual:**
Go to Vercel Dashboard → Your Project → **"Deployments"** → **"Redeploy"**

#### How to Roll Back a Deployment

1. Go to Vercel Dashboard → Your Project → **"Deployments"**
2. Find the working deployment (green checkmark)
3. Click the **"..."** menu → **"Promote to Production"**

#### Monitor Logs

**Vercel logs:**

1. Go to Vercel Dashboard → Your Project → **"Logs"**
2. Filter by: Errors, Warnings, or All

**Database logs (Neon):**

1. Go to https://console.neon.tech → Your Project
2. Click **"Monitoring"** in the left sidebar

#### Check Analytics

**Vercel Analytics (built-in):**

1. Go to Vercel Dashboard → Your Project → **"Analytics"**
2. Enable Web Analytics (toggle on)

#### Backup Firestore (Firebase Option 1)

1. Go to Firebase Console → Firestore → **"Export"**
2. Select **"Export entire database"**
3. Choose a Cloud Storage bucket
4. Click **"Export"**

#### Backup PostgreSQL (Neon — Option 2)

Neon automatically creates backups. To manually backup:

```bash
pg_dump --no-owner --no-acl "postgresql://user:pass@ep-host.aws.neon.tech/neondb" > backup.sql
```

To restore:

```bash
psql "postgresql://user:pass@ep-host.aws.neon.tech/neondb" < backup.sql
```

#### Rotate Secrets

Every 90 days, update your `JWT_SECRET`:

1. Generate a new secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Update `JWT_SECRET` in Vercel Dashboard → Settings → Environment Variables
3. **All existing user sessions will be invalidated** — users will need to log in again

#### Update Dependencies

Once a month, run:

```bash
npm outdated    # Check which packages need updating
npm update      # Update within version ranges
npm audit fix   # Fix security vulnerabilities
```

---

## Architecture Comparison

### Cost

| Factor | Vercel + Firebase | Vercel Full Stack |
|--------|-------------------|-------------------|
| **Hosting (Vercel)** | Free tier (100 GB bandwidth, 6000 build mins/mo) | Free tier (same) |
| **Database** | Firestore free tier (1 GB storage, 50K reads/day) | Neon free tier (500 MB, 100 hrs compute/month) |
| **Auth** | Firebase Auth free (50K users) | JWT in httpOnly cookies — included |
| **Storage** | Firebase Storage free (5 GB) | Vercel Blob free (250 MB, 10K requests/day) |
| **Functions** | Firebase free tier (2M invocations/mo) | Vercel Functions included in hosting (100 GB-hours) |
| **Total monthly (free)** | $0 | $0 |
| **Total monthly (scaled)** | ~$50-150/mo | ~$20-100/mo |

### Performance

| Factor | Vercel + Firebase | Vercel Full Stack |
|--------|-------------------|-------------------|
| **Cold start** | Cloud Functions: ~2-5 seconds | Vercel Functions: ~0.5-1 second |
| **Query speed** | Firestore: fast for simple queries | PostgreSQL (Neon): fast for complex queries |
| **Edge caching** | No | Yes (Vercel Edge Network) |
| **Global latency** | Firebase servers in 20+ regions | Vercel Edge Network in 100+ locations |

### Scalability

| Factor | Vercel + Firebase | Vercel Full Stack |
|--------|-------------------|-------------------|
| **Auto-scaling** | Yes (Firebase scales automatically) | Yes (Vercel scales automatically) |
| **Database limits** | 1M concurrent connections | Neon: 100 connections (free), up to 10K (paid) |
| **Storage limits** | Firestore: 1 TB per document | Neon: 500 MB (free), up to 500 GB (paid) |

### Development Complexity

| Factor | Vercel + Firebase | Vercel Full Stack |
|--------|-------------------|-------------------|
| **Code changes needed** | **Major rewrite** — all Prisma → Firestore | **Minimal** — change DB URL, switch to cloud storage |
| **Learning curve** | Steep — Firestore is fundamentally different from SQL | Shallow — same Prisma, same SQL queries |
| **Local development** | Requires Firebase emulator | Works with local SQLite, swap URL for production |
| **Framework compatibility** | Partial — Firebase doesn't integrate with Next.js natively | Full — Next.js API Routes + Prisma work perfectly together |

### Security

| Factor | Vercel + Firebase | Vercel Full Stack |
|--------|-------------------|-------------------|
| **Authentication** | Firebase Auth (managed) | JWT (self-managed) |
| **Database security** | Firestore Security Rules | Database connection string (keep secret) |
| **API security** | Cloud Functions + Firebase Auth tokens | httpOnly cookies + JWT verification |
| **Vendor security** | Google (SOC 2, ISO 27001) | Vercel + Neon (SOC 2) |

### Vendor Lock-in

| Factor | Vercel + Firebase | Vercel Full Stack |
|--------|-------------------|-------------------|
| **Database** | Firestore — Google-specific, hard to migrate | PostgreSQL — industry standard, portable |
| **Auth** | Firebase Auth — Google-specific | JWT — no vendor dependency |
| **Functions** | Firebase Cloud Functions — Google-specific | Next.js API Routes — portable to any Node.js host |
| **Storage** | Firebase Storage — Google-specific | Vercel Blob — S3-compatible, easy to switch |

---

## Recommendation

### Choose Option 2: Vercel Full Stack

**Why:** For your specific application, Option 2 is the clear winner:

1. **Minimal code changes** — You keep Prisma, same database schema, same API routes. The only changes are:
   - `prisma/schema.prisma`: `sqlite` → `postgresql`
   - `app/api/upload/route.ts`: Local file → Vercel Blob
   - Environment variables: Add `DATABASE_URL`, `JWT_SECRET`, `BLOB_READ_WRITE_TOKEN`

2. **No architectural rewrite** — Option 1 (Firebase) would require rewriting every single API route and data access call. That's months of work.

3. **Same development experience** — You can still develop locally with SQLite and switch to PostgreSQL for production by changing one line in the Prisma schema.

4. **Lower cost at scale** — PostgreSQL (via Neon) is cheaper than Firestore at high read/write volumes.

5. **No vendor lock-in** — Prisma supports MySQL, PostgreSQL, SQLite, SQL Server, and MongoDB. If you switch hosting, you keep your database queries.

6. **Next.js-native** — Everything stays within the Next.js framework. No external backend to manage.

### Migration Effort Estimate

| Task | Time |
|------|------|
| Switch Prisma to PostgreSQL | 30 minutes |
| Set up Neon database | 15 minutes |
| Set up Vercel Blob for uploads | 30 minutes |
| Update upload API route | 15 minutes |
| Deploy to Vercel | 15 minutes |
| Test all functionality | 1 hour |
| **Total** | **~3 hours** |

### What Won't Work on Vercel (and What to Do)

| Feature | Problem | Fix |
|---------|---------|-----|
| **Admin page** | Middleware restricts `/admin` to localhost | Remove localhost check OR create a separate admin deployment |
| **File upload to `public/uploads/`** | Read-only filesystem | Use Vercel Blob (details above) |
| **SQLite database** | Read-only filesystem | Switch to Neon PostgreSQL (details above) |
| **Images from local paths** | Don't exist in cloud | Use cloud storage URLs |
| **Rate limiter** | In-memory Map doesn't scale across instances | Upgrade to database-backed rate limiting or skip for MVP |

---

## Quick Start — Deployment Checklist

```
Phase 1: Preparation
☐ Install Node.js
☐ Install Git
☐ Install Vercel CLI
☐ Create GitHub account
☐ Create Vercel account
☐ Create Neon account

Phase 2: Database Setup
☐ Create Neon PostgreSQL database
☐ Copy DATABASE_URL
☐ Update prisma/schema.prisma to use postgresql
☐ Run npx prisma migrate dev --name init

Phase 3: Storage Setup
☐ Create Vercel Blob store
☐ Copy BLOB_READ_WRITE_TOKEN
☐ Update /api/upload to use @vercel/blob

Phase 4: Environment Variables
☐ Generate JWT_SECRET
☐ Create .env.production with all vars

Phase 5: Deploy
☐ Push code to GitHub
☐ Connect GitHub to Vercel
☐ Add environment variables in Vercel
☐ Set build command: npx prisma generate && next build
☐ Click Deploy
☐ Verify deployment succeeds

Phase 6: Verification
☐ Website loads
☐ Login works
☐ Registration works
☐ Database reads/writes work
☐ API endpoints respond
☐ File upload works
☐ All pages render

Phase 7: Production Readiness
☐ Add custom domain
☐ Enable Vercel Analytics
☐ Set up monitoring
☐ Create backup strategy
☐ Document rollback procedure