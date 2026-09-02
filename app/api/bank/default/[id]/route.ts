import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import BankAccount from '@/models/BankAccount';

export async function PATCH(req: Request, context: any) {
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

    await BankAccount.updateMany(
      { $or: [{ user: userId }, { doctorId: userId }] },
      { $set: { isDefault: false } }
    );

    bank.isDefault = true;
    await bank.save();

    return jsonSuccess(bank, 'Default bank account updated.', 200, { data: bank });
  } catch (error: any) {
    console.error('Set Default Bank Account Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
