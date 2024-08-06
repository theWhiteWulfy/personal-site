import type { APIRoute, APIContext } from 'astro';

export const POST: APIRoute = async ({ request }, {locals}: APIContext) => {
    const formData = await request.formData();
    const email = formData.get('subsemail');
    const { DB } = locals.runtime.env;
    if (typeof email !== 'string') {
        return new Response('Invalid email', { status: 400 });
    }

    // Call a function to save the email to the D1 database
    const query = 'INSERT INTO newsletter (email, timestamp) VALUES (?1, CURRENT_TIMESTAMP)';
    await DB.prepare(query).bind(email).run();

    return new Response('Email submitted successfully', { status: 200 });
};

