import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClinicProvider } from "@/context/ClinicContext";
import { AppLayout } from "@/components/layout/AppLayout";
import ClinicSettings from "@/pages/ClinicSettings";
import EncounterDocumentation from "@/pages/EncounterDocumentation";
import PatientLookup from "@/pages/PatientLookup";
import HistoryFeed from "@/pages/HistoryFeed";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ClinicProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/settings" replace />} />
              <Route path="/settings" element={<ClinicSettings />} />
              <Route path="/encounter" element={<EncounterDocumentation />} />
              <Route path="/lookup" element={<PatientLookup />} />
              <Route path="/history" element={<HistoryFeed />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </ClinicProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
