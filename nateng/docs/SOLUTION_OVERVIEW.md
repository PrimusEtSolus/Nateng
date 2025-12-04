# NatengHub - Solution Overview

## Project Objectives

The main objective of this study is to design and develop **NatengHub**, a web-based digital marketplace application that integrates predictive data analytics and a hub-and-spoke logistics module to improve farmer income and optimize the vegetable market flow in Benguet. Specifically, it aims to achieve the following:

### 1. Information Requirements Identification
To identify the information requirements of the proposed system in terms of:
- **Crop Supply Forecasting**: Predictive analytics to forecast demand and supply patterns
- **Truck Ban-Compliant Delivery Scheduling**: Smart logistics scheduling aligned with Baguio City transport regulations

### 2. Architectural Framework Determination
To determine the architectural framework of the proposed system facilitating a **multi-actor ecosystem** for:
- **Farmers**: Primary producers who create products and listings
- **Resellers**: Wholesale traders who act as intermediate hubs
- **Businesses**: Restaurants, hotels, and institutions requiring bulk orders
- **Consumers**: Individual buyers seeking fresh produce

### 3. System Features Identification
To identify the features of the proposed system, focusing on:
- **Crop Programming Dashboards**: Market intelligence for farmers and Department of Agriculture
- **Virtual Trading**: Digital marketplace for buying and selling agricultural products
- **Smart Logistics**: Hub-and-spoke model with dynamic order consolidation

### 4. Usability Measurement
To measure the extent of usability of the proposed system based on **ISO 25010 software quality standards**.

---

## Proposed Solutions

### Problem Context

The agricultural landscape in Benguet is currently dominated by the **"trading post" model**, where prices are dictated by a multi-layered network of middlemen, leading to income disparities where farmers lose significant profit margins (Aquino et al., 2025). While previous attempts like Farm2Cart or Session Groceries existed, they primarily focused on a direct Business-to-Consumer (B2C) model. Recent studies indicate that B2C e-commerce has positively impacted the general performance of selected logistics service providers in Metro Manila, enhancing efficiency in order fulfillment, delivery speed, and overall operational adaptability (Sansaluna & Cruz, 2024). Furthermore, existing platforms often lack the data intelligence required to guide production, leaving farmers vulnerable to oversupply (Briones et al., 2023).

### Solution 1: Data Analytics and Cloud Computing

**Technology Integration**: Descriptive and Predictive Analytics

**Problem Addressed**: Information asymmetry is a key driver of challenges in the agricultural sector, including access to financing and markets (Bayudan-Dacuycuy et al., 2021).

**Implementation**:
- **Demand Forecasting**: By aggregating planting data across municipalities, the system utilizes analytics to generate demand forecasting visualizations
- **Crop Programming**: Analytics-driven crop programming visualizations help farmers make informed decisions based on market trends rather than speculation
- **Market Intelligence**: Provides "market intelligence" to the Department of Agriculture and individual farmers to reduce post-harvest losses, which can reach up to 44.55% for carrots due to defects, damages, and other factors (Antolin et al., 2024)

**Expected Outcomes**:
- Stabilize supply and prices by addressing market volatility and oversupply (Farmonaut, 2025)
- Enhance productivity by allowing farmers to make informed decisions (Ramos & Santos, 2024)
- Reduce post-harvest losses through better production planning

### Solution 2: Web-Based Collaborative Platform

**Technology Integration**: Hub-and-Spoke Logistics Model

**Problem Addressed**: Logistical bottlenecks caused by transport constraints and high costs

**Implementation**:
- **Dynamic Order Consolidation**: Enables the dynamic consolidation of orders from multiple buyers
- **Viajero System Digitization**: Digitizes the traditional "Viajero" system, allowing small orders from businesses and consumers to be consolidated into bulk deliveries
- **Transport Window Optimization**: Fits deliveries within available transport windows to avoid delays and costs (Fast Logistics, 2024)

**Expected Outcomes**:
- Reduce logistics costs through bulk consolidation
- Improve delivery efficiency
- Enable small orders to be economically viable

### Solution 3: Multi-Actor Ecosystem

**Problem Addressed**: Need for inclusive growth in agri-food systems

**Implementation**:
- **Resellers as Intermediate Hubs**: Introduces "Resellers" as intermediate hubs in the value chain
- **Business Integration**: Integrates "Businesses" (restaurants, hotels, institutions) as organized value chain participants
- **Value Chain Organization**: Aligns with findings from the Philippine Institute for Development Studies (2023), which suggest that inclusive growth requires integrating smallholders into larger, organized value chains rather than leaving them to navigate the market individually

**Expected Outcomes**:
- Improve farmer access to markets
- Create organized value chains
- Enable smallholder integration into larger systems

### Solution 4: Smart Logistics Scheduling

**Problem Addressed**: Transport constraints and compliance with Baguio City regulations

**Implementation**:
- **Truck Ban Compliance**: Aligns delivery bookings with permissible transport hours
- **Digitized Scheduling**: Digitizes the scheduling process to mitigate the risk of fines and delays that currently plague the logistics sector (Fast Logistics, 2024)
- **Automated Route Optimization**: Ensures deliveries comply with local transport regulations

**Expected Outcomes**:
- Reduce fines and delays
- Improve compliance with transport regulations
- Optimize delivery scheduling

---

## Current Implementation Alignment

### ✅ Implemented Features

#### 1. Multi-Actor Ecosystem
- **User Roles**: Farmer, Buyer, Business, Reseller, Admin
- **Role-Based Portals**: Separate dashboards for each actor type
- **Product Flow**: Farmer → Product → Listing → Order (supports all actor types)

#### 2. Virtual Trading Platform
- **Product Management**: Farmers can create and manage products
- **Listing System**: Sellers (farmers/resellers) can create listings with pricing
- **Order Management**: Buyers and businesses can place orders
- **Inventory Tracking**: Real-time inventory management with automatic decrement

#### 3. Database Architecture
- **Prisma ORM**: Type-safe database access
- **SQLite (Development)**: Local database for development
- **PostgreSQL Ready**: Schema supports production database migration
- **Transactional Safety**: Order creation uses database transactions

#### 4. API Infrastructure
- **RESTful API**: Complete CRUD operations for all entities
- **Error Handling**: Comprehensive error handling and validation
- **Query Filtering**: Support for filtering by role, status, availability

### 🚧 Features in Development

#### 1. Crop Programming Dashboard
- **Status**: Architecture in place (`/farmer/analytics`)
- **Next Steps**: 
  - Integrate predictive analytics
  - Add demand forecasting visualizations
  - Implement crop programming recommendations

#### 2. Smart Logistics Scheduling
- **Status**: Order management system in place
- **Next Steps**:
  - Add delivery scheduling module
  - Implement truck ban compliance logic
  - Create order consolidation algorithm

#### 3. Data Analytics Integration
- **Status**: Analytics page structure exists
- **Next Steps**:
  - Integrate descriptive analytics
  - Add predictive modeling
  - Create market intelligence dashboards

---

## Research Foundation

### Key Studies Referenced

1. **Aquino et al. (2025)**: Trading post model and income disparities
2. **Sansaluna & Cruz (2024)**: B2C e-commerce impact on logistics
3. **Briones et al. (2023)**: Data intelligence gaps in agricultural platforms
4. **Bayudan-Dacuycuy et al. (2021)**: Information asymmetry in agriculture
5. **Ramos & Santos (2024)**: Data-driven innovation in Philippine agriculture
6. **Farmonaut (2025)**: Market volatility and oversupply issues
7. **Antolin et al. (2024)**: Post-harvest losses (44.55% for carrots)
8. **Deichmann et al. (2016)**: Digital platforms for collective action
9. **Fast Logistics (2024)**: Transport constraints and logistics challenges
10. **Philippine Institute for Development Studies (2023)**: Inclusive growth in agri-food systems

---

## Technical Architecture

### Current Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite (dev) / PostgreSQL (production-ready)
- **ORM**: Prisma 5.9.0
- **Styling**: Tailwind CSS
- **Components**: Radix UI

### Planned Integrations
- **Analytics Engine**: Descriptive and predictive analytics
- **Logistics Module**: Hub-and-spoke order consolidation
- **Scheduling System**: Truck ban-compliant delivery scheduling
- **Market Intelligence**: Demand forecasting and crop programming

---

## Success Metrics (ISO 25010)

### Functional Suitability
- ✅ System supports all required user roles
- ✅ Core marketplace functionality operational
- 🚧 Analytics and logistics features in development

### Performance Efficiency
- ✅ Fast API response times
- ✅ Efficient database queries
- 🚧 Analytics processing optimization needed

### Compatibility
- ✅ Cross-browser support
- ✅ Responsive design
- ✅ Mobile-friendly interface

### Usability
- ✅ Intuitive user interfaces
- ✅ Role-based navigation
- 🚧 User testing pending

### Reliability
- ✅ Transactional safety
- ✅ Error handling
- ✅ Data validation

### Security
- 🚧 Authentication system (planned)
- 🚧 Authorization (planned)
- 🚧 Input validation (partial)

### Maintainability
- ✅ TypeScript for type safety
- ✅ Modular architecture
- ✅ Comprehensive documentation

### Portability
- ✅ Cloud-ready architecture
- ✅ Database abstraction (Prisma)
- ✅ Environment-based configuration

---

## Next Steps

1. **Analytics Integration**
   - Implement demand forecasting algorithms
   - Create crop programming visualizations
   - Add market intelligence dashboards

2. **Logistics Module**
   - Develop order consolidation algorithm
   - Implement delivery scheduling system
   - Add truck ban compliance logic

3. **User Testing**
   - Conduct usability testing with target users
   - Gather feedback on ISO 25010 metrics
   - Iterate based on findings

4. **Production Readiness**
   - Implement authentication and authorization
   - Add comprehensive input validation
   - Set up production database
   - Configure monitoring and logging

---

## Conclusion

NatengHub represents a comprehensive solution to the challenges facing Benguet's agricultural sector. By integrating data analytics, collaborative platforms, and smart logistics, the system aims to:

- **Improve farmer income** by reducing middleman layers and providing market intelligence
- **Optimize market flow** through predictive analytics and demand forecasting
- **Enable inclusive growth** by integrating smallholders into organized value chains
- **Reduce post-harvest losses** through better production planning
- **Comply with logistics regulations** through smart scheduling

The current implementation provides a solid foundation with a fully functional marketplace, multi-actor ecosystem, and robust technical architecture. The next phase focuses on integrating advanced analytics and logistics features to fully realize the project objectives.

