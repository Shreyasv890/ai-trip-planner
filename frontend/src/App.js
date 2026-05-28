import { useState, useEffect, useRef } from "react";

const API = "https://ai-trip-planner-o77v.onrender.com/";

async function callGroq(prompt) {
  const res = await fetch(`${API}/auth/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "AI generation failed");
  return data.result;
}

function inp(extra = {}) {
  return {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", background: "#fff", color: "#1e293b",
    fontSize: 14, outline: "none", fontFamily: "inherit", ...extra
  };
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "20px",
      boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #e8edf4",
      marginBottom: 16, ...style
    }}>{children}</div>
  );
}

function Badge({ text, color = "#2563eb" }) {
  return (
    <span style={{
      background: `${color}15`, color, border: `1px solid ${color}30`,
      borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700,
      whiteSpace: "nowrap"
    }}>{text}</span>
  );
}

function Lbl({ children }) {
  return (
    <label style={{
      display: "block", fontSize: 11, fontWeight: 700, color: "#64748b",
      marginBottom: 5, letterSpacing: "0.05em"
    }}>{children}</label>
  );
}

const TRAVEL_MODES = [
  { id: "bus", label: "Bus", emoji: "🚌", color: "#059669" },
  { id: "train", label: "Train", emoji: "🚆", color: "#2563eb" },
  { id: "car", label: "Car", emoji: "🚗", color: "#d97706" },
  { id: "flight", label: "Flight", emoji: "✈️", color: "#7c3aed" },
];

const INTERESTS = [
  { id: "beaches", label: "Beaches", emoji: "🏖" },
  { id: "history", label: "History & Forts", emoji: "🏰" },
  { id: "food", label: "Food & Cuisine", emoji: "🍜" },
  { id: "nightlife", label: "Nightlife", emoji: "🎉" },
  { id: "nature", label: "Nature & Trekking", emoji: "🌿" },
  { id: "adventure", label: "Adventure Sports", emoji: "🧗" },
  { id: "temples", label: "Temples", emoji: "🛕" },
  { id: "shopping", label: "Shopping", emoji: "🛍" },
  { id: "photography", label: "Photography", emoji: "📸" },
  { id: "museums", label: "Museums & Art", emoji: "🎨" },
  { id: "wildlife", label: "Wildlife", emoji: "🦁" },
  { id: "waterfalls", label: "Waterfalls", emoji: "💧" },
];

// ── FUTURE SCOPE: EXPENSE CATEGORIES ─────────────────────────
const EXPENSE_CATS = [
  { id: "food", label: "Food", emoji: "🍽", color: "#dc2626" },
  { id: "transport", label: "Transport", emoji: "🚗", color: "#d97706" },
  { id: "stay", label: "Stay", emoji: "🏨", color: "#2563eb" },
  { id: "activities", label: "Activities", emoji: "🎭", color: "#059669" },
  { id: "shopping", label: "Shopping", emoji: "🛍", color: "#7c3aed" },
  { id: "misc", label: "Misc", emoji: "📌", color: "#64748b" },
];

function estimateBudget(location, days, travelers, style) {
  const loc = (location || "").toLowerCase();
  const d = parseInt(days) || 3, t = parseInt(travelers) || 1;
  let b = { hotel: 800, food: 350, transport: 200, activities: 300 };
  if (loc.includes("goa") || loc.includes("mumbai") || loc.includes("delhi") || loc.includes("bangalore"))
    b = { hotel: 1800, food: 700, transport: 400, activities: 600 };
  else if (loc.includes("paris") || loc.includes("london") || loc.includes("dubai") || loc.includes("singapore"))
    b = { hotel: 9000, food: 3500, transport: 2000, activities: 2500 };
  else if (loc.includes("bali") || loc.includes("thailand") || loc.includes("vietnam"))
    b = { hotel: 2500, food: 1000, transport: 600, activities: 800 };
  else if (loc.includes("manali") || loc.includes("shimla") || loc.includes("ooty") || loc.includes("munnar"))
    b = { hotel: 1200, food: 450, transport: 350, activities: 400 };
  else if (loc.includes("jaipur") || loc.includes("agra") || loc.includes("varanasi"))
    b = { hotel: 1000, food: 380, transport: 250, activities: 350 };
  const m = style === "budget" ? 0.6 : style === "luxury" ? 2.8 : 1;
  const hotel = Math.round(b.hotel * m * d * Math.ceil(t / 2));
  const food = Math.round(b.food * m * d * t);
  const transport = Math.round(b.transport * m * d * t);
  const activities = Math.round(b.activities * m * d * t);
  const misc = Math.round((hotel + food + transport + activities) * 0.08);
  return { hotel, food, transport, activities, misc, total: hotel + food + transport + activities + misc };
}



// ═══════════════════════════════════════════════════════════
// ✅ PlaceImage — Pexels API (Free, real travel photos)
//    Sign up at pexels.com/api → get free key instantly
//    Add to .env: REACT_APP_PEXELS_KEY=your_key_here
// ═══════════════════════════════════════════════════════════

const _pexCache = {};

function getEmoji(query) {
  const q = (query || "").toLowerCase();
  if (q.includes("beach") || q.includes("sea"))      return "🏖️";
  if (q.includes("hotel") || q.includes("resort"))   return "🏨";
  if (q.includes("temple") || q.includes("mandir"))  return "🛕";
  if (q.includes("fort") || q.includes("palace"))    return "🏯";
  if (q.includes("mountain") || q.includes("hill"))  return "⛰️";
  if (q.includes("forest") || q.includes("jungle"))  return "🌿";
  if (q.includes("waterfall") || q.includes("falls"))return "💧";
  if (q.includes("lake") || q.includes("river"))     return "🌊";
  if (q.includes("restaurant") || q.includes("cafe"))return "🍽️";
  if (q.includes("museum") || q.includes("gallery")) return "🎨";
  if (q.includes("market") || q.includes("shopping"))return "🛍️";
  return "📍";
}

function PlaceImage({ query, height = 200, dayIndex = 0, actIndex = 0 }) {
  const [src, setSrc]       = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [err, setErr]       = useState(false);
  const emoji                = getEmoji(query);
  const KEY                  = process.env.REACT_APP_PEXELS_KEY;

  useEffect(() => {
    if (!query || !KEY) return;
    // ✅ FIX: Include dayIndex+actIndex in cache key so each card gets a DIFFERENT photo
    // even when the same place appears on multiple days
    const k = `${query.toLowerCase().trim()}_d${dayIndex}_a${actIndex}`;
    if (_pexCache[k]) { setSrc(_pexCache[k]); return; }

    // ✅ FIX: Use page offset so day1/day2/day3 get different photos for same city
    const page = (dayIndex * 3 + actIndex) % 5 + 1;

    fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query.toLowerCase().trim())}&per_page=3&page=${page}&orientation=landscape`, {
      headers: { Authorization: KEY }
    })
      .then(r => r.json())
      .then(data => {
        // Pick a different photo index based on actIndex to further vary images
        const photos = data?.photos || [];
        const pick = photos[actIndex % photos.length];
        const url = pick?.src?.large2x || pick?.src?.large || photos[0]?.src?.large2x;
        if (url) { _pexCache[k] = url; setSrc(url); }
        else setErr(true);
      })
      .catch(() => setErr(true));
  }, [query, KEY, dayIndex, actIndex]);

  // No key configured — show emoji placeholder
  if (!KEY) return (
    <div style={{
      width:"100%", height, borderRadius:14, marginBottom:12,
      background:"linear-gradient(135deg,#e2e8f0,#cbd5e1)",
      display:"flex", alignItems:"center", justifyContent:"center",
      flexDirection:"column", gap:8,
    }}>
      <div style={{ fontSize:44 }}>{emoji}</div>
      <div style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>Add REACT_APP_PEXELS_KEY to .env</div>
    </div>
  );

  return (
    <div style={{
      width:"100%", height, borderRadius:14, overflow:"hidden",
      marginBottom:12, position:"relative", flexShrink:0,
      background:"linear-gradient(135deg,#dde3ec,#c8d1df)",
    }}>
      {/* Skeleton */}
      {!loaded && !err && (
        <div style={{
          position:"absolute", inset:0, display:"flex",
          alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8,
        }}>
          <div style={{ fontSize:44 }}>{emoji}</div>
          <div style={{ fontSize:11, color:"#64748b", fontWeight:600 }}>Loading photo…</div>
        </div>
      )}
      {/* Error */}
      {err && (
        <div style={{
          position:"absolute", inset:0, display:"flex",
          alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8,
          background:"linear-gradient(135deg,#e2e8f0,#cbd5e1)",
        }}>
          <div style={{ fontSize:48 }}>{emoji}</div>
          <div style={{ fontSize:12, color:"#475569", fontWeight:700, textAlign:"center", padding:"0 16px" }}>
            {(query||"").split(" ").slice(0,4).join(" ")}
          </div>
        </div>
      )}
      {/* Real photo */}
      {src && !err && (
        <img
          src={src} alt={query}
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
          style={{
            width:"100%", height:"100%",
            objectFit:"cover", objectPosition:"center",
            display: loaded ? "block" : "none",
            transition:"opacity 0.4s ease",
          }}
        />
      )}
      {/* Label overlay */}
      {loaded && (
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          background:"linear-gradient(transparent,rgba(0,0,0,0.65))",
          padding:"24px 14px 10px",
          display:"flex", alignItems:"center", gap:6,
        }}>
          <span style={{ fontSize:15 }}>{emoji}</span>
          <span style={{ color:"#fff", fontSize:13, fontWeight:700, textShadow:"0 1px 6px rgba(0,0,0,0.9)" }}>
            {(query||"").split(" ").slice(0,5).join(" ")}
          </span>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// ✅ HotelImage — Google Maps Street View for REAL hotel exterior photos
//    Shows the actual hotel building — not a random travel photo
//    Free, no API key needed, works for any hotel name + city
// ═══════════════════════════════════════════════════════════════
function HotelImage({ hotelName, location, height = 220 }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr]       = useState(false);
  const [pexSrc, setPexSrc] = useState(null);
  const KEY                  = process.env.REACT_APP_PEXELS_KEY;

  // Google Maps Street View Static — shows actual hotel building exterior
  // Format: finds the location by name and returns a street-level photo
  const streetViewSrc = `https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${encodeURIComponent(hotelName + ", " + location)}&fov=90&heading=0&pitch=10&key=YOUR_MAPS_KEY`;

  // ✅ Better approach without Google Maps key:
  // Use the hotel name embedded in a Google Maps embed screenshot
  // OR use Pexels with very specific hotel query
  useEffect(() => {
    if (!KEY || !hotelName) return;
    const query = `${hotelName} hotel exterior building`;
    const k = `hotel_${hotelName.toLowerCase().trim()}`;
    if (_pexCache[k]) { setPexSrc(_pexCache[k]); return; }
    fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
      headers: { Authorization: KEY }
    })
      .then(r => r.json())
      .then(data => {
        const url = data?.photos?.[0]?.src?.large2x || data?.photos?.[0]?.src?.large;
        if (url) { _pexCache[k] = url; setPexSrc(url); }
      })
      .catch(() => {});
  }, [hotelName, KEY]);

  const emoji = "🏨";
  // Use Google Maps embed which shows real satellite/map view of the hotel
  const mapsEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(hotelName + " " + location)}&output=embed&z=17`;

  return (
    <div style={{
      width: "100%", height, borderRadius: 14, overflow: "hidden",
      marginBottom: 12, position: "relative", flexShrink: 0,
      background: "linear-gradient(135deg,#dde3ec,#c8d1df)",
    }}>
      {/* ✅ Show real Google Maps embed of the actual hotel location */}
      {!err ? (
        <iframe
          title={hotelName}
          src={mapsEmbedSrc}
          width="100%" height={height}
          style={{ border: "none", display: "block" }}
          loading="lazy"
          allowFullScreen
          onError={() => setErr(true)}
        />
      ) : (
        // Fallback: Pexels hotel photo if map fails
        pexSrc ? (
          <img src={pexSrc} alt={hotelName}
            onLoad={() => setLoaded(true)}
            onError={() => {}}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: loaded ? "block" : "none" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 44 }}>{emoji}</div>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{hotelName}</div>
          </div>
        )
      )}
      {/* Label overlay */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
        padding: "20px 14px 8px",
        display: "flex", alignItems: "center", gap: 6,
        pointerEvents: "none",
      }}>
        <span style={{ fontSize: 15 }}>🏨</span>
        <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
          {hotelName}
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginLeft: 4 }}>· {location}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🆕 FUTURE SCOPE 1: BUDGET TRACKER
// ═══════════════════════════════════════════════════════════════
function BudgetTracker({ tripMeta, onClose }) {
  const storageKey = `expenses_${tripMeta?.location || "general"}`;
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem(storageKey) || "[]"));
  const [form, setForm] = useState({ desc: "", amount: "", cat: "food", date: new Date().toISOString().split("T")[0] });
  const [msg, setMsg] = useState("");

  const planned = parseInt(tripMeta?.budget || 0);
  const spent = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const remaining = planned - spent;

  function save(updated) {
    setExpenses(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }

  function addExpense() {
    if (!form.desc || !form.amount) { setMsg("Fill description and amount"); return; }
    save([...expenses, { ...form, id: Date.now() }]);
    setForm({ desc: "", amount: "", cat: "food", date: new Date().toISOString().split("T")[0] });
    setMsg("✅ Added!");
    setTimeout(() => setMsg(""), 1500);
  }

  function deleteExpense(id) { save(expenses.filter(e => e.id !== id)); }

  const bycat = EXPENSE_CATS.map(c => ({
    ...c, total: expenses.filter(e => e.cat === c.id).reduce((s, e) => s + parseFloat(e.amount || 0), 0)
  })).filter(c => c.total > 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 3000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px 16px", overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1e3a8a,#312e81)", borderRadius: "20px 20px 0 0", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800, color: "#fff", fontSize: 16 }}>📊 Budget Tracker</div>
            {tripMeta?.location && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{tripMeta.location} · {tripMeta.days} days</div>}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, fontFamily: "inherit" }}>✕</button>
        </div>

        <div style={{ padding: "16px" }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[["Planned", `₹${planned.toLocaleString()}`, "#2563eb"], ["Spent", `₹${spent.toLocaleString()}`, "#dc2626"], ["Left", `₹${remaining.toLocaleString()}`, remaining >= 0 ? "#059669" : "#dc2626"]].map(([l, v, c]) => (
              <div key={l} style={{ background: `${c}08`, borderRadius: 12, padding: "10px", textAlign: "center", border: `1.5px solid ${c}20` }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{l}</div>
                <div style={{ fontWeight: 900, color: c, fontSize: 15, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {planned > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Budget Used</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: spent > planned ? "#dc2626" : "#059669" }}>{Math.round((spent / planned) * 100)}%</span>
              </div>
              <div style={{ background: "#e2e8f0", borderRadius: 99, height: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 99, width: `${Math.min((spent / planned) * 100, 100)}%`, background: spent > planned ? "#ef4444" : "linear-gradient(90deg,#2563eb,#7c3aed)", transition: "width 0.4s" }} />
              </div>
            </div>
          )}

          {/* Add expense */}
          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "14px", marginBottom: 14, border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 10 }}>➕ Add Expense</div>
            {msg && <div style={{ fontSize: 12, color: msg.startsWith("✅") ? "#059669" : "#dc2626", marginBottom: 8, fontWeight: 700 }}>{msg}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div><Lbl>DESCRIPTION</Lbl><input style={inp({ fontSize: 13, padding: "9px 12px" })} placeholder="e.g. Lunch" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} /></div>
              <div><Lbl>AMOUNT (₹)</Lbl><input type="number" style={inp({ fontSize: 13, padding: "9px 12px" })} placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div>
                <Lbl>CATEGORY</Lbl>
                <select style={{ ...inp({ fontSize: 13, padding: "9px 12px" }), background: "#fff" }} value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
                  {EXPENSE_CATS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div><Lbl>DATE</Lbl><input type="date" style={inp({ fontSize: 13, padding: "9px 12px" })} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            </div>
            <button onClick={addExpense} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>➕ Add</button>
          </div>

          {/* Category breakdown */}
          {bycat.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 8 }}>📊 By Category</div>
              {bycat.map(c => (
                <div key={c.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: "#475569" }}>{c.emoji} {c.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: c.color }}>₹{c.total.toLocaleString()}</span>
                  </div>
                  <div style={{ background: "#e2e8f0", borderRadius: 99, height: 5 }}>
                    <div style={{ height: "100%", borderRadius: 99, width: `${Math.min((c.total / spent) * 100, 100)}%`, background: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Expense log */}
          {expenses.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>🧾 Log ({expenses.length})</div>
                <button onClick={() => save([])} style={{ padding: "4px 10px", borderRadius: 7, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>🗑 Clear</button>
              </div>
              <div style={{ maxHeight: 220, overflowY: "auto" }}>
                {[...expenses].reverse().map(e => {
                  const cat = EXPENSE_CATS.find(c => c.id === e.cat);
                  return (
                    <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{cat?.emoji} {e.desc}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{e.date} · {cat?.label}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 800, color: "#dc2626", fontSize: 14 }}>₹{parseFloat(e.amount).toLocaleString()}</span>
                        <button onClick={() => deleteExpense(e.id)} style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {expenses.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>No expenses yet. Start tracking! 💰</div>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🆕 FUTURE SCOPE 2: TRIP SHARE / DOWNLOAD (enhanced)
// ═══════════════════════════════════════════════════════════════
function downloadTripHTML(result) {
  const r = result;
  const days = r.days || [];
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${r.title || "Trip Plan"}</title>
<style>
  body{font-family:'Segoe UI',sans-serif;max-width:860px;margin:0 auto;padding:20px;background:#f8fafc;color:#1e293b}
  h1{background:linear-gradient(135deg,#1e3a8a,#312e81);color:#fff;padding:24px;border-radius:12px;margin:0 0 16px}
  h2{color:#1e3a8a;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:24px}
  .card{background:#fff;border-radius:12px;padding:16px;margin-bottom:14px;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
  .badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700;margin-right:6px;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe}
  .activity{background:#f8fafc;border-radius:10px;padding:12px;margin-bottom:10px;border-left:3px solid #2563eb}
  .meal{display:inline-block;background:#f0fdf4;border-radius:8px;padding:8px 12px;margin-right:8px;margin-bottom:8px;font-size:13px}
  .tag{display:inline-block;background:#f1f5f9;border-radius:16px;padding:4px 12px;font-size:12px;margin:3px;color:#475569}
  table{width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden}
  th{background:#1e3a8a;color:#fff;padding:10px 14px;text-align:left}
  td{padding:10px 14px;border-bottom:1px solid #f1f5f9}
  tr:nth-child(even) td{background:#f8fafc}
  .tip{background:#fffbeb;border-left:3px solid #f59e0b;padding:8px 12px;border-radius:0 8px 8px 0;font-size:13px;color:#92400e;margin-top:6px}
  .total{background:linear-gradient(135deg,#1e3a8a,#312e81);color:#fff;padding:12px 16px;border-radius:10px;font-size:18px;font-weight:800;margin-bottom:12px}
  @media print{body{background:#fff}.card{box-shadow:none}}
</style>
</head>
<body>
<h1>✈️ ${r.title || "Trip Plan"}<br><span style="font-size:14px;font-weight:400;opacity:0.8">${r.summary || ""}</span></h1>

<div class="card">
  <div style="display:flex;flex-wrap:wrap;gap:6px">
    ${r.meta?.from ? `<span class="badge">📍 ${r.meta.from} → ${r.meta?.location}</span>` : `<span class="badge">📍 ${r.meta?.location}</span>`}
    <span class="badge">📅 ${r.meta?.days} days</span>
    <span class="badge">👥 ${r.meta?.travelers} traveler(s)</span>
    <span class="badge">💰 ${r.meta?.currency} ${parseInt(r.meta?.budget || 0).toLocaleString()}</span>
    <span class="badge">🚗 ${r.meta?.travelMode}</span>
    <span class="badge">🎒 ${r.meta?.travelStyle}</span>
  </div>
</div>

${days.map((day, i) => `
<div class="card">
  <h2>Day ${i + 1}: ${day.title}</h2>
  <p style="color:#64748b">${day.theme || ""}</p>
  ${day.stay ? `<p>🏨 <strong>Stay:</strong> ${day.stay} · ${day.stay_cost}</p>` : ""}
  ${day.meals ? `
  <h3>🍽 Meals</h3>
  ${day.meals.breakfast ? `<div class="meal">☀️ <strong>Breakfast:</strong> ${day.meals.breakfast.item} @ ${day.meals.breakfast.place} · ${day.meals.breakfast.cost}</div>` : ""}
  ${day.meals.lunch ? `<div class="meal">🌞 <strong>Lunch:</strong> ${day.meals.lunch.item} @ ${day.meals.lunch.place} · ${day.meals.lunch.cost}</div>` : ""}
  ${day.meals.dinner ? `<div class="meal">🌙 <strong>Dinner:</strong> ${day.meals.dinner.item} @ ${day.meals.dinner.place} · ${day.meals.dinner.cost}</div>` : ""}
  ` : ""}
  <h3>📍 Activities</h3>
  ${(day.activities || []).map(a => `
  <div class="activity">
    <strong>${a.emoji || "📍"} ${a.name}</strong> &nbsp;
    <span style="font-size:12px;color:#2563eb">${a.time || ""}</span> &nbsp;
    <span style="font-size:12px;color:#64748b">⏱ ${a.duration || ""}</span> &nbsp;
    <span style="font-size:12px;color:#059669">💰 ${a.cost || ""}</span>
    <p style="color:#64748b;font-size:13px;margin:6px 0">${a.description}</p>
    ${a.tip ? `<div class="tip">💡 ${a.tip}</div>` : ""}
  </div>`).join("")}
  ${day.nearby_places?.length ? `<h3>📍 Nearby Places</h3><div>${day.nearby_places.map(p => `<span class="tag">${p.name} (${p.distance})</span>`).join("")}</div>` : ""}
  <div style="background:#f0fdf4;border-radius:10px;padding:10px 14px;margin-top:12px;display:flex;justify-content:space-between">
    <strong>Day ${i + 1} Total</strong><strong style="color:#059669">${day.cost}</strong>
  </div>
</div>`).join("")}

${r.cost_breakdown ? `
<h2>💰 Budget Breakdown</h2>
<div class="card">
  <div class="total">Total: ${r.cost_breakdown.total}</div>
  <table>
    <tr><th>Category</th><th>Amount</th></tr>
    ${[["🚗 Travel to Destination", r.cost_breakdown.travel_to_destination], ["🏨 Accommodation", r.cost_breakdown.accommodation], ["🍽 Food & Dining", r.cost_breakdown.food], ["🚌 Local Transport", r.cost_breakdown.local_transport], ["🎯 Activities", r.cost_breakdown.activities], ["🛍 Misc", r.cost_breakdown.misc]].filter(([, v]) => v).map(([l, v]) => `<tr><td>${l}</td><td><strong>${v}</strong></td></tr>`).join("")}
  </table>
  ${r.cost_breakdown.notes ? `<div class="tip" style="margin-top:12px">💡 ${r.cost_breakdown.notes}</div>` : ""}
</div>` : ""}

${r.tips?.length ? `
<h2>💡 Travel Tips</h2>
<div class="card">
  ${r.tips.map(t => `<div style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px">✅ ${t}</div>`).join("")}
</div>` : ""}

${r.packing?.length ? `
<h2>🎒 Packing List</h2>
<div class="card" style="display:flex;flex-wrap:wrap;gap:8px">
  ${r.packing.map(item => `<span class="tag">✓ ${item}</span>`).join("")}
</div>` : ""}

${r.meta?.location && r.meta?.from ? `
<h2>🗺 Route</h2>
<div class="card">
  <p><a href="https://www.google.com/maps/dir/${encodeURIComponent(r.meta.from)}/${encodeURIComponent(r.meta.location)}" target="_blank" style="color:#2563eb;font-weight:700">📍 Open Route in Google Maps →</a></p>
</div>` : ""}

<div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;margin-top:20px;border-top:1px solid #e2e8f0">
  Generated by Trip Nova · ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(r.title || "trip-plan").replace(/[^a-z0-9]/gi, "_")}.html`;
  a.click();
}

// ═══════════════════════════════════════════════════════════════
// 🆕 FUTURE SCOPE 3: TRIP RATING / REVIEW (post-trip)
// ═══════════════════════════════════════════════════════════════
function TripRating({ tripTitle, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [saved, setSaved] = useState(false);

  function saveRating() {
    const ratings = JSON.parse(localStorage.getItem("tripRatings") || "[]");
    ratings.push({ tripTitle, rating, review, date: new Date().toISOString() });
    localStorage.setItem("tripRatings", JSON.stringify(ratings));
    setSaved(true);
    setTimeout(onClose, 1500);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {saved ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>🎉</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#059669", marginTop: 8 }}>Review Saved!</div>
          </div>
        ) : (
          <>
            <h3 style={{ margin: "0 0 4px", fontWeight: 800, color: "#1e293b", fontSize: 17 }}>⭐ Rate Your Trip</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>{tripTitle}</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "center" }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}
                  style={{ fontSize: 32, background: "none", border: "none", cursor: "pointer", opacity: (hover || rating) >= s ? 1 : 0.3, transition: "opacity 0.2s" }}>⭐</button>
              ))}
            </div>
            <div style={{ marginBottom: 14 }}>
              <Lbl>YOUR REVIEW</Lbl>
              <textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder="Share your experience..."
                style={{ ...inp(), height: 90, resize: "vertical", paddingTop: 10 }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#64748b" }}>Cancel</button>
              <button onClick={saveRating} disabled={!rating} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: rating ? "linear-gradient(135deg,#f59e0b,#d97706)" : "#e2e8f0", color: rating ? "#fff" : "#94a3b8", fontWeight: 800, fontSize: 14, cursor: rating ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                ⭐ Submit Review
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🆕 FUTURE SCOPE 4: EMERGENCY INFO PANEL
// ═══════════════════════════════════════════════════════════════
function EmergencyPanel({ location, onClose }) {
  const numbers = [
    { label: "Police", number: "100", emoji: "🚔", color: "#2563eb" },
    { label: "Ambulance", number: "108", emoji: "🚑", color: "#dc2626" },
    { label: "Fire Brigade", number: "101", emoji: "🚒", color: "#d97706" },
    { label: "Tourist Helpline", number: "1800-111-363", emoji: "📞", color: "#059669" },
    { label: "Women Helpline", number: "1091", emoji: "🆘", color: "#7c3aed" },
    { label: "Disaster Relief", number: "108", emoji: "🏥", color: "#0891b2" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg,#dc2626,#991b1b)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800, color: "#fff", fontSize: 16 }}>🆘 Emergency Numbers</div>
            {location && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>📍 {location}</div>}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, fontFamily: "inherit" }}>✕</button>
        </div>
        <div style={{ padding: 16 }}>
          {numbers.map(n => (
            <a key={n.label} href={`tel:${n.number}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, marginBottom: 8, background: `${n.color}08`, border: `1.5px solid ${n.color}20`, textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{n.emoji}</span>
                <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>{n.label}</span>
              </div>
              <div style={{ fontWeight: 900, color: n.color, fontSize: 16 }}>{n.number}</div>
            </a>
          ))}
          <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 8 }}>Tap any number to call</div>
        </div>
      </div>
    </div>
  );
}

// ── CHATBOT ────────────────────────────────────────────────────
function ChatBot({ onClose, onGeneratePlan }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! 👋 I'm your AI Travel Assistant! I can help you plan a trip, suggest destinations, answer travel questions, or just chat about travel. You can also say **'plan a trip'** and I'll collect details to create a full itinerary for you!", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // ── FIX: use refs to avoid stale closure bug (chatbot repeating same question) ──
  const collectStepRef = useRef(0);
  const tripDataRef = useRef({});
  const collectingRef = useRef(false);
  // sync collecting state to ref
  const setCollectingSync = (val) => { collectingRef.current = val; setCollecting(val); };

  const [collectStep, setCollectStepState] = useState(0);
  const setCollectStep = (val) => {
    const n = typeof val === "function" ? val(collectStepRef.current) : val;
    collectStepRef.current = n;
    setCollectStepState(n);
  };

  const collectSteps = [
    { key: "from", q: "📍 Where are you starting from? (city name)" },
    { key: "location", q: "🏁 Where do you want to go? (destination)" },
    { key: "days", q: "📅 How many days is your trip?" },
    { key: "travelers", q: "👥 How many travelers?" },
    { key: "budget", q: "💰 What's your total budget? (e.g. 10000 INR)" },
    { key: "travelMode", q: "🚌 How do you prefer to travel? (bus / train / car / flight)" },
    { key: "interests", q: "❤️ What are your interests? (e.g. beaches, food, history, adventure)" },
  ];

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function addMsg(role, text) {
    setMessages(prev => [...prev, { role, text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
  }

  function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { addMsg("assistant", "❌ Voice input is not supported in your browser. Please use Chrome."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN"; recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => { const transcript = e.results[0][0].transcript; setInput(transcript); setListening(false); };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\*\*/g, "").replace(/[#*_]/g, "").substring(0, 300);
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "en-IN"; utt.rate = 0.95; utt.pitch = 1;
    window.speechSynthesis.speak(utt);
  }

  async function handleSend(msg) {
    const userMsg = (msg || input).trim();
    if (!userMsg) return;
    setInput("");
    addMsg("user", userMsg);
    setLoading(true);

    // ── FIX: read from refs (not stale state) so step always advances correctly ──
    if (collectingRef.current) {
      const currentStep = collectStepRef.current;
      const step = collectSteps[currentStep];
      const newData = { ...tripDataRef.current, [step.key]: userMsg };
      tripDataRef.current = newData;

      if (currentStep < collectSteps.length - 1) {
        const nextStep = collectSteps[currentStep + 1];
        setCollectStep(currentStep + 1);
        addMsg("assistant", `Got it! ✅\n\n${nextStep.q}`);
        speak(nextStep.q);
      } else {
        addMsg("assistant", "🎉 Perfect! I have all the details. Generating your complete trip plan now...");
        speak("Perfect! Generating your complete trip plan now!");
        setCollectingSync(false);
        setCollectStep(0);
        tripDataRef.current = {};
        setLoading(false);
        const interestIds = INTERESTS.filter(i =>
          (newData.interests || "").toLowerCase().includes(i.label.toLowerCase().split("&")[0].trim()) ||
          (newData.interests || "").toLowerCase().includes(i.id)
        ).map(i => i.id);
        const budgetNum = parseInt((newData.budget || "10000").replace(/[^0-9]/g, "")) || 10000;
        onGeneratePlan({
          from: newData.from || "", location: newData.location || "", days: newData.days || "3",
          travelers: newData.travelers || "1", budget: budgetNum.toString(), currency: "INR",
          travelMode: (newData.travelMode || "bus").toLowerCase().includes("train") ? "train" :
            (newData.travelMode || "bus").toLowerCase().includes("flight") ? "flight" :
            (newData.travelMode || "bus").toLowerCase().includes("car") ? "car" : "bus",
          travelStyle: budgetNum < 8000 ? "budget" : budgetNum > 30000 ? "luxury" : "mid",
          tripType: "friends", interests: interestIds, departureTime: "17:00",
        });
        onClose(); return;
      }
      setLoading(false); return;
    }

    const planKeywords = ["plan a trip", "plan trip", "book a trip", "create plan", "make itinerary", "generate plan", "plan my trip", "i want to travel", "want to go to", "help me plan"];
    const wantsPlan = planKeywords.some(kw => userMsg.toLowerCase().includes(kw));
    if (wantsPlan) {
      collectStepRef.current = 0;
      tripDataRef.current = {};
      setCollectStep(0);
      setCollectingSync(true);
      const reply = "🗺 Great! I'll help you plan your trip. Let me collect some details.\n\n" + collectSteps[0].q;
      addMsg("assistant", reply);
      speak("Great! I will help you plan your trip. " + collectSteps[0].q);
      setLoading(false); return;
    }

    try {
      const prompt = `You are a friendly, expert AI travel assistant. Answer the user's travel question helpfully and concisely. Keep responses under 200 words. Use emojis. Give practical, actionable advice. If asked about specific destinations, give 3-5 bullet points. User message: "${userMsg}"`;
      const raw = await callGroq(prompt);
      addMsg("assistant", raw); speak(raw);
    } catch { addMsg("assistant", "Sorry, I had trouble connecting. Please try again! 🙏"); }
    setLoading(false);
  }

  const quickReplies = ["🗺 Plan a trip", "🏖 Best beach destinations", "💰 Budget travel tips", "🎒 Packing tips", "🌍 Top places in India"];

  return (
    <div style={{ position: "fixed", bottom: 90, right: 16, width: 360, height: 560, background: "#fff", borderRadius: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", zIndex: 1000, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
          <div>
            <div style={{ fontWeight: 800, color: "#fff", fontSize: 14 }}>AI Travel Assistant</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} /> Online · Ready to plan!
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>✕</button>
      </div>
      {collecting && (
        <div style={{ background: "#eff6ff", padding: "8px 16px", fontSize: 12, color: "#2563eb", fontWeight: 700, borderBottom: "1px solid #bfdbfe" }}>
          📝 Collecting trip details — Step {collectStep + 1}/{collectSteps.length}
          <div style={{ height: 3, background: "#e2e8f0", borderRadius: 10, marginTop: 6 }}>
            <div style={{ height: "100%", background: "#2563eb", borderRadius: 10, width: `${((collectStep + 1) / collectSteps.length) * 100}%`, transition: "width 0.3s" }} />
          </div>
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 8, animation: "fadeIn 0.3s ease" }}>
            {m.role === "assistant" && <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginTop: 2 }}>🤖</div>}
            <div style={{ maxWidth: "78%" }}>
              <div style={{ background: m.role === "user" ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "#f1f5f9", color: m.role === "user" ? "#fff" : "#1e293b", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {m.text.replace(/\*\*(.*?)\*\*/g, "$1")}
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3, textAlign: m.role === "user" ? "right" : "left" }}>{m.time}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
            <div style={{ background: "#f1f5f9", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#94a3b8", animation: `bounce 0.8s ease ${i * 0.15}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {messages.length <= 2 && !collecting && (
        <div style={{ padding: "0 12px 10px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {quickReplies.map(q => (
            <button key={q} onClick={() => handleSend(q)} style={{ padding: "6px 12px", borderRadius: 20, border: "1.5px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
          ))}
        </div>
      )}
      <div style={{ padding: "12px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={collecting ? collectSteps[collectStep]?.q.replace(/[📍🏁📅👥💰🚌❤️]/g, "").trim() : "Ask anything about travel..."}
            style={{ ...inp({ padding: "10px 14px", fontSize: 13, borderRadius: 12 }), paddingRight: 40 }} />
        </div>
        <button onClick={startVoice} style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: listening ? "#ef4444" : "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
          {listening ? "🔴" : "🎙"}
        </button>
        <button onClick={() => handleSend()} disabled={loading || !input.trim()} style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, opacity: !input.trim() ? 0.5 : 1 }}>➤</button>
      </div>
    </div>
  );
}

// ── VOICE ASSISTANT ────────────────────────────────────────────
function VoiceAssistant({ onClose, onGeneratePlan }) {
  const [phase, setPhase] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [collecting, setCollecting] = useState(false);
  const [statusText, setStatusText] = useState("Tap the mic to start speaking");
  const recognitionRef = useRef(null);

  // ── FIX: refs to avoid stale closures (caused "Step 8 of 7" bug) ──
  const collectStepRef = useRef(0);
  const tripDataRef = useRef({});
  const collectingRef = useRef(false);
  const [collectStep, setCollectStepState] = useState(0);
  const setCollectStep = (val) => {
    const n = typeof val === "function" ? val(collectStepRef.current) : val;
    collectStepRef.current = n;
    setCollectStepState(n);
  };
  const setCollectingSync = (val) => { collectingRef.current = val; setCollecting(val); };

  const collectSteps = [
    { key: "from", q: "Where are you starting from?" },
    { key: "location", q: "Where do you want to go?" },
    { key: "days", q: "How many days is your trip?" },
    { key: "travelers", q: "How many travelers?" },
    { key: "budget", q: "What is your total budget in rupees?" },
    { key: "travelMode", q: "How do you prefer to travel? Bus, train, car or flight?" },
    { key: "interests", q: "What are your interests? For example beaches, food, history or adventure?" },
  ];

  function speak(text, onDone) {
    if (!window.speechSynthesis) { onDone && onDone(); return; }
    window.speechSynthesis.cancel();
    setPhase("speaking"); setResponse(text);
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-IN"; utt.rate = 0.9; utt.pitch = 1.1;
    utt.onend = () => { setPhase("idle"); onDone && onDone(); };
    window.speechSynthesis.speak(utt);
  }

  function startListening(onResult) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { speak("Sorry, voice input is not supported in your browser. Please use Chrome."); return; }
    const rec = new SpeechRecognition();
    rec.lang = "en-IN"; rec.continuous = false; rec.interimResults = false;
    rec.onstart = () => { setPhase("listening"); setStatusText("Listening... speak now"); };
    rec.onresult = (e) => { const t = e.results[0][0].transcript; setTranscript(t); setPhase("thinking"); setStatusText("Processing..."); onResult(t); };
    rec.onerror = () => { setPhase("idle"); setStatusText("Didn't catch that. Tap to try again."); };
    rec.onend = () => { if (phase === "listening") setPhase("idle"); };
    rec.start();
    recognitionRef.current = rec;
  }

  async function handleVoiceInput(text) {
    if (collectingRef.current) {
      const currentStep = collectStepRef.current;
      const step = collectSteps[currentStep];
      const newData = { ...tripDataRef.current, [step.key]: text };
      tripDataRef.current = newData;
      if (currentStep < collectSteps.length - 1) {
        const next = collectSteps[currentStep + 1];
        setCollectStep(currentStep + 1);
        speak(next.q, () => startListening(handleVoiceInput));
      } else {
        setCollectingSync(false);
        setCollectStep(0);
        tripDataRef.current = {};
        speak("Perfect! I have everything I need. Generating your complete trip plan now! Close this and check your plan.", () => {
          const interestIds = INTERESTS.filter(i =>
            (newData.interests || "").toLowerCase().includes(i.label.toLowerCase().split("&")[0].trim()) ||
            (newData.interests || "").toLowerCase().includes(i.id)
          ).map(i => i.id);
          const budgetNum = parseInt((newData.budget || "10000").replace(/[^0-9]/g, "")) || 10000;
          onGeneratePlan({
            from: newData.from || "", location: newData.location || "", days: newData.days || "3",
            travelers: newData.travelers || "1", budget: budgetNum.toString(), currency: "INR",
            travelMode: (newData.travelMode || "bus").toLowerCase().includes("train") ? "train" :
              (newData.travelMode || "bus").toLowerCase().includes("flight") ? "flight" :
              (newData.travelMode || "bus").toLowerCase().includes("car") ? "car" : "bus",
            travelStyle: budgetNum < 8000 ? "budget" : budgetNum > 30000 ? "luxury" : "mid",
            tripType: "friends", interests: interestIds, departureTime: "17:00",
          });
          onClose();
        });
      }
      return;
    }
    const planKw = ["plan", "trip", "travel", "go to", "visit", "book"];
    if (planKw.some(k => text.toLowerCase().includes(k))) {
      collectStepRef.current = 0;
      tripDataRef.current = {};
      setCollectStep(0);
      setCollectingSync(true);
      speak("Sure! Let me help you plan your trip. " + collectSteps[0].q, () => startListening(handleVoiceInput));
      return;
    }
    try {
      const raw = await callGroq(`You are a voice travel assistant. Give a SHORT answer (max 3 sentences) to: "${text}". Be friendly, use simple language.`);
      const clean = raw.replace(/\*\*/g, "").replace(/[#*_]/g, "").replace(/\n/g, " ").substring(0, 400);
      speak(clean, () => { setStatusText("Tap mic to ask another question"); });
    } catch { speak("Sorry, I had trouble. Please try again."); }
  }

  function handleMicTap() {
    if (phase === "speaking") { window.speechSynthesis.cancel(); setPhase("idle"); return; }
    if (phase === "listening") { recognitionRef.current?.stop(); setPhase("idle"); return; }
    startListening(handleVoiceInput);
  }

  const waveCount = 5;
  return (
    <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg,#0f172a,#1e1b4b)", zIndex: 2000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`@keyframes wave{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(37,99,235,0.4)}50%{box-shadow:0 0 60px rgba(37,99,235,0.8)}}@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes pulsering{0%{transform:scale(1);opacity:1}100%{transform:scale(2);opacity:0}}`}</style>
      <button onClick={() => { window.speechSynthesis.cancel(); recognitionRef.current?.stop(); onClose(); }} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", fontSize: 20, fontFamily: "inherit" }}>✕</button>
      <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>🎙 Voice Travel Assistant</div>
      <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center", margin: "20px 0" }}>
        {phase === "listening" && [1, 2, 3].map(i => (
          <div key={i} style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", border: "2px solid #3b82f6", animation: `pulsering ${1 + i * 0.3}s ease-out infinite`, animationDelay: `${i * 0.2}s` }} />
        ))}
        <button onClick={handleMicTap} style={{ width: 120, height: 120, borderRadius: "50%", border: "none", cursor: "pointer", position: "relative", zIndex: 2, background: phase === "listening" ? "linear-gradient(135deg,#ef4444,#dc2626)" : phase === "speaking" ? "linear-gradient(135deg,#22c55e,#059669)" : phase === "thinking" ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#2563eb,#7c3aed)", animation: phase === "listening" ? "glow 1.5s ease-in-out infinite" : phase === "speaking" ? "glow 1s ease-in-out infinite" : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>
          {phase === "listening" ? "🔴" : phase === "speaking" ? "🔊" : phase === "thinking" ? "⏳" : "🎙"}
        </button>
      </div>
      {(phase === "listening" || phase === "speaking") && (
        <div style={{ display: "flex", gap: 4, alignItems: "center", height: 40, margin: "8px 0" }}>
          {Array.from({ length: waveCount }).map((_, i) => (
            <div key={i} style={{ width: 4, background: phase === "listening" ? "#ef4444" : "#22c55e", borderRadius: 4, animation: `wave 0.6s ease-in-out ${i * 0.1}s infinite`, animationDuration: `${0.5 + i * 0.1}s` }} />
          ))}
        </div>
      )}
      <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "10px 0 6px", textAlign: "center", padding: "0 32px" }}>
        {phase === "listening" ? "🎙 Listening..." : phase === "thinking" ? "🧠 Thinking..." : phase === "speaking" ? "🔊 Speaking..." : statusText}
      </div>
      {transcript && <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "10px 18px", margin: "8px 24px", fontSize: 13, color: "rgba(255,255,255,0.8)", textAlign: "center", animation: "fadeInUp 0.3s ease" }}>You said: "<em>{transcript}</em>"</div>}
      {response && phase === "speaking" && <div style={{ background: "rgba(37,99,235,0.2)", border: "1px solid rgba(37,99,235,0.4)", borderRadius: 16, padding: "12px 20px", margin: "8px 24px", fontSize: 14, color: "#fff", textAlign: "center", maxWidth: 340, lineHeight: 1.6, animation: "fadeInUp 0.3s ease" }}>{response}</div>}
      {collecting && (
        <div style={{ marginTop: 12, width: "80%", maxWidth: 320 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6, textAlign: "center" }}>Trip Details: Step {collectStep + 1} of {collectSteps.length}</div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg,#2563eb,#22c55e)", width: `${((collectStep + 1) / collectSteps.length) * 100}%`, transition: "width 0.5s", borderRadius: 10 }} />
          </div>
        </div>
      )}
      {phase === "idle" && !collecting && (
        <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", padding: "0 20px" }}>
          {["Plan a trip", "Best places to visit", "Budget tips", "Packing list"].map(q => (
            <button key={q} onClick={() => { setTranscript(q); setPhase("thinking"); handleVoiceInput(q); }} style={{ padding: "8px 16px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
          ))}
        </div>
      )}
      <div style={{ position: "absolute", bottom: 30, fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
        {phase === "speaking" ? "Tap to stop" : "Tap mic to speak · Or use suggestion buttons above"}
      </div>
    </div>
  );
}

// ── FLOATING ASSISTANTS ─────────────────────────────────────────
function FloatingAssistants({ onGeneratePlan }) {
  const [showChat, setShowChat] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [pulse, setPulse] = useState(true);
  useEffect(() => { const t = setTimeout(() => setPulse(false), 5000); return () => clearTimeout(t); }, []);
  return (
    <>
      {showChat && <ChatBot onClose={() => setShowChat(false)} onGeneratePlan={onGeneratePlan} />}
      {showVoice && <VoiceAssistant onClose={() => setShowVoice(false)} onGeneratePlan={onGeneratePlan} />}
      <div style={{ position: "fixed", bottom: 20, right: 16, display: "flex", flexDirection: "column", gap: 10, zIndex: 999 }}>
        {pulse && !showChat && !showVoice && (
          <div style={{ position: "absolute", right: 56, bottom: 60, background: "#1e293b", color: "#fff", padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>Ask AI Assistant! 👆</div>
        )}
        <button onClick={() => { setShowVoice(true); setShowChat(false); }} style={{ width: 50, height: 50, borderRadius: "50%", border: "none", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", fontSize: 22, cursor: "pointer", boxShadow: "0 4px 20px rgba(245,158,11,0.4)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }} title="Voice Assistant">🎙</button>
        <button onClick={() => { setShowChat(c => !c); setShowVoice(false); }} style={{ width: 56, height: 56, borderRadius: "50%", border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontSize: 26, cursor: "pointer", boxShadow: "0 4px 20px rgba(37,99,235,0.4)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }} title="AI Chat Assistant">
          {showChat ? "✕" : "🤖"}
        </button>
      </div>
    </>
  );
}

// ── LIVE TRIP NAVIGATOR ─────────────────────────────────────────
function LiveTripNavigator({ result, onClose }) {
  const r = result;
  const [currentDay, setCurrentDay] = useState(0);
  const [completedActivities, setCompletedActivities] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [currentPlace, setCurrentPlace] = useState(null);
  const [tripPhase, setTripPhase] = useState("travel");
  // 🆕 FUTURE SCOPE: Budget Tracker inside Live Navigator
  const [showTracker, setShowTracker] = useState(false);
  // 🆕 FUTURE SCOPE: Emergency Panel inside Live Navigator
  const [showEmergency, setShowEmergency] = useState(false);
  // 🆕 FUTURE SCOPE: Trip Rating on completion
  const [showRating, setShowRating] = useState(false);

  const days = r.days || [];
  const travelInfo = r.travelInfo;
  const returnTravel = r.return_travel;
  const allActivities = days[currentDay]?.activities || [];
  const totalDays = days.length;
  const dayKey = `day_${currentDay}`;
  const completedCount = Object.keys(completedActivities).filter(k => k.startsWith(dayKey)).length;
  const totalActivities = allActivities.length;
  const accent = ["#2563eb", "#7c3aed", "#0ea5e9", "#059669", "#d97706", "#dc2626"][currentDay % 6];

  function markDone(di, ai) { setCompletedActivities(p => ({ ...p, [`day_${di}_act_${ai}`]: true })); }
  function isDone(di, ai) { return !!completedActivities[`day_${di}_act_${ai}`]; }
  function openMap(name, loc) { setCurrentPlace({ name, location: loc }); setShowMap(true); }

  const nearbyPlaces = days[currentDay]?.nearby_places || [];

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#fff" }}>
      <style>{`@keyframes pulse2{0%,100%{opacity:1}50%{opacity:0.6}}@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes pulsering{0%{transform:scale(1);opacity:1}100%{transform:scale(2);opacity:0}}`}</style>

      {showTracker && <BudgetTracker tripMeta={r.meta} onClose={() => setShowTracker(false)} />}
      {showEmergency && <EmergencyPanel location={r.meta?.location} onClose={() => setShowEmergency(false)} />}
      {showRating && <TripRating tripTitle={r.title} onClose={() => { setShowRating(false); onClose(); }} />}

      {/* Header */}
      <div style={{ background: "#1e293b", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid #334155" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse2 1.5s infinite" }} />
          <span style={{ fontWeight: 800, fontSize: 14 }}>🗺 Trip Live</span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{r.meta?.from} → {r.meta?.location}</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {/* 🆕 Quick action buttons */}
          <button onClick={() => setShowTracker(true)} title="Budget Tracker" style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #334155", background: "#1e3a5f", color: "#60a5fa", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>📊</button>
          <button onClick={() => setShowEmergency(true)} title="Emergency Numbers" style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #334155", background: "#3b1d1d", color: "#fca5a5", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>🆘</button>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>Day {tripPhase === "travel" ? "0" : tripPhase === "returnTravel" ? "Return" : currentDay + 1}/{totalDays}</span>
          <button onClick={onClose} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #475569", background: "#334155", color: "#94a3b8", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✕ End</button>
        </div>
      </div>

      <div style={{ height: 4, background: "#1e293b" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${accent},#7c3aed)`, transition: "width 0.5s", width: `${tripPhase === "complete" ? 100 : tripPhase === "travel" ? 5 : tripPhase === "returnTravel" ? 95 : ((currentDay / totalDays) + (completedCount / (totalActivities || 1) / totalDays)) * 90}%` }} />
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "16px 16px 40px" }}>

        {/* TRAVEL PHASE */}
        {tripPhase === "travel" && travelInfo && (
          <div style={{ animation: "slideUp 0.4s ease" }}>
            <div style={{ background: "linear-gradient(135deg,#1e3a8a,#312e81)", borderRadius: 20, padding: "24px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{travelInfo.find(t => t.recommended)?.emoji || "🚌"}</div>
              <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800 }}>Starting Your Journey!</h2>
              <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 16px" }}>{r.meta?.from} → {r.meta?.location}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", borderRadius: 20, padding: "6px 16px" }}>
                <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 13 }}>⏱️ Depart at {r.meta?.departureTime}</span>
              </div>
            </div>
            {travelInfo.map((t, i) => (
              <div key={i} style={{ background: "#1e293b", borderRadius: 16, padding: "16px", marginBottom: 12, border: `2px solid ${t.recommended ? "#2563eb" : "#334155"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: t.schedule?.length ? 12 : 0 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 28 }}>{t.emoji}</span>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{t.mode}</span>
                        {t.recommended && <span style={{ background: "#2563eb", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 10 }}>⭐ BEST</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{t.details}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, color: "#22c55e", fontSize: 16 }}>{t.cost}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>⏱️ {t.duration}</div>
                  </div>
                </div>
                {t.schedule?.length > 0 && (
                  <div style={{ borderTop: "1px solid #334155", paddingTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 10 }}>🕐 Journey Schedule</div>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: 9, top: 0, bottom: 0, width: 2, background: "#334155" }} />
                      {t.schedule.map((s, j) => (
                        <div key={j} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: j === 0 ? "#22c55e" : j === t.schedule.length - 1 ? "#ef4444" : "#2563eb", border: "2px solid #0f172a", flexShrink: 0, zIndex: 1 }} />
                          <div style={{ background: "#0f172a", borderRadius: 10, padding: "8px 12px", flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontWeight: 700, fontSize: 13 }}>{s.station || s.stop}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: j === 0 ? "#22c55e" : j === t.schedule.length - 1 ? "#ef4444" : "#60a5fa" }}>{s.time}</span>
                            </div>
                            {s.note && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.note}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {r.meta?.from && r.meta?.location && (
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #334155", marginBottom: 16 }}>
                <iframe title="route" width="100%" height="260" frameBorder="0" src={`https://maps.google.com/maps?saddr=${encodeURIComponent(r.meta?.from || "")}&daddr=${encodeURIComponent(r.meta?.location || "")}&directionsmode=driving&output=embed`} allowFullScreen />
              </div>
            )}
            <button onClick={() => setTripPhase("day")} style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#22c55e,#059669)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>
              🏁 I've Arrived! Start Day 1 →
            </button>
          </div>
        )}

        {/* DAY PHASE */}
        {tripPhase === "day" && (
          <div style={{ animation: "slideUp 0.4s ease" }}>
            <div style={{ background: `linear-gradient(135deg,${accent}22,#1e293b)`, border: `2px solid ${accent}40`, borderRadius: 20, padding: "20px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, marginBottom: 4 }}>DAY {currentDay + 1} OF {totalDays}</div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800 }}>{days[currentDay]?.title}</h2>
                  <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 8px" }}>{days[currentDay]?.theme}</p>
                  {days[currentDay]?.stay && <div style={{ fontSize: 12, color: accent }}>🏨 Tonight: {days[currentDay]?.stay} · {days[currentDay]?.stay_cost}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Day Budget</div>
                  <div style={{ fontWeight: 900, color: "#22c55e", fontSize: 18 }}>{days[currentDay]?.cost}</div>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Activities Done</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>{completedCount}/{totalActivities}</span>
                </div>
                <div style={{ height: 6, background: "#334155", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: `linear-gradient(90deg,${accent},#22c55e)`, width: `${totalActivities ? completedCount / totalActivities * 100 : 0}%`, transition: "width 0.5s", borderRadius: 10 }} />
                </div>
              </div>
            </div>

            {days[currentDay]?.meals && (
              <div style={{ background: "#1e293b", borderRadius: 16, padding: "14px", marginBottom: 14, border: "1px solid #334155" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#f59e0b", marginBottom: 10 }}>🍽 Today's Meals</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[["☀️", "Breakfast", days[currentDay].meals.breakfast], ["🌞", "Lunch", days[currentDay].meals.lunch], ["🌙", "Dinner", days[currentDay].meals.dinner]].filter(([,, m]) => m).map(([e, l, m]) => (
                    <div key={l} style={{ background: "#0f172a", borderRadius: 12, padding: "10px" }}>
                      <div style={{ fontSize: 16, marginBottom: 4 }}>{e}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>{l}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginTop: 2 }}>{m.item}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>@ {m.place}</div>
                      <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 700, marginTop: 3 }}>{m.cost}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 10 }}>📍 Today's Activities</div>
            {allActivities.map((a, j) => {
              const done = isDone(currentDay, j);
              return (
                <div key={j} style={{ background: done ? "#0f2c1a" : "#1e293b", borderRadius: 16, padding: "16px", marginBottom: 12, border: `2px solid ${done ? "#22c55e" : "#334155"}`, transition: "all 0.3s" }}>
                  <PlaceImage query={`${a.name} ${r.meta?.location}`} height={220} dayIndex={j} actIndex={j} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{a.emoji || "📍"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: done ? "#22c55e" : "#fff" }}>{a.name}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                          {a.time && <span style={{ fontSize: 11, background: `${accent}20`, color: accent, borderRadius: 8, padding: "2px 8px", fontWeight: 700 }}>{a.time}</span>}
                          {a.duration && <span style={{ fontSize: 11, background: "#334155", color: "#94a3b8", borderRadius: 8, padding: "2px 8px" }}>⏱️ {a.duration}</span>}
                          {a.cost && <span style={{ fontSize: 11, background: "#052e16", color: "#22c55e", borderRadius: 8, padding: "2px 8px", fontWeight: 700 }}>{a.cost}</span>}
                        </div>
                      </div>
                    </div>
                    {done && <span style={{ fontSize: 20 }}>✅</span>}
                  </div>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 10px" }}>{a.description}</p>
                  {a.tip && <div style={{ background: "#1a1200", border: "1px solid #f59e0b40", borderRadius: 10, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#f59e0b" }}>💡 {a.tip}</div>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => openMap(a.name, r.meta?.location)} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>🗺 Navigate Here</button>
                    {!done && <button onClick={() => markDone(currentDay, j)} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#22c55e,#059669)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>✓ Mark Done</button>}
                  </div>
                </div>
              );
            })}

            {nearbyPlaces.length > 0 && (
              <div style={{ background: "#1e293b", borderRadius: 16, padding: "16px", marginBottom: 14, border: "1px solid #334155" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 12 }}>📍 Nearby Places</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {nearbyPlaces.map((p, k) => (
                    <div key={k} style={{ background: "#0f172a", borderRadius: 12, overflow: "hidden" }}>
                      <PlaceImage query={`${p.name} ${r.meta?.location}`} height={130} dayIndex={currentDay} actIndex={k + 10} />
                      <div style={{ padding: "10px" }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{p.name}</div>
                        {p.type && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{p.type}</div>}
                        {p.distance && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>📍 {p.distance}</div>}
                        {p.entry_fee && <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginTop: 2 }}>💰 {p.entry_fee}</div>}
                        <button onClick={() => openMap(p.name, r.meta?.location)} style={{ marginTop: 8, width: "100%", padding: "6px", borderRadius: 8, border: "none", background: "#1e293b", color: "#60a5fa", fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>🗺 Navigate</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              {currentDay > 0 && <button onClick={() => setCurrentDay(d => d - 1)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid #334155", background: "#1e293b", color: "#94a3b8", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>← Day {currentDay}</button>}
              {currentDay < totalDays - 1 ? (
                <button onClick={() => { setCurrentDay(d => d + 1); }} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${accent},#7c3aed)`, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Day {currentDay + 2} →</button>
              ) : (
                <button onClick={() => setTripPhase(returnTravel ? "returnTravel" : "complete")} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>🏠 Head Back Home →</button>
              )}
            </div>
          </div>
        )}

        {/* MAP MODAL */}
        {showMap && currentPlace && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: 16 }}>
            <div style={{ background: "#1e293b", borderRadius: 20, width: "100%", maxWidth: 700, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155" }}>
                <div><div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>🗺 {currentPlace.name}</div><div style={{ fontSize: 12, color: "#94a3b8" }}>{currentPlace.location}</div></div>
                <button onClick={() => setShowMap(false)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #475569", background: "#334155", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✕ Close</button>
              </div>
              <div style={{ flex: 1, minHeight: 380 }}>
                <iframe title="place-map" width="100%" height="380" frameBorder="0" src={`https://maps.google.com/maps?q=${encodeURIComponent(currentPlace.name + ", " + currentPlace.location)}&output=embed&z=15`} allowFullScreen />
              </div>
              <div style={{ padding: "12px 16px", display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid #334155" }}>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(currentPlace.name + ", " + currentPlace.location)}`} target="_blank" rel="noreferrer" style={{ padding: "8px 14px", borderRadius: 10, background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>📍 Full Map</a>
                <a href={`https://www.google.com/maps/dir/My+Location/${encodeURIComponent(currentPlace.name + ", " + currentPlace.location)}`} target="_blank" rel="noreferrer" style={{ padding: "8px 14px", borderRadius: 10, background: "#059669", color: "#fff", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>🧭 Directions</a>
              </div>
            </div>
          </div>
        )}

        {/* RETURN TRAVEL PHASE */}
        {tripPhase === "returnTravel" && (
          <div style={{ animation: "slideUp 0.4s ease" }}>
            <div style={{ background: "linear-gradient(135deg,#7c3aed22,#1e293b)", border: "2px solid #7c3aed40", borderRadius: 20, padding: "24px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🏠</div>
              <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800 }}>Time to Head Home!</h2>
              <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>{r.meta?.location} → {r.meta?.from}</p>
            </div>
            {returnTravel && returnTravel.map((t, i) => (
              <div key={i} style={{ background: "#1e293b", borderRadius: 16, padding: "16px", marginBottom: 12, border: `2px solid ${t.recommended ? "#7c3aed" : "#334155"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 28 }}>{t.emoji}</span>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{t.mode}</span>
                        {t.recommended && <span style={{ background: "#7c3aed", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 10 }}>⭐ BEST</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{t.details}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, color: "#22c55e", fontSize: 16 }}>{t.cost}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>⏱️ {t.duration}</div>
                  </div>
                </div>
                {t.schedule?.length > 0 && (
                  <div style={{ borderTop: "1px solid #334155", paddingTop: 12, marginTop: 12 }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: 9, top: 0, bottom: 0, width: 2, background: "#334155" }} />
                      {t.schedule.map((s, j) => (
                        <div key={j} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: j === 0 ? "#22c55e" : j === t.schedule.length - 1 ? "#ef4444" : "#7c3aed", border: "2px solid #0f172a", flexShrink: 0, zIndex: 1 }} />
                          <div style={{ background: "#0f172a", borderRadius: 10, padding: "8px 12px", flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontWeight: 700, fontSize: 13 }}>{s.station || s.stop}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>{s.time}</span>
                            </div>
                            {s.note && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.note}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {r.meta?.location && r.meta?.from && (
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #334155", marginBottom: 16 }}>
                <iframe title="return" width="100%" height="240" frameBorder="0" src={`https://maps.google.com/maps?saddr=${encodeURIComponent(r.meta?.location || "")}&daddr=${encodeURIComponent(r.meta?.from || "")}&directionsmode=driving&output=embed`} allowFullScreen />
              </div>
            )}
            <button onClick={() => setTripPhase("complete")} style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>🏡 I'm Home! Complete Trip →</button>
          </div>
        )}

        {/* COMPLETE PHASE */}
        {tripPhase === "complete" && (
          <div style={{ animation: "slideUp 0.4s ease", textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontWeight: 900, fontSize: 26, margin: "0 0 8px" }}>Trip Complete!</h2>
            <p style={{ color: "#94a3b8", fontSize: 15, margin: "0 0 24px", lineHeight: 1.6 }}>You've successfully completed your trip to <strong style={{ color: "#fff" }}>{r.meta?.location}</strong>! 🌟</p>
            <div style={{ background: "#1e293b", borderRadius: 20, padding: "20px", marginBottom: 24, textAlign: "left" }}>
              {[["📍 Route", `${r.meta?.from || "Home"} → ${r.meta?.location} → ${r.meta?.from || "Home"}`], ["📅 Duration", `${r.meta?.days} days`], ["👥 Travelers", `${r.meta?.travelers} person(s)`], ["💰 Budget", `${r.meta?.currency} ${parseInt(r.meta?.budget || 0).toLocaleString()}`], ["🏁 Activities", `${Object.keys(completedActivities).length} completed`]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #334155" }}>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>{l}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{v}</span>
                </div>
              ))}
            </div>
            {/* 🆕 FUTURE SCOPE: Download + Rate options */}
            <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
              <button onClick={() => downloadTripHTML(r)} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#059669,#0891b2)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>⬇️ Download Trip Report (HTML)</button>
              <button onClick={() => setShowRating(true)} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>⭐ Rate Your Trip</button>
              <button onClick={onClose} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>← Back to Trip Plan</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AUTH PAGE ──────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  // ✅ FIX: Separate state for login and signup — prevents pre-filled password dots
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ FIX: Clear everything when switching tabs
  function switchTab(t) {
    setTab(t);
    setError("");
    setSuccess("");
    setLoginForm({ email: "", password: "" });
    setSignupForm({ name: "", email: "", password: "", confirm: "" });
  }

  async function handleLogin() {
    if (!loginForm.email || !loginForm.password) { setError("Please fill all fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); setLoading(false); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch { setError("Cannot connect to server."); }
    setLoading(false);
  }

  async function handleSignup() {
    if (!signupForm.name || !signupForm.email || !signupForm.password || !signupForm.confirm) { setError("Please fill all fields."); return; }
    if (signupForm.password !== signupForm.confirm) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signupForm.name, email: signupForm.email, password: signupForm.password })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); setLoading(false); return; }
      setSuccess("Account created! Please login.");
      switchTab("login");
    } catch { setError("Cannot connect to server."); }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      background: "linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#312e81 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus { border-color:#2563eb!important; box-shadow:0 0 0 3px rgba(37,99,235,0.15); }
        .auth-input::placeholder { color: #94a3b8; }
      `}</style>

      {/* Top bar */}
      <div style={{ width: "100%", maxWidth: 1100, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✈️</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>Trip Nova</span>
        </div>
        <span style={{ fontSize: 12, background: "rgba(255,255,255,0.1)", color: "#94a3b8", padding: "5px 14px", borderRadius: 20, fontWeight: 700 }}>College Project</span>
      </div>

      {/* Main content — side by side on wide screens */}
      <div style={{
        flex: 1, width: "100%", maxWidth: 1100,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 24px 40px", gap: 48,
        flexWrap: "wrap",
      }}>

        {/* Left — Branding */}
        <div style={{ flex: "1 1 340px", textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🌍</div>
          <h1 style={{ margin: "0 0 12px", fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
            Trip Nova
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 16, margin: "0 0 28px", lineHeight: 1.7 }}>
            Chat · Voice · Plan · Navigate · Explore
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {["🤖 AI Chatbot", "🎙 Voice Planning", "🗺 Live Navigator", "📊 Budget Tracker", "⭐ Trip Rating", "🆘 Emergency Info"].map(f => (
              <span key={f} style={{
                background: "rgba(255,255,255,0.08)", color: "#e2e8f0",
                fontSize: 12, fontWeight: 600, padding: "6px 14px",
                borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)"
              }}>{f}</span>
            ))}
          </div>
        </div>

        {/* Right — Auth Card (LARGE) */}
        <div style={{
          flex: "1 1 420px", maxWidth: 480,
          background: "#fff", borderRadius: 28,
          padding: "36px 32px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 14, padding: 5, marginBottom: 28 }}>
            {["login", "signup"].map(t => (
              <button key={t} onClick={() => switchTab(t)} style={{
                flex: 1, padding: "12px", borderRadius: 10, border: "none",
                fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
                background: tab === t ? "#2563eb" : "none",
                color: tab === t ? "#fff" : "#64748b",
                transition: "all 0.2s",
              }}>
                {t === "login" ? "🔑 Login" : "📝 Sign Up"}
              </button>
            ))}
          </div>

          {/* Messages */}
          {success && (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: "12px 16px", color: "#166534", fontWeight: 600, fontSize: 14, marginBottom: 18 }}>✅ {success}</div>
          )}
          {error && (
            <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "12px 16px", color: "#dc2626", fontWeight: 600, fontSize: 14, marginBottom: 18 }}>⚠️ {error}</div>
          )}

          {/* LOGIN FORM */}
          {tab === "login" && (
            <>
              <h2 style={{ margin: "0 0 24px", fontWeight: 800, color: "#1e293b", fontSize: 22 }}>Welcome Back 👋</h2>
              <div style={{ marginBottom: 16 }}>
                <Lbl>EMAIL ADDRESS</Lbl>
                <input
                  className="auth-input"
                  type="email" placeholder="you@email.com"
                  value={loginForm.email}
                  onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  autoComplete="email"
                  style={{ ...inp({ padding: "14px 16px", fontSize: 15, borderRadius: 12 }) }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <Lbl>PASSWORD</Lbl>
                <input
                  className="auth-input"
                  type="password" placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  autoComplete="current-password"
                  style={{ ...inp({ padding: "14px 16px", fontSize: 15, borderRadius: 12 }) }}
                />
              </div>
              <button onClick={handleLogin} disabled={loading} style={{
                width: "100%", padding: "15px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                color: "#fff", fontWeight: 800, fontSize: 16,
                cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 18px rgba(37,99,235,0.35)",
              }}>{loading ? "Logging in…" : "Login →"}</button>
              <p style={{ textAlign: "center", fontSize: 14, color: "#64748b", marginTop: 18, marginBottom: 0 }}>
                No account?{" "}
                <button onClick={() => switchTab("signup")} style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Sign Up</button>
              </p>
            </>
          )}

          {/* SIGNUP FORM */}
          {tab === "signup" && (
            <>
              <h2 style={{ margin: "0 0 24px", fontWeight: 800, color: "#1e293b", fontSize: 22 }}>Create Account 🚀</h2>
              <div style={{ marginBottom: 14 }}>
                <Lbl>FULL NAME</Lbl>
                <input
                  className="auth-input"
                  type="text" placeholder="Your full name"
                  value={signupForm.name}
                  onChange={e => setSignupForm(f => ({ ...f, name: e.target.value }))}
                  autoComplete="name"
                  style={{ ...inp({ padding: "14px 16px", fontSize: 15, borderRadius: 12 }) }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <Lbl>EMAIL ADDRESS</Lbl>
                <input
                  className="auth-input"
                  type="email" placeholder="you@email.com"
                  value={signupForm.email}
                  onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                  style={{ ...inp({ padding: "14px 16px", fontSize: 15, borderRadius: 12 }) }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <Lbl>PASSWORD</Lbl>
                <input
                  className="auth-input"
                  type="password" placeholder="Create a password"
                  value={signupForm.password}
                  onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="new-password"
                  style={{ ...inp({ padding: "14px 16px", fontSize: 15, borderRadius: 12 }) }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <Lbl>CONFIRM PASSWORD</Lbl>
                <input
                  className="auth-input"
                  type="password" placeholder="Repeat your password"
                  value={signupForm.confirm}
                  onChange={e => setSignupForm(f => ({ ...f, confirm: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && handleSignup()}
                  autoComplete="new-password"
                  style={{ ...inp({ padding: "14px 16px", fontSize: 15, borderRadius: 12 }) }}
                />
              </div>
              <button onClick={handleSignup} disabled={loading} style={{
                width: "100%", padding: "15px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg,#059669,#0891b2)",
                color: "#fff", fontWeight: 800, fontSize: 16,
                cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 18px rgba(5,150,105,0.35)",
              }}>{loading ? "Creating…" : "Create Account →"}</button>
              <p style={{ textAlign: "center", fontSize: 14, color: "#64748b", marginTop: 18, marginBottom: 0 }}>
                Already registered?{" "}
                <button onClick={() => switchTab("login")} style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Login</button>
              </p>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: "16px", color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center" }}>
        🎓 Trip Nova · College Project · React · Node.js · MongoDB · Groq AI
      </div>
    </div>
  );
}

// ── NAVBAR ─────────────────────────────────────────────────────
function Navbar({ user, activePage, setPage, onLogout }) {
  const menus = [
    { id: "home",    label: "🏠 Home" },
    { id: "planner", label: "✈️ Plan Trip" },
    { id: "weather", label: "🌤 Weather" },
    { id: "map",     label: "🗺 Map" },
    { id: "hotels",  label: "🏨 Hotels" },
    { id: "reviews", label: "⭐ Reviews" },
    { id: "profile", label: "👤 Profile" },
    { id: "about",   label: "ℹ️ About" },
  ];
  return (
    <div style={{ background: "#fff", borderBottom: "2px solid #e2e8f0", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✈️</div>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", whiteSpace: "nowrap" }}>Trip Nova</span>
        </div>
        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", overflowX: "auto", flexShrink: 1 }}>
          {menus.map(m => (
            <button key={m.id} onClick={() => setPage(m.id)} style={{
              padding: "8px 14px", borderRadius: 10, border: "none",
              fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              background: activePage === m.id ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "#f1f5f9",
              color: activePage === m.id ? "#fff" : "#475569",
              whiteSpace: "nowrap", transition: "all 0.18s",
              boxShadow: activePage === m.id ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
            }}>{m.label}</button>
          ))}
        </div>
        {/* User area */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>{user.name[0].toUpperCase()}</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>{user.name}</span>
          <button onClick={onLogout} style={{ padding: "7px 14px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", color: "#ef4444", fontFamily: "inherit" }}>Logout</button>
        </div>
      </div>
    </div>
  );
}

// ── WEATHER PAGE ───────────────────────────────────────────────
function WeatherPage({ defaultCity = "" }) {
  const [city, setCity] = useState(defaultCity); const [data, setData] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (defaultCity) fetchW(defaultCity); }, [defaultCity]);
  async function fetchW(c = city) {
    if (!c) return; setLoading(true); setError(""); setData(null);
    try {
      const g = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(c)}&count=1`)).json();
      if (!g.results?.length) { setError("City not found."); setLoading(false); return; }
      const { latitude: lat, longitude: lon, name, country } = g.results[0];
      const w = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&timezone=auto&forecast_days=5`)).json();
      const cur = w.current; const d = w.daily;
      const dc = code => { if (code === 0) return { desc: "Clear Sky", emoji: "☀️" }; if (code <= 3) return { desc: "Partly Cloudy", emoji: "⛅" }; if (code <= 48) return { desc: "Foggy", emoji: "🌫" }; if (code <= 57) return { desc: "Drizzle", emoji: "🌦" }; if (code <= 67) return { desc: "Rain", emoji: "🌧" }; if (code <= 77) return { desc: "Snow", emoji: "❄️" }; if (code <= 99) return { desc: "Thunderstorm", emoji: "⛈️" }; return { desc: "Cloudy", emoji: "☁️" }; };
      setData({ city: name, country, temp: Math.round(cur.temperature_2m), feels: Math.round(cur.apparent_temperature), humidity: cur.relative_humidity_2m, wind: Math.round(cur.wind_speed_10m), visibility: cur.visibility ? Math.round(cur.visibility / 1000) : "N/A", ...dc(cur.weather_code), forecast: d.time.map((date, i) => ({ date, max: Math.round(d.temperature_2m_max[i]), min: Math.round(d.temperature_2m_min[i]), rain: d.precipitation_sum[i], ...dc(d.weather_code[i]) })) });
    } catch { setError("Failed to fetch weather."); } setLoading(false);
  }
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontWeight: 800, color: "#1e293b", fontSize: 20, margin: "0 0 16px" }}>🌤 Live Weather</h2>
      <Card>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchW()} placeholder="Enter city e.g. Goa, Tokyo" style={{ ...inp(), flex: 1 }} />
          <button onClick={() => fetchW()} style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0ea5e9,#2563eb)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{loading ? "…" : "Search"}</button>
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 10, marginBottom: 0 }}>⚠️ {error}</p>}
      </Card>
      {data && (
        <>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 54 }}>{data.emoji}</div>
                <div style={{ fontWeight: 900, fontSize: 34, color: "#1e293b", lineHeight: 1 }}>{data.temp}°C</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{data.desc}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#1e293b" }}>{data.city}, {data.country}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                  {[["Feels Like", `${data.feels}°C`], ["Humidity", `${data.humidity}%`], ["Wind", `${data.wind} km/h`], ["Visibility", `${data.visibility} km`]].map(([l, v]) => (
                    <div key={l} style={{ background: "#f1f5f9", borderRadius: 10, padding: "8px 12px" }}><div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{l}</div><div style={{ fontWeight: 800, color: "#1e293b", fontSize: 14 }}>{v}</div></div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
          <h3 style={{ fontWeight: 800, color: "#1e293b", fontSize: 16, margin: "0 0 10px" }}>📅 5-Day Forecast</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
            {data.forecast.map((f, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "12px 6px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #e8edf4" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{new Date(f.date).toLocaleDateString("en", { weekday: "short" })}</div>
                <div style={{ fontSize: 24, margin: "6px 0" }}>{f.emoji}</div>
                <div style={{ fontWeight: 800, color: "#1e293b", fontSize: 14 }}>{f.max}°</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{f.min}°</div>
                {f.rain > 0 && <div style={{ fontSize: 11, color: "#0ea5e9", fontWeight: 700, marginTop: 3 }}>💧{f.rain}mm</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── MAP PAGE ───────────────────────────────────────────────────
function MapPage({ defaultFrom = "", defaultTo = "" }) {
  const [from, setFrom] = useState(defaultFrom); const [to, setTo] = useState(defaultTo); const [search, setSearch] = useState(defaultTo || "India"); const [location, setLocation] = useState(defaultTo || "India"); const [showDir, setShowDir] = useState(!!(defaultFrom && defaultTo)); const [mode, setMode] = useState("driving"); const q = encodeURIComponent(location);
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontWeight: 800, color: "#1e293b", fontSize: 20, margin: "0 0 16px" }}>🗺 Explore & Directions</h2>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div><Lbl>FROM</Lbl><input value={from} onChange={e => setFrom(e.target.value)} placeholder="Starting location" style={inp()} /></div>
          <div><Lbl>TO</Lbl><input value={to} onChange={e => setTo(e.target.value)} placeholder="Destination" style={inp()} /></div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {[["driving", "🚗"], ["transit", "🚆"], ["walking", "🚶"]].map(([m, e]) => (
            <button key={m} onClick={() => setMode(m)} style={{ padding: "8px 14px", borderRadius: 10, border: `2px solid ${mode === m ? "#2563eb" : "#e2e8f0"}`, background: mode === m ? "#eff6ff" : "#fff", color: mode === m ? "#2563eb" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{e}</button>
          ))}
        </div>
        <button onClick={() => { if (from && to) { setShowDir(true); setLocation(to); } }} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>🧭 Get Directions</button>
      </Card>
      <Card>
        {!showDir && (
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && search.trim()) setLocation(search.trim()); }} placeholder="Search any place" style={{ ...inp(), flex: 1 }} />
            <button onClick={() => { if (search.trim()) setLocation(search.trim()); }} style={{ padding: "12px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#059669,#0891b2)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>🔍</button>
          </div>
        )}
        {showDir && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><span style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>🧭 {from} → {to}</span><button onClick={() => setShowDir(false)} style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", color: "#64748b", fontFamily: "inherit" }}>✕</button></div>}
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <iframe key={showDir ? `d-${from}-${to}-${mode}` : location} title="map" width="100%" height="400" frameBorder="0" style={{ display: "block" }} src={showDir && from && to ? `https://maps.google.com/maps?saddr=${encodeURIComponent(from)}&daddr=${encodeURIComponent(to)}&directionsmode=${mode}&output=embed` : `https://maps.google.com/maps?q=${q}&output=embed&z=12`} allowFullScreen />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {[["🏨 Hotels", "hotels"], ["🍽 Food", "restaurants"], ["🏛 Attractions", "tourist attractions"], ["🛍 Shopping", "shopping"]].map(([label, type]) => (
            <a key={type} href={`https://www.google.com/maps/search/${encodeURIComponent(type)}+in+${q}`} target="_blank" rel="noreferrer" style={{ padding: "7px 14px", borderRadius: 10, background: "#f1f5f9", color: "#475569", fontWeight: 700, fontSize: 12, textDecoration: "none", border: "1px solid #e2e8f0" }}>{label}</a>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── HOTELS PAGE ─────────────────────────────────────────────────
function HotelsPage({ defaultCity = "" }) {
  const [city, setCity] = useState(defaultCity); const [budget, setBudget] = useState("mid"); const [hotels, setHotels] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (defaultCity) findHotels(defaultCity); }, [defaultCity]);
  async function findHotels(c = city) {
    if (!c) return; setLoading(true); setHotels(null); setError("");
    try {
      const raw = await callGroq(`Suggest 6 real hotels in ${c} for ${budget} budget. Return ONLY JSON:{"hotels":[{"name":"","type":"Budget/MidRange/Luxury","price":"₹XXX/night","area":"","rating":"4.2/5","highlight":"","description":"2 sentences","phone":"+91-XXXXXXXXXX","amenities":["WiFi","AC"]}]}`);
      setHotels(JSON.parse(raw).hotels);
    } catch (e) { setError("Could not fetch hotels: " + e.message); }
    setLoading(false);
  }
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontWeight: 800, color: "#1e293b", fontSize: 20, margin: "0 0 16px" }}>🏨 Hotel Suggestions</h2>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 12 }}>
          <input value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === "Enter" && findHotels()} placeholder="Enter city e.g. Goa, Mumbai" style={inp()} />
          <select value={budget} onChange={e => setBudget(e.target.value)} style={{ ...inp(), width: 130 }}><option value="budget">🎒 Budget</option><option value="mid">🏨 Mid-Range</option><option value="luxury">✨ Luxury</option></select>
        </div>
        <button onClick={() => findHotels()} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#d97706,#dc2626)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{loading ? "Finding…" : "🏨 Find Hotels"}</button>
        {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 10, marginBottom: 0 }}>⚠️ {error}</p>}
      </Card>
      {hotels?.map((h, i) => {
        const c = h.type === "Budget" ? "#059669" : h.type === "Luxury" ? "#d97706" : "#2563eb";
        return (
          <Card key={i}>
            <HotelImage hotelName={h.name} location={city} height={220} />
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}><span style={{ fontWeight: 800, color: "#1e293b", fontSize: 15 }}>🏨 {h.name}</span><Badge text={h.type} color={c} /></div>
                <div style={{ fontSize: 13, color: "#64748b" }}>📍 {h.area} · ⭐ {h.rating}</div>
                {h.description && <div style={{ fontSize: 13, color: "#475569", marginTop: 4, lineHeight: 1.5 }}>{h.description}</div>}
                {h.phone && <div style={{ fontSize: 12, color: "#2563eb", marginTop: 3 }}>📞 {h.phone}</div>}
                {h.amenities?.length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>{h.amenities.map((a, j) => <span key={j} style={{ fontSize: 11, background: "#f1f5f9", color: "#475569", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>✓ {a}</span>)}</div>}
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name + " " + city)}`} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 10, padding: "6px 14px", borderRadius: 8, background: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>📍 Maps →</a>
              </div>
              <div style={{ fontWeight: 900, color: c, fontSize: 16, whiteSpace: "nowrap" }}>{h.price}</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── PROFILE PAGE ────────────────────────────────────────────────
function ProfilePage({ user, setPage }) {
  const [history] = useState(() => JSON.parse(localStorage.getItem("tripHistory") || "[]"));
  const [viewTrip, setViewTrip] = useState(null);
  const [liveTripResult, setLiveTripResult] = useState(null);
  // 🆕 FUTURE SCOPE: ratings
  const [ratings] = useState(() => JSON.parse(localStorage.getItem("tripRatings") || "[]"));

  function clearHistory() { localStorage.removeItem("tripHistory"); window.location.reload(); }
  if (liveTripResult) return <LiveTripNavigator result={liveTripResult} onClose={() => setLiveTripResult(null)} />;
  if (viewTrip) return <TripResult result={viewTrip} onBack={() => setViewTrip(null)} fromProfile onStartTrip={setLiveTripResult} />;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontWeight: 800, color: "#1e293b", fontSize: 20, margin: "0 0 16px" }}>👤 My Profile</h2>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 26 }}>{user.name[0].toUpperCase()}</div>
          <div><div style={{ fontWeight: 800, color: "#1e293b", fontSize: 20 }}>{user.name}</div><div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>📧 {user.email}</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
          {[{ label: "Trips", value: history.length, emoji: "✈️", color: "#2563eb" }, { label: "Cities", value: [...new Set(history.map(h => h.location))].length, emoji: "🌍", color: "#059669" }, { label: "Days", value: history.reduce((s, h) => s + (parseInt(h.days) || 0), 0), emoji: "📅", color: "#d97706" }].map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, borderRadius: 12, padding: "12px", textAlign: "center", border: `1.5px solid ${s.color}20` }}>
              <div style={{ fontSize: 20 }}>{s.emoji}</div>
              <div style={{ fontWeight: 900, color: s.color, fontSize: 22 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* 🆕 FUTURE SCOPE: Show saved ratings */}
      {ratings.length > 0 && (
        <Card>
          <h3 style={{ margin: "0 0 12px", fontWeight: 800, color: "#1e293b", fontSize: 15 }}>⭐ My Reviews</h3>
          {ratings.slice(-3).reverse().map((r, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{r.tripTitle}</div>
              <div style={{ fontSize: 16, margin: "4px 0" }}>{"⭐".repeat(r.rating)}</div>
              {r.review && <div style={{ fontSize: 12, color: "#64748b" }}>{r.review}</div>}
            </div>
          ))}
        </Card>
      )}

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontWeight: 800, color: "#1e293b", fontSize: 16 }}>📋 Trip History <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>(tap to view)</span></h3>
          {history.length > 0 && <button onClick={clearHistory} style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>🗑 Clear</button>}
        </div>
        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 40 }}>✈️</div>
            <p style={{ marginTop: 12, fontSize: 14 }}>No trips yet.</p>
            <button onClick={() => setPage("planner")} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>Plan First Trip</button>
          </div>
        ) : history.slice().reverse().map((trip, i) => (
          <div key={i} style={{ padding: "14px 16px", borderRadius: 14, background: "#f8fafc", border: "1.5px solid #e2e8f0", marginBottom: 10 }}>
            <div style={{ fontWeight: 800, color: "#1e293b", fontSize: 15 }}>{trip.from ? `📍 ${trip.from} → ${trip.location}` : `📍 ${trip.location}`}</div>
            {trip.title && <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 600, marginTop: 2 }}>{trip.title}</div>}
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>📅 {trip.days} days · 👥 {trip.travelers} · 💰 {trip.currency} {parseInt(trip.budget || 0).toLocaleString()}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>🕐 {new Date(trip.date).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {trip.fullResult && <button onClick={() => setViewTrip(trip.fullResult)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>👁 View</button>}
              {trip.fullResult && <button onClick={() => setLiveTripResult(trip.fullResult)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#22c55e,#059669)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>🚀 Start Trip</button>}
              {/* 🆕 FUTURE SCOPE: Download from history */}
              {trip.fullResult && <button onClick={() => downloadTripHTML(trip.fullResult)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#f0fdf4", color: "#059669", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>⬇️</button>}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── ABOUT PAGE ──────────────────────────────────────────────────
function AboutPage() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <Card style={{ background: "linear-gradient(135deg,#1e3a8a,#1e293b)", border: "none" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52 }}>✈️</div>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 22, margin: "10px 0 8px" }}>Trip Nova</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, margin: 0 }}>Full AI trip planning with chatbot, voice assistant, live navigation, interests and real schedules.</p>
        </div>
      </Card>
      <Card style={{ background: "#1e293b", border: "none" }}>
        <h3 style={{ fontWeight: 800, color: "#fff", fontSize: 15, margin: "0 0 14px" }}>🧠 Tech Stack</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[{ l: "Frontend", v: "React.js", e: "⚛️", c: "#61dafb" }, { l: "Backend", v: "Node.js+Express", e: "🟢", c: "#86efac" }, { l: "Database", v: "MongoDB", e: "🍃", c: "#4ade80" }, { l: "Auth", v: "JWT+bcrypt", e: "🔐", c: "#f472b6" }, { l: "AI Engine", v: "Groq (Free)", e: "🤖", c: "#a78bfa" }, { l: "Voice", v: "Web Speech API", e: "🎙", c: "#f59e0b" }].map(t => (
            <div key={t.l} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 12px", border: `1px solid ${t.c}30` }}>
              <div style={{ fontSize: 16 }}>{t.e}</div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginTop: 3 }}>{t.l}</div>
              <div style={{ fontWeight: 800, color: t.c, fontSize: 13 }}>{t.v}</div>
            </div>
          ))}
        </div>
      </Card>
      {/* 🆕 FUTURE SCOPE: Features list */}
      <Card>
        <h3 style={{ fontWeight: 800, color: "#1e293b", fontSize: 15, margin: "0 0 14px" }}>🚀 Future Scope Features (Implemented)</h3>
        {[["📊", "Budget Tracker", "Log & track real expenses during your trip vs planned budget"],["⭐", "Trip Rating & Review", "Rate your completed trips and save reviews"],["⬇️", "Download Trip (HTML)", "Download full trip plan as offline HTML file"],["🆘", "Emergency Numbers", "Quick access to police, ambulance, helplines during live trip"],["🖼️", "Image Fix", "Replaced dead Unsplash Source API with Picsum Photos (always works)"]].map(([e, t, d]) => (
          <div key={t} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{e}</span>
            <div><div style={{ fontWeight: 700, color: "#1e293b", fontSize: 13 }}>{t}</div><div style={{ fontSize: 12, color: "#64748b" }}>{d}</div></div>
          </div>
        ))}
      </Card>
      <div style={{ textAlign: "center", padding: "10px", color: "#94a3b8", fontSize: 13 }}>🎓 Made with ❤️ as a College Project</div>
    </div>
  );
}

// ── TRIP RESULT ─────────────────────────────────────────────────
function TripResult({ result: r, onBack, fromProfile = false, onStartTrip }) {
  const [activeTab, setActiveTab] = useState(r.travelInfo ? "travel" : "itinerary");
  const colors = ["#2563eb", "#7c3aed", "#0ea5e9", "#059669", "#d97706", "#dc2626"];
  const [weather, setWeather] = useState(null); const [wLoading, setWLoading] = useState(false);
  // 🆕 FUTURE SCOPE state
  const [showTracker, setShowTracker] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showRating, setShowRating] = useState(false);

  const tabs = [...(r.travelInfo ? [{ id: "travel", label: "🚌 Travel" }] : []), { id: "itinerary", label: "📅 Itinerary" }, { id: "weather", label: "🌤 Weather" }, { id: "map", label: "🗺 Map" }, { id: "hotels", label: "🏨 Hotels" }, { id: "budget", label: "💰 Budget" }, { id: "tips", label: "💡 Tips" }];

  useEffect(() => {
    if (activeTab === "weather" && !weather && r.meta?.location) {
      setWLoading(true);
      (async () => {
        try {
          const g = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(r.meta.location)}&count=1`)).json();
          if (!g.results?.length) return;
          const { latitude: lat, longitude: lon, name, country } = g.results[0];
          const w = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&timezone=auto&forecast_days=5`)).json();
          const cur = w.current; const d = w.daily;
          const dc = code => { if (code === 0) return { desc: "Clear Sky", emoji: "☀️" }; if (code <= 3) return { desc: "Partly Cloudy", emoji: "⛅" }; if (code <= 67) return { desc: "Rain", emoji: "🌧" }; if (code <= 77) return { desc: "Snow", emoji: "❄️" }; if (code <= 99) return { desc: "Thunderstorm", emoji: "⛈️" }; return { desc: "Cloudy", emoji: "☁️" }; };
          setWeather({ city: name, country, temp: Math.round(cur.temperature_2m), feels: Math.round(cur.apparent_temperature), humidity: cur.relative_humidity_2m, wind: Math.round(cur.wind_speed_10m), ...dc(cur.weather_code), forecast: d.time.map((date, i) => ({ date, max: Math.round(d.temperature_2m_max[i]), min: Math.round(d.temperature_2m_min[i]), rain: d.precipitation_sum[i], ...dc(d.weather_code[i]) })) });
        } catch { } setWLoading(false);
      })();
    }
  }, [activeTab]);

  return (
    <div style={{ maxWidth: "100%", margin: "0", paddingBottom: 40 }}>
      {showTracker && <BudgetTracker tripMeta={r.meta} onClose={() => setShowTracker(false)} />}
      {showEmergency && <EmergencyPanel location={r.meta?.location} onClose={() => setShowEmergency(false)} />}
      {showRating && <TripRating tripTitle={r.title} onClose={() => setShowRating(false)} />}

      <div style={{ background: "linear-gradient(135deg,#1e3a8a,#1e293b)", padding: "28px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "#fff" }}>{r.title}</h2>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 10px" }}>{r.summary}</p>
          {r.meta?.from && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", borderRadius: 20, padding: "5px 14px", marginBottom: 10 }}>
              <span style={{ color: "#94a3b8", fontSize: 12 }}>📍 {r.meta.from}</span><span style={{ color: "#fff" }}>→</span><span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>📍 {r.meta.location}</span><span style={{ color: "#fff" }}>→</span><span style={{ color: "#94a3b8", fontSize: 12 }}>🏠 {r.meta.from}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
            {[{ l: "Days", v: r.days?.length, e: "📅" }, { l: "Travelers", v: r.meta?.travelers, e: "👥" }, { l: r.meta?.currency, v: parseInt(r.meta?.budget || 0).toLocaleString(), e: "💰" }].filter(s => s.v).map((s, i) => (
              <div key={i} style={{ padding: "5px 12px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 12 }}>{s.e} <strong>{s.v}</strong> <span style={{ color: "#94a3b8" }}>{s.l}</span></div>
            ))}
          </div>
        </div>

        {/* Start trip banner */}
        <div style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)", borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 800, color: "#22c55e", fontSize: 15 }}>🚀 Ready to travel?</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Start live navigation with step-by-step guide</div>
            </div>
            <button onClick={() => onStartTrip && onStartTrip(r)} style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#22c55e,#059669)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>🗺 Start Trip →</button>
          </div>
        </div>

        {/* 🆕 FUTURE SCOPE quick actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <button onClick={() => downloadTripHTML(r)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>⬇️ Download</button>
          <button onClick={() => setShowTracker(true)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>📊 Track Budget</button>
          <button onClick={() => setShowEmergency(true)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fca5a5", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>🆘 Emergency</button>
          <button onClick={() => setShowRating(true)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fde68a", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>⭐ Rate</button>
          <button onClick={onBack} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>← {fromProfile ? "Profile" : "New Trip"}</button>
        </div>
        </div>{/* end inner max-width div */}
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "13px 14px", border: "none", borderBottom: `3px solid ${activeTab === t.id ? "#2563eb" : "transparent"}`, background: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: activeTab === t.id ? "#2563eb" : "#64748b", whiteSpace: "nowrap" }}>{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "16px 20px 40px" }}>
        {/* TRAVEL TAB */}
        {activeTab === "travel" && r.travelInfo && (
          <div>
            <Card style={{ background: "linear-gradient(135deg,#eff6ff,#f0fdf4)", border: "1.5px solid #bfdbfe" }}>
              <h3 style={{ margin: "0 0 10px", fontWeight: 800, color: "#1e3a8a", fontSize: 15 }}>🧭 {r.meta?.from} → {r.meta?.location} → {r.meta?.from}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["⭐ Best Mode", r.travelInfo.find(t => t.recommended)?.mode || "—"], ["⏱️ Travel Time", r.travelInfo.find(t => t.recommended)?.duration || "—"], ["💰 Best Fare", r.travelInfo.find(t => t.recommended)?.cost || "—"], ["🕐 Depart", r.meta?.departureTime || "—"]].map(([l, v]) => (
                  <div key={l} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px" }}><div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{l}</div><div style={{ fontWeight: 800, color: "#1e293b", fontSize: 13, marginTop: 2 }}>{v}</div></div>
                ))}
              </div>
            </Card>
            {r.travelInfo.map((t, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, marginBottom: 12, border: `2px solid ${t.recommended ? "#2563eb" : "#e8edf4"}`, overflow: "hidden", boxShadow: t.recommended ? "0 4px 20px rgba(37,99,235,0.12)" : "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: t.recommended ? "#eff6ff" : "#fafafa" }}>
                  <div style={{ fontSize: 30 }}>{t.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>{t.mode}</span>
                      {t.recommended && <span style={{ background: "#2563eb", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 10 }}>⭐ BEST</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{t.details}</div>
                  </div>
                  <div style={{ textAlign: "right" }}><div style={{ fontWeight: 900, color: "#059669", fontSize: 16 }}>{t.cost}</div><div style={{ fontSize: 12, color: "#64748b" }}>⏱️ {t.duration}</div></div>
                </div>
                {t.schedule?.length > 0 && (
                  <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9" }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#92400e", marginBottom: 10 }}>🕐 Schedule</div>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: 9, top: 0, bottom: 0, width: 2, background: "#e2e8f0" }} />
                      {t.schedule.map((s, j) => (
                        <div key={j} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: j === 0 ? "#059669" : j === t.schedule.length - 1 ? "#dc2626" : "#2563eb", border: "2px solid #fff", boxShadow: `0 0 0 2px ${j === 0 ? "#059669" : j === t.schedule.length - 1 ? "#dc2626" : "#2563eb"}`, flexShrink: 0, zIndex: 1 }} />
                          <div style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 12px", flex: 1, border: "1px solid #f1f5f9" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{s.station || s.stop}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: j === 0 ? "#059669" : j === t.schedule.length - 1 ? "#dc2626" : "#2563eb" }}>{s.time}</span>
                            </div>
                            {s.note && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.note}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {r.meta?.from && r.meta?.location && (
              <Card>
                <h4 style={{ margin: "0 0 10px", fontWeight: 800, color: "#1e293b", fontSize: 14 }}>🗺 Route Map</h4>
                <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                  <iframe title="route" width="100%" height="280" frameBorder="0" style={{ display: "block" }} src={`https://maps.google.com/maps?saddr=${encodeURIComponent(r.meta?.from || "")}&daddr=${encodeURIComponent(r.meta?.location || "")}&directionsmode=driving&output=embed`} allowFullScreen />
                </div>
              </Card>
            )}
            {r.return_travel && (
              <Card>
                <h4 style={{ margin: "0 0 10px", fontWeight: 800, color: "#7c3aed", fontSize: 14 }}>🏠 Return: {r.meta?.location} → {r.meta?.from}</h4>
                {r.return_travel.filter(t => t.recommended).map((t, i) => (
                  <div key={i} style={{ background: "#f5f3ff", borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, color: "#7c3aed" }}>{t.emoji} {t.mode} — {t.details}</span>
                      <div style={{ textAlign: "right" }}><div style={{ fontWeight: 900, color: "#059669" }}>{t.cost}</div><div style={{ fontSize: 12, color: "#64748b" }}>⏱️ {t.duration}</div></div>
                    </div>
                    {t.schedule?.length > 0 && <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>{t.schedule[0]?.time} {t.schedule[0]?.station} → {t.schedule[t.schedule.length - 1]?.time} {t.schedule[t.schedule.length - 1]?.station}</div>}
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {/* ITINERARY TAB */}
        {activeTab === "itinerary" && (
          <div>
            <PlaceImage query={`${r.meta?.location} tourism`} height={260} />
            {r.meta?.interests?.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {r.meta.interests.map(id => { const interest = INTERESTS.find(i => i.id === id); return interest ? <Badge key={id} text={`${interest.emoji} ${interest.label}`} color="#7c3aed" /> : null; })}
              </div>
            )}
            {r.days?.map((day, i) => {
              const DayItem = () => {
                const [open, setOpen] = useState(i === 0); const accent = colors[i % colors.length];
                return (
                  <div style={{ background: "#fff", borderRadius: 14, marginBottom: 12, border: `1.5px solid ${open ? accent : "#e8edf4"}`, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                    <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${accent},${accent}99)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>{day.title}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{day.theme}</div>
                        {day.stay && <div style={{ fontSize: 11, color: accent, marginTop: 2 }}>🏨 {day.stay} · {day.stay_cost}</div>}
                      </div>
                      {day.cost && <Badge text={day.cost} color={accent} />}
                      <span style={{ color: accent, transform: open ? "rotate(180deg)" : "none", transition: "0.3s", fontSize: 16 }}>▾</span>
                    </button>
                    {open && (
                      <div style={{ padding: "0 14px 14px" }}>
                        <PlaceImage query={`${r.meta?.location} ${day.theme || ""}`} height={220} dayIndex={i} actIndex={0} />
                        {day.meals && (
                          <div style={{ background: "#fff9f0", borderRadius: 12, padding: "12px", marginBottom: 12, border: "1px solid #fed7aa" }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#92400e", marginBottom: 8 }}>🍽 Meal Plan</div>
                            {[["☀️ Breakfast", day.meals.breakfast], ["🌞 Lunch", day.meals.lunch], ["🌙 Dinner", day.meals.dinner]].filter(([, m]) => m).map(([label, m]) => (
                              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#78350f", marginBottom: 5, paddingBottom: 5, borderBottom: "1px solid #fed7aa" }}>
                                <div><strong>{label}:</strong> {m.item} @ {m.place}</div>
                                <strong style={{ color: "#059669" }}>{m.cost}</strong>
                              </div>
                            ))}
                          </div>
                        )}
                        {day.activities?.map((a, j) => (
                          <div key={j} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: j < day.activities.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                            <PlaceImage query={`${a.name} ${r.meta?.location}`} height={220} dayIndex={i} actIndex={j} />
                            <div style={{ display: "flex", gap: 10 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{a.emoji || "📍"}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                                  <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 13 }}>{a.name}</span>
                                  <div style={{ display: "flex", gap: 4 }}>
                                    {a.time && <span style={{ fontSize: 11, color: accent, fontWeight: 700, background: `${accent}15`, borderRadius: 6, padding: "2px 7px" }}>{a.time}</span>}
                                    {a.duration && <span style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", borderRadius: 6, padding: "2px 7px" }}>⏱️ {a.duration}</span>}
                                  </div>
                                </div>
                                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{a.description}</div>
                                {a.cost && <div style={{ fontSize: 11, color: "#059669", fontWeight: 700, marginTop: 4 }}>💰 {a.cost}</div>}
                                {a.tip && <div style={{ marginTop: 6, padding: "6px 10px", background: "#fffbeb", borderRadius: 7, fontSize: 11, color: "#92400e", borderLeft: "3px solid #f59e0b" }}>💡 {a.tip}</div>}
                              </div>
                            </div>
                          </div>
                        ))}
                        {day.nearby_places?.length > 0 && (
                          <div style={{ marginTop: 10 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 10 }}>📍 Nearby Places</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                              {day.nearby_places.map((p, k) => (
                                <div key={k} style={{ background: "#f8fafc", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                                  <PlaceImage query={`${p.name} ${r.meta?.location}`} height={120} dayIndex={i} actIndex={k + 10} />
                                  <div style={{ padding: "8px 10px" }}>
                                    <div style={{ fontWeight: 700, fontSize: 12, color: "#1e293b" }}>{p.name}</div>
                                    {p.type && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{p.type}</div>}
                                    {p.distance && <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>📍 {p.distance}</div>}
                                    {p.entry_fee && <div style={{ fontSize: 10, color: "#059669", fontWeight: 700, marginTop: 1 }}>💰 {p.entry_fee}</div>}
                                    <a href={`https://www.google.com/maps/search/${encodeURIComponent(p.name + ", " + r.meta?.location)}`} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 6, fontSize: 10, color: "#2563eb", fontWeight: 700, textDecoration: "none", background: "#eff6ff", padding: "3px 8px", borderRadius: 6 }}>🗺 Maps</a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, display: "flex", justifyContent: "space-between", border: "1px solid #bbf7d0" }}>
                          <span style={{ fontWeight: 700, color: "#166534", fontSize: 13 }}>📊 Day {i + 1} Total</span>
                          <span style={{ fontWeight: 900, color: "#059669" }}>{day.cost}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              };
              return <DayItem key={i} />;
            })}
            {r.packing?.length > 0 && (
              <Card>
                <h3 style={{ margin: "0 0 12px", fontWeight: 800, color: "#1e293b", fontSize: 15 }}>🎒 Packing List</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {r.packing.map((item, i) => <span key={i} style={{ padding: "6px 14px", borderRadius: 20, background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#475569", fontSize: 13, fontWeight: 600 }}>✓ {item}</span>)}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* WEATHER TAB */}
        {activeTab === "weather" && (
          <div>
            {wLoading && <div style={{ textAlign: "center", padding: "40px" }}><div style={{ fontSize: 40 }}>🌤</div><p style={{ color: "#64748b", marginTop: 12 }}>Fetching weather…</p></div>}
            {weather && (
              <>
                <Card>
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ textAlign: "center", minWidth: 90 }}>
                      <div style={{ fontSize: 54 }}>{weather.emoji}</div>
                      <div style={{ fontWeight: 900, fontSize: 34, color: "#1e293b", lineHeight: 1 }}>{weather.temp}°C</div>
                      <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{weather.desc}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: "#1e293b" }}>{weather.city}, {weather.country}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                        {[["Feels Like", `${weather.feels}°C`], ["Humidity", `${weather.humidity}%`], ["Wind", `${weather.wind} km/h`]].map(([l, v]) => (
                          <div key={l} style={{ background: "#f1f5f9", borderRadius: 10, padding: "8px 12px" }}><div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{l}</div><div style={{ fontWeight: 800, color: "#1e293b", fontSize: 14 }}>{v}</div></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
                <h3 style={{ fontWeight: 800, color: "#1e293b", fontSize: 16, margin: "0 0 10px" }}>📅 5-Day Forecast</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                  {weather.forecast.map((f, i) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "12px 6px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #e8edf4" }}>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{new Date(f.date).toLocaleDateString("en", { weekday: "short" })}</div>
                      <div style={{ fontSize: 24, margin: "6px 0" }}>{f.emoji}</div>
                      <div style={{ fontWeight: 800, color: "#1e293b", fontSize: 14 }}>{f.max}°</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{f.min}°</div>
                      {f.rain > 0 && <div style={{ fontSize: 11, color: "#0ea5e9", fontWeight: 700, marginTop: 3 }}>💧{f.rain}mm</div>}
                    </div>
                  ))}
                </div>
              </>
            )}
            {!wLoading && !weather && <p style={{ textAlign: "center", color: "#94a3b8", padding: "30px" }}>Weather data not available.</p>}
          </div>
        )}

        {/* MAP TAB */}
        {activeTab === "map" && (
          <Card>
            <h3 style={{ margin: "0 0 10px", fontWeight: 800, color: "#1e293b", fontSize: 15 }}>🗺 {r.meta?.location}</h3>
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", marginBottom: 10 }}>
              <iframe title="map" width="100%" height="360" frameBorder="0" style={{ display: "block" }} src={`https://maps.google.com/maps?q=${encodeURIComponent(r.meta?.location || "")}&output=embed&z=12`} allowFullScreen />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[["🏨 Hotels", "hotels"], ["🍽 Food", "restaurants"], ["🏛 Attractions", "tourist attractions"], ["🏖 Beaches", "beaches"], ["🛍 Shopping", "shopping"]].map(([label, type]) => (
                <a key={type} href={`https://www.google.com/maps/search/${encodeURIComponent(type)}+in+${encodeURIComponent(r.meta?.location || "")}`} target="_blank" rel="noreferrer" style={{ padding: "7px 12px", borderRadius: 9, background: "#f1f5f9", color: "#475569", fontWeight: 700, fontSize: 12, textDecoration: "none", border: "1px solid #e2e8f0" }}>{label}</a>
              ))}
            </div>
          </Card>
        )}

        {/* HOTELS TAB */}
        {activeTab === "hotels" && (
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {["All", "Budget", "Mid-Range", "Luxury"].map(type => (
                <span key={type} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "default",
                  background: type === "All" ? "#2563eb" : type === "Budget" ? "#05966920" : type === "Luxury" ? "#d9770620" : "#2563eb20",
                  color: type === "All" ? "#fff" : type === "Budget" ? "#059669" : type === "Luxury" ? "#d97706" : "#2563eb",
                  border: `1px solid ${type === "All" ? "#2563eb" : type === "Budget" ? "#059669" : type === "Luxury" ? "#d97706" : "#2563eb"}40`
                }}>{type === "Budget" ? "🎒" : type === "Mid-Range" ? "🏨" : type === "Luxury" ? "✨" : "🏨"} {type}</span>
              ))}
              <span style={{ fontSize: 12, color: "#64748b", padding: "6px 0", alignSelf: "center" }}>{r.hotels?.length || 0} hotels found</span>
            </div>
            {r.hotels?.map((h, i) => {
              const c = h.type === "Budget" ? "#059669" : h.type === "Luxury" ? "#d97706" : "#2563eb";
              const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(h.name + " hotel " + (r.meta?.location || ""))}`;
              return (
                <Card key={i} style={{ marginBottom: 20 }}>
                  {/* ✅ Google Maps embed shows REAL hotel location on map */}
                  <HotelImage hotelName={h.name} location={r.meta?.location || ""} height={240} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginTop: 4 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                        <span style={{ fontWeight: 800, color: "#1e293b", fontSize: 16 }}>🏨 {h.name}</span>
                        <Badge text={h.type} color={c} />
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>📍 {h.area} · ⭐ {h.rating}</div>
                      {h.description && <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 6 }}>{h.description}</div>}
                      {h.phone && (
                        <a href={`tel:${h.phone}`} style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                          📞 {h.phone}
                        </a>
                      )}
                      {h.amenities?.length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                          {h.amenities.map((a, j) => <span key={j} style={{ fontSize: 11, background: "#f1f5f9", color: "#475569", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>✓ {a}</span>)}
                        </div>
                      )}
                      {/* View on Google Maps — prominent button */}
                      <a href={mapsUrl} target="_blank" rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
                        🗺 View on Google Maps
                      </a>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontWeight: 900, color: c, fontSize: 20 }}>{h.price}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>per night</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* BUDGET TAB */}
        {activeTab === "budget" && r.cost_breakdown && (
          <Card>
            <h3 style={{ margin: "0 0 14px", fontWeight: 800, color: "#1e293b", fontSize: 16 }}>💰 Complete Budget</h3>
            <div style={{ padding: "16px", borderRadius: 12, background: "linear-gradient(135deg,#1e293b,#1e3a8a)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ color: "#94a3b8", fontWeight: 700 }}>Total (All Inclusive)</span>
              <span style={{ color: "#fbbf24", fontWeight: 900, fontSize: 22 }}>{r.cost_breakdown.total}</span>
            </div>
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", marginBottom: 14 }}>
              {[{ l: "🚗 Travel to Destination", v: r.cost_breakdown.travel_to_destination, c: "#7c3aed" }, { l: "🏨 Accommodation", v: r.cost_breakdown.accommodation, c: "#2563eb" }, { l: "🍽 Food & Dining", v: r.cost_breakdown.food, c: "#dc2626" }, { l: "🚌 Local Transport", v: r.cost_breakdown.local_transport || r.cost_breakdown.transport, c: "#d97706" }, { l: "🎯 Activities", v: r.cost_breakdown.activities, c: "#059669" }, { l: "🛍 Misc", v: r.cost_breakdown.misc, c: "#0891b2" }].filter(x => x.v && x.v !== "Not applicable").map((item, i) => (
                <div key={item.l} style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}>{item.l}</span>
                  <span style={{ fontWeight: 900, color: item.c, fontSize: 15 }}>{item.v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px", border: "1px solid #e2e8f0", marginBottom: 14 }}>
              <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14, marginBottom: 10 }}>📊 Day-wise</div>
              {r.days?.map((day, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < r.days.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <span style={{ fontSize: 13, color: "#475569" }}>Day {i + 1}: {day.title?.split(":")[1]?.trim() || day.title}</span>
                  <span style={{ fontWeight: 800, color: "#2563eb", fontSize: 13 }}>{day.cost}</span>
                </div>
              ))}
            </div>
            {r.cost_breakdown.notes && <div style={{ padding: "12px 16px", background: "#fffbeb", borderRadius: 12, border: "1px solid #fed7aa" }}><div style={{ fontWeight: 700, color: "#92400e", fontSize: 13, marginBottom: 4 }}>💡 Saving Tips</div><p style={{ fontSize: 13, color: "#78350f", margin: 0, lineHeight: 1.6 }}>{r.cost_breakdown.notes}</p></div>}
          </Card>
        )}

        {/* TIPS TAB */}
        {activeTab === "tips" && (
          <Card>
            <h3 style={{ margin: "0 0 14px", fontWeight: 800, color: "#1e293b", fontSize: 16 }}>💡 Travel Tips</h3>
            {r.tips?.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, padding: "12px 14px", borderRadius: 12, background: i % 2 === 0 ? "#f8fafc" : "#fff", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <span style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>{tip}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

// ── PLANNER PAGE ─────────────────────────────────────────────────
function PlannerPage({ onGeneratePlan, autoForm }) {
  const [form, setForm] = useState({ from: "", location: "", departureTime: "17:00", days: "3", budget: "", currency: "INR", travelers: "1", tripType: "friends", travelMode: "bus", travelStyle: "budget", interests: [] });
  const [step, setStep] = useState("form");
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [smartBudget, setSmartBudget] = useState(null);
  const [liveTrip, setLiveTrip] = useState(false);

  useEffect(() => { if (form.location && form.days && form.travelers) { setSmartBudget(estimateBudget(form.location, form.days, form.travelers, form.travelStyle)); } }, [form.location, form.days, form.travelers, form.travelStyle]);

  // Handle auto-form from chatbot/voice
  useEffect(() => {
    if (autoForm) {
      const merged = { ...form, ...autoForm };
      setForm(merged);
      setTimeout(() => generate(merged), 300);
    }
  }, [autoForm]);

  function toggleInterest(id) { setForm(f => ({ ...f, interests: f.interests.includes(id) ? f.interests.filter(i => i !== id) : [...f.interests, id] })); }

  if (liveTrip && result) return <LiveTripNavigator result={result} onClose={() => setLiveTrip(false)} />;

  async function generate(customForm) {
    const f = customForm || form;
    if (!f.location || !f.days || !f.budget) { setError("Please fill Destination, Days and Budget."); return; }
    const budget = parseInt(f.budget);
    const est = estimateBudget(f.location, f.days, f.travelers, f.travelStyle);
    const minB = est.total * 0.4;
    if (budget < minB) { setError(`⚠️ Budget too low! Minimum recommended is ₹${Math.round(minB).toLocaleString()} for ${f.days} days in ${f.location}.`); return; }
    setError(""); setStep("loading");
    const msgs = [`Researching ${f.location}…`, "Calculating travel schedules…", "Building full day plan…", "Finding nearby places…", "Computing accurate budget…", "Adding return journey…"];
    let mi = 0; setProgress(msgs[0]);
    const iv = setInterval(() => { mi = (mi + 1) % msgs.length; setProgress(msgs[mi]); }, 2000);
    const interestLabels = f.interests?.map(id => INTERESTS.find(i => i.id === id)?.label).filter(Boolean).join(", ") || "general sightseeing";

    const prompt = `You are an expert travel planner. Create a COMPLETE trip plan from START TO RETURN. Return ONLY valid JSON, no markdown.
TRIP:
- From: ${f.from || "Not specified"}, To: ${f.location}
- Departure: ${f.departureTime} from ${f.from || "home"}
- Days: ${f.days}, Budget: ${f.budget} ${f.currency} for ${f.travelers} person(s)
- Style: ${f.travelStyle}, Type: ${f.tripType}, Mode: ${f.travelMode}
- Interests: ${interestLabels}
RULES:
1. REALISTIC costs for ${f.location}. Hotel ~₹${Math.round(est.hotel / parseInt(f.days))}/night, Food ~₹${Math.round(est.food / parseInt(f.days) / parseInt(f.travelers))}/person/day
2. Activities 7 AM to 10 PM with exact times. Day 1 start from LUNCH if overnight travel
3. Each day: specific hotel stay, meal plan with restaurant names, 4-6 nearby places
4. Interests-based activities: prioritize ${interestLabels}
5. Include RETURN journey details
6. CRITICAL - UNIQUE PLACES: Every day MUST cover COMPLETELY DIFFERENT locations and activities. Never repeat the same place name across Day 1, Day 2, Day 3. Each day should explore a different part or zone of ${f.location}.
7. CRITICAL - 6 HOTELS: The hotels array MUST contain EXACTLY 6 different real hotels: 2 Budget hotels, 2 Mid-Range hotels, 2 Luxury hotels. Each hotel must have a unique name, different area, real phone number and realistic price.
8. CRITICAL - UNIQUE NEARBY PLACES: nearby_places in each day must all be different from other days. Zero overlap between days.
Return EXACT JSON (no markdown):
{"title":"...","summary":"...","travel_info":[{"mode":"Bus","emoji":"🚌","duration":"Xh","cost":"₹X,XXX","details":"...","recommended":true,"schedule":[{"time":"${f.departureTime}","station":"${f.from || "Home"} Bus Stand","note":"Board"},{"time":"HH:MM","station":"Midway","note":"Break"},{"time":"HH:MM","station":"${f.location} Bus Stand","note":"Arrive"}]},{"mode":"Train","emoji":"🚆","duration":"Xh","cost":"₹X,XXX","details":"...","recommended":false,"schedule":[{"time":"HH:MM","station":"Station","note":"Depart"},{"time":"HH:MM","station":"${f.location} Station","note":"Arrive"}]},{"mode":"Car","emoji":"🚗","duration":"Xh","cost":"₹X,XXX total","details":"...","recommended":false,"schedule":[{"time":"HH:MM","station":"${f.from || "Home"}","note":"Start"},{"time":"HH:MM","station":"${f.location}","note":"Arrive"}]},{"mode":"Flight","emoji":"✈️","duration":"Xh","cost":"₹X,XXX","details":"...","recommended":false,"schedule":[{"time":"HH:MM","station":"${f.from || "Home"} Airport","note":"Check-in"},{"time":"HH:MM","station":"${f.location} Airport","note":"Land"}]}],"return_travel":[{"mode":"Bus","emoji":"🚌","duration":"Xh","cost":"₹X,XXX","details":"...","recommended":true,"schedule":[{"time":"HH:MM","station":"${f.location} Bus Stand","note":"Depart"},{"time":"HH:MM","station":"${f.from || "Home"} Bus Stand","note":"Home"}]},{"mode":"Train","emoji":"🚆","duration":"Xh","cost":"₹X,XXX","details":"...","recommended":false,"schedule":[{"time":"HH:MM","station":"${f.location} Station","note":"Depart"},{"time":"HH:MM","station":"${f.from || "Home"} Station","note":"Arrive"}]},{"mode":"Car","emoji":"🚗","duration":"Xh","cost":"₹X,XXX","details":"...","recommended":false,"schedule":[]},{"mode":"Flight","emoji":"✈️","duration":"Xh","cost":"₹X,XXX","details":"...","recommended":false,"schedule":[]}],"days":[{"title":"Day 1: ...","theme":"...","stay":"Hotel name","stay_cost":"₹XXX/night","cost":"₹X,XXX","activities":[{"name":"Place","time":"01:00 PM","emoji":"🏖","description":"3 sentences","cost":"₹XX","duration":"2 hrs","tip":"insider tip"}],"meals":{"breakfast":{"place":"Name","cost":"₹XX","item":"dish"},"lunch":{"place":"Name","cost":"₹XX","item":"dish"},"dinner":{"place":"Name","cost":"₹XX","item":"dish"}},"nearby_places":[{"name":"Place","type":"Beach/Fort","distance":"2 km","entry_fee":"Free"},{"name":"Place","type":"...","distance":"...","entry_fee":"..."},{"name":"Place","type":"...","distance":"...","entry_fee":"..."},{"name":"Place","type":"...","distance":"...","entry_fee":"..."}]}],"hotels":[{"name":"Budget Hotel 1","type":"Budget","price":"₹XXX/night","area":"Area","rating":"3.5/5","highlight":"Feature","description":"2 sentences","phone":"+91-XXXXXXXXXX","amenities":["WiFi","AC"]},{"name":"Budget Hotel 2","type":"Budget","price":"₹XXX/night","area":"Area","rating":"3.8/5","highlight":"Feature","description":"2 sentences","phone":"+91-XXXXXXXXXX","amenities":["WiFi","AC","Parking"]},{"name":"MidRange Hotel 1","type":"Mid-Range","price":"₹X,XXX/night","area":"Area","rating":"4.1/5","highlight":"Feature","description":"2 sentences","phone":"+91-XXXXXXXXXX","amenities":["WiFi","AC","Pool","Gym"]},{"name":"MidRange Hotel 2","type":"Mid-Range","price":"₹X,XXX/night","area":"Area","rating":"4.3/5","highlight":"Feature","description":"2 sentences","phone":"+91-XXXXXXXXXX","amenities":["WiFi","AC","Restaurant","Bar"]},{"name":"Luxury Hotel 1","type":"Luxury","price":"₹X,XXX/night","area":"Area","rating":"4.6/5","highlight":"Feature","description":"2 sentences","phone":"+91-XXXXXXXXXX","amenities":["WiFi","AC","Spa","Pool","Restaurant"]},{"name":"Luxury Hotel 2","type":"Luxury","price":"₹X,XXX/night","area":"Area","rating":"4.8/5","highlight":"Feature","description":"2 sentences","phone":"+91-XXXXXXXXXX","amenities":["WiFi","AC","Spa","Pool","Restaurant","Bar","Gym"]}],"cost_breakdown":{"total":"₹${f.budget}","travel_to_destination":"₹X,XXX for ${f.travelers} by ${f.travelMode}","accommodation":"₹X,XXX (₹XXX × ${f.days} nights)","food":"₹X,XXX (₹XXX/day × ${f.days} × ${f.travelers})","local_transport":"₹X,XXX","activities":"₹X,XXX","misc":"₹XXX","notes":"saving tips"},"tips":["tip1","tip2","tip3","tip4","tip5"],"packing":["item1","item2","item3","item4","item5","item6"]}`;

    try {
      const raw = await callGroq(prompt); clearInterval(iv);
      const parsed = JSON.parse(raw);
      const fullResult = { ...parsed, travelInfo: parsed.travel_info, return_travel: parsed.return_travel, meta: f };
      setResult(fullResult);
      const history = JSON.parse(localStorage.getItem("tripHistory") || "[]");
      history.push({ ...f, title: parsed.title, date: new Date().toISOString(), fullResult });
      localStorage.setItem("tripHistory", JSON.stringify(history));
      setStep("result");
    } catch (e) { clearInterval(iv); setError("Generation failed: " + e.message); setStep("form"); }
  }

  if (step === "loading") return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 16px" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ background: "#fff", borderRadius: 24, padding: "36px 28px", boxShadow: "0 8px 40px rgba(0,0,0,0.12)", textAlign: "center", maxWidth: 320, width: "100%" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🌍</div>
        <div style={{ width: 44, height: 44, border: "4px solid #e2e8f0", borderTop: "4px solid #2563eb", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 16px" }} />
        <h2 style={{ fontWeight: 800, fontSize: 18, color: "#1e293b", margin: "0 0 6px" }}>Planning Your Trip…</h2>
        <p style={{ color: "#64748b", fontSize: 13, animation: "pulse 2s ease-in-out infinite", margin: "0 0 14px" }}>{progress}</p>
        <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px", textAlign: "left" }}>
          {[[TRAVEL_MODES.find(m => m.id === form.travelMode)?.emoji || "🚌", form.from ? `${form.from} → ${form.location}` : form.location], ["📅", `${form.days} days`], ["👥", `${form.travelers} person(s)`], ["💰", `${form.currency} ${parseInt(form.budget || 0).toLocaleString()}`]].map(([e, t]) => (
            <div key={t} style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}><span style={{ marginRight: 8 }}>{e}</span>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );

  if (step === "result" && result) return <TripResult result={result} onBack={() => { setStep("form"); setResult(null); }} onStartTrip={() => setLiveTrip(true)} />;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px" }}>
      <h2 style={{ fontWeight: 800, color: "#1e293b", fontSize: 20, margin: "0 0 4px" }}>✈️ Plan Your Trip</h2>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 14px" }}>Or use the 🤖 chatbot / 🎙 voice button to plan with AI!</p>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div><Lbl>STARTING FROM</Lbl><input value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} placeholder="e.g. Tumkur, Mumbai" style={inp()} /></div>
          <div><Lbl>DESTINATION *</Lbl><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Goa, Manali" style={inp()} /></div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <Lbl>DEPARTURE TIME</Lbl>
          <input type="time" value={form.departureTime} onChange={e => setForm(f => ({ ...f, departureTime: e.target.value }))} style={inp()} />
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>⏰ AI plans your first day based on arrival time</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <Lbl>TRAVEL MODE</Lbl>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {TRAVEL_MODES.map(mode => (
              <button key={mode.id} onClick={() => setForm(f => ({ ...f, travelMode: mode.id }))} style={{ padding: "10px 6px", borderRadius: 12, border: `2px solid ${form.travelMode === mode.id ? mode.color : "#e2e8f0"}`, background: form.travelMode === mode.id ? `${mode.color}10` : "#fafafa", cursor: "pointer", textAlign: "center", fontFamily: "inherit", transition: "all 0.2s" }}>
                <div style={{ fontSize: 22 }}>{mode.emoji}</div>
                <div style={{ fontWeight: 800, color: form.travelMode === mode.id ? mode.color : "#64748b", fontSize: 11, marginTop: 4 }}>{mode.label}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <Lbl>TRAVEL STYLE</Lbl>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[["budget", "🎒 Budget", "Local food & hostels"], ["mid", "🏨 Mid-Range", "3-star comfort"], ["luxury", "✨ Luxury", "Premium stays"]].map(([id, label, desc]) => (
              <button key={id} onClick={() => setForm(f => ({ ...f, travelStyle: id, budget: "" }))} style={{ padding: "10px 8px", borderRadius: 12, border: `2px solid ${form.travelStyle === id ? "#2563eb" : "#e2e8f0"}`, background: form.travelStyle === id ? "#eff6ff" : "#fafafa", cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}>
                <div style={{ fontWeight: 800, color: form.travelStyle === id ? "#2563eb" : "#64748b", fontSize: 12 }}>{label}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <Lbl>YOUR INTERESTS</Lbl>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {INTERESTS.map(interest => {
              const active = form.interests.includes(interest.id);
              return (
                <button key={interest.id} onClick={() => toggleInterest(interest.id)} style={{ padding: "6px 12px", borderRadius: 20, border: `2px solid ${active ? "#7c3aed" : "#e2e8f0"}`, background: active ? "#f5f3ff" : "#fafafa", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s" }}>
                  <span style={{ fontSize: 14 }}>{interest.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: active ? "#7c3aed" : "#64748b" }}>{interest.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div><Lbl>DAYS *</Lbl><input type="number" min="1" max="30" value={form.days} onChange={e => setForm(f => ({ ...f, days: e.target.value, budget: "" }))} style={inp()} /></div>
          <div><Lbl>TRAVELERS</Lbl><input type="number" min="1" max="20" value={form.travelers} onChange={e => setForm(f => ({ ...f, travelers: e.target.value, budget: "" }))} style={inp()} /></div>
        </div>
        {smartBudget && form.location && (
          <div style={{ background: "linear-gradient(135deg,#f0fdf4,#eff6ff)", border: "1.5px solid #86efac", borderRadius: 14, padding: "14px", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: "#166534", fontSize: 13, marginBottom: 10 }}>🧮 Recommended Budget — {form.location} ({form.days} days, {form.travelers} person)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
              {[["🏨", `₹${smartBudget.hotel.toLocaleString()}`, "#2563eb"], ["🍽", `₹${smartBudget.food.toLocaleString()}`, "#dc2626"], ["🎯", `₹${smartBudget.activities.toLocaleString()}`, "#059669"], ["🚌", `₹${smartBudget.transport.toLocaleString()}`, "#d97706"], ["🛍", `₹${smartBudget.misc.toLocaleString()}`, "#7c3aed"]].map(([e, v, c]) => (
                <div key={e} style={{ background: "#fff", borderRadius: 10, padding: "8px", textAlign: "center", border: `1px solid ${c}20` }}>
                  <div style={{ fontSize: 16 }}>{e}</div>
                  <div style={{ fontWeight: 800, color: c, fontSize: 13 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: "#166534", fontSize: 13 }}>💰 Recommended</span>
              <span style={{ fontWeight: 900, color: "#059669", fontSize: 18 }}>₹{smartBudget.total.toLocaleString()}</span>
            </div>
            <button onClick={() => setForm(f => ({ ...f, budget: smartBudget.total.toString() }))} style={{ width: "100%", padding: "8px", borderRadius: 8, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>✅ Use This Budget</button>
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <Lbl>TOTAL BUDGET *</Lbl>
          <div style={{ display: "flex", gap: 6 }}>
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} style={{ ...inp(), width: 72, flexShrink: 0 }}>
              {["INR", "USD", "EUR", "GBP", "AUD"].map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="number" placeholder={smartBudget ? `Recommended: ${smartBudget.total}` : "Enter budget"} value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} style={{ ...inp(), flex: 1 }} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Lbl>TRIP TYPE</Lbl>
          <select value={form.tripType} onChange={e => setForm(f => ({ ...f, tripType: e.target.value }))} style={inp()}>
            <option value="solo">Solo</option><option value="couple">Couple</option><option value="friends">Friends Group</option><option value="family">Family</option><option value="college group">College Group</option>
          </select>
        </div>
        {error && <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 14px", color: "#dc2626", fontWeight: 600, fontSize: 13, marginBottom: 14 }}>⚠️ {error}</div>}
        <button onClick={() => generate()} style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 18px rgba(37,99,235,0.3)" }}>✨ Generate Complete Trip Plan</button>
      </Card>
    </div>
  );
}

// ── HOME PAGE ───────────────────────────────────────────────────
function HomePage({ user, setPage }) {
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#1e3a8a,#1e293b,#312e81)", padding: "44px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 50, marginBottom: 12 }}>🌍</div>
        <h1 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 800, color: "#fff" }}>Welcome, {user.name}! 👋</h1>
        <p style={{ color: "#94a3b8", fontSize: 14, maxWidth: 480, margin: "0 auto 10px", lineHeight: 1.6 }}>Plan trips via form, chatbot or voice — with interests, nearby places, navigation and return journey.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
          {["🤖 AI Chatbot", "🎙 Voice Assistant", "📍 Nearby Places", "🗺 Live Navigation", "📊 Budget Tracker", "⭐ Trip Rating", "⬇️ Download Plan", "🆘 Emergency Info"].map(f => (
            <span key={f} style={{ background: "rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.15)" }}>{f}</span>
          ))}
        </div>
        <button onClick={() => setPage("planner")} style={{ padding: "13px 28px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>✨ Plan a Trip</button>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12 }}>
          {[{ id: "planner", emoji: "✈️", title: "Plan Trip", desc: "Form / Chat / Voice", color: "#2563eb" }, { id: "weather", emoji: "🌤", title: "Weather", desc: "Live forecast", color: "#0ea5e9" }, { id: "map", emoji: "🗺", title: "Maps", desc: "Directions", color: "#059669" }, { id: "hotels", emoji: "🏨", title: "Hotels", desc: "Find stays", color: "#d97706" }, { id: "reviews", emoji: "⭐", title: "Reviews", desc: "Community reviews", color: "#f59e0b" }, { id: "profile", emoji: "👤", title: "Profile", desc: "Trip history", color: "#7c3aed" }].map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ padding: "18px 12px", borderRadius: 16, border: `2px solid ${item.color}20`, background: `${item.color}08`, cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{item.emoji}</div>
              <div style={{ fontWeight: 800, color: item.color, fontSize: 13 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{item.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════
// 🔐 ADMIN PORTAL — Trip Nova Owner Dashboard
//    Access: Login with admin@tripnova.com / TripNova@Admin2024
//    Features: View all users, reviews, stats, manage content
// ══════════════════════════════════════════════════════════════════

// Admin credentials — change these before deploying
const ADMIN_EMAIL = "admin@tripnova.com";
const ADMIN_PASS  = "TripNova@Admin2024";

// ── SHARED REVIEWS STORAGE ──
// Reviews are stored in localStorage under "tripnova_reviews"
// Since all users share the same browser on a demo, this works perfectly
// For production: move to MongoDB via backend
function getReviews() {
  try { return JSON.parse(localStorage.getItem("tripnova_reviews") || "[]"); }
  catch { return []; }
}
function saveReviews(reviews) {
  localStorage.setItem("tripnova_reviews", JSON.stringify(reviews));
}
function getAdminData() {
  try { return JSON.parse(localStorage.getItem("tripnova_admin_data") || "{}"); }
  catch { return {}; }
}

// ── REVIEWS PAGE (All logged-in users can see & post reviews) ──
function ReviewsPage({ user }) {
  const [reviews, setReviews]   = useState(getReviews());
  const [rating, setRating]     = useState(5);
  const [comment, setComment]   = useState("");
  const [title, setTitle]       = useState("");
  const [dest, setDest]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy]     = useState("newest");

  const myReview = reviews.find(r => r.email === user.email);

  function submitReview() {
    if (!comment.trim() || !title.trim()) { return; }
    setSubmitting(true);
    const newReview = {
      id: Date.now().toString(),
      name: user.name,
      email: user.email,
      avatar: user.name[0].toUpperCase(),
      rating,
      title: title.trim(),
      comment: comment.trim(),
      destination: dest.trim() || "General",
      date: new Date().toISOString(),
      helpful: 0,
      helpfulBy: [],
      verified: true,
    };
    const updated = [newReview, ...reviews.filter(r => r.email !== user.email)];
    saveReviews(updated);
    setReviews(updated);
    setComment(""); setTitle(""); setDest(""); setRating(5);
    setSuccess("Review posted! Thank you 🎉");
    setTimeout(() => setSuccess(""), 3000);
    setSubmitting(false);
  }

  function markHelpful(id) {
    const updated = reviews.map(r => {
      if (r.id !== id) return r;
      const already = (r.helpfulBy || []).includes(user.email);
      return {
        ...r,
        helpful: already ? r.helpful - 1 : (r.helpful || 0) + 1,
        helpfulBy: already
          ? (r.helpfulBy || []).filter(e => e !== user.email)
          : [...(r.helpfulBy || []), user.email],
      };
    });
    saveReviews(updated);
    setReviews(updated);
  }

  function deleteMyReview() {
    const updated = reviews.filter(r => r.email !== user.email);
    saveReviews(updated); setReviews(updated);
  }

  const filtered = reviews
    .filter(r => filterRating === 0 || r.rating === filterRating)
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date) - new Date(a.date);
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "helpful") return (b.helpful || 0) - (a.helpful || 0);
      return 0;
    });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingCounts = [5,4,3,2,1].map(star => ({
    star, count: reviews.filter(r => r.rating === star).length
  }));

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
      <style>{`
        @keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .review-card{animation:fadeInUp 0.3s ease}
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1e3a8a,#312e81)", borderRadius: 20, padding: "28px 24px", marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⭐</div>
        <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: "#fff" }}>Community Reviews</h2>
        <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>See what travelers are saying about Trip Nova</p>
      </div>

      {/* Stats bar */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", marginBottom: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #e8edf4" }}>
        <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: "#2563eb", lineHeight: 1 }}>{avgRating}</div>
            <div style={{ fontSize: 22, color: "#f59e0b", margin: "4px 0 2px" }}>
              {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{reviews.length} reviews</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            {ratingCounts.map(({ star, count }) => (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#64748b", width: 20, textAlign: "right" }}>{star}</span>
                <span style={{ fontSize: 13, color: "#f59e0b" }}>★</span>
                <div style={{ flex: 1, height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg,#f59e0b,#d97706)", borderRadius: 4, width: `${reviews.length ? (count/reviews.length)*100 : 0}%`, transition: "width 0.4s" }} />
                </div>
                <span style={{ fontSize: 12, color: "#94a3b8", width: 24 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write Review */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "20px", marginBottom: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #e8edf4" }}>
        <h3 style={{ margin: "0 0 16px", fontWeight: 800, color: "#1e293b", fontSize: 16 }}>
          {myReview ? "✏️ Edit Your Review" : "✍️ Write a Review"}
        </h3>
        {success && (
          <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: "10px 14px", color: "#166534", fontWeight: 600, fontSize: 13, marginBottom: 14 }}>✅ {success}</div>
        )}

        {/* Star selector */}
        <div style={{ marginBottom: 14 }}>
          <Lbl>YOUR RATING</Lbl>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setRating(s)} style={{
                fontSize: 28, background: "none", border: "none", cursor: "pointer",
                color: s <= rating ? "#f59e0b" : "#e2e8f0", transition: "transform 0.1s",
                transform: s <= rating ? "scale(1.1)" : "scale(1)",
              }}>★</button>
            ))}
            <span style={{ fontSize: 13, color: "#64748b", alignSelf: "center", marginLeft: 4 }}>
              {["","Terrible","Poor","Average","Good","Excellent"][rating]}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Lbl>REVIEW TITLE</Lbl>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Amazing trip planning experience!" style={inp()} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Lbl>DESTINATION (optional)</Lbl>
          <input value={dest} onChange={e => setDest(e.target.value)} placeholder="e.g. Goa, Manali, Bali..." style={inp()} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Lbl>YOUR REVIEW</Lbl>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience with Trip Nova..." rows={4}
            style={{ ...inp(), resize: "vertical", minHeight: 100 }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={submitReview} disabled={!comment.trim() || !title.trim() || submitting}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", opacity: (!comment.trim() || !title.trim()) ? 0.5 : 1 }}>
            {submitting ? "Posting…" : myReview ? "Update Review" : "Post Review"}
          </button>
          {myReview && (
            <button onClick={deleteMyReview} style={{ padding: "12px 18px", borderRadius: 12, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              🗑 Delete
            </button>
          )}
        </div>
      </div>

      {/* Filter + Sort */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Filter:</span>
        {[0,5,4,3,2,1].map(s => (
          <button key={s} onClick={() => setFilterRating(s)} style={{
            padding: "6px 14px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            background: filterRating === s ? "#2563eb" : "#f1f5f9",
            color: filterRating === s ? "#fff" : "#475569",
          }}>{s === 0 ? "All" : `${s}★`}</button>
        ))}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inp({ padding: "6px 12px", fontSize: 12 }), width: "auto", marginLeft: "auto" }}>
          <option value="newest">Newest First</option>
          <option value="highest">Highest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Review cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 16, border: "1px solid #e8edf4" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✍️</div>
          <p style={{ color: "#64748b", fontSize: 15 }}>No reviews yet. Be the first to review Trip Nova!</p>
        </div>
      ) : (
        filtered.map((r, i) => (
          <div key={r.id} className="review-card" style={{
            background: "#fff", borderRadius: 16, padding: "20px", marginBottom: 14,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1.5px solid ${r.email === user.email ? "#bfdbfe" : "#e8edf4"}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                  {r.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: "#1e293b", fontSize: 14 }}>
                    {r.name}
                    {r.email === user.email && <span style={{ marginLeft: 8, fontSize: 10, background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>YOU</span>}
                    {r.verified && <span style={{ marginLeft: 6, fontSize: 10, background: "#f0fdf4", color: "#059669", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>✓ Verified</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {r.destination && r.destination !== "General" && <span> · 📍 {r.destination}</span>}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#f59e0b", fontSize: 16, letterSpacing: 1 }}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>
              </div>
            </div>
            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14, marginBottom: 6 }}>{r.title}</div>
            <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.7, margin: "0 0 12px" }}>{r.comment}</p>
            <button onClick={() => markHelpful(r.id)} style={{
              padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${(r.helpfulBy || []).includes(user.email) ? "#2563eb" : "#e2e8f0"}`,
              background: (r.helpfulBy || []).includes(user.email) ? "#eff6ff" : "#fff",
              color: (r.helpfulBy || []).includes(user.email) ? "#2563eb" : "#64748b",
              fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>
              👍 Helpful {r.helpful > 0 ? `(${r.helpful})` : ""}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

// ── ADMIN LOGIN PAGE ──
function AdminLogin({ onAdminLogin }) {
  const [email, setEmail]       = useState("");
  const [pass, setPass]         = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleLogin() {
    if (!email || !pass) { setError("Fill all fields."); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      if (email.trim() === ADMIN_EMAIL && pass === ADMIN_PASS) {
        onAdminLogin();
      } else {
        setError("Invalid admin credentials.");
      }
      setLoading(false);
    }, 600);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e1b4b)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
    }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 420, boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🛡️</div>
          <h2 style={{ margin: "0 0 6px", fontWeight: 800, color: "#1e293b", fontSize: 22 }}>Admin Portal</h2>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Trip Nova · Owner Access</p>
        </div>
        {error && <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 14px", color: "#dc2626", fontWeight: 600, fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
        <div style={{ marginBottom: 14 }}>
          <Lbl>ADMIN EMAIL</Lbl>
          <input type="email" placeholder="admin" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={inp({ padding: "13px 16px", fontSize: 14, borderRadius: 12 })} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <Lbl>PASSWORD</Lbl>
          <input type="password" placeholder="Admin password" value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={inp({ padding: "13px 16px", fontSize: 14, borderRadius: 12 })} />
        </div>
        <button onClick={handleLogin} disabled={loading} style={{
          width: "100%", padding: "14px", borderRadius: 13, border: "none",
          background: "linear-gradient(135deg,#dc2626,#9f1239)",
          color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
          boxShadow: "0 4px 18px rgba(220,38,38,0.35)",
        }}>{loading ? "Verifying…" : "🔐 Login as Admin"}</button>
        <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 16 }}>
          Access restricted to authorized owners only
        </p>
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ──
function AdminDashboard({ onLogout }) {
  const [tab, setTab]         = useState("overview");
  const [reviews, setReviews] = useState(getReviews());
  const [filterStar, setFilterStar] = useState(0);
  const [searchUser, setSearchUser] = useState("");

  // Simulate users from trip history patterns
  const allTrips  = [];
  const allUsers  = [];
  const ratingMap = {};
  const cityCount = {};

  reviews.forEach(r => {
    if (!ratingMap[r.email]) ratingMap[r.email] = [];
    ratingMap[r.email].push(r.rating);
    if (r.destination && r.destination !== "General") {
      cityCount[r.destination] = (cityCount[r.destination] || 0) + 1;
    }
  });

  const topCities = Object.entries(cityCount).sort((a,b) => b[1]-a[1]).slice(0,5);
  const avgRating = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : "—";
  const totalReviews = reviews.length;
  const fiveStars = reviews.filter(r=>r.rating===5).length;

  function deleteReview(id) {
    const updated = reviews.filter(r => r.id !== id);
    saveReviews(updated); setReviews(updated);
  }

  function exportReviews() {
    const csv = [
      ["Name","Email","Rating","Title","Destination","Comment","Date"].join(","),
      ...reviews.map(r => [r.name,r.email,r.rating,`"${r.title}"`,r.destination,`"${r.comment}"`,new Date(r.date).toLocaleDateString()].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tripnova_reviews.csv";
    a.click();
  }

  const TABS = [
    { id:"overview", label:"📊 Overview" },
    { id:"reviews", label:"⭐ Reviews" },
    { id:"settings", label:"⚙️ Settings" },
  ];

  const statCards = [
    { label:"Total Reviews", value: totalReviews, emoji:"⭐", color:"#2563eb" },
    { label:"Avg Rating",    value: avgRating,    emoji:"📊", color:"#059669" },
    { label:"5-Star Reviews",value: fiveStars,    emoji:"🏆", color:"#d97706" },
    { label:"Unique Users",  value: new Set(reviews.map(r=>r.email)).size, emoji:"👥", color:"#7c3aed" },
  ];

  const filteredReviews = reviews
    .filter(r => filterStar === 0 || r.rating === filterStar)
    .filter(r => searchUser === "" || r.name.toLowerCase().includes(searchUser.toLowerCase()) || r.email.toLowerCase().includes(searchUser.toLowerCase()));

  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"#fff" }}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {/* Admin Navbar */}
      <div style={{ background:"#1e293b", borderBottom:"1px solid #334155", padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#dc2626,#9f1239)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>🛡️</div>
          <div>
            <div style={{ fontWeight:800, fontSize:14, color:"#fff" }}>Trip Nova Admin</div>
            <div style={{ fontSize:10, color:"#64748b" }}>Owner Portal</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:"7px 14px", borderRadius:10, border:"none",
              background: tab===t.id ? "linear-gradient(135deg,#dc2626,#9f1239)" : "#334155",
              color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit",
            }}>{t.label}</button>
          ))}
          <button onClick={onLogout} style={{ padding:"7px 14px", borderRadius:10, border:"1px solid #475569", background:"none", color:"#94a3b8", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit", marginLeft:8 }}>← Exit Admin</button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px" }}>

        {/* OVERVIEW TAB */}
        {tab==="overview" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <h2 style={{ fontWeight:800, fontSize:20, margin:"0 0 20px", color:"#fff" }}>📊 Dashboard Overview</h2>

            {/* Stat cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:24 }}>
              {statCards.map((s,i) => (
                <div key={i} style={{ background:"#1e293b", borderRadius:16, padding:"20px", border:`1.5px solid ${s.color}30` }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{s.emoji}</div>
                  <div style={{ fontWeight:900, fontSize:32, color:s.color, lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:12, color:"#64748b", fontWeight:700, marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Rating breakdown */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
              <div style={{ background:"#1e293b", borderRadius:16, padding:"20px", border:"1px solid #334155" }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#fff", marginBottom:14 }}>⭐ Rating Breakdown</div>
                {[5,4,3,2,1].map(star => {
                  const count = reviews.filter(r=>r.rating===star).length;
                  const pct = reviews.length ? (count/reviews.length)*100 : 0;
                  return (
                    <div key={star} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      <span style={{ fontSize:12, color:"#94a3b8", width:16 }}>{star}</span>
                      <span style={{ color:"#f59e0b", fontSize:14 }}>★</span>
                      <div style={{ flex:1, height:10, background:"#334155", borderRadius:5, overflow:"hidden" }}>
                        <div style={{ height:"100%", background:`linear-gradient(90deg,#f59e0b,#d97706)`, width:`${pct}%`, borderRadius:5 }} />
                      </div>
                      <span style={{ fontSize:12, color:"#64748b", width:28 }}>{count}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ background:"#1e293b", borderRadius:16, padding:"20px", border:"1px solid #334155" }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#fff", marginBottom:14 }}>📍 Top Destinations Reviewed</div>
                {topCities.length === 0 ? (
                  <p style={{ color:"#64748b", fontSize:13 }}>No destination data yet</p>
                ) : topCities.map(([city, count], i) => (
                  <div key={city} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #334155", fontSize:13 }}>
                    <span style={{ color:"#e2e8f0" }}>#{i+1} {city}</span>
                    <span style={{ color:"#2563eb", fontWeight:700 }}>{count} reviews</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent reviews preview */}
            <div style={{ background:"#1e293b", borderRadius:16, padding:"20px", border:"1px solid #334155" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#fff" }}>📝 Recent Reviews</div>
                <button onClick={() => setTab("reviews")} style={{ padding:"5px 12px", borderRadius:8, border:"1px solid #475569", background:"none", color:"#94a3b8", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>View All →</button>
              </div>
              {reviews.slice(0,3).map(r => (
                <div key={r.id} style={{ padding:"10px 0", borderBottom:"1px solid #334155", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:"#e2e8f0" }}>{r.name} <span style={{ color:"#f59e0b" }}>{"★".repeat(r.rating)}</span></div>
                    <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{r.title}</div>
                  </div>
                  <div style={{ fontSize:11, color:"#475569" }}>{new Date(r.date).toLocaleDateString()}</div>
                </div>
              ))}
              {reviews.length === 0 && <p style={{ color:"#64748b", fontSize:13 }}>No reviews yet</p>}
            </div>
          </div>
        )}

        {/* REVIEWS MANAGEMENT TAB */}
        {tab==="reviews" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <h2 style={{ fontWeight:800, fontSize:20, margin:0, color:"#fff" }}>⭐ Manage Reviews ({reviews.length})</h2>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={exportReviews} style={{ padding:"8px 16px", borderRadius:10, border:"1px solid #475569", background:"#1e293b", color:"#94a3b8", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>⬇️ Export CSV</button>
              </div>
            </div>

            {/* Filters */}
            <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
              <input value={searchUser} onChange={e => setSearchUser(e.target.value)} placeholder="🔍 Search by name or email..." style={{ ...inp({ padding:"9px 14px", fontSize:13, borderRadius:10 }), flex:1, minWidth:200, maxWidth:320 }} />
              {[0,5,4,3,2,1].map(s => (
                <button key={s} onClick={() => setFilterStar(s)} style={{
                  padding:"7px 14px", borderRadius:20, border:"none", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                  background: filterStar===s ? "#dc2626" : "#1e293b",
                  color: filterStar===s ? "#fff" : "#94a3b8",
                  border: `1px solid ${filterStar===s ? "#dc2626" : "#334155"}`,
                }}>{s===0 ? "All" : `${s}★`}</button>
              ))}
            </div>

            {/* Review rows */}
            {filteredReviews.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px", background:"#1e293b", borderRadius:16 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                <p style={{ color:"#64748b" }}>No reviews found</p>
              </div>
            ) : filteredReviews.map(r => (
              <div key={r.id} style={{ background:"#1e293b", borderRadius:14, padding:"16px 18px", marginBottom:12, border:"1px solid #334155" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:4 }}>
                      <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:13,flexShrink:0 }}>{r.avatar}</div>
                      <span style={{ fontWeight:800, color:"#e2e8f0", fontSize:14 }}>{r.name}</span>
                      <span style={{ fontSize:11, color:"#64748b" }}>{r.email}</span>
                      <span style={{ color:"#f59e0b", fontSize:14 }}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
                      {r.destination && r.destination !== "General" && <span style={{ fontSize:11, background:"#eff6ff", color:"#2563eb", padding:"2px 8px", borderRadius:10 }}>📍 {r.destination}</span>}
                    </div>
                    <div style={{ fontWeight:700, color:"#fff", fontSize:13, marginBottom:4 }}>{r.title}</div>
                    <p style={{ color:"#94a3b8", fontSize:13, margin:"0 0 8px", lineHeight:1.6 }}>{r.comment}</p>
                    <div style={{ fontSize:11, color:"#475569" }}>
                      {new Date(r.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                      {" · "}👍 {r.helpful || 0} helpful
                    </div>
                  </div>
                  <button onClick={() => deleteReview(r.id)} style={{ padding:"6px 12px", borderRadius:8, border:"1px solid #ef444440", background:"#fef2f220", color:"#ef4444", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab==="settings" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <h2 style={{ fontWeight:800, fontSize:20, margin:"0 0 20px", color:"#fff" }}>⚙️ Admin Settings</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div style={{ background:"#1e293b", borderRadius:16, padding:"20px", border:"1px solid #334155" }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#fff", marginBottom:12 }}>🔑 Admin Credentials</div>
                <div style={{ fontSize:13, color:"#94a3b8", marginBottom:8 }}>Email: <span style={{ color:"#60a5fa" }}>{ADMIN_EMAIL}</span></div>
                <div style={{ fontSize:13, color:"#94a3b8", marginBottom:16 }}>Password: <span style={{ color:"#60a5fa" }}>••••••••••••••</span></div>
                <div style={{ fontSize:12, color:"#475569", background:"#0f172a", borderRadius:10, padding:"10px 14px" }}>
                  To change credentials, edit ADMIN_EMAIL and ADMIN_PASS constants in App.js
                </div>
              </div>
              <div style={{ background:"#1e293b", borderRadius:16, padding:"20px", border:"1px solid #334155" }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#fff", marginBottom:12 }}>💾 Data Management</div>
                <button onClick={() => { if(window.confirm("Delete ALL reviews? This cannot be undone.")) { saveReviews([]); setReviews([]); } }}
                  style={{ width:"100%", padding:"10px", borderRadius:10, border:"1.5px solid #ef4444", background:"#fef2f210", color:"#ef4444", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", marginBottom:10 }}>
                  🗑 Clear All Reviews
                </button>
                <button onClick={exportReviews}
                  style={{ width:"100%", padding:"10px", borderRadius:10, border:"1.5px solid #059669", background:"#f0fdf410", color:"#059669", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                  ⬇️ Export Reviews CSV
                </button>
              </div>
              <div style={{ background:"#1e293b", borderRadius:16, padding:"20px", border:"1px solid #334155" }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#fff", marginBottom:12 }}>ℹ️ System Info</div>
                {[
                  ["App Name", "Trip Nova"],
                  ["Version", "2.0.0"],
                  ["Frontend", "React.js 18"],
                  ["Backend", "Node.js + Express"],
                  ["Database", "MongoDB + localStorage"],
                  ["AI Engine", "Groq LLaMA 3.3-70B"],
                  ["Image API", "Pexels Photos"],
                  ["Total Reviews", reviews.length],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #334155", fontSize:13 }}>
                    <span style={{ color:"#64748b" }}>{k}</span>
                    <span style={{ color:"#e2e8f0", fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:"#1e293b", borderRadius:16, padding:"20px", border:"1px solid #334155" }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#fff", marginBottom:12 }}>🚀 Quick Actions</div>
                <button onClick={() => setTab("reviews")} style={{ width:"100%", padding:"10px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#2563eb,#7c3aed)", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", marginBottom:10 }}>
                  ⭐ View All Reviews
                </button>
                <button onClick={() => window.open("/", "_self")} style={{ width:"100%", padding:"10px", borderRadius:10, border:"1.5px solid #475569", background:"none", color:"#94a3b8", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                  🌐 Go to Main App
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── ADMIN PORTAL WRAPPER (handles login/dashboard state) ──
function AdminPortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  if (!loggedIn) return <AdminLogin onAdminLogin={() => setLoggedIn(true)} />;
  return <AdminDashboard onLogout={() => setLoggedIn(false)} />;
}

// ── ROOT APP ─────────────────────────────────────────────────────
function PlannerPageWrapper({ chatPlan, setChatPlan }) {
  const [autoForm, setAutoForm] = useState(null);
  useEffect(() => {
    function handler(e) { setAutoForm(e.detail); }
    window.addEventListener("autoGeneratePlan", handler);
    return () => window.removeEventListener("autoGeneratePlan", handler);
  }, []);
  useEffect(() => { if (chatPlan) { setAutoForm(chatPlan); setChatPlan(null); } }, [chatPlan]);
  return <PlannerPage autoForm={autoForm} />;
}

export default function App() {
  const saved = localStorage.getItem("user");
  const [user, setUser]     = useState(saved ? JSON.parse(saved) : null);
  const [page, setPage]     = useState("home");
  const [chatPlan, setChatPlan] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  function handleLogin(u) { setUser(u); setPage("home"); }
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null); setPage("home");
  }

  function handleGeneratePlan(planData) {
    setChatPlan(planData); setPage("planner");
    setTimeout(() => {
      const evt = new CustomEvent("autoGeneratePlan", { detail: planData });
      window.dispatchEvent(evt);
    }, 500);
  }

  // ── Secret admin access: triple-click logo ──
  // Or navigate to ?admin in URL
  useEffect(() => {
    if (window.location.search.includes("admin")) setShowAdmin(true);
  }, []);

  if (showAdmin) return <AdminPortal />;
  if (!user) return <AuthPage onLogin={handleLogin} />;

  const pages = {
    home:    <HomePage user={user} setPage={setPage} />,
    planner: <PlannerPageWrapper chatPlan={chatPlan} setChatPlan={setChatPlan} />,
    weather: <WeatherPage />,
    map:     <MapPage />,
    hotels:  <HotelsPage />,
    reviews: <ReviewsPage user={user} />,
    profile: <ProfilePage user={user} setPage={setPage} />,
    about:   <AboutPage />
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans','Segoe UI',sans-serif", width: "100%" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');*{box-sizing:border-box}input:focus,select:focus,textarea:focus{border-color:#2563eb!important;box-shadow:0 0 0 3px rgba(37,99,235,0.1)}@keyframes glow{0%,100%{box-shadow:0 4px 20px rgba(37,99,235,0.4)}50%{box-shadow:0 4px 30px rgba(37,99,235,0.7)}}`}</style>
      <Navbar user={user} activePage={page} setPage={setPage} onLogout={handleLogout} />
      {pages[page] || pages.home}
      <FloatingAssistants onGeneratePlan={handleGeneratePlan} />
      <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: 12, borderTop: "1px solid #e2e8f0", marginTop: 20 }}>
        🎓 Trip Nova · College Project · React · Node.js · MongoDB · Groq AI · Web Speech API
        <span
          onClick={() => setShowAdmin(true)}
          style={{ marginLeft: 16, cursor: "pointer", opacity: 0.3, fontSize: 10, userSelect: "none" }}
          title="Admin Portal"
        >🛡️</span>
      </div>
    </div>
  );
}
