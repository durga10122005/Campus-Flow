# CampusFlow - Academic & Attendance Companion 📱

CampusFlow is a mobile application built with **React Native & Expo**, engineered according to your **Google Stitch** design project: [CampusFlow Attendance Dashboard](https://stitch.withgoogle.com/projects/9241095504497739707).

---

## 🎨 Design System & Aesthetics
- **Theme**: *Functional Academic Precision* (Ultra-clean Swiss utility aesthetic rooted in Dieter Rams' principles)
- **Primary Color**: `#006948` (Deep Forest Emerald)
- **Canvas / Background**: `#F8F9FF` (Architectural light canvas)
- **Ink / Typography**: `#0B1C30` (High-contrast deep slate)
- **Warning & Critical Accents**: `#825100` (Amber caution) & `#BA1A1A` (Shortage critical)

---

## 📱 Included Screens & Features

### 1. 📅 Today (Live Overview)
- **Morning Brief Banner**: 8:00 AM daily risk summary with single-tap dismissal.
- **"Happening Now" Hero Widget**:
  - Live indicator badge with pulsing emerald indicator.
  - Active course (`Operating Systems Lab`), 2× lab credit, room `LAB 402`, professor, building wing.
  - Real-time segmented progress tracker (`58m elapsed`, `32m remaining`).
  - **One-handed Attendance Action Bar**: Instant interactive buttons (`Present`, `Absent`, `Cancelled`) with live attendance counter updates.
- **"Next Up" Live Route Card**: Next class countdown (`in 15m`), room `LEC HALL 2`, walking directions shortcut.
- **Smart Bunk & Attendance Health Carousel**: Horizontal swipeable course cards with Safe Zone, Margin Caution, and Shortage Warning indicators.
- **Today's Timeline Peek**: Compact class schedule with status badges.

### 2. 🗓️ Timetable (Class Schedule)
- **Day / Week View Toggle**.
- **Interactive Horizontal Weekday Selector** (`MON 28` to `SAT 03`) with active class counts.
- **Free Window Detection Banner**: Highlights study/lunch windows (e.g. `1h 15m` free window for Central Library).
- **Detailed Timeline Slots**: Room codes, wing locations, professors, lab multipliers, and active live indicators.

### 3. 🧮 Bunk Calculator (What-If Simulator)
- **75% Rule Compliance Indicator**: Real-time aggregate status (`81.4%` standing) and buffer metric (`+14 Safe Bunks`).
- **Circular SVG Attendance Meter**: Custom visual gauge showing cushion above the university threshold.
- **Interactive What-If Simulator**:
  - Course selector pills (`Engineering Chemistry 68.0%`, `Computer Networks 82.5%`, `OS Lab 77.8%`, etc.).
  - Interactive class attendance steppers (`-` / `+`) and slider.
  - Live prediction calculation using the formula: `(Attended + x) / (Total + x) ≥ 0.75`.
  - Immediate shortage deficit and safe bunks capacity calculations.
- **Subject Health Matrix**: Breakdown for every enrolled subject with compliance buffer analysis.

### 4. 📝 Tasks & Assignments
- **Overview & Statistics**: Pending deliverables count and quick status filter chips (`All`, `Urgent`, `This Week`, `Completed`).
- **Search Bar**: Live search across course codes, topics, and descriptions.
- **Due within 48 Hours Cards**: Alarm countdown timer pills, milestone checklist progress bar (`75%`), study group partner badges.
- **Status Toggle**: One-tap toggle between `Submitted` and `Pending`.
- **New Task Modal**: Interactive form to add custom assignments, rubrics, weightages, and due dates.

### 5. 👤 Profile & Institutional Settings
- **Student ID Card**: Name (`Durga Prasad`), Roll No (`22CS084`), Semester 5 CS, CGPA (`8.74`), Overall attendance (`81.4%`).
- **Customizable Attendance Policy**: Toggle the university threshold between `70%`, `75%`, `80%`, and `85%`.
- **Smart Notification Switches**: Morning briefs, critical shortage alerts, and walking route prompts.
- **Academic Export Actions**: Export attendance certificate PDF, sync timetable to Calendar (ICS), and University ERP sync.

---

## 🚀 How to Run the App

### Option A: Run on Mobile Device (iOS or Android)
1. Install the **Expo Go** app from the App Store (iOS) or Google Play Store (Android).
2. Start the development server:
   ```bash
   npm run start
   ```
3. Scan the QR code displayed in the terminal with your phone camera (iOS) or inside the Expo Go app (Android).

### Option B: Run in Web Browser
To preview the mobile layout in your desktop or mobile browser:
```bash
npm run web
```

### Option C: Run in Android / iOS Emulator
```bash
# Android Studio Emulator
npm run android

# macOS Xcode iOS Simulator
npm run ios
```
