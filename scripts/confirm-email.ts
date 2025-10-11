import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_EMAIL = 'admin@trs.com';

if (!supabaseUrl || !serviceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set before running this script.');
}

const resolvedSupabaseUrl = supabaseUrl as string;
const resolvedServiceKey = serviceKey as string;

async function confirmEmail() {
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
