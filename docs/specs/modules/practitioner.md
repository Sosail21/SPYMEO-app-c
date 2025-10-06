# Practitioner Module Specification

## Overview

The Practitioner module provides comprehensive tools for wellness professionals (naturopaths, sophrologistsosteneurs, therapists, etc.) to manage their practice digitally. It includes client management, appointment scheduling, consultation tracking, pre-accounting, learning resources, and community features.

## Target Users

- **Role**: `PRACTITIONER`
- **Access**: `/pro/praticien/*`
- **User Types**: Naturopaths, therapists, osteopaths, sophrologistsosteneurs, wellness coaches, and other health professionals

## Core Features

### 1. Dashboard (`/pro/dashboard`)

**Purpose**: Central hub showing key metrics and quick actions.

**Components**:
- KPI cards: Today's appointments, week revenue, new clients, completion rate
- Upcoming appointments (next 3)
- Recent client activity
- Quick actions: New appointment, new client, new consultation note
- Statistics charts: Revenue trend, appointment distribution

**Data Sources**:
- `/api/stats` - Aggregate metrics
- `/api/agenda/events` - Appointments
- `/api/clients` - Client list

### 2. Client Management (`/pro/praticien/fiches-clients`)

**Purpose**: Complete client lifecycle management with health records.

#### 2.1 Client List
**Route**: `/pro/praticien/fiches-clients`

**Features**:
- Searchable/filterable client list
- Sort by: Name, last visit, creation date
- Quick view panel with client summary
- Bulk actions: Export to CSV, archive

**UI Components**:
- `<ClientList />` - Main table with search
- `<ClientQuickPanel />` - Sidebar preview
- `<ClientToolbar />` - Search and filters

#### 2.2 Client Detail
**Route**: `/pro/praticien/fiches-clients/[id]`

**Tabs**:
1. **Identity**: Personal information, contact details, birth date
2. **Antecedents**: Medical history categorized (medical, surgical, allergies, medications, lifestyle)
3. **Consultations**: Chronological consultation history
4. **Documents**: Uploaded files and shared documents
5. **Invoices**: Billing history

**API Endpoints**:
- `GET /api/clients/:id` - Client details
- `PUT /api/clients/:id` - Update client
- `GET /api/clients/:id/antecedents` - Health history
- `POST /api/clients/:id/antecedents` - Add antecedent
- `GET /api/clients/:id/consultations` - Consultation history
- `POST /api/clients/:id/consultations` - New consultation
- `GET /api/clients/:id/docs` - Documents
- `POST /api/clients/:id/docs` - Upload document
- `GET /api/clients/:id/invoices` - Invoices

**Workflows**:
```
New Client → Identity Form → Save → Redirect to Detail
Consultation → Record notes → Attach invoice → Save → Update client history
Document Upload → Select file → Add metadata → Save → Share with client (optional)
```

### 3. Agenda/Calendar (`/pro/praticien/agenda`)

**Purpose**: Visual appointment scheduling with availability management.

#### 3.1 Calendar View
**Route**: `/pro/praticien/agenda`

**Features**:
- Month/week/day views
- Drag-and-drop rescheduling
- Color-coded by type (consultation, blocked, personal)
- Client quick info on hover
- Double-click to create appointment
- Right-click context menu

**Technical**:
- Client-side component: `'use client'`
- Calendar library integration (FullCalendar or similar)
- Real-time updates on changes

**API Endpoints**:
- `GET /api/agenda/events` - All events
- `POST /api/agenda/events` - Create event
- `PUT /api/agenda/events/:id` - Update event
- `DELETE /api/agenda/events/:id` - Delete event

#### 3.2 Agenda Settings
**Route**: `/pro/praticien/agenda/settings`

**Configuration**:
- Business hours (days and times)
- Default appointment duration
- Slot duration (15/30/60 min)
- Booking settings:
  - Allow online bookings: Yes/No
  - Booking lead time (hours)
  - Cancellation policy text
- Blocked periods (vacations, unavailability)

**API Endpoints**:
- `GET /api/agenda/settings`
- `PUT /api/agenda/settings`

### 4. Statistics (`/pro/praticien/statistiques`)

**Purpose**: Business intelligence and performance tracking.

**Metrics**:
- **Revenue**: Total, by period, average per consultation
- **Consultations**: Count, duration distribution, completion rate
- **Clients**: New, returning, retention rate
- **Appointments**: Booked, cancelled, no-shows
- **Occupancy rate**: Percentage of available slots filled

**Visualizations**:
- Line charts: Revenue over time
- Bar charts: Consultations per week/month
- Pie charts: Consultation types distribution
- Heatmap: Appointment density by day/hour

**Filters**:
- Date range picker
- Period granularity (day/week/month/year)
- Client segment

**Export**:
- PDF report generation
- CSV data export

**API Endpoints**:
- `GET /api/stats?period=month&from=2025-01&to=2025-10`

### 5. Pre-Accounting (`/pro/praticien/precompta`)

**Purpose**: Financial tracking for simplified tax reporting.

#### 5.1 Transactions
**Features**:
- Income/expense tracking
- Categorization (customizable)
- Receipt attachment
- Bank account reconciliation (manual)
- Payment method tracking
- Status workflow: Pending → Validated → Reconciled

**UI**:
- Transaction table with filters
- Add transaction form
- Bulk import from CSV
- Monthly summary cards

#### 5.2 Receipts
**Features**:
- Upload scanned receipts (PDF, JPG, PNG)
- Link to transactions
- OCR suggestion (future)
- Download original files

#### 5.3 Configuration
**Route**: `/pro/praticien/precompta/config`

**Settings**:
- Fiscal year
- Tax regime (micro-entreprise, réel simplifié, réel normal)
- Income categories (consultations, workshops, products)
- Expense categories (rent, supplies, training, insurance)
- Bank accounts

**API Endpoints**:
- `GET /api/precompta/transactions`
- `POST /api/precompta/transactions`
- `GET /api/precompta/receipts`
- `POST /api/precompta/receipts`
- `GET /api/precompta/config`
- `PUT /api/precompta/config`

### 6. Academy (`/pro/praticien/academie`)

**Purpose**: Continuous professional development through structured learning.

#### 6.1 Lesson Library
**Route**: `/pro/praticien/academie`

**Features**:
- Browse lessons by category, tag, difficulty
- Filter: My favorites, In progress, Completed
- Search by keyword
- Sort by: Most recent, Most liked, Duration

**Lesson Types**:
- **Cours**: Theoretical content
- **Guide**: Step-by-step tutorials
- **Atelier**: Practical workshops

**Lesson Card**:
- Cover image
- Title, duration, difficulty
- Tags (e.g., "juridique", "marketing", "bien-être")
- Like count, comment count
- Progress indicator

#### 6.2 Lesson Detail
**Route**: `/pro/praticien/academie/[lessonId]`

**Components**:
- Video/audio player or article content
- Progress tracking (auto-save)
- Personal notes section
- Comments section (community discussion)
- Related lessons
- "Mark as complete" button

**Interactions**:
- Like lesson
- Add to favorites
- Take notes (private, markdown supported)
- Post comment
- Share with colleagues

**API Endpoints**:
- `GET /api/academy/lessons` - All lessons
- `GET /api/academy/progress` - User progress
- `PUT /api/academy/progress` - Update progress
- `GET /api/academy/notes?lessonId=x` - User notes
- `POST /api/academy/notes` - Create note
- `GET /api/academy/comments?lessonId=x` - Lesson comments
- `POST /api/academy/comments` - Post comment

### 7. Resources (`/pro/praticien/ressources`)

**Purpose**: Shared professional resource library.

**Features**:
- Browse uploaded resources (templates, guides, tools)
- Filter by category and tags
- Preview documents
- Download files
- Upload new resources
- Share resources with specific users
- Rate and review resources

**Resource Types**:
- Documents (PDF, Word, Excel)
- Templates (consultation forms, invoices)
- Visual assets (infographics, posters)
- Tools (calculators, checklists)

**Permissions**:
- PUBLIC: Visible to all
- PASS: PASS members only
- PRO: Professionals only

**API Endpoints**:
- `GET /api/resources?category=x&tag=y`
- `POST /api/resources` (multipart upload)
- `GET /api/resources/:id/download`
- `POST /api/resources/share`

### 8. Blog Submission (`/pro/praticien/blog-proposer`)

**Purpose**: Allow practitioners to contribute articles to the platform blog.

**Workflow**:
1. Practitioner writes article (title, excerpt, content, category, tags)
2. Submits for moderation (status: `pending`)
3. Admin reviews and approves/rejects
4. If approved, article is published on public blog

**Form Fields**:
- Title (required)
- Excerpt (short summary)
- Content (Markdown editor)
- Cover image (upload)
- Category (dropdown)
- Tags (multi-select)
- Save as draft or submit

**API Endpoints**:
- `POST /api/articles` - Submit article
- `GET /api/articles?authorId=me` - My articles

### 9. Shared Office (`/pro/praticien/cabinet-partage`)

**Purpose**: Find and list office sharing opportunities.

**Features**:
- Browse available office spaces
- Filter by city, type, price, amenities
- Create office listing
- Contact office owner
- Manage own listings

**Listing Types**:
- Individual desk
- Treatment room
- Full cabinet

**API**: Future implementation (mock UI exists)

### 10. Impact Program (`/pro/praticien/impact`)

**Purpose**: Apply for community impact projects and grants.

**Features**:
- View impact program details
- Submit candidature (project proposal)
- Track candidature status
- View feedback from reviewers

**Candidature Form**:
- Project title
- Project description
- Motivation
- Expected impact

**Status Workflow**:
Draft → Submitted → Reviewing → Accepted/Rejected

**API Endpoints**:
- `GET /api/pro/impact` - Program info and my candidatures
- `POST /api/pro/impact/candidature` - Submit

### 11. Common Professional Features (`/pro/commun/*`)

Shared across all professional roles (Practitioner, Artisan, Merchant, Center).

#### 11.1 Public Profile (`/pro/commun/fiche`)
Edit public profile visible on `/praticien/:slug`
- Display name, bio, specialty
- Contact information
- Profile photo
- Services offered
- Availability

#### 11.2 SpymCom (`/pro/commun/spymcom`)
Community chat and forums
- Channels by topic
- Direct messages
- File sharing
- Announcements

#### 11.3 Directory (`/pro/commun/repertoire`)
- **Spymeo Directory**: Browse all professionals
- **Personal Directory**: Saved contacts

#### 11.4 Notes (`/pro/commun/notes`)
Personal note-taking system (not client-specific)

#### 11.5 Messages (`/pro/commun/messages`)
Internal messaging with other professionals and clients

#### 11.6 Advantages (`/pro/commun/avantages`)
Create and manage member perks/discounts

#### 11.7 PASS Partner (`/pro/commun/pass-partenaire`)
Manage partnership with PASS members
- Offer discount to PASS members
- Track redemptions
- View PASS member benefits

## User Journeys

### Journey 1: New Client Onboarding
```
1. Navigate to /pro/praticien/fiches-clients
2. Click "Nouveau client"
3. Fill in identity form (name, email, phone, birth date)
4. Save client
5. Add antecedents (medical history)
6. Schedule first consultation (redirect to agenda)
7. Create consultation note after appointment
8. Generate invoice
```

### Journey 2: Weekly Planning
```
1. Open /pro/praticien/agenda
2. Switch to week view
3. Review existing appointments
4. Block unavailable time slots (lunch, personal)
5. Add new appointments from booking requests
6. Set reminders for special clients
7. Check agenda settings for online booking configuration
```

### Journey 3: Monthly Accounting
```
1. Navigate to /pro/praticien/precompta
2. Review pending transactions
3. Upload receipts for expenses
4. Link receipts to transactions
5. Validate transactions
6. Export CSV for accountant
7. Review monthly summary
```

### Journey 4: Professional Development
```
1. Open /pro/praticien/academie
2. Browse new courses
3. Start "Statut juridique" course
4. Watch video, take notes
5. Mark chapter as complete
6. Post question in comments
7. Receive notification when answered
```

## Data Model

See [data-model.md](../data-model.md) for complete type definitions.

**Key Entities**:
- Client
- Consultation
- Antecedent
- ClientDocument
- Invoice
- Event (agenda)
- Transaction
- Receipt
- Lesson
- Progress
- Note

## Security & Permissions

**Authentication**: Required (cookie session)
**Role**: `PRACTITIONER` only
**RBAC**: Enforced in middleware (`/pro/praticien/*` routes)

**Data Isolation**:
- Practitioners can only access their own clients
- Client IDs are scoped to practitioner
- No cross-practitioner data access

## Performance Considerations

**Client-side**:
- Agenda: Client component with optimized rendering
- Client list: Pagination or virtualization for large lists
- Stats: Lazy load charts, cache results

**Server-side**:
- Index client searches by practitioner ID
- Eager load related data (consultations, invoices)
- Cache statistics calculations

## Future Enhancements

1. **Client Portal**: Allow clients to book, view documents, communicate
2. **Automated Reminders**: SMS/email appointment reminders
3. **Online Payment**: Integrate payment gateway for invoices
4. **OCR**: Automatic receipt data extraction
5. **AI Assistant**: Consultation note suggestions
6. **Video Consultations**: Built-in video call feature
7. **E-Prescriptions**: Digital prescription generation
8. **Analytics ML**: Predictive insights (churn risk, optimal pricing)
9. **Mobile App**: Native iOS/Android apps
10. **Integrations**: Calendar sync (Google, Outlook), accounting software

## Related Documentation

- [Architecture](../architecture.md) - System design
- [Data Model](../data-model.md) - Database schema
- [API Specifications](../api/) - Endpoint details
- [Clients API](../api/clients.yaml) - Client management endpoints
- [Agenda API](../api/agenda.yaml) - Calendar endpoints
- [Academy API](../api/academy.yaml) - Learning platform endpoints
- [Pre-Accounting API](../api/precompta.yaml) - Financial endpoints

---

Last updated: 2025-10-06
