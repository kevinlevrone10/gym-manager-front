export type PlanCode = "free" | "basic" | "essential" | "plus";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "suspended"
  | "cancelled";

export interface Module {
  code: string;
  name: string;
  icon?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
  tenantId: string;
  permissions: string[];
  modules: Module[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ClientListItem {
  id: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  whatsAppOptIn: boolean;
  createdAt: string;
  membership?: {
    endDate: string;
    daysToExpiry: number;
    planName: string;
    membershipStatus: string;
  } | null;
}

export interface ClientDetail {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  whatsAppOptIn: boolean;
  notes: string | null;
}

export interface ClientSearchItem {
  id: string;
  fullName: string;
  phone: string;
}

export interface PlanItem {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  isActive: boolean;
}

export interface PlanSelectItem {
  id: string;
  displayText: string;
}

export type MembershipStatus = "active" | "pending" | "expired" | "cancelled";

export interface MembershipHistoryItem {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
}

export interface MembershipsByClient {
  client: {
    id: string;
    fullName: string;
    phone: string;
    isActive: boolean;
  };
  memberships: MembershipHistoryItem[];
}

export interface MembershipPreview {
  client: { id: string; fullName: string };
  lastMembership: {
    planName: string;
    endDate: string;
    status: MembershipStatus;
  } | null;
  newMembership?: {
    startDate: string;
    endDate: string;
    planName: string;
  } | null;
}

export interface RenewMembershipResponse {
  membershipId: string;
  paymentId: string;
  startDate: string;
  endDate: string;
  amount: number;
  isChained: boolean;
}

export type PaymentMethod = "cash" | "card" | "transfer" | "other";

export interface PaymentItem {
  id: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidAt: string;
  isQuickPayment: boolean;
  notes: string | null;
}

export interface QuickPaymentResponse {
  paymentId: string;
  customerName: string;
  planName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidAt: string;
}

export interface DashboardSummary {
  activeMembers: number;
  expiringThisWeek: number;
  expiredThisWeek: number;
  newMembersThisMonth: number;
  todayPayments: { count: number; total: number };
  monthPayments: { count: number; total: number };
}

export interface TenantMe {
  name: string;
  slug: string;
  timeZone: string;
  currency: string;
  plan: PlanCode;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserDetail {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  phone: string | null;
  isActive: boolean;
}

export interface RoleItem {
  id: string;
  name: string;
  description: string | null;
  permissionsCount: number;
  createdAt: string;
}

export interface RoleSelectItem {
  id: string;
  name: string;
}

export interface RolePermissionFlag {
  id: string;
  name: string;
  isSelected: boolean;
}

export interface RoleDetail {
  id: string;
  name: string;
  description: string | null;
  modules: Array<{
    moduleCode: string;
    moduleName: string;
    permissions: RolePermissionFlag[];
  }>;
}

export interface ModuleWithPermissions {
  code: string;
  name: string;
  icon: string;
  permissions: { id: string; code: string; name: string }[];
}
