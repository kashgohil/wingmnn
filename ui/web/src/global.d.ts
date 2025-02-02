// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TSAny = any;

interface BaseDetails {
	id: string;
	label: string;
	description: string;
}

interface Metadata {
	createdBy: string;
	updatedBy: string;
	createdAt: string;
	updatedAt: string;
}

interface MapOf<T> {
	[k: string]: T;
}
