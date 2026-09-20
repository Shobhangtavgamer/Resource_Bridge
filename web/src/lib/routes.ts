export const ROUTES = {
  home: "/",
  howItWorks: "/how-it-works",
  categories: "/categories",
  ngos: "/ngos",
  ngoDetail: (id: string) => `/ngos/${id}`,
  about: "/about",
  contact: "/contact",
  login: "/login",
  register: "/register",
  notifications: "/notifications",
  donor: {
    root: "/donor",
    donations: "/donor/donations",
    newDonation: "/donor/donations/new",
    donation: (id: string) => `/donor/donations/${id}`,
    profile: "/donor/profile",
  },
  ngo: {
    root: "/ngo",
    available: "/ngo/available",
    pickups: "/ngo/pickups",
    distributions: "/ngo/distributions",
    donation: (id: string) => `/ngo/donations/${id}`,
    profile: "/ngo/profile",
  },
  admin: {
    root: "/admin",
    users: "/admin/users",
    ngos: "/admin/ngos",
    reviews: "/admin/reviews",
  },
} as const;

export function roleDashboardRoute(role: string | null | undefined): string {
  switch (role) {
    case "DONOR":
      return ROUTES.donor.root;
    case "NGO":
      return ROUTES.ngo.root;
    case "ADMIN":
      return ROUTES.admin.root;
    default:
      return ROUTES.home;
  }
}