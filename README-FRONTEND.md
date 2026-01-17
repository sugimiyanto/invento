# Invento 2 - Frontend Demo

Frontend-only demo untuk Inventory Management System.

## ✨ Features Yang Sudah Diimplementasi

### Authentication
- ✅ Login page dengan mock authentication
- ✅ 2 role: Admin & Read Only
- ✅ Protected routes dengan redirect

### Dashboard
- ✅ Admin dashboard dengan stats cards (Total Products, Low Stock, Total Value)
- ✅ Read Only dashboard dengan quick search
- ✅ Recent activity log (mock)

### Products Management
- ✅ **Products List**: Search, filter by category, pagination
- ✅ **Product Detail**: View semua informasi produk
- ✅ **Add Product**: Form lengkap dengan validation
- ✅ **Edit Product**: Pre-filled form
- ✅ **Delete Product**: Confirmation dialog (mock)
- ✅ **CSV Import**: Upload, preview, validation (mock)

### User Management (Admin Only)
- ✅ View all users
- ✅ Edit user roles (Admin/Read Only)

### UI Components
- ✅ Responsive sidebar navigation
- ✅ Clean, modern design with Tailwind CSS
- ✅ shadcn/ui components
- ✅ Toast notifications
- ✅ Loading states
- ✅ Mobile responsive

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:3000**

## 📱 Testing the App

### 1. Login
Go to `http://localhost:3000/login`

Pilih salah satu:
- **Login as Admin** - Full access (CRUD products, import CSV, manage users)
- **Login as Read Only** - View only access

### 2. Navigation
- **Dashboard (/)** - Home page dengan stats
- **Products (/products)** - List semua produk
  - Search by nama atau kode
  - Filter by category
  - Click row untuk view detail
  - Admin: Add, Edit, Delete buttons
- **Users (/users)** - Admin only, manage user roles

### 3. Test Features

**As Admin:**
- ✅ Add new product via "Add Product" button
- ✅ Edit product dari detail page
- ✅ Delete product (confirmation dialog)
- ✅ Import CSV (upload, preview, import)
- ✅ Manage users (change roles)

**As Read Only:**
- ✅ View products list
- ✅ Search & filter products
- ✅ View product details
- ❌ Cannot add/edit/delete
- ❌ Cannot access user management

## 📁 Project Structure

```
invento_2/
├── app/
│   ├── login/              # Login page
│   ├── products/           # Products pages
│   │   ├── page.tsx        # List
│   │   ├── [id]/page.tsx   # Detail
│   │   ├── [id]/edit/page.tsx  # Edit
│   │   ├── new/page.tsx    # Add new
│   │   └── import/page.tsx # CSV import
│   ├── users/              # User management
│   └── page.tsx            # Dashboard
├── components/
│   ├── layout/             # Sidebar, Navbar, DashboardLayout
│   ├── products/           # ProductForm
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── context/            # AuthContext
│   ├── data/               # Mock data (50 products)
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions (format currency, dates)
└── docs/
    ├── PROJECT_PLAN.md     # Full project plan
    └── FRONTEND_PLAN.md    # Frontend design plan
```

## 🎨 Design System

### Colors
- Primary: Dark blue-gray
- Success: Green
- Warning: Orange
- Destructive: Red

### Typography
- Font: Inter
- Headings: Bold
- Body: Normal

### Components
All UI components from shadcn/ui:
- Button, Input, Card, Table, Dialog, Form, etc.
- Consistent styling
- Accessible by default

## 📊 Mock Data

### Products
- 50 mock products
- Categories: Obat, Sembako, Minuman, Snack, Perawatan
- Realistic Indonesian product names
- Complete pricing data (harga grosir min/max, harga satuan min/max)

### Users
- 3 mock users (1 admin, 2 readonly)

## 🔄 Next Steps (Backend Integration)

Untuk production, perlu integrate dengan:
1. **Supabase**
   - Setup PostgreSQL database
   - Implement RLS policies
   - Configure Google OAuth

2. **API Integration**
   - Replace mock data dengan Supabase queries
   - Implement real CRUD operations
   - Add proper error handling

3. **CSV Import**
   - Implement papaparse untuk real CSV parsing
   - Add validation logic
   - Bulk insert ke database

4. **Deploy**
   - Deploy ke Vercel
   - Configure environment variables
   - Setup production OAuth credentials

## 🐛 Known Limitations (Frontend Only)

- ⚠️ Data tidak persist (refresh = reset)
- ⚠️ No real authentication (mock only)
- ⚠️ CSV import hanya UI (tidak parse real file)
- ⚠️ All actions are mocked (show toast only)

## 📝 Notes

Frontend ini sudah **production-ready** dari sisi UI/UX. Yang perlu:
1. Connect ke Supabase untuk database
2. Implement real authentication dengan Google OAuth
3. Replace mock functions dengan real API calls

See `docs/PROJECT_PLAN.md` untuk detailed implementation plan.

## 🎯 Test Checklist

- [ ] Login sebagai Admin
- [ ] View dashboard dengan stats
- [ ] Navigate ke Products page
- [ ] Search products
- [ ] Filter by category
- [ ] View product detail
- [ ] Add new product
- [ ] Edit existing product
- [ ] Try CSV import UI
- [ ] Go to User Management
- [ ] Change user role
- [ ] Logout
- [ ] Login sebagai Read Only
- [ ] Verify cannot access admin features
- [ ] Verify can still view products

---

**Frontend Development: COMPLETE** ✅

Ready untuk review dan testing!
