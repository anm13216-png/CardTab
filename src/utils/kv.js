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

export async function readLinksKv(env) {
    const DEFAULT_USER = getDefaultUser();
    let dataStr = null;
    try {
        dataStr = await env.CARD_ORDER.get(DEFAULT_USER);
    } catch (e) {
        console.error("KV read failed:", e);
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

export { EMPTY_DATA };
