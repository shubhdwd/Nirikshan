async function testRegistration() {
  const payload = {
    full_name: "Dummy Account",
    mobile_number: "9999999999",
    dob: "1990-01-01",
    city_district: "Mumbai",
    state: "Maharashtra",
    password: "Password123!",
    consent_terms: true,
    consent_reporting: true,
    l1_opt_in: false
  };

  try {
    const res = await fetch('http://127.0.0.1:4000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
    console.log("You can log in with:");
    console.log("Email: 9999999999@nirikshan.local");
    console.log("Password: Password123!");
  } catch (err) {
    console.error("Error:", err);
  }
}

testRegistration();
