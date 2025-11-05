/**
 * Prayer Times Services using Adhan Library
 * خدمات مواقيت الصلاة باستخدام مكتبة Adhan الموثوقة
 * 
 * مكتبة Adhan:
 * - ✅ دقيقة جداً (معتمدة عالمياً)
 * - ✅ تدعم جميع طرق الحساب
 * - ✅ تعمل بدون إنترنت
 * - ✅ تحسب التقويم الهجري
 * - ✅ مفتوحة المصدر ومجانية
 */

import { 
  Coordinates, 
  CalculationMethod, 
  PrayerTimes as AdhanPrayerTimes,
  Prayer,
  Madhab,
  HighLatitudeRule,
  Qibla
} from 'adhan';
// @ts-ignore - moment-hijri doesn't have types
import moment from 'moment-hijri';

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface DateInfo {
  hijri: {
    date: string;
    day: string;
    month: { ar: string; en: string };
    year: string;
  };
  gregorian: {
    date: string;
    day: string;
    month: { en: string };
    year: string;
  };
}

export interface PrayerTimesResponse {
  times: PrayerTimes;
  date: DateInfo;
  source: string;
}

// ============ ADHAN PRAYER TIMES SERVICE ============
export class AdhanPrayerTimesService {
  // حساب مواقيت الصلاة باستخدام مكتبة Adhan
  static calculatePrayerTimes(lat: number, lon: number, date: Date = new Date()): PrayerTimesResponse {
    try {
      console.log(`🕌 Calculating prayer times for Lat: ${lat}, Lon: ${lon}`);
      
      // إعداد الإحداثيات
      const coordinates = new Coordinates(lat, lon);
      
      // استخدام الطريقة المصرية (Egyptian General Authority of Survey)
      const params = CalculationMethod.Egyptian();
      params.madhab = Madhab.Shafi; // المذهب الشافعي (الأكثر شيوعاً في مصر)
      
      // حساب مواقيت الصلاة
      const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);
      
      // تنسيق الأوقات
      const formatter = new Intl.DateTimeFormat('en', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Africa/Cairo'
      });
      
      const times: PrayerTimes = {
        Fajr: formatter.format(prayerTimes.fajr),
        Sunrise: formatter.format(prayerTimes.sunrise),
        Dhuhr: formatter.format(prayerTimes.dhuhr),
        Asr: formatter.format(prayerTimes.asr),
        Maghrib: formatter.format(prayerTimes.maghrib),
        Isha: formatter.format(prayerTimes.isha),
      };
      
      // حساب التاريخ الهجري (تقريبي)
      const hijriDate = this.getHijriDate(date);
      
      const response: PrayerTimesResponse = {
        times,
        date: {
          hijri: hijriDate,
          gregorian: {
            date: date.toLocaleDateString(),
            day: date.getDate().toString(),
            month: { en: date.toLocaleString('en', { month: 'long' }) },
            year: date.getFullYear().toString()
          }
        },
        source: 'Adhan Library (Egyptian Method)'
      };
      
      console.log('✅ Prayer times calculated successfully');
      return response;
      
    } catch (error) {
      console.error('❌ Error calculating prayer times:', error);
      throw error;
    }
  }
  
  // حساب مواقيت الصلاة لشهر كامل
  static calculateMonthlyTimes(lat: number, lon: number, month: number, year: number): any[] {
    try {
      console.log(`📅 Calculating monthly prayer times for ${month}/${year}`);
      
      const coordinates = new Coordinates(lat, lon);
      const params = CalculationMethod.Egyptian();
      params.madhab = Madhab.Shafi;
      
      const daysInMonth = new Date(year, month, 0).getDate();
      const monthlyData: any[] = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);
        
        const formatter = new Intl.DateTimeFormat('en', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Africa/Cairo'
        });
        
        const hijriDate = this.getHijriDate(date);
        
        monthlyData.push({
          date: {
            gregorian: {
              day: day.toString(),
              month: { number: month, en: date.toLocaleString('en', { month: 'long' }) },
              year: year.toString(),
              date: date.toLocaleDateString()
            },
            hijri: {
              day: hijriDate.day,
              month: { ar: hijriDate.month.ar, en: hijriDate.month.en },
              year: hijriDate.year,
              date: `${hijriDate.day} ${hijriDate.month.ar} ${hijriDate.year}`
            }
          },
          timings: {
            Fajr: formatter.format(prayerTimes.fajr),
            Sunrise: formatter.format(prayerTimes.sunrise),
            Dhuhr: formatter.format(prayerTimes.dhuhr),
            Asr: formatter.format(prayerTimes.asr),
            Maghrib: formatter.format(prayerTimes.maghrib),
            Isha: formatter.format(prayerTimes.isha),
          }
        });
      }
      
      console.log(`✅ Monthly times calculated: ${monthlyData.length} days`);
      return monthlyData;
      
    } catch (error) {
      console.error('❌ Error calculating monthly times:', error);
      throw error;
    }
  }
  
  // حساب التاريخ الهجري الدقيق باستخدام moment-hijri
  private static getHijriDate(date: Date): DateInfo['hijri'] {
    // تحويل التاريخ الميلادي إلى هجري بدقة
    const hijriMoment = moment(date);
    
    const hijriMonths = [
      { ar: 'محرم', en: 'Muharram' },
      { ar: 'صفر', en: 'Safar' },
      { ar: 'ربيع الأول', en: 'Rabi al-Awwal' },
      { ar: 'ربيع الآخر', en: 'Rabi al-Thani' },
      { ar: 'جمادى الأولى', en: 'Jumada al-Ula' },
      { ar: 'جمادى الآخرة', en: 'Jumada al-Akhirah' },
      { ar: 'رجب', en: 'Rajab' },
      { ar: 'شعبان', en: 'Shaban' },
      { ar: 'رمضان', en: 'Ramadan' },
      { ar: 'شوال', en: 'Shawwal' },
      { ar: 'ذو القعدة', en: 'Dhul-Qadah' },
      { ar: 'ذو الحجة', en: 'Dhul-Hijjah' }
    ];
    
    // الحصول على التاريخ الهجري الدقيق
    const hijriDay = hijriMoment.iDate(); // اليوم الهجري
    const hijriMonth = hijriMoment.iMonth(); // الشهر الهجري (0-11)
    const hijriYear = hijriMoment.iYear(); // السنة الهجرية
    
    const month = hijriMonths[hijriMonth];
    
    return {
      date: `${hijriDay} ${month.ar} ${hijriYear}`,
      day: hijriDay.toString(),
      month: month,
      year: hijriYear.toString()
    };
  }
}

// ============ SMART PRAYER TIMES (نظام ذكي) ============
export class SmartPrayerTimes {
  // استخدام مكتبة Adhan مباشرة - دقيقة وموثوقة
  static async getPrayerTimes(lat: number, lon: number): Promise<PrayerTimesResponse> {
    try {
      console.log(`🕌 Getting prayer times using Adhan library...`);
      const result = AdhanPrayerTimesService.calculatePrayerTimes(lat, lon);
      console.log(`✅ Success with ${result.source}`);
      return result;
    } catch (error) {
      console.error('❌ Error getting prayer times:', error);
      throw error;
    }
  }

  static async getMonthlyTimes(lat: number, lon: number, month: number, year: number): Promise<any[]> {
    try {
      console.log(`📅 Getting monthly times using Adhan library...`);
      const result = AdhanPrayerTimesService.calculateMonthlyTimes(lat, lon, month, year);
      console.log(`✅ Monthly times calculated: ${result.length} days`);
      return result;
    } catch (error) {
      console.error('❌ Error getting monthly times:', error);
      throw error;
    }
  }

  // التحقق من صحة الأوقات
  static validateTimes(times: PrayerTimes): boolean {
    const required = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    return required.every(prayer => times[prayer as keyof PrayerTimes] && times[prayer as keyof PrayerTimes].match(/^\d{2}:\d{2}$/));
  }
}


// ============ CACHING SERVICE ============
export class PrayerTimesCache {
  private static cache = new Map<string, { data: PrayerTimesResponse; timestamp: number }>();
  private static CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  static get(lat: number, lon: number): PrayerTimesResponse | null {
    const key = `${lat},${lon}`;
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📦 Using cached prayer times');
      return cached.data;
    }

    return null;
  }

  static set(lat: number, lon: number, data: PrayerTimesResponse): void {
    const key = `${lat},${lon}`;
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  static clear(): void {
    this.cache.clear();
  }
}

// ============ EXPORT ============
export const PrayerTimesServices = {
  Adhan: AdhanPrayerTimesService,
  Smart: SmartPrayerTimes,
  Cache: PrayerTimesCache,
};
