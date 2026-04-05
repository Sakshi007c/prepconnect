import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient'; 

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase URL se token automatically detect kar leta hai
    // Hum bas verify kar rahe hain ki session valid hai ya nahi
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Link expired or invalid!!');
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (password.length < 6) {
      setError('Password should be atleast 6 characters long');
      setLoading(false);
      return;
    }

    // Naya password Supabase me save karne ka code
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccessMsg('Password successfully updated! Redirecting...');
      // 3 seconds baad login page par bhej dega
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex flex-col justify-center sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-10 shadow-xl rounded-2xl border-t-4 border-t-green-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
          Set new Password
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

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border transition-all outline-none" 
                placeholder="New Password" 
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">Password should be atleast 6 characters long.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading || !!successMsg} // Success ke baad button disable kar denge
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;