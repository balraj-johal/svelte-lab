import type { Load } from "@sveltejs/kit";

export const load: Load = ({ params }) => {
    console.log(params);
    return {
        slug: params.slug
    }
}