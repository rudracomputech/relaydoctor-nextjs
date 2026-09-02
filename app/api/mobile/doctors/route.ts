import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const query = searchParams.get('q') || searchParams.get('search') || '';
    const specialization = searchParams.get('specialization') || searchParams.get('specialty') || '';
    const hospital = searchParams.get('hospital') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const excludeSelf = searchParams.get('excludeSelf');

    const filter: any = { role: 'doctor', isVerified: true };

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { specialization: { $regex: query, $options: 'i' } },
        { hospital: { $regex: query, $options: 'i' } },
      ];
    }

    if (specialization && specialization !== 'All') {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }

    if (hospital && hospital !== 'All') {
      filter.hospital = { $regex: hospital, $options: 'i' };
    }

    if (excludeSelf) {
      filter._id = { $ne: excludeSelf };
    }

    const total = await User.countDocuments(filter);
    const doctors = await User.find(filter)
      .select('-password')
      .sort({ rating: -1, experienceYears: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Also return list of distinct specialties and hospitals for mobile filter chips
    const specialties = await User.distinct('specialization', { role: 'doctor' });
    const hospitals = await User.distinct('hospital', { role: 'doctor', hospital: { $ne: '' } });

    return NextResponse.json({
      success: true,
      data: doctors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        specialties: ['All', ...specialties.filter(Boolean)],
        hospitals: ['All', ...hospitals.filter(Boolean)],
      },
    });
  } catch (error: any) {
    console.error('Doctors API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
