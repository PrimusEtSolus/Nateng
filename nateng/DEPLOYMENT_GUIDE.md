# NatengHub — Complete Deployment Guide

> **Read this first:** This guide is written for beginners. If you've never deployed a web application before, follow each step in order. Do not skip steps.

---

## 🚀 Zero Cost, Zero Credit Card Required

Everything in this guide uses **free tiers that do not require a credit card**:

| Service | Plan | Cost | Card Required? |
|---------|------|------|----------------|
| **Vercel** | Hobby | Free | ❌ No |
| **Neon PostgreSQL** | Free Tier | Free | ❌ No |
| **Vercel Blob** | Hobby | Free (250 MB) | ❌ No |
| **Cloudinary** (alt. storage) | Free | Free (25 GB) | ❌ No |
| **GitHub** | Free | Free | ❌ No |

You can deploy this entire application to production **without ever entering a credit card number**.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [The Only Option: Vercel + Neon PostgreSQL](#the-only-option-vercel--neon-postgresql)
- [Card-Free Cost Summary](#card-free-cost-summary)
- [Quick Start Checklist](#quick-start-checklist)

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
| SQLite | Needs write access to a file on disk. Serverless functions are read-only. | Switch to PostgreSQL (Neon) |
| Local file uploads | Files saved to `public/uploads/` are lost on every deployment | Switch to cloud storage (Vercel Blob or Cloudinary) |
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

### Accounts You Need to Create (All Free, No Card)

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
├── Database: Neon PostgreSQL (hosted, connected via Prisma)
├── Storage: Vercel Blob OR Cloudinary (for file uploads)
└── Auth: JWT (stays the same — no external service needed)
```

---

### Phase 1 — Prepare Your Project for Production

#### Step 1: Create a `.env.production` File

Create `.env.production` in your project root (`c:\Nateng\nateng\.env.production`):

```bash
# Database - get this from Neon after setting up your database
DATABASE_URL="postgresql://user:password@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# JWT Secret - generate a random 64-character string
JWT_SECRET="your-64-character-random-secret-here-change-this-in-production"

# Vercel Blob - for file uploads (only if using Vercel Blob)
BLOB_READ_WRITE_TOKEN="your-blob-token-here"

# Cloudinary - for file uploads (only if using Cloudinary instead)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# App URL
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

> **⚠️ IMPORTANT:** Never commit this file to GitHub. It contains secrets. Add `.env.production` to your `.gitignore` if it's not already there.

#### Step 2: Generate a Strong JWT Secret

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output — that's your `JWT_SECRET`. It will look like:
`a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1`

**Save this somewhere safe** (like a password manager). You'll need it in Vercel later.

---

### Phase 2 — Set Up PostgreSQL Database with Neon

**What you're doing:** Creating a cloud-hosted PostgreSQL database to replace SQLite.

**Why:** Vercel serverless functions can't write to a local SQLite file. They need a remote database. Neon gives you a free PostgreSQL database that works perfectly with Prisma.

**Cost:** Free (500 MB storage, 100 compute hours per month). No credit card required.

#### Steps:

1. Go to https://neon.tech
2. Click **"Sign Up"** and sign in with GitHub
   - This authorizes Neon to use your GitHub identity
   - No credit card asked at any point
3. Click **"Create a project"**
4. Project name: `nateng-hub`
5. Region: Select **"Singapore"** (closest to Philippines — lower latency)
6. Click **"Create project"**

**What you should see:** A dashboard with your database connection string. It looks like:

```
postgresql://neondb_owner:xxxxxxxx@ep-yourserver-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

7. Click the **"Copy"** button to copy this string.
8. **Save it** — you'll use it as `DATABASE_URL` in Vercel.

> **Common Mistake:** If you lose this string, go to Neon Dashboard → Your Project → **"Connection Details"** to copy it again.

#### Update Prisma Schema for PostgreSQL

Edit `prisma/schema.prisma` in your project:

**Before (SQLite):**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**After (PostgreSQL):**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

The change is:
- `provider = "sqlite"` → `provider = "postgresql"`
- `url = "file:./dev.db"` → `url = env("DATABASE_URL")`

**All your models stay exactly the same.** Prisma handles the differences between SQLite and PostgreSQL automatically.

#### Run the Migration

```bash
c:
cd \Nateng\nateng

# Set your DATABASE_URL temporarily (replace with your actual Neon URL)
set DATABASE_URL=postgresql://neondb_owner:xxxxxxxx@ep-yourserver-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# Create the migration
npx prisma migrate dev --name init
```

**What you should see:**
```
Your database is now in sync with your schema.
✔ Generated Prisma Client (v5.x.x) to .\node_modules\@prisma\client
```

#### Verify the Migration

```bash
npx prisma studio
```

This opens a browser window at `http://localhost:5555` showing your database tables. Click through each table to verify the structure is correct.

> **If you get an SSL error:** Make sure your `DATABASE_URL` ends with `?sslmode=require`. This tells Prisma to use an encrypted connection.

---

### Phase 3 — Set Up Cloud Storage for File Uploads

**What you're doing:** Replacing local file storage with cloud storage.

**Why:** Files saved to `public/uploads/` on Vercel are lost on every deployment. Cloud storage keeps files permanently.

**You have two options, both card-free:**

| Option | Free Tier | Best For |
|--------|-----------|----------|
| **Vercel Blob** | 250 MB storage, 10K requests/day | Simple, built into Vercel |
| **Cloudinary** | 25 GB storage, 25 GB bandwidth | More features, larger free tier |

---

#### Option A: Vercel Blob (Simpler)

**Step 1: Install the package**

```bash
npm install @vercel/blob
```

**Step 2: Create a Blob store**

1. Go to your Vercel Dashboard → **Storage** tab
2. Click **"Create Database"** → **"Blob"**
3. Give it a name: `nateng-uploads`
4. Click **"Create"**
5. Copy the `BLOB_READ_WRITE_TOKEN` that appears
6. Save it — you'll add it to Vercel environment variables later

**Step 3: Update `app/api/upload/route.ts`**

Replace the entire file content with:

```javascript
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

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

---

#### Option B: Cloudinary (Larger Free Tier)

**Step 1: Create a Cloudinary account**

1. Go to https://cloudinary.com/signup
2. Sign up with email or Google/GitHub
3. **No credit card required** for the free tier
4. After signup, you'll see a dashboard with your **Cloud Name**, **API Key**, and **API Secret**

**Step 2: Install the Cloudinary SDK**

```bash
npm install cloudinary
```

**Step 3: Update `app/api/upload/route.ts`**

Replace the entire file content with:

```javascript
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "nateng-uploads" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ imageUrl: result.secure_url });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
```

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
   - Description: "Fresh vegetables marketplace connecting Benguet farmers with buyers"
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

> **Troubleshooting:** If you get an authentication error, you may need to use a Personal Access Token instead of a password. See GitHub's guide: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

#### Step 2: Connect Vercel to GitHub

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Click **"Install GitHub App"** if prompted (this lets Vercel read your repositories)
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

> **Why the build command includes `prisma generate`:** Prisma needs to generate its client code before the build. Without this, your code can't import `@prisma/client` and the build will fail.

#### Step 4: Add Environment Variables

Click **"Environment Variables"** and add these one at a time:

| Name | Value | Branch |
|------|-------|--------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string | All |
| `JWT_SECRET` | The 64-character string you generated earlier | All |
| `BLOB_READ_WRITE_TOKEN` | Your Vercel Blob token (if using Vercel Blob) | All |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name (if using Cloudinary) | All |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key (if using Cloudinary) | All |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret (if using Cloudinary) | All |
| `NEXT_PUBLIC_APP_URL` | Will be your domain once deployed | All |

> **How to get `BLOB_READ_WRITE_TOKEN`:**
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

> **If the build fails:** Check the build logs for the specific error. The most common issues are:
> - Missing environment variables (add them in Vercel Dashboard → Settings → Environment Variables)
> - Prisma client not generated (make sure build command is `npx prisma generate && next build`)
> - Database connection failed (verify `DATABASE_URL` is correct)

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
{"status":"ok","timestamp":"2026-07-28T..."}

# Test products
curl https://nateng-hub.vercel.app/api/products

# Expected:
{"data":[...]} or {"data":[]} (empty if no products)
```

#### Test in Browser

1. Open `https://nateng-hub.vercel.app` in your browser
2. Try registering a new account
3. Try logging in
4. Browse products
5. Add items to cart

If any of these fail, open your browser's Developer Tools (F12) → **Network** tab and look for failed API requests (shown in red).

---

### Phase 6 — Custom Domain

**What you're doing:** Using your own domain name instead of `nateng-hub.vercel.app`.

**Why:** It looks professional and is easier for users to remember.

#### Steps:

1. Buy a domain name from a registrar like Namecheap, GoDaddy, or Google Domains
   - Cost: Typically $8-15 per year
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
☐ Website loads at your URL
☐ Registration works (create Farmer, Buyer, Bulk Buyer accounts)
☐ Login works for all account types
☐ Logout works
☐ Session persists on page refresh
☐ Browse products
☐ Search/filter products
☐ Add items to cart
☐ Update cart quantity
☐ Remove items from cart
☐ Checkout/create order
☐ View order status
☐ Messages between buyers and farmers
☐ Delivery scheduling works
☐ Favorite listings
☐ Farmer dashboard loads
☐ Buyer dashboard loads
☐ Bulk buyer flows work
☐ Admin panel loads (localhost only)
☐ Admin can manage users
☐ Profile photo upload
☐ Contact form submission
☐ Mobile responsive (check on phone)
☐ All pages render without 404 errors
☐ API health endpoint returns OK
```

---

### Phase 8 — Troubleshooting

| # | Problem | Cause | Solution |
|---|---------|-------|----------|
| 1 | Build fails: "Can't find module '@prisma/client'" | Prisma client not generated | Add `npx prisma generate` to build command in Vercel |
| 2 | Build fails: "DATABASE_URL is not set" | Missing env var | Add `DATABASE_URL` to Vercel environment variables |
| 3 | Build fails: "JWT_SECRET is not set" | Missing env var | Add `JWT_SECRET` to Vercel environment variables |
| 4 | Login returns 500 error | Database connection failed | Check `DATABASE_URL` is correct and the database is running |
| 5 | Login returns "Unauthorized" | JWT secret mismatch | Make sure `JWT_SECRET` is set and consistent across all environments |
| 6 | File upload fails | Local storage path doesn't exist on Vercel | Migrate to Vercel Blob or Cloudinary (see Phase 3) |
| 7 | Images don't load | Image paths are local `/uploads/` paths | Use cloud storage URLs instead (Vercel Blob or Cloudinary) |
| 8 | Application loads slowly | Cold start on serverless functions | Normal for free tier. Upgrade to Vercel Pro for faster starts |
| 9 | Database connection timed out | Neon free tier goes to sleep after 5 minutes of inactivity | First request after idle will be slow (~3 seconds). Normal behavior |
| 10 | Prisma migration fails | PostgreSQL schema mismatch | Run `npx prisma migrate dev` locally and push migration to GitHub |
| 11 | "Relation does not exist" error | Migration not applied | Create initial migration with `npx prisma migrate dev --name init` |
| 12 | 404 on page refresh | No fallback routing configured | Vercel handles this automatically for Next.js — check if routes are correct |
| 13 | 504 Gateway Timeout | Function execution exceeded 10-second limit | Optimize database queries or increase function timeout in Vercel Pro |
| 14 | "Cannot read property of undefined" | Missing environment variable | Check all env vars are set in Vercel dashboard |
| 15 | Auth session doesn't persist | httpOnly cookie domain mismatch | Set `NEXT_PUBLIC_APP_URL` to match your domain |
| 16 | Admin page not restricted | Middleware not working | Verify `middleware.ts` has the correct matcher for `/admin/*` |
| 17 | CSS animations not working | Missing `tw-animate-css` import | Verify `@import "tw-animate-css"` is in `app/globals.css` |
| 18 | Prisma Studio won't connect to Neon | SSL connection issue | Add `?sslmode=require` to your `DATABASE_URL` |
| 19 | "Too many connections" error | Neon free tier connection limit (10 connections) | Reduce Prisma connection pool or upgrade Neon plan |
| 20 | Function timed out deploying | Large npm packages | Run `npm prune --production` before deploy to remove dev dependencies |
| 21 | Form submission fails silently | Network error | Open browser DevTools → Network tab to see actual error response |
| 22 | "Invalid `prisma.user.create()` invocation" | Schema mismatch | Run `npx prisma generate` after schema changes |
| 23 | Email notifications not sending | No email service configured | Add SendGrid, Resend, or similar email provider (separate setup) |
| 24 | Rate limiting blocks legitimate users | In-memory rate limiter doesn't work across serverless instances | Replace with database-backed rate limiter or skip for MVP |
| 25 | "Failed to fetch" errors | API route not deployed | Check Vercel deployment logs for function errors |
| 26 | Images return 403 | Hotlinking protection | Configure CORS and image access rules in your storage provider |
| 27 | Git push fails: "Authentication failed" | Password authentication deprecated | Use a GitHub Personal Access Token instead of password |
| 28 | Vercel deploy shows "Error: No output directory" | Build command failed | Check build logs for the actual error |
| 29 | Neon database is slow | Free tier has limited resources | Normal for free tier. Upgrade to paid for better performance |
| 30 | Can't connect to Neon from local machine | IP not allowed | Go to Neon Dashboard → Settings → IP Allow and add your IP |

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

Vercel will detect the push and start a new deployment automatically. You can watch progress at https://vercel.com/YOUR_USERNAME/nateng-hub/deployments

#### How to Roll Back a Deployment

1. Go to Vercel Dashboard → Your Project → **"Deployments"**
2. Find the working deployment (green checkmark ✓)
3. Click the **"..."** menu → **"Promote to Production"**

This instantly reverts your live site to the previous working version.

#### Monitor Logs

**Vercel logs:**

1. Go to Vercel Dashboard → Your Project → **"Logs"**
2. Filter by: Errors, Warnings, or All
3. Click any log entry to see the full error details

**Database logs (Neon):**

1. Go to https://console.neon.tech → Your Project
2. Click **"Monitoring"** in the left sidebar
3. View query performance, connection counts, and error rates

#### Check Analytics

**Vercel Analytics (built-in):**

1. Go to Vercel Dashboard → Your Project → **"Analytics"**
2. Click **"Enable"** on Web Analytics
3. After a few hours, you'll see visitor counts, page views, and geographic data

#### Backup PostgreSQL Database

Neon automatically creates daily backups. To manually backup:

```bash
# Install PostgreSQL tools if you don't have them
# Download from: https://www.postgresql.org/download/

# Backup your database
pg_dump --no-owner --no-acl "postgresql://user:pass@ep-host.aws.neon.tech/neondb" > backup_2026-07-28.sql
```

To restore from a backup:

```bash
psql "postgresql://user:pass@ep-host.aws.neon.tech/neondb" < backup_2026-07-28.sql
```

> **Pro tip:** Set up a monthly calendar reminder to take a manual backup. Even though Neon auto-backs up, having your own copy gives you extra safety.

#### Rotate Secrets

Every 90 days, update your `JWT_SECRET`:

1. Generate a new secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Update `JWT_SECRET` in Vercel Dashboard → Settings → Environment Variables
3. **Important:** All existing user sessions will be invalidated — users will need to log in again

#### Update Dependencies

Once a month, run:

```bash
npm outdated    # Check which packages need updating
npm update      # Update within version ranges
npm audit fix   # Fix security vulnerabilities
```

Then commit and push to redeploy:

```bash
git add package.json package-lock.json
git commit -m "Monthly dependency update"
git push origin main
```

---

## Card-Free Cost Summary

| Service | What It Provides | Free Tier Limits | Upgrade Cost |
|---------|-----------------|------------------|--------------|
| **Vercel** | Hosting, CDN, serverless functions | 100 GB bandwidth, 6000 build minutes/month, 100 serverless function executions/day | $20/month (Pro) |
| **Neon** | PostgreSQL database | 500 MB storage, 100 compute hours/month, 10 simultaneous connections | $19/month (Launch) |
| **Vercel Blob** | File/image storage | 250 MB storage, 10K requests/day | $10/month |
| **Cloudinary** | File/image storage (alternative) | 25 GB storage, 25 GB bandwidth/month | $89/month (Plus) |
| **GitHub** | Code hosting | Unlimited public repositories | $4/month (Pro) |
| **Total (free)** | | **$0/month** | |
| **Total (scaled)** | | | **~$20-50/month** |

> **Realistic cost for a small marketplace:** If you have ~100 daily active users, you'll likely stay within all free tiers for the first 6-12 months. When you outgrow them, upgrading Vercel to Pro ($20/mo) and Neon to Launch ($19/mo) gives you plenty of headroom.

---

## Quick Start — Deployment Checklist

```
Phase 1: Preparation (30 min)
☐ Install Node.js (https://nodejs.org)
☐ Install Git (https://git-scm.com)
☐ Install Vercel CLI: npm install -g vercel
☐ Create GitHub account (https://github.com)
☐ Create Vercel account (https://vercel.com)
☐ Create Neon account (https://neon.tech)

Phase 2: Database Setup (30 min)
☐ Create Neon PostgreSQL database
☐ Copy DATABASE_URL connection string
☐ Update prisma/schema.prisma: sqlite → postgresql
☐ Run: npx prisma migrate dev --name init
☐ Verify: npx prisma studio

Phase 3: Storage Setup (30 min)
☐ Choose: Vercel Blob OR Cloudinary
☐ If Vercel Blob: Create Blob store, copy token
☐ If Cloudinary: Create account, copy API keys
☐ Update app/api/upload/route.ts with new code

Phase 4: Environment Variables (10 min)
☐ Generate JWT_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
☐ Create .env.production with all variables

Phase 5: Deploy (15 min)
☐ git init && git add . && git commit -m "Initial commit"
☐ Create GitHub repository: nateng-hub
☐ git push -u origin main
☐ Connect GitHub to Vercel
☐ Add environment variables in Vercel dashboard
☐ Set build command: npx prisma generate && next build
☐ Click Deploy
☐ Verify: https://nateng-hub.vercel.app loads

Phase 6: Verification (1 hour)
☐ Website loads
☐ Registration works
☐ Login works
☐ Database reads/writes work
☐ API endpoints respond
☐ File upload works
☐ All pages render
☐ Mobile responsive

Phase 7: Production Readiness (30 min)
☐ Add custom domain
☐ Enable Vercel Analytics
☐ Set up monthly backup reminder
☐ Document rollback procedure
☐ Share URL with your first users!