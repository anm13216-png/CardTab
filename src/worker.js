import HTML_CONTENT from './frontend/index.html';
import { resolveConfig } from './utils/config.js';
import { assertEnv, corsHeaders } from './utils/response.js';
import { htmlMeta } from './utils/cache.js';
import { handleLogin, handleRefreshToken, handleValidateToken, handleLogout } from './api/auth.js';
import { handleGetLinks, handleSaveData, handleSaveDefaultView } from './api/links.js';
import { handleBackupData, handleExportData, handleImportData } from './api/backup.js';
import { handleIconProxy } from './api/icon.js';
import { handleGetUsers, handleAddUser, handleUpdateUser, handleDeleteUser } from './api/users.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        try {
            assertEnv(env);
        } catch (e) {
            console.error('CONFIG_ERROR:', e.message);
            return new Response(JSON.stringify({
                error: 'Server is not configured',
                messages: (e.code === 'CONFIG_ERROR' && Array.isArray(e.messages)) ? e.messages : []
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders(request, env),
                },
            });
        }

        resolveConfig(env);

        try {
            if (request.method === 'OPTIONS') {
                return new Response(null, { headers: {
                    ...corsHeaders(request, env),
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Max-Age': '86400',
                } });
            }

            if (url.pathname === '/api/icon') {
                return handleIconProxy(request, ctx);
            }

            if (url.pathname === '/' || url.pathname === '/index.html') {
                const { etag, body } = await htmlMeta(HTML_CONTENT);

                if (request.headers.get('If-None-Match') === etag) {
                    return new Response(null, {
                        status: 304,
                        headers: {
                            'ETag': etag,
                            'Cache-Control': 'public, max-age=60, s-maxage=300, must-revalidate',
                        },
                    });
                }

                const cacheKey = new Request(url.origin + '/', { method: 'GET' });
                const hit = await caches.default.match(cacheKey);
                if (hit) return hit;

                const res = new Response(body, {
                    headers: {
                        'Content-Type': 'text/html; charset=utf-8',
                        'ETag': etag,
                        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
                        'Vary': 'Accept-Encoding',
                    },
                });
                ctx.waitUntil(caches.default.put(cacheKey, res.clone()).catch(e => console.warn('html cache put failed', e)));
                return res;
            }

            // ---------- API 路由 ----------
            if (url.pathname === '/api/login' && request.method === 'POST') {
                return handleLogin(request, env);
            }

            if (url.pathname === '/api/refreshToken' && request.method === 'POST') {
                return handleRefreshToken(request, env);
            }

            if (url.pathname === '/api/validateToken') {
                return handleValidateToken(request, env);
            }

            if (url.pathname === '/api/getLinks') {
                return handleGetLinks(request, env, ctx);
            }

            if (url.pathname === '/api/saveData' && request.method === 'POST') {
                return handleSaveData(request, env, ctx);
            }

            if (url.pathname === '/api/saveDefaultView' && request.method === 'POST') {
                return handleSaveDefaultView(request, env, ctx);
            }

            if (url.pathname === '/api/users' && request.method === 'GET') {
                return handleGetUsers(request, env);
            }

            if (url.pathname === '/api/users/add' && request.method === 'POST') {
                return handleAddUser(request, env);
            }

            if (url.pathname === '/api/users/update' && request.method === 'POST') {
                return handleUpdateUser(request, env);
            }

            if (url.pathname === '/api/users/delete' && request.method === 'POST') {
                return handleDeleteUser(request, env);
            }

            if (url.pathname === '/api/backupData' && request.method === 'POST') {
                return handleBackupData(request, env);
            }

            if (url.pathname === '/api/exportData' && request.method === 'POST') {
                return handleExportData(request, env);
            }

            if (url.pathname === '/api/importData' && request.method === 'POST') {
                return handleImportData(request, env);
            }

            if (url.pathname === '/api/logout' && request.method === 'POST') {
                return handleLogout(request, env);
            }

            return new Response('Not Found', { status: 404, headers: corsHeaders(request, env) });
        } catch (e) {
            console.error('UNHANDLED', e, url.pathname, request.method);
            return new Response(JSON.stringify({ error: 'INTERNAL' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    }
};
