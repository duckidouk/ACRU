
# ACRU — Audio Visual Installation

> *A live audio-visual work that maps planetary collapse.*

---

- - - Concept


A sound art work that responds live to changes in key environmental indicators, thereby mapping
climate change and environmental collapse onto sound.

# *[EXAMPLE of The Earth when the environmental factors are stable]*

https://github.com/user-attachments/assets/7721ba05-52e1-4021-b272-9aac38a409a4


Four key environmental indicators: atmospheric CO₂, surface temperature, methane, and nitrous oxide; are fetched in real time from scientific APIs and fed into a Max/MSP patch. The patch runs a synthesiser and a 3D animated sphere that respond to those values.

When the planet is in balance, the music is in harmony. As the indicators worsen, the notes drift out of tune, the textures thicken, and the sphere deforms.

# *[EXAMPLE The Earth when the environmentals are terribly unstable]*

https://github.com/user-attachments/assets/b49dfd04-ff81-451f-a470-f33a69316736





---

# How It Works

--- 1 — Data Layer (`fetch_api_*.js`)

Two Node.js scripts pull live climate readings via RapidAPI:

| Script | Output | Purpose |
|---|---|---|
| `fetch_api_last_entry.js` | `api_last_entry_data.json` | Most recent reading per indicator |
| `fetch_api_data.js` | `api_data.json` | Full historical arrays + computed trend deltas |

**Indicators tracked:**

| Indicator | Unit | Source |
|---|---|---|
| Atmospheric CO₂ | ppm (cycle + trend) | Daily, NOAA |
| Average Surface Temperature | °C anomaly | Monthly |
| Atmospheric Methane (CH₄) | ppb | Monthly |
| Atmospheric N₂O | ppb | Monthly |

The full history script also computes `trendChange` (step-by-step delta) and `totalTrendChange` (change since a defined start date) for CO₂, methane, and N₂O.. They drive the full expressive range of the patch).

---

### 2 — Audio Engine (`synth_audiov27_160124_.maxpat`)

The Max patch runs four parallel sound generators. Each is conceptually mapped to a different quality of environmental degradation:

| Generator | Waveform | Character | Key Parameters |
|---|---|---|---|
| `p arp` | Melodic arpeggiator | The "voice" — harmonic or dissonant | `scaley`, `tempoarp`, `gainarp` |
| `p rect` | Rectangle wave | Harsh, industrial buzz | `gainrect`, `tempolow` |
| `p tri` | Triangle wave | Soft, sine-like warmth | `gaintri` |
| `p pink` | Pink noise | Wind, atmosphere, texture | `gainpink`, `float_pink_control` |

**The scale system** is central to the piece's expressiveness. The arpeggiator draws from one of eight scales:

```
1. Single note     5. Hirajoshi
2. Minor           6. Locrian
3. Major           7. Phrygian
4. Pentatonic      8. Lydian
```

As climate values shift, `scaley` changes. It moves the arp from consonant (major/pentatonic) toward more tensed modal scales (Phrygian, Locrian), essentially it is a slow drift from harmony into dissonance.

**Effects chain:**
- `mc.comb~` — comb filter / resonance
- `bp.Chorus` — stereo chorus (x2 instances)
- `bp.GigaverbArp` — large reverb on the arp
- `bp.LFO2` — slow modulation (FreqRate: 0.6, SyncRate: 5)

All of these are saved per-state in `pattrstorage params` and interpolated as data changes.

---

### 3 — Visual Engine (Jitter / OpenGL)

The visual is a high-resolution 3D sphere rendered at 1080×1080 in a dedicated GL window, named **"meduza"** (jellyfish).

**Objects involved:**

| Object | Role |
|---|---|
| `jit.gl.gridshape meduza` | The sphere mesh — `@dim 150 250`, smooth shading |
| `jit.gl.mesh meduza` | Renders vertices as `tri_strip` with alpha blending |
| `p point-attraction` | Physics deformation engine |
| `jit.anim.drive` | Drives animation per frame |
| `qmetro 30 hz` | 30fps render clock |

**The point-attraction algorithm** (documented inside the patch):

```
D(v) = sqrt((p₁-v₁)² + (p₂-v₂)² + (p₃-v₃)²)   ← distance from vertex to attractor

w' = sqrt(sum((p - c)²))
w  = 1 - w'                                         ← weight (closer = stronger pull)

v  = v' + w ⊙ (p - v')                             ← new vertex position
```

Climate values are scaled and routed into the attraction point coordinates (`p frq z tot`) and oscillation amplitudes for both the X and Z axes. Higher CO₂ or temperature anomaly = stronger pull = more deformed sphere.

The background erase colour is near-black with slight transparency (`0.05 0.04 0.06 0.9`), creating a motion-trail effect as the sphere moves.

---

### 4 — Preset System (`params.json` / `params2.json`)

The `pattrstorage params` object stores named snapshots of the entire synth state. Each slot corresponds to a sonic/visual configuration:

| Slot | Character |
|---|---|
| 1 | Active — arp prominent, warm |
| 2 | Subdued — arp silent, noise only |
| 3 | Tense — subtle arp, active reverb/chorus |
| 4 | Full — all voices on, heavy effects |
| 5 | Sparse — very quiet arp |
| 24 | Silence — all gains at zero (null state) |

Max interpolates between these as the climate values update, creating smooth transitions rather than abrupt changes.

------------------------------------------------------------------------------------------------------------------------

## File Structure

```
/
├── fetch_api_last_entry.js       # Fetch latest climate reading
├── fetch_api_data.js             # Fetch full history + compute deltas
├── package.json                  # Node dependencies (xmlhttprequest)
├── api_last_entry_data.json      # Output: latest readings
├── api_data.json                 # Output: full historical data
├── apiresult.json                # Example/cached API response
├── synth_audiov27_160124_.maxpat # Main Max/MSP patch
├── params.json                   # Synth preset bank (v1)
└── params2.json                  # Synth preset bank (v2)
```

------------------------------------------------------------------------------------------------------------------------------

# Setup

# Prerequisites
(i) [Max/MSP 8+](https://cycling74.com/) with Jitter
(ii) Node.js ≥ 18
(iii) RapidAPI keys
  
# Running the data fetcher

```bash
npm install
node fetch_api_last_entry.js   # quick: just latest values
node fetch_api_data.js         # full: historical + deltas (slower, rate-limited)
```

# Running the patch

1. Open `synth_audiov27_160124_.maxpat` in Max
2. Load the appropriate `params.json` via the `pattrstorage` object
3. Point the patch's file-read logic at `api_last_entry_data.json`
4. Click connect / start transport
5. The `jit.window meduza` will open at 1080×1080

------------------------------------------------------------------------------------------------------------------------------

# Current Data Snapshot *(as of last fetch)*

```
CO₂           423.09 ppm  (trend: 421.20)   
Surface Temp  +1.41 °C anomaly             
Methane       1933.46 ppb (trend: 1927.84)  
N₂O           336.97 ppb  (trend: 337.07)   
```

------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------------

# Credits

**Concept** - ACRB collective  
**Technical execution** — Duc Peterman  

------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------------


