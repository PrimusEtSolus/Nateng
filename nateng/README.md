# NatengHub - Digital Marketplace for Benguet Agriculture

> A web-based digital marketplace application that integrates predictive data analytics and a hub-and-spoke logistics module to improve farmer income and optimize the vegetable market flow in Benguet.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Features](#features)
- [Documentation](#documentation)
- [Development](#development)
- [Testing](#testing)

## 🎯 Project Overview

NatengHub is designed to address the challenges facing Benguet's agricultural sector by:

1. **Reducing Information Asymmetry**: Providing market intelligence and demand forecasting to farmers
2. **Optimizing Logistics**: Implementing a hub-and-spoke model with smart scheduling for truck ban compliance
3. **Enabling Multi-Actor Collaboration**: Facilitating a digital ecosystem connecting farmers, resellers, businesses, and consumers
4. **Improving Farmer Income**: Reducing middleman layers and providing direct market access

### Key Objectives

- ✅ Identify information requirements for crop supply forecasting and delivery scheduling
- ✅ Determine architectural framework for multi-actor ecosystem
- ✅ Identify system features: crop programming dashboards, virtual trading, smart logistics
- ✅ Measure usability based on ISO 25010 software quality standards

For detailed information about the solution approach and research foundation, see [SOLUTION_OVERVIEW.md](./docs/SOLUTION_OVERVIEW.md).

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# 0.nateng dir
cd nateng

# 1. Install dependencies
npm install

# 2. Set up database
npx prisma generate
npx prisma migrate dev --name init

# 3. Seed sample data (optional)
npm run seed

# 4. Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

For detailed setup instructions, see [QUICK_START.md](./docs/QUICK_START.md) or [README_BACKEND.md](./docs/README_BACKEND.md).

## 🏗️ Architecture

NatengHub implements a **multi-actor ecosystem architecture** with the following components:

### Multi-Actor System

- **Farmers**: Create products and listings, access crop programming dashboards
- **Resellers**: Act as intermediate hubs for wholesale trading
- **Businesses**: Restaurants, hotels, and institutions requiring bulk orders
- **Consumers/Buyers**: Individual end-users purchasing products

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (development) / PostgreSQL (production-ready)
- **ORM**: Prisma 5.9.0
- **Components**: Radix UI

### Planned Integrations

- **Data Analytics**: Descriptive and predictive analytics for demand forecasting
- **Smart Logistics**: Hub-and-spoke order consolidation with truck ban compliance
- **Crop Programming**: Market intelligence dashboards for farmers

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## ✨ Features

### ✅ Implemented

- **Multi-Actor Portals**: Role-based dashboards for farmers, buyers, businesses, and resellers
- **Product Management**: Create, update, and manage products with image upload support
- **Listing System**: Sellers can create listings with pricing, inventory, and product images
- **Order Management**: Complete order lifecycle with status tracking
- **Inventory Tracking**: Real-time inventory management with automatic decrement
- **Shopping Cart**: Persistent cart with localStorage
- **RESTful API**: Complete CRUD operations for all entities
- **Database**: Prisma ORM with SQLite/PostgreSQL support
- **Authentication System**: Full user registration and login with bcrypt password hashing
- **User-to-User Messaging**: Direct messaging between buyers and sellers
- **Notification System**: Real-time notifications for orders, messages, and status updates
- **Complete Order Flow**: End-to-end order processing with automatic notifications
- **Image Upload System**: Sellers can upload product images (JPEG, PNG, WebP up to 5MB)
- **Enhanced Product Display**: Product images displayed across all buyer interfaces
- **Farmer Settings**: Configurable payment methods, delivery areas, and minimum order in kg
- **Farmer Logistics**: Benguet coverage map with ordinance compliance and penalties

### 🚧 In Development

- **Crop Programming Dashboard**: Market intelligence and demand forecasting
- **Smart Logistics**: Order consolidation and delivery scheduling
- **Analytics Integration**: Descriptive and predictive analytics
- **JWT Authentication**: Upgrade from localStorage to JWT tokens

## 📚 Documentation

All documentation files have been organized in the [`docs/`](./docs/) directory.

### Core Documentation

- **[SOLUTION_OVERVIEW.md](./docs/SOLUTION_OVERVIEW.md)** - Complete solution overview, objectives, and research foundation
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and technical design
- **[QUICK_START.md](./docs/QUICK_START.md)** - Quick start guide and common patterns
- **[README_BACKEND.md](./docs/README_BACKEND.md)** - Backend API documentation
- **[FULLSTACK_IMPLEMENTATION.md](./docs/FULLSTACK_IMPLEMENTATION.md)** - Complete full-stack implementation guide

### Testing & Quality

- **[TESTING_CHECKLIST.md](./docs/TESTING_CHECKLIST.md)** - Comprehensive testing checklist (updated 2026-02-06)
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - Root testing checklist
- **[DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md)** - Deployment preparation checklist

### Additional Resources

- **[MARKETPLACE_SETUP.md](./docs/MARKETPLACE_SETUP.md)** - Detailed marketplace setup guide
- **[IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md)** - Feature implementation summary
- **[BUILD_COMPLETE.md](./docs/BUILD_COMPLETE.md)** - Build and deployment status
- **[STATUS.md](./docs/STATUS.md)** - Current project status

See the [`docs/`](./docs/) directory for all documentation files including testing reports, bug reports, and implementation summaries.

## 🛠️ Development

### Project Structure

```
nateng/
├── app/                    # Next.js app directory
│   ├── api/               # Backend API routes
│   ├── farmer/           # Farmer portal
│   ├── buyer/            # Buyer portal
│   ├── business/         # Business portal
│   ├── reseller/         # Reseller portal
│   └── splash/           # Landing page
├── components/           # React components
├── lib/                  # Utilities and helpers
│   ├── api-client.ts    # API client wrapper
│   └── prisma.ts        # Prisma client
├── hooks/               # Custom React hooks
├── prisma/              # Database schema and migrations
└── public/              # Static assets
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
```

### Build & Test Status

✅ **Build Status**: `npm run build` passes successfully  
✅ **API Tests**: `node test-api-comprehensive.js` covers 12 endpoints with full CRUD verification  
✅ **Reseller→Buyer Flow**: Complete - resellers can add products via modal, buyers see listings immediately

### Reseller→Buyer Path

The marketplace now supports the complete reseller-to-buyer flow:

1. **Resellers** can add products via the "Add Product" modal in `/reseller/inventory`
2. **Products** appear immediately in the reseller's inventory table
3. **Buyers** see reseller listings on `/buyer/dashboard` (filtered to reseller inventory only)
4. **Orders** flow from buyer cart → checkout → order confirmation → reseller fulfillment

This creates a direct B2C channel where buyers purchase exclusively from reseller listings.

### API Endpoints

- `GET/POST /api/products` - Product management
- `GET/POST /api/listings` - Listing management
- `GET/POST /api/orders` - Order management (requires Authorization header)
- `GET/POST /api/users` - User management
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/upload` - Image upload for products
- `GET/POST /api/messages` - User-to-user messaging
- `GET/PATCH /api/notifications` - Notification management
- `PATCH /api/users/[id]` - Update user (supports farmer settings fields)

For detailed API documentation, see [README_BACKEND.md](./README_BACKEND.md).

### Authentication & User Management

**Registration:**
- Users can register as: Farmer, Buyer, Business, or Reseller
- Passwords are hashed with bcrypt (10 rounds)
- Email uniqueness enforced

**Login:**
- Secure password authentication
- Session management via localStorage (upgradeable to JWT)
- Automatic role-based dashboard redirection

**Seed Data:**
- Running `npm run seed` creates sample users, products, and listings for testing
- Users can register new accounts through the signup pages

For complete implementation details, see [FULLSTACK_IMPLEMENTATION.md](./FULLSTACK_IMPLEMENTATION.md).

## 🧪 Testing

### Testing Status: ✅ READY FOR TESTING

**Last Updated**: 2026-02-06 (Farmer Settings & Logistics Update)

#### Key Test Areas

- **Farmer Settings**: Blank payment methods for new accounts; minimum order in kg; delivery areas derived from location
- **Farmer Logistics**: New page at /farmer/logistics with Benguet coverage and ordinance compliance
- **API Authorization**: Fixed Unauthorized error in /api/orders
- **Database Persistence**: New farmer settings fields (minimumOrderKg, deliveryAreas, paymentMethods)

#### Test Checklists

- **[Comprehensive Testing Checklist](./docs/TESTING_CHECKLIST.md)** - Detailed test scenarios for all features
- **[Root Testing Checklist](./TESTING_CHECKLIST.md)** - Quick reference testing guide

#### Running Tests

```bash
# API endpoint testing
node tests/test-api-comprehensive.js

# Authentication testing
node tests/test-auth-comprehensive.js

# User persistence testing
node tests/test-user-persistence-and-interactions.js

# Generate test data
node tests/generate-test-data.js
```

#### Recent Fixes (2026-02-06)

- ✅ Fixed "Unauthorized" error when fetching orders in logistics dashboard
- ✅ Added Authorization header to /api/orders requests
- ✅ Implemented farmer settings persistence (minimumOrderKg, deliveryAreas, paymentMethods)
- ✅ Created farmer logistics page with ordinance compliance information
- ✅ Updated farmer sidebar to link to /farmer/logistics

## 🎓 Research Foundation

This project is based on extensive research into:

- Agricultural market challenges in Benguet
- Information asymmetry in agricultural sectors
- B2C e-commerce impact on logistics
- Data-driven innovation in Philippine agriculture
- Inclusive growth in agri-food systems
- Post-harvest loss reduction strategies

See [SOLUTION_OVERVIEW.md](./docs/SOLUTION_OVERVIEW.md) for complete research references and citations.

## 📊 Project Status

**Current Status**: ✅ Core marketplace functionality operational

- ✅ Multi-actor ecosystem implemented
- ✅ Virtual trading platform functional
- ✅ Database architecture complete
- ✅ API infrastructure ready
- ✅ Farmer settings and logistics implemented
- 🚧 Analytics integration in progress
- 🚧 Smart logistics module in development

For detailed status information, see [STATUS.md](./STATUS.md).

## 🤝 Contributing

This is a capstone project. For questions or contributions, please refer to the project documentation.

## 📄 License

This project is part of a capstone research study.

---

**Built with ❤️ for Benguet's agricultural community**

For more information, see [SOLUTION_OVERVIEW.md](./docs/SOLUTION_OVERVIEW.md).

