import { getDefaultUser } from "./config.js";

const DEFAULT_INITIAL_DATA = {
    categories: {
        "常用推荐": {
            isHidden: false,
            links: [
                { name: "GitHub", url: "https://github.com", icon: "devicon:github", tips: "全球最大的开源与代码托管平台", isPrivate: false },
                { name: "Cloudflare", url: "https://dash.cloudflare.com", icon: "logos:cloudflare", tips: "Cloudflare 控制台与 CDN 服务", isPrivate: false },
                { name: "V2EX", url: "https://v2ex.com", icon: "devicon:html5", tips: "创意工作者社区", isPrivate: false }
            ]
        },
        "搜索引擎": {
            isHidden: false,
            links: [
                { name: "Google", url: "https://www.google.com", icon: "logos:google-icon", tips: "Google 探索与搜索", isPrivate: false },
                { name: "Bing", url: "https://www.bing.com", icon: "logos:bing", tips: "微软必应搜索", isPrivate: false }
            ]
        }
    }
};

const EMPTY_DATA = DEFAULT_INITIAL_DATA;

export function safeJsonParse(text, fallback) {
    if (typeof text !== "string" || text === "") return { ok: false, data: fallback };
    try {
        const v = JSON.parse(text);
        if (!v || typeof v !== "object" || Array.isArray(v)) return { ok: false, data: fallback };
        return { ok: true, data: v };
    } catch (e) {
        return { ok: false, data: fallback };
    }
}

export function normalizeCategories(categories) {
    for (const key in categories) {
        if (Array.isArray(categories[key])) {
            categories[key] = { isHidden: false, links: categories[key] };
        }
    }
    return categories;
}

export async function getUsersKv(env) {
    const superAdminUsername = env.ADMIN_USERNAME || 'admin';
    const superAdminPassword = env.ADMIN_PASSWORD || 'admin123';

    let users = [];
    let usersJson = null;
    try {
        usersJson = await env.CARD_ORDER.get('sys_users');
    } catch (e) {
        console.error('KV read sys_users failed:', e);
    }
    
    if (usersJson) {
        try {
            const list = JSON.parse(usersJson);
            if (Array.isArray(list)) users = list;
        } catch {}
    }

    let superAdminIdx = users.findIndex(u => u.role === 'super_admin' || u.username === superAdminUsername);

    if (superAdminIdx !== -1) {
        users[superAdminIdx].username = superAdminUsername;
        users[superAdminIdx].password = superAdminPassword;
        users[superAdminIdx].role = 'super_admin';
    } else {
        users.unshift({
            username: superAdminUsername,
            password: superAdminPassword,
            nickname: '超级管理员',
            role: 'super_admin',
            owner: null,
            createdAt: Date.now()
        });
    }

    return users;
}

export async function saveUsersKv(env, users) {
    await env.CARD_ORDER.put('sys_users', JSON.stringify(users));
}

export async function readLinksKvForScope(env, scope, owner) {
    let dataKey = 'nav_data_guest';
    if (scope === 'authed' && owner) {
        dataKey = `nav_data_${owner}`;
    }

    let dataStr = null;
    try {
        dataStr = await env.CARD_ORDER.get(dataKey);
        if (!dataStr) {
            const legacyUser = getDefaultUser();
            const legacyData = await env.CARD_ORDER.get(legacyUser);
            if (legacyData) dataStr = legacyData;
        }
    } catch (e) {
        console.error("KV read links failed for key " + dataKey, e);
    }

    const { data } = safeJsonParse(dataStr, DEFAULT_INITIAL_DATA);
    if (data && data.categories) {
        data.categories = normalizeCategories(data.categories);
        if (Object.keys(data.categories).length === 0) {
            data.categories = DEFAULT_INITIAL_DATA.categories;
        }
    }
    return data || DEFAULT_INITIAL_DATA;
}

export async function saveLinksKvForOwner(env, owner, categoriesData) {
    const dataKey = owner === 'guest' ? 'nav_data_guest' : `nav_data_${owner}`;
    await env.CARD_ORDER.put(dataKey, JSON.stringify(categoriesData));
}

export async function readLinksKv(env) {
    return readLinksKvForScope(env, 'anon', null);
}

export function filterPublic(categories) {
    const out = {};
    for (const name in categories) {
        const cat = categories[name];
        if (cat && cat.isHidden) continue;
        const publicLinks = (cat && Array.isArray(cat.links) ? cat.links : []).filter(l => !l.isPrivate);
        if (publicLinks.length > 0) out[name] = { ...(cat || {}), links: publicLinks };
    }
    return out;
}

export async function readJsonBody(request, maxBytes = 8 * 1024 * 1024) {
    const len = parseInt(request.headers.get("Content-Length") || "0", 10);
    if (len > maxBytes) return { ok: false, reason: "TOO_LARGE" };
    const text = await request.text();
    if (text.length > maxBytes) return { ok: false, reason: "TOO_LARGE" };
    try { return { ok: true, data: JSON.parse(text) }; }
    catch { return { ok: false, reason: "BAD_JSON" }; }
}

export { EMPTY_DATA, DEFAULT_INITIAL_DATA };
