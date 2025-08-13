# Facebook Groups Integration

Dokumentasi lengkap untuk fitur Facebook Groups di Postiz.

## 📋 Overview

Fitur Facebook Groups memungkinkan pengguna untuk:
- Melihat daftar grup Facebook yang sudah di-join
- Melakukan posting otomatis ke grup Facebook
- Menggunakan template posting dengan media support
- Menjadwalkan posting ke grup dengan sistem scheduling existing

## 🚀 Fitur Utama

### ✅ Fitur yang Tersedia:
1. **Daftar Grup Facebook** - Menampilkan grup yang sudah di-join user
2. **Auto Posting ke Grup** - Posting otomatis dengan penjadwalan
3. **Template Posting** - Editor dengan preview dan media support
4. **Media Support** - Upload foto, video, dan link
5. **Multiple Daily Scheduling** - Jadwal posting lebih dari 1x per hari
6. **Comment Support** - Posting dengan komentar

### 🔧 Teknologi yang Digunakan:
- **Backend**: NestJS dengan FacebookGroupsProvider
- **Frontend**: React/Next.js dengan komponen UI
- **Database**: PostgreSQL dengan Prisma ORM
- **Queue**: Redis dengan BullMQ untuk scheduling
- **API**: Facebook Graph API v20.0

## 📝 Cara Penggunaan

### 1. Setup Facebook App
Pastikan Facebook App memiliki permissions:
```
groups_access_member_info
publish_to_groups
user_posts
user_photos
user_videos
```

### 2. Environment Variables
```env
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FRONTEND_URL=http://localhost:3000
```

### 3. Menambahkan Integrasi Facebook Groups
1. Buka halaman Integrations
2. Pilih "Facebook Groups"
3. Login dengan Facebook
4. Pilih grup yang ingin digunakan
5. Simpan integrasi

### 4. Membuat Posting ke Grup
1. Buka halaman New Post
2. Pilih integrasi Facebook Groups
3. Tulis konten posting
4. Upload media jika diperlukan
5. Set jadwal posting
6. Publish atau schedule

## 🏗️ Arsitektur Teknis

### Backend Components:
```
libraries/nestjs-libraries/src/integrations/social/
├── facebook-groups.provider.ts     # Provider utama
└── integration.manager.ts          # Registrasi provider

libraries/nestjs-libraries/src/database/prisma/integrations/
└── integration.service.ts          # Service untuk save grup

apps/backend/src/api/routes/
└── integrations.controller.ts      # API endpoints
```

### Frontend Components:
```
apps/frontend/src/components/new-launch/providers/
├── facebook-groups/
│   └── facebook-groups.provider.tsx
├── continue-provider/facebook-groups/
│   └── facebook-groups.continue.tsx
├── show.all.providers.tsx
└── continue-provider/list.tsx
```

### Database Schema:
Menggunakan model `Integration` existing:
```prisma
model Integration {
  id                String
  providerIdentifier String  // 'facebook-groups'
  internalId        String   // Facebook Group ID
  name              String   // Group Name
  picture           String   // Group Picture URL
  token             String   // Access Token
  // ... fields lainnya
}
```

## 🔌 API Endpoints

### POST /integrations/facebook-groups/:id
Save grup Facebook yang dipilih user.

**Request Body:**
```json
{
  "group": "facebook_group_id"
}
```

**Response:**
```json
{
  "success": true
}
```

### GET /integrations/function
Mendapatkan daftar grup Facebook (menggunakan provider function).

**Query Parameters:**
```
name=groups
integrationId=integration_id
```

**Response:**
```json
[
  {
    "id": "group_id",
    "name": "Group Name",
    "picture": "group_picture_url",
    "privacy": "CLOSED",
    "member_count": 1000
  }
]
```

## 🧪 Testing

### Manual Testing:
1. Pastikan tidak ada error TypeScript
2. Cek registrasi provider di integration manager
3. Cek komponen frontend terdaftar dengan benar
4. Cek icon tersedia di `/icons/platforms/facebook-groups.png`

### Unit Testing:
```bash
# Run tests untuk provider
npm test facebook-groups.provider.spec.ts

# Run tests untuk frontend components
npm test facebook-groups.provider.test.tsx
```

## 🚨 Troubleshooting

### Error: "groups_access_member_info permission not granted"
- Pastikan Facebook App memiliki permission yang benar
- User harus memberikan izin saat login

### Error: "Cannot post to this group"
- Pastikan user adalah member aktif grup
- Cek apakah grup mengizinkan posting dari aplikasi

### Error: "Invalid access token"
- Token Facebook mungkin expired
- Lakukan re-authentication

## 📚 Referensi

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api/)
- [Facebook Groups API](https://developers.facebook.com/docs/graph-api/reference/group/)
- [Postiz Documentation](../README.md)

## 🔄 Version History

- **v1.1.0** - Initial Facebook Groups integration
- **v1.0.0** - Base Postiz with Facebook Pages support
