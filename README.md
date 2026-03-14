# UnbanRo — Setup & Deploy Guide

## What You Need
- A computer (Windows, Mac, or Linux)
- Internet connection
- 15 minutes

---

## STEP 1 — Install Node.js
Go to https://nodejs.org and download the **LTS** version. Install it normally.

To check it worked, open a terminal (Command Prompt on Windows) and type:
```
node --version
```
You should see a version number like `v20.x.x`

---

## STEP 2 — Get Your Free Gemini API Key
1. Go to https://aistudio.google.com/apikey
2. Sign in with a Google account
3. Click **"Create API Key"**
4. Copy the key (it looks like `AIzaSy...`)

**Free tier:** 1,500 requests per day — more than enough.

---

## STEP 3 — Set Up the Project

Open a terminal in this project folder, then run:
```
npm install
```

Then rename `.env.example` to `.env.local` and paste your API key:
```
GEMINI_API_KEY=AIzaSy_your_actual_key_here
```

To test locally:
```
npm run dev
```
Open http://localhost:3000 — the site should be working!

---

## STEP 4 — Deploy to Vercel (Free Hosting)

### 4a — Put your code on GitHub
1. Go to https://github.com and create a free account
2. Create a **New Repository** (call it `unbanro`, set to Public or Private)
3. Install Git from https://git-scm.com if you don't have it
4. In your terminal, inside the project folder:
```
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/unbanro.git
git push -u origin main
```

### 4b — Deploy on Vercel
1. Go to https://vercel.com and sign up with your GitHub account
2. Click **"Add New Project"**
3. Import your `unbanro` repository
4. Click **"Environment Variables"** and add:
   - Name: `GEMINI_API_KEY`
   - Value: your actual API key from Step 2
5. Click **"Deploy"**

That's it! In about 1 minute, Vercel will give you a live URL like:
`https://unbanro.vercel.app`

---

## STEP 5 — Add Your Crypto Addresses

Open `pages/index.js` and find the `CRYPTOS` array near the top.
Replace `YOUR_BTC_ADDRESS_HERE`, `YOUR_ETH_ADDRESS_HERE`, etc. with your real wallet addresses.

Then commit and push:
```
git add .
git commit -m "add crypto addresses"
git push
```

Vercel will automatically redeploy in about 30 seconds.

---

## Custom Domain (Optional, Free on Vercel)

1. In your Vercel dashboard, go to your project → **Settings → Domains**
2. Add your domain name (e.g. `unbanro.com`)
3. Follow the DNS instructions Vercel gives you

Domains cost ~$10-15/year from Namecheap or Cloudflare.

---

## Troubleshooting

**"API key not configured" error:**
- Make sure `.env.local` exists and has `GEMINI_API_KEY=...`
- On Vercel, make sure the environment variable is added in the project settings

**"Failed to generate appeal" error:**
- Your Gemini API key might be wrong or expired
- Go to https://aistudio.google.com/apikey and create a new one

**Build fails on Vercel:**
- Make sure `node_modules/` is NOT in your git repo (it shouldn't be if .gitignore is correct)

---

## Roblox Appeals Link
Always direct users to submit at: https://www.roblox.com/report-abuse
