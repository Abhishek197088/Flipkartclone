# Flipkart Clone - Fullstack E-Commerce E-commerce Platform

An SDE Intern Fullstack Assignment submission. This project replicates the layout, design patterns, and e-commerce checkout flows of Flipkart using a React.js SPA frontend and an Express.js backend.

## 🚀 Tech Stack Used

- **Frontend**: React.js (Single Page Application, built with Vite for fast HMR)
- **Styling**: Custom Vanilla CSS (no CSS frameworks, complying with assignment guidelines to achieve pixel-perfect layout and custom micro-animations)
- **Icons**: Lucide React
- **Backend**: Node.js & Express.js
- **Database ORM**: Sequelize (supporting PostgreSQL, MySQL, and SQLite)
- **Default Database**: SQLite (chosen for zero-configuration, instant local execution by evaluators, stored in `backend/database.sqlite`)

---

## 🛠️ System Design & Database Schema

A relational database design with foreign keys, checks, and cascade rules is implemented. The raw PostgreSQL database schema is documented in [`schema.sql`](./schema.sql).

### Entity-Relationship Structure
1. **`Users`**: Stores account emails, hashed passwords, and contact info.
2. **`Addresses`**: Stores multiple shipping addresses for user checkouts.
3. **`Categories`**: Holds catalog category details (e.g. Mobiles, Fashion, etc.).
4. **`Products`**: Stores product details (price, MRP, discount%, stars, specifications JSON, stock, and assured flags).
5. **`ProductImages`**: Multi-image association per product for detail view carousels.
6. **`CartItems`**: Connects users to selected products and quantities.
7. **`Wishlists`**: Connects users to saved items.
8. **`Orders`**: Records transactional checkpoints (ID, bill amounts, COD/Card methods, status, and shipping address JSON snapshots).
9. **`OrderItems`**: Captures product snaps (price, title, image) at checkout time for historical invoices.

---

## 🌟 Implemented Features

### 1. Product Listing Page (Grid & Categories)
- **Flipkart Blue Header**: Replicates standard layout with search, mock user sessions, order log links, and cart counts.
- **Top Categories Panel**: Horizontal bar with custom images for Mobiles, Electronics, Fashion, Home, and Appliances. Filters catalog on click.
- **Hero Offer Banners**: Auto-cycling banner slides demonstrating summer sales and device discount promotions.
- **Product Listing Grid**: Responsive grid. Product cards include star badges, slashed original prices with green discount highlights, free delivery indicators, "Flipkart Assured" badges, and wishlist heart toggles.
- **Catalog Search**: Real-time filters querying backend product names and brands.

### 2. Product Detail Page
- **Thumbnail Image Gallery**: Hovering or clicking vertical thumbnails changes the central product image.
- **Price Indicators**: Shows MRP, savings discounts, and active stock levels.
- **Marketing Offer Badges**: Replicates bank cashback tags.
- **Service Pin Checker**: Interactive delivery check rendering specific dates when entering pincodes.
- **Specifications Table**: Renders technical spec grids dynamically parsed from JSON spec records.

### 3. Shopping Cart Management
- **Items Listing**: View quantity, price details, and seller net.
- **Quantity Adjuster**: Increment/decrement selectors validating remaining stock.
- **Action Triggers**: "Save for Later" and "Remove" triggers immediately synchronizing cart lists.
- **Price Details Card**: Price computations, discount totals, shipping bills (Free above ₹500), and final savings.

### 4. Accordion Checkout & Order Placement
- **Step-by-Step Flow**: Numbered accordions showing Login, Delivery Address, Order Summary, and Payments.
- **Shipping Address Form**: Entry forms for name, phone, pincode, area details, and state types (Home/Work).
- **Payment Method Selectors**: Cash on Delivery (COD) and mocked Card/UPI endpoints.
- **Confirmation Page**: Renders unique order IDs (`ODXXXXXXXXXXXX`), delivery dates, and shipping address snapshots.

### 5. Bonus Features
- **Order History**: Dashboard listing all past orders with status dots and item details.
- **Wishlist Manager**: Lists wishlisted items, enabling quick removal or immediate checkout transfers.
- **Pre-Authenticated default session**: No registration required to test checkout flows.

---

## ⚡ Setup & Run Instructions

Ensure Node.js (v18+) is installed on your local machine.

### Step 1: Install & Start Backend API Server
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the database seed script to populate categories and product lists:
   ```bash
   npm run seed
   ```
4. Start the Express server (starts on `http://localhost:5000`):
   ```bash
   npm start
   ```

### Step 2: Install & Start Frontend Web App
1. Open a new terminal tab and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server (starts on `http://localhost:5173`):
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🔑 Demo Credentials

A default account is pre-seeded for testing all cart, wishlist, and checkout operations out-of-the-box:
- **Email**: `user@flipkart.com`
- **Password**: `password123`
*(A "Use Default User Credentials" quick-fill link is also available on the header's Login Modal).*

---

## 📝 Design Decisions & Assumptions

- **SQLite for Reviewers**: We configured the SQLite dialect in Sequelize config to run out-of-the-box without requiring installation of PostgreSQL/MySQL, while keeping Sequelize fully ready to swap to PostgreSQL via environment variables.
- **SPA Custom Router State**: We chose state-based client-side routing (`currentPage` and `selectedProductId` states inside AppContext) to keep page switches instant and prevent routing setup delays.
- **Address Snapshots**: When an order is placed, the address and item info are snapshotted as text inside the order, preserving correct invoice data even if the user deletes their address later.
