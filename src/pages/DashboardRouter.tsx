import { useIsLight } from "@/hooks/useIsLight";
import DashboardLight from "./SerenityDashboard";
import DashboardDark from "./DashboardDark";

/**
 * Smart wrapper that renders the Sleek & Punchy Architecture dashboard in light mode
 * and the original dark aurora dashboard in dark mode.
 */
const DashboardRouter = () => {
  const isLight = useIsLight();
  return isLight ? <DashboardLight /> : <DashboardDark />;
};

export default DashboardRouter;
