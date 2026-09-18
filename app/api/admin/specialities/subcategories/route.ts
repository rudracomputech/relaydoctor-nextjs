import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import SpecialityCategory from '@/models/SpecialityCategory';
import SpecialitySubcategory from '@/models/SpecialitySubcategory';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    await connectToDatabase();

    const query: any = {};
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const subcategories = await SpecialitySubcategory.find(query)
      .populate('categoryId', 'name slug')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const formatted = subcategories.map((sub: any) => ({
      ...sub,
      _id: sub._id.toString(),
      category: sub.categoryId,
      categoryId: sub.categoryId?._id ? sub.categoryId._id.toString() : sub.categoryId?.toString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Admin GET Speciality Subcategories Error:', error);
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
    const { name, categoryId, description, icon, displayOrder, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Subcategory name is required' }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: 'Parent category is required' }, { status: 400 });
    }

    await connectToDatabase();

    const parentCat = await SpecialityCategory.findById(categoryId);
    if (!parentCat) {
      return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
    }

    const cleanName = name.trim();
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await SpecialitySubcategory.findOne({
      categoryId,
      $or: [{ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } }, { slug }],
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A subcategory with this name already exists in this category' },
        { status: 409 }
      );
    }

    const subcategory = await SpecialitySubcategory.create({
      name: cleanName,
      slug,
      categoryId,
      description: description?.trim() || '',
      icon: icon?.trim() || 'Stethoscope',
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    const populated = await SpecialitySubcategory.findById(subcategory._id)
      .populate('categoryId', 'name slug')
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          ...populated,
          _id: (populated as any)._id.toString(),
          category: (populated as any).categoryId,
          categoryId: (populated as any).categoryId?._id?.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Admin POST Speciality Subcategory Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
