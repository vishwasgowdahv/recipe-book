import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface AuthFormProps {
  isRegister: boolean;
  onSubmit: (formData: { username?: string; email: string; password: string }) => void;
  isLoading: boolean;
  buttonBgColor?: string;
  buttonHoverColor?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  isRegister,
  onSubmit,
  isLoading,
  buttonBgColor = 'bg-orange-400',
  buttonHoverColor = 'hover:bg-orange-500',
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ username, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {isRegister && (
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-orange-400 focus:border-orange-400 sm:text-sm placeholder-gray-500 text-gray-800"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required={isRegister}
            disabled={isLoading}
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-orange-400 focus:border-orange-400 sm:text-sm placeholder-gray-500 text-gray-800"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="relative">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          id="password"
          className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-orange-400 focus:border-orange-400 sm:text-sm placeholder-gray-500 text-gray-800 pr-12"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          {showPassword ? (
            <EyeIcon className="h-5 w-5" />
          ) : (
            <EyeSlashIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      <div>
        <button
          type="submit"
          className={`w-full flex justify-center mt-10 py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-white ${buttonBgColor} ${buttonHoverColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (isRegister ? 'Registering...' : 'Logging in...') : (isRegister ? 'Register' : 'Login')}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;