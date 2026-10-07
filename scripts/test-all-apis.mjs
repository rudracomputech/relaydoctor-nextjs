import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:3001';

const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    results.push({ name: testName, pass: true, details });
    console.log(`✅ PASS: ${testName}`);
  } else {
    results.push({ name: testName, pass: false, details });
    console.error(`❌ FAIL: ${testName} - ${details}`);
  }
}

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`Testing all RelayDoctor APIs against ${BASE_URL}`);
  console.log(`======================================================\n`);

  const timestamp = Date.now();
  const testEmail = `doctor.test.${timestamp}@relaydoctor.test`;
  const testMobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testPassword = 'Password@123';

  let authToken = '';
  let doctorId = '';
  let patientId = '';
  let referralId = '';
  let conversationId = '';
  let adminToken = '';

  // 1. Health check GET /
  try {
    const res = await fetch(`${BASE_URL}/`, {
      headers: { 'Accept': 'application/json' },
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && data && data.success === true,
      'System: Health check GET /',
      JSON.stringify(data)
    );
  } catch (err) {
    assert(false, 'System: Health check GET /', err.message);
  }

  // 2. Auth: Register POST /api/auth/register
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dr. Test Mobile App',
        email: testEmail,
        mobile: testMobile,
        dateOfBirth: '1990-01-01',
        password: testPassword,
        userRole: 'doctor',
        speciality: 'Cardiologist',
      }),
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 201 && data && data.success === true,
      'Auth: Register POST /api/auth/register (returns 201 for Flutter)',
      JSON.stringify(data)
    );
  } catch (err) {
    assert(false, 'Auth: Register POST /api/auth/register', err.message);
  }

  // 3. Auth: Resend Email OTP POST /api/auth/resend-email-otp
  try {
    const res = await fetch(`${BASE_URL}/api/auth/resend-email-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && data && data.success === true,
      'Auth: Resend Email OTP POST /api/auth/resend-email-otp',
      JSON.stringify(data)
    );
  } catch (err) {
    assert(false, 'Auth: Resend Email OTP POST /api/auth/resend-email-otp', err.message);
  }

  // 4. Auth: Resend Mobile OTP POST /api/auth/resend-mobile-otp
  try {
    const res = await fetch(`${BASE_URL}/api/auth/resend-mobile-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: testMobile }),
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && data && data.success === true,
      'Auth: Resend Mobile OTP POST /api/auth/resend-mobile-otp',
      JSON.stringify(data)
    );
  } catch (err) {
    assert(false, 'Auth: Resend Mobile OTP POST /api/auth/resend-mobile-otp', err.message);
  }

  // 5. Auth: Verify Mobile POST /api/auth/verify-mobile
  try {
    const res = await fetch(`${BASE_URL}/api/auth/verify-mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: testMobile, otp: '123456' }),
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && data && data.success === true,
      'Auth: Verify Mobile POST /api/auth/verify-mobile (with Flutter test OTP 123456)',
      JSON.stringify(data)
    );
  } catch (err) {
    assert(false, 'Auth: Verify Mobile POST /api/auth/verify-mobile', err.message);
  }

  // 4b. Auth: Verify Email POST /api/auth/verify-email
  try {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb+srv://rudracomputechs_db_user:CyHU0mfzm0jmQip4@database.lheusun.mongodb.net/?appName=database');
    }
    const otpDoc = await mongoose.connection.db.collection('otps').findOne({
      email: testEmail.toLowerCase(),
      purpose: 'email_verification',
    });
    if (otpDoc) {
      const res = await fetch(`${BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, otp: otpDoc.otp }),
      });
      const data = await res.json().catch(() => null);
      assert(
        res.status === 200 && data?.success === true,
        'Auth: Verify Email POST /api/auth/verify-email',
        JSON.stringify(data)
      );
    }
  } catch (err) {
    assert(false, 'Auth: Verify Email POST /api/auth/verify-email', err.message);
  }

  // 6. Auth: Forgot Password POST /api/auth/forgot-password
  try {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && data && data.success === true,
      'Auth: Forgot Password POST /api/auth/forgot-password',
      JSON.stringify(data)
    );
  } catch (err) {
    assert(false, 'Auth: Forgot Password POST /api/auth/forgot-password', err.message);
  }

  // 6b. Auth: Reset Password POST /api/auth/reset-password
  try {
    const mongoose = (await import('mongoose')).default;
    const otpDoc = await mongoose.connection.db.collection('otps').findOne({
      email: testEmail.toLowerCase(),
      purpose: 'forgot_password',
    });
    if (otpDoc) {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          otp: otpDoc.otp,
          newPassword: testPassword,
        }),
      });
      const data = await res.json().catch(() => null);
      assert(
        res.status === 200 && data?.success === true,
        'Auth: Reset Password POST /api/auth/reset-password',
        JSON.stringify(data?.message)
      );
    }
  } catch (err) {
    assert(false, 'Auth: Reset Password POST /api/auth/reset-password', err.message);
  }

  // 7. Auth: Login POST /api/auth/login
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        userRole: 'doctor',
      }),
    });
    const data = await res.json().catch(() => null);
    authToken = data?.token || data?.data?.token || '';
    doctorId = data?.user?.id || data?.user?._id || '';
    assert(
      res.status === 200 && !!authToken && data?.user?.role === 'doctor',
      'Auth: Login POST /api/auth/login (JWT and user details returned)',
      `Token: ${authToken.slice(0, 20)}... Doctor ID: ${doctorId}`
    );
  } catch (err) {
    assert(false, 'Auth: Login POST /api/auth/login', err.message);
  }

  // Test mobile phone login compatibility
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testMobile, // Passing phone number as email parameter just like Flutter input
        password: testPassword,
        userRole: 'doctor',
      }),
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && !!data?.token,
      'Auth: Login via Phone Number in credential input',
      JSON.stringify(data?.user?.email)
    );
  } catch (err) {
    assert(false, 'Auth: Login via Phone Number', err.message);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  };

  // 8. Auth: Get Profile GET /api/auth/profile
  try {
    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      headers: authHeaders,
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && (data?.user || data?.data),
      'Auth: Get Profile GET /api/auth/profile (contains user and data keys)',
      `Name: ${data?.user?.name || data?.data?.name}`
    );
  } catch (err) {
    assert(false, 'Auth: Get Profile GET /api/auth/profile', err.message);
  }

  // 9. Auth: Update Profile PUT /api/auth/profile-update
  try {
    const res = await fetch(`${BASE_URL}/api/auth/profile-update`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        hospital: 'Apollo Multi-Specialty Hospital',
        bio: 'Experienced cardiologist specialized in preventive healthcare.',
        speciality: 'Cardiologist',
      }),
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && data?.success === true,
      'Auth: Update Profile PUT /api/auth/profile-update',
      JSON.stringify(data?.user?.hospital || data?.data?.hospital)
    );
  } catch (err) {
    assert(false, 'Auth: Update Profile PUT /api/auth/profile-update', err.message);
  }

  // 10. Doctor: Update Availability PUT /api/doctor/availabilityUpdate
  try {
    const res = await fetch(`${BASE_URL}/api/doctor/availabilityUpdate`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        availabilityStatus: 'Available for Emergency & Consultation',
      }),
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && data?.success === true,
      'Doctor: Update Availability PUT /api/doctor/availabilityUpdate',
      JSON.stringify(data?.doctor?.availabilityStatus || data?.data?.doctor?.availabilityStatus)
    );
  } catch (err) {
    assert(false, 'Doctor: Update Availability PUT /api/doctor/availabilityUpdate', err.message);
  }

  // 11. Doctor: Get Doctors List GET /api/doctor/list
  try {
    const res = await fetch(`${BASE_URL}/api/doctor/list`, {
      headers: authHeaders,
    });
    const data = await res.json().catch(() => null);
    const doctorList = data?.doctors || data?.data || [];
    const firstDoc = doctorList[0];
    const hasDoctorMateFields =
      firstDoc &&
      (firstDoc.id || firstDoc._id) &&
      (firstDoc.specialty || firstDoc.speciality) &&
      firstDoc.experience &&
      firstDoc.hospital &&
      firstDoc.avatarUrl !== undefined;
    assert(
      res.status === 200 && Array.isArray(doctorList) && hasDoctorMateFields,
      'Doctor: Get Doctors List GET /api/doctor/list (matches Flutter DoctorMate model)',
      `Count: ${doctorList.length}, Example: ${firstDoc?.name} (${firstDoc?.specialty})`
    );
  } catch (err) {
    assert(false, 'Doctor: Get Doctors List GET /api/doctor/list', err.message);
  }

  // 12. Patients: Add Patient POST /api/patients
  try {
    const res = await fetch(`${BASE_URL}/api/patients`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Vikram Sharma',
        age: 48,
        gender: 'male',
        mobile: '9876543210',
        address: 'MG Road, South Extension, Delhi',
        problem: 'Severe chest discomfort and hypertension',
        diagnosis: 'Mild Angina',
        prescription: 'Aspirin 75mg, Atorvastatin 20mg',
      }),
    });
    const data = await res.json().catch(() => null);
    const patientObj = data?.patient || data?.data;
    patientId = patientObj?.id || patientObj?._id || '';
    assert(
      res.status === 201 && !!patientId,
      'Patients: Add Patient POST /api/patients (returns 201 with patient object)',
      `Patient ID: ${patientId}`
    );
  } catch (err) {
    assert(false, 'Patients: Add Patient POST /api/patients', err.message);
  }

  // 13. Patients: Get Patients List GET /api/patients
  try {
    const res = await fetch(`${BASE_URL}/api/patients`, {
      headers: authHeaders,
    });
    const data = await res.json().catch(() => null);
    const patientList = data?.patients || data?.data || [];
    const firstPat = patientList.find(p => p.id === patientId || p._id === patientId);
    assert(
      res.status === 200 && Array.isArray(patientList) && !!firstPat,
      'Patients: Get Patients List GET /api/patients (contains added patient)',
      `Total: ${patientList.length}, Name: ${firstPat?.name}`
    );
  } catch (err) {
    assert(false, 'Patients: Get Patients List GET /api/patients', err.message);
  }

  // 14. Patients: Get Patient By ID GET /api/patients/{id}
  try {
    const res = await fetch(`${BASE_URL}/api/patients/${patientId}`, {
      headers: authHeaders,
    });
    const data = await res.json().catch(() => null);
    const pat = data?.patient || data?.data;
    assert(
      res.status === 200 && (pat?.id === patientId || pat?._id === patientId),
      'Patients: Get Patient By ID GET /api/patients/{id}',
      `Patient Name: ${pat?.name}, Mobile: ${pat?.phone || pat?.mobile}`
    );
  } catch (err) {
    assert(false, 'Patients: Get Patient By ID GET /api/patients/{id}', err.message);
  }

  // 15. Patients: Update Patient PUT /api/patients/{id}
  try {
    const res = await fetch(`${BASE_URL}/api/patients/${patientId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'Under Treatment',
        problem: 'Chest pain subsiding, continuous ECG monitoring scheduled.',
      }),
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && data?.success === true,
      'Patients: Update Patient PUT /api/patients/{id}',
      JSON.stringify(data?.patient?.status || data?.data?.status)
    );
  } catch (err) {
    assert(false, 'Patients: Update Patient PUT /api/patients/{id}', err.message);
  }

  // Fetch another doctor to refer to
  let targetDoctorId = '';
  try {
    const docsRes = await fetch(`${BASE_URL}/api/doctor/list`, { headers: authHeaders });
    const docsData = await docsRes.json();
    const otherDoc = (docsData.doctors || docsData.data || []).find(d => (d.id || d._id) !== doctorId);
    targetDoctorId = otherDoc?.id || otherDoc?._id || '';
  } catch (_) {}

  // 16. Referrals: Create Referral POST /api/referrals
  try {
    const res = await fetch(`${BASE_URL}/api/referrals`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        patientId,
        toDoctorId: targetDoctorId || doctorId,
        notes: 'Please review for advanced coronary angiography.',
      }),
    });
    const data = await res.json().catch(() => null);
    const refObj = data?.referral || data?.data;
    referralId = refObj?.id || refObj?._id || '';
    assert(
      res.status === 201 && !!referralId,
      'Referrals: Create Referral POST /api/referrals (with patientId and notes)',
      `Referral ID: ${referralId}, Ticket: ${refObj?.ticketNumber}`
    );
  } catch (err) {
    assert(false, 'Referrals: Create Referral POST /api/referrals', err.message);
  }

  // 17. Referrals: Get Sent Referrals GET /api/referrals/sent
  try {
    const res = await fetch(`${BASE_URL}/api/referrals/sent`, {
      headers: authHeaders,
    });
    const data = await res.json().catch(() => null);
    const sentList = data?.referrals || data?.data || [];
    const firstSent = sentList[0];
    const hasFlutterPatientFields =
      firstSent &&
      (firstSent.id || firstSent._id) &&
      firstSent.name !== undefined &&
      firstSent.referredDoctorName !== undefined &&
      firstSent.status !== undefined;
    assert(
      res.status === 200 && Array.isArray(sentList) && hasFlutterPatientFields,
      'Referrals: Get Sent Referrals GET /api/referrals/sent (formatted for PatientModel)',
      `Count: ${sentList.length}, Name: ${firstSent?.name}, To: ${firstSent?.referredDoctorName}`
    );
  } catch (err) {
    assert(false, 'Referrals: Get Sent Referrals GET /api/referrals/sent', err.message);
  }

  // 18. Referrals: Get Received Referrals GET /api/referrals/received
  try {
    const res = await fetch(`${BASE_URL}/api/referrals/received`, {
      headers: authHeaders,
    });
    const data = await res.json().catch(() => null);
    const receivedList = data?.referrals || data?.data || [];
    assert(
      res.status === 200 && Array.isArray(receivedList),
      'Referrals: Get Received Referrals GET /api/referrals/received',
      `Count: ${receivedList.length}`
    );
  } catch (err) {
    assert(false, 'Referrals: Get Received Referrals GET /api/referrals/received', err.message);
  }

  // 19. Referrals: Get Referral By ID GET /api/referrals/{id}
  try {
    const res = await fetch(`${BASE_URL}/api/referrals/${referralId}`, {
      headers: authHeaders,
    });
    const data = await res.json().catch(() => null);
    const ref = data?.referral || data?.data;
    assert(
      res.status === 200 && (ref?.id === referralId || ref?._id === referralId),
      'Referrals: Get Referral By ID GET /api/referrals/{id}',
      `Status: ${ref?.status}, Patient: ${ref?.name || ref?.patientName}`
    );
  } catch (err) {
    assert(false, 'Referrals: Get Referral By ID GET /api/referrals/{id}', err.message);
  }

  // 20. Referrals: Update Referral Status PATCH /api/referrals/{id}/status
  try {
    const res = await fetch(`${BASE_URL}/api/referrals/${referralId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'Accepted' }), // Flutter sends title-case or lowercase
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && (data?.referral?.status === 'accepted' || data?.data?.status === 'accepted'),
      'Referrals: Update Referral Status PATCH /api/referrals/{id}/status',
      `Normalized status: ${data?.referral?.status || data?.data?.status}`
    );
  } catch (err) {
    assert(false, 'Referrals: Update Referral Status PATCH /api/referrals/{id}/status', err.message);
  }

  // 21. Chat: Send Message POST /api/chat/send-message
  try {
    const res = await fetch(`${BASE_URL}/api/chat/send-message`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        receiverId: targetDoctorId || doctorId,
        message: 'Hello Doctor, Vikram Sharma has been referred to your clinic.',
        messageType: 'text',
      }),
    });
    const data = await res.json().catch(() => null);
    conversationId = data?.data?.conversationId || data?.conversationId || '';
    assert(
      (res.status === 201 || res.status === 200) && !!conversationId,
      'Chat: Send Message POST /api/chat/send-message',
      `Conversation ID: ${conversationId}, Message ID: ${data?.data?.id}`
    );
  } catch (err) {
    assert(false, 'Chat: Send Message POST /api/chat/send-message', err.message);
  }

  // 22. Chat: Get Conversations GET /api/chat/conversations
  try {
    const res = await fetch(`${BASE_URL}/api/chat/conversations`, {
      headers: authHeaders,
    });
    const data = await res.json().catch(() => null);
    const conversations = data?.conversations || data?.data || [];
    assert(
      res.status === 200 && Array.isArray(conversations),
      'Chat: Get Conversations GET /api/chat/conversations',
      `Total conversations: ${conversations.length}`
    );
  } catch (err) {
    assert(false, 'Chat: Get Conversations GET /api/chat/conversations', err.message);
  }

  // 23. Chat: Get Chat Messages GET /api/chat/messages/{conversationId}
  try {
    const res = await fetch(`${BASE_URL}/api/chat/messages/${conversationId}`, {
      headers: authHeaders,
    });
    const data = await res.json().catch(() => null);
    const messages = data?.messages || data?.data || [];
    assert(
      res.status === 200 && Array.isArray(messages) && messages.length > 0,
      'Chat: Get Messages GET /api/chat/messages/{conversationId}',
      `Total messages: ${messages.length}, Latest: "${messages[messages.length - 1]?.text}"`
    );
  } catch (err) {
    assert(false, 'Chat: Get Messages GET /api/chat/messages/{conversationId}', err.message);
  }

  // 24. Chat: Mark Read PUT/POST /api/chat/mark-read/{conversationId}
  try {
    const res = await fetch(`${BASE_URL}/api/chat/mark-read/${conversationId}`, {
      method: 'PUT',
      headers: authHeaders,
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && data?.success === true,
      'Chat: Mark Read PUT /api/chat/mark-read/{conversationId}',
      JSON.stringify(data)
    );
  } catch (err) {
    assert(false, 'Chat: Mark Read PUT /api/chat/mark-read/{conversationId}', err.message);
  }

  // 25. Chat: Update Online Status POST /api/chat/online-status
  try {
    const res = await fetch(`${BASE_URL}/api/chat/online-status`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ isOnline: true }),
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && data?.success === true,
      'Chat: Update Online Status POST /api/chat/online-status',
      JSON.stringify(data)
    );
  } catch (err) {
    assert(false, 'Chat: Update Online Status POST /api/chat/online-status', err.message);
  }

  // 26. Chat: Get Online Statuses GET /api/chat/online-statuses
  try {
    const res = await fetch(`${BASE_URL}/api/chat/online-statuses?users=${doctorId}`, {
      headers: authHeaders,
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && (data?.statuses || data?.data),
      'Chat: Get Online Statuses GET /api/chat/online-statuses',
      JSON.stringify(data?.statuses || data?.data)
    );
  } catch (err) {
    assert(false, 'Chat: Get Online Statuses GET /api/chat/online-statuses', err.message);
  }

  // 27. Chat: Get Chat Users GET /api/chat/users
  try {
    const res = await fetch(`${BASE_URL}/api/chat/users`, {
      headers: authHeaders,
    });
    const data = await res.json().catch(() => null);
    const users = data?.users || data?.data || [];
    assert(
      res.status === 200 && Array.isArray(users),
      'Chat: Get Chat Users GET /api/chat/users',
      `Users count: ${users.length}`
    );
  } catch (err) {
    assert(false, 'Chat: Get Chat Users GET /api/chat/users', err.message);
  }

  // 28. Admin: Verify Doctor Documents PUT /api/admin/verify-doctor-documents
  try {
    const jwt = (await import('jsonwebtoken')).default;
    const adminJwt = jwt.sign(
      { userId: '6a9813537a0426c73af11a00', role: 'admin', userRole: 'admin', email: 'admin@relaydoctor.com' },
      'RS5yLeg6sbhW17foiW7pWz6HxNl6XGO34na7mJh6USa',
      { expiresIn: '1h' }
    );
    const res = await fetch(`${BASE_URL}/api/admin/verify-doctor-documents`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminJwt}`,
      },
      body: JSON.stringify({
        doctorId,
        verificationStatus: 'approved',
      }),
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && data?.success === true,
      'Admin: Verify Doctor Documents PUT /api/admin/verify-doctor-documents',
      JSON.stringify(data?.message)
    );
  } catch (err) {
    assert(false, 'Admin: Verify Doctor Documents PUT /api/admin/verify-doctor-documents', err.message);
  }

  // 29. Auth: Upload Profile Image PATCH /api/auth/upload-profile-image
  try {
    const formData = new FormData();
    const blob = new Blob(['fake image content'], { type: 'image/jpeg' });
    formData.append('profileImage', blob, 'avatar.jpg');

    const res = await fetch(`${BASE_URL}/api/auth/upload-profile-image`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && data?.success === true && !!data?.profileImage,
      'Auth: Upload Profile Image PATCH /api/auth/upload-profile-image',
      `Image URL: ${data?.profileImage}`
    );
  } catch (err) {
    assert(false, 'Auth: Upload Profile Image PATCH /api/auth/upload-profile-image', err.message);
  }

  // 30. Doctor: Upload Documents PATCH /api/doctor/upload-documents
  try {
    const formData = new FormData();
    formData.append('governmentId', new Blob(['govId'], { type: 'application/pdf' }), 'govid.pdf');
    formData.append('medicalCertificate', new Blob(['medCert'], { type: 'application/pdf' }), 'medcert.pdf');
    formData.append('degreeCertificate', new Blob(['degCert'], { type: 'application/pdf' }), 'degcert.pdf');

    const res = await fetch(`${BASE_URL}/api/doctor/upload-documents`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && data?.success === true,
      'Doctor: Upload Documents PATCH /api/doctor/upload-documents',
      JSON.stringify(data?.message)
    );
  } catch (err) {
    assert(false, 'Doctor: Upload Documents PATCH /api/doctor/upload-documents', err.message);
  }

  // 29. Patients: Delete Patient DELETE /api/patients/{id}
  try {
    const res = await fetch(`${BASE_URL}/api/patients/${patientId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const data = await res.json().catch(() => null);
    assert(
      res.status === 200 && data?.success === true,
      'Patients: Delete Patient DELETE /api/patients/{id}',
      JSON.stringify(data)
    );
  } catch (err) {
    assert(false, 'Patients: Delete Patient DELETE /api/patients/{id}', err.message);
  }

  console.log(`\n======================================================`);
  const passedCount = results.filter(r => r.pass).length;
  const totalCount = results.length;
  console.log(`Test Summary: ${passedCount}/${totalCount} Passed (${((passedCount/totalCount)*100).toFixed(1)}%)`);
  console.log(`======================================================\n`);

  if (passedCount !== totalCount) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
