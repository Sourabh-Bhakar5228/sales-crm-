import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import DepartmentLeadDispatcher from "../pages/DepartmentLeadDispatcher";
import QueueExplorer from "../pages/QueueExplorer";
import LeadDetails from "../pages/LeadDetails";
import CreateLead from "../pages/marketing/CreateLead";
import CommunicationLead from "../pages/communication/CommunicationLead";
import VigilanceLead from "../pages/vigilance/VigilanceLead";
import SupportLead from "../pages/support/SupportLead";
import SalesLead from "../pages/sales/SalesLead";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import DashboardLayout from "../layouts/DashboardLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<DepartmentLeadDispatcher />} />
            <Route path="/leads/:id" element={<LeadDetails />} />
            <Route path="/all-leads" element={<QueueExplorer />} />

            {/* Marketing only route */}
            <Route element={<RoleRoute allowedRoles={["MARKETING"]} />}>
              <Route path="/marketing/create" element={<CreateLead />} />
            </Route>

            {/* Communication only route */}
            <Route element={<RoleRoute allowedRoles={["COMMUNICATION"]} />}>
              <Route path="/communication/leads/:id" element={<CommunicationLead />} />
            </Route>

            {/* Vigilance only route */}
            <Route element={<RoleRoute allowedRoles={["VIGILANCE"]} />}>
              <Route path="/vigilance/leads/:id" element={<VigilanceLead />} />
            </Route>

            {/* Support only route */}
            <Route element={<RoleRoute allowedRoles={["SUPPORT"]} />}>
              <Route path="/support/leads/:id" element={<SupportLead />} />
            </Route>

            {/* Sales only route */}
            <Route element={<RoleRoute allowedRoles={["SALES"]} />}>
              <Route path="/sales/leads/:id" element={<SalesLead />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
