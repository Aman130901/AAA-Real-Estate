/**
 * AAA Real Estate — feature layer with full Admin Portal & CRUD Engine
 * Allows Administrator to list new apartments, update existing listings, delete, export,
 * and track customer leads & site visit enquiries in real-time.
 */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toast = (m) => (window.showToast ? window.showToast(m) : alert(m));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };

  /* ===== CONFIG ===== */
  const BUSINESS_WHATSAPP = '919967981427'; // Primary WhatsApp
  const BUSINESS_WHATSAPP_2 = '917021650366'; // Secondary WhatsApp
  const CITIES = ['Mumbai', 'Worli', 'Worli Sea Face', 'Prabhadevi', 'South Mumbai'];
  const TYPES = ['Apartment', 'Luxury Residence', 'Penthouse', 'Villa', 'Commercial'];
  const BUDGETS = {
    buy: [2e7, 5e7, 1e8, 2.5e8, 5e8, 1e9],
    rent: [100000, 200000, 350000, 500000, 800000],
    commercial: [3e7, 5e7, 8e7, 1.5e8],
  };
  const PAGE_SIZE = 9;

  /* ===== REAL MAHARERA VERIFIED PROPERTIES PORTFOLIO ===== */
  const DEFAULT_PROPS = [
    {"id": 1, "title": "Lodha Park – Adrina", "developer": "Lodha Group", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Pandurang Budhkar Marg, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1136, "price": 75000000, "priceStr": "₹7.50–19 Cr", "psf": "₹67,783", "furn": "Semi-furnished", "poss": "Jun 2026", "status": "Ready / possession listed", "img": "assets/rec-1.jpg", "amen": ["Sea View", "Infinity Pool", "Clubhouse", "Private Elevator", "24x7 Security", "Gym"], "rera": "P51900014937", "floors": "Tower-specific; verify", "notes": "MPE lists ready; verify OC and phase-specific RERA before treating as RTMI.", "added": 2, "config": "3 BHK"},
    {"id": 2, "title": "Lodha Trump Tower", "developer": "Lodha Group", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1312, "price": 130000000, "priceStr": "~₹13 Cr", "psf": "₹96,850", "furn": "Semi-furnished", "poss": "Jun 2026", "status": "Ready / possession listed", "img": "assets/rec-2.jpg", "amen": ["Arabian Sea Facing", "Sky Lounge", "Concierge", "Valet Parking", "Spa & Sauna", "Clubhouse"], "rera": "P51900014937", "floors": "78 floors (listing)", "notes": "Confirm actual OC and unit availability; advertised rate may differ from resale ask.", "added": 3, "config": "3 BHK"},
    {"id": 3, "title": "The Imperial Worli", "developer": "D&A Realty", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli Sea Face", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 1060000000, "priceStr": "~₹106 Cr", "psf": "₹160,000", "furn": "Luxury Unfurnished", "poss": "2027 (MPE); RERA record 30 Oct 2028", "status": "Under construction (listing)", "img": "assets/rec-3.jpg", "amen": ["Panoramic Sea Deck", "Heated Pool", "Gymnasium", "Tennis Court", "Banquet Hall", "Security"], "rera": "P51900076737", "floors": "High-rise; listing details vary", "notes": "Large-ticket listing; verify residential configuration and exact registered promoter/project.", "added": 4, "config": "3 BHK"},
    {"id": 4, "title": "Nishika Elysium", "developer": "Avighna India Ltd.", "mode": "buy", "type": "Penthouse", "city": "Mumbai", "locality": "Worli Sea Face", "pin": "400018", "bhk": 5, "bath": 5, "carpet": 1500, "price": 710000000, "priceStr": "~₹71 Cr", "psf": "₹129,091", "furn": "Luxury Unfurnished", "poss": "Dec 2027 (listing); RERA status requires cross-check", "status": "Under construction (listing)", "img": "assets/site-visit.jpg", "amen": ["Private Foyer", "Landscaped Gardens", "Olympic Size Pool", "Smart Home Automation", "Power Backup"], "rera": "P51900050965", "floors": "18 floors (listing)", "notes": "GharKundli pincode table lists completed, while portal listing says under construction: resolve phase/OC directly on MahaRERA.", "added": 5, "config": "5 BHK"},
    {"id": 5, "title": "Aakasa", "developer": "Techno Fresh World LLP", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Adarsh Nagar / New Prabhadevi Road, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1300, "price": 110500000, "priceStr": "₹11.05–26.10 Cr", "psf": "₹85,000", "furn": "Luxury Unfurnished", "poss": "Dec 2027 (listing)", "status": "Under construction", "img": "assets/hero-visual.png", "amen": ["High-rise Observatory", "Private Plunge Pool", "Business Lounge", "Fine Dining Cafe", "Concierge"], "rera": "P51900050463", "floors": "34 floors (listing)", "notes": "Possession from listing; confirm current RERA extension and tower-wise inventory.", "added": 6, "config": "3 BHK"},
    {"id": 6, "title": "Hubtown Celeste", "developer": "Hubtown Limited", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "B.G. Kher Road, Worli", "pin": "400018", "bhk": 2, "bath": 2, "carpet": 330, "price": 19800000, "priceStr": "₹1.98–3.96 Cr", "psf": "₹60,000", "furn": "Luxury Unfurnished", "poss": "Dec 2027 (listing); RERA due 30 Nov 2029", "status": "Under construction", "img": "assets/hero-house.png", "amen": ["Sea View", "Infinity Pool", "Clubhouse", "Private Elevator", "24x7 Security", "Gym"], "rera": "P51900008925", "floors": "27 floors (listing)", "notes": "RERA aggregator reports 30 Nov 2029; use RERA date over marketing/listing date.", "added": 7, "config": "2 BHK"},
    {"id": 7, "title": "Worli House", "developer": "Avighna India Ltd.", "mode": "buy", "type": "Villa", "city": "Mumbai", "locality": "B.G. Kher Road, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 300000000, "priceStr": "₹30–68 Cr", "psf": "₹109,855", "furn": "Luxury Unfurnished", "poss": "Dec 2028 (listing); RERA due 30 Apr 2029", "status": "Under construction (listing)", "img": "assets/hero-right.png", "amen": ["Arabian Sea Facing", "Sky Lounge", "Concierge", "Valet Parking", "Spa & Sauna", "Clubhouse"], "rera": "P51900051378", "floors": "30 floors (listing)", "notes": "Cross-check exact use classification: one portal labels commercial; do not assume residential stock without promoter confirmation.", "added": 8, "config": "3 BHK"},
    {"id": 8, "title": "Kabra Dvayam", "developer": "Kabra Group", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Dr. R. Thadani Marg, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1600, "price": 180000000, "priceStr": "₹18–28 Cr", "psf": "₹115,749", "furn": "Luxury Unfurnished", "poss": "Dec 2029 (listing); RERA due 30 Apr 2030", "status": "Under construction", "img": "assets/rec-1.jpg", "amen": ["Panoramic Sea Deck", "Heated Pool", "Gymnasium", "Tennis Court", "Banquet Hall", "Security"], "rera": "P51900078546", "floors": "27 floors (listing)", "notes": "Use latest RERA date for formal schedule.", "added": 9, "config": "3 BHK"},
    {"id": 9, "title": "Raheja The Riviere", "developer": "Raheja Universal Ltd.", "mode": "buy", "type": "Luxury Residence", "city": "Mumbai", "locality": "Peninsula Corporate Park vicinity, Worli", "pin": "400018", "bhk": 4, "bath": 4, "carpet": 1599, "price": 99900000, "priceStr": "₹9.99–24.99 Cr", "psf": "₹65,128", "furn": "Luxury Unfurnished", "poss": "Dec 2029 (listing)", "status": "Under construction", "img": "assets/rec-2.jpg", "amen": ["Private Foyer", "Landscaped Gardens", "Olympic Size Pool", "Smart Home Automation", "Power Backup"], "rera": "P51900032251", "floors": "66 floors (listing)", "notes": "Some portals show different carpet/price bands; unit-specific quote required.", "added": 10, "config": "4 BHK"},
    {"id": 10, "title": "Birla Niyaara", "developer": "Birla Estates Pvt. Ltd.", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Century Mills, Worli", "pin": "400018", "bhk": 2, "bath": 2, "carpet": 1500, "price": 84500000, "priceStr": "₹8.45 Cr onward; premium inventory to ₹44.34 Cr+", "psf": "₹99,520 avg (Housing listing); ₹117,426 listing for 6 BHK", "furn": "Luxury Unfurnished", "poss": "Mar 2028 (Housing Phase 1 listing); Mar 2029 (other listing)", "status": "Under construction; phase-wise", "img": "assets/rec-3.jpg", "amen": ["High-rise Observatory", "Private Plunge Pool", "Business Lounge", "Fine Dining Cafe", "Concierge"], "rera": "P51900031916", "floors": "75–77 floors (phase/tower listing)", "notes": "Do not merge Phase 1, Aveero and Silas; verify each tower/phase RERA and current possession.", "added": 11, "config": "2 BHK"},
    {"id": 11, "title": "El Dorado", "developer": "Sarkar Group", "mode": "buy", "type": "Luxury Residence", "city": "Mumbai", "locality": "VB Worlikar Marg, Janata Colony / BPT Colony, Worli", "pin": "400018", "bhk": 4, "bath": 4, "carpet": 3000, "price": 330000000, "priceStr": "~₹33 Cr", "psf": "₹110,000", "furn": "Luxury Unfurnished", "poss": "Dec 2030", "status": "Under construction", "img": "assets/site-visit.jpg", "amen": ["Sea View", "Infinity Pool", "Clubhouse", "Private Elevator", "24x7 Security", "Gym"], "rera": "P51900079580", "floors": "40 floors (listing)", "notes": "Listing-level data; verify promoter, RERA and live inventory.", "added": 12, "config": "4 BHK"},
    {"id": 12, "title": "Runwal Raaya", "developer": "Runwal Realty", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Off Ganpatrao Kadam Marg, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1738, "price": 112899999, "priceStr": "₹11.29–32.94 Cr", "psf": "₹66,225", "furn": "Luxury Unfurnished", "poss": "Dec 2030", "status": "Under construction / new launch", "img": "assets/hero-visual.png", "amen": ["Arabian Sea Facing", "Sky Lounge", "Concierge", "Valet Parking", "Spa & Sauna", "Clubhouse"], "rera": "P51900080218", "floors": "73 floors (listing)", "notes": "Other portals show tower-specific carpet ranges; verify tower/wing and exact unit.", "added": 1, "config": "3 BHK"},
    {"id": 13, "title": "Godrej Trilogy Seafront", "developer": "Godrej Properties", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Dr. Annie Besant Road, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1749, "price": 230000000, "priceStr": "₹23–33.55 Cr", "psf": "₹126,137", "furn": "Luxury Unfurnished", "poss": "Dec 2031 (listing); RERA pincode source 30 Apr 2035", "status": "New launch / under construction", "img": "assets/hero-house.png", "amen": ["Panoramic Sea Deck", "Heated Pool", "Gymnasium", "Tennis Court", "Banquet Hall", "Security"], "rera": "PR1171012501309", "floors": "76 floors (listing)", "notes": "RERA aggregator date differs materially from listing; use latest official MahaRERA record.", "added": 2, "config": "3 BHK"},
    {"id": 14, "title": "Embassy India Bulls Blu – New Launch", "developer": "Embassy Developments", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "E. Moses Road, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1909, "price": 143100000, "priceStr": "₹14.31–27.33 Cr", "psf": "₹74,927", "furn": "Luxury Unfurnished", "poss": "Dec 2032", "status": "New launch / under construction", "img": "assets/hero-right.png", "amen": ["Private Foyer", "Landscaped Gardens", "Olympic Size Pool", "Smart Home Automation", "Power Backup"], "rera": "Phase RERA verify", "floors": "81 floors (listing)", "notes": "Confirm exact MahaRERA registration and phase naming before quoting.", "added": 3, "config": "3 BHK"},
    {"id": 15, "title": "Kalpataru Worli One", "developer": "Kalpataru Limited", "mode": "buy", "type": "Luxury Residence", "city": "Mumbai", "locality": "G.M. Bhosale Marg, Worli", "pin": "400018", "bhk": 4, "bath": 4, "carpet": 3562, "price": 360000000, "priceStr": "₹36–49 Cr", "psf": "₹102,123", "furn": "Luxury Unfurnished", "poss": "Mar 2032", "status": "Under construction / new launch", "img": "assets/rec-1.jpg", "amen": ["High-rise Observatory", "Private Plunge Pool", "Business Lounge", "Fine Dining Cafe", "Concierge"], "rera": "P51900055246", "floors": "~70 floors", "notes": "Listed under “Kalpataru One – Wing A” in pincode RERA register with due date 31 Jul 2032; confirm wing-specific date.", "added": 4, "config": "4 BHK"},
    {"id": 16, "title": "Prestige Nautilus", "developer": "Prestige Group", "mode": "buy", "type": "Luxury Residence", "city": "Mumbai", "locality": "Dr. Annie Besant Road, Worli", "pin": "400018", "bhk": 4, "bath": 4, "carpet": 1500, "price": 437500000, "priceStr": "₹43.75–90.03 Cr", "psf": "₹125,000", "furn": "Luxury Unfurnished", "poss": "Dec 2032", "status": "Under construction", "img": "assets/rec-2.jpg", "amen": ["Sea View", "Infinity Pool", "Clubhouse", "Private Elevator", "24x7 Security", "Gym"], "rera": "P51900009720", "floors": "60 floors (listing)", "notes": "Verify MahaRERA date and phase-specific unit sizes.", "added": 5, "config": "4 BHK"},
    {"id": 17, "title": "Embassy Citadel", "developer": "Embassy Developments", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Dr. Elijah Moses Road / Worli Naka", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1840, "price": 138000000, "priceStr": "₹13.80–40.39 Cr", "psf": "₹75,005", "furn": "Luxury Unfurnished", "poss": "Dec 2033 (listing); RERA due 30 Oct 2034", "status": "New launch / under construction", "img": "assets/rec-3.jpg", "amen": ["Arabian Sea Facing", "Sky Lounge", "Concierge", "Valet Parking", "Spa & Sauna", "Clubhouse"], "rera": "PR1170002501931", "floors": "81 floors (listing)", "notes": "MahaRERA pincode aggregator date later than marketing date; check latest extension.", "added": 6, "config": "3 BHK"},
    {"id": 18, "title": "Godrej Trilogy Seaturf", "developer": "Godrej Properties", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1560, "price": 149700000, "priceStr": "₹14.97–22.61 Cr (Housing listing)", "psf": "~₹95,000–96,000", "furn": "Luxury Unfurnished", "poss": "RERA due 30 Apr 2034", "status": "Under construction", "img": "assets/site-visit.jpg", "amen": ["Panoramic Sea Deck", "Heated Pool", "Gymnasium", "Tennis Court", "Banquet Hall", "Security"], "rera": "PR1171012501267", "floors": "76 floors (listing)", "notes": "Distinct from Seafront; verify phase-specific price, carpet and possession.", "added": 7, "config": "3 BHK"},
    {"id": 19, "title": "Lodha Adrina (Lodha Park)", "developer": "Lodha Group", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1136, "price": 75000000, "priceStr": "~₹7.5 Cr+", "psf": "~₹67,800+", "furn": "Luxury Unfurnished", "poss": "Integrated Lodha Park development", "status": "Under construction / phase status to verify", "img": "assets/hero-visual.png", "amen": ["Private Foyer", "Landscaped Gardens", "Olympic Size Pool", "Smart Home Automation", "Power Backup"], "rera": "P51900014937", "floors": "Lodha Park multi-tower", "notes": "Confirm tower RERA and possession", "added": 8, "config": "3 BHK"},
    {"id": 20, "title": "Lodha Marquise", "developer": "Lodha Group", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 115000000, "priceStr": "~₹11.5 Cr+ resale", "psf": "Unit-specific", "furn": "Semi-furnished", "poss": "Established Lodha Park tower", "status": "RTMI / resale; verify unit", "img": "assets/hero-house.png", "amen": ["High-rise Observatory", "Private Plunge Pool", "Business Lounge", "Fine Dining Cafe", "Concierge"], "rera": "Verify on MahaRERA", "floors": "Lodha Park tower", "notes": "Confirm live resale inventory", "added": 9, "config": "3 BHK"},
    {"id": 21, "title": "Lodha Kiara", "developer": "Lodha Group", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 127500000, "priceStr": "~₹12.75 Cr+ resale", "psf": "Unit-specific", "furn": "Semi-furnished", "poss": "Established Lodha Park tower", "status": "RTMI / resale; verify unit", "img": "assets/hero-right.png", "amen": ["Sea View", "Infinity Pool", "Clubhouse", "Private Elevator", "24x7 Security", "Gym"], "rera": "Verify on MahaRERA", "floors": "Lodha Park tower", "notes": "Confirm live resale inventory", "added": 10, "config": "3 BHK"},
    {"id": 22, "title": "Lodha Allura", "developer": "Lodha Group", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli", "pin": "400018", "bhk": 2, "bath": 2, "carpet": 1500, "price": 65000000, "priceStr": "~₹6.5 Cr+ resale", "psf": "Unit-specific", "furn": "Semi-furnished", "poss": "Established Lodha Park tower", "status": "RTMI / resale; verify unit", "img": "assets/rec-1.jpg", "amen": ["Arabian Sea Facing", "Sky Lounge", "Concierge", "Valet Parking", "Spa & Sauna", "Clubhouse"], "rera": "Verify on MahaRERA", "floors": "Lodha Park tower", "notes": "Confirm live resale inventory", "added": 11, "config": "2 BHK"},
    {"id": 23, "title": "Lodha Parkside", "developer": "Lodha Group", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli", "pin": "400018", "bhk": 2, "bath": 2, "carpet": 1500, "price": 70000000, "priceStr": "~₹7 Cr+ resale", "psf": "Unit-specific", "furn": "Semi-furnished", "poss": "Established Lodha Park tower", "status": "RTMI / resale; verify unit", "img": "assets/rec-2.jpg", "amen": ["Panoramic Sea Deck", "Heated Pool", "Gymnasium", "Tennis Court", "Banquet Hall", "Security"], "rera": "Verify on MahaRERA", "floors": "Lodha Park tower", "notes": "Confirm live resale inventory", "added": 12, "config": "2 BHK"},
    {"id": 24, "title": "Birla Niyaara – Aveero", "developer": "Birla Estates", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Century Mills, Worli", "pin": "400018", "bhk": 2, "bath": 2, "carpet": 849, "price": 64524, "priceStr": "On request", "psf": "~₹76K–1.10L indicative", "furn": "Luxury Unfurnished", "poss": "Integrated development; clubhouses", "status": "Under construction", "img": "assets/rec-3.jpg", "amen": ["Private Foyer", "Landscaped Gardens", "Olympic Size Pool", "Smart Home Automation", "Power Backup"], "rera": "P51900031916", "floors": "~G+77", "notes": "Tower-wise RERA possession and price to verify", "added": 1, "config": "2 BHK"},
    {"id": 25, "title": "Birla Niyaara – Silas", "developer": "Birla Estates", "mode": "buy", "type": "Luxury Residence", "city": "Mumbai", "locality": "Century Mills, Worli", "pin": "400018", "bhk": 4, "bath": 4, "carpet": 3028, "price": 230128, "priceStr": "On request", "psf": "~₹76K–1.10L+ indicative", "furn": "Luxury Unfurnished", "poss": "Large-format residences", "status": "Under construction / premium phase", "img": "assets/site-visit.jpg", "amen": ["High-rise Observatory", "Private Plunge Pool", "Business Lounge", "Fine Dining Cafe", "Concierge"], "rera": "Verify on MahaRERA", "floors": "~G+44", "notes": "Verify unit-level pricing and RERA phase", "added": 2, "config": "4 BHK"},
    {"id": 26, "title": "Three Sixty West", "developer": "Oberoi Realty", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Dr Annie Besant Road, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 720000000, "priceStr": "~₹72 Cr+ listing", "psf": "~₹1.30L listing indication", "furn": "Semi-furnished", "poss": "Four Seasons hospitality association", "status": "RTMI / resale", "img": "assets/hero-visual.png", "amen": ["Sea View", "Infinity Pool", "Clubhouse", "Private Elevator", "24x7 Security", "Gym"], "rera": "Verify on MahaRERA", "floors": "Twin high-rise towers", "notes": "Resale availability and exact unit pricing vary", "added": 3, "config": "3 BHK"},
    {"id": 27, "title": "Raheja Imperia", "developer": "Raheja Universal", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Shankar Rao Naram Path, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 114000000, "priceStr": "~₹11.4 Cr+ listing", "psf": "~₹65.5K listing indication", "furn": "Semi-furnished", "poss": "Established high-rise luxury project", "status": "Near possession / RTMI status verify by wing", "img": "assets/hero-house.png", "amen": ["Arabian Sea Facing", "Sky Lounge", "Concierge", "Valet Parking", "Spa & Sauna", "Clubhouse"], "rera": "RERA details verify", "floors": "~74 floors (listing)", "notes": "Check OC and wing-specific status", "added": 4, "config": "3 BHK"},
    {"id": 28, "title": "Omkar 1973", "developer": "Omkar Realtors", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Near Annie Besant Road, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1900, "price": 175000000, "priceStr": "~₹17.5 Cr example", "psf": "~₹92.1K example", "furn": "Semi-furnished", "poss": "Established high-rise resale competition", "status": "RTMI / resale", "img": "assets/hero-right.png", "amen": ["Panoramic Sea Deck", "Heated Pool", "Gymnasium", "Tennis Court", "Banquet Hall", "Security"], "rera": "Verify on MahaRERA", "floors": "Three high-rise towers", "notes": "Verify exact unit carpet and price", "added": 5, "config": "3 BHK"},
    {"id": 29, "title": "The Imperial (Worli listing)", "developer": "Developer attribution needs verification", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli Sea Face vicinity", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 1060000000, "priceStr": "~₹106 Cr+ listing", "psf": "~₹1.60L listing indication", "furn": "Semi-furnished", "poss": "Project identity and developer details need independent confirmation", "status": "Upcoming / proposed listing – verify", "img": "assets/rec-1.jpg", "amen": ["Private Foyer", "Landscaped Gardens", "Olympic Size Pool", "Smart Home Automation", "Power Backup"], "rera": "P51900076737", "floors": "High-rise proposed/listed", "notes": "Do not treat as verified launch until RERA/developer confirmation", "added": 6, "config": "3 BHK"},
    {"id": 30, "title": "Lodha Sea Face", "developer": "Lodha Group", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli Sea Face", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 144000000, "priceStr": "On request", "psf": "On request", "furn": "Luxury Unfurnished", "poss": "Newly registered Lodha project; separate from Lodha Park towers", "status": "Under construction", "img": "assets/rec-2.jpg", "amen": ["High-rise Observatory", "Private Plunge Pool", "Business Lounge", "Fine Dining Cafe", "Concierge"], "rera": "P51900053592", "floors": "Tower details to verify", "notes": "RERA P51900053592; declared completion Feb 2029; verify official record", "added": 7, "config": "3 BHK"},
    {"id": 31, "title": "Lodha Worli Residential Project", "developer": "Lodha Group", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 144000000, "priceStr": "Not published", "psf": "Not published", "furn": "Semi-furnished", "poss": "Newly registered project; launch/inventory details not confirmed", "status": "Upcoming / newly registered", "img": "assets/rec-3.jpg", "amen": ["Sea View", "Infinity Pool", "Clubhouse", "Private Elevator", "24x7 Security", "Gym"], "rera": "PR1170002502174", "floors": "Not published", "notes": "RERA PR1170002502174; declared completion Oct 2033 in aggregator", "added": 8, "config": "3 BHK"},
    {"id": 32, "title": "Promina", "developer": "Lodha Group", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 144000000, "priceStr": "Not published", "psf": "Not published", "furn": "Semi-furnished", "poss": "Newly registered project; public unit details not confirmed", "status": "Upcoming / newly registered", "img": "assets/site-visit.jpg", "amen": ["Arabian Sea Facing", "Sky Lounge", "Concierge", "Valet Parking", "Spa & Sauna", "Clubhouse"], "rera": "PC1170002501811", "floors": "Not published", "notes": "RERA PC1170002501811; declared completion Oct 2032; source notes extension", "added": 9, "config": "3 BHK"},
    {"id": 33, "title": "Casadel", "developer": "Adishakti Associates", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 144000000, "priceStr": "Not published", "psf": "Not published", "furn": "Luxury Unfurnished", "poss": "Newly registered project; no reliable public price/area data found", "status": "Upcoming / under construction", "img": "assets/hero-visual.png", "amen": ["Panoramic Sea Deck", "Heated Pool", "Gymnasium", "Tennis Court", "Banquet Hall", "Security"], "rera": "PR1170002602564", "floors": "Not published", "notes": "RERA PR1170002602564; declared completion Dec 2029", "added": 10, "config": "3 BHK"},
    {"id": 34, "title": "DB Turf View", "developer": "Developer / promoter verify", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 144000000, "priceStr": "Not published", "psf": "Not published", "furn": "Semi-furnished", "poss": "Project listed among 2026 handovers", "status": "Near possession (RERA date Dec 2026; verify OC)", "img": "assets/hero-house.png", "amen": ["Private Foyer", "Landscaped Gardens", "Olympic Size Pool", "Smart Home Automation", "Power Backup"], "rera": "Verify on MahaRERA", "floors": "Not published", "notes": "Confirm promoter, RERA ID, completion and OC", "added": 11, "config": "3 BHK"},
    {"id": 35, "title": "THE Xclusiv", "developer": "Developer / promoter verify", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 144000000, "priceStr": "Not published", "psf": "Not published", "furn": "Semi-furnished", "poss": "Project listed among 2026 handovers", "status": "Near possession (RERA date Dec 2026; verify OC)", "img": "assets/hero-right.png", "amen": ["High-rise Observatory", "Private Plunge Pool", "Business Lounge", "Fine Dining Cafe", "Concierge"], "rera": "Verify on MahaRERA", "floors": "Not published", "notes": "Confirm promoter, RERA ID, completion and OC", "added": 12, "config": "3 BHK"},
    {"id": 36, "title": "THE Legacy", "developer": "Developer / promoter verify", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 144000000, "priceStr": "Not published", "psf": "Not published", "furn": "Semi-furnished", "poss": "Project listed among early handovers", "status": "Near possession (RERA date Mar 2027; verify OC)", "img": "assets/rec-1.jpg", "amen": ["Sea View", "Infinity Pool", "Clubhouse", "Private Elevator", "24x7 Security", "Gym"], "rera": "Verify on MahaRERA", "floors": "Not published", "notes": "Confirm promoter, RERA ID, completion and OC", "added": 1, "config": "3 BHK"},
    {"id": 37, "title": "Marina Bay Worli Sea Face", "developer": "Sugee Group (verify promoter)", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli Sea Face", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 150000000, "priceStr": "Resale / on request", "psf": "Unit-specific", "furn": "Semi-furnished", "poss": "Completion date passed in source register; possession/OC not established by date alone", "status": "Near possession / completion date Sep 2026; verify OC", "img": "assets/rec-2.jpg", "amen": ["Arabian Sea Facing", "Sky Lounge", "Concierge", "Valet Parking", "Spa & Sauna", "Clubhouse"], "rera": "Verify exact phase RERA", "floors": "Tower details to verify", "notes": "Verify exact RERA record and OC", "added": 2, "config": "3 BHK"},
    {"id": 38, "title": "Parinee Eminence Phase 1", "developer": "Parinee Group (verify promoter)", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 144000000, "priceStr": "Not published", "psf": "Not published", "furn": "Semi-furnished", "poss": "Completion date passed in source register; verify actual handover", "status": "Near possession / completion date Mar 2026; verify OC", "img": "assets/rec-3.jpg", "amen": ["Panoramic Sea Deck", "Heated Pool", "Gymnasium", "Tennis Court", "Banquet Hall", "Security"], "rera": "Verify exact phase RERA", "floors": "Not published", "notes": "Verify RERA record and OC", "added": 3, "config": "3 BHK"},
    {"id": 39, "title": "Four Seasons Private Residences Phase 2", "developer": "Provenance Land", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Dr E Moses Road, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1500, "price": 150000000, "priceStr": "Resale / on request", "psf": "Unit-specific", "furn": "Semi-furnished", "poss": "Phase-level completion date reported; current resale stock only to be confirmed", "status": "RTMI / completion date Dec 2025; verify OC and stock", "img": "assets/site-visit.jpg", "amen": ["Private Foyer", "Landscaped Gardens", "Olympic Size Pool", "Smart Home Automation", "Power Backup"], "rera": "Verify phase RERA", "floors": "Tower details to verify", "notes": "Verify phase-specific RERA and OC", "added": 4, "config": "3 BHK"},
    {"id": 40, "title": "Birla Niyaara Phase 1", "developer": "Birla Estates", "mode": "buy", "type": "Apartment", "city": "Mumbai", "locality": "Century Mills, Worli", "pin": "400018", "bhk": 2, "bath": 2, "carpet": 1500, "price": 144000000, "priceStr": "On request", "psf": "Unit-specific", "furn": "Luxury Unfurnished", "poss": "Phase-specific RERA inventory", "status": "Under construction", "img": "assets/hero-visual.png", "amen": ["High-rise Observatory", "Private Plunge Pool", "Business Lounge", "Fine Dining Cafe", "Concierge"], "rera": "P51900031916", "floors": "~75–77 floors (tower-specific)", "notes": "RERA P51900031916; source-listed possession Mar 2029; confirm current RERA extension", "added": 5, "config": "2 BHK"},
    {"id": 41, "title": "Birla Niyaara Phase 2 / Silas", "developer": "Birla Estates", "mode": "buy", "type": "Luxury Residence", "city": "Mumbai", "locality": "Pandurang Budhkar Marg, Worli", "pin": "400018", "bhk": 4, "bath": 4, "carpet": 3028, "price": 375000000, "priceStr": "From ~₹37.5 Cr listing", "psf": "~₹1.25L listing", "furn": "Luxury Unfurnished", "poss": "Distinct premium tower/phase", "status": "Under construction", "img": "assets/hero-house.png", "amen": ["Sea View", "Infinity Pool", "Clubhouse", "Private Elevator", "24x7 Security", "Gym"], "rera": "Verify on MahaRERA", "floors": "~44 floors", "notes": "Verify phase-specific RERA, price and possession", "added": 6, "config": "4 BHK"},
    {"id": 42, "title": "Lodha Trump Tower (Luxury Lease)", "developer": "Lodha Group", "mode": "rent", "type": "Apartment", "city": "Mumbai", "locality": "Pandurang Budhkar Marg, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1340, "price": 350000, "priceStr": "₹3.5 L/mo", "psf": "₹261/mo", "furn": "Designer Furnished", "poss": "Immediate / Ready", "status": "Ready for Possession", "img": "assets/hero-right.png", "amen": ["Sea View", "Full Furnished", "Infinity Pool", "Concierge", "Valet Parking", "Housekeeping"], "rera": "P51900001339", "floors": "High-rise Tower", "notes": "Verified high-end residential lease", "added": 2, "config": "3 BHK"},
    {"id": 43, "title": "Lodha Allura Sea View (Furnished Lease)", "developer": "Lodha Group", "mode": "rent", "type": "Apartment", "city": "Mumbai", "locality": "Pandurang Budhkar Marg, Worli", "pin": "400018", "bhk": 2, "bath": 2, "carpet": 850, "price": 185000, "priceStr": "₹1.85 L/mo", "psf": "₹217/mo", "furn": "Designer Furnished", "poss": "Immediate / Ready", "status": "Ready for Possession", "img": "assets/rec-1.jpg", "amen": ["Sea View", "Full Furnished", "Infinity Pool", "Concierge", "Valet Parking", "Housekeeping"], "rera": "P51900001339", "floors": "High-rise Tower", "notes": "Verified high-end residential lease", "added": 2, "config": "2 BHK"},
    {"id": 44, "title": "Lodha Kiara High Floor Rental", "developer": "Lodha Group", "mode": "rent", "type": "Apartment", "city": "Mumbai", "locality": "Pandurang Budhkar Marg, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1250, "price": 290000, "priceStr": "₹2.9 L/mo", "psf": "₹232/mo", "furn": "Designer Furnished", "poss": "Immediate / Ready", "status": "Ready for Possession", "img": "assets/rec-2.jpg", "amen": ["Sea View", "Full Furnished", "Infinity Pool", "Concierge", "Valet Parking", "Housekeeping"], "rera": "P51900001339", "floors": "High-rise Tower", "notes": "Verified high-end residential lease", "added": 2, "config": "3 BHK"},
    {"id": 45, "title": "Three Sixty West Four Seasons Residence Lease", "developer": "Oberoi Realty", "mode": "rent", "type": "Apartment", "city": "Mumbai", "locality": "Dr Annie Besant Road, Worli", "pin": "400018", "bhk": 4, "bath": 4, "carpet": 3200, "price": 750000, "priceStr": "₹7.5 L/mo", "psf": "₹234/mo", "furn": "Designer Furnished", "poss": "Immediate / Ready", "status": "Ready for Possession", "img": "assets/rec-3.jpg", "amen": ["Sea View", "Full Furnished", "Infinity Pool", "Concierge", "Valet Parking", "Housekeeping"], "rera": "P51900000444", "floors": "High-rise Tower", "notes": "Verified high-end residential lease", "added": 2, "config": "4 BHK"},
    {"id": 46, "title": "Omkar 1973 Tower Skyplex Lease", "developer": "Omkar Realtors", "mode": "rent", "type": "Apartment", "city": "Mumbai", "locality": "Near Annie Besant Road, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1900, "price": 380000, "priceStr": "₹3.8 L/mo", "psf": "₹200/mo", "furn": "Designer Furnished", "poss": "Immediate / Ready", "status": "Ready for Possession", "img": "assets/site-visit.jpg", "amen": ["Sea View", "Full Furnished", "Infinity Pool", "Concierge", "Valet Parking", "Housekeeping"], "rera": "P51900000331", "floors": "High-rise Tower", "notes": "Verified high-end residential lease", "added": 2, "config": "3 BHK"},
    {"id": 47, "title": "Raheja Imperia Premium Lease", "developer": "Raheja Universal", "mode": "rent", "type": "Apartment", "city": "Mumbai", "locality": "Shankar Rao Naram Path, Worli", "pin": "400018", "bhk": 3, "bath": 3, "carpet": 1450, "price": 275000, "priceStr": "₹2.75 L/mo", "psf": "₹189/mo", "furn": "Designer Furnished", "poss": "Immediate / Ready", "status": "Ready for Possession", "img": "assets/hero-visual.png", "amen": ["Sea View", "Full Furnished", "Infinity Pool", "Concierge", "Valet Parking", "Housekeeping"], "rera": "P51900001089", "floors": "High-rise Tower", "notes": "Verified high-end residential lease", "added": 2, "config": "3 BHK"},
    {"id": 48, "title": "Worli House Commercial Corporate Suite", "developer": "Avighna India Ltd.", "mode": "commercial", "type": "Commercial", "city": "Mumbai", "locality": "B.G. Kher Road, Worli", "pin": "400018", "bhk": 0, "bath": 2, "carpet": 3200, "price": 48000000, "priceStr": "₹4.8 Cr", "psf": "₹15,000", "furn": "Bare Shell / Warm Shell", "poss": "Ready / Under Construction", "status": "Commercial Listing", "img": "assets/hero-house.png", "amen": ["Triple Height Lobby", "High-Speed Elevators", "Central AC", "Ample Parking", "Bespoke Concierge", "24x7 Power Backup"], "rera": "P51900051378", "floors": "Commercial High-Rise", "notes": "Premium grade-A commercial asset in prime Worli corridor", "added": 1, "config": "Commercial"},
    {"id": 49, "title": "Peninsula Business Park Corporate Floor", "developer": "Raheja Universal", "mode": "commercial", "type": "Commercial", "city": "Mumbai", "locality": "Peninsula Corporate Park vicinity, Worli", "pin": "400018", "bhk": 0, "bath": 2, "carpet": 5500, "price": 85000000, "priceStr": "₹8.5 Cr", "psf": "₹15,454", "furn": "Bare Shell / Warm Shell", "poss": "Ready / Under Construction", "status": "Commercial Listing", "img": "assets/hero-right.png", "amen": ["Triple Height Lobby", "High-Speed Elevators", "Central AC", "Ample Parking", "Bespoke Concierge", "24x7 Power Backup"], "rera": "P51900032251", "floors": "Commercial High-Rise", "notes": "Premium grade-A commercial asset in prime Worli corridor", "added": 1, "config": "Commercial"},
    {"id": 50, "title": "Century Mills High Street Commercial Retail", "developer": "Birla Estates", "mode": "commercial", "type": "Commercial", "city": "Mumbai", "locality": "Century Mills, Worli", "pin": "400018", "bhk": 0, "bath": 2, "carpet": 1800, "price": 32000000, "priceStr": "₹3.2 Cr", "psf": "₹17,777", "furn": "Bare Shell / Warm Shell", "poss": "Ready / Under Construction", "status": "Commercial Listing", "img": "assets/rec-1.jpg", "amen": ["Triple Height Lobby", "High-Speed Elevators", "Central AC", "Ample Parking", "Bespoke Concierge", "24x7 Power Backup"], "rera": "P51900031916", "floors": "Commercial High-Rise", "notes": "Premium grade-A commercial asset in prime Worli corridor", "added": 1, "config": "Commercial"},
    {"id": 51, "title": "Dr. E. Moses Road Executive IT/BFSI Suite", "developer": "Embassy Developments", "mode": "commercial", "type": "Commercial", "city": "Mumbai", "locality": "E-Moses Road, Worli", "pin": "400018", "bhk": 0, "bath": 2, "carpet": 4200, "price": 62000000, "priceStr": "₹6.2 Cr", "psf": "₹14,761", "furn": "Bare Shell / Warm Shell", "poss": "Ready / Under Construction", "status": "Commercial Listing", "img": "assets/rec-2.jpg", "amen": ["Triple Height Lobby", "High-Speed Elevators", "Central AC", "Ample Parking", "Bespoke Concierge", "24x7 Power Backup"], "rera": "PR1170002501931", "floors": "Commercial High-Rise", "notes": "Premium grade-A commercial asset in prime Worli corridor", "added": 1, "config": "Commercial"},
  ];

  // Load from persistent localStorage or initialize with default verified portfolio
  let PROPS = ls('aaa_props_db', null);
  if (!Array.isArray(PROPS) || PROPS.length === 0) {
    PROPS = JSON.parse(JSON.stringify(DEFAULT_PROPS));
    sv('aaa_props_db', PROPS);
  } else {
    // Sanitize any previously cached properties that had rental prices in locality
    let needsUpdate = false;
    PROPS.forEach((p) => {
      if (p.locality && (p.locality.includes('₹') || p.locality.includes('L/mo') || /^\d+/.test(p.locality))) {
        if (p.id === 42 || p.id === 43 || p.id === 44) { p.locality = 'Pandurang Budhkar Marg, Worli'; p.rera = 'P51900001339'; }
        else if (p.id === 45) { p.locality = 'Dr Annie Besant Road, Worli'; p.rera = 'P51900000444'; }
        else if (p.id === 46) { p.locality = 'Near Annie Besant Road, Worli'; p.rera = 'P51900000331'; }
        else if (p.id === 47) { p.locality = 'Shankar Rao Naram Path, Worli'; p.rera = 'P51900001089'; }
        else { p.locality = 'Worli, Mumbai'; }
        needsUpdate = true;
      }
    });
    if (needsUpdate) sv('aaa_props_db', PROPS);
  }

  const byId = (id) => PROPS.find((p) => p.id === +id);
  const fmt = (n, mode) => {
    if (mode === 'rent') return '₹' + n.toLocaleString('en-IN') + '/mo';
    const t = (v) => String(+v.toFixed(2));
    return n >= 1e7 ? '₹' + t(n / 1e7) + ' Cr' : '₹' + t(n / 1e5) + ' L';
  };
  const spec = (p) => (p.config || (p.bhk ? p.bhk + ' BHK' : p.type)) + ' · ' + p.carpet + ' sq ft';

  /* ===== STATE (URL query params) ===== */
  const D = { mode: 'buy', q: '', type: '', bhk: '', furn: '', max: '', sort: 'relevant', view: 'grid', saved: '', page: '1' };
  const F = { ...D };
  new URLSearchParams(location.search).forEach((v, k) => { if (k in D) F[k] = v.slice(0, 60); });
  if (!BUDGETS[F.mode]) F.mode = 'buy';
  let favs = ls('aaa_favs', []);
  let cmp = ls('aaa_cmp', []).filter((id) => byId(id));
  let token = 0;

  const grid = $('#recGrid');
  if (!grid) return;

  const opts = (arr, first) => `<option value="">${first}</option>` + arr.map((v) => `<option>${esc(v)}</option>`).join('');
  const budgetOpts = (mode) => '<option value="">Any budget</option>' + BUDGETS[mode].map((v) => `<option value="${v}">Up to ${fmt(v, mode)}</option>`).join('');
  $('#hsType').innerHTML = opts(TYPES, 'Any type');
  $('#lsType').innerHTML = opts(TYPES, 'Type');
  const cleanLocations = [...new Set([
    ...CITIES,
    ...PROPS.map((p) => p.locality),
    ...PROPS.map((p) => p.developer)
  ])].filter((v) => v && typeof v === 'string' && !v.includes('₹') && !v.includes('Cr') && !v.includes('L/mo') && !/^\d+/.test(v.trim()));
  if ($('#cityList')) $('#cityList').innerHTML = cleanLocations.map((v) => `<option value="${esc(v)}">`).join('');
  const lsSort = $('#lsSort');
  const lsPrice = document.createElement('select');
  lsPrice.id = 'lsPrice'; lsPrice.setAttribute('aria-label', 'Max price');
  lsSort.before(lsPrice);

  /* ===== CUSTOM LOCATION DROPDOWN LOGIC ===== */
  const locWrap = $('.loc-dropdown-wrapper');
  const hsQ = $('#hsQ');
  const locBtn = $('#locDropdownBtn');
  const locMenu = $('#locDropdownMenu');

  function renderLocMenu(filterText = '', forceAll = false) {
    if (!locMenu) return;
    const query = forceAll ? '' : (filterText || '').trim().toLowerCase();
    const filteredLocs = query
      ? cleanLocations.filter((loc) => loc.toLowerCase().includes(query))
      : cleanLocations;

    if (filteredLocs.length === 0) {
      locMenu.innerHTML = `<div class="loc-dropdown-empty">No locations matching "${esc(filterText)}"</div>`;
      return;
    }

    const currentVal = (hsQ?.value || '').trim().toLowerCase();
    let html = '';

    if (currentVal) {
      html += `<div class="loc-dropdown-item" data-val="" style="color:var(--color-coral);font-weight:700;border-bottom:1px solid #E2E8F0;">
        <span class="loc-item-icon">✕</span> Clear location filter (Any location)
      </div>`;
    }

    html += `<div class="loc-dropdown-header">All Available Locations &amp; Developers (${filteredLocs.length})</div>`;

    html += filteredLocs.map((loc) => {
      const isSelected = loc.toLowerCase() === currentVal;
      return `<div class="loc-dropdown-item ${isSelected ? 'active' : ''}" data-val="${esc(loc)}" role="option" aria-selected="${isSelected}">
        <span class="loc-item-icon">📍</span>
        <span>${esc(loc)}</span>
      </div>`;
    }).join('');

    locMenu.innerHTML = html;
  }

  function toggleLocDropdown(forceState) {
    if (!locWrap) return;
    const willOpen = typeof forceState === 'boolean' ? forceState : !locWrap.classList.contains('open');
    if (willOpen) {
      // Whenever clicking dropdown arrow: ALWAYS SHOW ALL LOCATIONS!
      renderLocMenu('', true);
      locWrap.classList.add('open');
      if (hsQ) hsQ.setAttribute('aria-expanded', 'true');
    } else {
      locWrap.classList.remove('open');
      if (hsQ) hsQ.setAttribute('aria-expanded', 'false');
    }
  }

  if (locBtn && hsQ && locMenu) {
    // Click arrow button: ALWAYS show ALL available locations
    locBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleLocDropdown();
      hsQ.focus();
    });

    // Clicking into the input box: open dropdown and show all locations
    hsQ.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!locWrap.classList.contains('open')) {
        toggleLocDropdown(true);
      }
    });

    // Typing in the input box: filter locations in real-time
    hsQ.addEventListener('input', () => {
      renderLocMenu(hsQ.value, false);
      if (!locWrap.classList.contains('open')) {
        locWrap.classList.add('open');
        hsQ.setAttribute('aria-expanded', 'true');
      }
    });

    // Selecting an item in dropdown
    locMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.loc-dropdown-item');
      if (!item) return;
      const val = item.dataset.val || '';
      hsQ.value = val;
      toggleLocDropdown(false);
    });

    // Click outside: close dropdown
    document.addEventListener('click', (e) => {
      if (locWrap && locWrap.classList.contains('open') && !locWrap.contains(e.target)) {
        toggleLocDropdown(false);
      }
    });

    // Escape key: close dropdown
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && locWrap && locWrap.classList.contains('open')) {
        toggleLocDropdown(false);
      }
    });
  }

  /* ===== RENDER ===== */
  function syncURL() {
    const u = new URLSearchParams();
    Object.keys(D).forEach((k) => { if (F[k] !== D[k]) u.set(k, F[k]); });
    history.replaceState(null, '', (u.toString() ? '?' + u : location.pathname) + location.hash);
  }
  function filtered() {
    const q = F.q.trim().toLowerCase();
    const r = PROPS.filter((p) =>
      p.mode === F.mode &&
      (!q || (p.city + ' ' + p.locality + ' ' + p.pin + ' ' + p.title + ' ' + p.developer + ' ' + (p.rera || '')).toLowerCase().includes(q)) &&
      (!F.type || p.type === F.type) &&
      (!F.bhk || (F.bhk === '5' ? p.bhk >= 5 : F.bhk === '4' ? p.bhk === 4 : p.bhk === +F.bhk)) &&
      (!F.furn || p.furn === F.furn) &&
      (!F.max || p.price <= +F.max) &&
      (!F.saved || favs.includes(p.id)));
    const s = { plh: (a, b) => a.price - b.price, phl: (a, b) => b.price - a.price, new: (a, b) => a.added - b.added };
    if (s[F.sort]) r.sort(s[F.sort]);
    return r;
  }
  function cardHTML(p) {
    const f = favs.includes(p.id);
    const badgeText = p.status ? p.status.split('/')[0].split('(')[0].trim() : 'MahaRERA';
    const displayPrice = p.priceStr || fmt(p.price, p.mode);
    return `<article class="property-card" data-id="${p.id}" tabindex="0" role="button" aria-label="View details for ${esc(p.title)}" style="cursor:pointer;">
      <div class="property-image-box" data-act="view" style="cursor:pointer;" title="Click to view details">
        <img src="${p.img}" alt="${esc(p.title)}" class="property-img" loading="lazy" width="400" height="260" data-act="view">
        <div class="property-badge">${esc(badgeText)}</div>
        <button type="button" class="fav${f ? ' on' : ''}" data-act="fav" aria-pressed="${f}" aria-label="${f ? 'Remove from' : 'Add to'} saved">${f ? '♥' : '♡'}</button>
      </div>
      <div class="property-details">
        <div class="property-meta-row"><span class="rooms-count">${esc(spec(p))}</span><span class="price-tag"><strong class="price-val">${esc(displayPrice)}</strong></span></div>
        <h3 class="property-title" data-act="view" style="cursor:pointer;" title="Click to view details">${esc(p.title)}</h3>
        <p class="property-subtext">📍 ${esc(p.locality)} · <strong>${esc(p.developer)}</strong></p>
        <div class="card-actions"><button type="button" class="link-btn" data-act="view">View details</button>
          <label class="cmp"><input type="checkbox" data-act="cmp" ${cmp.includes(p.id) ? 'checked' : ''}> Compare</label></div>
      </div></article>`;
  }
  function render(skeleton) {
    const my = ++token;
    syncURL();
    $$('#lsMode button').forEach((b) => { const a = b.dataset.mode === F.mode; b.classList.toggle('active', a); b.setAttribute('aria-selected', a ? 'true' : 'false'); });
    $$('.view-toggle button').forEach((b) => b.classList.toggle('active', b.dataset.view === F.view));
    lsPrice.innerHTML = budgetOpts(F.mode);
    $('#lsQ').value = F.q; $('#lsType').value = F.type; $('#lsBhk').value = F.bhk; $('#lsFurn').value = F.furn;
    lsPrice.value = F.max; lsSort.value = F.sort; $('#lsSaved').checked = !!F.saved;
    grid.classList.toggle('list-view', F.view === 'list');
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const page = Math.min(Math.max(1, +F.page || 1), pages);
    F.page = String(page);
    const show = () => {
      if (my !== token) return;
      grid.setAttribute('aria-busy', 'false');
      grid.innerHTML = list.length
        ? list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(cardHTML).join('')
        : `<div class="empty"><h3>No properties match your search</h3><p>Try removing a filter or explore popular localities:</p>
           <div>${['Worli', 'Worli Sea Face', 'Century Mills', 'Lodha'].map((c) => `<button type="button" class="chip" data-city="${esc(c)}">${esc(c)}</button>`).join('')}</div>
           <button type="button" class="btn-coral-lg" data-act="clear">Clear all filters</button></div>`;
    };
    $('#resultCount').textContent = `${list.length} ${list.length === 1 ? 'property' : 'properties'} found`;
    if (skeleton && !RM) {
      grid.setAttribute('aria-busy', 'true');
      grid.innerHTML = '<div class="property-card skel"></div>'.repeat(3);
      setTimeout(show, 250);
    } else show();
    chips(); pager(pages, page); extras(); cmpBar(); updateStatsCounter();
  }
  function chips() {
    const L = [];
    if (F.q) L.push(['q', '“' + esc(F.q) + '”']);
    if (F.type) L.push(['type', esc(F.type)]);
    if (F.bhk) L.push(['bhk', esc(F.bhk) + ' BHK']);
    if (F.furn) L.push(['furn', esc(F.furn)]);
    if (F.max) L.push(['max', 'Up to ' + fmt(+F.max, F.mode)]);
    if (F.saved) L.push(['saved', 'Saved only']);
    $('#chips').innerHTML = L.map(([k, t]) => `<button type="button" class="chip" data-chip="${k}">${t} ✕</button>`).join('') +
      (L.length ? '<button type="button" class="chip clear" data-act="clear">Clear all</button><button type="button" class="chip save" data-act="savesearch">★ Save this search</button>' : '');
  }
  function pager(pages, page) {
    const el = $('#pager');
    if (pages < 2) { el.innerHTML = ''; return; }
    let h = `<button ${page < 2 ? 'disabled' : ''} data-page="${page - 1}">‹ Prev</button>`;
    for (let i = 1; i <= pages; i++) h += `<button class="${i === page ? 'active' : ''}" data-page="${i}" ${i === page ? 'aria-current="page"' : ''}>${i}</button>`;
    el.innerHTML = h + `<button ${page >= pages ? 'disabled' : ''} data-page="${page + 1}">Next ›</button>`;
  }
  function extras() {
    let el = $('#extras');
    if (!el) { el = document.createElement('div'); el.id = 'extras'; $('#pager').after(el); }
    const rec = ls('aaa_recent', []).map(byId).filter(Boolean);
    const ss = ls('aaa_searches', []);
    el.innerHTML = (rec.length ? `<h3>Recently viewed</h3><div class="mini-row">${rec.map((p) => `<button type="button" class="mini" data-open="${p.id}"><img src="${p.img}" alt="" width="64" height="48" loading="lazy"><span>${esc(p.title)}<br><b>${p.priceStr || fmt(p.price, p.mode)}</b></span></button>`).join('')}</div>` : '') +
      (ss.length ? `<h3>Saved searches</h3><div>${ss.map((s, i) => `<span class="chip"><button type="button" data-ss="${i}">${esc(s.label)}</button> <button type="button" data-ssdel="${i}" aria-label="Delete saved search">✕</button></span>`).join('')}</div>` : '');
  }

  /* ===== FILTER EVENTS ===== */
  const set = (k, v) => { F[k] = v; F.page = '1'; render(true); };
  $('#lsMode').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { F.max = ''; set('mode', b.dataset.mode); } });
  let qt; $('#lsQ').addEventListener('input', (e) => { clearTimeout(qt); qt = setTimeout(() => set('q', e.target.value.slice(0, 60)), 300); });
  [['lsType', 'type'], ['lsBhk', 'bhk'], ['lsFurn', 'furn'], ['lsSort', 'sort']].forEach(([id, k]) => $('#' + id).addEventListener('change', (e) => set(k, e.target.value)));
  lsPrice.addEventListener('change', (e) => set('max', e.target.value));
  $('#lsSaved').addEventListener('change', (e) => set('saved', e.target.checked ? '1' : ''));
  $('.view-toggle').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { F.view = b.dataset.view; render(); } });
  $('#pager').addEventListener('click', (e) => { const b = e.target.closest('[data-page]'); if (b) { F.page = b.dataset.page; render(true); $('#recommendations').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); } });
  const clearAll = () => { const m = F.mode; Object.assign(F, D, { mode: m }); render(true); };
  const savedSearch = () => {
    const u = new URLSearchParams(); Object.keys(D).forEach((k) => { if (F[k] !== D[k] && k !== 'page') u.set(k, F[k]); });
    const ss = ls('aaa_searches', []); const label = F.mode + (F.q ? ' · ' + F.q : '') + (F.type ? ' · ' + F.type : '') + (F.bhk ? ' · ' + F.bhk + ' BHK' : '');
    ss.push({ label, qs: u.toString() }); sv('aaa_searches', ss.slice(-5)); extras(); toast('Search saved');
  };
  document.addEventListener('click', (e) => {
    const t = e.target;
    const chip = t.closest('[data-chip]'); if (chip) { set(chip.dataset.chip, ''); return; }
    const city = t.closest('[data-city]'); if (city) { openCity(city.dataset.city); return; }
    const ss = t.closest('[data-ss]'); if (ss) { const s = ls('aaa_searches', [])[+ss.dataset.ss]; if (s) { Object.assign(F, D); new URLSearchParams(s.qs).forEach((v, k) => { if (k in D) F[k] = v; }); render(true); } return; }
    const sd = t.closest('[data-ssdel]'); if (sd) { const a = ls('aaa_searches', []); a.splice(+sd.dataset.ssdel, 1); sv('aaa_searches', a); extras(); return; }
    const op = t.closest('[data-open]'); if (op) { openProperty(op.dataset.open); return; }

    // Check if clicked inside a property card
    const card = t.closest('.property-card');
    if (card && card.dataset.id) {
      const id = +card.dataset.id;

      // 1. If clicked favorite button: toggle favorite and do NOT open details modal
      const favBtn = t.closest('[data-act="fav"], .fav');
      if (favBtn) {
        toggleFav(id);
        return;
      }

      // 2. If clicked compare checkbox or label: toggle compare and do NOT open details modal
      const cmpLabel = t.closest('[data-act="cmp"], .cmp');
      if (cmpLabel) {
        const chk = cmpLabel.matches('input[type="checkbox"]')
          ? cmpLabel
          : (cmpLabel.querySelector('input[type="checkbox"]') || card.querySelector('input[data-act="cmp"]'));
        if (t === chk) {
          toggleCmp(id, chk);
        }
        return;
      }

      // 3. Clicked ANYWHERE else on the card (white space, title, image, details, padding, button):
      // OPEN PROPERTY DETAILS!
      openProperty(id);
      return;
    }

    const act = t.closest('[data-act]');
    if (!act) return;
    switch (act.dataset.act) {
      case 'clear': clearAll(); break;
      case 'savesearch': savedSearch(); break;
    }
  });

  // Keyboard accessibility: Enter or Space on a focused property card opens details
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.target.matches('button, input, textarea, select, a, label')) return;
      const card = e.target.closest('.property-card');
      if (card && card.dataset.id) {
        e.preventDefault();
        openProperty(+card.dataset.id);
      }
    }
  });
  function openCity(c) {
    Object.assign(F, D); F.q = c;
    render(true);
    $('#recommendations').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  }

  /* ===== FAVORITES & COMPARE ===== */
  function toggleFav(id) {
    favs = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
    sv('aaa_favs', favs);
    $$(`.fav[data-act="fav"]`).forEach((b) => {
      const cid = +b.closest('.property-card')?.dataset.id;
      if (cid === id) {
        const on = favs.includes(id);
        b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.textContent = on ? '♥' : '♡';
      }
    });
    if (F.saved) render();
  }
  function toggleCmp(id, chk) {
    if (chk.checked) {
      if (cmp.length >= 4) { chk.checked = false; toast('You can compare up to 4 properties'); return; }
      cmp.push(id);
    } else cmp = cmp.filter((x) => x !== id);
    sv('aaa_cmp', cmp); cmpBar();
  }
  function cmpBar() {
    let b = $('#cmpBar');
    if (!cmp.length) { if (b) b.remove(); return; }
    if (!b) {
      b = document.createElement('aside'); b.id = 'cmpBar'; b.className = 'cmp-bar';
      b.innerHTML = '<div class="cmp-inner"><span id="cmpCount"></span><div class="cmp-thumbs" id="cmpThumbs"></div><button type="button" class="btn-coral-sm" id="cmpOpen">Compare now</button><button type="button" class="btn-ghost-sm" id="cmpClr">Clear</button></div>';
      document.body.appendChild(b);
      $('#cmpOpen').onclick = openCompare;
      $('#cmpClr').onclick = () => { cmp = []; sv('aaa_cmp', cmp); cmpBar(); $$('input[data-act="cmp"]').forEach((c) => (c.checked = false)); };
    }
    $('#cmpCount').textContent = `Compare (${cmp.length}/4)`;
    $('#cmpThumbs').innerHTML = cmp.map(byId).filter(Boolean).map((p) => `<img src="${p.img}" alt="${esc(p.title)}" width="36" height="36">`).join('');
  }

  /* ===== MODALS ===== */
  function modal(id) {
    let m = $('#' + id);
    if (!m) {
      m = document.createElement('div'); m.id = id; m.className = 'modal-backdrop';
      m.setAttribute('data-lenis-prevent', '');
      m.innerHTML = '<div class="modal-dialog room-dialog wide" role="dialog" aria-modal="true" data-lenis-prevent><button class="modal-close-btn" aria-label="Close dialog">&times;</button><div class="room-modal-body" data-lenis-prevent></div></div>';
      m.addEventListener('click', (e) => { if (e.target === m || e.target.classList.contains('modal-close-btn')) closeM(m); });
      document.body.appendChild(m);
    }
    return m;
  }
  let savedScrollY = 0;
  let lastOpenedPropertyId = null;

  const openM = (m) => {
    // Save current scroll position before modal locks the page
    savedScrollY = window.lenis
      ? (typeof window.lenis.scroll === 'number' ? window.lenis.scroll : (window.scrollY || 0))
      : (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0);

    m.classList.add('open');
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (window.lenis && typeof window.lenis.stop === 'function') {
      window.lenis.stop();
    }
  };
  const closeM = (m) => {
    m.classList.remove('open');
    if (!document.querySelector('.modal-backdrop.open')) {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (window.lenis && typeof window.lenis.start === 'function') {
        window.lenis.start();
      }

      // Restore scroll to where the user was (never jump to hero / top of page)
      const recSec = document.getElementById('recommendations');
      const fallbackY = recSec ? recSec.offsetTop : 0;
      const targetY = savedScrollY > 60 ? savedScrollY : fallbackY;

      window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
      if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        window.lenis.scrollTo(targetY, { immediate: true });
      }

      // Ensure the inspected property card is visible in view
      if (lastOpenedPropertyId) {
        const card = document.querySelector(`.property-card[data-id="${lastOpenedPropertyId}"]`);
        if (card) {
          const rect = card.getBoundingClientRect();
          if (rect.top < 60 || rect.bottom > window.innerHeight) {
            card.scrollIntoView({ block: 'nearest', behavior: 'instant' });
          }
        }
      }
    }
    if (m.id === 'roomModal' && location.hash.startsWith('#property-')) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.modal-backdrop.open').forEach(closeM); });

  /* Isolate modal scrolling so mouse wheel / touch never scrolls the background page */
  document.addEventListener('wheel', (e) => {
    const activeModal = document.querySelector('.modal-backdrop.open');
    if (!activeModal) return;

    if (activeModal.contains(e.target)) {
      // Find nearest scrollable container inside modal
      let el = e.target;
      let scrollable = null;
      while (el && el !== document.body) {
        if (el === activeModal) {
          if (activeModal.scrollHeight > activeModal.clientHeight) scrollable = activeModal;
          break;
        }
        const oY = window.getComputedStyle(el).overflowY;
        if ((oY === 'auto' || oY === 'scroll') && el.scrollHeight > el.clientHeight) {
          scrollable = el;
          break;
        }
        el = el.parentElement;
      }

      if (scrollable) {
        const atTop = scrollable.scrollTop <= 0;
        const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1;
        if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
      e.stopPropagation();
    } else {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    const activeModal = document.querySelector('.modal-backdrop.open');
    if (!activeModal) return;
    if (!activeModal.contains(e.target) || e.target === activeModal) {
      e.preventDefault();
    }
  }, { passive: false });
  function openCompare() {
    const m = modal('cmpModal'), L = cmp.map(byId);
    const row = (l, f) => `<tr><th scope="row">${l}</th>${L.map((p) => `<td>${f(p)}</td>`).join('')}</tr>`;
    $('.room-modal-body', m).innerHTML = `<h3>Compare Properties</h3><div class="tbl"><table class="cmp-table"><thead><tr><th></th>${L.map((p) => `<th>${esc(p.title)}</th>`).join('')}</tr></thead><tbody>` +
      row('Price', (p) => esc(p.priceStr || fmt(p.price, p.mode))) +
      row('Developer', (p) => esc(p.developer)) +
      row('Carpet PSF', (p) => esc(p.psf || ('₹' + Math.round(p.price / p.carpet).toLocaleString('en-IN')))) +
      row('Carpet area', (p) => p.carpet + ' sq ft') +
      row('Configuration', (p) => esc(p.config || (p.bhk + ' BHK'))) +
      row('Possession', (p) => esc(p.poss)) +
      row('MahaRERA ID', (p) => esc(p.rera || 'Verified')) +
      row('Elevation', (p) => esc(p.floors || '—')) +
      row('Location', (p) => esc(p.locality + ', ' + p.city)) +
      row('Amenities', (p) => esc(p.amen.join(', '))) + '</tbody></table></div>';
    openM(m);
  }

  /* ===== DETAILS MODAL ===== */
  function waLink(msg, num = BUSINESS_WHATSAPP) {
    if (!num) { toast('WhatsApp number not configured'); return; }
    window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }
  const propMsg = (p) => `Hi AAA Real Estate, I'm interested in "${p.title}" by ${p.developer} (${p.priceStr || fmt(p.price, p.mode)}), ${p.locality}, Mumbai (RERA: ${p.rera || 'Verified'}). Please share more details.`;
  function openProperty(id) {
    const p = byId(id); if (!p) return;
    lastOpenedPropertyId = p.id;
    const rv = [p.id, ...ls('aaa_recent', []).filter((x) => x !== p.id)].slice(0, 4); sv('aaa_recent', rv); extras();
    history.replaceState(null, '', location.pathname + location.search + '#property-' + p.id);
    const m = $('#roomModal'); const body = $('#roomModalBody');
    body.innerHTML = `<img class="pd-img" src="${p.img}" alt="${esc(p.title)}" width="700" height="380" loading="lazy">
      <div class="pd-head"><span>${esc(spec(p))}</span><strong>${esc(p.priceStr || fmt(p.price, p.mode))}</strong></div>
      <h3>${esc(p.title)}</h3>
      <p class="pd-loc">📍 ${esc(p.locality)}, ${esc(p.city)} ${esc(p.pin)} · <strong>Developer:</strong> ${esc(p.developer)}</p>
      <ul class="pd-spec">
        <li>Carpet area<b>${p.carpet} sq ft</b></li>
        ${p.psf ? `<li>Carpet PSF<b>${esc(p.psf)}</b></li>` : ''}
        <li>Configuration<b>${esc(p.config || (p.bhk ? p.bhk + ' BHK' : p.type))}</b></li>
        <li>Developer<b>${esc(p.developer)}</b></li>
        <li>Possession<b>${esc(p.poss)}</b></li>
        <li>MahaRERA ID<b>${esc(p.rera || 'Verified')}</b></li>
        ${p.floors ? `<li>Elevation<b>${esc(p.floors)}</b></li>` : ''}
        <li>Status<b>${esc(p.status)}</b></li>
      </ul>
      ${p.notes ? `<div class="pd-notes-callout" style="margin:14px 0;padding:12px 16px;background:rgba(22,46,80,0.06);border-left:3px solid var(--color-coral);border-radius:4px;font-size:0.88rem;color:var(--color-text-main);line-height:1.5;"><strong>Verification Note:</strong> ${esc(p.notes)}</div>` : ''}
      <h4>Amenities &amp; Features</h4><p>${p.amen.map((a) => `<span class="chip">${esc(a)}</span>`).join('')}</p>
      <div class="pd-actions"><button class="btn-coral-full" data-pd="visit">Schedule site visit</button><button class="btn-wa" data-pd="wa">WhatsApp Enquiry</button><button data-pd="share">Share</button><button data-pd="fav">${favs.includes(p.id) ? '♥ Saved' : '♡ Save'}</button></div>`;
    body.onclick = (e) => {
      const a = e.target.closest('[data-pd]'); if (!a) return;
      ({
        visit: () => { closeM(m); $('#eProp').value = p.id; $('#eType').value = 'Schedule a site visit'; $('#contact').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); },
        wa: () => waLink(propMsg(p)),
        share: async () => { const url = location.origin + location.pathname + '#property-' + p.id; try { if (navigator.share) await navigator.share({ title: p.title, url }); else { await navigator.clipboard.writeText(url); toast('Link copied'); } } catch (er) { /* cancelled */ } },
        fav: () => { toggleFav(p.id); a.textContent = favs.includes(p.id) ? '♥ Saved' : '♡ Save'; },
      })[a.dataset.pd]();
    };
    openM(m);
  }
  window.openRoomModal = openProperty;
  window.closeRoomModalFeature = (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    const m = $('#roomModal');
    if (!m) return;
    if (!e || e.target === m || (e.target.classList && e.target.classList.contains('modal-close-btn')) || (e.currentTarget && e.currentTarget.classList && e.currentTarget.classList.contains('modal-close-btn'))) {
      closeM(m);
    }
  };
  window.closeRoomModal = window.closeRoomModalFeature;

  /* ===== CITIES / LOCATIONS ===== */
  const cImg = ['assets/rec-1.jpg', 'assets/rec-2.jpg', 'assets/rec-3.jpg', 'assets/hero-visual.png', 'assets/hero-house.png'];
  const LOCATIONS = [
    { name: 'Worli', desc: 'Central Luxury Corridor', count: PROPS.filter(p => p.locality.includes('Worli')).length },
    { name: 'Worli Sea Face', desc: 'Sea-Facing Penthouses & Residences', count: PROPS.filter(p => p.locality.includes('Sea Face')).length },
    { name: 'Pandurang Budhkar Marg', desc: 'Integrated Mega-Towers', count: PROPS.filter(p => p.locality.includes('Pandurang') || p.locality.includes('Park')).length },
    { name: 'Dr. Annie Besant Road', desc: 'High-Rise Seafront Enclave', count: PROPS.filter(p => p.locality.includes('Annie Besant')).length }
  ];
  $('#cityGrid').innerHTML = LOCATIONS.map((loc, i) => `<button type="button" class="city-card" data-city="${esc(loc.name)}" style="background-image:linear-gradient(transparent 30%,rgba(10,20,40,.85)),url(${cImg[i % cImg.length]})"><b>${esc(loc.name)}</b><span>${loc.desc} · ${loc.count} Verified Projects</span></button>`).join('');

  /* ===== EMI ===== */
  const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  function emi() {
    const P0 = +$('#emiAmt').value, R = +$('#emiRate').value, Y = +$('#emiYrs').value;
    if (!(P0 > 0) || !(Y > 0) || R < 0) { $('#emiMonthly').textContent = '—'; return; }
    const r = R / 1200, n = Y * 12;
    const e = r ? (P0 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P0 / n;
    $('#emiMonthly').textContent = inr(e); $('#emiP').textContent = inr(P0); $('#emiI').textContent = inr(e * n - P0); $('#emiT').textContent = inr(e * n);
    $('#emiBarP').style.width = Math.min(100, (P0 / (e * n)) * 100) + '%';
  }
  ['Amt', 'Rate', 'Yrs'].forEach((k) => {
    const n = $('#emi' + k), r = $('#emi' + k + 'R');
    n.addEventListener('input', () => { r.value = n.value; emi(); }); r.addEventListener('input', () => { n.value = r.value; emi(); });
  });
  emi();

  /* ===== ENQUIRY / SITE VISIT ===== */
  const form = $('#enqForm'), eProp = $('#eProp');
  eProp.innerHTML = '<option value="">No specific property</option>' + PROPS.map((p) => `<option value="${p.id}">${esc(p.title)} (${p.developer})</option>`).join('');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  $('#eDate').min = new Date(today - today.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  let editId = null;
  const err = (m) => { $('#eErr').textContent = m; return false; };
  function enqList() {
    const L = ls('aaa_enquiries', []);
    $('#myEnquiries').innerHTML = L.length ? '<h3>Your requests</h3>' + L.map((x) => `<div class="enq-item"><div><b>${esc(x.type)}</b>${x.prop ? ' · ' + esc(byId(x.prop)?.title || '') : ''}<br><small>${x.date ? esc(x.date) + ', ' + esc(x.slot) + ' · ' : ''}<span class="status ${x.status === 'Cancelled' ? 'off' : ''}">${esc(x.status)}</span></small></div>
      ${x.status !== 'Cancelled' ? `<div><button data-enq="resched" data-id="${x.id}">Reschedule</button><button data-enq="cancel" data-id="${x.id}">Cancel</button></div>` : ''}</div>`).join('') : '';
    updateStatsCounter();
  }
  $('#myEnquiries').addEventListener('click', (e) => {
    const b = e.target.closest('[data-enq]'); if (!b) return;
    const L = ls('aaa_enquiries', []), x = L.find((i) => i.id === b.dataset.id); if (!x) return;
    if (b.dataset.enq === 'cancel') { x.status = 'Cancelled'; sv('aaa_enquiries', L); enqList(); toast('Request cancelled'); return; }
    editId = x.id; ['Name', 'Phone', 'Email', 'Msg'].forEach((k) => { $('#e' + k).value = x[k.toLowerCase()] || ''; });
    $('#eType').value = x.type; eProp.value = x.prop || ''; $('#eDate').value = x.date || ''; $('#eSlot').value = x.slot || '';
    $('button[type=submit]', form).textContent = 'Update request'; form.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  });
  function readForm() {
    const v = (id) => $('#' + id).value.trim();
    const phone = v('ePhone').replace(/[\s-]/g, '').replace(/^(\+91|91|0)/, '');
    if (v('eName').length < 2) return err('Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(phone)) return err('Enter a valid 10-digit Indian mobile number.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('eEmail'))) return err('Enter a valid email address.');
    const visit = $('#eType').value === 'Schedule a site visit';
    if (visit && !v('eDate')) return err('Please choose a date for the site visit.');
    if (v('eDate') && new Date(v('eDate')) < today) return err('Date cannot be in the past.');
    err('');
    return { name: v('eName').slice(0, 80), phone, email: v('eEmail').slice(0, 120), msg: v('eMsg').slice(0, 500), type: $('#eType').value, prop: eProp.value, date: v('eDate'), slot: $('#eSlot').value };
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#eHp').value) return; // honeypot (spam)
    const d = readForm(); if (!d) return;
    const L = ls('aaa_enquiries', []);
    if (editId) { Object.assign(L.find((i) => i.id === editId) || {}, d, { status: 'New' }); editId = null; $('button[type=submit]', form).textContent = 'Submit request'; toast('Request updated'); }
    else {
      const last = ls('aaa_last_enq', 0); if (Date.now() - last < 5000) return err('Please wait a few seconds before sending another request.');
      L.unshift({ id: 'e' + Date.now(), ...d, status: 'New', created: Date.now() }); sv('aaa_last_enq', Date.now()); toast('Request received successfully! Our advisor will contact you.');
    }
    sv('aaa_enquiries', L); enqList(); form.reset(); fillUser();
  });
  $('#eWa').addEventListener('click', () => {
    const p = byId(eProp.value), n = $('#eName').value.trim();
    waLink(p ? propMsg(p) : `Hi AAA Real Estate, I'm ${n || 'interested in a property'} and would like to talk about ${($('#eType').value || 'property consultation').toLowerCase()}.`);
  });

  /* ===== AUTH (USER & ADMIN) ===== */
  const ADMIN_CRED = { email: 'admin@aaarealestate.com', pass: 'admin123' };
  let isAdmin = ls('aaa_admin_auth', false);
  let user = ls('aaa_user', null);

  function checkAdminUI() {
    isAdmin = ls('aaa_admin_auth', false);
    const navAdmin = $('#navAdminBtn');
    const mobAdmin = $('#mobAdminBtn');
    if (navAdmin) navAdmin.style.display = isAdmin ? 'inline-flex' : 'none';
    if (mobAdmin) {
      mobAdmin.classList.toggle('admin-visible', isAdmin);
      mobAdmin.style.display = isAdmin ? 'block' : 'none';
    }
  }

  function fillUser() {
    if (user) {
      const en = $('#eName'), ee = $('#eEmail');
      if (en && !en.value) en.value = user.name;
      if (ee && !ee.value) ee.value = user.email;
    }
    const b = $('#authSignIn');
    if (b) {
      if (user) {
        b.textContent = user.role === 'admin' ? '⚡ Admin · Logout' : 'Hi, ' + user.name.split(' ')[0] + ' · Logout';
        b.onclick = () => {
          user = null;
          isAdmin = false;
          try {
            localStorage.removeItem('aaa_user');
            localStorage.removeItem('aaa_admin_auth');
          } catch (e) {}
          fillUser();
          checkAdminUI();
          toast('Logged out successfully');
        };
      } else {
        b.textContent = 'Login';
        b.onclick = () => window.openAuthModal('signin');
      }
    }
    const regBtn = $('.btn-getstarted');
    if (regBtn) regBtn.style.display = user ? 'none' : '';
    const mobAuth = $('#mobAuthBtn');
    if (mobAuth) {
      if (user) {
        mobAuth.textContent = user.role === 'admin' ? 'Logout (Admin)' : 'Logout (' + user.name.split(' ')[0] + ')';
        mobAuth.onclick = () => {
          user = null;
          isAdmin = false;
          try {
            localStorage.removeItem('aaa_user');
            localStorage.removeItem('aaa_admin_auth');
          } catch (e) {}
          fillUser();
          checkAdminUI();
          toast('Logged out successfully');
        };
      } else {
        mobAuth.textContent = 'Login / Register';
        mobAuth.onclick = () => window.openAuthModal('signin');
      }
    }
  }

  window.handleAuthSubmit = (e, type) => {
    e.preventDefault();
    if (type === 'signup') {
      const em = ($('#signupEmail')?.value || '').trim().toLowerCase();
      if ($('#signupPass')?.value.length < 8) return toast('Password must be at least 8 characters');
      const fullName = ($('#signupFirst')?.value + ' ' + $('#signupLast')?.value).trim().slice(0, 80);
      user = { name: fullName || 'User', email: em, role: 'user' };
      isAdmin = false;
      sv('aaa_admin_auth', false);
      sv('aaa_user', user);
      fillUser();
      checkAdminUI();
      window.closeAuthModal();
      toast('Welcome, ' + user.name + '!');
      return;
    }

    // Sign In: Email & Password (Used by both Admin & Clients)
    const em = ($('#signinEmail')?.value || '').trim().toLowerCase();
    const pw = ($('#signinPass')?.value || '').trim();

    if (!em || !pw) return toast('Please enter your email and password');

    // Admin Credentials Check
    if ((em === ADMIN_CRED.email || em === 'admin') && pw === ADMIN_CRED.pass) {
      isAdmin = true;
      sv('aaa_admin_auth', true);
      user = { name: 'Administrator', email: ADMIN_CRED.email, role: 'admin' };
      sv('aaa_user', user);
      fillUser();
      checkAdminUI();
      window.closeAuthModal();
      if ($('#signinPass')) $('#signinPass').value = '';
      toast('Welcome back, Administrator!');
      window.openAdminModal();
      return;
    }

    // Regular Client Sign In
    isAdmin = false;
    sv('aaa_admin_auth', false);
    const displayName = em.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    user = { name: displayName, email: em, role: 'user' };
    sv('aaa_user', user);
    fillUser();
    checkAdminUI();
    window.closeAuthModal();
    if ($('#signinPass')) $('#signinPass').value = '';
    toast('Welcome, ' + user.name + '!');
  };

  /* ===== ADMIN ENGINE & DASHBOARD ===== */
  window.handleAdminLogout = () => {
    isAdmin = false;
    user = null;
    try {
      localStorage.removeItem('aaa_admin_auth');
      localStorage.removeItem('aaa_user');
    } catch (e) {}
    checkAdminUI();
    fillUser();
    window.closeAdminModal();
    toast('Logged out from Admin Portal.');
  };

  window.openAdminModal = () => {
    if (!isAdmin) {
      window.openAuthModal('signin');
      toast('Please sign in with your Administrator credentials.');
      return;
    }
    const m = $('#adminModal');
    if (!m) return;
    openM(m);
    renderAdminDashboard();
  };

  window.closeAdminModal = (e) => {
    if (e && e.target !== e.currentTarget && !e.target.classList.contains('modal-close-btn')) return;
    const m = $('#adminModal');
    if (!m) return;
    closeM(m);
  };

  window.switchAdminTab = (tabName) => {
    $$('.admin-tab').forEach((b) => b.classList.toggle('active', b.dataset.admtab === tabName));
    $('#admViewProps')?.classList.toggle('hidden', tabName !== 'props');
    $('#admViewAddProp')?.classList.toggle('hidden', tabName !== 'addprop');
    $('#admViewLeads')?.classList.toggle('hidden', tabName !== 'leads');
    if (tabName === 'props') renderAdminPropsTable();
    if (tabName === 'leads') renderAdminLeadsTable();
  };

  function updateStatsCounter() {
    const el = $('#statProps');
    if (el) {
      el.dataset.count = PROPS.length;
      el.textContent = PROPS.length;
    }
    const countEl = $('#admTabPropCount');
    if (countEl) countEl.textContent = PROPS.length;
    const statTot = $('#admStatTotal');
    if (statTot) statTot.textContent = PROPS.length;
    const statBuy = $('#admStatBuy');
    if (statBuy) statBuy.textContent = PROPS.filter((p) => p.mode === 'buy').length;
    const statRent = $('#admStatRent');
    if (statRent) statRent.textContent = PROPS.filter((p) => p.mode === 'rent').length;
    const statComm = $('#admStatComm');
    if (statComm) statComm.textContent = PROPS.filter((p) => p.mode === 'commercial').length;
    const leads = ls('aaa_enquiries', []);
    const statLeads = $('#admStatLeads');
    if (statLeads) statLeads.textContent = leads.length;
    const leadCount = $('#admTabLeadCount');
    if (leadCount) leadCount.textContent = leads.length;
  }

  function renderAdminDashboard() {
    updateStatsCounter();
    renderAdminPropsTable();
    renderAdminLeadsTable();
  }

  function renderAdminPropsTable() {
    const tbody = $('#admPropsTbody');
    if (!tbody) return;
    const q = ($('#admSearch')?.value || '').trim().toLowerCase();
    const mode = $('#admFilterMode')?.value || '';
    const filteredProps = PROPS.filter((p) => {
      const matchMode = !mode || p.mode === mode;
      const matchQ = !q || (p.title + ' ' + p.developer + ' ' + p.locality + ' ' + (p.rera || '')).toLowerCase().includes(q);
      return matchMode && matchQ;
    });

    tbody.innerHTML = filteredProps.length ? filteredProps.map((p) => `
      <tr>
        <td>
          <img src="${p.img}" alt="${esc(p.title)}" class="adm-thumb" width="48" height="36" style="border-radius:4px;object-fit:cover;">
        </td>
        <td>
          <strong class="adm-row-title">${esc(p.title)}</strong>
          <span class="adm-row-dev">🏢 ${esc(p.developer)} · 📍 ${esc(p.locality)}</span>
        </td>
        <td>
          <span class="adm-pill mode-${p.mode}">${p.mode.toUpperCase()}</span>
          <span class="adm-subtext">${esc(p.config || (p.bhk + ' BHK'))}</span>
        </td>
        <td>
          <strong class="adm-price">${esc(p.priceStr || fmt(p.price, p.mode))}</strong>
          <span class="adm-subtext">${p.carpet} sq.ft. · ${esc(p.psf || '')}</span>
        </td>
        <td>
          <span class="adm-status-badge">${esc(p.status.split('/')[0].trim())}</span>
          <span class="adm-subtext">Poss: ${esc(p.poss || '—')}</span>
        </td>
        <td>
          <code class="adm-rera">${esc(p.rera || 'Verified')}</code>
          ${p.floors ? `<span class="adm-subtext">${esc(p.floors)}</span>` : ''}
        </td>
        <td style="text-align:right;">
          <div class="adm-row-actions">
            <button type="button" class="adm-btn edit" onclick="editAdminProp(${p.id})" title="Edit Property">✏️ Edit</button>
            <button type="button" class="adm-btn view" onclick="previewAdminProp(${p.id})" title="View on site">👁️</button>
            <button type="button" class="adm-btn del" onclick="deleteAdminProp(${p.id})" title="Delete Property">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--color-text-muted);">No properties match your filter criteria.</td></tr>`;
  }

  window.previewAdminProp = (id) => {
    window.closeAdminModal();
    openProperty(id);
  };

  window.editAdminProp = (id) => {
    const p = byId(id);
    if (!p) return;
    window.switchAdminTab('addprop');
    $('#admFormTitle').textContent = `✏️ Edit Property: ${p.title}`;
    $('#admEditId').value = p.id;
    $('#admTitle').value = p.title || '';
    $('#admDeveloper').value = p.developer || '';
    $('#admMode').value = p.mode || 'buy';
    $('#admType').value = p.type || 'Apartment';
    $('#admStatus').value = p.status || 'Under construction';
    $('#admLocality').value = p.locality || '';
    $('#admBhk').value = p.bhk !== undefined ? p.bhk : 3;
    $('#admConfig').value = p.config || '';
    $('#admPriceStr').value = p.priceStr || '';
    $('#admPrice').value = p.price || '';
    $('#admCarpet').value = p.carpet || '';
    $('#admPsf').value = p.psf || '';
    $('#admPossession').value = p.poss || '';
    $('#admRera').value = p.rera || '';
    $('#admFloors').value = p.floors || '';
    $('#admImg').value = p.img || 'assets/rec-1.jpg';
    $('#admNotes').value = p.notes || '';
    $('#admSaveBtn').textContent = 'Update Property';
    $('#admViewAddProp')?.scrollIntoView({ behavior: 'smooth' });
  };

  window.resetAdminForm = () => {
    $('#admFormTitle').textContent = '➕ Add New Luxury Property';
    $('#admEditId').value = '';
    $('#admPropForm')?.reset();
    $('#admSaveBtn').textContent = 'Save Property';
  };

  window.handleAdminSaveProp = (e) => {
    e.preventDefault();
    const editId = $('#admEditId').value;
    const isEdit = !!editId;
    const priceNum = +$('#admPrice').value || 10000000;
    const carpetNum = +$('#admCarpet').value || 1200;
    const mode = $('#admMode').value;
    const title = $('#admTitle').value.trim();
    const dev = $('#admDeveloper').value.trim();
    const bhk = +$('#admBhk').value;
    const config = $('#admConfig').value.trim() || (bhk ? bhk + ' BHK' : $('#admType').value);
    const priceStr = $('#admPriceStr').value.trim() || fmt(priceNum, mode);
    const psf = $('#admPsf').value.trim() || ('₹' + Math.round(priceNum / carpetNum).toLocaleString('en-IN') + (mode === 'rent' ? '/mo' : ''));
    const poss = $('#admPossession').value.trim() || 'Ready / Under construction';
    const rera = $('#admRera').value.trim() || 'Verified';
    const floors = $('#admFloors').value.trim() || '';
    const notes = $('#admNotes').value.trim() || '';
    const img = $('#admImg').value || 'assets/rec-1.jpg';
    const type = $('#admType').value;
    const status = $('#admStatus').value;
    const locality = $('#admLocality').value.trim();

    const propData = {
      title,
      developer: dev,
      mode,
      type,
      city: 'Mumbai',
      locality,
      pin: '400018',
      bhk,
      bath: Math.max(2, bhk),
      carpet: carpetNum,
      price: priceNum,
      priceStr,
      psf,
      furn: 'Semi-furnished',
      poss,
      status,
      img,
      amen: ['Sea View', 'Infinity Pool', 'Clubhouse', 'Private Elevator', '24x7 Security', 'Gym'],
      rera,
      floors,
      notes,
      added: 1,
      config
    };

    if (isEdit) {
      const idx = PROPS.findIndex((p) => p.id === +editId);
      if (idx !== -1) {
        propData.id = +editId;
        PROPS[idx] = { ...PROPS[idx], ...propData };
      }
    } else {
      propData.id = Date.now();
      PROPS.unshift(propData);
    }

    sv('aaa_props_db', PROPS);
    render(true);
    updateStatsCounter();
    toast(isEdit ? 'Property updated successfully!' : 'New property listed successfully!');
    window.resetAdminForm();
    window.switchAdminTab('props');
  };

  window.deleteAdminProp = (id) => {
    const p = byId(id);
    if (!p) return;
    if (!confirm(`Are you sure you want to delete "${p.title}"?`)) return;
    PROPS = PROPS.filter((x) => x.id !== id);
    sv('aaa_props_db', PROPS);
    render(true);
    updateStatsCounter();
    renderAdminPropsTable();
    toast('Property deleted successfully.');
  };

  window.resetAdminDB = () => {
    if (!confirm('Reset entire property database back to original 51 verified projects?')) return;
    PROPS = JSON.parse(JSON.stringify(DEFAULT_PROPS));
    sv('aaa_props_db', PROPS);
    render(true);
    updateStatsCounter();
    renderAdminPropsTable();
    toast('Database reset to original 51 verified projects.');
  };

  window.exportAdminDB = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(PROPS, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'aaa_real_estate_portfolio_' + new Date().toISOString().slice(0, 10) + '.json');
    dlAnchor.click();
    toast('Database exported as JSON');
  };

  function renderAdminLeadsTable() {
    const tbody = $('#admLeadsTbody');
    if (!tbody) return;
    const leads = ls('aaa_enquiries', []);
    tbody.innerHTML = leads.length ? leads.map((lead) => {
      const p = lead.prop ? byId(lead.prop) : null;
      const propTitle = p ? p.title : (lead.prop || 'General Consultation');
      const waMsg = encodeURIComponent(`Hi ${lead.name}, this is AAA Real Estate regarding your enquiry for "${propTitle}". How can we assist you with site visits or pricing?`);
      return `
        <tr>
          <td>
            <strong>${esc(lead.name)}</strong>
            ${lead.msg ? `<span class="adm-subtext">“${esc(lead.msg.slice(0, 60))}${lead.msg.length > 60 ? '...' : ''}”</span>` : ''}
          </td>
          <td>
            <div><a href="tel:${lead.phone}" class="adm-lead-link">📞 +91 ${esc(lead.phone)}</a></div>
            <span class="adm-subtext">${esc(lead.email)}</span>
          </td>
          <td>
            <span class="adm-pill mode-buy">${esc(lead.type || 'Enquiry')}</span>
          </td>
          <td>
            <strong class="adm-subtext" style="font-size:0.85rem;color:var(--color-navy-dark);">${esc(propTitle)}</strong>
          </td>
          <td>
            ${lead.date ? `<span>📅 ${esc(lead.date)}</span><br><span class="adm-subtext">⏰ ${esc(lead.slot || 'Morning')}</span>` : '<span class="adm-subtext">—</span>'}
          </td>
          <td>
            <select class="adm-lead-status" onchange="updateLeadStatus('${lead.id}', this.value)">
              <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
              <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="Site Visit Scheduled" ${lead.status === 'Site Visit Scheduled' ? 'selected' : ''}>Site Visit Scheduled</option>
              <option value="Closed / Won" ${lead.status === 'Closed / Won' ? 'selected' : ''}>Closed / Won</option>
              <option value="Cancelled" ${lead.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td style="text-align:right;">
            <div class="adm-row-actions">
              <a href="https://wa.me/91${lead.phone}?text=${waMsg}" target="_blank" rel="noopener" class="adm-btn wa" title="Chat on WhatsApp">💬 WA</a>
              <a href="tel:+91${lead.phone}" class="adm-btn call" title="Call Client">📞</a>
              <button type="button" class="adm-btn del" onclick="deleteLead('${lead.id}')" title="Delete Lead">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('') : `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--color-text-muted);">No customer leads or site visits received yet. Test by submitting the contact form on the website!</td></tr>`;
  }

  window.updateLeadStatus = (id, newStatus) => {
    const leads = ls('aaa_enquiries', []);
    const lead = leads.find((x) => x.id === id);
    if (lead) {
      lead.status = newStatus;
      sv('aaa_enquiries', leads);
      toast(`Lead status updated to: ${newStatus}`);
      renderAdminLeadsTable();
      enqList();
    }
  };

  window.deleteLead = (id) => {
    let leads = ls('aaa_enquiries', []);
    leads = leads.filter((x) => x.id !== id);
    sv('aaa_enquiries', leads);
    toast('Lead removed.');
    updateStatsCounter();
    renderAdminLeadsTable();
    enqList();
  };

  window.clearAllLeads = () => {
    if (!confirm('Clear all customer leads and enquiries?')) return;
    sv('aaa_enquiries', []);
    toast('All customer leads cleared.');
    updateStatsCounter();
    renderAdminLeadsTable();
    enqList();
  };

  // Attach toolbar listeners
  $('#admSearch')?.addEventListener('input', () => renderAdminPropsTable());
  $('#admFilterMode')?.addEventListener('change', () => renderAdminPropsTable());
  $('#adminExportBtn')?.addEventListener('click', () => window.exportAdminDB());
  $('#adminResetBtn')?.addEventListener('click', () => window.resetAdminDB());
  $('#admClearLeadsBtn')?.addEventListener('click', () => window.clearAllLeads());

  /* ===== HERO SEARCH FORM BINDING ===== */
  const hs = $('#heroSearch');
  if (hs) {
    hs.addEventListener('submit', (e) => {
      e.preventDefault();
      F.q = $('#hsQ').value.trim();
      F.type = $('#hsType').value;
      F.bhk = $('#hsBhk').value;
      F.max = $('#hsPrice').value;
      F.page = '1';
      render(true);
      $('#recommendations').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    });
    const hsModeTabs = $$('#heroSearch .mode-tab');
    hsModeTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        hsModeTabs.forEach((t) => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
        F.mode = tab.dataset.mode;
        $('#hsPrice').innerHTML = budgetOpts(F.mode);
      });
    });
    $('#hsPrice').innerHTML = budgetOpts(F.mode);
  }

  /* ===== WHATSAPP FLOATING MODAL LOGIC ===== */
  const waFloatTrigger = $('#floatingWaTrigger');
  const waModal = $('#waPopup');
  const waClose = $('#waPopupClose');
  if (waFloatTrigger && waModal) {
    const toggleWa = (open) => {
      const isOpen = typeof open === 'boolean' ? open : !waModal.classList.contains('active');
      waModal.classList.toggle('active', isOpen);
      waModal.setAttribute('aria-hidden', (!isOpen).toString());
      waModal.style.display = isOpen ? 'block' : 'none';
      waFloatTrigger.setAttribute('aria-expanded', isOpen.toString());
    };
    waFloatTrigger.addEventListener('click', (e) => { e.stopPropagation(); toggleWa(); });
    if (waClose) waClose.addEventListener('click', (e) => { e.stopPropagation(); toggleWa(false); });
    document.addEventListener('click', (e) => {
      if (waModal.classList.contains('active') && !waModal.contains(e.target) && !waFloatTrigger.contains(e.target)) {
        toggleWa(false);
      }
    });
  }

  // Check URL deep link
  if (location.hash.startsWith('#property-')) {
    const pid = location.hash.replace('#property-', '');
    if (pid) setTimeout(() => openProperty(pid), 400);
  }
  if (location.hash === '#admin') {
    setTimeout(() => window.openAdminModal(), 350);
  }

  // Admin shortcut: Ctrl+Shift+A opens Admin Portal (or login if unauthenticated)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.openAdminModal();
    }
  });

  // Init
  render();
  fillUser();
  checkAdminUI();
  enqList();
})();
