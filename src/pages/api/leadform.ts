export const prerender = false; //This will not work without this line

import type { APIRoute, APIContext } from 'astro';

export const POST: APIRoute = async ({ request, locals }: APIContext) => {
    const data = await request.formData();
    const name = data.get("usrname");
    const email = data.get("email");
    const message = data.get("msg");
    const refer = data.get("ref");

    if (!locals || !locals.runtime || !locals.runtime.env || !locals.runtime.env.DB) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { DB } = locals.runtime.env;

    if (!name || !email || !message || !refer) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Call a function to save the email to the D1 database
    const query = 'INSERT INTO leads (name, email, refer, message, timestamp) VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)';
    await DB.prepare(query).bind(name, email, refer, message).run();

    return new Response(JSON.stringify({ message: 'Submitted successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
