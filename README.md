# Literature Platform Frontend

O'zbek adabiyotini raqamlashtirish va global auditoriya uchun interaktiv platforma.
Ushbu frontend foydalanuvchilar uchun mutolaa muhiti, profil boshqaruvi va
admin panel orqali kontentni boshqarishni ta'minlaydi.

## Asosiy funksiyalar

- Mehmonlar uchun landing sahifa (hero + loyihaga kirish).
- Foydalanuvchi autentifikatsiyasi (login/registratsiya, email tasdiqlash).
- Foydalanuvchi profili va profil rasmi upload.
- Admin panel (SUPERADMIN):
  - Kitoblar: yaratish, tahrirlash, muqova rasmi upload, ro'yxat/pagination.
  - Foydalanuvchilar: yaratish, tahrirlash, o'chirish, filtr/pagination.
  - Mualliflar: CRUD.
  - Kategoriyalar: CRUD + subcategory.
- Light/Dark theme (tab orqali almashish).

## Texnologiyalar

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- React Hook Form + Yup
- React Toastify

## Ishga tushirish

```bash
npm install
npm run dev
```

## Muhim eslatmalar

- Backend base URL: `http://localhost:8080`
- Avtorizatsiya: `Authorization: Bearer <token>`
- Admin panel faqat `SUPERADMIN` roliga ochiq.

## Loyihaning tuzilishi (qisqa)

- `src/features/auth` — login/registratsiya/email tasdiqlash.
- `src/features/dashboard` — guest/user dashboard.
- `src/features/profile` — profil va rasm upload.
- `src/features/admin` — admin panel bo'limlari.
- `src/shared` — umumiy UI komponentlar (Navbar, Sidebar, Route guards).
- `src/context` — Auth va Theme context.
- `src/services` — axios client.

## Skriptlar

- `npm run dev` — development server.
- `npm run build` — production build.
- `npm run preview` — buildni local ko'rish.
- `npm run lint` — lint tekshiruvi.

