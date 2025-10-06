# Training Center Module Specification

## Overview

The Training Center module provides course management, learner tracking, and session scheduling for wellness education institutions offering certifications, workshops, and professional development programs.

## Target Users

- **Role**: `CENTER`
- **Access**: `/pro/centre/*`
- **User Types**: Training centers, schools, institutes offering wellness, holistic health, naturopathy, massage therapy, yoga teacher training, etc.

## Core Features

### 1. Dashboard (`/pro/dashboard`)

**KPIs**:
- Active learners count
- Upcoming sessions
- Course enrollment this month
- Revenue this month

**Quick Insights**:
- Next 5 sessions (date, formation, enrolled/capacity)
- Recent enrollments
- Course completion rate
- Popular formations

### 2. Formations (Course Catalog) (`/pro/centre/formations`)

#### 2.1 Formation List
**Route**: `/pro/centre/formations`

**Features**:
- List all training programs
- Filter by: Category, level, format, published status
- Search by title or keyword
- Sort by: Most recent, most enrolled, highest rated
- Quick actions: Duplicate, archive, publish/unpublish

**Formation Card**:
- Cover image
- Title and subtitle
- Duration (hours) and level
- Format (présentiel, distanciel, hybride)
- Price
- Enrolled learners count
- Published status

#### 2.2 Formation Detail
**Route**: `/pro/centre/formations/[slug]`

**Sections**:

**Overview**:
- Title, description
- Duration (total hours)
- Level (débutant, intermédiaire, avancé, expert)
- Format (in-person, remote, hybrid)
- Price and payment options
- Maximum participants per session
- Category and tags
- Prerequisites
- Learning objectives
- Syllabus/curriculum
- Certification provided

**Sessions**:
- List of scheduled sessions for this formation
- Create new session button
- Session cards showing:
  - Start and end dates
  - Location
  - Enrolled / Max participants
  - Instructor
  - Status (planned, open, full, in_progress, completed, cancelled)

**Enrollments**:
- Learners enrolled across all sessions
- Completion statistics
- Certificate generation

**Content** (Future):
- Course materials (PDFs, videos)
- Modules and lessons
- Assignments and assessments

#### 2.3 New/Edit Formation
**Route**: `/pro/centre/formations/nouvelle`

**Form Fields**:

**General Information**:
- Title (required)
- Subtitle/tagline
- Description (rich text)
- Cover image
- Category (massage, naturopathy, yoga, business, etc.)
- Tags (certification, beginner-friendly, weekend, online)

**Details**:
- Duration (total hours)
- Level (dropdown)
- Format (radio: présentiel, distanciel, hybride)
- Maximum participants (per session)
- Price (€)
- Prerequisites (text)
- Learning objectives (bullet list)

**Content**:
- Syllabus (structured modules and topics)
- Materials list (books, equipment needed)
- Certification details (certificate name, accreditation body)

**Publishing**:
- Published (toggle)
- Featured on homepage (toggle)
- Public visibility

**Data Model**:
```typescript
type Formation = {
  id: string;
  centerId: string;
  slug: string;
  title: string;
  description: string;
  duration: number; // hours
  level: "débutant" | "intermédiaire" | "avancé" | "expert";
  format: "présentiel" | "distanciel" | "hybride";
  price: number;
  maxParticipants: number;
  category: string;
  tags: string[];
  syllabus?: string;
  prerequisites?: string;
  certification?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 3. Sessions (`/pro/centre/formations/sessions`)

#### 3.1 Session List
**Route**: `/pro/centre/formations/sessions`

**Features**:
- Calendar view or list view toggle
- Filter by formation, status, date range
- Upcoming sessions highlighted
- Quick actions: View details, manage enrollments, cancel session

**Session Card**:
- Formation title
- Session dates (start - end)
- Schedule (days and times)
- Location or video conferencing link
- Instructor name
- Enrolled / Max participants
- Status badge

#### 3.2 Session Detail
**Route**: `/pro/centre/formations/sessions/[sessionId]`

**Tabs**:

1. **Information**:
   - Formation reference
   - Start and end dates
   - Schedule (Mon-Fri 9am-5pm, etc.)
   - Location (address or online platform)
   - Instructor
   - Max participants
   - Current enrollment count
   - Price (can override formation base price)

2. **Enrollments**:
   - List of enrolled learners
   - Learner contact info
   - Enrollment date
   - Payment status
   - Attendance tracking (checkboxes per day)
   - Progress/completion percentage
   - Certificate status

3. **Materials**:
   - Shared documents
   - Video recordings
   - Assignments
   - Resources

4. **Communication**:
   - Send announcements to enrolled learners
   - Message history

**Session Workflow**:
```
Planned → Open for enrollment → Full → In Progress → Completed
                                                   ↘ Cancelled
```

#### 3.3 New Session
**Route**: `/pro/centre/formations/[slug]/sessions/nouvelle`

**Form**:
- Select formation (pre-filled if coming from formation detail)
- Start date (date picker)
- End date (date picker)
- Schedule (days of week and times)
- Location (address) OR online (platform URL)
- Instructor name
- Max participants (default from formation)
- Price (default from formation, can override)
- Status (planned, open)

**Data Model**:
```typescript
type Session = {
  id: string;
  formationId: string;
  startDate: string;
  endDate: string;
  location?: string;
  instructorName?: string;
  maxParticipants: number;
  enrolledCount: number;
  status: "planned" | "open" | "full" | "in_progress" | "completed" | "cancelled";
  price: number;
}
```

### 4. Learners (`/pro/centre/apprenants`)

#### 4.1 Learner List
**Route**: `/pro/centre/apprenants`

**Features**:
- Searchable learner directory
- Filter by status (active, inactive, graduated)
- Sort by: Name, enrollment date, course count
- Quick actions: View profile, contact, export data

**Learner Card**:
- Name, email, phone
- Enrolled since date
- Active enrollments count
- Completed formations
- Status badge

#### 4.2 Learner Detail
**Route**: `/pro/centre/apprenants/[id]`

**Sections**:

**Profile**:
- Personal information (name, email, phone, address)
- Learner since date
- Status (active, inactive, graduated)
- Notes

**Enrollments**:
- List of all enrollments (past and current)
- Formation name, session dates
- Enrollment date
- Status (enrolled, in progress, completed, dropped)
- Progress percentage
- Certificate (if completed)

**Payments**:
- Payment history
- Outstanding balance
- Invoices

**Communication**:
- Message history
- Send email

**Data Model**:
```typescript
type Learner = {
  id: string;
  centerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  enrolledAt: string;
  status: "active" | "inactive" | "graduated";
  enrollments: Array<{
    sessionId: string;
    enrolledAt: string;
    status: "enrolled" | "completed" | "dropped";
    progress?: number;
    certificateUrl?: string;
  }>;
}
```

#### 4.3 New Learner
**Route**: `/pro/centre/apprenants/nouveau`

**Form**:
- First name, last name
- Email (required)
- Phone
- Address
- Initial enrollment (optional: select session to enroll immediately)

### 5. Statistics (`/pro/centre/statistiques`)

**Metrics**:
- **Enrollment**: New enrollments, total active learners, dropout rate
- **Revenue**: Total, by formation, by month
- **Capacity**: Average session fill rate, utilization percentage
- **Completion**: Course completion rate, certificate issuance
- **Popular Formations**: Most enrolled, highest revenue

**Charts**:
- Enrollment trend (line chart)
- Revenue by formation (bar chart)
- Learner status distribution (pie chart)
- Session capacity heatmap

**Filters**: Date range, formation, instructor

### 6. Pre-Accounting (`/pro/centre/precompta`)

**Features**:
- Track formation revenue
- Expense tracking (instructor fees, materials, rent, marketing)
- Payment reconciliation
- Revenue by formation type
- Monthly financial summary

**Income Categories**:
- Formation fees (auto-generated from enrollments)
- Certification fees
- Material sales

**Expense Categories**:
- Instructor salaries
- Venue rental
- Course materials
- Marketing/advertising
- Administrative costs

See [Practitioner Pre-Accounting](./practitioner.md#5-pre-accounting-propraticienprecompta) for core features.

### 7. Common Professional Features

All features under `/pro/commun/*`:
- Public profile (center page)
- SpymCom community
- Directory
- Notes
- Messages
- Advantages
- PASS Partner

## User Journeys

### Journey: Create and Launch New Formation
```
1. Navigate to /pro/centre/formations/nouvelle
2. Fill formation details:
   - Title: "Certification en Naturopathie - Module 1"
   - Description: Comprehensive first module covering foundations
   - Duration: 120 hours
   - Level: Débutant
   - Format: Hybride (in-person + online)
   - Price: €1,800
   - Max participants: 20
   - Prerequisites: None
   - Syllabus: 10 modules outlined
3. Publish formation
4. Create first session:
   - Start date: 2025-11-01
   - End date: 2026-02-28
   - Schedule: Saturdays 9am-6pm
   - Location: Campus address
   - Instructor: Dr. Marie Dubois
5. Set session status to "Open"
6. Formation visible on public center page
7. Learners can enroll
```

### Journey: Manage Session Enrollments
```
1. Open /pro/centre/formations/sessions/[sessionId]
2. Review enrollment list (15/20 enrolled)
3. Check payment status for each learner
4. Mark attendance for recent class session
5. Upload class materials (PDF handout)
6. Send announcement to all enrolled:
   - "Next class: Module 3 - Nutrition"
   - "Please review Chapter 5 before class"
7. Update learner progress percentages
8. Generate certificates for completed module
```

### Journey: Onboard New Learner
```
1. Navigate to /pro/centre/apprenants/nouveau
2. Enter learner details:
   - Name: Sophie Martin
   - Email: sophie@example.com
   - Phone: 06 12 34 56 78
3. Save learner profile
4. Enroll in session:
   - Select formation: "Massage Suédois Certification"
   - Select session: November 2025 cohort
   - Record payment
5. Send welcome email with:
   - Session details
   - Access to online platform
   - Materials list
   - Preparation instructions
6. Learner added to session roster
```

## API Endpoints

**Formations**:
- `GET /api/centre/formations` - List formations
- `POST /api/centre/formations` - Create formation
- `GET /api/centre/formations/:slug` - Formation details
- `PUT /api/centre/formations/:slug` - Update formation
- `DELETE /api/centre/formations/:slug` - Delete formation

**Sessions**:
- `GET /api/centre/sessions` - List all sessions
- `POST /api/centre/sessions` - Create session
- `GET /api/centre/sessions/:id` - Session details
- `PUT /api/centre/sessions/:id` - Update session
- `DELETE /api/centre/sessions/:id` - Cancel session

**Learners**:
- `GET /api/centre/apprenants` - List learners
- `POST /api/centre/apprenants` - Add learner
- `GET /api/centre/apprenants/:id` - Learner profile
- `PUT /api/centre/apprenants/:id` - Update learner
- `POST /api/centre/apprenants/:id/enroll` - Enroll in session

**Statistics**:
- `GET /api/stats?role=center`

## Security

**Authentication**: Required
**Role**: `CENTER` only
**RBAC**: `/pro/centre/*` routes protected

**Data Isolation**: Centers only see their own formations, sessions, learners

## Performance

**Optimizations**:
- Pagination for large learner lists
- Cache formation catalog
- Lazy load session details
- Index searches by formation, learner name

## Future Enhancements

1. **Learning Management System (LMS)**: Full online course delivery
2. **Video Conferencing**: Integrated virtual classroom
3. **Assignments & Grading**: Homework submission and evaluation
4. **Quizzes & Exams**: Online assessments with auto-grading
5. **Progress Tracking**: Detailed learner progress dashboards
6. **Certificate Templates**: Custom certificate design and generation
7. **Payment Plans**: Installment payment options
8. **Waiting Lists**: Auto-enrollment when spots open
9. **Alumni Network**: Post-graduation community
10. **Accreditation Management**: Track regulatory compliance
11. **Instructor Portal**: Separate interface for teachers
12. **Mobile App**: Native app for learners
13. **API Integrations**: Zoom, Google Classroom, Moodle
14. **Marketing Automation**: Email campaigns for course launches
15. **Analytics**: Learner engagement metrics, drop-off analysis

## Related Documentation

- [Architecture](../architecture.md)
- [Data Model](../data-model.md)
- [Pro API](../api/pro.yaml)

---

Last updated: 2025-10-06
