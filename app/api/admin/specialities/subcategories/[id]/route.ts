import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import SpecialityCategory from '@/models/SpecialityCategory';
import SpecialitySubcategory from '@/models/SpecialitySubcategory';

export async function GET(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    await connectToDatabase();
    const subcategory = await SpecialitySubcategory.findById(id)
      .populate('categoryId', 'name slug')
      .lean();

    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...subcategory,
        _id: (subcategory as any)._id.toString(),
        category: (subcategory as any).categoryId,
        categoryId: (subcategory as any).categoryId?._id?.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;
    const body = await req.json();

    await connectToDatabase();
    const subcategory = await SpecialitySubcategory.findById(id);
    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    const targetCategoryId = body.categoryId || subcategory.categoryId;

    if (body.name && body.name.trim()) {
      const cleanName = body.name.trim();
      const slug = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const existing = await SpecialitySubcategory.findOne({
        _id: { $ne: id },
        categoryId: targetCategoryId,
        $or: [{ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } }, { slug }],
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Another subcategory with this name already exists in this category' },
          { status: 409 }
        );
      }

      subcategory.name = cleanName;
      subcategory.slug = slug;
    }

    if (body.categoryId) {
      const parent = await SpecialityCategory.findById(body.categoryId);
      if (!parent) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
      }
      subcategory.categoryId = body.categoryId;
    }

    if (body.description !== undefined) subcategory.description = body.description;
    if (body.icon !== undefined) subcategory.icon = body.icon;
    if (body.displayOrder !== undefined) subcategory.displayOrder = Number(body.displayOrder);
    if (body.isActive !== undefined) subcategory.isActive = Boolean(body.isActive);

    await subcategory.save();

    const populated = await SpecialitySubcategory.findById(subcategory._id)
      .populate('categoryId', 'name slug')
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        ...populated,
        _id: (populated as any)._id.toString(),
        category: (populated as any).categoryId,
        categoryId: (populated as any).categoryId?._id?.toString(),
      },
    });
  } catch (error: any) {
    console.error('Admin PUT Speciality Subcategory Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    await connectToDatabase();
    const deleted = await SpecialitySubcategory.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Subcategory deleted successfully',
    });
  } catch (error: any) {
    console.error('Admin DELETE Speciality Subcategory Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
