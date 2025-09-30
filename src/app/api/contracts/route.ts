import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuthFromRequest } from '@/lib/middleware-auth'

// GET - جلب جميع التعاقدات
export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAuthFromRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const url = new URL(request.url)
    const cvId = url.searchParams.get('cvId')

    let whereClause = {}
    if (cvId) {
      whereClause = { cvId: parseInt(cvId) }
    }

    const contracts = await db.contract.findMany({
      where: whereClause,
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(contracts)

  } catch (error) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json(
      { error: 'فشل في جلب التعاقدات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await validateAuthFromRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const user = authResult.user
    const body = await request.json()
    const { cvId, identityNumber, contractDate, salary, notes } = body

    if (!cvId || !identityNumber) {
      return NextResponse.json(
        { error: 'معرف السيرة الذاتية ورقم الهوية مطلوبان' },
        { status: 400 }
      )
    }

    // التحقق من وجود السيرة الذاتية
    const cv = await db.cV.findUnique({
      where: { id: Number(cvId) },
      select: {
        id: true,
        fullName: true,
        referenceCode: true,
        status: true
      }
    })

    if (!cv) {
      return NextResponse.json(
        { error: 'السيرة الذاتية غير موجودة' },
        { status: 404 }
      )
    }

    // التحقق من أن السيرة الذاتية ليست متعاقد عليها بالفعل
    if (cv.status === 'HIRED') {
      return NextResponse.json(
        { error: 'هذه السيرة الذاتية متعاقد عليها بالفعل' },
        { status: 400 }
      )
    }

    // إنشاء التعاقد وتحديث حالة السيرة الذاتية في معاملة واحدة
    const result = await db.$transaction(async (tx) => {
      // إنشاء التعاقد
      const contract = await tx.contract.create({
        data: {
          cvId: Number(cvId),
          identityNumber: identityNumber,
          contractStartDate: contractDate ? new Date(contractDate) : new Date(),
          contractEndDate: null // يمكن تحديثه لاحقاً
        },
        include: {
          cv: {
            select: {
              id: true,
              fullName: true,
              referenceCode: true,
              nationality: true,
              position: true
            }
          }
        }
      })

      // تحديث حالة السيرة الذاتية إلى HIRED
      await tx.cV.update({
        where: { id: Number(cvId) },
        data: {
          status: 'HIRED',
          updatedById: user.id
        }
      })

      // حذف أي حجوزات موجودة لهذه السيرة الذاتية
      await tx.booking.deleteMany({
        where: { cvId: Number(cvId) }
      })

      // إضافة سجل في ActivityLog
      await tx.activityLog.create({
        data: {
          userId: user.id,
          cvId: Number(cvId),
          action: 'CV_CONTRACTED',
          description: `تم التعاقد على السيرة الذاتية ${cv.fullName}`,
          metadata: {
            identityNumber: identityNumber,
            contractDate: contractDate || new Date().toISOString(),
            salary: salary || null,
            contractedAt: new Date().toISOString()
          },
          targetType: 'CV',
          targetId: cvId.toString(),
          targetName: cv.fullName
        }
      })

      return contract
    })

    return NextResponse.json({ 
      message: 'تم إنشاء التعاقد بنجاح',
      contract: result 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating contract:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء التعاقد' },
      { status: 500 }
    )
  }
}
