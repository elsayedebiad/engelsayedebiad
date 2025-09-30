import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuthFromRequest } from '@/lib/middleware-auth'

// DELETE - إلغاء تعاقد وإرجاع السيرة الذاتية إلى حالة محجوز
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await validateAuthFromRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const user = authResult.user
    const contractId = parseInt(params.id)

    // العثور على التعاقد
    const contract = await db.contract.findUnique({
      where: { id: contractId },
      include: {
        cv: {
          select: {
            id: true,
            fullName: true,
            referenceCode: true,
            status: true
          }
        }
      }
    })

    if (!contract) {
      return NextResponse.json({ error: 'التعاقد غير موجود' }, { status: 404 })
    }

    // التحقق من أن السيرة الذاتية متعاقد عليها
    if (contract.cv.status !== 'HIRED') {
      return NextResponse.json(
        { error: 'هذه السيرة الذاتية ليست متعاقد عليها' },
        { status: 400 }
      )
    }

    // إلغاء التعاقد وإرجاع السيرة إلى حالة جديدة في معاملة واحدة
    const result = await db.$transaction(async (tx) => {
      // حذف التعاقد
      await tx.contract.delete({
        where: { id: contractId }
      })

      // تحديث حالة السيرة الذاتية إلى NEW
      const updatedCV = await tx.cV.update({
        where: { id: contract.cvId },
        data: {
          status: 'NEW',
          updatedById: user.id
        }
      })

      // إضافة سجل في ActivityLog
      await tx.activityLog.create({
        data: {
          userId: user.id,
          cvId: contract.cvId,
          action: 'CONTRACT_CANCELLED',
          description: `تم إلغاء التعاقد على السيرة الذاتية ${contract.cv.fullName}`,
          metadata: {
            originalContractId: contractId,
            identityNumber: contract.identityNumber,
            contractStartDate: contract.contractStartDate.toISOString(),
            cancelledAt: new Date().toISOString(),
            reason: 'Manual cancellation by admin'
          },
          targetType: 'CV',
          targetId: contract.cvId.toString(),
          targetName: contract.cv.fullName
        }
      })

      return updatedCV
    })

    return NextResponse.json({
      message: 'تم إلغاء التعاقد بنجاح',
      cv: {
        id: result.id,
        status: result.status
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error cancelling contract:', error)
    return NextResponse.json(
      { error: 'فشل في إلغاء التعاقد' },
      { status: 500 }
    )
  }
}

// GET - جلب تفاصيل التعاقد
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await validateAuthFromRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const contractId = parseInt(params.id)

    const contract = await db.contract.findUnique({
      where: { id: contractId },
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
      }
    })

    if (!contract) {
      return NextResponse.json({ error: 'التعاقد غير موجود' }, { status: 404 })
    }

    return NextResponse.json(contract)

  } catch (error) {
    console.error('Error fetching contract:', error)
    return NextResponse.json(
      { error: 'فشل في جلب تفاصيل التعاقد' },
      { status: 500 }
    )
  }
}

// PUT - تحديث رقم الهوية في التعاقد
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await validateAuthFromRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const user = authResult.user
    const contractId = parseInt(params.id)
    const { identityNumber } = await request.json()

    if (!identityNumber || identityNumber.trim().length < 10) {
      return NextResponse.json(
        { error: 'رقم الهوية يجب أن يكون 10 أرقام على الأقل' },
        { status: 400 }
      )
    }

    // العثور على التعاقد
    const existingContract = await db.contract.findUnique({
      where: { id: contractId },
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

    if (!existingContract) {
      return NextResponse.json({ error: 'التعاقد غير موجود' }, { status: 404 })
    }

    // تحديث رقم الهوية
    const updatedContract = await db.contract.update({
      where: { id: contractId },
      data: {
        identityNumber: identityNumber.trim(),
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
            position: true,
            profileImage: true,
            status: true
          }
        }
      }
    })

    // إضافة سجل في ActivityLog
    await db.activityLog.create({
      data: {
        userId: user.id,
        cvId: existingContract.cvId,
        action: 'CONTRACT_IDENTITY_UPDATED',
        description: `تم تحديث رقم الهوية في التعاقد للسيرة الذاتية ${existingContract.cv.fullName}`,
        metadata: {
          contractId: contractId,
          oldIdentityNumber: existingContract.identityNumber,
          newIdentityNumber: identityNumber.trim(),
          updatedAt: new Date().toISOString()
        },
        targetType: 'CONTRACT',
        targetId: contractId.toString(),
        targetName: existingContract.cv.fullName
      }
    })

    return NextResponse.json({
      message: 'تم تحديث رقم الهوية بنجاح',
      contract: updatedContract
    })

  } catch (error) {
    console.error('Error updating contract identity:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث رقم الهوية' },
      { status: 500 }
    )
  }
}
