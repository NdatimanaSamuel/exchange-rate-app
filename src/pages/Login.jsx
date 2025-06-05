import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- ICONS (no changes here) ---
const FXFlowIcon = ({ className }) => (
  <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 16.01V18H8V16.01H16ZM16 13V15H8V13H16ZM10 3H8V2H10V3ZM12 3H14V2H12V3ZM6 5H4V6H2V8H4V9H6V11H4V12H2V14H4V15H6V17H4V18H2V20H4V21H6V22H8V21H16V22H18V21H20V20H22V18H20V17H18V15H20V14H22V12H20V11H18V9H20V8H22V6H20V5H18V3H16V5H8V3H6V5ZM18 7V8H16V7H18ZM10 5V6H8V5H10ZM12 5V6H14V5H12ZM16 5V6H18V5H16ZM16 9V10H18V9H16ZM8 7V8H6V7H8ZM8 9V10H6V9H8ZM6 19V20H8V19H6ZM18 19V20H16V19H18Z" fill="white"/>
    <path d="M11 7H13V11H11V7Z" fill="white"/>
  </svg>
);
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" /><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" /><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" /><path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.599 36.372 48 30.651 48 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);
// --- END ICONS ---


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:7000/api/v1/auth/signin', {
        email,
        password,
      });

      // --- LOGIC TO SAVE USER DATA ---
      // 1. Extract the token and user object from the response
      const { token, user } = response.data;

      // 2. Check if we received the expected data
      if (token && user && user.role) {
        // 3. Store the token and user info in localStorage
        // The token is a string, so it can be stored directly.
        localStorage.setItem('token', token);
        // The user object must be converted to a JSON string before storing.
        localStorage.setItem('user', JSON.stringify(user));

        // 4. Redirect based on the user's role
        if (user.role === 'ADMIN') {
          // Note: Your routes should match this, e.g., /admin/dashboard
          navigate('/admin-home'); 
        } else if (user.role === 'TELLER') {
          // Note: Your routes should match this, e.g., /teller/dashboard
          navigate('/teller-home');
        } else {
          setError('Login successful, but role is unknown.');
        }
      } else {
        // This handles cases where the API response is not what we expect
        setError('Received an invalid response from the server.');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="grid md:grid-cols-2">
        {/* Left Column */}
        <div className="relative hidden md:block">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070&auto=format&fit=crop')" }}></div>
          <div className="relative z-10 flex h-full flex-col justify-between bg-black/60 p-10 text-white">
            <div className="flex items-center gap-3">
              <FXFlowIcon className="h-8 w-8" />
              <span className="text-2xl font-bold">FXFlow</span>
            </div>
            <div>
              <p className="text-3xl font-semibold leading-snug">
                “Finally, a platform that makes currency exchange fast, fair, and incredibly simple.”
              </p>
              <div className="mt-4">
                <p className="text-lg font-medium">Maria Garcia</p>
                <p className="text-sm text-gray-300">International Consultant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="flex flex-col items-center justify-center p-8 lg:p-12 min-h-screen">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
              <p className="mt-2 text-gray-500">Sign in to access your dashboard.</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="password"className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                />
              </div>

              {error && (
                <div className="p-3 text-center text-sm text-red-800 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end">
                <a href="#" className="font-medium text-purple-600 hover:text-purple-500 text-sm">
                  Forgot password?
                </a>
              </div>

              <div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex w-full justify-center rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-purple-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </div>
            </form>
            
            <p className="mt-8 text-center text-sm text-gray-500">
              Go back to{' '}
              <Link to="/" className="font-semibold leading-6 text-purple-600 hover:text-purple-500">
                Main Site
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;