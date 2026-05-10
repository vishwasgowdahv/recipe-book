import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'; // Import icons

import RecipeIcon from '../assets/RecipeIcon.svg';
import ProfileIcon from '../assets/ProfileIcon.svg';

const Logo = () => (
  <Link to="/" className="flex flex-col items-center tracking-wide">
    <img src={RecipeIcon} alt="RecipeIcon" className="h-12 w-12 mb-1" />
    <span className="text-3xl text-orange-400 font-[pacifico]">Recipe Book</span>
  </Link>
);

const Navbar: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Add state for mobile menu
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white p-4 font-[Poppins] shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 relative">
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex flex-grow justify-center">
          <div className="flex space-x-12 text-gray-600 font-medium text-lg">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'text-amber-500 font-semibold' : 'hover:text-amber-500') + ' transition duration-200'}
            >
              Home
            </NavLink>
            <NavLink
              to="/recipes"
              className={({ isActive }) => (isActive ? 'text-amber-500 font-semibold' : 'hover:text-amber-500') + ' transition duration-200'}
            >
              Recipes
            </NavLink>
            <NavLink
              to="/meal-planner"
              className={({ isActive }) => (isActive ? 'text-amber-500 font-semibold' : 'hover:text-amber-500') + ' transition duration-200'}
            >
              Meal Planner
            </NavLink>
            <NavLink
              to="/pantry-search"
              className={({ isActive }) => (isActive ? 'text-amber-500 font-semibold' : 'hover:text-amber-500') + ' transition duration-200'}
            >
              Pantry Search
            </NavLink>
            <NavLink
              to="/add-recipe"
              className={({ isActive }) => (isActive ? 'text-amber-500 font-semibold' : 'hover:text-amber-500') + ' transition duration-200'}
            >
              Contribute
            </NavLink>
          </div>
        </div>

        {/* Mobile menu button and profile icon */}
        <div className="flex items-center gap-4 md:hidden">
          {isLoading ? (
              <div className="text-gray-400">...</div>
            ) : (
            <>
              {/* User Profile Icon for Mobile */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center justify-center focus:outline-none" 
                  >
                    <img src={ProfileIcon} alt="ProfileIcon" className="h-10 w-10"/>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block w-full text-left mt-2 px-6 py-4 text-base text-gray-700 hover:bg-gray-100"
                      >
                        Your Recipes
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-6 py-4 text-base text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="flex items-center">
                  <img src={ProfileIcon} alt="ProfileIcon" className="h-10 w-10"/>
                </Link>
              )}
            </>
          )}

          {/* Hamburger/Close Button for Mobile */}
          <button
            onClick={toggleMenu}
            className="text-gray-600 focus:outline-none"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-8 w-8" />
            ) : (
              <Bars3Icon className="h-8 w-8" />
            )}
          </button>
        </div>


        {/* User Profile Section for Desktop */}
        <div className="hidden md:flex flex-shrink-0 items-center space-x-6">
          {isLoading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <>
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center justify-center focus:outline-none" 
                  >
                    <span className="px-4 py-2 text-md text-gray-600">
                      {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Chef'}
                    </span>
                    <img src={ProfileIcon} alt="ProfileIcon" className="mr-4 h-10 w-10"/>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block w-full text-left mt-2 px-6 py-4 text-base text-gray-700 hover:bg-gray-100"
                      >
                        Your Recipes
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-6 py-4 text-base text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="flex items-center">
                  <img src={ProfileIcon} alt="ProfileIcon" className="h-10 w-10"/>
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white mt-4 space-y-4 text-gray-600 font-medium text-lg flex flex-col items-center">
          <NavLink
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) => (isActive ? 'text-amber-500 font-semibold' : 'hover:text-amber-500') + ' transition duration-200 w-full text-center py-2'}
          >
            Home
          </NavLink>
          <NavLink
            to="/recipes"
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) => (isActive ? 'text-amber-500 font-semibold' : 'hover:text-amber-500') + ' transition duration-200 w-full text-center py-2'}
          >
            Recipes
          </NavLink>
          <NavLink
            to="/meal-planner"
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) => (isActive ? 'text-amber-500 font-semibold' : 'hover:text-amber-500') + ' transition duration-200 w-full text-center py-2'}
          >
            Meal Planner
          </NavLink>
          <NavLink
            to="/pantry-search"
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) => (isActive ? 'text-amber-500 font-semibold' : 'hover:text-amber-500') + ' transition duration-200 w-full text-center py-2'}
          >
            Pantry Search
          </NavLink>
          <NavLink
            to="/add-recipe"
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) => (isActive ? 'text-amber-500 font-semibold' : 'hover:text-amber-500') + ' transition duration-200 w-full text-center py-2'}
          >
            Contribute
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navbar;