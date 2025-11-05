import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Clock, MapPin, Sunrise, Sun, Sunset, Moon, Star } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { SmartPrayerTimes, PrayerTimesCache, type PrayerTimes } from "@/lib/prayer-times-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NextPrayer {
  name: string;
  time: string;
  remaining: string;
  hours: number;
  minutes: number;
  seconds: number;
}

export function PrayerTimesSidebarWidget() {
  const { language } = useI18n();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [city] = useState({ name: "القاهرة", nameEn: "Cairo", lat: 30.0444, lon: 31.2357 });

  useEffect(() => {
    fetchPrayerTimes();
    // Re-fetch every hour to keep data fresh
    const hourlyRefresh = setInterval(fetchPrayerTimes, 60 * 60 * 1000);
    return () => clearInterval(hourlyRefresh);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (prayerTimes) {
        calculateNextPrayer();
      }
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, [prayerTimes, language]);

  const fetchPrayerTimes = async () => {
    try {
      console.log('🕌 Fetching prayer times for sidebar widget...');
      setIsLoading(true);
      
      // Check cache first for instant loading
      const cached = PrayerTimesCache.get(city.lat, city.lon);
      if (cached && Date.now() - lastFetch < 30 * 60 * 1000) { // 30 min cache
        console.log('📦 Using cached prayer times');
        setPrayerTimes(cached.times);
        setIsLoading(false);
        setLastFetch(Date.now());
        return;
      }
      
      // Fetch fresh data using professional service
      const result = await SmartPrayerTimes.getPrayerTimes(city.lat, city.lon);
      
      if (result && result.times) {
        console.log('✅ Prayer times fetched successfully from:', result.source);
        setPrayerTimes(result.times);
        
        // Cache the result
        PrayerTimesCache.set(city.lat, city.lon, result);
        setLastFetch(Date.now());
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('❌ Error fetching prayer times:', error);
      
      // Fallback to default times if all fails
      const fallbackTimes: PrayerTimes = {
        Fajr: "05:15",
        Sunrise: "06:45",
        Dhuhr: "12:30",
        Asr: "15:45",
        Maghrib: "18:15",
        Isha: "19:45"
      };
      
      console.log('⚠️ Using fallback prayer times');
      setPrayerTimes(fallbackTimes);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNextPrayer = () => {
    if (!prayerTimes) return;

    const now = new Date();
    const prayers = [
      { name: language === "ar" ? "الفجر" : "Fajr", time: prayerTimes.Fajr },
      { name: language === "ar" ? "الظهر" : "Dhuhr", time: prayerTimes.Dhuhr },
      { name: language === "ar" ? "العصر" : "Asr", time: prayerTimes.Asr },
      { name: language === "ar" ? "المغرب" : "Maghrib", time: prayerTimes.Maghrib },
      { name: language === "ar" ? "العشاء" : "Isha", time: prayerTimes.Isha },
    ];

    // Find next prayer
    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);
      
      if (prayerDate > now) {
        const diff = prayerDate.getTime() - now.getTime();
        const totalSeconds = Math.floor(diff / 1000);
        const hoursLeft = Math.floor(totalSeconds / 3600);
        const minutesLeft = Math.floor((totalSeconds % 3600) / 60);
        const secondsLeft = totalSeconds % 60;
        
        setNextPrayer({
          name: prayer.name,
          time: prayer.time,
          remaining: `${hoursLeft.toString().padStart(2, "0")}:${minutesLeft.toString().padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`,
          hours: hoursLeft,
          minutes: minutesLeft,
          seconds: secondsLeft
        });
        return;
      }
    }

    // Next is Fajr tomorrow
    const [hours, minutes] = prayerTimes.Fajr.split(":").map(Number);
    const fajrDate = new Date();
    fajrDate.setDate(fajrDate.getDate() + 1);
    fajrDate.setHours(hours, minutes, 0, 0);
    
    const diff = fajrDate.getTime() - now.getTime();
    const totalSeconds = Math.floor(diff / 1000);
    const hoursLeft = Math.floor(totalSeconds / 3600);
    const minutesLeft = Math.floor((totalSeconds % 3600) / 60);
    const secondsLeft = totalSeconds % 60;

    setNextPrayer({
      name: language === "ar" ? "الفجر" : "Fajr",
      time: prayerTimes.Fajr,
      remaining: `${hoursLeft.toString().padStart(2, "0")}:${minutesLeft.toString().padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`,
      hours: hoursLeft,
      minutes: minutesLeft,
      seconds: secondsLeft
    });
  };

  const convertTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? (language === "ar" ? "م" : "PM") : (language === "ar" ? "ص" : "AM");
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  // Always show widget, calculate next prayer
  useEffect(() => {
    calculateNextPrayer();
  }, [currentTime]);

  // Get icon for each prayer
  const getPrayerIcon = (prayerName: string) => {
    const name = prayerName.toLowerCase();
    if (name.includes('فجر') || name.includes('fajr')) return <Sunrise className="h-5 w-5" />;
    if (name.includes('ظهر') || name.includes('dhuhr')) return <Sun className="h-5 w-5" />;
    if (name.includes('عصر') || name.includes('asr')) return <Sun className="h-5 w-5 text-orange-400" />;
    if (name.includes('مغرب') || name.includes('maghrib')) return <Sunset className="h-5 w-5" />;
    if (name.includes('عشاء') || name.includes('isha')) return <Moon className="h-5 w-5" />;
    return <Star className="h-5 w-5" />;
  };

  // Show loading state
  if (isLoading && !nextPrayer) {
    return (
      <Card className="shadow-lg border-2 border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white font-['Cairo']">
            <Clock className="h-4 w-4 text-emerald-600" />
            {language === "ar" ? "مواقيت الصلاة" : "Prayer Times"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <motion.div
            className="flex items-center justify-center py-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span className="font-['Cairo'] text-sm text-gray-600 dark:text-gray-400">
                {language === "ar" ? "جاري التحميل..." : "Loading..."}
              </span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }
  
  if (!nextPrayer) return null;

  return (
    <Link href="/prayer-times">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 overflow-hidden">
          {/* Animated background */}
          <motion.div 
            className="absolute inset-0 opacity-5"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)',
              width: '200%'
            }}
          />
          
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white font-['Cairo']">
              <Clock className="h-4 w-4 text-emerald-600" />
              {language === "ar" ? "مواقيت الصلاة" : "Prayer Times"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 relative z-10">
            {/* Next Prayer Display */}
            <motion.div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white"
              animate={{
                boxShadow: [
                  '0 4px 20px rgba(16, 185, 129, 0.3)',
                  '0 4px 30px rgba(16, 185, 129, 0.5)',
                  '0 4px 20px rgba(16, 185, 129, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center justify-between">
                {/* Prayer Info */}
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full"
                    animate={{ 
                      rotate: [0, 360]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    {getPrayerIcon(nextPrayer.name)}
                  </motion.div>
                  
                  <div>
                    <p className="text-xs text-white/90 mb-1 font-['Cairo']">
                      {language === "ar" ? "الصلاة القادمة" : "Next Prayer"}
                    </p>
                    <motion.p 
                      className="text-xl font-black text-white font-['Cairo']"
                      key={nextPrayer.name}
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      {nextPrayer.name}
                    </motion.p>
                    <p className="text-sm font-mono text-white/90">
                      {convertTo12Hour(nextPrayer.time)}
                    </p>
                  </div>
                </div>

                {/* Countdown */}
                <div className="text-right">
                  <p className="text-xs text-white/90 mb-1 font-['Cairo']">
                    {language === "ar" ? "باقي" : "Left"}
                  </p>
                  <div className="flex items-center gap-1">
                    {/* Hours */}
                    <motion.div 
                      className="bg-white/25 px-2 py-1 rounded text-center min-w-[30px]"
                      key="sidebar-hours"
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <div className="text-sm font-mono font-bold text-white">
                        {nextPrayer.hours.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-white/70">h</div>
                    </motion.div>
                    
                    <span className="text-white/70">:</span>
                    
                    {/* Minutes */}
                    <motion.div 
                      className="bg-white/25 px-2 py-1 rounded text-center min-w-[30px]"
                      key="sidebar-minutes"
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <div className="text-sm font-mono font-bold text-white">
                        {nextPrayer.minutes.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-white/70">m</div>
                    </motion.div>
                    
                    <span className="text-white/70">:</span>
                    
                    {/* Seconds */}
                    <motion.div 
                      className="bg-white/30 px-2 py-1 rounded text-center min-w-[30px] border border-white/40"
                      key="sidebar-seconds"
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div 
                        className="text-sm font-mono font-bold text-white"
                        animate={{ 
                          color: ['#ffffff', '#fbbf24', '#ffffff']
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {nextPrayer.seconds.toString().padStart(2, '0')}
                      </motion.div>
                      <div className="text-xs text-white/70">s</div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* City Info */}
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="font-['Cairo']">{language === "ar" ? city.name : city.nameEn}</span>
              </div>
              <span className="font-['Cairo'] text-emerald-600 dark:text-emerald-400 font-semibold">
                {language === "ar" ? "اضغط للتفاصيل" : "Click for details"}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
