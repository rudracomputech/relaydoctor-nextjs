import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User, { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'RS5yLeg6sbhW17foiW7pWz6HxNl6XGO34na7mJh6USa';

export interface AuthResult {
  user: IUser | null;
  errorResponse?: NextResponse;
}

export async function authenticateRequest(
  req: Request,
  allowedRoles: string[] = []
): Promise<AuthResult> {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          {
            success: false,
            message: 'Authorization token missing or invalid format',
          },
          { status: 401 }
        ),
      };
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return {
          user: null,
          errorResponse: NextResponse.json(
            { success: false, message: 'Token has expired' },
            { status: 401 }
          ),
        };
      }
      return {
        user: null,
        errorResponse: NextResponse.json(
          { success: false, message: 'Invalid token' },
          { status: 401 }
        ),
      };
    }

    const userId = decoded?.userId || decoded?.id;
    if (!userId) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          { success: false, message: 'Invalid token payload' },
          { status: 401 }
        ),
      };
    }

    await connectToDatabase();
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          { success: false, message: 'User not found or token invalid' },
          { status: 401 }
        ),
      };
    }

    if (user.isBlocked) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          { success: false, message: 'Account has been disabled' },
          { status: 403 }
        ),
      };
    }

    if (allowedRoles.length > 0) {
      const userRole = user.userRole || user.role;
      if (!allowedRoles.includes(userRole)) {
        return {
          user: null,
          errorResponse: NextResponse.json(
            {
              success: false,
              message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
            },
            { status: 403 }
          ),
        };
      }
    }

    return { user, errorResponse: undefined };
  } catch (error: any) {
    console.error('authenticateRequest Error:', error);
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: error?.message || 'Authentication error' },
        { status: 500 }
      ),
    };
  }
}

export function jsonSuccess(data: any = null, message = 'Success', status = 200, extra: Record<string, any> = {}) {
  const body: Record<string, any> = { success: true, message };
  if (data !== null) body.data = data;
  Object.assign(body, extra);
  return NextResponse.json(body, { status });
}

export function jsonError(message = 'An error occurred', status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}
