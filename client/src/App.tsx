import { Routes, Route } from 'react-router-dom';
import './index.css';

import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import RecipeListPage from './pages/RecipeListPage';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AddRecipePage from './pages/AddRecipePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import EditRecipePage from './pages/EditRecipePage';
import MealPlannerPage from './pages/MealPlannerPage'; 
import PantrySearchPage from './pages/PantrySearchPage'; 

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="App flex flex-col min-h-screen text-gray-100 font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/recipes" element={<RecipeListPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/add-recipe" element={<AddRecipePage />} />
              <Route path="/edit-recipe/:id" element={<EditRecipePage />} />
              <Route path="/meal-planner" element={<MealPlannerPage />} /> 
              <Route path="/pantry-search" element={<PantrySearchPage />} /> 
            </Route>

            <Route path="*" element={<h1 className="text-center mt-20 text-4xl">404 - Not Found</h1>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;