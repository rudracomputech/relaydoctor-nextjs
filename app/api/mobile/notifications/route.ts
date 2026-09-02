import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getAuthenticatedDoctor } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await Notification.find({ doctorId: doctor._id }).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ doctorId: doctor._id, isRead: false });

    return NextResponse.json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, markAllRead, actionTaken } = body;

    if (markAllRead) {
      await Notification.updateMany({ doctorId: doctor._id }, { isRead: true });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId) {
      const updateData: any = { isRead: true };
      if (actionTaken) {
        updateData.actionTaken = actionTaken;
      }
      await Notification.findByIdAndUpdate(notificationId, updateData);
      return NextResponse.json({ success: true, message: 'Notification updated' });
    }

    return NextResponse.json({ error: 'Notification ID or markAllRead required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
