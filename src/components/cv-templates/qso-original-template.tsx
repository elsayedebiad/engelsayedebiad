import React from 'react';
import { Play, X } from 'lucide-react';

// Interface للسيرة الذاتية
interface CV {
  id: string;
  fullName: string;
  fullNameArabic?: string;
  email?: string;
  phone?: string;
  referenceCode?: string;
  position?: string;
  nationality?: string;
  religion?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  livingTown?: string;
  maritalStatus?: string;
  numberOfChildren?: number;
  weight?: string;
  height?: string;
  complexion?: string;
  age?: number;
  monthlySalary?: string;
  contractPeriod?: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  passportIssuePlace?: string;
  englishLevel?: string;
  arabicLevel?: string;
  educationLevel?: string;
  babySitting?: string;
  childrenCare?: string;
  tutoring?: string;
  disabledCare?: string;
  cleaning?: string;
  washing?: string;
  ironing?: string;
  arabicCooking?: string;
  sewing?: string;
  driving?: string;
  elderCare?: string;
  housekeeping?: string;
  experience?: string;
  education?: string;
  skills?: string;
  summary?: string;
  priority?: string;
  notes?: string;
  profileImage?: string;
  videoLink?: string;
  // الحقول الإضافية
  previousEmployment?: string;
  workExperienceYears?: number;
  lastEmployer?: string;
  reasonForLeaving?: string;
  contractType?: string;
  expectedSalary?: string;
  workingHours?: string;
  languages?: string;
  medicalCondition?: string;
  hobbies?: string;
  personalityTraits?: string;
  foodPreferences?: string;
  specialNeeds?: string;
  currentLocation?: string;
  availability?: string;
  preferredCountry?: string;
  visaStatus?: string;
  workPermit?: string;
  certificates?: string;
  references?: string;
  emergencyContact?: string;
}

interface QSOOriginalTemplateProps {
  cv: CV;
  selectedVideo?: string;
  setSelectedVideo?: (video: string | null) => void;
}

const QSOOriginalTemplate: React.FC<QSOOriginalTemplateProps> = ({ cv, selectedVideo, setSelectedVideo }) => {
  
  // دالة لعرض مستوى المهارة
  const getSkillLevel = (skill?: string) => {
    if (!skill) return 'غير محدد';
    switch (skill.toLowerCase()) {
      case 'yes': case 'نعم': return 'نعم';
      case 'no': case 'لا': return 'لا';
      case 'willing': case 'مستعد': case 'مستعدة': return 'مستعدة';
      default: return skill;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white" dir="rtl" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* QSO Header - تصميم أصلي */}
      <div className="relative bg-white border-4 border-blue-800">
        {/* Header العلوي */}
        <div className="bg-blue-800 text-white p-4 text-center">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">QSO</div>
            <div className="text-lg">نموذج السيرة الذاتية</div>
            <div className="text-2xl font-bold">QSO</div>
          </div>
        </div>

        {/* معلومات أساسية */}
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-3 gap-6">
            {/* الصورة الشخصية */}
            <div className="col-span-1 text-center">
              <div className="w-40 h-48 mx-auto border-2 border-gray-400 bg-gray-200 flex items-center justify-center">
                {cv.profileImage ? (
                  <img 
                    src={cv.profileImage} 
                    alt={cv.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-500 text-center">
                    <div className="text-4xl mb-2">👤</div>
                    <div className="text-sm">صورة شخصية</div>
                  </div>
                )}
              </div>
              
              {/* زر الفيديو */}
              {cv.videoLink && (
                <button
                  onClick={() => setSelectedVideo?.(cv.videoLink!)}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center justify-center mx-auto"
                >
                  <Play className="w-4 h-4 ml-1" />
                  فيديو تعريفي
                </button>
              )}
            </div>

            {/* المعلومات الشخصية */}
            <div className="col-span-2">
              <table className="w-full border-collapse border border-gray-400 text-sm">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold w-1/3">الاسم الكامل</td>
                    <td className="border border-gray-400 p-2">{cv.fullName || 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">الاسم بالعربية</td>
                    <td className="border border-gray-400 p-2">{cv.fullNameArabic || cv.fullName || 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">الجنسية</td>
                    <td className="border border-gray-400 p-2">{cv.nationality || 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">الديانة</td>
                    <td className="border border-gray-400 p-2">{cv.religion || 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">العمر</td>
                    <td className="border border-gray-400 p-2">{cv.age ? `${cv.age} سنة` : 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">الحالة الاجتماعية</td>
                    <td className="border border-gray-400 p-2">{cv.maritalStatus || 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">عدد الأطفال</td>
                    <td className="border border-gray-400 p-2">{cv.numberOfChildren !== undefined ? cv.numberOfChildren : 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">الطول</td>
                    <td className="border border-gray-400 p-2">{cv.height || 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">الوزن</td>
                    <td className="border border-gray-400 p-2">{cv.weight || 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">لون البشرة</td>
                    <td className="border border-gray-400 p-2">{cv.complexion || 'غير محدد'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* معلومات الاتصال والوظيفة */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* معلومات الاتصال */}
            <div>
              <h3 className="text-lg font-bold bg-blue-800 text-white p-2 text-center mb-4">معلومات الاتصال</h3>
              <table className="w-full border-collapse border border-gray-400 text-sm">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">رقم الهاتف</td>
                    <td className="border border-gray-400 p-2">{cv.phone || 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">البريد الإلكتروني</td>
                    <td className="border border-gray-400 p-2">{cv.email || 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">مكان السكن</td>
                    <td className="border border-gray-400 p-2">{cv.livingTown || 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">الرقم المرجعي</td>
                    <td className="border border-gray-400 p-2 font-bold text-red-600">{cv.referenceCode || 'غير محدد'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* معلومات الوظيفة */}
            <div>
              <h3 className="text-lg font-bold bg-blue-800 text-white p-2 text-center mb-4">معلومات الوظيفة</h3>
              <table className="w-full border-collapse border border-gray-400 text-sm">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">الوظيفة المطلوبة</td>
                    <td className="border border-gray-400 p-2">{cv.position || 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">الراتب الشهري</td>
                    <td className="border border-gray-400 p-2">{cv.monthlySalary || 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">مدة العقد</td>
                    <td className="border border-gray-400 p-2">{cv.contractPeriod || 'غير محدد'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 bg-blue-100 p-2 font-bold">التعليم</td>
                    <td className="border border-gray-400 p-2">{cv.education || cv.educationLevel || 'غير محدد'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* جواز السفر */}
        {(cv.passportNumber || cv.passportIssueDate || cv.passportExpiryDate) && (
          <div className="p-6">
            <h3 className="text-lg font-bold bg-blue-800 text-white p-2 text-center mb-4">معلومات جواز السفر</h3>
            <table className="w-full border-collapse border border-gray-400 text-sm">
              <tbody>
                <tr>
                  <td className="border border-gray-400 bg-blue-100 p-2 font-bold w-1/4">رقم جواز السفر</td>
                  <td className="border border-gray-400 p-2">{cv.passportNumber || 'غير محدد'}</td>
                  <td className="border border-gray-400 bg-blue-100 p-2 font-bold w-1/4">تاريخ الإصدار</td>
                  <td className="border border-gray-400 p-2">{cv.passportIssueDate || 'غير محدد'}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-blue-100 p-2 font-bold">تاريخ الانتهاء</td>
                  <td className="border border-gray-400 p-2">{cv.passportExpiryDate || 'غير محدد'}</td>
                  <td className="border border-gray-400 bg-blue-100 p-2 font-bold">مكان الإصدار</td>
                  <td className="border border-gray-400 p-2">{cv.passportIssuePlace || 'غير محدد'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* المهارات */}
        <div className="p-6">
          <h3 className="text-lg font-bold bg-blue-800 text-white p-2 text-center mb-4">المهارات والخبرات</h3>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <tbody>
              <tr>
                <td className="border border-gray-400 bg-blue-100 p-2 font-bold w-1/4">رعاية الأطفال</td>
                <td className="border border-gray-400 p-2">{getSkillLevel(cv.babySitting)}</td>
                <td className="border border-gray-400 bg-blue-100 p-2 font-bold w-1/4">التنظيف</td>
                <td className="border border-gray-400 p-2">{getSkillLevel(cv.cleaning)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 bg-blue-100 p-2 font-bold">الطبخ العربي</td>
                <td className="border border-gray-400 p-2">{getSkillLevel(cv.arabicCooking)}</td>
                <td className="border border-gray-400 bg-blue-100 p-2 font-bold">الغسيل</td>
                <td className="border border-gray-400 p-2">{getSkillLevel(cv.washing)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 bg-blue-100 p-2 font-bold">الكي</td>
                <td className="border border-gray-400 p-2">{getSkillLevel(cv.ironing)}</td>
                <td className="border border-gray-400 bg-blue-100 p-2 font-bold">الخياطة</td>
                <td className="border border-gray-400 p-2">{getSkillLevel(cv.sewing)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 bg-blue-100 p-2 font-bold">القيادة</td>
                <td className="border border-gray-400 p-2">{getSkillLevel(cv.driving)}</td>
                <td className="border border-gray-400 bg-blue-100 p-2 font-bold">رعاية المسنين</td>
                <td className="border border-gray-400 p-2">{getSkillLevel(cv.elderCare)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 bg-blue-100 p-2 font-bold">اللغة الإنجليزية</td>
                <td className="border border-gray-400 p-2">{getSkillLevel(cv.englishLevel)}</td>
                <td className="border border-gray-400 bg-blue-100 p-2 font-bold">اللغة العربية</td>
                <td className="border border-gray-400 p-2">{getSkillLevel(cv.arabicLevel)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* الخبرة */}
        {(cv.experience || cv.previousEmployment) && (
          <div className="p-6">
            <h3 className="text-lg font-bold bg-blue-800 text-white p-2 text-center mb-4">الخبرة العملية</h3>
            <div className="border border-gray-400 p-4 bg-gray-50">
              {cv.experience && (
                <p className="mb-2"><strong>الخبرة:</strong> {cv.experience}</p>
              )}
              {cv.previousEmployment && (
                <p className="mb-2"><strong>الخبرة السابقة:</strong> {cv.previousEmployment}</p>
              )}
            </div>
          </div>
        )}

        {/* ملاحظات */}
        {(cv.summary || cv.notes) && (
          <div className="p-6">
            <h3 className="text-lg font-bold bg-blue-800 text-white p-2 text-center mb-4">ملاحظات إضافية</h3>
            <div className="border border-gray-400 p-4 bg-gray-50">
              {cv.summary && (
                <p className="mb-2"><strong>الملخص:</strong> {cv.summary}</p>
              )}
              {cv.notes && (
                <p className="mb-2"><strong>ملاحظات:</strong> {cv.notes}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-blue-800 text-white p-4 text-center">
          <div className="flex justify-between items-center">
            <div className="text-sm">QSO Template</div>
            <div className="text-lg font-bold">نموذج السيرة الذاتية</div>
            <div className="text-sm">QSO Template</div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">الفيديو التعريفي</h3>
              <button
                onClick={() => setSelectedVideo?.(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src={selectedVideo}
                className="w-full h-full rounded"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QSOOriginalTemplate;
