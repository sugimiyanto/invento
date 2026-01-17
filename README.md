This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### How to get these values from Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **Settings → API**
3. You'll see:
   - **Project URL** → Copy this as `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon (public) key** → Copy this as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role (secret) key** → Copy this as `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important**: Keep the Service Role key secret. Never commit it to version control.

### 2. Database Setup

Run the SQL setup script in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase-setup.sql`
5. Execute the SQL

This will create:
- `profiles` table with user roles and information
- `products` table for inventory management
- `audit_logs` table for tracking changes
- Row Level Security (RLS) policies
- Triggers and functions for profile auto-creation

## Getting Started

Run the development server:

```bash
make dev
```

Or use npm directly:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
