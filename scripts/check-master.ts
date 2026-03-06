import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function check() {
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('role', 'master')
        .single();

    if (profile) {
        console.log('MASTER_FOUND:', profile.full_name);
    } else {
        console.log('MASTER_NOT_FOUND');
    }
}

check();
