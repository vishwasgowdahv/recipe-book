# Recipe Book

Recipe Book is a modern, full-stack web application built to empower home cooks. The application features a dynamic and responsive user interface crafted with **React** and styled with **Tailwind CSS**, providing a seamless experience across all devices. The robust backend, powered by **Node.js** and **Express.js**, handles secure user authentication with **JWT** and manages recipe data efficiently within a **MongoDB** database. It's the perfect tool for organizing your culinary life, from managing recipes to discovering new dishes with a powerful pantry search.


## Live Demo

- **Deployment Link:** [https://recipe-api-frontend.netlify.app/](https://recipe-api-frontend.netlify.app/)
- **Video Demo:** Watch a demo of Recipe Book here: [https://youtu.be/DuWJmsoMgEg](https://youtu.be/DuWJmsoMgEg)

## Features

🍽️ **Recipe Management:** Users can create, view, edit, and delete their own recipes, complete with ingredients, instructions, and descriptions.


📆 **Weekly Meal Planner:** A dynamic meal planning tool allows users to organize their recipes into a weekly schedule. The view is responsive, showing a full weekly grid on desktop and a convenient single-day view for mobile devices.


🛒 **Pantry Search:** Discover new recipes by searching for dishes that can be made with the ingredients you have on hand.


🔐 **User Authentication:** Secure user registration and login functionality ensure that your data is private and accessible only to you.

## Technologies Used

### Frontend
- **React** ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
- **TypeScript** ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
- **React Router** ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
- **Axios** ![Axios](https://img.shields.io/badge/axios-6714E9?style=for-the-badge&logo=axios&logoColor=white)
- **Tailwind CSS** ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend
- **Node.js** ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
- **Express.js** ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
- **MongoDB** ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
- **Mongoose** ![Mongoose](https://img.shields.io/badge/Mongoose-800000?style=for-the-badge&logo=mongoose&logoColor=white)
- **JSON Web Tokens (JWT)** ![JWT](https://img.shields.io/badge/json%20web%20tokens-323330?style=for-the-badge&logo=json-web-tokens&logoColor=white)
- **Bcrypt** ![Bcrypt](https://img.shields.io/badge/bcrypt-000000?style=for-the-badge&logo=bcrypt&logoColor=white)

### Deployment & Environment
- **Vite** ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
- **Environment Variables** ![Environment Variables](https://img.shields.io/badge/env-F8C471?style=for-the-badge&logo=dotenv&logoColor=black)

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (or yarn)
- MongoDB

### Steps

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Vandu-Shre/recipe-app.git](https://github.com/Vandu-Shre/recipe-app.git)
    ```

2.  **Set up the backend:**
    - Navigate to the backend directory.
    - Install dependencies: `npm install`
    - Create a `.env` file with your MongoDB URI and JWT secret.
    - Start the server: `npm start`

3.  **Set up the frontend:**
    - Navigate to the frontend directory.
    - Install dependencies: `npm install`
    - Create a `.env` file with your backend API URL.
    - Start the development server: `npm run dev`

4.  **Access the App:**
    The application will be available at `http://localhost:5173`
