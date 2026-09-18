import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import SpecialityCategory from '@/models/SpecialityCategory';
import SpecialitySubcategory from '@/models/SpecialitySubcategory';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const categories = await SpecialityCategory.find().sort({ displayOrder: 1, name: 1 }).lean();

    // Fetch counts of subcategories per category
    const subcategoryCounts = await SpecialitySubcategory.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    subcategoryCounts.forEach((sc: any) => {
      countMap[sc._id.toString()] = sc.count;
    });

    const formatted = categories.map((cat: any) => ({
      ...cat,
      _id: cat._id.toString(),
      subcategoriesCount: countMap[cat._id.toString()] || 0,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Admin GET Speciality Categories Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, icon, image, displayOrder, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    await connectToDatabase();

    const cleanName = name.trim();
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await SpecialityCategory.findOne({
      $or: [{ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } }, { slug }],
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A speciality category with this name or slug already exists' },
        { status: 409 }
      );
    }

    const category = await SpecialityCategory.create({
      name: cleanName,
      slug,
      description: description?.trim() || '',
      icon: icon?.trim() || 'Stethoscope',
      image: image?.trim() || '',
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    const obj = (category as any).toObject ? (category as any).toObject() : category;

    return NextResponse.json(
      {
        success: true,
        data: {
          ...obj,
          _id: obj._id.toString(),
          subcategoriesCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Admin POST Speciality Category Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
