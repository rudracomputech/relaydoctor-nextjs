import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';
import Referral from '@/models/Referral';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import DoctorSubscription from '@/models/DoctorSubscription';
import Coupon from '@/models/Coupon';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import BankAccount from '@/models/BankAccount';
import WithdrawalRequest from '@/models/WithdrawalRequest';
import Conversation from '@/models/Conversation';
import Notification from '@/models/Notification';

export async function POST() {
  try {
    await connectToDatabase();

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const doctorPassword = await bcrypt.hash('doctor123', 10);

    // 1. Create or Update Admin
    let admin = await User.findOne({ email: 'admin@relaydoctor.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@relaydoctor.com',
        password: hashedPassword,
        role: 'admin' as const,
        phone: '+91 9999999999',
        isVerified: true,
      });
    }

    // 2. Create Doctors
    const doctorsData = [
      {
        email: 'john.malik@relaydoctor.com',
        name: 'Dr. John Malik',
        password: doctorPassword,
        role: 'doctor' as const,
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
      },
      {
        email: 'arun.mehta@relaydoctor.com',
        name: 'Dr. Arun Mehta',
        password: doctorPassword,
        role: 'doctor' as const,
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
      },
      {
        email: 'murari.singh@relaydoctor.com',
        name: 'Dr. Murari Singh',
        password: doctorPassword,
        role: 'doctor' as const,
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
      },
      {
        email: 'sunita.rao@relaydoctor.com',
        name: 'Dr. Sunita Rao',
        password: doctorPassword,
        role: 'doctor' as const,
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
      },
    ];

    const seededDoctors: any[] = [];
    for (const doc of doctorsData) {
      let doctor = await User.findOne({ email: doc.email });
      if (!doctor) {
        doctor = await User.create(doc);
      } else {
        await User.updateOne({ email: doc.email }, doc);
        doctor = await User.findOne({ email: doc.email });
      }
      seededDoctors.push(doctor);
    }

    const [drJohn, drArun, drMurari, drSunita] = seededDoctors;

    // 3. Create Patients
    const patientsData = [
      {
        name: 'Sameer Khan',
        phone: '+91 9876543210',
        age: 46,
        gender: 'Male' as const,
        registeredBy: drJohn._id,
        medicalHistory: 'Hypertension (5 years), Type 2 Diabetes, suspected coronary artery disease',
      },
      {
        name: 'Ramesh Kumar',
        phone: '+91 9845612345',
        age: 52,
        gender: 'Male' as const,
        registeredBy: drJohn._id,
        medicalHistory: 'Severe bilateral osteoarthritis of the knees',
      },
      {
        name: 'Suresh Patel',
        phone: '+91 9823456789',
        age: 39,
        gender: 'Male' as const,
        registeredBy: drArun._id,
        medicalHistory: 'Syncope episodes, persistent occipital headaches',
      },
      {
        name: 'Anita Sharma',
        phone: '+91 9712345678',
        age: 34,
        gender: 'Female' as const,
        registeredBy: drMurari._id,
        medicalHistory: 'Chronic seasonal bronchitis and exercise-induced asthma',
      },
    ];

    const seededPatients: any[] = [];
    for (const p of patientsData) {
      let patient = await Patient.findOne({ phone: p.phone });
      if (!patient) {
        patient = await Patient.create(p);
      }
      seededPatients.push(patient);
    }

    // 4. Create Referrals
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
        status: 'pending' as const,
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
        status: 'in_progress' as const,
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
        status: 'completed' as const,
      },
    ];

    for (const ref of referralsData) {
      await Referral.findOneAndUpdate(
        { ticketNumber: ref.ticketNumber },
        { ...ref, statusHistory: [{ status: ref.status, changedAt: new Date(), note: 'Initial status' }] },
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

    const seededPlans: any[] = [];
    for (const plan of plansData) {
      const p = await SubscriptionPlan.findOneAndUpdate({ name: plan.name }, plan, {
        upsert: true,
        new: true,
      });
      seededPlans.push(p);
    }

    // Assign active subscription to Dr. John Malik
    await DoctorSubscription.findOneAndUpdate(
      { doctorId: drJohn._id },
      {
        doctorId: drJohn._id,
        planId: seededPlans[0]._id,
        billingCycle: 'annually',
        amount: 3600,
        discountApplied: 0,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        autoRenew: true,
      },
      { upsert: true }
    );

    // 6. Coupons
    const couponsData = [
      {
        code: 'PER5700',
        description: 'Special ₹70 off on all plans',
        discountType: 'flat' as const,
        discountValue: 70,
        minOrderAmount: 100,
        validUntil: new Date('2027-12-31'),
        isActive: true,
      },
      {
        code: 'PER3770',
        description: 'Flat ₹50 instant discount voucher',
        discountType: 'flat' as const,
        discountValue: 50,
        minOrderAmount: 100,
        validUntil: new Date('2027-12-31'),
        isActive: true,
      },
      {
        code: 'DOCTOR20',
        description: '20% off for verified medical professionals',
        discountType: 'percentage' as const,
        discountValue: 20,
        minOrderAmount: 500,
        validUntil: new Date('2027-12-31'),
        isActive: true,
      },
    ];

    for (const c of couponsData) {
      await Coupon.findOneAndUpdate({ code: c.code }, c, { upsert: true });
    }

    // 7. Bank Accounts for Dr. John Malik
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
      await BankAccount.findOneAndUpdate(
        { doctorId: b.doctorId, accountNumber: b.accountNumber },
        b,
        { upsert: true }
      );
    }

    // 8. Wallet & Transactions for Dr. John Malik
    await Wallet.findOneAndUpdate(
      { doctorId: drJohn._id },
      {
        doctorId: drJohn._id,
        balance: 3600,
        totalEarnings: 5800,
        totalWithdrawn: 2200,
      },
      { upsert: true }
    );

    const transactionsData = [
      {
        doctorId: drJohn._id,
        type: 'consultation_fee' as const,
        amount: 300,
        direction: 'credit' as const,
        title: 'Consultation fee charge',
        description: 'Follow-up patient consultation credit',
        status: 'completed' as const,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        doctorId: drJohn._id,
        type: 'referral_bonus' as const,
        amount: 500,
        direction: 'credit' as const,
        title: 'Referral bonus',
        description: 'Referral accepted bonus for patient #3209',
        status: 'completed' as const,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        doctorId: drJohn._id,
        type: 'withdrawal' as const,
        amount: 1000,
        direction: 'debit' as const,
        title: 'Bank Withdrawal',
        description: 'Transferred to HDFC Bank •••• 5837',
        status: 'completed' as const,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
    ];

    for (const t of transactionsData) {
      await Transaction.create(t);
    }

    // 9. Withdrawal Request
    await WithdrawalRequest.findOneAndUpdate(
      { doctorId: drJohn._id, amount: 1500 },
      {
        doctorId: drJohn._id,
        amount: 1500,
        bankName: 'HDFC Bank',
        accountNumber: '•••• 5837',
        accountHolderName: 'Dr. John Malik',
        status: 'pending',
      },
      { upsert: true }
    );

    // 10. Doctor-to-Doctor Chat (Dr. John Malik & Dr. Murari Singh)
    await Conversation.deleteMany({ participants: { $in: [drJohn._id] } });
    await Conversation.create({
      participants: [drJohn._id, drMurari._id],
      lastMessage: 'Good morning, did you see the CT scan?',
      lastMessageAt: new Date(),
      messages: [
        {
          senderId: drMurari._id,
          receiverId: drJohn._id,
          text: 'Look at the chest CT scan for the patient we discussed',
          attachmentUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop',
          attachmentType: 'image' as const,
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
    });

    // 11. Notifications for Dr. John Malik
    const notificationsData = [
      {
        doctorId: drJohn._id,
        title: 'New Referral Received',
        message: 'Dr. Jane Doe referred patient #3214 for cardiac consult.',
        type: 'referral_received' as const,
        actionData: { referralId: 'REF-3214' },
        isRead: false,
      },
      {
        doctorId: drJohn._id,
        title: 'Patient Arrived at Clinic',
        message: 'Patient Ramesh Kumar #3210 has checked in at reception.',
        type: 'patient_arrived' as const,
        actionData: { patientId: seededPatients[1]._id.toString() },
        isRead: false,
      },
      {
        doctorId: drJohn._id,
        title: 'Referral Accepted',
        message: 'Dr. Arun Mehta accepted your referral for patient Sameer Khan.',
        type: 'referral_accepted' as const,
        actionData: { referralId: 'REF-3214' },
        isRead: true,
      },
      {
        doctorId: drJohn._id,
        title: 'Wallet Credited',
        message: '₹500 referral bonus credited to your wallet.',
        type: 'payment_credited' as const,
        isRead: true,
      },
    ];

    for (const n of notificationsData) {
      await Notification.create(n);
    }

    return NextResponse.json({
      success: true,
      message: 'RelayDoctor database seeded successfully!',
      adminUser: { email: 'admin@relaydoctor.com', password: 'admin123' },
      doctorsCount: seededDoctors.length,
      patientsCount: seededPatients.length,
      referralsCount: referralsData.length,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
