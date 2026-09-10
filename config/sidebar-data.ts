import {
  LayoutDashboard,
  Users,
  UserCheck,
  GitPullRequest,
  CreditCard,
  TicketPercent,
  Wallet,
  Receipt,
  Stethoscope,
  Activity,
  HeartPulse,
  ShieldCheck,
} from "lucide-react"

import { type SidebarData } from "@/components/types"

export const sidebarData: SidebarData = {
  user: {
    name: "relaydor Admin",
    email: "admin@relaydor.com",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face",
  },
  teams: [
    {
      name: "relaydor",
      logo: HeartPulse,
      plan: "Medical Network Admin",
    },
    {
      name: "Apex Healthcare",
      logo: Stethoscope,
      plan: "Hospital Partner",
    },
  ],
  navGroups: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Medical Network",
      items: [
        {
          title: "Doctors",
          url: "/admin/doctors",
          icon: UserCheck,
        },
        {
          title: "Patients",
          url: "/admin/patients",
          icon: Users,
        },
        {
          title: "Referrals & Cases",
          url: "/admin/referrals",
          icon: GitPullRequest,
          badge: "Active",
        },
      ],
    },
    {
      title: "Billing & Plans",
      items: [
        {
          title: "Subscription Plans",
          url: "/admin/subscriptions",
          icon: CreditCard,
        },
        {
          title: "Coupons & Offers",
          url: "/admin/coupons",
          icon: TicketPercent,
        },
      ],
    },
    {
      title: "Finance & Payouts",
      items: [
        {
          title: "Doctor Withdrawals",
          url: "/admin/withdrawals",
          icon: Wallet,
          badge: "Pending",
        },
        {
          title: "Transactions Ledger",
          url: "/admin/transactions",
          icon: Receipt,
        },
      ],
    },
    {
      title: "Access Management",
      items: [
        {
          title: "Users & Roles",
          url: "/admin/users",
          icon: ShieldCheck,
        },
      ],
    },
  ],
}
