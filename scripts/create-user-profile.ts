import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_EMAIL = 'admin@trs.com';

if (!supabaseUrl || !serviceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set before running this script.');
}

const resolvedSupabaseUrl = supabaseUrl as string;
const resolvedServiceKey = serviceKey as string;

async function createUserProfile() {
  const supabaseAdmin = createClient(resolvedSupabaseUrl, resolvedServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }
  const authUser = users.find(u => u.email === USER_EMAIL);
  if (!authUser) {
    console.error(`Auth user with email ${USER_EMAIL} not found.`);
    return;
  }
  console.log(`✅ Found auth user: ${authUser.email}`);

  const { error: profileError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authUser.id,
      email: authUser.email,
      name: 'Admin User',
      role: 'SuperAdmin',
    });

  if (profileError) {
    console.error('❌ Error creating user profile:', profileError);
  } else {
    console.log('✅ User profile created successfully!');
  }
}

createUserProfile();
