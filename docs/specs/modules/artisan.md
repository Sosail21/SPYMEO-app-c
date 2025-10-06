# Artisan Module Specification

## Overview

The Artisan module provides tools for service providers (massage therapists, bodyworkers, yoga instructors, etc.) to manage their service catalog, bookings, clients, and finances.

## Target Users

- **Role**: `ARTISAN`
- **Access**: `/pro/artisan/*`
- **User Types**: Massage therapists, bodyworkers, yoga/pilates instructors, personal trainers, beauty professionals

## Core Features

### 1. Dashboard (`/pro/dashboard`)

**KPIs**:
- Today's bookings
- Week revenue
- New clients
- Service completion rate

**Quick Actions**:
- New booking
- New service
- View calendar

### 2. Service Catalog (`/pro/artisan/catalogue/services`)

#### 2.1 Service List
**Route**: `/pro/artisan/catalogue/services`

**Features**:
- List all services with pricing
- Toggle availability (active/inactive)
- Quick edit
- Duplicate service
- Archive service

**Service Card Display**:
- Title and description
- Duration and price
- Category/tags
- Availability status
- Booking count

#### 2.2 New/Edit Service
**Route**: `/pro/artisan/catalogue/services/nouveau`

**Form Fields**:
- Title (required)
- Description (rich text)
- Duration (minutes)
- Price and currency
- Category (dropdown: massage, yoga, training, beauty, etc.)
- Images (multiple upload)
- Available (toggle)
- Booking options:
  - Allow online booking
  - Requires deposit
  - Max bookings per day

**Data Model**:
```typescript
type Service = {
  id: string;
  providerId: string;
  title: string;
  description: string;
  duration?: number;
  price: number;
  currency: string;
  category: string;
  available: boolean;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### 3. Orders/Bookings (`/pro/artisan/ventes/commandes`)

**Purpose**: Manage service bookings and orders.

**Features**:
- List all orders with status
- Filter by status (pending, confirmed, completed, cancelled)
- Order details view
- Update order status
- Add notes to orders
- Generate invoice

**Order Workflow**:
```
New Booking → Pending → Confirmed → In Progress → Completed
                    ↘ Cancelled
```

**Order Properties**:
- Order number (auto-generated)
- Customer information
- Service(s) booked
- Date and time
- Total amount
- Payment status
- Notes

**Data Model**:
```typescript
type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  providerId: string;
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  total: number;
  status: OrderStatus;
  orderDate: string;
  completedAt?: string;
  notes?: string;
}

type OrderItem = {
  serviceId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
```

### 4. Clients (`/pro/artisan/clients`)

**Purpose**: Basic client relationship management.

**Features**:
- Client list with contact info
- Search and filter
- Client booking history
- Client notes
- Contact client (email/phone)
- Export client list

**Client Card**:
- Name, email, phone
- Total bookings
- Total spent
- Last booking date
- Tags/labels

### 5. Statistics (`/pro/artisan/statistiques`)

**Metrics**:
- Revenue (total, by period, by service)
- Bookings (count, completion rate)
- Popular services
- Client retention
- Average booking value
- Busiest days/times

**Charts**:
- Revenue trend line
- Service distribution pie chart
- Booking heatmap by day/hour

**Export**: PDF report, CSV data

### 6. Pre-Accounting (`/pro/artisan/precompta`)

**Features**:
- Transaction tracking (same as Practitioner)
- Receipt management
- Income categorization by service type
- Expense tracking
- Monthly summaries
- Tax regime configuration

See [Practitioner Pre-Accounting](./practitioner.md#5-pre-accounting-propraticienprecompta) for detailed specs.

### 7. Common Professional Features

All features under `/pro/commun/*` are available:
- Public profile
- SpymCom community
- Directory
- Notes
- Messages
- Advantages
- PASS Partner

See [Practitioner Common Features](./practitioner.md#11-common-professional-features-procommun) for details.

## User Journeys

### Journey: Service Setup and First Booking
```
1. Create service catalog
   - Add "Massage suédois 60min" (€60)
   - Add "Yoga privé 90min" (€80)
   - Upload service images

2. Configure availability
   - Set business hours
   - Block vacation periods

3. Receive first booking
   - Customer books online
   - Order status: Pending

4. Confirm booking
   - Review order details
   - Change status to Confirmed
   - Send confirmation to customer

5. Complete service
   - Mark order as Completed
   - Generate invoice
   - Add transaction to pre-accounting
```

### Journey: Monthly Financial Review
```
1. Open Statistics dashboard
2. Review month revenue by service
3. Identify best-performing services
4. Navigate to Pre-Accounting
5. Validate pending transactions
6. Upload missing receipts
7. Export data for accountant
```

## API Endpoints

**Services**:
- `GET /api/artisan/services` - List services
- `POST /api/artisan/services` - Create service
- `GET /api/artisan/services/:id` - Service details
- `PUT /api/artisan/services/:id` - Update service
- `DELETE /api/artisan/services/:id` - Delete service

**Orders**:
- `GET /api/artisan/orders` - List orders
- `POST /api/artisan/orders` - Create order
- `GET /api/artisan/orders/:id` - Order details
- `PUT /api/artisan/orders/:id` - Update order status

**Clients**:
- `GET /api/artisan/clients` - List clients
- `GET /api/artisan/clients/:id` - Client details

**Statistics**:
- `GET /api/stats?role=artisan&period=month`

## Data Sources (Mock)

Current implementation uses mock data stores:
- `src/lib/mockdb/services-artisan.ts`
- `src/lib/mockdb/orders-artisan.ts`
- `src/lib/mockdb/clients-artisan.ts`
- `src/lib/mockdb/stats-artisan.ts`
- `src/lib/mockdb/precompta-artisan.ts`

## Security

**Authentication**: Required
**Role**: `ARTISAN` only
**RBAC**: `/pro/artisan/*` routes protected

**Data Isolation**: Artisans only see their own services, orders, clients

## Performance

**Optimizations**:
- Image optimization for service photos
- Lazy loading for order history
- Cache popular services
- Pagination for large order lists

## Future Enhancements

1. **Online Booking Widget**: Embeddable booking form for external websites
2. **Recurring Bookings**: Subscription-based services (weekly yoga classes)
3. **Package Deals**: Bundle multiple services (10-session package)
4. **Gift Certificates**: Purchase and redemption system
5. **Customer Portal**: Self-service booking and history view
6. **Automated Reminders**: SMS/email before appointment
7. **Reviews & Ratings**: Customer feedback system
8. **Equipment Management**: Track materials and inventory
9. **Staff Management**: For artisans with employees
10. **Mobile Check-in**: QR code scanning for appointments

## Related Documentation

- [Architecture](../architecture.md)
- [Data Model](../data-model.md)
- [Pro API](../api/pro.yaml)
- [Statistics API](../api/pro.yaml#/paths/~1stats)

---

Last updated: 2025-10-06
