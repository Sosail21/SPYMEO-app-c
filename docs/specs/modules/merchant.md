# Merchant Module Specification

## Overview

The Merchant module provides e-commerce capabilities for wellness product sellers (organic shops, supplement stores, wellness equipment, etc.) to manage products, inventory, orders, and online sales.

## Target Users

- **Role**: `COMMERCANT`
- **Access**: `/pro/commercant/*`
- **User Types**: Organic shops, supplement stores, natural cosmetics, wellness equipment sellers, apothecaries

## Core Features

### 1. Dashboard (`/pro/dashboard`)

**KPIs**:
- Today's orders
- Week revenue
- Products sold
- Inventory alerts (low stock)

**Quick Insights**:
- Pending orders count
- Top-selling products
- Stock movements
- Revenue chart (last 30 days)

### 2. Product Catalog (`/pro/commercant/produits`)

#### 2.1 Product List
**Route**: `/pro/commercant/produits`

**Features**:
- Grid/list view toggle
- Search by name/SKU
- Filter by category, availability, stock status
- Sort by: Name, price, stock, created date
- Bulk actions: Export, update prices, toggle availability
- Quick edit inline

**Product Card Display**:
- Primary image
- Name and SKU
- Price (with compare-at-price if on sale)
- Stock quantity with visual indicator
- Category and tags
- Availability toggle

#### 2.2 Product Detail
**Route**: `/pro/commercant/produits/[slug]`

**Tabs**:
1. **General**: Title, description, images, category, tags
2. **Pricing**: Price, compare-at price, cost, margin
3. **Inventory**: SKU, barcode, stock quantity, low stock alert
4. **Shipping**: Weight, dimensions, shipping class
5. **SEO**: Slug, meta description, keywords

#### 2.3 New/Edit Product
**Route**: `/pro/commercant/produits/nouveau`

**Form Sections**:

**General Information**:
- Title (required)
- Description (rich text editor)
- Short description/excerpt
- Images (multiple upload with primary selection)
- Category (hierarchical: Supplements > Vitamins > Vitamin C)
- Tags (multi-select: vegan, organic, gluten-free, etc.)

**Pricing**:
- Regular price (required)
- Compare-at price (for sales)
- Cost per item (for margin calculation)
- Currency (EUR)

**Inventory**:
- SKU (auto-generated or manual)
- Barcode (EAN, UPC)
- Stock quantity
- Low stock threshold
- Continue selling when out of stock (toggle)

**Shipping**:
- Weight (kg)
- Dimensions (L x W x H cm)
- Requires shipping: Yes/No
- Shipping class (standard, fragile, refrigerated)

**Availability**:
- Published (toggle)
- Featured (toggle for homepage)
- Available for online purchase

**Data Model**:
```typescript
type Product = {
  id: string;
  merchantId: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  category: string;
  tags: string[];
  images: string[];
  stock: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };
  available: boolean;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 3. Orders (`/pro/commercant/commandes`)

#### 3.1 Order List
**Route**: `/pro/commercant/commandes`

**Features**:
- Order list with filters
- Filter by status (pending, confirmed, shipped, delivered, cancelled)
- Search by order number or customer name
- Date range filter
- Quick actions: Print packing slip, mark as shipped

**Order Card**:
- Order number and date
- Customer name and contact
- Items count and total amount
- Payment status
- Fulfillment status
- Tags (priority, gift, etc.)

#### 3.2 Order Detail
**Route**: `/pro/commercant/commandes/[id]`

**Sections**:

**Order Summary**:
- Order number, date
- Customer information (name, email, phone, shipping address)
- Items ordered (product name, quantity, unit price, total)
- Subtotal, tax, shipping, total

**Timeline**:
- Order received
- Payment confirmed
- Order prepared
- Shipped (with tracking)
- Delivered
- Reviewed (customer feedback)

**Actions**:
- Update status
- Add internal notes
- Contact customer
- Print invoice
- Print packing slip
- Refund (partial or full)
- Cancel order

**Order Workflow**:
```
New Order → Pending Payment → Paid → Preparing → Shipped → Delivered
                                                          ↘ Cancelled/Refunded
```

**Data Model**:
```typescript
type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  merchantId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  shippingAddress: Address;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}
```

### 4. Stock Management (`/pro/commercant/stock`)

**Purpose**: Track inventory movements and stock levels.

**Features**:
- Current stock overview (all products)
- Low stock alerts
- Out of stock products
- Stock movements history
- Adjust stock (manual corrections)
- Bulk stock update (CSV import)

**Stock Movement Types**:
- **In**: Restocking, returns, adjustments
- **Out**: Sales, damages, samples
- **Adjustment**: Inventory count corrections

**Movement Record**:
```typescript
type StockMovement = {
  id: string;
  productId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  reference?: string; // Order ID or supplier ref
  date: string;
  notes?: string;
}
```

**UI**:
- Product stock table with current quantity
- Red indicator for low stock
- Yellow indicator for approaching low stock threshold
- Filter by stock status
- Quick adjust stock modal

### 5. Clients (`/pro/commercant/clients`)

**Purpose**: Customer relationship management.

**Features**:
- Customer list with lifetime value
- Order history per customer
- Contact information
- Customer notes
- Segmentation (VIP, regular, new)
- Export customer data

**Customer Metrics**:
- Total orders
- Total spent
- Average order value
- Last order date
- Customer since date

### 6. Statistics (`/pro/commercant/statistiques`)

**Dashboards**:

**Sales Overview**:
- Revenue by period
- Orders count
- Average order value
- Conversion rate (visitors to buyers)

**Product Performance**:
- Top-selling products
- Revenue by category
- Products with highest margin
- Slow-moving inventory

**Customer Insights**:
- New vs returning customers
- Customer lifetime value
- Repeat purchase rate
- Customer acquisition cost

**Inventory Health**:
- Stock turnover rate
- Dead stock value
- Carrying cost

**Charts**:
- Revenue trend (line chart)
- Sales by category (pie chart)
- Orders by day of week (bar chart)
- Stock value distribution

### 7. Pre-Accounting (`/pro/commercant/pre-compta`)

**Features**:
- Automatic transaction creation from orders
- Expense tracking (supplies, shipping, marketing)
- Receipt management
- Product cost vs revenue analysis
- Profit margin calculation
- Tax reporting data

**Income Categories**:
- Product sales (auto-generated from orders)
- Shipping fees
- Gift wrapping

**Expense Categories**:
- Inventory purchase
- Packaging materials
- Shipping costs
- Marketing/advertising
- Platform fees
- Rent/utilities

See [Practitioner Pre-Accounting](./practitioner.md#5-pre-accounting-propraticienprecompta) for core pre-accounting features.

### 8. Common Professional Features

All features under `/pro/commun/*` are available:
- Public profile (merchant page)
- SpymCom community
- Directory
- Notes
- Messages
- Advantages (discounts for community)
- PASS Partner (special offers for PASS members)

## User Journeys

### Journey: New Product Launch
```
1. Navigate to /pro/commercant/produits/nouveau
2. Fill product details:
   - Name: "Complément Magnésium Marin Bio 200g"
   - Description: Benefits, ingredients, usage
   - Upload product images (front, back, ingredients label)
   - Price: €24.90
   - Category: Supplements > Minerals
   - Tags: organic, vegan, made-in-france
3. Set inventory:
   - SKU: MAG-MER-200
   - Initial stock: 50 units
   - Low stock alert: 10 units
4. Configure shipping:
   - Weight: 0.25kg
   - Standard shipping class
5. Publish product
6. Product appears on public merchant page
7. Monitor sales and stock
```

### Journey: Process Daily Orders
```
1. Open /pro/commercant/commandes
2. Filter by status: "pending"
3. Review new orders (5 orders)
4. For each order:
   - Open order detail
   - Verify items in stock
   - Mark as "preparing"
   - Pick products from inventory
   - Pack order
   - Generate shipping label
   - Add tracking number
   - Mark as "shipped"
   - Send tracking email to customer
5. Update stock movements automatically
6. Review pre-accounting transactions
```

### Journey: Stock Replenishment
```
1. Check /pro/commercant/stock
2. View low stock alerts (3 products)
3. Order from suppliers:
   - Magnesium: +50 units
   - Vitamin C: +30 units
   - Probiotics: +20 units
4. Record stock movements:
   - Type: "in"
   - Reason: "Supplier restocking"
   - Reference: Supplier invoice number
5. Update stock quantities
6. Products return to normal stock levels
7. Add expense transaction for purchase
```

## API Endpoints

**Products**:
- `GET /api/commercant/produits` - List products
- `POST /api/commercant/produits` - Create product
- `GET /api/commercant/produits/:slug` - Product details
- `PUT /api/commercant/produits/:slug` - Update product
- `DELETE /api/commercant/produits/:slug` - Delete product

**Orders**:
- `GET /api/commercant/commandes` - List orders
- `GET /api/commercant/commandes/:id` - Order details
- `PUT /api/commercant/commandes/:id` - Update order

**Stock**:
- `GET /api/commercant/stock` - Stock overview
- `POST /api/commercant/stock/adjust` - Adjust stock
- `GET /api/commercant/stock/movements` - Movement history

**Clients**:
- `GET /api/commercant/clients` - List customers

**Statistics**:
- `GET /api/stats?role=commercant`

## Data Sources (Mock)

Mock data stores:
- `src/lib/mockdb/products-commercant.ts`
- `src/lib/mockdb/orders-commercant.ts`
- `src/lib/mockdb/stock-commercant.ts`
- `src/lib/mockdb/clients-commercant.ts`
- `src/lib/mockdb/stats-commercant.ts`
- `src/lib/mockdb/precompta-commercant.ts`

## Security

**Authentication**: Required
**Role**: `COMMERCANT` only
**RBAC**: `/pro/commercant/*` routes protected

**Data Isolation**: Merchants only see their own products, orders, customers

## Performance

**Optimizations**:
- Image optimization and CDN for product photos
- Lazy loading for large product catalogs
- Pagination for orders and products
- Cache product listings
- Index searches by SKU, name, category

## Future Enhancements

1. **Online Store**: Embedded or standalone e-commerce site
2. **Inventory Forecasting**: AI-predicted restock dates
3. **Multi-Channel Selling**: Sync with Shopify, WooCommerce
4. **Dropshipping**: Direct supplier integration
5. **Loyalty Program**: Points and rewards for customers
6. **Subscription Products**: Recurring monthly deliveries
7. **Product Variants**: Sizes, colors, flavors
8. **Bundles & Kits**: Product combinations
9. **Pre-Orders**: Sell before stock arrival
10. **Abandoned Cart Recovery**: Email reminders
11. **Product Reviews**: Customer ratings and feedback
12. **Wholesale Mode**: B2B pricing and bulk orders
13. **Shipping Integrations**: Colissimo, Chronopost APIs
14. **Payment Gateway**: Stripe, PayPal integration
15. **Analytics**: Google Analytics, conversion tracking

## Related Documentation

- [Architecture](../architecture.md)
- [Data Model](../data-model.md)
- [Pro API](../api/pro.yaml)

---

Last updated: 2025-10-06
