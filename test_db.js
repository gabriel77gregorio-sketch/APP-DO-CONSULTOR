import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: stepCount1, error: e1 } = await supabaseAdmin.from('roadmap_steps').select('id', { count: 'exact', head: true });
  console.log("Steps before insert:", stepCount1);
  
  // Insert a test client
  const { data: client, error: clientErr } = await supabaseAdmin.from('clients').insert({
    consultant_id: 'dummy-id', // Needs to be an existing UUID if foreign key is enforced, but let's see. Wait, we can just query triggers.
  }).select().single();
  
  console.log("Insert client error:", clientErr);
}
test();
