# pmcheck (President Hotel and Tower - Engineering Log)

แปลงจากไฟล์ `index.html` เดี่ยว (Babel + Tailwind CDN) เป็นโปรเจกต์ Vite + React
ที่ build ล่วงหน้า เพื่อให้หน้าแรกโหลดเร็วขึ้น

## คำสั่ง
    npm install
    npm run dev       # ทดสอบในเครื่อง
    npm run build     # สร้างโฟลเดอร์ dist

## ไฟล์สำคัญ
- `src/App.jsx`      โค้ดแอปทั้งหมด (ย้ายมาจาก <script type="text/babel"> เดิม)
- `src/firebase.js`  ตั้งค่า Firebase + Push notification (ย้ายมาจาก <script> เดิม)
- `src/index.css`    Tailwind + CSS โหมดสว่างเดิม
- `public/`          ไฟล์ static (วาง `firebase-messaging-sw.js` ที่นี่)

## ก่อน deploy
คัดลอกไฟล์ static เดิมของโปรเจกต์ (เช่น `firebase-messaging-sw.js`, manifest, icon)
ไปไว้ในโฟลเดอร์ `public/` ไม่เช่นนั้น Push notification จะใช้ไม่ได้

## Vercel
Framework Preset = Vite, Build Command = `npm run build`, Output Directory = `dist`
(Vercel ตรวจจับให้อัตโนมัติ)
