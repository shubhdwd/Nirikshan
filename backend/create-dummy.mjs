import { admin } from './src/supabase.js';

async function createDummy() {
  const email = "dummy@example.com";
  const password = "Password123!";

  console.log("Creating dummy user...");
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Dummy User" }
  });

  if (error) {
    if (error.message.includes("already")) {
      console.log("Dummy user already exists. Credentials:");
      console.log("Email: dummy@example.com");
      console.log("Password: Password123!");
      process.exit(0);
    }
    console.error("Error creating user:", error);
    process.exit(1);
  }

  console.log("User created:", data.user.id);
  
  await admin.from('profiles').insert({
    id: data.user.id,
    full_name: "Dummy User",
    mobile_number: "9876543210",
    dob: "1990-01-01",
    city_district: "Mumbai",
    state: "Maharashtra",
    consent_terms: true,
    consent_reporting: true
  });

  await admin.from('user_roles').insert({
    user_id: data.user.id,
    role: 'citizen',
    is_active: true,
    approval_status: 'APPROVED'
  });

  console.log("Dummy user setup complete!");
  console.log("Email:", email);
  console.log("Password:", password);
  process.exit(0);
}

createDummy();
