import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Clock, MapPin, Sunrise, Sun, Sunset, Moon, Star } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { SmartPrayerTimes, PrayerTimesCache, type PrayerTimes } from "@/lib/prayer-times-services";

interface NextPrayer {
  name: string;
  time: string;
  remaining: string;
  hours: number;
  minutes: number;
  seconds: number;
}

export function PrayerTimesBar() {
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
      console.log('🕌 Fetching prayer times...');
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
    if (name.includes('فجر') || name.includes('fajr')) return <Sunrise className="h-4 w-4" />;
    if (name.includes('ظهر') || name.includes('dhuhr')) return <Sun className="h-4 w-4" />;
    if (name.includes('عصر') || name.includes('asr')) return <Sun className="h-4 w-4 text-orange-300" />;
    if (name.includes('مغرب') || name.includes('maghrib')) return <Sunset className="h-4 w-4" />;
    if (name.includes('عشاء') || name.includes('isha')) return <Moon className="h-4 w-4" />;
    return <Star className="h-4 w-4" />;
  };

  // Show loading state or prayer data
  if (isLoading && !nextPrayer) {
    return (
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center py-2">
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Clock className="h-4 w-4" />
              <span className="font-['Cairo'] text-sm">
                {language === "ar" ? "جاري تحميل مواقيت الصلاة..." : "Loading prayer times..."}
              </span>
            </motion.div>
          </div>
        </div>
        <div className="h-0.5 bg-white/20" />
      </div>
    );
  }
  
  if (!nextPrayer) return null;

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md overflow-hidden"
    >
      {/* Subtle animated background */}
      <motion.div 
        className="absolute inset-0 opacity-10"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          width: '200%'
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between py-2">
          {/* City */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <MapPin className="h-4 w-4" />
            <span className="font-['Cairo'] font-semibold text-sm">{language === "ar" ? city.name : city.nameEn}</span>
          </motion.div>

          {/* Prayer Info - Compact */}
          <Link href="/prayer-times">
            <motion.div 
              className="flex items-center gap-4 cursor-pointer hover:bg-white/10 px-4 py-1 rounded-lg transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Prayer Icon */}
              <motion.div
                className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full"
                animate={{ 
                  rotate: [0, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {getPrayerIcon(nextPrayer.name)}
              </motion.div>

              {/* Prayer Name & Time */}
              <div className="text-center">
                <motion.div
                  className="text-sm font-['Cairo'] font-bold text-white"
                  key={nextPrayer.name}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  {nextPrayer.name}
                </motion.div>
                <div className="text-xs font-mono text-white/90">
                  {convertTo12Hour(nextPrayer.time)}
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Compact Countdown */}
          <motion.div 
            className="flex items-center gap-1"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-xs font-['Cairo'] text-white/80 mr-2">
              {language === "ar" ? "باقي:" : "Left:"}
            </span>
            
            {/* Hours */}
            <motion.div 
              className="bg-white/20 px-2 py-1 rounded text-center min-w-[35px]"
              key="hours-display"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <div className="text-sm font-mono font-bold text-white">
                {nextPrayer.hours.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-white/70">h</div>
            </motion.div>
            
            <span className="text-white/50 text-sm">:</span>
            
            {/* Minutes */}
            <motion.div 
              className="bg-white/20 px-2 py-1 rounded text-center min-w-[35px]"
              key="minutes-display"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <div className="text-sm font-mono font-bold text-white">
                {nextPrayer.minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-white/70">m</div>
            </motion.div>
            
            <span className="text-white/50 text-sm">:</span>
            
            {/* Seconds */}
            <motion.div 
              className="bg-white/30 px-2 py-1 rounded text-center min-w-[35px] border border-white/40"
              key="seconds-display"
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
          </motion.div>
        </div>
      </div>
      
      {/* Bottom thin line */}
      <div className="h-0.5 bg-white/20" />
    </motion.div>
  );
}
