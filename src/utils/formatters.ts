// Utility functions for formatting dates, currency (EGP), and numbers.

export function formatDate(value: string | Date): string {
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "-";

	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
}

export function formatCurrency(value: number): string {
	return new Intl.NumberFormat("en-EG", {
		style: "currency",
		currency: "EGP",
		maximumFractionDigits: 2,
	}).format(value);
}