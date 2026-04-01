import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Error: Missing environment variables in .env.local');
  console.log(
    'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.\n',
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (a) => {
      rl.close();
      resolve(a.trim());
    }),
  );
}

async function main() {
  console.log('\n=== ⚡ Supabase Admin Creator (CLI) ===\n');

  const email = await ask('Enter Admin Email: ');
  const password = await ask('Enter Admin Password (min 6 chars): ');

  if (!email.includes('@') || password.length < 6) {
    console.error('❌ Invalid email or password too short.');
    process.exit(1);
  }

  console.log(`\n⏳ Creating Auth user for ${email}...`);
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    throw new Error(`Auth Error: ${authError.message}`);
  }

  const user = authData.user;
  console.log(`✅ Auth user created! ID: ${user.id}`);

  console.log('⏳ Setting role to Admin (ID: 0) in profiles table...');
  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: email,
      role_id: 0,
    },
    { onConflict: 'id' },
  );

  if (profileError) {
    throw new Error(`Profile Sync Error: ${profileError.message}`);
  }

  console.log('\n✨ SUCCESS! ✨');
  console.log(`Account ${email} is now an Admin.`);
  console.log('You can now log in to your application.\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ CRITICAL ERROR:', err.message);
  process.exit(1);
});
