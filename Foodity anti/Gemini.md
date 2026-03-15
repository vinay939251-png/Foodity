# FOODITY ANTIGRAVITY FINAL PROMPT

# PRINCIPLES
	- Stability before intelligence
	- Data before AI
	- Clarity before features
	- Clean code > clever code
	- Small releases frequent improvement

# PROJECT SUMMARY
	- Build Foodity a production grade pinterest style recipe discovery platform
	- Focus on a fast image first feed reliable backend and clean structured data
	- The UI experience must be similar to pinterest masonry feed layout
	- Do not use trademarked assets
	- Focus on performance scalability and clean architecture

# TECH STACK
	- Frontend
		- React
		- Vite
		- Javascript
		- Tailwind CSS
	- Backend
		- Python
		- Django
		- Django REST Framework
	- Database
		- MySQL
	- Image Storage
		- Cloudinary free tier
	- AI
		- Google Gemini API
	- Authentication
		- Google OAuth only
	- Dataset
		- Kaggle 30000 recipes dataset

# PRIORITY PHASE 1
	- Implement pinterest style masonry feed with infinite scrolling
	- Implement Google authentication and user profile creation
	- Import and normalize the 30000 recipe dataset
	- Create recipe cards showing image title description rating and author
	- Implement save recipe to board feature
	- Implement comments with one level reply
	- Implement image uploads using cloudinary
	- Optimize performance with lazy loading and caching
	- Implement environment variables for configuration

# PROJECT STRUCTURE
	- Repository must contain two main folders
		- frontend
		- backend
	- Backend handles API logic
	- Frontend consumes backend REST APIs

# DJANGO MODELS
	- UserProfile
	- Recipe
	- Ingredient
	- RecipeStep
	- Nutrition
	- Board
	- Like
	- Save
	- Comment

# API ENDPOINTS
	- POST api auth google
	- GET api recipes
	- GET api recipes id
	- POST api recipes like
	- POST api recipes save
	- POST api boards
	- POST api comments
	- POST api ai generate recipe

# RECIPE MODEL FIELDS
	- title
	- main image
	- description
	- servings
	- preparation time
	- cooking time
	- total time
	- difficulty level
	- calories
	- protein
	- carbs
	- fats

# INGREDIENT MODEL
	- ingredient name
	- quantity
	- unit

# RECIPE STEPS
	- step number
	- instruction text

# RECIPE CARD UI
	- recipe image
	- recipe title
	- short description
	- rating
	- author name
	- hover actions
		- like
		- save
		- share

# FEED REQUIREMENTS
	- masonry grid layout
	- infinite scroll
	- lazy image loading
	- responsive breakpoints
	- fast loading

# PAGES
	- Welcome Page
		- project introduction
		- login with google button
		- enter platform button

	- Home Feed
		- pinterest style grid of recipes
		- clicking card opens recipe page

	- Recipe Detail Page
		- full recipe data
		- ingredients
		- cooking steps
		- nutrition information
		- comments section
		- save like share buttons

	- Board Page
		- list of saved recipes
		- public private boards

# DATA IMPORT PROCESS
	- Download kaggle recipe dataset
	- Store raw data in data folder
	- Normalize fields into foodity schema
	- Parse ingredients using regex
	- Use gemini API for complex ingredient parsing
	- Deduplicate recipes using title and ingredients
	- Bulk insert recipes into MySQL

# IMAGE HANDLING
	- Upload images to cloudinary
	- Store image URLs in database
	- Use responsive images and thumbnails
	- Lazy load images

# AI FEATURES
	- AI recipe generator
		- user enters ingredients
		- gemini generates
			- recipe title
			- cooking instructions
			- estimated calories

# ENVIRONMENT VARIABLES
	- Use .env file
	- Do not hardcode secrets
	- Example variables
		- DEBUG
		- SECRET_KEY
		- DB_NAME
		- DB_USER
		- DB_PASSWORD
		- DB_HOST
		- DB_PORT
		- GEMINI_API_KEY
		- GOOGLE_OAUTH_CLIENT_ID

# DEVELOPMENT SETUP
	- docker compose for local development
	- backend runs django and mysql
	- frontend runs vite

# RUN STEPS
	- copy env example to .env
	- install dependencies
	- run migrations
	- start backend server
	- start frontend dev server

# PERFORMANCE REQUIREMENTS
	- optimize database queries
	- implement pagination
	- cache feed results
	- compress images
	- lazy load images

# SECURITY
	- DEBUG false in production
	- secure cookies
	- rate limit authentication endpoints
	- rotate secret keys
	- do not commit secrets to repository

# TESTING
	- unit tests for models
	- unit tests for API endpoints
	- CI workflow for backend tests and frontend build

# RELEASE STRATEGY
	- release 1
		- project scaffold
		- database schema
		- dataset importer
	- release 2
		- feed UI
		- recipe cards
	- release 3
		- authentication
		- save and like
	- release 4
		- boards
		- comments
	- release 5
		- AI recipe generator

# GOAL
	- Deliver a fully functional pinterest style recipe discovery platform
	- Clean architecture
	- Scalable backend
	- Beautiful modern UI
	- Ready for future AI features