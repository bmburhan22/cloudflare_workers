# Waiver System - Cloudflare Workers

A modern waiver system built on Cloudflare Workers with React frontend, PDF generation, and email delivery.

## 🚀 Features

- **Single-page React app** with modern ES2025
- **Parallel PDF generation** using Cloudflare Browser Rendering API
- **Background processing** for instant user feedback
- **Email delivery** with PDF attachments via Cloudflare Email
- **D1 database** for submissions tracking
- **R2 storage** for PDF files
- **Assets binding** for static files (no KV needed)

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

### 2. Get Cloudflare Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account
3. Copy your **Account ID** from the right sidebar

### 3. Add GitHub Secrets

In your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: Your Cloudflare API token
   - **Name**: `CLOUDFLARE_ACCOUNT_ID`
   - **Value**: Your Cloudflare account ID

### 4. Deploy Pipeline

The GitHub Actions workflow automatically:
1. ✅ **Builds React app** (`npm run build`)
2. ✅ **Applies D1 schema changes** (`schema.sql`)
3. ✅ **Deploys Worker** with bundled assets (`wrangler deploy`)

## 📋 Manual Deployment

```bash
# Install dependencies
npm install

# Set secrets (first time only)
wrangler secret put EMAIL_FROM
wrangler secret put ARCHERY_PIN

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
              │   D1    │ │   R2    │ │ Assets  │
              │Database │ │Storage  │ │ Binding │
              └─────────┘ └─────────┘ └─────────┘
```

## 🔑 Configuration

### Secrets (use `wrangler secret put`)

```bash
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

The system uses **Cloudflare Email Sending**:

1. Verify your domain in Cloudflare Dashboard → Email Routing
2. Set the sender address as a secret:
   ```bash
   wrangler secret put EMAIL_FROM
   # Enter: noreply@yourdomain.com
   ```
3. Email binding is configured in `wrangler.toml`:
   ```toml
   [[send_email]]
   name = "SEND_EMAIL"
   ```
