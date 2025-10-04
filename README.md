# Waiver System - Cloudflare Workers

A modern waiver system built on Cloudflare Workers with React frontend, PDF generation, and email delivery.

## 🚀 Features

- **Single-page React app** with modern ES2025
- **Parallel PDF generation** using Cloudflare Browser Rendering API
- **Background processing** for instant user feedback
- **Email delivery** with PDF attachments via Resend API
- **D1 database** for submissions tracking
- **R2 storage** for PDF files
- **Assets binding** for static files (no KV needed)

## 🚀 Deployment

```bash
# Install dependencies
npm install

# Set secrets (first time only)
wrangler secret put RESEND_API_KEY
wrangler secret put EMAIL_FROM
wrangler secret put ARCHERY_PIN

# Build for production (migrations + vite build)
npm run build

# Build for local (migrations + vite build)
npm run build:local

# Deploy to Cloudflare Workers
npm run deploy

# Local development server
npm run dev
```

This project uses **Cloudflare's automatic build system** for deployments. When connected to your repository, Cloudflare will automatically build and deploy on every push to main.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │    │  Cloudflare      │    │   External      │
│   (Frontend)    │───▶│     Worker       │───▶│   Services      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Cloudflare     │
                       │   Services       │
                       └──────────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
              ┌─────────┐ ┌─────────┐ ┌─────────┐
              │   D1    │ │   R2    │ │ Assets  │
              │Database │ │Storage  │ │ Binding │
              └─────────┘ └─────────┘ └─────────┘
```

## 🔑 Configuration

### Secrets (use `wrangler secret put`)

```bash
# Set Resend API key
wrangler secret put RESEND_API_KEY
# Enter: re_xxxxxxxxxxxxx

# Set email sender address
wrangler secret put EMAIL_FROM
# Enter: noreply@yourdomain.com

# Set archery access PIN
wrangler secret put ARCHERY_PIN
# Enter: 1234
```

### Variables (in `wrangler.toml`)

```toml
[vars]
VERSION = "1.0"
```

## 📁 Project Structure

```
├── src/                  # React source code
├── dist/                 # Built React app
├── migrations/           # D1 database migrations
├── worker.js             # Cloudflare Worker entry point
├── utils.js              # PDF generation & email utilities
├── wrangler.toml         # Cloudflare configuration
└── package.json          # Dependencies & scripts
```

## 🚀 Performance Optimizations

- **Parallel PDF generation** (3-5x faster)
- **Background processing** (instant user feedback)
- **Optimized browser settings** (faster rendering)
- **Minimal dependencies** (smaller bundle size)
- **ES2025 modern syntax** (better performance)

## 🗄️ Database Migrations

This project uses **Wrangler D1 migrations** to manage database schema changes safely.

### Creating a New Migration

```bash
npm run db:migrations:create migration_name
```

### Applying Migrations

Migrations run automatically with `npm run build` (remote) and `npm run build:local` (local).

Manual commands:
```bash
npm run db:migrate:local    # Apply to local D1
npm run db:migrate:remote   # Apply to remote D1
npm run db:migrations:list  # Check migration status
```

### Migration Rules

1. **Never edit existing migrations** - Always create new ones
2. **Test locally first** - Run with `--local` before `--remote`
3. **Migrations are tracked** - D1 remembers which have run
4. **Use IF NOT EXISTS** - Keep migrations idempotent

### Example Migration

```sql
-- Add a new column
ALTER TABLE submissions ADD COLUMN phone TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_submissions_phone ON submissions (phone);
```

## 🔌 API Endpoints

- **POST /submit** - Submit waiver form with activity selections
- **GET /status** - Health check endpoint
- **GET /admin/search?q=query** - Search submissions by name, email, property, or check-in date

## 📧 Email Setup

1. Sign up at [resend.com](https://resend.com) and verify your domain
2. Create an API key
3. Set secrets:
   ```bash
   wrangler secret put RESEND_API_KEY
   wrangler secret put EMAIL_FROM
   ```
