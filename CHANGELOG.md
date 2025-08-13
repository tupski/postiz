# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-08-13

### Added
- **Facebook Groups Integration**: Fitur baru untuk posting ke grup Facebook
  - FacebookGroupsProvider untuk backend integration
  - UI komponen untuk memilih grup Facebook
  - Support untuk posting dengan media (foto, video) ke grup
  - Auto posting dan penjadwalan ke grup Facebook
  - Template posting yang sama dengan Facebook Pages

### Features
- **Daftar Grup Facebook**: Menampilkan daftar grup yang sudah di-join oleh user
- **Auto Posting ke Grup**: Sistem penjadwalan posting otomatis ke grup Facebook
- **Template Posting**: Menggunakan template existing dengan support media
- **Multiple Daily Scheduling**: Kemampuan jadwal posting lebih dari 1x per hari (sudah ada)
- **Media Support**: Support foto, video, dan link dalam posting grup (sudah ada)

### Technical Changes
- Menambahkan `FacebookGroupsProvider` di `libraries/nestjs-libraries/src/integrations/social/facebook-groups.provider.ts`
- Menambahkan endpoint API `/integrations/facebook-groups/:id` untuk save grup
- Menambahkan komponen frontend `FacebookGroupsProvider` dan `FacebookGroupsContinue`
- Menambahkan icon `facebook-groups.png` untuk UI
- Registrasi provider di integration manager dan frontend routing

### Dependencies
- Menggunakan Facebook Graph API v20.0 dengan scopes:
  - `groups_access_member_info`
  - `publish_to_groups`
  - `user_posts`
  - `user_photos`
  - `user_videos`

### Database
- Tidak ada perubahan schema database
- Menggunakan model Integration existing dengan `providerIdentifier: 'facebook-groups'`

### Compatibility
- Kompatibel dengan semua fitur existing
- Tidak ada breaking changes
- Menggunakan infrastruktur posting dan scheduling yang sudah ada

## [1.0.0] - Previous Release
- Initial release dengan Facebook Pages support
- Sistem posting dan scheduling
- Template posting dengan media support
- Multiple social media integrations
