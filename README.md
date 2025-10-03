# Waiver System - Cloudflare Workers

A modern waiver system built on Cloudflare Workers with React frontend, PDF generation, and email delivery.

## 🚀 Features

- **Single-page React app** with modern ES2025
- **Parallel PDF generation** using Cloudflare Browser Rendering API
- **Background processing** for instant user feedback
- **Email delivery** with PDF attachments
- **D1 database** for submissions tracking
- **R2 storage** for PDF files
- **KV storage** for static assets

## 🔧 GitHub Actions CI/CD Setup

### 1. Create Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Use **"Custom token"** template
4. Set permissions:
   - **Account**: `Cloudflare Workers:Edit`
   - **Account**: `Account Settings:Read`
   - **User**: `User Details:Read`
   - **User**: `Memberships:Read`
   - **Zone**: `Zone:Read` (if using custom domain)
5. Copy the token

### 2. Add GitHub Secret

In your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add new repository secret:
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: Your Cloudflare API token

### 3. Deploy Pipeline

The GitHub Actions workflow automatically:
1. ✅ **Applies D1 schema changes** (`schema.sql`)
2. ✅ **Builds React app** (`npm run build`)
3. ✅ **Deploys Worker** (`wrangler deploy`)
4. ✅ **Uploads assets to KV** (static files)

## 📋 Manual Deployment

```bash
# Install dependencies
npm install

# Build React app
npm run build

# Apply database schema
npm run db:init:remote

# Deploy Worker
npm run wrangler:deploy
```

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
              │   D1    │ │   R2    │ │   KV    │
              │Database │ │Storage  │ │Assets   │
              └─────────┘ └─────────┘ └─────────┘
```

## 🔑 Environment Variables

Set these in `wrangler.toml` or as secrets:

- `EMAIL_FROM`: Sender email address
- `ARCHERY_PIN`: PIN for archery access (default: 1234)
- `LEGAL_VERSION`: Legal document version

## 📁 Project Structure

```
├── .github/workflows/    # GitHub Actions CI/CD
├── src/                  # React source code
├── dist/                 # Built React app
├── worker.js             # Cloudflare Worker entry point
├── utils.js              # PDF generation & email utilities
├── schema.sql            # D1 database schema
├── wrangler.toml         # Cloudflare configuration
└── package.json          # Dependencies & scripts
```

## 🚀 Performance Optimizations

- **Parallel PDF generation** (3-5x faster)
- **Background processing** (instant user feedback)
- **Optimized browser settings** (faster rendering)
- **Minimal dependencies** (smaller bundle size)
- **ES2025 modern syntax** (better performance)

## 📧 Email Configuration

The system supports both:
- **Cloudflare Email Workers** (requires verified domain)
- **Resend API** (easier setup, recommended)

Switch between them by updating the `sendEmail` function in `utils.js`.
