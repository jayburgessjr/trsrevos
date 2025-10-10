import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://itolyllbvbdorqapuhyj.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_EMAIL = 'admin@trs.com';

async function confirmEmail() {
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

  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const user = users.find(u => u.email === USER_EMAIL);

  if (!user) {
    console.error(`User with email ${USER_EMAIL} not found.`);
    return;
  }

  const { data: updatedUser, error } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { email_confirm: true }
  );

  if (error) {
    console.error('Error confirming email:', error);
  } else {
    console.log('Email confirmed for:', updatedUser.user.email);
  }
}

confirmEmail();
