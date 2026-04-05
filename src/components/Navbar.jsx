
// import React, { useState, useEffect } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { BookOpen, Menu, X, Shield, LogOut } from 'lucide-react';
// import { supabase } from '../supabaseClient'; 

// const Navbar = ({ isAdmin, onAdminLogout }) => {
//   const [user, setUser] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkUser = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       setUser(session?.user ?? null);
//     };
//     checkUser();

//     const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });

//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, []);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     alert("Logged out successfully!");
//     setUser(null);
//   };

//   const handleAdminLogoutClick = () => {
//     onAdminLogout();
//     navigate('/');
//   };

//   const navLinkClass = (path) => 
//     `text-sm font-medium transition-colors hover:text-blue-600 ${location.pathname === path ? 'text-blue-600' : 'text-gray-600'}`;

//   return (
//     <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16 items-center">
          
//           <Link to="/" className="flex items-center gap-2 cursor-pointer group">
//             <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
//               <BookOpen className="text-white w-6 h-6" />
//             </div>
//             <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
//               PrepConnect
//             </span>
//           </Link>

//           <div className="hidden md:flex items-center gap-6">
//             <Link to="/" className={navLinkClass('/')}>Home</Link>
//             <Link to="/prep-material" className={navLinkClass('/prep-material')}>PrepMaterial </Link>
//             <Link to="/share" className={navLinkClass('/share')}>Share </Link>
//             <Link to="/explore" className={navLinkClass('/explore')}>Explore Feed </Link>

//             <div className="h-6 w-px bg-gray-200 mx-2"></div>
            
//             {isAdmin ? (
//               // Admin Logged In Hai Toh Yeh Dikhao
//               <>
//                 <Link to="/admin-dashboard" className="text-purple-600 font-bold hover:text-purple-700 flex items-center gap-1">
//                   <Shield className="w-4 h-4"/> Admin Panel
//                 </Link>
//                 <button onClick={handleAdminLogoutClick} className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
//                   <LogOut className="w-4 h-4"/> Logout Admin
//                 </button>
//               </>
//             ) : (
//               // Normal User Auth Logic
//               <>
//                 {user ? (
//                   <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium transition-colors cursor-pointer">
//                     Logout
//                   </button>
//                 ) : (
//                   <>
//                     <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Log in</Link>
//                     <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-0.5">
//                       Register
//                     </Link>
//                   </>
//                 )}
//                 <Link to="/admin-login" className="text-gray-400 text-xs hover:text-purple-600 ml-2">Admin</Link>
//               </>
//             )}
//           </div>

//           <div className="md:hidden flex items-center gap-4">
//             <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
//               {isOpen ? <X /> : <Menu />}
//             </button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, Shield, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient'; 
import MotionHighlight from './MotionHighlight';

// App.jsx se user aur isAdmin as props aa rahe hain
const Navbar = ({ user, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("Logged out successfully!");
    navigate('/');
  };

  const navLinkClass = (path) => 
    `rounded-full px-4 py-2 text-sm font-medium transition-colors ${location.pathname === path ? 'text-blue-700' : 'text-gray-600 hover:text-blue-600'}`;

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              PrepConnect
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <MotionHighlight
              hover
              className="rounded-full border border-blue-100 bg-blue-50/90 shadow-sm"
              itemsClassName="rounded-full"
            >
              <Link to="/" className={navLinkClass('/')}>Home</Link>
              <Link to="/prep-material" className={navLinkClass('/prep-material')}>PrepMaterial</Link>
              <Link to="/share" className={navLinkClass('/share')}>Share</Link>
              <Link to="/explore" className={navLinkClass('/explore')}>Explore Feed</Link>
            </MotionHighlight>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            
            {/* Sirf Admin ke liye Dashboard link */}
            {isAdmin && (
              <Link to="/admin-dashboard" className="text-purple-600 font-bold hover:text-purple-700 flex items-center gap-1">
                <Shield className="w-4 h-4"/> Admin Panel
              </Link>
            )}

            {/* Normal User & Admin dono ke liye ek hi auth flow */}
            {user ? (
              <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium transition-colors cursor-pointer flex items-center gap-1">
                <LogOut className="w-4 h-4"/> Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Log in</Link>
                <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-0.5">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
