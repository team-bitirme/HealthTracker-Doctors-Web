# HealthTracker Doctors Web

HealthTracker Doctors Web, doktorların hastalarını takip edebileceği modern bir web uygulamasıdır. React Native mobil uygulamasının web versiyonu olarak geliştirilmiştir.

## 🚀 Özellikler

### 👨‍⚕️ Doktor Paneli
- **Hasta Yönetimi**: Hasta listesi görüntüleme ve detay bilgileri
- **Egzersiz Planları**: Hastalara özel egzersiz rutinleri oluşturma ve takibi
- **Şikayet Takibi**: Hasta şikayetlerini görüntüleme ve yönetme
- **Sağlık Ölçümleri**: Hasta sağlık verilerini analiz etme
- **Real-time Mesajlaşma**: Hastalarla anlık iletişim

### 📊 Dashboard Özellikleri
- Hasta istatistikleri
- Okunmamış mesaj bildirimleri
- Aktif şikayet sayısı
- Toplam hasta sayısı

### 💬 Mesajlaşma Sistemi
- Gerçek zamanlı chat
- Mesaj geçmişi
- Okunmamış mesaj göstergeleri

### 🏃‍♂️ Egzersiz Yönetimi
- Mevcut egzersizler arasından seçim
- Egzersiz planı oluşturma
- Egzersiz tamamlama takibi
- Zorluk seviyesi belirleme

## 🛠️ Teknoloji Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **UI Framework**: React 18
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Heroicons
- **Date Handling**: date-fns
- **Language**: TypeScript

## 📋 Gereksinimler

- Node.js 18.x veya üzeri
- npm veya yarn
- Supabase hesabı

## 🚀 Kurulum

1. **Repository'yi klonlayın:**
```bash
git clone https://github.com/team-bitirme/HealthTracker-Doctors-Web.git
cd HealthTracker-Doctors-Web
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın:**
`.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

5. **Tarayıcıda açın:**
[http://localhost:3000](http://localhost:3000)

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── providers/        # Context providers
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities and configurations
│   ├── supabase.ts      # Supabase client
│   └── types/           # TypeScript definitions
├── services/             # API services
└── store/               # Zustand stores
```

## 🗄️ Veritabanı Şeması

### Ana Tablolar
- **patients**: Hasta bilgileri
- **doctors**: Doktor bilgileri
- **doctor_patients**: Doktor-hasta ilişkileri
- **messages**: Mesajlaşma sistemi
- **complaints**: Hasta şikayetleri
- **health_measurements**: Sağlık ölçümleri
- **exercise_plans**: Egzersiz planları
- **exercises**: Mevcut egzersizler

## 🎨 UI/UX Özellikleri

- **Responsive Design**: Tüm cihazlarda uyumlu
- **Modern Interface**: Temiz ve kullanıcı dostu tasarım
- **Real-time Updates**: Anlık veri güncellemeleri
- **Loading States**: Kullanıcı deneyimi için yükleme göstergeleri
- **Error Handling**: Kapsamlı hata yönetimi

## 🚀 Build ve Deploy

### Production Build
```bash
npm run build
npm start
```

### Vercel Deploy
```bash
npm install -g vercel
vercel
```

## 📱 Mobil Uygulama

Bu web uygulaması, React Native ile geliştirilmiş [HealthTracker Doctors Mobile](https://github.com/team-bitirme/HealthTracker-Doctors-main) uygulamasının web versiyonudur.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Team

**Team Bitirme** - Sağlık teknolojileri alanında yenilikçi çözümler geliştiren bir ekip.

## 📞 İletişim

Proje hakkında sorularınız için GitHub Issues kullanabilirsiniz.

---

**Not**: Bu uygulama eğitim amaçlı geliştirilmiştir ve gerçek tıbbi kullanım için uygun değildir.
