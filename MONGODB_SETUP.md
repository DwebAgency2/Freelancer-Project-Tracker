# MongoDB Setup Guide

This project is migrating to MongoDB to provide better flexibility and easier deployment. Follow this guide to set up your MongoDB database.

## Option 1: MongoDB Atlas (Recommended for Production)

1.  **Create an Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2.  **Create a Cluster**: Follow the prompts to create a "Shared" (Free) cluster.
3.  **Create a Database User**:
    -   Go to **Database Access** under Security.
    -   Click **Add New Database User**.
    -   Choose **Password** authentication and note down the username and password.
4.  **Configure Network Access**:
    -   Go to **Network Access** under Security.
    -   Click **Add IP Address**.
    -   Choose **Allow Access From Anywhere** (or add your specific IP if you want more security).
5.  **Get Connection String**:
    -   Go to **Database** under Deployment.
    -   Click **Connect** on your cluster.
    -   Choose **Drivers** as the connection method.
    -   Copy the connection string (it looks like `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`).

---

## Option 2: Local MongoDB (For Development)

1.  **Install MongoDB**: Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2.  **Run MongoDB**: Ensure the MongoDB service is running on your machine (usually on port 27017).
3.  **Connection String**: Your local connection string will be `mongodb://localhost:27017/freelancer_tracker`.

---

## Project Configuration

1.  **Update `.env`**:
    -   Find the `.env` file in your `backend` directory.
    -   Remove `DATABASE_URL` or any `DB_` variables.
    -   Add `MONGODB_URI` with your connection string:
        ```env
        MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/freelancer_tracker
        ```
2.  **Install Dependencies**:
    -   Run `npm install` in the `backend` directory to install `mongoose`.

## Benefits of MongoDB

-   **Flexible Schema**: No need for complex SQL migrations.
-   **Atlas Support**: MongoDB Atlas provides a robust, free-tier managed database.
-   **JSON-like Documents**: Matches perfectly with JavaScript's object structure.
