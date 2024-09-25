import { VERCEL_URL } from '$env/static/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	return {
		url: VERCEL_URL ?? 'http://localhost:5173'
	};
};
