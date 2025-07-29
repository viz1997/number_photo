# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
A Japanese My Number Card photo processing service using AI to convert regular photos into government-compliant ID photos. Features 100% approval guarantee with ¥500 per photo pricing.

## Quick Commands
```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema changes to Neon
npm run db:studio    # Open Prisma Studio
```

## Architecture
- **Frontend**: Next.js 14 App Router with TypeScript
- **Database**: Neon PostgreSQL (serverless)
- **Storage**: Cloudflare R2 
- **AI**: Replicate API for image processing
- **Payments**: Polar.sh
- **UI**: Radix UI via shadcn/ui with Tailwind CSS

## Key Directories
- `/app/` - Next.js pages and API routes
- `/lib/` - Database models, utilities, storage clients
- `/components/ui/` - Pre-built Radix UI components
- `/public/` - Static assets

## Database Schema
- `uploaded_files` - Original photo uploads
- `processed_images` - AI-processed results
- `payments` - Payment records (¥500/photo)
- `download_tokens` - Secure download links
- `download_logs` - Download tracking

## Environment Variables
Required in `.env.local`:
```
DATABASE_URL=          # Neon PostgreSQL connection
R2_ACCESS_KEY_ID=      # Cloudflare R2 credentials
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
REPLICATE_API_TOKEN=   # AI processing API
POLAR_ACCESS_TOKEN=    # Payment processing
```

## API Routes
- `POST /api/upload` - Handle file uploads
- `POST /api/process` - AI photo processing
- `POST /api/payment` - Process payments
- `GET /api/download/[token]` - Secure file downloads