import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SplashScreen from "@/components/SplashScreen";
import Gateway from "./pages/Gateway.tsx";
import UnderMaintenance from "./pages/UnderMaintenance.tsx";
import Dashboard from "./pages/DashboardRouter.tsx";
import FocusDashboard from "./pages/FocusDashboard.tsx";
import FocusSession from "./pages/FocusSession.tsx";
import Insights from "./pages/Insights.tsx";
import MicroQuest from "./pages/MicroQuest.tsx";
import AethosScan from "./pages/AethosScan.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        <HashRouter>
          <Routes>
            <Route path="/" element={<Gateway />} />
            <Route path="/maintenance" element={<UnderMaintenance />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home" element={<FocusDashboard />} />
            <Route path="/focus" element={<FocusSession />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/quest" element={<MicroQuest />} />
            <Route path="/explorer" element={<AethosScan />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
