export const prerender = false; //This will not work without this line

import type { APIRoute, APIContext } from 'astro';

export const POST: APIRoute = async ({ request, locals}: APIContext) => {
    const formData = await request.formData();
    const email = formData.get('subsemail');

    if (!locals || !locals.runtime || !locals.runtime.env || !locals.runtime.env.DB) {
        return new Response('Database not configured', { status: 500 });
    }

    const { DB } = locals.runtime.env;
    
    if (typeof email !== 'string') {
        return new Response('Invalid email', { status: 400 });
    }

    // Call a function to save the email to the D1 database
    const query = 'INSERT INTO newsletter (email, timestamp) VALUES (?1, CURRENT_TIMESTAMP)';
    await DB.prepare(query).bind(email).run();

    return new Response('Email submitted successfully', { status: 200 });
};
