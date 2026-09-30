import { useAuth } from "../context/AuthContext";
import MarketingLeads from "./marketing/MarketingLeads";
import CommunicationLeads from "./communication/CommunicationLeads";
import VigilanceLeads from "./vigilance/VigilanceLeads";
import SupportLeads from "./support/SupportLeads";
import SalesLeads from "./sales/SalesLeads";

export default function DepartmentLeadDispatcher() {
  const { user } = useAuth();

  switch (user?.role) {
    case "MARKETING":
      return <MarketingLeads />;
    case "COMMUNICATION":
      return <CommunicationLeads />;
    case "VIGILANCE":
      return <VigilanceLeads />;
    case "SUPPORT":
      return <SupportLeads />;
    case "SALES":
      return <SalesLeads />;
    default:
      return (
        <div className="p-8 text-center text-sm text-slate-500">
          No specific lead workspace found for role: {user?.role}
        </div>
      );
  }
}
