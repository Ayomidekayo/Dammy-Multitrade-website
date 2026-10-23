
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./features/auth/AuthProvider";
import { LoginPage } from "./features/auth/LoginPage";
import DashboardPage from "./features/dashboard/DashboardPage";

import ProductsPage from "./features/products/ProductsPage";
import AdminLayout from "./components/admin/AdminLayout";
import SiteSettingsPage from "./features/site-settings/SiteSettingsPage";
import HomePage from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import AdminCategoriesPage from "./features/categories/AdminCategoriesPage";
import FloatingWhatsAppButton from "./components/public/FloatingWhatsAppButton";
import ProductDetailPage from "./features/products/ProductDetailPage.professional";
import PublicProductDetailPage from "./components/public/PublicProductDetailPage";


export default function App() {
  const { admin, loading } = useAuth();

  // Wait until the existing authentication session is restored.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />
          <p className="text-sm font-medium text-slate-600">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
       
        <Route
          path="/categories/:slug"
          element={<CategoryProductsPage />}
        />
        <Route
  path="/products/:slug"
  element={<PublicProductDetailPage />}
/>

        {/* Admin login */}
        <Route
          path="/admin/login"
          element={
            admin ? (
              <Navigate to="/admin" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Protected admin pages */}
        <Route
          path="/admin"
          element={
            admin ? (
              <AdminLayout />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="settings" element={<SiteSettingsPage />} />
           <Route
  path="products/:id"
  element={<ProductDetailPage />}
/>
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={
            <Navigate to={admin ? "/admin" : "/"} replace />
          }
        />
      </Routes>

      {/* Floating WhatsApp button available across all routes */}
      <FloatingWhatsAppButton />
    </>
  );
}
