import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Dashboard from "@/pages/dashboard";
import Categories from "@/pages/categories";
import ClothingSets from "@/pages/clothing-sets";
import Calendar from "@/pages/calendar";
import Bookings from "@/pages/bookings";
import Orders from "@/pages/orders";
import NotFound from "@/pages/not-found";

const pageTitle = {
  "/": "Tổng quan",
  "/categories": "Quản lý danh mục",
  "/clothing-sets": "Quản lý bộ đồ",
  "/calendar": "Lịch thuê",
  "/bookings": "Đặt hàng mới",
  "/orders": "Quản lý đơn hàng",
};

function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <AdminLayout title={pageTitle["/"]}>
          <Dashboard />
        </AdminLayout>
      </Route>
      <Route path="/categories">
        <AdminLayout title={pageTitle["/categories"]}>
          <Categories />
        </AdminLayout>
      </Route>
      <Route path="/clothing-sets">
        <AdminLayout title={pageTitle["/clothing-sets"]}>
          <ClothingSets />
        </AdminLayout>
      </Route>
      <Route path="/calendar">
        <AdminLayout title={pageTitle["/calendar"]}>
          <Calendar />
        </AdminLayout>
      </Route>
      <Route path="/bookings">
        <AdminLayout title={pageTitle["/bookings"]}>
          <Bookings />
        </AdminLayout>
      </Route>
      <Route path="/orders">
        <AdminLayout title={pageTitle["/orders"]}>
          <Orders />
        </AdminLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
