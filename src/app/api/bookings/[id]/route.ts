import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// DELETE - إلغاء حجز
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const bookingId = parseInt(params.id)

    // العثور على الحجز
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        cv: {
          select: {
            id: true,
            fullName: true,
            referenceCode: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'الحجز غير موجود' }, { status: 404 })
    }

    // حذف الحجز
    await prisma.booking.delete({
      where: { id: bookingId }
    })

    // تحديث حالة السيرة الذاتية إلى NEW
    await prisma.cV.update({
      where: { id: booking.cvId },
      data: { 
        status: 'NEW',
        updatedById: decoded.userId
      }
    })

    // إضافة سجل في ActivityLog
    await prisma.activityLog.create({
      data: {
        userId: decoded.userId,
        cvId: booking.cvId,
        action: 'CV_BOOKING_CANCELLED',
        description: `تم إلغاء حجز السيرة الذاتية ${booking.cv.fullName}`,
        metadata: {
          originalIdentityNumber: booking.identityNumber,
          cancelledAt: new Date().toISOString()
        },
        targetType: 'CV',
        targetId: booking.cvId.toString(),
        targetName: booking.cv.fullName
      }
    })

    return NextResponse.json({
      message: 'تم إلغاء الحجز بنجاح'
    })

  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json({ error: 'فشل في إلغاء الحجز' }, { status: 500 })
  }
}

// PUT - تحديث حجز
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const bookingId = parseInt(params.id)
    const { identityNumber, notes, status } = await request.json()

    // العثور على الحجز
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        cv: {
          select: {
            id: true,
            fullName: true,
            referenceCode: true
          }
        }
      }
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'الحجز غير موجود' }, { status: 404 })
    }

    // تحديث الحجز
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        identityNumber: identityNumber || existingBooking.identityNumber,
        notes: notes !== undefined ? notes : existingBooking.notes,
        status: status || existingBooking.status,
        updatedAt: new Date()
      },
      include: {
        cv: {
          select: {
            id: true,
            fullName: true,
            fullNameArabic: true,
            referenceCode: true,
            nationality: true,
            position: true
          }
        },
        bookedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // إضافة سجل في ActivityLog
    await prisma.activityLog.create({
      data: {
        userId: decoded.userId,
        cvId: existingBooking.cvId,
        action: 'CV_BOOKING_UPDATED',
        description: `تم تحديث حجز السيرة الذاتية ${existingBooking.cv.fullName}`,
        metadata: {
          oldIdentityNumber: existingBooking.identityNumber,
          newIdentityNumber: identityNumber,
          updatedAt: new Date().toISOString()
        },
        targetType: 'CV',
        targetId: existingBooking.cvId.toString(),
        targetName: existingBooking.cv.fullName
      }
    })

    return NextResponse.json({
      message: 'تم تحديث الحجز بنجاح',
      booking: updatedBooking
    })

  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'فشل في تحديث الحجز' }, { status: 500 })
  }
}
