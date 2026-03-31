export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: "/auth/login",
		LOGOUT: "/auth/logout",
		ME: "/auth/me",
	},
	ADMIN: {
		STATS: "/admin/stats",
		USERS: "/admin/users",
	},
	PRODUCTS: "/products",
	SELLERS: "/sellers",
} as const;