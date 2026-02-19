import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppDataProvider } from "@/context/AppDataContext";
import AppLayout from "@/components/AppLayout";
import { Suspense, lazy } from "react";
// ... imports

// Lazy Load Pages
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminSalespersons = lazy(() => import("@/pages/admin/AdminSalespersons"));
const AdminDistributors = lazy(() => import("@/pages/admin/AdminDistributors"));
const AdminMachines = lazy(() => import("@/pages/admin/AdminMachines"));
const AdminKits = lazy(() => import("@/pages/admin/AdminKits"));
const AdminRequests = lazy(() => import("@/pages/admin/AdminRequests"));
const SalesRequestForm = lazy(() => import("@/pages/sales/SalesRequestForm"));
const SalesPreviewPdf = lazy(() => import("@/pages/sales/SalesPreviewPdf"));
const SalesMyRequests = lazy(() => import("@/pages/sales/SalesMyRequests"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-slate-500 font-medium animate-pulse">Loading...</p>
    </div>
  </div>
);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const ProtectedRoutes = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {user.role === 'admin' ? (
            // ... keep routes same, just wrapped in Suspense
            <>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/salespersons" element={<AdminSalespersons />} />
              <Route path="/admin/distributors" element={<AdminDistributors />} />
              <Route path="/admin/machines" element={<AdminMachines />} />
              <Route path="/admin/kits" element={<AdminKits />} />
              <Route path="/admin/requests" element={<AdminRequests />} />
              <Route path="/sales/preview-pdf/:id?" element={<SalesPreviewPdf />} />
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            </>
          ) : (
            <>
              <Route path="/sales/request-form" element={<SalesRequestForm />} />
              <Route path="/sales/preview-pdf/:id?" element={<SalesPreviewPdf />} />
              <Route path="/sales/my-requests" element={<SalesMyRequests />} />
              <Route path="/" element={<Navigate to="/sales/request-form" replace />} />
            </>
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

const AppRouter = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppDataProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </AppDataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
