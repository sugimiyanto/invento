# Frontend Plan - Invento 2 (Inventory Management)

## Tech Stack Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form + Zod validation
- **State Management**: Tanstack Query (React Query) untuk server state
- **Tables**: Tanstack Table
- **Date Handling**: date-fns
- **CSV Parsing**: papaparse

## Color Scheme & Design System

### Color Palette
```css
/* Primary (untuk buttons, links, highlights) */
primary: hsl(222.2 47.4% 11.2%)  /* Dark blue-gray */
primary-foreground: hsl(210 40% 98%)

/* Secondary */
secondary: hsl(210 40% 96.1%)
secondary-foreground: hsl(222.2 47.4% 11.2%)

/* Accent (untuk highlights, badges) */
accent: hsl(210 40% 96.1%)
accent-foreground: hsl(222.2 47.4% 11.2%)

/* Success, Warning, Destructive */
success: hsl(142 76% 36%)  /* Green */
warning: hsl(45 100% 51%)   /* Yellow */
destructive: hsl(0 84.2% 60.2%)  /* Red */

/* Background */
background: hsl(0 0% 100%)
foreground: hsl(222.2 84% 4.9%)

/* Muted (untuk disabled states, subtle backgrounds) */
muted: hsl(210 40% 96.1%)
muted-foreground: hsl(215.4 16.3% 46.9%)

/* Border */
border: hsl(214.3 31.8% 91.4%)
```

### Typography
- **Font Family**: Inter atau System UI
- **Headings**: font-semibold atau font-bold
- **Body**: font-normal
- **Small text**: text-sm
- **Sizes**:
  - h1: text-4xl
  - h2: text-3xl
  - h3: text-2xl
  - h4: text-xl
  - body: text-base
  - small: text-sm
  - tiny: text-xs

### Spacing
Menggunakan Tailwind spacing scale (4px increments):
- xs: p-2 (8px)
- sm: p-4 (16px)
- md: p-6 (24px)
- lg: p-8 (32px)
- xl: p-10 (40px)

## Page Layouts

### 1. Login Page (`/login`)
**Layout**: Centered card pada full-screen background
```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│          ┌────────────────┐            │
│          │   Logo/Icon     │            │
│          │                 │            │
│          │  Invento 2      │            │
│          │  Inventory Mgmt │            │
│          │                 │            │
│          │  [Sign in with  │            │
│          │   Google]       │            │
│          │                 │            │
│          └────────────────┘            │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**Components**:
- Logo/branding
- Tagline/description
- "Sign in with Google" button (large, prominent)
- Footer with app version

**Style**:
- Clean, minimal
- Centered card dengan subtle shadow
- Background: subtle gradient atau solid color

---

### 2. Dashboard Layout (`/` dan routes lainnya)
**Layout**: Sidebar + Main Content
```
┌────────┬────────────────────────────────┐
│        │  Header/Navbar                 │
│ Side   ├────────────────────────────────┤
│ bar    │                                │
│        │  Main Content Area             │
│        │                                │
│ - Home │                                │
│ - Prod │                                │
│ - User │                                │
│ (Admin)│                                │
│        │                                │
│ User   │                                │
│ Info   │                                │
│ Logout │                                │
└────────┴────────────────────────────────┘
```

**Sidebar** (fixed, 240px width):
- Logo/App name di top
- Navigation menu:
  - Dashboard (Home)
  - Products (Barang)
  - Users (Admin only)
- User info di bottom (avatar, name, role)
- Logout button

**Header/Navbar** (sticky):
- Breadcrumbs
- Page title
- Search bar (global - jika ada)
- User menu (avatar, dropdown)

**Main Content**:
- Padding: p-6 atau p-8
- Background: bg-gray-50 atau bg-white
- Cards dengan shadow untuk sections

---

### 3. Dashboard Home (`/`)

**For Readonly Users**:
```
┌──────────────────────────────────────────┐
│  Dashboard                                │
├──────────────────────────────────────────┤
│                                           │
│  ┌─────────────────────────────────┐    │
│  │  Search Box (large)             │    │
│  │  "Cari nama barang..."           │    │
│  └─────────────────────────────────┘    │
│                                           │
│  ┌──────────────┐                        │
│  │ Total Barang │                        │
│  │    1,234     │                        │
│  └──────────────┘                        │
│                                           │
│  Recent Products Viewed:                 │
│  ┌────────────────────────────────────┐ │
│  │ Product 1                          │ │
│  │ Product 2                          │ │
│  │ Product 3                          │ │
│  └────────────────────────────────────┘ │
│                                           │
└──────────────────────────────────────────┘
```

**For Admin Users**:
```
┌──────────────────────────────────────────┐
│  Dashboard                                │
├──────────────────────────────────────────┤
│                                           │
│  Stats Cards (Grid 3 cols):              │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │Total │  │Stock │  │Total │          │
│  │Barang│  │ Low  │  │Value │          │
│  │1,234 │  │  12  │  │ Rp1M │          │
│  └──────┘  └──────┘  └──────┘          │
│                                           │
│  Quick Actions:                          │
│  ┌────────────┐  ┌────────────┐        │
│  │ + Add      │  │ Import CSV │        │
│  │   Product  │  │            │        │
│  └────────────┘  └────────────┘        │
│                                           │
│  Recent Activity Log:                    │
│  ┌────────────────────────────────────┐ │
│  │ User A added "Product X"           │ │
│  │ User B updated "Product Y"         │ │
│  │ User A imported 50 products        │ │
│  └────────────────────────────────────┘ │
│                                           │
└──────────────────────────────────────────┘
```

---

### 4. Products List Page (`/products`)

```
┌────────────────────────────────────────────┐
│  Products                   [+ Add] [Import]│
├────────────────────────────────────────────┤
│                                             │
│  Search: [____________]  Category: [____▼] │
│                                             │
│  ┌──────────────────────────────────────┐ │
│  │ Table Header                         │ │
│  │ Kode | Nama Barang | Harga | Actions│ │
│  ├──────────────────────────────────────┤ │
│  │ J006 | ANTIMO...   | 3500  | [View] │ │
│  │ J009 | ANTIMO...   | 5500  | [View] │ │
│  │ J016 | ANTIMO...   | 3400  | [View] │ │
│  │ ...                                   │ │
│  └──────────────────────────────────────┘ │
│                                             │
│  Pagination: < 1 2 3 4 >                  │
│                                             │
└────────────────────────────────────────────┘
```

**Features**:
- Search bar (debounced, 300ms)
- Category filter dropdown
- Sortable columns
- Pagination (50 items per page)
- Row click → navigate to detail
- Actions column:
  - View button (all users)
  - Edit button (admin only)
  - Delete button (admin only)

**Table Columns** (responsive, hide on mobile):
1. Kode Barang Baru (always visible)
2. Nama Barang (always visible)
3. Harga Grosir Min (hide on mobile)
4. Harga Grosir Max (hide on mobile)
5. Harga Satuan Min (hide on mobile)
6. Harga Satuan Max (hide on mobile)
7. Stock (hide on mobile)
8. Actions (always visible)

---

### 5. Product Detail Page (`/products/[id]`)

```
┌────────────────────────────────────────┐
│  < Back   Product Detail    [Edit]     │
├────────────────────────────────────────┤
│                                         │
│  ┌────────────────────────────────┐   │
│  │ Nama Barang:                   │   │
│  │ ANTIMO SIRSAK GOLDEN CAIR 30M2 │   │
│  │                                 │   │
│  │ Kode Lama: J005                │   │
│  │ Kode Baru: J006                │   │
│  │ Nomor Data: 1                  │   │
│  │ Keterangan: -                  │   │
│  │                                 │   │
│  │ Harga Grosir (Warungan):       │   │
│  │   Min: Rp 3,000                │   │
│  │   Max: Rp 3,200                │   │
│  │   Keterangan: -                │   │
│  │                                 │   │
│  │ Harga Satuan:                  │   │
│  │   Min: Rp 3,500                │   │
│  │   Max: Rp 3,700                │   │
│  │   Keterangan: -                │   │
│  │                                 │   │
│  │ Stock: 100                     │   │
│  │ Category: Obat                 │   │
│  │                                 │   │
│  │ Created: 2026-01-15 10:30      │   │
│  │ Updated: 2026-01-16 14:20      │   │
│  └────────────────────────────────┘   │
│                                         │
└────────────────────────────────────────┘
```

**Style**:
- Card layout dengan sections
- Labels bold, values normal weight
- Currency formatting: Rp X,XXX
- Dates formatted: DD MMM YYYY HH:mm

---

### 6. Add/Edit Product Page (`/products/new` atau `/products/[id]/edit`)

```
┌────────────────────────────────────────┐
│  < Back   Add Product                  │
├────────────────────────────────────────┤
│                                         │
│  ┌────────────────────────────────┐   │
│  │ Form                           │   │
│  │                                 │   │
│  │ Kode Barang Lama (optional)    │   │
│  │ [________________]             │   │
│  │                                 │   │
│  │ Kode Barang Baru *             │   │
│  │ [________________]             │   │
│  │                                 │   │
│  │ Nama Barang *                  │   │
│  │ [______________________________]│   │
│  │                                 │   │
│  │ Nomor Data                     │   │
│  │ [________]                     │   │
│  │                                 │   │
│  │ Keterangan                     │   │
│  │ [______________________________]│   │
│  │                                 │   │
│  │ === Harga Grosir (Warungan) ===│   │
│  │ Min: [__________]              │   │
│  │ Max: [__________]              │   │
│  │ Keterangan: [_________________]│   │
│  │                                 │   │
│  │ === Harga Satuan ===           │   │
│  │ Min: [__________]              │   │
│  │ Max: [__________]              │   │
│  │ Keterangan: [_________________]│   │
│  │                                 │   │
│  │ Stock: [________]              │   │
│  │ Category: [________]           │   │
│  │                                 │   │
│  │    [Cancel]  [Save Product]    │   │
│  └────────────────────────────────┘   │
│                                         │
└────────────────────────────────────────┘
```

**Validation Rules**:
- Kode Barang Baru: required, unique
- Nama Barang: required
- Harga fields: optional, numeric, >= 0
- Stock: optional, integer, >= 0
- Nomor Data: optional, integer

**Error Display**:
- Inline errors below each field (red text)
- Toast notification on save success/error

---

### 7. Import CSV Page (`/products/import`)

```
┌────────────────────────────────────────┐
│  < Back   Import Products from CSV     │
├────────────────────────────────────────┤
│                                         │
│  Step 1: Upload CSV File               │
│  ┌────────────────────────────────┐   │
│  │  Drag & drop CSV file here     │   │
│  │  or click to browse            │   │
│  │                                 │   │
│  │  [Choose File]                 │   │
│  └────────────────────────────────┘   │
│                                         │
│  Expected CSV Format:                  │
│  kode_barang_lama, kode_barang_baru,  │
│  nama_barang, harga_grosir_min, ...   │
│                                         │
│  [Download Template]                   │
│                                         │
│  ─────────────────────────────────    │
│                                         │
│  Step 2: Preview & Validate            │
│  ┌────────────────────────────────┐   │
│  │ Showing 10 of 100 rows         │   │
│  │                                 │   │
│  │ Table preview...               │   │
│  │                                 │   │
│  │ Errors (if any):               │   │
│  │ ❌ Row 5: Duplicate kode       │   │
│  │ ❌ Row 12: Missing nama        │   │
│  └────────────────────────────────┘   │
│                                         │
│    [Cancel]  [Import Valid Products]   │
│                                         │
└────────────────────────────────────────┘
```

**Flow**:
1. Upload CSV file
2. Parse & validate
3. Show preview table
4. Highlight errors (if any)
5. Option to import only valid rows
6. Show progress bar during import
7. Success summary: "Imported 95 out of 100 products"

---

### 8. User Management Page (`/users` - Admin only)

```
┌────────────────────────────────────────┐
│  User Management                        │
├────────────────────────────────────────┤
│                                         │
│  ┌────────────────────────────────┐   │
│  │ Email        │ Role   │ Actions │   │
│  ├──────────────┼────────┼─────────┤   │
│  │ admin@..     │ Admin  │ [Edit]  │   │
│  │ user1@..     │ Reader │ [Edit]  │   │
│  │ user2@..     │ Reader │ [Edit]  │   │
│  └────────────────────────────────┘   │
│                                         │
│  Note: Users must sign in with Google │
│  before they appear here               │
│                                         │
└────────────────────────────────────────┘
```

**Edit User Dialog**:
```
┌───────────────────────┐
│ Edit User             │
├───────────────────────┤
│ Email: user@email.com │
│                       │
│ Role: [Admin ▼]       │
│       (Admin/Readonly)│
│                       │
│  [Cancel] [Save]      │
└───────────────────────┘
```

---

## Component Structure

### Reusable Components

1. **Layout Components**:
   - `Sidebar.tsx` - Fixed sidebar dengan navigation
   - `Navbar.tsx` - Top navbar dengan breadcrumbs
   - `DashboardLayout.tsx` - Wrapper untuk sidebar + main content

2. **UI Components** (dari shadcn/ui):
   - `Button.tsx`
   - `Input.tsx`
   - `Card.tsx`
   - `Table.tsx`
   - `Dialog.tsx`
   - `Form.tsx` (dengan React Hook Form integration)
   - `Select.tsx`
   - `Badge.tsx`
   - `Skeleton.tsx` (loading states)
   - `Toast.tsx` (notifications)
   - `Alert.tsx`

3. **Product Components**:
   - `ProductTable.tsx` - Table dengan search, sort, pagination
   - `ProductRow.tsx` - Single table row
   - `ProductForm.tsx` - Form untuk add/edit
   - `ProductDetail.tsx` - Detail view card
   - `ProductFilters.tsx` - Search bar + category filter
   - `CSVImportDialog.tsx` - CSV upload & preview

4. **User Components**:
   - `UserTable.tsx` - User list table
   - `UserRoleDialog.tsx` - Edit role dialog

5. **Auth Components**:
   - `GoogleSignInButton.tsx` - Google OAuth button
   - `ProtectedRoute.tsx` - Wrapper untuk protected pages
   - `AdminOnly.tsx` - Wrapper untuk admin-only content

---

## Interactions & UX

### Loading States
- Skeleton loaders untuk tables saat fetching
- Spinner untuk buttons saat submit
- Progress bar untuk CSV import

### Empty States
- "No products found" dengan illustration
- "No users yet" dengan instruction

### Error States
- Toast notifications untuk errors
- Inline validation errors pada forms
- Alert component untuk critical errors

### Success States
- Toast notifications untuk success actions
- Redirect after successful create/edit

### Confirmation Dialogs
- Delete product: "Are you sure? This cannot be undone"
- Logout: "Are you sure you want to logout?"

---

## Mobile Responsiveness

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Adjustments
- **Sidebar**: Collapse to hamburger menu
- **Tables**:
  - Hide less important columns
  - Make rows tappable
  - Show full detail on tap
- **Forms**:
  - Stack inputs vertically
  - Increase input sizes for touch
- **Search**: Full width on mobile
- **Buttons**: Full width on mobile

---

## Animation & Transitions

### Subtle Animations
- Page transitions: fade in
- Hover states: scale(1.02) atau brightness
- Dialog open/close: scale + fade
- Toast notifications: slide in from top-right
- Loading spinners: rotate animation

### Avoid
- Heavy animations yang bisa bikin lag
- Animations pada list items (bisa slow dengan 1000+ rows)

---

## Accessibility

### Requirements
- Semantic HTML (proper headings, sections)
- ARIA labels untuk icons
- Keyboard navigation support
- Focus states visible
- Color contrast WCAG AA compliant
- Screen reader support

### Implementation
- Use shadcn/ui components (sudah accessible by default)
- Add aria-labels dimana perlu
- Test keyboard navigation
- Test dengan screen reader

---

## Performance Optimizations

1. **Code Splitting**: Next.js automatic code splitting
2. **Image Optimization**: Next.js Image component (jika ada images)
3. **Lazy Loading**:
   - Pagination untuk tables (50 items per page)
   - Virtual scrolling jika ada long lists
4. **Debounced Search**: 300ms delay
5. **Caching**: React Query cache untuk 5 minutes
6. **Memoization**: useMemo untuk expensive calculations

---

## Development Priority

### Phase 1: Core Layout & Auth (Day 1)
1. Setup Next.js + Tailwind + shadcn/ui
2. Create basic layout (Sidebar, Navbar)
3. Implement login page
4. Implement auth flow & middleware

### Phase 2: Product Features (Day 2-3)
1. Product list page dengan table
2. Product detail page
3. Add/Edit product forms
4. Delete product with confirmation
5. Search & filter functionality

### Phase 3: CSV Import (Day 3-4)
1. CSV upload component
2. CSV parsing & validation
3. Preview table
4. Bulk import functionality

### Phase 4: User Management (Day 4)
1. User list page
2. Edit user role dialog
3. Test RBAC flows

### Phase 5: Polish (Day 5)
1. Add loading states
2. Add error handling
3. Improve mobile responsiveness
4. Add animations
5. Test accessibility

---

## Mockup Tools (Optional)

Jika Anda ingin lihat mockup dulu sebelum coding:
- Figma (recommended)
- Excalidraw (simple wireframes)
- Pen & paper sketches

---

## Next Steps

1. Review plan ini
2. Berikan feedback/changes yang Anda inginkan
3. Saya akan buat mockup atau langsung coding berdasarkan approval Anda

**Pertanyaan untuk Anda**:
1. Apakah color scheme ini OK atau ada preferensi warna lain?
2. Apakah layout sidebar + main content OK atau prefer layout lain?
3. Apakah ada fitur UI tambahan yang Anda inginkan?
4. Apakah perlu saya buat mockup visual dulu atau langsung coding?
