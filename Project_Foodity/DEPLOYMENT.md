# Foodity Deployment Guide 🚀

Foodity is fully ready for production deployment using free-tier services. Follow these steps to deploy your backend and frontend.

## 1. Uploading to GitHub

I have already initialized git and committed all the files! To push this repository to your GitHub account:

1. Open a browser and go to [https://github.com/new](https://github.com/new).
2. Create a new public repository named `foodity`. Do **not** initialize it with a README, .gitignore, or license.
3. Once created, copy the URL of your repository (e.g., `https://github.com/YOUR_USERNAME/foodity.git`).
4. In VS Code, open a terminal and run the following commands, replacing the URL with your own:

```bash
git remote add origin https://github.com/YOUR_USERNAME/foodity.git
git branch -M main
git push -u origin main
```

Your code is now safely backed up on GitHub!

## 2. Backend Deployment (Render / Railway)

We recommend **Render.com** for free python backend hosting, or **Railway.app**.

### Option A: Render.com
1. Go to [Render](https://render.com) and sign up with GitHub.
2. Create a new **Web Service** and connect your `foodity` GitHub repository.
3. Configure the service:
   - **Root Directory:** `backend/`
   - **Build Command:** `pip install -r requirements.txt && python manage.py migrate`
   - **Start Command:** `gunicorn foodity.wsgi:application`
   - **Environment Variables:**
     - `DEBUG=False`
     - `SECRET_KEY=your_secure_random_key`
     - `USE_SQLITE=True` *(Or set up a free MySQL DB on Render/Aiven)*
     - `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`
     - *(Add your Gemini & Cloudinary Keys here as well)*
4. Click **Deploy**.

## 3. Frontend Deployment (Vercel)

Vercel is the best and fastest place to host Vite/React applications for free with custom domains.

1. Go to [Vercel](https://vercel.com) and sign up with GitHub.
2. Click **Add New...** > **Project** and import your `foodity` repository.
3. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend/`
   - **Environment Variables:**
     - `VITE_API_URL=https://your-backend-url.onrender.com/api` *(replace with your render URL)*
4. Click **Deploy**.

## 4. Running Locally in VS Code
If you want to run this project yourself in VS Code later without repeatedly asking the AI, follow these steps:

1. Open the `Foodity anti` folder in VS Code.
2. Open a new Terminal (`Terminal -> New Terminal` or ``Ctrl+` ``).

**Start the Backend:**
3. Type `cd backend` and press Enter.
4. Activate your virtual environment: `.\venv\Scripts\activate` (or `source venv/bin/activate` on Mac/Linux).
5. Start the server: `python manage.py runserver`

**Start the Frontend:**
6. Open a *second* terminal window in VS Code (click the `+` icon in the terminal panel).
7. Type `cd frontend` and press Enter.
8. Start the dev server: `npm run dev`

Your site will now be available locally at `http://localhost:5173/`!

## 5. Editing After Deployment
Yes! Once you deploy this project (e.g., to Vercel and Render), I can definitely still edit it for you. All you have to do is:
1. Open up our chat and tell me what features you want.
2. I will write and test the code changes locally.
3. Once we verify it looks good, push the code to your GitHub repository. Since Vercel/Render are connected to your GitHub, they will automatically build and deploy the new live version within seconds!
