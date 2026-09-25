import fetch from 'node-fetch';
import { db } from '../server/src/db/database.js';

const BASE_API = 'http://127.0.0.1:5000/api';

async function runKycQA() {
  console.log('================================================================');
  console.log('HOTELHUB ENTERPRISE — OWNER KYC VERIFICATION QA TEST');
  console.log('================================================================\n');

  // 1. Authenticate as Super Admin
  const loginRes = await fetch(`${BASE_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@hotelhub.com', password: 'Admin@123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  if (!token) {
    console.error('❌ Failed to login as Super Admin:', loginData);
    process.exit(1);
  }
  console.log('✅ Super Admin Authenticated Successfully');

  // 2. Fetch Owners KYC list
  const kycListRes = await fetch(`${BASE_API}/owners/kyc`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const kycListData = await kycListRes.json();
  console.log(`✅ Fetched ${kycListData.owners?.length || 0} owner KYC profiles`);

  const testOwner = kycListData.owners?.[0] || { user_id: 'USR-OWNER-1', name: 'Rajesh Sharma' };
  const ownerId = testOwner.user_id;

  // 3. Test APPROVE & VERIFY
  console.log(`\n--- Testing TEST 1: Approve & Verify for Owner (${ownerId}) ---`);
  const approveRes = await fetch(`${BASE_API}/owners/${ownerId}/kyc`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status: 'verified' })
  });
  const approveData = await approveRes.json();

  if (approveRes.status === 200 && approveData.success && approveData.profile?.kyc_status === 'verified') {
    console.log(`✅ [PASS] Approve & Verify succeeded: status = ${approveData.profile.kyc_status}, verified_at = ${approveData.profile.verified_at}`);
  } else {
    console.error('❌ [FAIL] Approve & Verify failed:', approveData);
    process.exit(1);
  }

  // Database verification after approval
  const dbProfileApproved = db.getOwnerProfile(ownerId);
  if (dbProfileApproved?.kyc_status === 'verified') {
    console.log('✅ [PASS] Database record matches: kyc_status = verified');
  } else {
    console.error('❌ [FAIL] Database state mismatch:', dbProfileApproved);
    process.exit(1);
  }

  // 4. Test REJECT KYC
  console.log(`\n--- Testing TEST 2: Reject KYC for Owner (${ownerId}) ---`);
  const rejectionReason = 'PAN Card copy blurred and GSTIN mismatch.';
  const rejectRes = await fetch(`${BASE_API}/owners/${ownerId}/kyc`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status: 'rejected', reason: rejectionReason })
  });
  const rejectData = await rejectRes.json();

  if (rejectRes.status === 200 && rejectData.success && rejectData.profile?.kyc_status === 'rejected') {
    console.log(`✅ [PASS] Reject KYC succeeded: status = ${rejectData.profile.kyc_status}, reason = "${rejectData.profile.rejection_reason}"`);
  } else {
    console.error('❌ [FAIL] Reject KYC failed:', rejectData);
    process.exit(1);
  }

  // Database verification after rejection
  const dbProfileRejected = db.getOwnerProfile(ownerId);
  if (dbProfileRejected?.kyc_status === 'rejected' && dbProfileRejected?.rejection_reason === rejectionReason) {
    console.log('✅ [PASS] Database record matches: kyc_status = rejected, rejection_reason stored accurately');
  } else {
    console.error('❌ [FAIL] Database state mismatch after rejection:', dbProfileRejected);
    process.exit(1);
  }

  // Reset back to verified for normal operations
  await fetch(`${BASE_API}/owners/${ownerId}/kyc`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status: 'verified' })
  });
  console.log(`✅ Reset owner ${ownerId} KYC to verified for active operations.`);

  console.log('\n================================================================');
  console.log('ALL OWNER KYC VERIFICATION TESTS PASSED (100%)');
  console.log('================================================================\n');
}

runKycQA();
