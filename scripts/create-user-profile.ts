import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://itolyllbvbdorqapuhyj.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_EMAIL = 'admin@trs.com';

async function createUserProfile() {
  if (!SERVICE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.');
    process.exit(1);
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // 1. Get the auth user
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

  // 2. Create the user profile
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
