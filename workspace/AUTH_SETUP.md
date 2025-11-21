# Supabase Authentication Setup

This guide explains how to set up and use Supabase email/password authentication in the AlphaStocks workspace.

## Prerequisites

1. A Supabase project (create one at https://app.supabase.com)
2. Node.js and npm installed

## Environment Variables

The app requires the following environment variables to be set:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### Local Development

1. Copy the example environment file:
   ```bash
   cp workspace/.env.example workspace/.env.local
   ```

2. Get your Supabase credentials:
   - Go to https://app.supabase.com/project/YOUR_PROJECT/settings/api
   - Copy the "Project URL" and paste it as `VITE_SUPABASE_URL`
   - Copy the "anon public" key and paste it as `VITE_SUPABASE_ANON_KEY`

3. Update `workspace/.env.local` with your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

### Vercel Deployment

In your Vercel project settings:

1. Go to Settings > Environment Variables
2. Add the following variables:
   - Name: `VITE_SUPABASE_URL`, Value: your Supabase URL
   - Name: `VITE_SUPABASE_ANON_KEY`, Value: your Supabase anon key
3. Deploy or redeploy your project

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## Authentication Flow

### First-Time Setup

When you first access the app without credentials configured, you'll see a demo mode banner. To enable authentication:

1. Set up your environment variables as described above
2. Restart the dev server
3. The login page will appear automatically

### User Registration

1. Click "Sign up" on the login page
2. Enter your email and password (minimum 6 characters)
3. Click "Create account"
4. Check your email for a confirmation link from Supabase
5. Click the confirmation link
6. Return to the app and sign in

### User Login

1. Enter your email and password
2. Click "Sign in"
3. You'll be redirected to the dashboard automatically

### Sign Out

Click the "Log out" button in the Account dialog (accessible from the sidebar)

## Route Protection

The app automatically protects routes based on authentication state:

- **Not authenticated**: Shows login/signup pages
- **Authenticated**: Shows the full dashboard and workspace

## Files Created

- `workspace/src/lib/supabaseClient.js` - Supabase client configuration
- `workspace/src/context/AuthContext.jsx` - Auth state management
- `workspace/src/components/Login.jsx` - Login form component
- `workspace/src/components/Signup.jsx` - Signup form component
- `workspace/src/components/Dashboard.jsx` - Protected dashboard wrapper
- `workspace/src/components/Router.jsx` - Simple routing logic

## Troubleshooting

### "Supabase credentials not found" warning

This means your environment variables are not set correctly. Check:
1. You've created `.env.local` in the `workspace` directory
2. The variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. You've restarted the dev server after adding the variables

### Email confirmation not received

1. Check your spam folder
2. Verify email settings in Supabase dashboard: Authentication > Email Templates
3. For development, you can disable email confirmation in Supabase: Authentication > Settings > Enable email confirmations (toggle off)

### "Invalid login credentials" error

1. Ensure you've confirmed your email (check inbox/spam)
2. Try resetting your password
3. Check that you're using the correct email and password

## Security Notes

- Never commit `.env.local` to version control (it's already in `.gitignore`)
- The `VITE_SUPABASE_ANON_KEY` is safe to expose in client-side code
- Use Row Level Security (RLS) policies in Supabase to protect your data
- For production, always enable email confirmation

## Next Steps

After setting up authentication, you may want to:

1. Configure Row Level Security policies in Supabase
2. Add user profile data to Supabase tables
3. Implement password reset functionality
4. Add OAuth providers (Google, GitHub, etc.)
5. Customize email templates in Supabase
