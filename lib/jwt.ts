import jwt from 'jsonwebtoken';
import { connectToDatabase } from './mongodb';
import User, { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'RS5yLeg6sbhW17foiW7pWz6HxNl6XGO34na7mJh6USa';

export function generateToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
  });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getAuthenticatedDoctor(req: Request): Promise<IUser | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For convenience during mobile development, allow checking X-Doctor-Id header or fallback to Dr. John Malik if none
      const explicitDoctorId = req.headers.get('x-doctor-id');
      await connectToDatabase();
      if (explicitDoctorId) {
        return await User.findById(explicitDoctorId);
      }
      return await User.findOne({ email: 'john.malik@relaydor.com' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = verifyToken(token);
    const userId = decoded?.userId || decoded?.id;
    if (!decoded || !userId) {
      return null;
    }

    await connectToDatabase();
    return await User.findById(userId);
  } catch (err) {
    console.error('getAuthenticatedDoctor error:', err);
    return null;
  }
}