# Vercel Monorepo Deployment Guide

This guide explains how to host both your **Frontend** and **Backend** on Vercel for free, using a single project.

## Step 1: Push Changes to GitHub
Make sure you have pushed the updated `vercel.json` (which I just created) to your GitHub repository.

## Step 2: Create a New Project on Vercel
1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Select your GitHub repository and click **Import**.

## Step 3: Configure Build Settings
This is the most important part!
1.  **Project Name**: Give it a name (e.g., `freelancer-tracker-fullstack`).
2.  **Framework Preset**: Select **Other** (do NOT select Vite here).
3.  **Root Directory**: Keep this as the **repo root** (do NOT select `frontend`).
4.  **Build Command**: Leave empty (Vercel will use the `vercel.json` instructions).
5.  **Output Directory**: Leave empty.

## Step 4: Add Environment Variables
Scroll down to the **Environment Variables** section and add everything your backend needs:

| Key | Value |
| :--- | :--- |
| `MONGODB_URI` | *Your MongoDB Atlas Connection String* |
| `JWT_SECRET` | *A random long string* |
| `JWT_EXPIRES_IN` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | *Your Cloudinary Name* |
| `CLOUDINARY_API_KEY` | *Your Cloudinary API Key* |
| `CLOUDINARY_API_SECRET` | *Your Cloudinary API Secret* |
| `NODE_ENV` | `production` |

> [!TIP]
> You **do not** need to add `VITE_API_URL`. Since the frontend and backend are on the same site, the code will automatically use `/api`.

## Step 5: Deploy
Click **Deploy**. 

Vercel will build your frontend and set up your backend functions. Once finished, your site will be live at a URL like `https://freelancer-tracker-fullstack.vercel.app`.

---

### How it works:
*   Any request to `/api/*` goes to your **Node.js backend**.
*   All other requests go to your **React frontend**.
*   This setup is free and doesn't have the "one project" limit of Render.



this is a step by step guild