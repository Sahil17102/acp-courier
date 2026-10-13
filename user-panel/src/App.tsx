import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { OnboardingRoute } from "./components/auth/OnboardingRoute";
import { SignUpPage } from "./pages/SignUpPage";
import { BrandedLoader } from "./components/common/BrandedLoader";

const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout").then((m) => ({ default: m.DashboardLayout })));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage").then((m) => ({ default: m.OnboardingPage })));
const SellerHomePage = lazy(() => import("./pages/SellerHomePage").then((m) => ({ default: m.SellerHomePage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const CreateOrderPage = lazy(() => import("./pages/CreateOrderPage").then((m) => ({ default: m.CreateOrderPage })));
const OrdersPage = lazy(() => import("./pages/OrdersPage").then((m) => ({ default: m.OrdersPage })));
const BulkB2CPage = lazy(() => import("./pages/BulkUpload/BulkB2CPage"));
const BulkB2BPage = lazy(() => import("./pages/BulkUpload/BulkB2BPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage").then((m) => ({ default: m.OrderDetailPage })));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const PickupAddressesPage = lazy(() => import("./pages/settings/pickup-addresses"));
const LabelConfigurationPage = lazy(() => import("./pages/settings/label-configuration"));
const KycPage = lazy(() => import("./pages/settings/kyc"));
const CompanyProfilePage = lazy(() => import("./pages/settings/company-profile"));
const BankDetailsPage = lazy(() => import("./pages/settings/bank-details"));
const BillingPreferencesPage = lazy(() => import("./pages/settings/billing-preferences"));
const UserManagementPage = lazy(() => import("./pages/settings/user-management"));
const ChangePasswordPage = lazy(() => import("./pages/settings/change-password"));
const WalletPage = lazy(() => import("./pages/WalletPage").then((m) => ({ default: m.WalletPage })));
const NdrPage = lazy(() => import("./pages/NdrPage").then((m) => ({ default: m.NdrPage })));
const RtoPage = lazy(() => import("./pages/RtoPage").then((m) => ({ default: m.RtoPage })));
const CodRemittancePage = lazy(() => import("./pages/CodRemittancePage").then((m) => ({ default: m.CodRemittancePage })));
const BillingInvoicesPage = lazy(() => import("./pages/BillingInvoicesPage").then((m) => ({ default: m.BillingInvoicesPage })));
const RateCardPage = lazy(() => import("./pages/tools/RateCardPage").then((m) => ({ default: m.RateCardPage })));
const SellerRateCalculatorPage = lazy(() => import("./pages/tools/RateCalculatorPage").then((m) => ({ default: m.RateCalculatorPage })));
const OrderTrackingPage = lazy(() => import("./pages/tools/OrderTrackingPage").then((m) => ({ default: m.OrderTrackingPage })));
const ReportsPage = lazy(() => import("./pages/ReportsPage").then((m) => ({ default: m.ReportsPage })));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage").then((m) => ({ default: m.NotificationsPage })));
const NotificationPreferencesPage = lazy(() => import("./pages/settings/notifications"));
const SupportListPage = lazy(() => import("./pages/support/SupportListPage").then((m) => ({ default: m.SupportListPage })));
const SupportDetailPage = lazy(() => import("./pages/support/SupportDetailPage").then((m) => ({ default: m.SupportDetailPage })));
function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
      {/* Auth */}
      <Route path="/" element={<SignUpPage />} />
      <Route path="/login" element={<SignUpPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <OnboardingPage />
          </OnboardingRoute>
        }
      />

      {/* Protected app — no /dashboard prefix */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<SellerHomePage />} />
        <Route path="/analytics" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/drafts" element={<OrdersPage drafts />} />
        <Route path="/orders/b2b" element={<OrdersPage type="b2b" />} />
        <Route path="/orders/b2c" element={<OrdersPage type="b2c" />} />
        <Route path="/orders/create" element={<CreateOrderPage />} />
        <Route path="/orders/b2c/bulk-upload" element={<BulkB2CPage />} />
        <Route path="/orders/b2b/bulk-upload" element={<BulkB2BPage />} />
        <Route path="/orders/bulk-upload" element={<Navigate to="/orders/b2c/bulk-upload" replace />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/operations" element={<ComingSoon title="Operations" />} />
        <Route path="/operations/ndr" element={<NdrPage />} />
        <Route path="/operations/rto" element={<RtoPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/cod-remittance" element={<CodRemittancePage />} />
        <Route path="/billings" element={<BillingInvoicesPage />} />
        <Route path="/reconciliation" element={<ComingSoon title="Reconciliation" />} />
        <Route path="/tools" element={<Navigate to="/tools/rate-card" replace />} />
        <Route path="/tools/rate-card" element={<RateCardPage />} />
        <Route path="/tools/rate-calculator" element={<SellerRateCalculatorPage />} />
        <Route path="/tools/order-tracking" element={<OrderTrackingPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/pickup-addresses" element={<PickupAddressesPage />} />
        <Route path="/settings/label-configuration" element={<LabelConfigurationPage />} />
        <Route path="/settings/kyc" element={<KycPage />} />
        <Route path="/settings/company-profile" element={<CompanyProfilePage />} />
        <Route path="/settings/bank-details" element={<BankDetailsPage />} />
        <Route path="/settings/billing-preferences" element={<BillingPreferencesPage />} />
        <Route path="/settings/change-password" element={<ChangePasswordPage />} />
        <Route path="/settings/user-management" element={<UserManagementPage />} />
        <Route path="/settings/invoice-preferences" element={<ComingSoon title="Invoice Preferences" />} />
        <Route path="/settings/manage-channels" element={<ComingSoon title="Manage Channels" />} />
        <Route path="/settings/courier-priority" element={<ComingSoon title="Courier Priority" />} />
        <Route path="/settings/api-integration" element={<ComingSoon title="API Integration" />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings/notifications" element={<NotificationPreferencesPage />} />
        <Route path="/support" element={<SupportListPage />} />
        <Route path="/support/:id" element={<SupportDetailPage />} />
      </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

function RouteLoader() {
  return <BrandedLoader message="Opening your panel..." fullScreen />;
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted">This page is coming soon.</p>
    </div>
  );
}

export default App;
