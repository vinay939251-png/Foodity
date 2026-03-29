# Foodity 🍽️

Foodity is a production-grade, Pinterest-style recipe discovery platform. It features a fast, image-first masonry feed layout and is built with a reliable backend and clean structured data.

## Features ✨

- **Masonry Feed**: Pinterest-style grid layout with infinite scrolling and lazy image loading.
- **Authentication**: Secure Google OAuth for user login and profile creation.
- **Recipe Management**: Explore recipes with detailed information including images, title, description, nutrition facts, and instructions.
- **Social Features**: Save recipes to public or private boards, like recipes, and comment with one-level replies.
- **AI Recipe Generator**: Enter ingredients and let the Google Gemini API generate a complete recipe with a title, instructions, and estimated calories.
- **Image Handling**: Seamless image uploads and responsive image delivery using Cloudinary.

## Tech Stack 🛠️

- **Frontend**: React, Vite, JavaScript, Tailwind CSS
- **Backend**: Python, Django, Django REST Framework
- **Database**: MySQL
- **Storage**: Cloudinary (Free Tier) for image hosting
- **AI Integration**: Google Gemini API
- **Authentication**: Google OAuth

## Project Structure 📁

The repository is divided into two main applications:
- `frontend/`: The React application that consumes the backend REST APIs.
- `backend/`: The Django backend that handles API logic, database management, and integrations.

## Getting Started 🚀

### Prerequisites

- Node.js & npm
- Python 3.x
- MySQL
- Cloudinary Account
- Google Cloud Console Project (for OAuth)
- Google AI Studio API Key (for Gemini)

### Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/foodity.git
   cd foodity
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env  # Configure your environment variables
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   Open a new terminal window.
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Your site will be available locally at `http://localhost:5173/`.

### Environment Variables (.env)

Ensure you create a `.env` file in your `backend` directory with the necessary configurations. **Do not hardcode secrets!** Example variables:
- `DEBUG`
- `SECRET_KEY`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `GEMINI_API_KEY`
- `GOOGLE_OAUTH_CLIENT_ID`
- Cloudinary credentials

## Deployment 🌍

### Backend (Render / Railway)
We recommend Render.com for free Python backend hosting.
1. Create a new Web Service and link your GitHub repository.
2. Set Root Directory to `backend/`.
3. Build Command: `pip install -r requirements.txt && python manage.py migrate`
4. Start Command: `gunicorn foodity.wsgi:application`
5. Add your environment variables (including `DEBUG=False` and `CORS_ALLOWED_ORIGINS`).

### Frontend (Vercel)
Vercel is ideal for hosting Vite/React apps.
1. Create a new Project on Vercel and import your repository.
2. Framework Preset: Vite
3. Root Directory: `frontend/`
4. Add the `VITE_API_URL` environment variable pointing to your deployed backend.

For more detailed deployment instructions, refer to [DEPLOYMENT.md](DEPLOYMENT.md).

## API Endpoints 🔌

- `POST /api/auth/google/` - Google Authentication
- `GET /api/recipes/` - List recipes
- `GET /api/recipes/<id>/` - Get recipe details
- `POST /api/recipes/<id>/like/` - Like a recipe
- `POST /api/recipes/<id>/save/` - Save a recipe to a board
- `POST /api/boards/` - Create a board
- `POST /api/comments/` - Add a comment
- `POST /api/ai/generate-recipe/` - Generate a recipe using Gemini AI

## Dataset 📊
The initial dataset uses a Kaggle 30,000 recipes dataset, normalized and imported into the Foodity schema using a custom importer and the Gemini API for complex ingredient parsing.
