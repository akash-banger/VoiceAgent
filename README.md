# Evva Health Voice Agent

Welcome to the Evva Health Voice Agent project! This interactive AI assistant communicates with users through voice, providing a seamless and engaging experience.

## 🚀 Tech Stack

- **Frontend**: React.js
- **Backend**: FastAPI and Socket.IO
- **Database**: PostgreSQL

## 🛠 Setup and Installation

### Prerequisites

- Node.js and Yarn for the frontend
- Python 3.7+ for the backend
- PostgreSQL database

### Frontend Setup

1. Navigate to the frontend folder:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   yarn install
   ```

3. Create a `.env` file in the frontend directory and add necessary environment variables.

4. Start the development server:
   ```
   yarn start
   ```

### Backend Setup

1. Navigate to the backend folder:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python3 -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory and add necessary environment variables.

5. Start the backend server:
   ```
   python main.py
   ```

### Database Setup

1. Create a PostgreSQL database for the project.

2. Navigate to the db-migrations folder:
   ```
   cd db-migrations
   ```

3. Create a `.env` file in the db-migrations directory and add necessary database connection details.

4. Run database migrations:
   ```
   python init_db.py
   ```

## 🚦 Running the Project

1. Ensure the database is set up and running.
2. Start the backend server from the backend directory.
3. Start the frontend development server from the frontend directory.
4. Access the application through your web browser.

## 📝 Note

Make sure to properly configure all `.env` files with the necessary environment variables before running the project components.

Thank you
