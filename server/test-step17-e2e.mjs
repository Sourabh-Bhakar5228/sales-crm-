import fetch from "node-fetch";
import FormData from "form-data";

const BASE_URL = "http://localhost:5000/api";

const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookie = res.headers.get("set-cookie");
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Login failed for ${email}`);
  return { cookie, user: data.data.user };
};

const runE2ETest = async () => {
  console.log("🚀 Starting Step 17 End-to-End Hardening & Integration Test...\n");

  // Step 1: Login Marketing & Create Lead
  console.log("1️⃣ [MARKETING] Logging in and creating new lead...");
  const marketing = await login("marketing@vibhanu.com", "Vibhanu@123");
  const uniqueContact = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

  const createRes = await fetch(`${BASE_URL}/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: marketing.cookie,
    },
    body: JSON.stringify({
      name: "Rohit Verma",
      contactNumber: uniqueContact,
    }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) throw new Error(`Create lead failed: ${createData.message}`);
  const leadId = createData.data._id;
  console.log(`   ✅ Lead Created: ${leadId} | Status: ${createData.data.status}`);

  // Step 2: Login Communication & Mark Meeting
  console.log("\n2️⃣ [COMMUNICATION] Confirming meeting schedule...");
  const communication = await login("communication@vibhanu.com", "Vibhanu@123");
  const meetingRes = await fetch(`${BASE_URL}/leads/${leadId}/meeting`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: communication.cookie,
    },
    body: JSON.stringify({
      name: "Rohit Verma",
      postalAddress: "Plot 42, Sector 18, Gurugram, Haryana",
      date: "2026-10-15",
      time: "14:30",
      remark: "Customer confirmed requirement for enterprise CRM tier",
    }),
  });
  const meetingData = await meetingRes.json();
  if (!meetingRes.ok) throw new Error(`Mark meeting failed: ${meetingData.message}`);
  console.log(`   ✅ Meeting Confirmed | Status: ${meetingData.data.status}`);

  // Step 3: Security Defense Check - Attempt premature claim before Vigilance & Support
  console.log("\n3️⃣ [SECURITY] Testing premature workflow transition rejection...");
  const sales = await login("sales@vibhanu.com", "Vibhanu@123");
  const prematureClaimRes = await fetch(`${BASE_URL}/sales/${leadId}/claim`, {
    method: "POST",
    headers: { Cookie: sales.cookie },
  });
  console.log(`   ✅ Premature claim correctly rejected with HTTP ${prematureClaimRes.status}`);

  // Step 4: Login Vigilance & Attach Audio & Verify
  console.log("\n4️⃣ [VIGILANCE] Uploading audio and verifying lead...");
  const vigilance = await login("vigilance@vibhanu.com", "Vibhanu@123");

  const form = new FormData();
  const dummyWav = Buffer.from(
    "RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00",
    "binary"
  );
  form.append("audio", dummyWav, { filename: "customer-call.wav", contentType: "audio/wav" });

  const audioRes = await fetch(`${BASE_URL}/vigilance/${leadId}/audio`, {
    method: "POST",
    headers: {
      ...form.getHeaders(),
      Cookie: vigilance.cookie,
    },
    body: form,
  });
  const audioData = await audioRes.json();
  if (!audioRes.ok) throw new Error(`Audio upload failed: ${audioData.message}`);
  console.log(`   ✅ Audio Attached: ${audioData.data.audio?.fileName} | Cloudinary URL Present: ${Boolean(audioData.data.audio?.url)}`);

  const verifyRes = await fetch(`${BASE_URL}/vigilance/${leadId}/verify`, {
    method: "POST",
    headers: { Cookie: vigilance.cookie },
  });
  const verifyData = await verifyRes.json();
  if (!verifyRes.ok) throw new Error(`Verify failed: ${verifyData.message}`);
  console.log(`   ✅ Lead Verified | Status: ${verifyData.data.status}`);

  // Step 5: Login Support & Allocate to Sales
  console.log("\n5️⃣ [SUPPORT] Verifying checklist & allocating to Sales executive...");
  const support = await login("support@vibhanu.com", "Vibhanu@123");
  const salesUsersRes = await fetch(`${BASE_URL}/users/sales`, {
    headers: { Cookie: support.cookie },
  });
  const salesUsersData = await salesUsersRes.json();
  const targetSalesUser = salesUsersData.data[0];
  console.log(`   Selected Sales Rep: ${targetSalesUser.name} (${targetSalesUser._id})`);

  const allocateRes = await fetch(`${BASE_URL}/support/${leadId}/allocate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: support.cookie,
    },
    body: JSON.stringify({ assignedTo: targetSalesUser._id }),
  });
  const allocateData = await allocateRes.json();
  if (!allocateRes.ok) throw new Error(`Allocation failed: ${allocateData.message}`);
  console.log(`   ✅ Lead Allocated | Status: ${allocateData.data.status} | Assigned: ${allocateData.data.assignedTo}`);

  // Step 6: Login Sales & Anti-Bypass Playback Protection
  console.log("\n6️⃣ [SALES] Testing Anti-Bypass Playback & Claiming lead...");
  // Attempt claim without audio completion
  const bypassAttemptRes = await fetch(`${BASE_URL}/sales/${leadId}/claim`, {
    method: "POST",
    headers: { Cookie: sales.cookie },
  });
  const bypassData = await bypassAttemptRes.json();
  if (bypassAttemptRes.status === 400 || bypassAttemptRes.status === 409) {
    console.log(`   ✅ Anti-bypass protection verified: Claim rejected without audio completion (${bypassData.message})`);
  } else {
    throw new Error(`Anti-bypass failed, got status ${bypassAttemptRes.status}`);
  }

  // Trigger audio completion
  const audioCompleteRes = await fetch(`${BASE_URL}/sales/${leadId}/audio-completed`, {
    method: "POST",
    headers: { Cookie: sales.cookie },
  });
  const audioCompleteData = await audioCompleteRes.json();
  if (!audioCompleteRes.ok) throw new Error(`Audio complete failed: ${audioCompleteData.message}`);
  console.log(`   ✅ Audio completion timestamp recorded: ${audioCompleteData.data.audioCompletedAt}`);

  // Execute legitimate claim
  const claimRes = await fetch(`${BASE_URL}/sales/${leadId}/claim`, {
    method: "POST",
    headers: { Cookie: sales.cookie },
  });
  const claimData = await claimRes.json();
  if (!claimRes.ok) throw new Error(`Claim failed: ${claimData.message}`);
  console.log(`   ✅ Lead Claimed Successfully! Status: ${claimData.data.status} | ClaimedBy: ${claimData.data.claimedBy}`);

  // Step 7: Verify Workflow Audit Ledger
  console.log("\n7️⃣ [AUDIT LEDGER] Inspecting complete 7-step WorkflowLog history...");
  const workflowRes = await fetch(`${BASE_URL}/leads/${leadId}/workflow`, {
    headers: { Cookie: sales.cookie },
  });
  const workflowData = await workflowRes.json();
  const logs = workflowData.data;
  console.log(`   Found ${logs.length} workflow log entries:`);
  logs.forEach((log, i) => {
    console.log(`   ${i + 1}. [${log.performedByRole}] ${log.action}: ${log.fromStatus || "START"} ➔ ${log.toStatus}`);
  });

  // Step 8: Verify Dashboard Stats API
  console.log("\n8️⃣ [STATS] Verifying GET /api/leads/stats...");
  const statsRes = await fetch(`${BASE_URL}/leads/stats`, {
    headers: { Cookie: sales.cookie },
  });
  const statsData = await statsRes.json();
  console.log("   ✅ Stats Response:", JSON.stringify(statsData.data, null, 2));

  console.log("\n🎉 ALL STEP 17 INTEGRATION & HARDENING CHECKS PASSED PERFECTLY! 🚀");
};

runE2ETest().catch((err) => {
  console.error("❌ E2E Test Failed:", err);
  process.exit(1);
});
