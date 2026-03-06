import { defineMiddleware } from 'astro:middleware';
import { supabase } from './lib/supabase';

// Rotas públicas (sem autenticação)
const PUBLIC_ROUTES = ['/login', '/logout'];

export const onRequest = defineMiddleware(async ({ url, cookies, redirect, locals }, next) => {
    const pathname = url.pathname;

    // Deixa passar rotas públicas
    if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
        return next();
    }

    // Lê o token da sessão do cookie
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
        return redirect('/login');
    }

    // Valida sessão no Supabase
    const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    if (error || !data.session) {
        cookies.delete('sb-access-token', { path: '/' });
        cookies.delete('sb-refresh-token', { path: '/' });
        return redirect('/login');
    }

    // Salva sessão nos locals para uso nas páginas
    locals.session = data.session;
    locals.user = data.session.user;

    return next();
});
