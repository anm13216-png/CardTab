import { validateServerToken } from './auth.js';
import { getUsersKv, saveUsersKv } from '../utils/kv.js';
import { jsonResponse } from '../utils/response.js';
import { readJsonBody } from '../utils/kv.js';

export async function handleGetUsers(request, env) {
    const validation = await validateServerToken(request.headers.get('Authorization'), env);
    if (!validation.isValid) return jsonResponse(validation.response, validation.status, request, env);

    const caller = validation.payload;
    if (caller.role !== 'super_admin' && caller.role !== 'admin') {
        return jsonResponse({ error: 'Forbidden', message: '无用户管理权限' }, 403, request, env);
    }

    const users = await getUsersKv(env);

    if (caller.role === 'super_admin') {
        return jsonResponse({ success: true, users, callerRole: 'super_admin' }, 200, request, env);
    } else {
        const subUsers = users.filter(u => u.owner === caller.username || u.username === caller.username);
        return jsonResponse({ success: true, users: subUsers, callerRole: 'admin' }, 200, request, env);
    }
}

export async function handleAddUser(request, env) {
    const validation = await validateServerToken(request.headers.get('Authorization'), env);
    if (!validation.isValid) return jsonResponse(validation.response, validation.status, request, env);

    const caller = validation.payload;
    if (caller.role !== 'super_admin' && caller.role !== 'admin') {
        return jsonResponse({ error: 'Forbidden', message: '无权限添加用户' }, 403, request, env);
    }

    const body = await readJsonBody(request);
    if (!body.ok) return jsonResponse({ error: 'Invalid JSON' }, 400, request, env);

    const { username, password, nickname, role, owner } = body.data || {};

    if (!username || typeof username !== 'string' || !username.trim()) {
        return jsonResponse({ error: 'InvalidUsername', message: '请输入有效账号' }, 400, request, env);
    }
    if (!password || typeof password !== 'string' || !password.trim()) {
        return jsonResponse({ error: 'InvalidPassword', message: '请输入有效密码' }, 400, request, env);
    }

    const cleanUsername = username.trim();
    const users = await getUsersKv(env);

    const exists = users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (exists) {
        return jsonResponse({ error: 'UserExists', message: '该账号已存在' }, 400, request, env);
    }

    let newUserRole = 'user';
    let newUserOwner = caller.username;

    if (caller.role === 'super_admin') {
        newUserRole = (role === 'admin' || role === 'super_admin') ? role : 'user';
        if (newUserRole === 'user') {
            newUserOwner = (owner && typeof owner === 'string' && owner.trim()) ? owner.trim() : caller.username;
        } else {
            newUserOwner = cleanUsername;
        }
    } else {
        newUserRole = 'user';
        newUserOwner = caller.username;
    }

    const newUser = {
        username: cleanUsername,
        password: password.trim(),
        nickname: (nickname && typeof nickname === 'string' && nickname.trim()) ? nickname.trim() : cleanUsername,
        role: newUserRole,
        owner: newUserOwner,
        createdAt: Date.now()
    };

    users.push(newUser);
    await saveUsersKv(env, users);

    return jsonResponse({ success: true, user: newUser }, 200, request, env);
}

export async function handleUpdateUser(request, env) {
    const validation = await validateServerToken(request.headers.get('Authorization'), env);
    if (!validation.isValid) return jsonResponse(validation.response, validation.status, request, env);

    const caller = validation.payload;
    if (caller.role !== 'super_admin' && caller.role !== 'admin') {
        return jsonResponse({ error: 'Forbidden', message: '无权限修改用户' }, 403, request, env);
    }

    const body = await readJsonBody(request);
    if (!body.ok) return jsonResponse({ error: 'Invalid JSON' }, 400, request, env);

    const { username, newPassword, nickname, role, owner } = body.data || {};

    if (!username || typeof username !== 'string') {
        return jsonResponse({ error: 'InvalidUsername', message: '账号不能为空' }, 400, request, env);
    }

    const users = await getUsersKv(env);
    const targetIdx = users.findIndex(u => u.username === username);
    if (targetIdx === -1) {
        return jsonResponse({ error: 'NotFound', message: '用户不存在' }, 404, request, env);
    }

    const targetUser = users[targetIdx];

    if (caller.role === 'admin' && targetUser.owner !== caller.username && targetUser.username !== caller.username) {
        return jsonResponse({ error: 'Forbidden', message: '只能修改自己名下的用户' }, 403, request, env);
    }

    if (nickname !== undefined && typeof nickname === 'string') {
        targetUser.nickname = nickname.trim();
    }
    if (newPassword && typeof newPassword === 'string' && newPassword.trim()) {
        targetUser.password = newPassword.trim();
    }

    if (caller.role === 'super_admin' && targetUser.role !== 'super_admin') {
        if (role && (role === 'admin' || role === 'user')) {
            targetUser.role = role;
        }
        if (owner && typeof owner === 'string') {
            targetUser.owner = owner.trim();
        }
    }

    users[targetIdx] = targetUser;
    await saveUsersKv(env, users);

    return jsonResponse({ success: true, user: targetUser }, 200, request, env);
}

export async function handleDeleteUser(request, env) {
    const validation = await validateServerToken(request.headers.get('Authorization'), env);
    if (!validation.isValid) return jsonResponse(validation.response, validation.status, request, env);

    const caller = validation.payload;
    if (caller.role !== 'super_admin' && caller.role !== 'admin') {
        return jsonResponse({ error: 'Forbidden', message: '无权限删除用户' }, 403, request, env);
    }

    const body = await readJsonBody(request);
    if (!body.ok) return jsonResponse({ error: 'Invalid JSON' }, 400, request, env);

    const { username } = body.data || {};
    if (!username || typeof username !== 'string') {
        return jsonResponse({ error: 'InvalidUsername', message: '账号不能为空' }, 400, request, env);
    }

    const users = await getUsersKv(env);
    const targetUser = users.find(u => u.username === username);

    if (!targetUser) {
        return jsonResponse({ error: 'NotFound', message: '用户不存在' }, 404, request, env);
    }

    if (targetUser.role === 'super_admin') {
        return jsonResponse({ error: 'Forbidden', message: '不能删除超级管理员账号' }, 403, request, env);
    }

    if (caller.role === 'admin' && targetUser.owner !== caller.username) {
        return jsonResponse({ error: 'Forbidden', message: '只能删除自己名下的用户' }, 403, request, env);
    }

    const updatedUsers = users.filter(u => u.username !== username);
    await saveUsersKv(env, updatedUsers);

    return jsonResponse({ success: true }, 200, request, env);
}
