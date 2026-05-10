import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import LoginPageImg from '../assets/LoginPage.jpg';
import type { LoginFormInput, RegisterFormInput } from '../interfaces/auth'; 

type AuthFormData = LoginFormInput | RegisterFormInput;

const LoadingMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen text-gray-700 text-xl font-[Poppins] bg-neutral-50">
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg max-w-sm">
      <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 text-lg font-medium">{message}</p>
    </div>
  </div>
);

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (formData: AuthFormData) => {
    try {
      if (isLogin) {
        const { email, password } = formData as LoginFormInput;
        await login(email, password);
      } else {
        const { username, email, password } = formData as RegisterFormInput;
        await register(username, email, password);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Authentication failed. Please try again.');
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    }
  };

  if (isLoading && !user) {
    return <LoadingMessage message="Authenticating..." />;
  }

  if (user) {
    return <LoadingMessage message="You are already logged in. Redirecting..." />;
  }

  return (
    <div className="flex h-screen font-[Poppins]">
      <div className="hidden md:block w-2/3 relative h-full">
        <img
          src={LoginPageImg}
          alt="Various dishes on a table"
          className="object-cover w-full h-full"
        />
      </div>

      <div className="w-full md:w-1/3 flex items-center justify-center bg-white p-4 h-full overflow-y-auto">
        <div className="bg-white p-8 rounded-lg w-full max-w-sm mx-auto">
          <h2 className="text-3xl font-bold text-gray-600 mb-10 text-left whitespace-nowrap">
            {isLogin ? 'Login' : 'Register'}
          </h2>

          <AuthForm
            isRegister={!isLogin}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            buttonBgColor="bg-orange-400"
            buttonHoverColor="hover:bg-orange-500"
          />

          <p className="text-center text-gray-600 text-sm mt-10">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={toggleForm}
              className="text-orange-400 hover:text-orange-500 font-medium focus:outline-none"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;