import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import BankAccount from '@/models/BankAccount';

export async function PUT(req: Request, context: any) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;
    const userId = user!._id;

    const bank = await BankAccount.findOne({
      _id: id,
      $or: [{ user: userId }, { doctorId: userId }],
    });

    if (!bank) {
      return jsonError('Bank account not found.', 404);
    }

    const updates = await req.json();
    Object.assign(bank, updates);
    await bank.save();

    return jsonSuccess(bank, 'Bank account updated successfully.', 200, { data: bank });
  } catch (error: any) {
    console.error('Update Bank Account Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;
    const userId = user!._id;

    const bank = await BankAccount.findOne({
      _id: id,
      $or: [{ user: userId }, { doctorId: userId }],
    });

    if (!bank) {
      return jsonError('Bank account not found.', 404);
    }

    // Soft delete
    bank.isActive = false;
    await bank.save();

    return jsonSuccess(null, 'Bank account deleted successfully.', 200);
  } catch (error: any) {
    console.error('Delete Bank Account Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
