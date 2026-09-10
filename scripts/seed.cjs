const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function seed() {
  const uri = process.env.Database || process.env.MONGODB_URI;
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected!');

  const db = mongoose.connection.db;

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const doctorPassword = await bcrypt.hash('doctor123', 10);

  // 1. Admin
  await db.collection('users').updateOne(
    { email: 'admin@relaydor.com' },
    {
      $set: {
        name: 'System Admin',
        email: 'admin@relaydor.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+91 9999999999',
        isVerified: true,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );

  // 2. Doctors
  const doctorsData = [
    {
      email: 'john.malik@relaydor.com',
      name: 'Dr. John Malik',
      password: doctorPassword,
      role: 'doctor',
      specialization: 'Orthopedic Surgeon',
      hospital: 'Metro Bone & Joint Clinic',
      experienceYears: 14,
      rating: 4.9,
      reviewCount: 230,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
      phone: '+91 9811223344',
      consultationFee: 700,
      walletBalance: 3600,
      totalEarnings: 5800,
      isVerified: true,
    },
    {
      email: 'arun.mehta@relaydor.com',
      name: 'Dr. Arun Mehta',
      password: doctorPassword,
      role: 'doctor',
      specialization: 'Cardiologist',
      hospital: 'Apex Hospital, Delhi',
      experienceYears: 12,
      rating: 4.8,
      reviewCount: 180,
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
      phone: '+91 9822334455',
      consultationFee: 900,
      walletBalance: 4200,
      totalEarnings: 7900,
      isVerified: true,
    },
    {
      email: 'murari.singh@relaydor.com',
      name: 'Dr. Murari Singh',
      password: doctorPassword,
      role: 'doctor',
      specialization: 'Pulmonologist',
      hospital: 'Fortis Healthcare',
      experienceYears: 9,
      rating: 4.7,
      reviewCount: 95,
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face',
      phone: '+91 9833445566',
      consultationFee: 650,
      walletBalance: 2100,
      totalEarnings: 3900,
      isVerified: true,
    },
    {
      email: 'sunita.rao@relaydor.com',
      name: 'Dr. Sunita Rao',
      password: doctorPassword,
      role: 'doctor',
      specialization: 'Neurologist',
      hospital: 'Apollo Multispecialty',
      experienceYears: 15,
      rating: 4.9,
      reviewCount: 310,
      avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=300&h=300&fit=crop&crop=face',
      phone: '+91 9844556677',
      consultationFee: 1000,
      walletBalance: 5100,
      totalEarnings: 9200,
      isVerified: true,
    },
  ];

  const seededDoctors = [];
  for (const doc of doctorsData) {
    await db.collection('users').updateOne(
      { email: doc.email },
      { $set: { ...doc, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    const d = await db.collection('users').findOne({ email: doc.email });
    seededDoctors.push(d);
  }

  const [drJohn, drArun, drMurari, drSunita] = seededDoctors;

  // 3. Patients
  const patientsData = [
    {
      name: 'Sameer Khan',
      phone: '+91 9876543210',
      age: 46,
      gender: 'Male',
      registeredBy: drJohn._id,
      medicalHistory: 'Hypertension (5 years), Type 2 Diabetes, suspected coronary artery disease',
    },
    {
      name: 'Ramesh Kumar',
      phone: '+91 9845612345',
      age: 52,
      gender: 'Male',
      registeredBy: drJohn._id,
      medicalHistory: 'Severe bilateral osteoarthritis of the knees',
    },
    {
      name: 'Suresh Patel',
      phone: '+91 9823456789',
      age: 39,
      gender: 'Male',
      registeredBy: drArun._id,
      medicalHistory: 'Syncope episodes, persistent occipital headaches',
    },
    {
      name: 'Anita Sharma',
      phone: '+91 9712345678',
      age: 34,
      gender: 'Female',
      registeredBy: drMurari._id,
      medicalHistory: 'Chronic seasonal bronchitis and exercise-induced asthma',
    },
  ];

  const seededPatients = [];
  for (const p of patientsData) {
    await db.collection('patients').updateOne(
      { phone: p.phone },
      { $set: { ...p, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    const pat = await db.collection('patients').findOne({ phone: p.phone });
    seededPatients.push(pat);
  }

  // 4. Referrals
  const referralsData = [
    {
      ticketNumber: 'REF-3214',
      patientId: seededPatients[0]._id,
      patientName: 'Sameer Khan',
      contactNumber: '+91 9876543210',
      referringDoctorId: drJohn._id,
      receivingDoctorId: drArun._id,
      diagnosis: 'Severe chest pain, angina symptoms with exertion',
      testName: 'Troponin-T, ECG, 2D Echo',
      reasonForReferral: 'Patient requires urgent cardiologist evaluation and coronary angiography',
      feedbackNotes: 'Currently prescribed Metoprolol 25mg and Aspirin. Vital signs stable at present.',
      nextFollowUpDate: new Date('2024-03-04T11:00:00.000Z'),
      attachments: [
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop',
      ],
      status: 'pending',
    },
    {
      ticketNumber: 'REF-3210',
      patientId: seededPatients[1]._id,
      patientName: 'Ramesh Kumar',
      contactNumber: '+91 9845612345',
      referringDoctorId: drJohn._id,
      receivingDoctorId: drArun._id,
      diagnosis: 'Cardiovascular preoperative clearance for total knee arthroplasty',
      testName: 'ECG, Dobutamine Stress Echo',
      reasonForReferral: 'Need cardiac fitness sign-off prior to surgery scheduled next week',
      feedbackNotes: 'Patient mild hypertensive, controlled on Amlodipine.',
      nextFollowUpDate: new Date('2024-03-06T10:00:00.000Z'),
      status: 'in_progress',
    },
    {
      ticketNumber: 'REF-3209',
      patientId: seededPatients[2]._id,
      patientName: 'Suresh Patel',
      contactNumber: '+91 9823456789',
      referringDoctorId: drArun._id,
      receivingDoctorId: drSunita._id,
      diagnosis: 'Unexplained syncope with suspected vasovagal vs neurological etiology',
      testName: 'Brain MRI, EEG',
      reasonForReferral: 'Rule out temporal lobe seizure focus or intracranial lesion',
      feedbackNotes: 'Normal echocardiogram, holter monitor showed no arrhythmias.',
      nextFollowUpDate: new Date('2024-03-01T15:30:00.000Z'),
      status: 'completed',
    },
  ];

  for (const ref of referralsData) {
    await db.collection('referrals').updateOne(
      { ticketNumber: ref.ticketNumber },
      {
        $set: {
          ...ref,
          statusHistory: [{ status: ref.status, changedAt: new Date(), note: 'Initial status' }],
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
  }

  // 5. Subscription Plans
  const plansData = [
    {
      name: 'Basic Plan',
      badge: 'Value Provider',
      tagline: 'Better care with priority access',
      priceMonthly: 129,
      priceAnnually: 3600,
      annualSavingsText: 'Save ₹1,200/year (₹300/month)',
      features: [
        'Tele/Video Consultations (10/month)',
        'View Health Records & Insight',
        'Digital Prescription',
        '24x7 Support (Unlimited calls)',
      ],
      isPopular: true,
      isActive: true,
    },
    {
      name: 'Pro Plan',
      badge: 'Top Tier',
      tagline: 'Complete medical network and unlimited relay',
      priceMonthly: 299,
      priceAnnually: 6999,
      annualSavingsText: 'Save ₹2,500/year',
      features: [
        'Unlimited Tele/Video Consultations',
        'Full Patient EHR Records & AI Insights',
        'Priority Doctor-to-Doctor Relay Network',
        'Zero-Fee Instant Wallet Withdrawals',
        'Dedicated Medical Concierge 24x7',
      ],
      isPopular: false,
      isActive: true,
    },
  ];

  const seededPlans = [];
  for (const plan of plansData) {
    await db.collection('subscriptionplans').updateOne(
      { name: plan.name },
      { $set: { ...plan, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    const p = await db.collection('subscriptionplans').findOne({ name: plan.name });
    seededPlans.push(p);
  }

  // Doctor Subscription for Dr. John Malik
  await db.collection('doctorsubscriptions').updateOne(
    { doctorId: drJohn._id },
    {
      $set: {
        doctorId: drJohn._id,
        planId: seededPlans[0]._id,
        billingCycle: 'annually',
        amount: 3600,
        discountApplied: 0,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );

  // 6. Coupons
  const couponsData = [
    {
      code: 'PER5700',
      description: 'Special ₹70 off on all plans',
      discountType: 'flat',
      discountValue: 70,
      minOrderAmount: 100,
      validUntil: new Date('2027-12-31'),
      isActive: true,
    },
    {
      code: 'PER3770',
      description: 'Flat ₹50 instant discount voucher',
      discountType: 'flat',
      discountValue: 50,
      minOrderAmount: 100,
      validUntil: new Date('2027-12-31'),
      isActive: true,
    },
    {
      code: 'DOCTOR20',
      description: '20% off for verified medical professionals',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 500,
      validUntil: new Date('2027-12-31'),
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await db.collection('coupons').updateOne(
      { code: c.code },
      { $set: { ...c, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
  }

  // 7. Bank Accounts
  const bankAccountsData = [
    {
      doctorId: drJohn._id,
      bankName: 'Bank of America',
      accountNumber: '•••• 2457',
      accountHolderName: 'Dr. John Malik',
      ifscOrRouting: 'BOFAUS3N',
      isDefault: true,
    },
    {
      doctorId: drJohn._id,
      bankName: 'HDFC Bank',
      accountNumber: '•••• 5837',
      accountHolderName: 'Dr. John Malik',
      ifscOrRouting: 'HDFC0001234',
      isDefault: false,
    },
  ];

  for (const b of bankAccountsData) {
    await db.collection('bankaccounts').updateOne(
      { doctorId: b.doctorId, accountNumber: b.accountNumber },
      { $set: { ...b, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
  }

  // 8. Wallet
  await db.collection('wallets').updateOne(
    { doctorId: drJohn._id },
    {
      $set: {
        doctorId: drJohn._id,
        balance: 3600,
        totalEarnings: 5800,
        totalWithdrawn: 2200,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );

  // Transactions
  await db.collection('transactions').deleteMany({ doctorId: drJohn._id });
  const transactionsData = [
    {
      doctorId: drJohn._id,
      type: 'consultation_fee',
      amount: 300,
      direction: 'credit',
      title: 'Consultation fee charge',
      description: 'Follow-up patient consultation credit',
      status: 'completed',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      doctorId: drJohn._id,
      type: 'referral_bonus',
      amount: 500,
      direction: 'credit',
      title: 'Referral bonus',
      description: 'Referral accepted bonus for patient #3209',
      status: 'completed',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      doctorId: drJohn._id,
      type: 'withdrawal',
      amount: 1000,
      direction: 'debit',
      title: 'Bank Withdrawal',
      description: 'Transferred to HDFC Bank •••• 5837',
      status: 'completed',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
  ];
  await db.collection('transactions').insertMany(transactionsData);

  // 9. Withdrawal Request
  await db.collection('withdrawalrequests').updateOne(
    { doctorId: drJohn._id, amount: 1500 },
    {
      $set: {
        doctorId: drJohn._id,
        amount: 1500,
        bankName: 'HDFC Bank',
        accountNumber: '•••• 5837',
        accountHolderName: 'Dr. John Malik',
        status: 'pending',
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );

  // 10. Doctor Chat
  await db.collection('conversations').deleteMany({
    participants: { $in: [drJohn._id] }
  });
  await db.collection('conversations').insertOne({
    participants: [drJohn._id, drMurari._id],
    lastMessage: 'Good morning, did you see the CT scan?',
    lastMessageAt: new Date(),
    messages: [
      {
        senderId: drMurari._id,
        receiverId: drJohn._id,
        text: 'Look at the chest CT scan for the patient we discussed',
        attachmentUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop',
        attachmentType: 'image',
        isRead: true,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        senderId: drJohn._id,
        receiverId: drMurari._id,
        text: 'Can I do one more test?',
        isRead: true,
        createdAt: new Date(Date.now() - 25 * 60 * 1000),
      },
      {
        senderId: drJohn._id,
        receiverId: drMurari._id,
        text: 'No problem, let me know if you need our lab.',
        isRead: true,
        createdAt: new Date(Date.now() - 20 * 60 * 1000),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 11. Notifications
  await db.collection('notifications').deleteMany({ doctorId: drJohn._id });
  const notificationsData = [
    {
      doctorId: drJohn._id,
      title: 'New Referral Received',
      message: 'Dr. Jane Doe referred patient #3214 for cardiac consult.',
      type: 'referral_received',
      actionData: { referralId: 'REF-3214' },
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      doctorId: drJohn._id,
      title: 'Patient Arrived at Clinic',
      message: 'Patient Ramesh Kumar #3210 has checked in at reception.',
      type: 'patient_arrived',
      actionData: { patientId: seededPatients[1]._id.toString() },
      isRead: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      doctorId: drJohn._id,
      title: 'Referral Accepted',
      message: 'Dr. Arun Mehta accepted your referral for patient Sameer Khan.',
      type: 'referral_accepted',
      actionData: { referralId: 'REF-3214' },
      isRead: true,
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      doctorId: drJohn._id,
      title: 'Wallet Credited',
      message: '₹500 referral bonus credited to your wallet.',
      type: 'payment_credited',
      isRead: true,
      createdAt: new Date(Date.now() - 120 * 60 * 1000),
      updatedAt: new Date(),
    },
  ];
  await db.collection('notifications').insertMany(notificationsData);

  console.log('Database seeded successfully with all relaydor Figma design entities!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
