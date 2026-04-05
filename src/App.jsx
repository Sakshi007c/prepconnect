



// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import { supabase } from './supabaseClient';

// // Components
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';
// import ChatBot from './components/ChatBot';

// // Pages
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Explore from './pages/Explore';
// import ShareExperience from './pages/ShareExperience';
// import PrepMaterial from './pages/PrepMaterial';
// import UpdatePassword from './pages/UpdatePassword';
// import AdminDashboard from './pages/AdminDashboard';

// function ProtectedRoute({ user, children }) {
//   const location = useLocation();

//   if (!user) {
//     return <Navigate to="/login" replace state={{ from: location.pathname }} />;
//   }

//   return children;
// }

// function App() {
//   const [user, setUser] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [authLoading, setAuthLoading] = useState(true);
//   const ADMIN_EMAIL = 'akankshaami07@gmail.com';

//   useEffect(() => {
//     // Check current session
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       const currentUser = session?.user ?? null;
//       setUser(currentUser);
//       setIsAdmin(currentUser?.email === ADMIN_EMAIL);
//       setAuthLoading(false);
//     });

//     // Listen for login/logout events
//     const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
//       const currentUser = session?.user ?? null;
//       setUser(currentUser);
//       setIsAdmin(currentUser?.email === ADMIN_EMAIL);
//       setAuthLoading(false);
//     });

//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, []);

//   return (
//     <Router>
//       <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-700">
//         <Navbar user={user} isAdmin={isAdmin} />
        
//         <main>
//           {authLoading ? null : (
//             <Routes>
//               <Route path="/" element={<Home />} />
//               <Route path="/prep-material" element={<PrepMaterial />} />
//               <Route path="/login" element={<Login />} />
//               <Route path="/register" element={<Register />} />
//               <Route path="/explore" element={<Explore />} />
//               <Route
//                 path="/share"
//                 element={(
//                   <ProtectedRoute user={user}>
//                     <ShareExperience />
//                   </ProtectedRoute>
//                 )}
//               />
//               <Route path="/update-password" element={<UpdatePassword />} />
//               <Route 
//                 path="/admin-dashboard" 
//                 element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} 
//               />
//             </Routes>
//           )}
//         </main>

//         <ChatBot />
//         <Footer />
//       </div>
//     </Router>
//   );
// }

// export default App;


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import ShareExperience from './pages/ShareExperience';
import PrepMaterial from './pages/PrepMaterial';
import UpdatePassword from './pages/UpdatePassword';
import AdminDashboard from './pages/AdminDashboard';

const ADMIN_EMAIL_DOMAIN = 'adminprepconnect@gmail.com';

const isAdminEmail = (email = '') =>
  email.trim().toLowerCase().endsWith(ADMIN_EMAIL_DOMAIN);

function ProtectedRoute({ user, children }) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function AdminRoute({ user, isAdmin, children }) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(isAdminEmail(currentUser?.email));
      setAuthLoading(false);
    });

    // Listen for login/logout events
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(isAdminEmail(currentUser?.email));
      setAuthLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-700">
        <Navbar user={user} isAdmin={isAdmin} />
        
        <main>
          {authLoading ? null : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/prep-material" element={<PrepMaterial />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/explore" element={<Explore />} />
              <Route
                path="/share"
                element={(
                  <ProtectedRoute user={user}>
                    <ShareExperience />
                  </ProtectedRoute>
                )}
              />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route 
                path="/admin-dashboard" 
                element={(
                  <AdminRoute user={user} isAdmin={isAdmin}>
                    <AdminDashboard />
                  </AdminRoute>
                )} 
              />
            </Routes>
          )}
        </main>

        <ChatBot />
        <Footer />
      </div>
    </Router>
  );
}

export default App;