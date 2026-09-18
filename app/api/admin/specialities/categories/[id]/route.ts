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
    const category = await SpecialityCategory.findById(id).lean();
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const subcategories = await SpecialitySubcategory.find({ categoryId: id }).lean();

    return NextResponse.json({
      success: true,
      data: {
        ...category,
        _id: category._id.toString(),
        subcategories: subcategories.map((s: any) => ({ ...s, _id: s._id.toString() })),
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
    const category = await SpecialityCategory.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (body.name && body.name.trim()) {
      const cleanName = body.name.trim();
      const slug = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const existing = await SpecialityCategory.findOne({
        _id: { $ne: id },
        $or: [{ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } }, { slug }],
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Another category with this name or slug already exists' },
          { status: 409 }
        );
      }

      category.name = cleanName;
      category.slug = slug;
    }

    if (body.description !== undefined) category.description = body.description;
    if (body.icon !== undefined) category.icon = body.icon;
    if (body.image !== undefined) category.image = body.image;
    if (body.displayOrder !== undefined) category.displayOrder = Number(body.displayOrder);
    if (body.isActive !== undefined) category.isActive = Boolean(body.isActive);

    await category.save();

    const count = await SpecialitySubcategory.countDocuments({ categoryId: id });

    return NextResponse.json({
      success: true,
      data: {
        ...(category as any).toObject(),
        _id: category._id.toString(),
        subcategoriesCount: count,
      },
    });
  } catch (error: any) {
    console.error('Admin PUT Speciality Category Error:', error);
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
    const category = await SpecialityCategory.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Delete associated subcategories as well
    await SpecialitySubcategory.deleteMany({ categoryId: id });
    await SpecialityCategory.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Category and all associated subcategories deleted successfully',
    });
  } catch (error: any) {
    console.error('Admin DELETE Speciality Category Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
