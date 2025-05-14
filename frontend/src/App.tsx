import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/common/Layout";
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/NotFound";
import LoginPage from "@/pages/LoginPage";
import PublicDashboard from "@/pages/PublicDashboard";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import CitizenDashboard from "@/pages/CitizenDashboard";
import ComplaintsPage from "@/pages/ComplaintsPage";
import ComplaintDetailPage from "@/pages/ComplaintDetailPage";
import NotificationsPage from "@/pages/NotificationsPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminComplaintsPage from "@/pages/admin/AdminComplaintsPage";
import AdminComplaintDetail from "@/pages/admin/AdminComplaintDetail";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";
import SuperAdminDashboard from "@/pages/super-admin/SuperAdminDashboard";
import UserManagementPage from "@/pages/super-admin/UserManagementPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          
            <Route
              path="/"
              element={
                <Layout>
                  <LandingPage />
                </Layout>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/public"
              element={
                <Layout>
                  <PublicDashboard />
                </Layout>
              }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route
              path="/dashboard"
              element={
                <Layout>
                  <CitizenDashboard />
                </Layout>
              }
            />
            <Route
              path="/complaints"
              element={
                <Layout>
                  <ComplaintsPage />
                </Layout>
              }
            />
            <Route
              path="/complaints/:id"
              element={
                <Layout>
                  <ComplaintDetailPage />
                </Layout>
              }
            />
            <Route
              path="/notifications"
              element={
                <Layout>
                  <NotificationsPage />
                </Layout>
              }
            />

            <Route
              path="/admin"
              element={
                <Layout>
                  <AdminDashboard />
                </Layout>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <Layout>
                  <AdminComplaintsPage />
                </Layout>
              }
            />
            <Route
              path="/admin/complaints/:id"
              element={
                <Layout>
                  <AdminComplaintDetail />
                </Layout>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <Layout>
                  <AdminAnalyticsPage />
                </Layout>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <Layout>
                  <NotificationsPage />
                </Layout>
              }
            />

            <Route
              path="/super-admin"
              element={
                <Layout>
                  <SuperAdminDashboard />
                </Layout>
              }
            />
            <Route
              path="/super-admin/users"
              element={
                <Layout>
                  <UserManagementPage />
                </Layout>
              }
            />
            <Route
              path="/super-admin/analytics"
              element={
                <Layout>
                  <AdminAnalyticsPage />
                </Layout>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
