import type { Load } from '@sveltejs/kit';

export const load: Load = ({ params }) => {
	return {
		seed: params.seed
	}
};
