// src/App.tsx

// ... other page imports
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from './pages/AdminDashboard'; // 1. Import dashboard
import ProtectedRoute from './components/auth/ProtectedRoute'; // 2. Import protected route

// ...

const App = () => (
  // ... providers
      <BrowserRouter>
        <HelmetProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/success" element={<Success />} />
            <Route path="/teams" element={<Teams />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            /> {/* 3. Protect the dashboard route */}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </HelmetProvider>
      </BrowserRouter>
  //... other providers
);

export default App;