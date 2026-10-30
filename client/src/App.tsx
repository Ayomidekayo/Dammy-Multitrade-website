
import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";

import FloatingWhatsAppButton from "./components/public/FloatingWhatsAppButton";
import PublicProductDetailPage from "./components/public/PublicProductDetailPage";

import AdminLayout from "./components/admin/component/AdminLayout";
import { useAuth } from "./features/auth/AuthProvider";
import { LoginPage } from "./features/auth/LoginPage";

import DashboardPage from "./features/dashboard/DashboardPage";
import ProductsPage from "./features/products/ProductsPage";
import AdminCategoriesPage from "./features/categories/AdminCategoriesPage";
import AdminCategoryProductsPage from "./features/categories/AdminCategoryProductsPage";
import SiteSettingsPage from "./features/site-settings/SiteSettingsPage";
import AdminProductDetailPage from "./features/products/AdminProductDetailPage";

export default function App() {
  const { admin, loading } = useAuth();

  // Restore the existing authentication session.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#160B28] px-5">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-[#493459] border-t-[#F5B942]" />
            <div className="h-3 w-3 rounded-full bg-[#F5B942]" />
          </div>

          <div className="text-center">
            <p className="text-sm font-bold tracking-wide text-white">
              DAMMY MULTITRADE VENTURES
            </p>
            <p className="mt-1 text-xs text-[#C4B6D5]">
              Preparing your workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* PUBLIC WEBSITE */}
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

        {/* ADMIN LOGIN */}
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

        {/* PROTECTED ADMIN WORKSPACE */}
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
          {/* Dashboard overview */}
          <Route index element={<DashboardPage />} />

          {/* Category management */}
          <Route
            path="categories"
            element={<AdminCategoriesPage />}
          />

          {/* Products belonging to a particular category */}
          <Route
            path="categories/:id/products"
            element={<AdminCategoryProductsPage />}
          />

          {/* All products */}
          <Route
            path="products"
            element={<ProductsPage />}
          />

          {/* Individual product details */}
          <Route
            path="products/:id"
            element={<AdminProductDetailPage />}
          />

          {/* Website configuration */}
          <Route
            path="settings"
            element={<SiteSettingsPage />}
          />
        </Route>

        {/* UNKNOWN ROUTES */}
        <Route
          path="*"
          element={
            <Navigate to={admin ? "/admin" : "/"} replace />
          }
        />
      </Routes>

      {/* Floating WhatsApp button */}
      <FloatingWhatsAppButton />
    </>
  );
}
