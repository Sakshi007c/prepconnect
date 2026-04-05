import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Mail, Lock, AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Yeh state tay karegi ki "Login" form dikhana hai ya "Forgot Password" form
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || '/';

  // --- Normal Login Handle Karne Ka Function ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else {
      alert("Login successfull!");
      navigate(redirectPath); 
    }
  };

  // --- Password Reset Link Bhejne Ka Function ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Enter your e-mail");
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    // Supabase reset password API call
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`, // Reset ke baad yahan aayega
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccessMsg('Resent link sent. Check your inbox!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex flex-col justify-center sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-10 shadow-xl rounded-2xl border-t-4 border-t-blue-500 transition-all duration-300">
        
        {/* Dynamic Heading */}
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
          {isForgotPasswordView ? 'Password Reset' : 'Log In'}
        </h2>
        
        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 shrink-0" /> 
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 shrink-0" /> 
            {successMsg}
          </div>
        )}

        {/* --- FORGOT PASSWORD FORM --- */}
        {isForgotPasswordView ? (
          <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-sm text-gray-600 text-center">
              Enter your registered e-mail.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border transition-all outline-none" 
                  placeholder="admin@prepconnect.com" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Resend link'}
            </button>

            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => {
                  setIsForgotPasswordView(false);
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center justify-center gap-1 mx-auto transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </div>
          </form>
        ) : (
          
        /* --- NORMAL LOGIN FORM --- */
          <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border transition-all outline-none" 
                  placeholder="admin@prepconnect.com" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                {/* Yahan se Forgot Password view open hoga */}
                <button 
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordView(true);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border transition-all outline-none" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
            </button>
          </form>
        )}

        {!isForgotPasswordView && (
          <p className="mt-6 text-center text-sm text-gray-600">
            New Account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Register here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
