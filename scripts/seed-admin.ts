import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('ERRO: Você precisa ter PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no seu .env local.');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function createMaster() {
    const email = 'consultor@demo.com';
    const password = 'Demo@123';

    console.log(`Tentando criar usuário: ${email}...`);

    // 1. Cria usuário no Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Consultor Master' }
    });

    if (error) {
        console.error('ERRO COMPLETO DO SUPABASE:', error);
        if (error.message.includes('already registered')) {
            console.log('O usuário já existe no Auth. Garantindo permissão de Master...');
            // Se já existe, buscamos o ID por e-mail para garantir a role
            const { data: users } = await supabaseAdmin.auth.admin.listUsers();
            if (users?.users) {
                const existingUser = users.users.find(u => u.email === email);
                if (existingUser) {
                    await setMasterRole(existingUser.id);
                }
            }
        } else {
            console.error('Erro ao criar usuário:', error.message);
        }
    } else if (data.user) {
        console.log('Usuário criado com sucesso no Auth!');
        await setMasterRole(data.user.id);
    }
}

async function setMasterRole(userId: string) {
    const { error } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: userId,
            full_name: 'Consultor Master',
            role: 'master'
        });

    if (error) {
        console.error('Erro ao definir role master no profile:', error.message);
    } else {
        console.log('Role MASTER configurada com sucesso!');
    }
}

createMaster();
