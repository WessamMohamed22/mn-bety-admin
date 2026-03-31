export const ROLES = {
	SUPER_ADMIN: "super_admin",
	ADMIN: "admin",
	SELLER: "seller",
	CUSTOMER: "customer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
