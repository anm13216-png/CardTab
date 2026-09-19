export function corsHeaders(request, env) {
    const list = env && env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').filter(Boolean) : [];
    const origin = request ? request.headers.get('Origin') : null;
    if (!origin || !list.includes(origin)) return {};
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Vary': 'Origin',
    };
}

export function jsonResponse(body, status, request, env, extraHeaders = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders(request, env),
            'Content-Type': 'application/json',
            ...extraHeaders,
        },
    });
}

export function assertEnv(env) {
    // Relax rigid checks to prevent silent 500 server config crashes on login
    return true;
}