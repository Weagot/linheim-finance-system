// This is a placeholder - will complete all APIs
// Quick guide for deployment:

## Vercel + Supabase Deployment Steps

1. **Get Supabase Database URL**
   - Login to Supabase
   - Create new project
   - Get DATABASE_URL from Settings → Database

2. **Update Prisma Schema**
   - Change datasource provider from "sqlite" to "postgresql"
   - Update DATABASE_URL in .env

3. **Run Migrations**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Deploy to Vercel**
   - Connect GitHub repo
   - Set environment variables:
     * DATABASE_URL
     * JWT_SECRET
   - Deploy

5. **Update Frontend API URL**
   - Change VITE_API_URL to your Vercel domain

Next: I'll create the remaining API files and update the configuration.
