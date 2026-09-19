import { validateServerToken } from './auth.js';
import { handleSmartBackup } from './backup.js';
import { corsHeaders, jsonResponse } from '../utils/response.js';
import { readLinksKvForScope, saveLinksKvForOwner, filterPublic, readJsonBody } from '../utils/kv.js';
import { getDataRev, bumpRev, cacheKeyFor, sendCached, CACHE } from '../utils/cache.js';
import { validateCategories, sanitizeCategories } from '../utils/validate.js';

export async function handleGetLinks(request, env, ctx) {
    const url = new URL(request.url);
    const authHeader = request.headers.get('Authorization');

    let scope = 'anon';
    let userOwner = null;
    let userPayload = null;

    if (authHeader) {
        const v = await validateServerToken(authHeader, env);
        if (v.isValid) {
            scope = 'authed';
            userPayload = v.payload;
            userOwner = v.payload.owner || v.payload.username;
        }
    }

    const rev = scope === 'anon' ? await getDataRev(env) : '0';
    const cacheKey = cacheKeyFor(url, rev, scope + '_' + (userOwner || 'guest'));

    if (scope === 'anon') {
        const hit = await CACHE.match(cacheKey);
        if (hit) {
            const r = new Response(hit.body, hit);
            r.headers.set('X-KV-Cache', 'HIT');
            return r;
        }
    }

    const data = await readLinksKvForScope(env, scope, userOwner);

    if (data && data.categories) {
        for (const name in data.categories) {
            const cat = data.categories[name];
            if (cat && Array.isArray(cat.links)) {
                for (const l of cat.links) {
                    if (l.category === undefined || l.category === null) l.category = name;
                }
            }
        }
    }

    if (scope === 'authed') {
        const resData = { ...data, currentUser: userPayload };
        return sendCached(JSON.stringify(resData), request, cacheKey, false, corsHeaders(request, env));
    }

    const publicData = data ? { categories: filterPublic(data.categories) } : { categories: {} };
    return sendCached(JSON.stringify(publicData), request, cacheKey, true, corsHeaders(request, env));
}

export async function handleSaveData(request, env, ctx) {
    const validation = await validateServerToken(request.headers.get('Authorization'), env);
    if (!validation.isValid) return jsonResponse(validation.response, validation.status, request, env);

    const body = await readJsonBody(request);
    if (!body.ok) return jsonResponse({ error: body.reason }, body.reason === 'TOO_LARGE' ? 413 : 400, request, env);

    const categories = body.data.categories || {};
    const check = validateCategories(categories);
    if (!check.ok) return jsonResponse({ error: 'INVALID_DATA', detail: check.reason }, 422, request, env);

    const userOwner = validation.payload.owner || validation.payload.username;

    const currentData = await env.CARD_ORDER.get(`nav_data_${userOwner}`);
    if (currentData) {
        ctx.waitUntil(handleSmartBackup(env, currentData));
    }

    await saveLinksKvForOwner(env, userOwner, { categories: sanitizeCategories(categories) });
    const rev = await bumpRev(env);
    return jsonResponse({ success: true, rev }, 200, request, env);
}

export async function handleSaveDefaultView(request, env, ctx) {
    const validation = await validateServerToken(request.headers.get('Authorization'), env);
    if (!validation.isValid) return jsonResponse(validation.response, validation.status, request, env);

    if (validation.payload.role !== 'super_admin') {
        return jsonResponse({ error: 'Forbidden', message: '仅超级管理员可以编辑默认初始化界面' }, 403, request, env);
    }

    const body = await readJsonBody(request);
    if (!body.ok) return jsonResponse({ error: body.reason }, body.reason === 'TOO_LARGE' ? 413 : 400, request, env);

    const categories = body.data.categories || {};
    const check = validateCategories(categories);
    if (!check.ok) return jsonResponse({ error: 'INVALID_DATA', detail: check.reason }, 422, request, env);

    await saveLinksKvForOwner(env, 'guest', { categories: sanitizeCategories(categories) });
    const rev = await bumpRev(env);
    return jsonResponse({ success: true, rev }, 200, request, env);
}
