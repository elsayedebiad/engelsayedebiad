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

interface QSOTemplateProps {
  cv: CV;
  selectedVideo?: string | null;
  setSelectedVideo?: (video: string | null) => void;
}

const QSOTemplate: React.FC<QSOTemplateProps> = ({ cv, selectedVideo, setSelectedVideo }) => {
  
  // دالة لتحويل مستوى المهارة
  const getSkillLevel = (skill?: string) => {
    if (!skill) return 'لا';
    switch (skill.toLowerCase()) {
      case 'yes': case 'نعم': return 'نعم';
      case 'no': case 'لا': return 'لا';
      case 'willing': case 'مستعد': case 'مستعدة': return 'نعم';
      case 'good': case 'جيد': case 'جيدة': return 'نعم';
      default: return skill;
    }
  };

  // دالة لإرجاع علم الدولة
  const getCountryFlag = (nationality: string): string => {
    const country = nationality.toLowerCase().trim();
    
    // الدول الأكثر شيوعاً في الاستقدام
    if (country === 'إثيوبيا' || country === 'ethiopia' || country === 'ethiopian') return '🇪🇹';
    if (country === 'الفلبين' || country === 'philippines' || country === 'filipino' || country === 'filipina') return '🇵🇭';
    if (country === 'إندونيسيا' || country === 'indonesia' || country === 'indonesian') return '🇮🇩';
    if (country === 'بنغلاديش' || country === 'bangladesh' || country === 'bangladeshi') return '🇧🇩';
    if (country === 'سريلانكا' || country === 'sri lanka' || country === 'srilanka' || country === 'sri lankan') return '🇱🇰';
    if (country === 'نيبال' || country === 'nepal' || country === 'nepalese') return '🇳🇵';
    if (country === 'الهند' || country === 'india' || country === 'indian') return '🇮🇳';
    if (country === 'كينيا' || country === 'kenya' || country === 'kenyan') return '🇰🇪';
    if (country === 'أوغندا' || country === 'uganda' || country === 'ugandan') return '🇺🇬';
    if (country === 'غانا' || country === 'ghana' || country === 'ghanaian') return '🇬🇭';
    if (country === 'نيجيريا' || country === 'nigeria' || country === 'nigerian') return '🇳🇬';
    if (country === 'الكاميرون' || country === 'cameroon' || country === 'cameroonian') return '🇨🇲';
    if (country === 'تنزانيا' || country === 'tanzania' || country === 'tanzanian') return '🇹🇿';
    if (country === 'رواندا' || country === 'rwanda' || country === 'rwandan') return '🇷🇼';
    if (country === 'بوروندي' || country === 'burundi' || country === 'burundian') return '🇧🇮';
    if (country === 'مدغشقر' || country === 'madagascar' || country === 'malagasy') return '🇲🇬';
    if (country === 'زامبيا' || country === 'zambia' || country === 'zambian') return '🇿🇲';
    if (country === 'زيمبابوي' || country === 'zimbabwe' || country === 'zimbabwean') return '🇿🇼';
    if (country === 'موزمبيق' || country === 'mozambique' || country === 'mozambican') return '🇲🇿';
    if (country === 'مالاوي' || country === 'malawi' || country === 'malawian') return '🇲🇼';
    if (country === 'تايلاند' || country === 'thailand' || country === 'thai') return '🇹🇭';
    if (country === 'فيتنام' || country === 'vietnam' || country === 'vietnamese') return '🇻🇳';
    if (country === 'ميانمار' || country === 'myanmar' || country === 'burmese') return '🇲🇲';
    if (country === 'كمبوديا' || country === 'cambodia' || country === 'cambodian') return '🇰🇭';
    if (country === 'لاوس' || country === 'laos' || country === 'lao' || country === 'laotian') return '🇱🇦';
    if (country === 'ماليزيا' || country === 'malaysia' || country === 'malaysian') return '🇲🇾';
    if (country === 'سنغافورة' || country === 'singapore' || country === 'singaporean') return '🇸🇬';
    if (country === 'باكستان' || country === 'pakistan' || country === 'pakistani') return '🇵🇰';
    if (country === 'أفغانستان' || country === 'afghanistan' || country === 'afghan') return '🇦🇫';
    
    // دول إضافية
    if (country === 'مصر' || country === 'egypt' || country === 'egyptian') return '🇪🇬';
    if (country === 'السودان' || country === 'sudan' || country === 'sudanese') return '🇸🇩';
    if (country === 'المغرب' || country === 'morocco' || country === 'moroccan') return '🇲🇦';
    if (country === 'الجزائر' || country === 'algeria' || country === 'algerian') return '🇩🇿';
    if (country === 'تونس' || country === 'tunisia' || country === 'tunisian') return '🇹🇳';
    if (country === 'ليبيا' || country === 'libya' || country === 'libyan') return '🇱🇾';
    
    // علم افتراضي
    return '🌍';
  };

  // دالة لإرجاع اختصار الدولة
  const getCountryCode = (nationality: string): string => {
    const country = nationality.toLowerCase().trim();
    
    if (country === 'إثيوبيا' || country === 'ethiopia') return 'ETH';
    if (country === 'الفلبين' || country === 'philippines') return 'PHL';
    if (country === 'إندونيسيا' || country === 'indonesia') return 'IDN';
    if (country === 'بنغلاديش' || country === 'bangladesh') return 'BGD';
    if (country === 'سريلانكا' || country === 'sri lanka') return 'LKA';
    if (country === 'نيبال' || country === 'nepal') return 'NPL';
    if (country === 'الهند' || country === 'india') return 'IND';
    if (country === 'كينيا' || country === 'kenya') return 'KEN';
    if (country === 'أوغندا' || country === 'uganda') return 'UGA';
    if (country === 'غانا' || country === 'ghana') return 'GHA';
    if (country === 'نيجيريا' || country === 'nigeria') return 'NGA';
    if (country === 'الكاميرون' || country === 'cameroon') return 'CMR';
    if (country === 'تنزانيا' || country === 'tanzania') return 'TZA';
    if (country === 'رواندا' || country === 'rwanda') return 'RWA';
    if (country === 'بوروندي' || country === 'burundi') return 'BDI';
    if (country === 'مدغشقر' || country === 'madagascar') return 'MDG';
    if (country === 'زامبيا' || country === 'zambia') return 'ZMB';
    if (country === 'زيمبابوي' || country === 'zimbabwe') return 'ZWE';
    if (country === 'موزمبيق' || country === 'mozambique') return 'MOZ';
    if (country === 'مالاوي' || country === 'malawi') return 'MWI';
    if (country === 'تايلاند' || country === 'thailand') return 'THA';
    if (country === 'فيتنام' || country === 'vietnam') return 'VNM';
    if (country === 'ميانمار' || country === 'myanmar') return 'MMR';
    if (country === 'كمبوديا' || country === 'cambodia') return 'KHM';
    if (country === 'لاوس' || country === 'laos') return 'LAO';
    if (country === 'ماليزيا' || country === 'malaysia') return 'MYS';
    if (country === 'سنغافورة' || country === 'singapore') return 'SGP';
    if (country === 'باكستان' || country === 'pakistan') return 'PAK';
    if (country === 'أفغانستان' || country === 'afghanistan') return 'AFG';
    
    // اختصار افتراضي
    return nationality.substring(0, 3).toUpperCase();
  };

  // دالة لتحويل مستوى اللغة إلى نسبة
  const getLanguageWidth = (level?: string) => {
    if (!level) return '25%';
    switch (level.toLowerCase()) {
      case 'excellent': case 'ممتاز': case 'ممتازة': return '100%';
      case 'good': case 'جيد': case 'جيدة': return '75%';
      case 'fair': case 'متوسط': case 'متوسطة': return '50%';
      case 'poor': case 'ضعيف': case 'ضعيفة': return '25%';
      case 'no': case 'لا': case 'لا تجيد': return '25%';
      default: return '50%';
    }
  };

  const getLanguageText = (level?: string) => {
    if (!level) return 'متوسطة';
    switch (level.toLowerCase()) {
      case 'excellent': case 'ممتاز': case 'ممتازة': return 'ممتازة';
      case 'good': case 'جيد': case 'جيدة': return 'جيدة';
      case 'fair': case 'متوسط': case 'متوسطة': return 'متوسطة';
      case 'poor': case 'ضعيف': case 'ضعيفة': return 'ضعيفة';
      case 'no': case 'لا': case 'لا تجيد': return 'لا تجيد';
      default: return level;
    }
  };

  return (
    <div className="cv-container" style={{ 
      fontFamily: 'Cairo, Arial, sans-serif', 
      fontWeight: '700', 
      fontSize: '1.3rem', // خط ثابت للطباعة
      backgroundColor: '#f5f5f5', 
      margin: 0, 
      padding: 0, 
      color: '#333', 
      direction: 'rtl',
      width: '1459px',  // الأبعاد الأصلية
      height: '2048px', // الأبعاد الأصلية
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* CV Container */}
      <div style={{
        display: 'flex',
        width: '1459px',  // الأبعاد الأصلية
        height: '2048px', // الأبعاد الأصلية
        backgroundColor: 'white',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Watermark */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}>
          {/* صف أول - الأعلى */}
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '2%',
              left: '2%',
              width: '380px',  // الحجم الأصلي
              height: 'auto',
              opacity: 0.15,
              transform: 'rotate(-25deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '8%',
              left: '35%',
              width: '350px',
              height: 'auto',
              opacity: 0.12,
              transform: 'rotate(-35deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '4%',
              left: '70%',
              width: '360px',
              height: 'auto',
              opacity: 0.14,
              transform: 'rotate(-15deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '1%',
              right: '5%',
              width: '390px',
              height: 'auto',
              opacity: 0.13,
              transform: 'rotate(-20deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          
          {/* صف ثاني */}
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '18%',
              left: '8%',
              width: '340px',
              height: 'auto',
              opacity: 0.11,
              transform: 'rotate(-40deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '22%',
              left: '45%',
              width: '370px',
              height: 'auto',
              opacity: 0.13,
              transform: 'rotate(-28deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '20%',
              right: '8%',
              width: '330px',
              height: 'auto',
              opacity: 0.12,
              transform: 'rotate(-32deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          
          {/* صف ثالث */}
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '35%',
              left: '12%',
              width: '350px',
              height: 'auto',
              opacity: 0.14,
              transform: 'rotate(-18deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '38%',
              left: '55%',
              width: '355px',
              height: 'auto',
              opacity: 0.11,
              transform: 'rotate(-42deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '46%',
              right: '2%',
              width: '325px',
              height: 'auto',
              opacity: 0.13,
              transform: 'rotate(-30deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          
          {/* صف خامس */}
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '65%',
              left: '10%',
              width: '350px',
              height: 'auto',
              opacity: 0.12,
              transform: 'rotate(-35deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '68%',
              left: '50%',
              width: '380px',
              height: 'auto',
              opacity: 0.14,
              transform: 'rotate(-20deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '62%',
              right: '8%',
              width: '340px',
              height: 'auto',
              opacity: 0.11,
              transform: 'rotate(-40deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          
          {/* صف سادس */}
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '78%',
              left: '3%',
              width: '370px',
              height: 'auto',
              opacity: 0.13,
              transform: 'rotate(-28deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '82%',
              left: '42%',
              width: '360px',
              height: 'auto',
              opacity: 0.12,
              transform: 'rotate(-33deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '75%',
              right: '5%',
              width: '355px',
              height: 'auto',
              opacity: 0.14,
              transform: 'rotate(-24deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          
          {/* صف سابع - الأسفل */}
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '90%',
              left: '8%',
              width: '330px',
              height: 'auto',
              opacity: 0.11,
              transform: 'rotate(-36deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '88%',
              left: '55%',
              width: '345px',
              height: 'auto',
              opacity: 0.12,
              transform: 'rotate(-26deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          <img 
            src="/watermark-new.png" 
            alt="QSO Watermark"
            style={{
              position: 'absolute',
              top: '92%',
              right: '12%',
              width: '325px',
              height: 'auto',
              opacity: 0.13,
              transform: 'rotate(-42deg)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
        </div>
        {/* Sidebar - الجزء الأيمن للصورة */}
        <aside style={{
          backgroundColor: '#2c3e50',
          color: 'white',
          padding: '30px 20px', // مساحة ثابتة
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '650px', // عرض أكبر
          height: '2500px', // ارتفاع ثابت متساوي
          order: 0 // ترتيب ثابت
        }}>
          {/* Profile Section */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
    width: '350px',
    height: '400px',
    overflow: 'hidden',
    margin: '0px auto 20px',
    border: '4px solid rgb(67, 218, 203)',
    /* border-radius: 20px; */
    borderBottomLeftRadius: '250px',
    borderBottomRightRadius: '250px',
    borderTop: '0',
            }}>
              {cv.profileImage ? (
                <img 
                  src={cv.profileImage} 
                  alt={cv.fullName || 'صورة شخصية'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    console.log('خطأ في تحميل الصورة:', cv.profileImage);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#f0f0f0',
                display: cv.profileImage ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: '#ccc'
              }}>
                👤
              </div>
            </div>

            <img src="/1.png" alt="Frame 1" style={{width: '350px', borderRadius: '20px', marginBottom: '20px'}} />

            <h1 style={{
              fontSize: '2.8rem',
              margin: '15px 0 10px 0',
              fontWeight: '900'
            }}>{cv.fullName || 'اسم المرشح'}</h1>
            <p style={{
              fontSize: '2.2rem',
              color: 'white',
              fontWeight: '700',
              margin: '0 0 20px 0'
            }}>{cv.fullNameArabic || cv.fullName || 'الاسم بالعربية'}</p>

          </div>

          {/* Passport Section */}
          <section style={{ width: '100%', marginBottom: '25px' }}>
            <img src="/2.png" alt="Frame 2" style={{width: '350px', borderRadius: '20px', marginBottom: '15px',marginRight: '100px',}} />

            <div>
              <p style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '1.8rem' }}>
                <span style={{ fontWeight: '700' }}>الرقم</span>
                <span style={{ fontWeight: '600', textAlign: 'left' }}>{cv.passportNumber || 'غير محدد'}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '1.8rem' }}>
                <span style={{ fontWeight: '700' }}>تاريخ الاصدار</span>
                <span style={{ fontWeight: '600', textAlign: 'left' }}>{cv.passportIssueDate || 'غير محدد'}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '1.8rem' }}>
                <span style={{ fontWeight: '700' }}>تاريخ الانتهاء</span>
                <span style={{ fontWeight: '600', textAlign: 'left' }}>{cv.passportExpiryDate || 'غير محدد'}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '1.8rem' }}>
                <span style={{ fontWeight: '700' }}>مكان الاصدار</span>
                <span style={{ fontWeight: '600', textAlign: 'left' }}>{cv.passportIssuePlace || 'غير محدد'}</span>
              </p>
            </div>
          </section>

          {/* Experience Section */}
          <section style={{ width: '100%', marginBottom: '25px' }}>
            <img src="/3.png" alt="Frame 3" style={{width: '350px', borderRadius: '20px', marginBottom: '15px',marginRight: '100px',}} />
            <div>
              <p style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '1.8rem' }}>
                <span style={{ fontWeight: '700' }}>البلد</span>
                <span style={{ fontWeight: '600', textAlign: 'left' }}>{cv.preferredCountry || 'السعودية'}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '1.8rem' }}>
                <span style={{ fontWeight: '700' }}>المدة</span>
                <span style={{ fontWeight: '600', textAlign: 'left' }}>{cv.workExperienceYears || cv.contractPeriod || 'غير محدد'}</span>
              </p>
              {cv.lastEmployer && (
                <p style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '1.8rem' }}>
                  <span style={{ fontWeight: '700' }}>آخر صاحب عمل</span>
                  <span style={{ fontWeight: '600', textAlign: 'left' }}>{cv.lastEmployer}</span>
                </p>
              )}
              {cv.reasonForLeaving && (
                <p style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '1.8rem' }}>
                  <span style={{ fontWeight: '700' }}>سبب ترك العمل</span>
                  <span style={{ fontWeight: '600', textAlign: 'left' }}>{cv.reasonForLeaving}</span>
                </p>
              )}
            </div>
          </section>

          {/* Footer */}
          <div style={{
            marginTop: 'auto',
            textAlign: 'center',
            paddingTop: '30px',
            borderTop: '2px solid #4a627a',
            width: '100%'
          }}>
            {/* Flag */}
            <div style={{
              width: '280px',
              height: '160px',
              margin: '0 auto 20px',
              borderRadius: '15px',
              border: '3px solid #43dacb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              fontSize: '6rem'
            }}>
              🇪🇹
            </div>
            
            {/* Reference Code */}
            <div style={{
              backgroundColor: '#43dacb',
              color: 'white',
              padding: '15px 25px',
              borderRadius: '25px',
              fontSize: '1.4rem',
              fontWeight: 'bold',
              letterSpacing: '2px',
              margin: '0 auto 15px',
              maxWidth: '300px'
            }}>
              CODE: {cv.referenceCode || 'غير محدد'}
            </div>

            {/* Video Button */}
            {cv.videoLink && setSelectedVideo && (
              <button
                onClick={() => setSelectedVideo(cv.videoLink!)}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#c0392b';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#e74c3c';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🎥 مشاهدة الفيديو
              </button>
            )}
          </div>
        </aside>

        {/* Main Content - الجزء الأيسر للمعلومات */}
        <main style={{
          padding: '30px',    // المساحة الأصلية
          width: '950px',     // عرض أكبر
          backgroundColor: '#f8f9fa',
          height: '2500px',   // ارتفاع أكبر
          overflow: 'auto'
        }}>
          {/* Header */}
          <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',  // هامش أقل
            paddingBottom: '10px', // هامش أقل
            borderBottom: '1px solid hsl(0, 0%, 78%)'
          }}>
            <div style={{
              width: '100%',
              height: '180px',  // ارتفاع أقل
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img 
                src="/ministry-logo.jpg" 
                alt="شعار الوزارة"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '15px'
                }}
              />
            </div>
          </header>

          {/* Job Info */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',          // فجوة أقل
            marginBottom: '12px' // هامش أقل
          }}>
            <div style={{
              backgroundColor: 'white',
              border: '1px solid hsl(0, 0%, 78%)',
              borderRadius: '10px',
              padding: '10px',  // مساحة أقل
              textAlign: 'center',
              flexGrow: 1,
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
            }}>
              <span style={{
                display: 'block',
                fontSize: '1.6rem',
                color: 'hsl(0, 0%, 47%)',
                marginBottom: '5px'
              }}>الوظيفة المطلوبة</span>
              <span style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: 'hsl(207, 77%, 45%)'
              }}>{cv.position || 'عاملة منزلية'}</span>
            </div>
            <div style={{
              backgroundColor: 'white',
              border: '1px solid hsl(0, 0%, 78%)',
              borderRadius: '10px',
              padding: '10px',  // مساحة أقل
              textAlign: 'center',
              flexGrow: 1,
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
            }}>
              <span style={{
                display: 'block',
                fontSize: '1.6rem',
                color: 'hsl(0, 0%, 47%)',
                marginBottom: '5px'
              }}>الدولة المطلوبة</span>
              <span style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: 'hsl(207, 77%, 45%)'
              }}>{cv.preferredCountry || 'السعودية'}</span>
            </div>
            <div style={{
              backgroundColor: 'white',
              border: '1px solid hsl(0, 0%, 78%)',
              borderRadius: '10px',
              padding: '10px',  // مساحة أقل
              textAlign: 'center',
              flexGrow: 1,
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
            }}>
              <span style={{
                display: 'block',
                fontSize: '1.6rem',
                color: 'hsl(0, 0%, 47%)',
                marginBottom: '5px'
              }}>الراتب الشهري</span>
              <span style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: 'hsl(207, 77%, 45%)'
              }}>{cv.monthlySalary ? (cv.monthlySalary.includes('ريال') ? cv.monthlySalary : `${cv.monthlySalary} ريال`) : 'غير محدد'}</span>
            </div>
          </section>

          {/* Personal Info */}
          <section style={{ marginBottom: '12px' }}>
            <img src="/6.png" alt="Frame 6" style={{width: '700px', marginBottom: '10px', borderRadius: '20px'}} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px'
              }}>
              {[
                { label: 'الجنسية', value: cv.nationality },
                { label: 'الديانة', value: cv.religion },
                { label: 'تاريخ الميلاد', value: cv.dateOfBirth },
                { label: 'العمر', value: cv.age ? `${cv.age}` : undefined },
                { label: 'مكان الميلاد', value: cv.placeOfBirth },
                { label: 'مكان السكن', value: cv.livingTown },
                { label: 'الحالة الإجتماعية', value: cv.maritalStatus },
                { label: 'عدد الاطفال', value: cv.numberOfChildren?.toString() },
                { label: 'الوزن', value: cv.weight },
                { label: 'الطول', value: cv.height },
                { label: 'لون البشرة', value: cv.complexion },
                { label: 'الدرجة العلمية', value: cv.educationLevel || cv.education }
              ].map((item, index) => (
                <div key={index} style={{
                  background: '#fff',
                  padding: '20px',
                  borderRadius: '12px',
                  borderRight: '6px solid hsl(207, 77%, 45%)',
                  margin: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '1.8rem',
                  minHeight: '65px'
                }}>
                  <span style={{ fontWeight: '700', color: 'hsl(207, 77%, 45%)' }}>{item.label}</span>
                  <span style={{ fontWeight: '600', fontSize: '1.7rem' }}>{item.value || 'غير محدد'}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Languages */}
          <section style={{ marginBottom: '12px', marginTop: '8px' }}>
            <img src="/5.png" alt="Frame 5" style={{width: '700px', marginBottom: '10px', marginTop: '20px', borderRadius: '20px'}} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '15px'
            }}>
              <div style={{
                background: '#fff',
                padding: '10px',
                borderRadius: '5px',
                borderRight: '4px solid hsl(207, 77%, 45%)',
                margin: 0,
                display: 'grid',
                gridTemplateColumns: '100px 1fr 80px',
                alignItems: 'center',
                gap: '15px'
              }}>
                <span style={{ fontWeight: '700', fontSize: '1.6rem' }}>الانجليزية</span>
                <div style={{
                  width: '100%',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '10px',
                  height: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: 'hsl(207, 77%, 45%)',
                    borderRadius: '10px',
                    width: getLanguageWidth(cv.englishLevel)
                  }}></div>
                </div>
                <span style={{ fontWeight: '600', fontSize: '1.4rem' }}>{getLanguageText(cv.englishLevel)}</span>
              </div>
              <div style={{
                background: '#fff',
                padding: '10px',
                borderRadius: '5px',
                borderRight: '4px solid hsl(207, 77%, 45%)',
                margin: 0,
                display: 'grid',
                gridTemplateColumns: '100px 1fr 80px',
                alignItems: 'center',
                gap: '15px'
              }}>
                <span style={{ fontWeight: '700', fontSize: '1.6rem' }}>العربية</span>
                <div style={{
                  width: '100%',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '10px',
                  height: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: 'hsl(207, 77%, 45%)',
                    borderRadius: '10px',
                    width: getLanguageWidth(cv.arabicLevel)
                  }}></div>
                </div>
                <span style={{ fontWeight: '600', fontSize: '1.4rem' }}>{getLanguageText(cv.arabicLevel)}</span>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section style={{ marginTop: '8px' }}>
            <img src="/4.png" alt="Frame 4" style={{width: '700px', marginBottom: '10px', marginTop: '20px', borderRadius: '20px'}} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px',
              alignItems: 'center',
              paddingBottom: '15px'
            }}>
              {[
                { label: 'رعاية الاطفال', value: cv.babySitting },
                { label: 'كي الملابس', value: cv.ironing },
                { label: 'العناية بالاطفال', value: cv.childrenCare },
                { label: 'الطبخ', value: cv.arabicCooking },
                { label: 'التنظيف', value: cv.cleaning },
                { label: 'العمل المنزلي', value: cv.housekeeping },
                { label: 'الغسيل', value: cv.washing },
                { label: 'الطبخ العربي', value: cv.arabicCooking }
              ].map((skill, index) => (
                <div key={index} style={{
                  backgroundColor: '#fff',
                  border: '1px solid hsl(0, 0%, 78%)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  minHeight: '65px'
                }}>
                  <span>{skill.label}</span>
                  <span style={{
                    backgroundColor: getSkillLevel(skill.value) === 'نعم' ? '#2ecc71' : '#e74c3c',
                    color: 'white',
                    padding: '8px 15px',
                    borderRadius: '15px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}>
                    {getSkillLevel(skill.value)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            maxWidth: '64rem',
            width: '100%',
            margin: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                margin: 0
              }}>الفيديو التعريفي</h3>
              <button
                onClick={() => setSelectedVideo?.(null)}
                style={{
                  color: '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={24} />
              </button>
            </div>
            <div style={{ aspectRatio: '16/9' }}>
              <iframe
                src={selectedVideo}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '4px',
                  border: 'none'
                }}
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QSOTemplate;
