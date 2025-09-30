import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// GET - جلب جميع الحجوزات
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const bookings = await prisma.booking.findMany({
      include: {
        cv: {
          select: {
            id: true,
            fullName: true,
            fullNameArabic: true,
            referenceCode: true,
            nationality: true,
            position: true,
            profileImage: true,
            status: true
          }
        },
        bookedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        bookedAt: 'desc'
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'فشل في جلب الحجوزات' }, { status: 500 })
  }
}

// POST - إنشاء حجز جديد
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const { cvId, identityNumber, notes } = await request.json()

    if (!cvId || !identityNumber) {
      return NextResponse.json({ error: 'معرف السيرة الذاتية ورقم الهوية مطلوبان' }, { status: 400 })
    }

    // التحقق من أن السيرة الذاتية موجودة وغير محجوزة
    const existingCV = await prisma.cV.findUnique({
      where: { id: parseInt(cvId) },
      include: { booking: true }
    })

    if (!existingCV) {
      return NextResponse.json({ error: 'السيرة الذاتية غير موجودة' }, { status: 404 })
    }

    if (existingCV.booking) {
      return NextResponse.json({ error: 'السيرة الذاتية محجوزة مسبقاً' }, { status: 400 })
    }

    // إنشاء الحجز
    const booking = await prisma.booking.create({
      data: {
        cvId: parseInt(cvId),
        identityNumber,
        notes: notes || null,
        bookedById: decoded.userId
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

    // تحديث حالة السيرة الذاتية إلى BOOKED
    await prisma.cV.update({
      where: { id: parseInt(cvId) },
      data: { 
        status: 'BOOKED',
        updatedById: decoded.userId
      }
    })

    // إضافة سجل في ActivityLog
    await prisma.activityLog.create({
      data: {
        userId: decoded.userId,
        cvId: parseInt(cvId),
        action: 'CV_BOOKED',
        description: `تم حجز السيرة الذاتية ${existingCV.fullName} برقم هوية ${identityNumber}`,
        metadata: {
          identityNumber,
          notes,
          bookedAt: new Date().toISOString()
        },
        targetType: 'CV',
        targetId: cvId.toString(),
        targetName: existingCV.fullName
      }
    })

    return NextResponse.json({
      message: 'تم حجز السيرة الذاتية بنجاح',
      booking
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'فشل في إنشاء الحجز' }, { status: 500 })
  }
}
