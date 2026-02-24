# Railway Deployment Guide (Backend)

This guide provides step-by-step instructions for deploying the Freelancer Tracker backend to Railway.

## Prerequisites

1.  A [Railway](https://railway.app/) account.
2.  The backend code pushed to a GitHub repository.
3.  A MongoDB Atlas cluster (see `MONGODB_SETUP.md`).

## Deployment Steps

1.  **Create a New Project**:
    - Log in to Railway and click **New Project**.
    - Select **Deploy from GitHub repo**.
    - Choose your repository. When prompted, select the **Root** as the backend is usually detected automatically, but you may need to specify the `backend` directory if it's a monorepo.

2.  **Configure Service**:
    - Once the service is created, go to the **Settings** tab.
    - Under **General**, ensure the **Root Directory** is set to `backend`.
    - Railway will automatically detect the `npm start` script.

3.  **Environment Variables**:
    - Go to the **Variables** tab and add the following:
      | Variable | Value | Description |
      | :--- | :--- | :--- |
      | `PORT` | `3001` | The port the server will run on. |
      | `MONGODB_URI` | `your_mongodb_atlas_uri` | Your connection string from Atlas. |
      | `JWT_SECRET` | `your_random_secret_key` | A long, secure random string. |
      | `JWT_EXPIRES_IN` | `7d` | Token expiration time. |
      | `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | From Cloudinary dashboard. |
      | `CLOUDINARY_API_KEY` | `your_api_key` | From Cloudinary dashboard. |
      | `CLOUDINARY_API_SECRET` | `your_api_secret` | From Cloudinary dashboard. |
      | `MAX_FILE_SIZE` | `5242880` | Max logo size (5MB in bytes). |
      | `NODE_ENV` | `production` | Set to production. |

4.  **Networking**:
    - Go to the **Settings** tab.
    - Under **Networking**, click **Generate Domain**. This will be your public API URL (e.g., `https://backend-production-xxxx.up.railway.app`).

## Frontend Connection

Once your backend is live on Railway:

1.  Copy your generated Railway URL.
2.  Go to your **Vercel** dashboard (where the frontend is hosted).
3.  Add or update the environment variable `VITE_API_URL` with your Railway URL.
4.  Redeploy your frontend if necessary.

## Health Check

Verify your deployment by visiting `https://your-railway-url.up.railway.app/api/health`. You should see a JSON response with `"status": "ok"`.
