import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BankAccount from '@/models/BankAccount';
import { getAuthenticatedDoctor } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await BankAccount.find({ doctorId: doctor._id }).sort({ isDefault: -1, createdAt: -1 });

    return NextResponse.json({ success: true, data: accounts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bankName, accountNumber, accountHolderName, ifscOrRouting, isDefault } = body;

    if (!bankName || !accountNumber || !accountHolderName) {
      return NextResponse.json(
        { error: 'Bank name, account number, and holder name are required' },
        { status: 400 }
      );
    }

    if (isDefault) {
      await BankAccount.updateMany({ doctorId: doctor._id }, { isDefault: false });
    }

    const bankAccount = await BankAccount.create({
      doctorId: doctor._id,
      bankName,
      accountNumber,
      accountHolderName,
      ifscOrRouting: ifscOrRouting || '',
      isDefault: !!isDefault,
    });

    return NextResponse.json({ success: true, data: bankAccount }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
