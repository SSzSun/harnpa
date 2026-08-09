# Harnpa - Bill Split App

แอปแบ่งบิลที่ทำให้การคำนวณค่าใช้จ่ายง่ายขึ้น

## คุณสมบัติ

- **รองรับหลายภาษา (i18n)**: ไทย และ อังกฤษ
- **จัดการบิล**: สร้างบิลพร้อมตั้งชื่อได้
- **จัดการรายการ**: เพิ่มรายการพร้อมโน้ตบันทึก (เช่น "ข้าวผัด 3 จาน")
- **ลบหลายรายการ**: เลือกและลบหลายรายการพร้อมกัน
- **คนหาร**: เลือกคนหารด้วย Chip Component ที่สวยงาม
- **คำนวณการโอนเงิน**: ลดจำนวนการโอนให้น้อยที่สุดด้วยอัลกอริทึม
- **สรุปยอด**: แสดงรายละเอียดการโอนเงิน
- **สถานะการจ่าย**: คลิกเพื่อเปลี่ยนสถานะการจ่ายเงิน
- **รายละเอียดคน**: ดูรายการที่แต่ละคนต้องจ่าย
- **Dark/Light Mode**: สลับโหมดสีได้ พร้อม localStorage persistence
- **แชร์บิล**: แชร์ลิงก์บิลผ่าน Web Share API หรือคัดลอกลิงก์
- **Real-time Sync**: ซิงค์ข้อมูลผ่าน Firebase Realtime Database

## เทคโนโลยี

- **Next.js 15** (App Router)
- **Firebase Realtime Database** สำหรับเก็บและซิงค์ข้อมูล
- **next-intl** สำหรับ i18n
- **Tailwind CSS** สำหรับ styling
- **TypeScript**

## การติดตั้ง

### 1. Clone Repository

```bash
git clone https://github.com/SSzSun/harnpa.git
cd harnpa
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Firebase

1. สร้างโปรเจกต์ใหม่ที่ [Firebase Console](https://console.firebase.google.com)
2. เปิดใช้งาน **Realtime Database**
3. ไปที่ Project Settings → เลือก Web App → คัดลอก Firebase Config
4. สร้างไฟล์ `.env.local` จาก `.env.example`:

```bash
cp .env.example .env.local
```

5. กรอก Firebase config ใน `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. ตั้งค่า Firebase Security Rules

ไปที่ Firebase Console → Realtime Database → Rules และใส่ rules จาก `FIREBASE_SECURITY.md`

### 5. รันโปรเจกต์

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:3000

## Deploy

### Vercel (แนะนำ)

1. Push โค้ดขึ้น GitHub
2. เชื่อมต่อ repository กับ [Vercel](https://vercel.com)
3. เพิ่ม Environment Variables จาก `.env.local`
4. Deploy

Vercel จะ auto-deploy ทุกครั้งที่ push

## โครงสร้างโปรเจกต์

```
app/
├── [locale]/              # i18n routing
│   ├── page.tsx          # หน้าแรก
│   ├── bill/[id]/        # หน้าบิล
│   ├── not-found.tsx     # 404 page
│   ├── layout.tsx        # Layout พร้อม metadata
│   └── globals.css       # Global styles + theme
components/
├── bill/                 # Bill page components
│   ├── ItemsList.tsx     # รายการพร้อม bulk delete
│   ├── PeopleList.tsx
│   ├── StatCards.tsx
│   └── SummaryList.tsx
├── ui/                   # Shared UI components
│   └── Footer.tsx        # Footer พร้อม author credit
├── ItemModal.tsx         # Modal เพิ่มรายการ + โน้ต
├── PersonModal.tsx
├── ThemeToggle.tsx       # Dark/Light mode toggle
└── PaymentDetailModal.tsx
lib/
├── settlement.ts         # การคำนวณยอดเงิน + types
├── billSync.ts           # Firebase sync logic
├── format.ts             # Formatting utilities
└── billHistory.ts        # Local history (localStorage)
messages/
├── th.json               # ภาษาไทย
└── en.json               # ภาษาอังกฤษ
```

## การใช้งาน

1. **สร้างบิล**: คลิกปุ่ม "สร้างบิล" ที่หน้าแรก
2. **ตั้งชื่อบิล**: กรอกชื่อบิลในช่องด้านบน
3. **เพิ่มรายชื่อ**: ไปที่แท็บ "รายชื่อ" และเพิ่มชื่อคน
4. **เพิ่มรายการ**: ไปที่แท็บ "รายการ" คลิก "เพิ่มรายการ" แล้วกรอก:
   - ชื่อรายการ (optional)
   - โน้ต (optional) - บันทึกรายละเอียดว่าซื้ออะไร
   - ราคา
   - คนจ่าย
   - คนหาร (เลือกได้หลายคน)
5. **ลบหลายรายการ**: คลิกปุ่มถังขยะ → เลือกรายการ → ลบ
6. **ดูสรุปยอด**: ไปที่แท็บ "สรุปยอด" เพื่อดูการโอนเงิน
7. **คลิกรายการโอน**: เพื่อดูรายละเอียดและเปลี่ยนสถานะการจ่าย
8. **แชร์บิล**: คลิกปุ่มแชร์เพื่อส่งลิงก์ให้เพื่อน

## อัลกอริทึมการคำนวณ

แอปใช้อัลกอริทึม **Greedy Settlement** เพื่อลดจำนวนการโอนเงินให้น้อยที่สุด:

**ตัวอย่าง:**
- แบบปกติ: A → B 20฿, B → C 20฿ (2 ครั้ง)
- แบบตัดยอด: A → C 20฿ (1 ครั้ง)

จำนวนการโอนสูงสุด = จำนวนคน - 1

## Made by

**Jaruphat Khenprom**  
GitHub: [@SSzSun](https://github.com/SSzSun)

## License

MIT
