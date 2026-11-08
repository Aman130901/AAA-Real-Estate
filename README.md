# AAA Real Estate 🏡✨

> Modern, high-performance real estate web portal featuring an interactive 3D architectural villa, buttery-smooth Lenis scrolling, advanced property search, and instant WhatsApp enquiry integration.

![AAA Real Estate Preview]([assets/hero.jpg])

---

## 🌟 Key Features

### 🎮 1. Interactive 3D Villa (Three.js & OrbitControls)
- Fully procedural 3D modern luxury villa rendered via WebGL.
- OrbitControls for smooth 360° mouse drag, touch swipe rotation, and pinch-to-zoom.
- Dynamic floating trust badges (*4.9/5 Rating* and *RERA Verified*).
- One-click camera reset and auto-rotation toggle.

### 🌊 2. Ultra-Smooth Lenis Scrolling
- Smooth inertial scrolling on both desktop and mobile devices using Lenis.
- Anchor links automatically calculate fixed header offset for seamless navigation.

### 📱 3. Responsive Grid & List View Toggle
- **Grid View (▦)**: Responsive 2-column card layout on mobile, 3-column on desktop.
- **List View (☰)**: Compact horizontal row layout with high-density details.
- Fully synchronized filter controls across mobile and desktop breakpoints.

### 🔍 4. Advanced Property Search & Filtering
- Filter across **Buy**, **Rent**, and **Commercial** properties.
- Dynamic search by City/Location (Mumbai, Bandra, BKC, Worli, etc.), BHK count, Property Type, and Budget range.
- Real-time URL query parameter synchronization, active filter chips, and sorting.

### 💬 5. Direct WhatsApp Support & Enquiry
- Floating quick-contact modal supporting dual WhatsApp enquiry numbers:
  - 📞 **+91 99679 81427**
  - 📞 **+91 70216 50366**
- Pre-filled custom property messages sent directly via WhatsApp API.

### 🧮 6. Integrated Financial Tools & Utilities
- **EMI Calculator**: Calculate monthly instalments, total interest, and loan amortization in real-time.
- **Property Comparison**: Compare up to 4 properties side-by-side.
- **Property Details Modal**: Deep-linkable `#property-<id>` modal with amenities, specs, and site visit booking.
- **Contact & Enquiry Section**: Validated lead capture form with instant pre-selection for buyers and sellers.

---

## 📂 Project Structure

```text
AAA-Real-Estate/
├── assets/                  # High-resolution property images and logos
│   ├── hero.jpg
│   ├── property-1.jpg
│   └── ...
├── index.html               # Semantic HTML5 markup (WCAG AA accessible)
├── style.css                # Core design system, CSS variables & typography
├── features.css             # Styles for 3D hero, filters, modal & calculators
├── script.js                # Core UI interactions & mobile navigation
├── features.js              # Property listing logic, filters, EMI & comparison
├── three-villa.js           # Three.js 3D Villa scene, lights & controls
├── smooth-scroll.js         # Lenis smooth scroll orchestration
├── lenis.min.js             # Lenis smooth scroll library
├── three.min.js             # Three.js library
├── OrbitControls.js         # OrbitControls library
└── README.md                # Documentation & GitHub Pages guide
```

---

## 🚀 Getting Started

Since the project is built with vanilla HTML/CSS/JS with zero build dependencies, you can run it immediately without `npm install`!

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/Aman130901/AAA-Real-Estate.git
   cd AAA-Real-Estate
   ```

2. Start a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Or using Node.js
   npx serve .
   ```

3. Open your browser at `http://localhost:8000`.

---

## 🌐 Deploy to GitHub Pages (1-Click)

1. Open your repository on GitHub: [https://github.com/Aman130901/AAA-Real-Estate](https://github.com/Aman130901/AAA-Real-Estate)
2. Go to **Settings** > **Pages** (in the left sidebar).
3. Under **Branch**, select `main` and folder `/ (root)`.
4. Click **Save**.
5. Your live site will be deployed at:
   `https://aman130901.github.io/AAA-Real-Estate/`

---

## 📜 License

Created for **AAA Real Estate**. All rights reserved.
