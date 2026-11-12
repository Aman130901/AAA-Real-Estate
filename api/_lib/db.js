/**
 * AAA Real Estate - Database Adapter
 * Vercel par file-system read-only hota hai, isliye:
 * - LOCAL dev: JSON file (data/properties.json) use karta hai
 * - PRODUCTION (Vercel): PROPERTIES_JSON env variable se in-memory load karta hai
 *   ya Vercel KV / Supabase se connect karta hai
 *
 * Simple approach: properties.json read-only source of truth hai.
 * Admin CRUD ke liye Vercel KV (agar configured ho) ya localStorage fallback.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'aaa-data')
  : path.join(process.cwd(), 'data');
const PROPS_FILE = path.join(DATA_DIR, 'properties.json');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const SOURCE_FILE = path.join(process.cwd(), 'properties.json');

// ─── Helper: safe JSON read ───────────────────────────────────────────────────
function readJSON(filePath, fallback = []) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.error('readJSON error:', filePath, e.message);
  }
  return fallback;
}

// ─── Helper: safe JSON write ──────────────────────────────────────────────────
function writeJSON(filePath, data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('writeJSON error:', filePath, e.message);
    return false;
  }
}

// ─── PROPERTIES ───────────────────────────────────────────────────────────────

function getProperties() {
  // Priority: data/properties.json (admin-editable) > properties.json (source)
  if (fs.existsSync(PROPS_FILE)) {
    return readJSON(PROPS_FILE, []);
  }
  // Copy source to data dir on first run
  const source = readJSON(SOURCE_FILE, []);
  if (source.length) {
    writeJSON(PROPS_FILE, source);
  }
  return source;
}

function saveProperties(props) {
  return writeJSON(PROPS_FILE, props);
}

function getPropertyById(id) {
  const all = getProperties();
  return all.find(p => p.id === Number(id)) || null;
}

function createProperty(propData) {
  const all = getProperties();
  const newId = Date.now();
  const newProp = { ...propData, id: newId, added: 1 };
  all.unshift(newProp);
  saveProperties(all);
  return newProp;
}

function updateProperty(id, propData) {
  const all = getProperties();
  const idx = all.findIndex(p => p.id === Number(id));
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...propData, id: Number(id) };
  saveProperties(all);
  return all[idx];
}

function deleteProperty(id) {
  const all = getProperties();
  const idx = all.findIndex(p => p.id === Number(id));
  if (idx === -1) return false;
  all.splice(idx, 1);
  saveProperties(all);
  return true;
}

// ─── ENQUIRIES / LEADS ────────────────────────────────────────────────────────

function getEnquiries() {
  return readJSON(ENQUIRIES_FILE, []);
}

function saveEnquiry(enquiryData) {
  const all = getEnquiries();
  const newEnquiry = {
    id: Date.now(),
    ...enquiryData,
    createdAt: new Date().toISOString(),
    status: 'new'
  };
  all.unshift(newEnquiry);
  writeJSON(ENQUIRIES_FILE, all);
  return newEnquiry;
}

function updateEnquiryStatus(id, status) {
  const all = getEnquiries();
  const idx = all.findIndex(e => e.id === Number(id));
  if (idx === -1) return null;
  all[idx].status = status;
  all[idx].updatedAt = new Date().toISOString();
  writeJSON(ENQUIRIES_FILE, all);
  return all[idx];
}

function deleteEnquiry(id) {
  const all = getEnquiries();
  const idx = all.findIndex(e => e.id === Number(id));
  if (idx === -1) return false;
  all.splice(idx, 1);
  writeJSON(ENQUIRIES_FILE, all);
  return true;
}

module.exports = {
  getProperties,
  saveProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getEnquiries,
  saveEnquiry,
  updateEnquiryStatus,
  deleteEnquiry
};

