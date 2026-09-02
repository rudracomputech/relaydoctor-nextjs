import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError } from '@/lib/auth-middleware';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const url = new URL(req.url);
    const speciality = url.searchParams.get('speciality');
    const location = url.searchParams.get('location');
    const verified = url.searchParams.get('verified');
    const search = url.searchParams.get('search');
    const availableOnly = url.searchParams.get('availableOnly');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const order = url.searchParams.get('order') || 'desc';

    const filter: any = {
      $or: [{ role: 'doctor' }, { userRole: 'doctor' }],
    };

    const andConditions: any[] = [];

    if (speciality) {
      andConditions.push({
        $or: [
          { speciality: { $regex: speciality, $options: 'i' } },
          { specialization: { $regex: speciality, $options: 'i' } },
        ],
      });
    }

    if (location) {
      andConditions.push({
        $or: [
          { clinicAddress: { $regex: location, $options: 'i' } },
          { hospitalAddress: { $regex: location, $options: 'i' } },
          { hospital: { $regex: location, $options: 'i' } },
        ],
      });
    }

    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (verified === 'true') {
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: [{ verified: true }, { isVerified: true }] });
    }

    if (availableOnly === 'true') {
      filter.availabilityStatus = 'Available for Call or Online Consultation Only';
    }

    if (andConditions.length > 0) {
      filter.$and = (filter.$and || []).concat(andConditions);
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder;

    const doctors = await User.find(filter)
      .select(
        'name email speciality specialization clinicAddress hospitalAddress hospital availabilityStatus verified isVerified profileImage avatar rating experienceYears reviewCount consultationFee'
      )
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: doctors.length,
      doctors,
    });
  } catch (error: any) {
    console.error('Doctor List Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
