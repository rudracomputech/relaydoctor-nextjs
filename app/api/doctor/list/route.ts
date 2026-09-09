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
    const city = url.searchParams.get('city');
    const gender = url.searchParams.get('gender');
    const availability = url.searchParams.get('availability') || url.searchParams.get('availabilityStatus');
    const minExperience = url.searchParams.get('minExperience');
    const maxExperience = url.searchParams.get('maxExperience');
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

    if (gender) {
      const genders = gender.split(',').map((g) => g.trim().toLowerCase());
      andConditions.push({
        gender: { $in: genders.map((g) => new RegExp(`^${g}$`, 'i')) },
      });
    }

    if (availability) {
      const availabilities = availability.split(',').map((a) => a.trim());
      andConditions.push({
        availabilityStatus: {
          $in: availabilities.map((a) => new RegExp(a, 'i')),
        },
      });
    }

    if (minExperience !== null && minExperience !== undefined && minExperience !== '') {
      andConditions.push({
        experienceYears: { $gte: parseInt(minExperience, 10) },
      });
    }

    if (maxExperience !== null && maxExperience !== undefined && maxExperience !== '') {
      andConditions.push({
        experienceYears: { $lte: parseInt(maxExperience, 10) },
      });
    }

    if (city) {
      andConditions.push({
        $or: [
          { city: { $regex: city, $options: 'i' } },
          { location: { $regex: city, $options: 'i' } },
          { clinicAddress: { $regex: city, $options: 'i' } },
          { hospitalAddress: { $regex: city, $options: 'i' } },
        ],
      });
    }

    if (location) {
      andConditions.push({
        $or: [
          { city: { $regex: location, $options: 'i' } },
          { location: { $regex: location, $options: 'i' } },
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
      filter.availabilityStatus = { $regex: 'Available', $options: 'i' };
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
        'name email speciality specialization clinicAddress hospitalAddress hospital city location coordinates availabilityStatus verified isVerified profileImage avatar rating experienceYears reviewCount consultationFee gender education workSchedule age dateOfBirth'
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
