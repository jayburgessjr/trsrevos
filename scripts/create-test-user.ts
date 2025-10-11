/**
 * Utility script to provision a TRS RevOS test user with Supabase auth + profile.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables before running this script.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  console.log("🔧 Creating test user...\n");

  // Sign up test user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: "admin@trs.com",
    password: "password123",
  });

  if (authError) {
    console.error("❌ Auth error:", authError.message);

    // Try signing in instead
    console.log("\n🔄 Attempting to sign in instead...");
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: "admin@trs.com",
      password: "password123",
    });

    if (signInError) {
      console.error("❌ Sign in error:", signInError.message);
      process.exit(1);
    }

    console.log("✅ Signed in existing user:", signInData.user?.email);
    return;
  }

  if (!authData.user) {
    console.error("❌ No user created");
    process.exit(1);
  }

  console.log("✅ Auth user created:", authData.user.email);
  console.log("📧 User ID:", authData.user.id);

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: "TRS",
      type: "trs",
    })
    .select()
    .single();

  if (orgError) {
    console.error("❌ Organization error:", orgError);
  } else {
    console.log("✅ Organization created:", org?.name);
  }

  // Create user profile
  const { error: userError } = await supabase
    .from("users")
    .insert({
      id: authData.user.id,
      email: authData.user.email!,
      name: "Admin User",
      role: "SuperAdmin",
      organization_id: org?.id ?? null,
    });

  if (userError) {
    console.error("❌ User profile error:", userError);
  } else {
    console.log("✅ User profile created");
  }

  console.log("\n✅ Test user setup complete!");
  console.log("   Email: admin@trs.com");
  console.log("   Password: password123");
}

createTestUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  });
