import { createBrowserRouter } from "react-router-dom";
import {
  Building2,
  HandHeart,
  LayoutDashboard,
  Package,
  PlusCircle,
  ShieldCheck,
  Truck,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import { RootLayout } from "@/components/layout/RootLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { RoleRoute } from "@/components/routes/RoleRoute";
import { HomePage } from "@/pages/HomePage";
import { HowItWorksPage } from "@/pages/HowItWorksPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { NgoDirectoryPage } from "@/pages/NgoDirectoryPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { DonorDashboardPage } from "@/pages/donor/DonorDashboardPage";
import { DonorDonationsPage } from "@/pages/donor/DonorDonationsPage";
import { CreateDonationPage } from "@/pages/donor/CreateDonationPage";
import { DonorDonationDetailPage } from "@/pages/donor/DonorDonationDetailPage";
import { DonorProfilePage } from "@/pages/donor/DonorProfilePage";
import { NgoDashboardPage } from "@/pages/ngo/NgoDashboardPage";
import { NgoAvailablePage } from "@/pages/ngo/NgoAvailablePage";
import { NgoPickupsPage } from "@/pages/ngo/NgoPickupsPage";
import { NgoDistributionsPage } from "@/pages/ngo/NgoDistributionsPage";
import { NgoDonationDetailPage } from "@/pages/ngo/NgoDonationDetailPage";
import { NgoProfilePage } from "@/pages/ngo/NgoProfilePage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminNgosPage } from "@/pages/admin/AdminNgosPage";
import { AdminReviewsPage } from "@/pages/admin/AdminReviewsPage";
import { ROUTES } from "@/lib/routes";
import type { DashboardNavItem } from "@/components/layout/DashboardLayout";

const donorNav: DashboardNavItem[] = [
  { to: ROUTES.donor.root, label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: ROUTES.donor.donations, label: "My donations", icon: Package, end: true },
  { to: ROUTES.donor.newDonation, label: "Create donation", icon: PlusCircle },
  { to: ROUTES.donor.profile, label: "Profile", icon: UserRound },
];

const ngoNav: DashboardNavItem[] = [
  { to: ROUTES.ngo.root, label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: ROUTES.ngo.available, label: "Available donations", icon: HandHeart },
  { to: ROUTES.ngo.pickups, label: "Pickups", icon: Truck },
  { to: ROUTES.ngo.distributions, label: "Distributions", icon: UsersRound },
  { to: ROUTES.ngo.profile, label: "Profile", icon: UserRound },
];

const adminNav: DashboardNavItem[] = [
  { to: ROUTES.admin.root, label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: ROUTES.admin.users, label: "Users", icon: Users },
  { to: ROUTES.admin.ngos, label: "NGO verification", icon: Building2 },
  { to: ROUTES.admin.reviews, label: "Proof reviews", icon: ShieldCheck },
];

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
      { path: ROUTES.howItWorks, element: <HowItWorksPage /> },
      { path: ROUTES.categories, element: <CategoriesPage /> },
      { path: ROUTES.ngos, element: <NgoDirectoryPage /> },
      { path: ROUTES.about, element: <AboutPage /> },
      { path: ROUTES.contact, element: <ContactPage /> },
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
      {
        path: ROUTES.notifications,
        element: <ProtectedRoute />,
        children: [{ index: true, element: <NotificationsPage /> }],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: ROUTES.donor.root,
    element: <RoleRoute roles={["DONOR"]} />,
    children: [
      {
        element: <DashboardLayout nav={donorNav} />,
        children: [
          { index: true, element: <DonorDashboardPage /> },
          { path: "donations", element: <DonorDonationsPage /> },
          { path: "donations/new", element: <CreateDonationPage /> },
          { path: "donations/:id", element: <DonorDonationDetailPage /> },
          { path: "profile", element: <DonorProfilePage /> },
        ],
      },
    ],
  },
  {
    path: ROUTES.ngo.root,
    element: <RoleRoute roles={["NGO"]} />,
    children: [
      {
        element: <DashboardLayout nav={ngoNav} />,
        children: [
          { index: true, element: <NgoDashboardPage /> },
          { path: "available", element: <NgoAvailablePage /> },
          { path: "pickups", element: <NgoPickupsPage /> },
          { path: "distributions", element: <NgoDistributionsPage /> },
          { path: "donations/:id", element: <NgoDonationDetailPage /> },
          { path: "profile", element: <NgoProfilePage /> },
        ],
      },
    ],
  },
  {
    path: ROUTES.admin.root,
    element: <RoleRoute roles={["ADMIN"]} />,
    children: [
      {
        element: <DashboardLayout nav={adminNav} />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "ngos", element: <AdminNgosPage /> },
          { path: "reviews", element: <AdminReviewsPage /> },
        ],
      },
    ],
  },
]);