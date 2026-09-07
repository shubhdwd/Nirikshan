// Using global fetch in Node.js ES module

async function testRegistration() {
  const payload = {
    full_name: "Test Citizen L1",
    mobile_number: `9${Math.floor(Math.random() * 1000000000)}`,
    email: `testl1_${Date.now()}@example.com`,
    dob: "1990-01-01",
    city_district: "Mumbai",
    state: "Maharashtra",
    password: "Password123!",
    consent_terms: true,
    consent_reporting: true,
    l1_opt_in: true
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
  } catch (err) {
    console.error("Error:", err);
  }
}

testRegistration();
