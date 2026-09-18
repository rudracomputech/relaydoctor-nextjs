import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Setting from '@/models/Setting';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    let setting = await Setting.findOne().lean();

    if (!setting) {
      setting = await Setting.create({
        referralRewardType: 'percentage',
        referralPercentage: 10,
        referralFlatAmount: 500,
        minWithdrawalAmount: 500,
        autoApproveReferrals: false,
        platformCommissionPercentage: 5,
      });
      setting = (setting as any).toObject ? (setting as any).toObject() : setting;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...setting,
        _id: (setting as any)._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('Admin GET Settings Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      referralRewardType,
      referralPercentage,
      referralFlatAmount,
      minWithdrawalAmount,
      autoApproveReferrals,
      platformCommissionPercentage,
    } = body;

    await connectToDatabase();
    let setting = await Setting.findOne();

    if (!setting) {
      setting = new Setting();
    }

    if (referralRewardType && ['percentage', 'flat'].includes(referralRewardType)) {
      setting.referralRewardType = referralRewardType;
    }
    if (referralPercentage !== undefined) {
      setting.referralPercentage = Math.max(0, Math.min(100, Number(referralPercentage)));
    }
    if (referralFlatAmount !== undefined) {
      setting.referralFlatAmount = Math.max(0, Number(referralFlatAmount));
    }
    if (minWithdrawalAmount !== undefined) {
      setting.minWithdrawalAmount = Math.max(0, Number(minWithdrawalAmount));
    }
    if (autoApproveReferrals !== undefined) {
      setting.autoApproveReferrals = Boolean(autoApproveReferrals);
    }
    if (platformCommissionPercentage !== undefined) {
      setting.platformCommissionPercentage = Math.max(0, Math.min(100, Number(platformCommissionPercentage)));
    }

    await setting.save();

    return NextResponse.json({
      success: true,
      data: {
        ...(setting as any).toObject(),
        _id: setting._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('Admin PUT Settings Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
