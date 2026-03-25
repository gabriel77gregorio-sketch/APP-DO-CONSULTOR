import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();
const supabaseAdmin = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById('b41dc4d2-0b17-429d-8a7d-3ef13718182f');
  console.log("Error:", error?.message);
  console.log("User email:", data?.user?.email);
}

test();
