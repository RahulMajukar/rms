import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authAPI } from './services/api';
import logo from '../assets/Qsutra_RMS_Square_Blue.png';
import logo2 from '../assets/agilogo.png';
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = ({ onLogin }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
 
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
 
      const user = await authAPI.login(data.username, data.password);
      const role = user.role.toUpperCase(); // Keep as uppercase for consistency
 
      onLogin({
        id: user.id,
        role: role,
        name: user.name,
        field: data.selectedField,
      });
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.status === 401
          ? 'Invalid username or password.'
          : 'An error occurred during login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
 
  return (
    <div className="min-h-screen flex">
      {/* Left side with gradient background and text */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-600 via-violet-500 to-purple-400 p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          {/* Logo placeholder - in production, replace with actual logo */}
          <div className="flex items-center gap-4 mb-6 ">
            <img
              src={logo}
              alt="AGI Logo"
              className="w-[200px] h-auto mb-9 mr-6"
            />
          </div>
          <h1 className="text-1xl text-white leading-tight">Qsutra - Records Management System</h1>
          <h3 className="text-white text-sm">E-Logs Book - Ver 2.0.1 ( 7th April, 2025 )</h3>
          <br/>
          <p className="text-white text-xs leading-tight">
            International copyright laws and treaties for Intellectual Property, govern & protect this computer program.
            Any form of unauthorised reproduction, copying or distribution of this program in whole or part,
            will attract severe civil & criminal prosecution for maximum extent implications possible under law.
          </p>
 
          {/* Decorative elements similar to the image */}
          <div className="relative mt-16">
            <div className="absolute -top-10 left-20 w-24 h-8 bg-pink-400/50 rounded-full transform rotate-45"></div>
            <div className="absolute top-10 left-40 w-32 h-8 bg-orange-400/50 rounded-full transform -rotate-12"></div>
            <div className="absolute top-20 left-10 w-20 h-20 bg-pink-400/50 rounded-full"></div>
          </div>
        </div>
      </div>
 
      {/* Right side with login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <img
            src={logo2}
            alt="AGI Logo"
            className="w-[80px] h-auto ml-48"
          />
 
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-purple-600 mb-6 text-center">
              Speciality Glass Division
            </h2>
            <p className="text-gray-500">Sign in to continue to your dashboard</p>
          </div>
 
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
              {error}
            </div>
          )}
 
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role selection - Updated with new role names */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1.323l-3.954 1.582a1 1 0 00-.646.934v4.5a1 1 0 001 1h8.8a1 1 0 001-1v-4.5a1 1 0 00-.646-.934L11 4.323V3a1 1 0 00-1-1zM4.4 6.839l3.9-1.562 3.9 1.562v3.161H4.4V6.839z" clipRule="evenodd" />
                </svg>
              </div>
              <select
                id="selectedField"
                className={`bg-gray-100 text-gray-900 w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none ${errors.selectedField ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                disabled={loading}
                {...register("selectedField", { required: "Role selection is required" })}
              >
                <option value="">Select Role</option>
                <option value="operator">Shift Engineer</option>
                <option value="qa">Quality Manager</option>
                <option value="avp">Quality HOD</option>
                <option value="master">Master</option>
                {/* <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="user">User</option> */}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {errors.selectedField && (
                <p className="text-red-500 text-xs mt-1">{errors.selectedField.message}</p>
              )}
            </div>

            {/* Username input with icon */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                className={`bg-gray-100 text-gray-900 w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.username ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                id="username"
                type="text"
                placeholder="Username"
                disabled={loading}
                {...register("username", { 
                  required: "Username is required",
                  minLength: { value: 2, message: "Username must be at least 2 characters" }
                })}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>
 
            {/* Password input with icon and show/hide toggle */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                className={`bg-gray-100 text-gray-900 w-full pl-10 pr-12 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.password ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                disabled={loading}
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 4, message: "Password must be at least 4 characters" }
                })}
              />
              <div 
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
 
            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-gray-600">
                  Remember me
                </label>
              </div>
              <div className="text-pink-600 hover:text-pink-500 cursor-pointer">
                Forgot password?
              </div>
            </div>
 
            {/* Submit button */}
            <button
              className="w-full bg-gradient-to-r from-pink-600 to-pink-400 text-white font-medium py-3 px-4 rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'LOGIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
 
export default LoginForm;