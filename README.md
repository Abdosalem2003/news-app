# 📰 CareerCanvas - نظام إدارة المحتوى

نظام إدارة محتوى احترافي مبني بـ React و Express مع قاعدة بيانات MySQL.

## 🚀 المميزات

- ✅ نظام مستخدمين متقدم مع صلاحيات
- ✅ إدارة المقالات والأخبار
- ✅ محرر نصوص غني (Rich Text Editor)
- ✅ نظام تعليقات وتفاعلات
- ✅ لوحة تحكم تحليلية
- ✅ دعم اللغة العربية والإنجليزية
- ✅ تصميم متجاوب (Responsive)
- ✅ أمان عالي مع Helmet و CSRF Protection
- ✅ Rate Limiting لحماية من الهجمات

## 🛠️ التقنيات المستخدمة

### Frontend
- React 18
- TailwindCSS
- Shadcn/ui Components
- Wouter (Routing)
- TanStack Query
- Framer Motion

### Backend
- Node.js + Express
- TypeScript
- MySQL (Drizzle ORM)
- Passport.js (Authentication)
- Winston (Logging)
- WebSocket (Real-time features)

## 📦 التثبيت المحلي

### المتطلبات
- Node.js 18+
- MySQL 8+
- npm أو yarn

### الخطوات

1. **استنساخ المشروع**
```bash
git clone <repository-url>
cd News
```

2. **تثبيت الحزم**
```bash
npm install
```

3. **إعداد قاعدة البيانات**
```bash
# أنشئ قاعدة بيانات MySQL
mysql -u root -p
CREATE DATABASE careercanvas;
```

4. **إعداد ملف البيئة**
```bash
# انسخ ملف المثال
cp .env.example .env

# عدل القيم في .env
```

5. **تشغيل المشروع**
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

التطبيق سيعمل على: http://localhost:5000

## 🌐 النشر على Railway

اتبع الدليل الكامل في: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

### خطوات سريعة:
1. ارفع المشروع على GitHub
2. سجل دخول على https://railway.app
3. اختر "Deploy from GitHub repo"
4. أضف MySQL database
5. اضبط Environment Variables
6. انشر! 🚀

## 📝 Environment Variables المطلوبة

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=mysql://user:password@host:port/database
SESSION_SECRET=your-secret-key
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=strong-password
```

شاهد `.env.example` للقائمة الكاملة.

## 🔐 الأمان

- ✅ Helmet.js لحماية HTTP Headers
- ✅ CSRF Protection
- ✅ Rate Limiting
- ✅ Session Management آمن
- ✅ Password Hashing مع bcrypt
- ✅ Input Validation
- ✅ SQL Injection Protection (ORM)

## 📊 Scripts المتاحة

```bash
npm run dev          # تشغيل Development server
npm run build        # بناء للـ Production
npm start            # تشغيل Production server
npm run db:push      # تحديث Database schema
npm run db:seed      # ملء قاعدة البيانات ببيانات تجريبية
npm run check        # فحص TypeScript
```

## 🗂️ هيكل المشروع

```
News/
├── client/          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/
├── server/          # Express Backend
│   ├── routes/
│   ├── db/
│   └── index.ts
├── shared/          # Shared types & schemas
├── public/          # Static files
└── db/              # Database files
```

## 🤝 المساهمة

المساهمات مرحب بها! افتح Issue أو Pull Request.

## 📄 الترخيص

MIT License

## 📞 الدعم

للمساعدة أو الاستفسارات، افتح Issue على GitHub.

---

**صُنع بـ ❤️ في مصر**
