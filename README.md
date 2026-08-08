# Habit Tracker & Multi-Tool Dashboard

A clean, modern 3-in-1 productivity dashboard combining:
1. **⚡ Habit Tracker**: Pastel week-grouped matrix, streak analysis, completion trend chart, and top habits ranking.
2. **📋 Task Planner**: Daily & weekly task management with priority tags (`Low`, `Medium`, `High`), due dates, and filter controls.
3. **💰 Yearly Budget Planner**: Monthly income, category expense comparison (Budget vs. Actual), and subscriptions tracking.
4. **✨ AI Monthly Insights**: Powered by Google Gemini 1.5 Flash API.
5. **📱 Progressive Web App (PWA) & Desktop Installer**: Standalone PWA installation and native desktop package releases.

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Development Server
```bash
npm run dev
```

---

## 🛠️ Turbopack Cache Troubleshooting

If you encounter Turbopack cache corruption errors (`Failed to restore task data` or `.next/dev/cache/...` errors):

Run the cache cleanup command:
```bash
npm run clean
```
Or for full node cache reset:
```bash
npm run clean:all
```
Then restart the development server:
```bash
npm run dev
```

---

## 📦 Production Build
```bash
npm run build
npm run start
```
