export const mobileOpenApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'RelayDoctor Mobile API',
    version: '1.0.0',
    description: `### Official Mobile API Reference for RelayDoctor
This API powers the RelayDoctor iOS & Android mobile applications. It enables verified doctors to collaborate, manage peer-to-peer patient referrals, track real-time wallet earnings & payouts, communicate via instant messaging, and manage premium subscriptions.

#### Authentication
Most endpoints require Bearer JWT authentication.
1. Authenticate via \`POST /api/mobile/auth/login\` with your credentials.
2. Obtain the \`token\` from the response.
3. Click the **Authorize** button on the top right and enter:
   \`Bearer YOUR_JWT_TOKEN\`
4. (Optional Development Mode): You may also pass the \`x-doctor-id\` header directly.`,
    contact: {
      name: 'RelayDoctor Engineering Support',
      email: 'api@relaydor.com',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Current Environment Host',
    },
  ],
  tags: [
    { name: 'Authentication', description: 'Doctor login, registration, and session info' },
    { name: 'User & Profile', description: 'Doctor account profile, address, and specialization management' },
    { name: 'Doctors Directory', description: 'Discover peer specialists, filter by specialty and city' },
    { name: 'Patients', description: 'Patient records registered by the doctor' },
    { name: 'Referrals & Cases', description: 'Submit, track, accept, and manage medical referrals' },
    { name: 'Wallet & Payouts', description: 'Doctor earnings, transaction audit log, bank accounts, and withdrawals' },
    { name: 'Subscriptions & Coupons', description: 'Membership plans, checkout, and coupon voucher redemption' },
    { name: 'Chat & Messaging', description: 'Direct clinical messaging and case discussions' },
    { name: 'Notifications', description: 'Real-time doctor push notification feeds' },
    { name: 'Media Upload', description: 'Prescription, scan, and avatar file uploads' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT token formatted as `Bearer <token>`',
      },
      DoctorIdHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'x-doctor-id',
        description: 'Development convenience header to simulate a logged in doctor by ID',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Invalid credentials or validation failed' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
        },
      },
      DoctorProfile: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66e138a0f9839c43b827e8a1' },
          name: { type: 'string', example: 'Dr. John Malik' },
          email: { type: 'string', example: 'john.malik@relaydor.com' },
          phone: { type: 'string', example: '+91 98765 43210' },
          specialization: { type: 'string', example: 'Cardiologist' },
          speciality: { type: 'string', example: 'Cardiology' },
          gender: { type: 'string', example: 'male' },
          city: { type: 'string', example: 'Mumbai' },
          hospital: { type: 'string', example: 'Apex Heart Institute' },
          hospitalAddress: { type: 'string', example: 'Bandra West, Mumbai' },
          clinicAddress: { type: 'string', example: 'Suite 402, Medical Enclave' },
          age: { type: 'number', example: 42 },
          experienceYears: { type: 'number', example: 14 },
          consultationFee: { type: 'number', example: 1000 },
          rating: { type: 'number', example: 4.9 },
          reviewCount: { type: 'number', example: 180 },
          avatar: { type: 'string', example: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d' },
          isVerified: { type: 'boolean', example: true },
          availabilityStatus: { type: 'string', example: 'Available For Call' },
          walletBalance: { type: 'number', example: 4500 },
          totalEarnings: { type: 'number', example: 28500 },
          pendingBalance: { type: 'number', example: 500 },
          totalWithdrawn: { type: 'number', example: 24000 },
        },
      },
      Patient: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66e139b1f9839c43b827e8a2' },
          name: { type: 'string', example: 'Aarav Sharma' },
          phone: { type: 'string', example: '+91 91234 56789' },
          age: { type: 'number', example: 38 },
          gender: { type: 'string', example: 'Male' },
          medicalHistory: { type: 'string', example: 'Hypertension, Type 2 Diabetes' },
          emergencyContact: { type: 'string', example: '+91 98111 22233' },
          registeredBy: { type: 'string', example: '66e138a0f9839c43b827e8a1' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Referral: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66e13ab2f9839c43b827e8a3' },
          ticketNumber: { type: 'string', example: 'REF-3289' },
          patientName: { type: 'string', example: 'Aarav Sharma' },
          contactNumber: { type: 'string', example: '+91 91234 56789' },
          diagnosis: { type: 'string', example: 'Suspected Angina Pectoris' },
          testName: { type: 'string', example: 'ECG, 2D Echo' },
          reasonForReferral: { type: 'string', example: 'Requires urgent angiographic evaluation' },
          feedbackNotes: { type: 'string', example: 'Patient on Aspirin 75mg daily' },
          status: {
            type: 'string',
            enum: ['pending', 'accepted', 'declined', 'in_progress', 'completed'],
            example: 'pending',
          },
          referringDoctorId: { $ref: '#/components/schemas/DoctorProfile' },
          receivingDoctorId: { $ref: '#/components/schemas/DoctorProfile' },
          attachments: {
            type: 'array',
            items: { type: 'string' },
            example: ['https://storage.relaydor.com/scans/ecg_01.pdf'],
          },
          referralTime: { type: 'string', format: 'date-time' },
        },
      },
      WalletSummary: {
        type: 'object',
        properties: {
          balance: { type: 'number', example: 4500 },
          totalEarnings: { type: 'number', example: 28500 },
          totalWithdrawn: { type: 'number', example: 24000 },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66e13bc3f9839c43b827e8a4' },
          doctorId: { type: 'string', example: '66e138a0f9839c43b827e8a1' },
          amount: { type: 'number', example: 500 },
          type: { type: 'string', example: 'referral_bonus' },
          direction: { type: 'string', enum: ['credit', 'debit'], example: 'credit' },
          title: { type: 'string', example: 'Referral bonus' },
          description: { type: 'string', example: 'Bonus for referral REF-3289 (Aarav Sharma)' },
          referenceId: { type: 'string', example: 'REF-3289' },
          status: { type: 'string', example: 'completed' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      BankAccount: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66e13cd4f9839c43b827e8a5' },
          accountHolderName: { type: 'string', example: 'Dr. John Malik' },
          bankName: { type: 'string', example: 'HDFC Bank' },
          accountNumber: { type: 'string', example: '50100234567890' },
          ifscCode: { type: 'string', example: 'HDFC0001234' },
          accountType: { type: 'string', example: 'Savings' },
          isPrimary: { type: 'boolean', example: true },
        },
      },
      SubscriptionPlan: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66e13de5f9839c43b827e8a6' },
          name: { type: 'string', example: 'Pro Specialist Annual' },
          price: { type: 'number', example: 4999 },
          priceMonthly: { type: 'number', example: 499 },
          durationDays: { type: 'number', example: 365 },
          features: {
            type: 'array',
            items: { type: 'string' },
            example: ['Unlimited Patient Referrals', 'Priority Specialist Listing', 'Instant Chat Consults'],
          },
          isActive: { type: 'boolean', example: true },
        },
      },
    },
  },
  security: [
    { BearerAuth: [] },
    { DoctorIdHeader: [] },
  ],
  paths: {
    '/api/mobile/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Doctor Login',
        description: 'Authenticates a registered doctor using email & password, returning a JWT token.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'john.malik@relaydor.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Successful login. Returns JWT token and doctor summary.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    jwt: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: { $ref: '#/components/schemas/DoctorProfile' },
                  },
                },
              },
            },
          },
          400: { description: 'Missing email or password' },
          401: { description: 'Invalid email or password credentials' },
        },
      },
    },
    '/api/mobile/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Doctor Registration',
        description: 'Registers a new doctor profile and initializes their wallet.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Dr. Sarah Jenkins' },
                  email: { type: 'string', example: 'sarah.jenkins@example.com' },
                  password: { type: 'string', example: 'securePass123' },
                  phone: { type: 'string', example: '+91 98765 11223' },
                  specialization: { type: 'string', example: 'Neurologist' },
                  city: { type: 'string', example: 'Delhi' },
                  hospital: { type: 'string', example: 'Apollo Indraprastha' },
                  consultationFee: { type: 'number', example: 1200 },
                  experienceYears: { type: 'number', example: 8 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Doctor registered successfully. Returns JWT and user profile.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/DoctorProfile' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
          409: { description: 'Email already registered' },
        },
      },
    },
    '/api/mobile/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get Current Authenticated Doctor Session',
        description: 'Returns profile details, wallet balances, and active subscription plan of the authenticated doctor.',
        responses: {
          200: {
            description: 'Authenticated doctor profile data.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/DoctorProfile' },
                    doctor: { $ref: '#/components/schemas/DoctorProfile' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized / Missing or invalid JWT' },
        },
      },
    },
    '/api/mobile/user/profile': {
      get: {
        tags: ['User & Profile'],
        summary: 'Get Doctor Full Profile',
        description: 'Retrieves complete profile details for the logged-in doctor including education & schedule.',
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/DoctorProfile' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['User & Profile'],
        summary: 'Update Doctor Profile',
        description: 'Updates doctor contact details, hospital address, consultation fee, bio, or real-time availability status.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  specialization: { type: 'string' },
                  hospital: { type: 'string' },
                  hospitalAddress: { type: 'string' },
                  clinicAddress: { type: 'string' },
                  bio: { type: 'string' },
                  consultationFee: { type: 'number' },
                  availabilityStatus: {
                    type: 'string',
                    enum: ['Available For Call', 'In OPD', 'In Surgery', 'Busy', 'In Vacation'],
                  },
                  avatar: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/DoctorProfile' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/mobile/doctors': {
      get: {
        tags: ['Doctors Directory'],
        summary: 'Search & List Specialists',
        description: 'Discovers verified specialist doctors across the network with search query, specialty filter, and pagination.',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search term (name, specialty, hospital)' },
          { name: 'specialization', in: 'query', schema: { type: 'string' }, description: 'Filter by specialty name (e.g. Cardiology)' },
          { name: 'hospital', in: 'query', schema: { type: 'string' }, description: 'Filter by affiliated hospital' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'excludeSelf', in: 'query', schema: { type: 'string' }, description: 'Exclude your doctor ID from list' },
        ],
        responses: {
          200: {
            description: 'List of matching doctors with filter chips.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DoctorProfile' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'number', example: 45 },
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 20 },
                        totalPages: { type: 'number', example: 3 },
                      },
                    },
                    filters: {
                      type: 'object',
                      properties: {
                        specialties: { type: 'array', items: { type: 'string' } },
                        hospitals: { type: 'array', items: { type: 'string' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/mobile/doctors/{id}': {
      get: {
        tags: ['Doctors Directory'],
        summary: 'Get Specialist Details',
        description: 'Retrieves public profile details, ratings, education, and OPD timings of a doctor by ID.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Doctor User ID' },
        ],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/DoctorProfile' },
                  },
                },
              },
            },
          },
          404: { description: 'Doctor not found' },
        },
      },
    },
    '/api/mobile/patients': {
      get: {
        tags: ['Patients'],
        summary: 'List Registered Patients',
        description: 'Retrieves all patients registered by or accessible to the authenticated doctor.',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search patient by name or phone' },
        ],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Patient' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Patients'],
        summary: 'Create New Patient',
        description: 'Adds a new patient to the doctor’s clinic roster.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'phone'],
                properties: {
                  name: { type: 'string', example: 'Aarav Sharma' },
                  phone: { type: 'string', example: '+91 91234 56789' },
                  age: { type: 'number', example: 38 },
                  gender: { type: 'string', enum: ['Male', 'Female', 'Other'], example: 'Male' },
                  medicalHistory: { type: 'string', example: 'Hypertension, Mild Gastritis' },
                  emergencyContact: { type: 'string', example: '+91 98111 22233' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Patient created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Patient' },
                  },
                },
              },
            },
          },
          400: { description: 'Missing required patient name or phone' },
        },
      },
    },
    '/api/mobile/patients/{id}': {
      get: {
        tags: ['Patients'],
        summary: 'Get Patient Details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Patient' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Patients'],
        summary: 'Update Patient Record',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  age: { type: 'number' },
                  gender: { type: 'string' },
                  medicalHistory: { type: 'string' },
                  emergencyContact: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Patient updated' } },
      },
      delete: {
        tags: ['Patients'],
        summary: 'Delete Patient Record',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Patient deleted' } },
      },
    },
    '/api/mobile/referrals': {
      get: {
        tags: ['Referrals & Cases'],
        summary: 'List Referrals (Incoming & Outgoing)',
        description: 'Returns clinical referrals filtered by status, direction (incoming/outgoing), and search term.',
        parameters: [
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['all', 'incoming', 'outgoing'], default: 'all' },
            description: 'Direction of referral relative to authenticated doctor',
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['all', 'pending', 'accepted', 'declined', 'in_progress', 'completed'],
              default: 'all',
            },
          },
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search patient name or ticket number' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Referral' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'number' },
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        totalPages: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Referrals & Cases'],
        summary: 'Send Referral Case to Specialist',
        description: 'Transfers a patient case to a receiving specialist doctor. Generates a unique REF ticket number and sends an instant push notification.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['receivingDoctorId', 'patientName', 'contactNumber', 'diagnosis', 'reasonForReferral'],
                properties: {
                  receivingDoctorId: { type: 'string', example: '66e138a0f9839c43b827e8a1' },
                  patientName: { type: 'string', example: 'Aarav Sharma' },
                  contactNumber: { type: 'string', example: '+91 91234 56789' },
                  diagnosis: { type: 'string', example: 'Angina Pectoris, Coronary Artery Disease' },
                  testName: { type: 'string', example: 'TMT, 2D Echo' },
                  reasonForReferral: { type: 'string', example: 'Urgent angiographic consult required' },
                  feedbackNotes: { type: 'string', example: 'ECG scans attached in cloud records' },
                  nextFollowUpDate: { type: 'string', format: 'date' },
                  attachments: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['https://storage.relaydor.com/scans/ecg_01.pdf'],
                  },
                  patientId: { type: 'string', description: 'Optional ID if already in roster' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Referral created and forwarded to specialist.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Referral sent successfully' },
                    data: { $ref: '#/components/schemas/Referral' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/mobile/referrals/{id}': {
      get: {
        tags: ['Referrals & Cases'],
        summary: 'Get Referral Case Details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Referral ID or Ticket Number (e.g. REF-3289)' }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Referral' },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Referrals & Cases'],
        summary: 'Update Referral Status (Accept/Decline/Complete)',
        description: 'Receiving doctor accepts or updates status. **Accepting a referral automatically triggers referral reward wallet credit to referring doctor based on platform percentage settings.**',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['pending', 'accepted', 'declined', 'in_progress', 'completed'],
                    example: 'accepted',
                  },
                  note: { type: 'string', example: 'Patient accepted for admission and Angiography' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Status updated and wallet bonus disbursed if accepted for the first time.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Referral status updated to accepted' },
                    data: { $ref: '#/components/schemas/Referral' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/mobile/wallet': {
      get: {
        tags: ['Wallet & Payouts'],
        summary: 'Get Wallet Summary & Recent Movements',
        description: 'Returns current available balance, lifetime earnings, total withdrawn, and latest 10 ledger entries.',
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    wallet: { $ref: '#/components/schemas/WalletSummary' },
                    recentTransactions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Transaction' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/mobile/wallet/transactions': {
      get: {
        tags: ['Wallet & Payouts'],
        summary: 'Full Transaction History Ledger',
        description: 'Paginated audit trail of all referral reward credits, consultation payouts, and withdrawal deductions.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    transactions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Transaction' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/mobile/wallet/bank-accounts': {
      get: {
        tags: ['Wallet & Payouts'],
        summary: 'Get Saved Bank Accounts',
        description: 'Returns linked doctor bank accounts for receiving payout disbursements.',
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/BankAccount' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Wallet & Payouts'],
        summary: 'Add / Link Bank Account',
        description: 'Registers a verified bank account with IFSC code and account number for payouts.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['accountHolderName', 'bankName', 'accountNumber', 'ifscCode'],
                properties: {
                  accountHolderName: { type: 'string', example: 'Dr. John Malik' },
                  bankName: { type: 'string', example: 'HDFC Bank' },
                  accountNumber: { type: 'string', example: '50100234567890' },
                  ifscCode: { type: 'string', example: 'HDFC0001234' },
                  accountType: { type: 'string', example: 'Savings' },
                  isPrimary: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Bank account linked.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/BankAccount' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/mobile/wallet/withdraw': {
      post: {
        tags: ['Wallet & Payouts'],
        summary: 'Request Payout / Withdrawal',
        description: 'Submits a withdrawal request from doctor’s available wallet balance to linked bank account.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'bankAccountId'],
                properties: {
                  amount: { type: 'number', example: 5000 },
                  bankAccountId: { type: 'string', example: '66e13cd4f9839c43b827e8a5' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Withdrawal request created and sent for administrative disbursement.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Withdrawal request submitted successfully' },
                    data: { type: 'object' },
                  },
                },
              },
            },
          },
          400: { description: 'Insufficient balance or below minimum threshold' },
        },
      },
    },
    '/api/mobile/subscriptions/plans': {
      get: {
        tags: ['Subscriptions & Coupons'],
        summary: 'List Available Subscription Plans',
        description: 'Returns available doctor membership tiers (pricing, monthly/annual rate, perks).',
        security: [],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/SubscriptionPlan' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/mobile/subscriptions/apply-coupon': {
      post: {
        tags: ['Subscriptions & Coupons'],
        summary: 'Apply & Validate Coupon Voucher',
        description: 'Validates promotional discount code against doctor account and order amount, returning calculated discount.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'amount'],
                properties: {
                  code: { type: 'string', example: 'RELAY50' },
                  amount: { type: 'number', example: 4999 },
                  doctorId: { type: 'string', example: '66e138a0f9839c43b827e8a1' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Coupon valid and applied.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    originalAmount: { type: 'number', example: 4999 },
                    discountAmount: { type: 'number', example: 500 },
                    finalAmount: { type: 'number', example: 4499 },
                  },
                },
              },
            },
          },
          400: { description: 'Expired or minimum spend not met' },
          403: { description: 'Coupon is restricted to specific doctors' },
          404: { description: 'Invalid coupon code' },
        },
      },
    },
    '/api/mobile/subscriptions/subscribe': {
      post: {
        tags: ['Subscriptions & Coupons'],
        summary: 'Purchase / Activate Subscription',
        description: 'Initiates or completes a subscription purchase with optional coupon code.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['planId'],
                properties: {
                  planId: { type: 'string', example: '66e13de5f9839c43b827e8a6' },
                  couponCode: { type: 'string', example: 'RELAY50' },
                  paymentMethod: { type: 'string', example: 'razorpay' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Subscription activated or payment order created' },
        },
      },
    },
    '/api/mobile/chat/conversations': {
      get: {
        tags: ['Chat & Messaging'],
        summary: 'List Doctor Conversations',
        description: 'Returns active chat threads between doctors with latest message and unread count.',
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Chat & Messaging'],
        summary: 'Start or Open Conversation',
        description: 'Finds or creates a chat conversation with a specialist colleague regarding a referral.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['receiverDoctorId'],
                properties: {
                  receiverDoctorId: { type: 'string', example: '66e138a0f9839c43b827e8a1' },
                  referralId: { type: 'string', example: '66e13ab2f9839c43b827e8a3' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Conversation ready' } },
      },
    },
    '/api/mobile/chat/{conversationId}/messages': {
      get: {
        tags: ['Chat & Messaging'],
        summary: 'Get Messages in Conversation',
        parameters: [{ name: 'conversationId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Message history' } },
      },
      post: {
        tags: ['Chat & Messaging'],
        summary: 'Send Direct Message',
        parameters: [{ name: 'conversationId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string', example: 'Doctor, the patient reports stability after initial dosage.' },
                  attachment: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Message delivered' } },
      },
    },
    '/api/mobile/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get Notifications Feed',
        description: 'Returns real-time referral acceptance alerts, messages, and wallet credits.',
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Notifications'],
        summary: 'Mark Notification(s) as Read',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'Omit to mark all read' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Marked as read' } },
      },
    },
    '/api/mobile/upload': {
      post: {
        tags: ['Media Upload'],
        summary: 'Upload Clinical Media & Scans',
        description: 'Uploads images, PDF reports, or scans and returns public CDN URL.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Uploaded successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    url: { type: 'string', example: 'https://storage.relaydor.com/uploads/scan_9021.jpg' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}
