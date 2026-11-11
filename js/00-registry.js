/* ==========================================================================
   00-REGISTRY // CORE ENGINE, STATE STORE, AUDIO FX, TOASTS & DATA MODELS
   The Blueprint Event Management — Khulna, Bangladesh
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'bp_khulna_state_v5';

  const DEFAULT_STATE = {
    theme: 'cyan',
    fxMode: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'minimal' : 'full',
    soundEnabled: false,
    config: {
      eventType: 'corporate',
      guests: 600,
      environment: 'indoor',
      durationHours: 6,
      venueId: 'khulna-club',
      subsystems: ['stage-truss', 'line-array', 'led-dmx', 'passes-security']
    },
    savedBlueprints: [],
    shortlist: [],
    _photoMapVersion: 2,
    teamPhotos: {
      'fattah': { src: 'IMG_3220.JPG.jpeg', posX: 50, posY: 15, verified: true },
      'nibir': { src: 'IMG_1632.JPG.jpeg', posX: 50, posY: 16, verified: true },
      'alif': { src: 'WhatsApp Image 2026-11-11 at 2.51.32 AM.jpeg', posX: 54, posY: 22, verified: true },
      'shommo': { src: 'WhatsApp Image 2026-11-11 at 1.20.03 AM.jpeg', posX: 44, posY: 18, verified: true },
      'rafi': { src: 'WhatsApp Image 2026-11-11 at 1.21.57 AM.jpeg', posX: 50, posY: 15, verified: true }
    },
    cues: [
      { id: 'c1', time: '17:00', duration: 60, dept: 'STAGE', title: 'Technical Soundcheck & DMX Line Check', owner: 'Nibir Guha Roy' },
      { id: 'c2', time: '18:00', duration: 30, dept: 'SECURITY', title: 'Gate Perimeter & VIP Pass Scanners Live', owner: 'Ahnaf Shahriar Rafi' },
      { id: 'c3', time: '18:30', duration: 45, dept: 'VIP', title: 'Red Carpet Reception & Executive Hospitality', owner: 'Alif Rahman' },
      { id: 'c4', time: '19:15', duration: 30, dept: 'LIGHTING', title: 'Grand Opening Intro Sequence & Keynote', owner: 'Abdullah Bin Murshed Fattah' },
      { id: 'c5', time: '19:45', duration: 90, dept: 'AUDIO', title: 'Main Cultural / Live Band Headline Set', owner: 'Mashukul Islam' },
      { id: 'c6', time: '21:15', duration: 30, dept: 'STAGE', title: 'Digital Raffle Draw & Closing Curtain Call', owner: 'Shommo Dip Saha' }
    ],
    checklist: {
      'chk-power': true,
      'chk-sound': true,
      'chk-truss': false,
      'chk-passes': false,
      'chk-weather': false,
      'chk-brief': true
    },
    briefDraft: {
      name: '',
      phone: '',
      type: 'Corporate Gala / Club Night',
      hotline: '8801788706868',
      venue: '',
      date: '',
      message: ''
    }
  };

  function deepMerge(target, source) {
    const out = Object.assign({}, target);
    if (!source || typeof source !== 'object') return out;
    Object.keys(source).forEach((key) => {
      if (Array.isArray(source[key])) {
        out[key] = source[key].slice();
      } else if (source[key] && typeof source[key] === 'object' && target[key] && typeof target[key] === 'object') {
        out[key] = deepMerge(target[key], source[key]);
      } else {
        out[key] = source[key];
      }
    });
    return out;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const parsed = JSON.parse(raw);
      const merged = deepMerge(DEFAULT_STATE, parsed);
      if ((parsed._photoMapVersion || 1) < 2) {
        merged.teamPhotos = Object.assign({}, DEFAULT_STATE.teamPhotos, parsed.teamPhotos || {});
        Object.keys(DEFAULT_STATE.teamPhotos).forEach((k) => {
          if (!merged.teamPhotos[k]?.src) merged.teamPhotos[k] = Object.assign({}, DEFAULT_STATE.teamPhotos[k]);
        });
        merged._photoMapVersion = 2;
      }
      return merged;
    } catch (_) {
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  const appState = loadState();
  const listeners = new Map();
  const registeredFeatures = [];

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
      emit('state:saved', { time: new Date() });
    } catch (_) {
      /* Storage quota or private mode fallback */
    }
  }

  function on(event, cb) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(cb);
    return () => listeners.get(event)?.delete(cb);
  }

  function emit(event, payload) {
    const set = listeners.get(event);
    if (!set) return;
    set.forEach((cb) => {
      try { cb(payload); } catch (err) { console.error('[BlueprintEvent]', event, err); }
    });
  }

  /* ---------- Web Audio Synthesizer (Zero External Audio Dependencies) ---------- */
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone(type = 'click') {
    if (!appState.soundEnabled) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.045);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.055);
    } else if (type === 'confirm') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(780, now + 0.06);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.17);
    } else if (type === 'ping') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1040, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.start(now);
      osc.stop(now + 0.14);
    }
  }

  /* ---------- Stackable Multi-Toast Queue ---------- */
  function toast(message, variant = 'info', title = 'SYSTEM TELEMETRY') {
    const stack = document.getElementById('bpToastStack');
    if (!stack) return;
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    const icons = {
      success: 'fa-circle-check text-emerald-400',
      warning: 'fa-triangle-exclamation text-amber-400',
      info: 'fa-microchip bp-accent-text',
      error: 'fa-circle-xmark text-rose-400'
    };
    const el = document.createElement('div');
    el.id = id;
    el.setAttribute('role', 'status');
    el.className = 'bp-card bp-ticks rounded-xl px-4 py-3 min-w-[270px] max-w-sm shadow-2xl flex items-start gap-3 transition-all duration-300 translate-y-2 opacity-0';
    el.innerHTML = `
      <i class="fa-solid ${icons[variant] || icons.info} text-base mt-0.5 shrink-0"></i>
      <div class="flex-1 min-w-0">
        <div class="font-mono-cad text-[10px] tracking-widest bp-accent-text uppercase">${escapeHtml(title)}</div>
        <div class="text-xs font-medium mt-0.5 leading-snug">${escapeHtml(message)}</div>
      </div>
      <button type="button" aria-label="Dismiss notification" class="text-xs bp-muted-text hover:bp-accent-text px-1">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    stack.appendChild(el);
    requestAnimationFrame(() => {
      el.classList.remove('translate-y-2', 'opacity-0');
    });
    const remove = () => {
      el.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => el.remove(), 260);
    };
    el.querySelector('button').addEventListener('click', remove);
    setTimeout(remove, 3800);
  }

  /* ---------- Clipboard & Formatting Helpers ---------- */
  async function copyText(text, successMsg = 'Copied to clipboard') {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      playTone('confirm');
      toast(successMsg, 'success', 'CLIPBOARD SYNC');
      return true;
    } catch (_) {
      toast('Unable to copy automatically — please select text manually.', 'warning');
      return false;
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function downloadFile(filename, content, mime = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    playTone('confirm');
  }

  /* ---------- Accessible Modal Manager with Focus History & ESC ---------- */
  let activeModalId = null;
  let lastFocusedEl = null;

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    if (activeModalId && activeModalId !== modalId) closeModal(activeModalId);
    lastFocusedEl = document.activeElement;
    activeModalId = modalId;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
    playTone('click');
    const firstFocusable = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) setTimeout(() => firstFocusable.focus(), 40);
    emit('modal:opened', modalId);
  }

  function closeModal(modalId) {
    const id = modalId || activeModalId;
    if (!id) return;
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    if (activeModalId === id) activeModalId = null;
    document.body.classList.remove('overflow-hidden');
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      try { lastFocusedEl.focus(); } catch (_) {}
    }
    emit('modal:closed', id);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModalId) {
      e.preventDefault();
      closeModal(activeModalId);
    }
  });

  function registerFeature(num, category, name, description, selectorOrAction) {
    registeredFeatures.push({ num, category, name, description, selectorOrAction });
  }

  /* ---------- Domain Data: Team, Workspace Photos, Services, Venues, Portfolio, FAQs ---------- */
  const DATA = {
    hotlines: {
      line1: { label: 'Primary Hotline 01', display: '+880 1788-706868', tel: '+8801788706868', wa: '8801788706868' },
      line2: { label: 'Command Hotline 02', display: '+880 1703-700799', tel: '+8801703700799', wa: '8801703700799' }
    },
    workspaceImages: [
      { file: 'IMG_3220.JPG.jpeg', hint: 'Abdullah Bin Murshed Fattah (Teal Panjabi)' },
      { file: 'IMG_1632.JPG.jpeg', hint: 'Nibir Guha Roy (Glasses & Brown Panjabi)' },
      { file: 'WhatsApp Image 2026-11-11 at 2.51.32 AM.jpeg', hint: 'Alif Rahman (Brocade Jacket)' },
      { file: 'WhatsApp Image 2026-11-11 at 1.20.03 AM.jpeg', hint: 'Shommo Dip Saha (White Shirt)' },
      { file: 'WhatsApp Image 2026-11-11 at 1.21.57 AM.jpeg', hint: 'Ahnaf Shahriar Rafi (Red Tie Headshot)' },
      { file: 'WhatsApp Image 2026-11-12 at 2.01.42 AM.jpeg', hint: 'Ahnaf Shahriar Rafi (Full Blazer Alt)' },
      { file: 'WhatsApp Image 2026-11-11 at 1.19.01 AM.jpeg', hint: 'Dark Green Shirt & Sunglasses (Available)' }
    ],
    team: [
      {
        id: 'fattah',
        tier: 'founder',
        code: 'FOUNDING_PANEL // 01',
        clearance: 'LEVEL_ALPHA',
        name: 'Abdullah Bin Murshed Fattah',
        initials: 'AF',
        role: 'Founder & Chief Architect',
        sector: 'STRATEGY & CAD',
        bio: 'Spearheading strategic event architecture, master concept drafting, and executive client partnerships across Khulna. Dedicated to turning high-stakes visions into landmark live productions.',
        specialties: ['Strategic Direction', 'Master CAD Planning', 'Client Architecture', 'Executive Coordination'],
        stats: { Architecture: 98, Logistics: 92, Production: 90, ClientCmd: 97, CrisisOps: 94 },
        verifiedNote: 'Official portrait verified from project workspace (IMG_3220.JPG.jpeg).'
      },
      {
        id: 'nibir',
        tier: 'founder',
        code: 'FOUNDING_PANEL // 02',
        clearance: 'LEVEL_ALPHA',
        name: 'Nibir Guha Roy',
        initials: 'NR',
        role: 'Founder & Production Director',
        sector: 'TECHNICAL & SHOW CALL',
        bio: 'Commanding full-scale technical production, stage fabrication, audio-visual engineering, and live show calling. Ensuring every event operates with zero-latency precision.',
        specialties: ['Technical Production', 'Live Show Command', 'Line-Array Audio', 'DMX Matrix Sync'],
        stats: { Architecture: 94, Logistics: 95, Production: 99, ClientCmd: 91, CrisisOps: 96 }
      },
      {
        id: 'mashukul',
        tier: 'executive',
        code: 'EXEC_ID // 01',
        clearance: 'OPS_COMMAND',
        name: 'Mashukul Islam',
        initials: 'MI',
        role: 'Executive Member — Venue Operations',
        sector: 'LOGISTICS',
        bio: 'Directs on-ground venue operations, structural truss rigging coordination, power load balancing, and rapid tactical logistics deployment across Khulna.',
        specialties: ['Truss & Rigging', '3-Phase Power Grid', 'Vendor Mobilization', 'Load-In Scheduling'],
        stats: { Architecture: 86, Logistics: 97, Production: 93, ClientCmd: 85, CrisisOps: 94 }
      },
      {
        id: 'alif',
        tier: 'executive',
        code: 'EXEC_ID // 02',
        clearance: 'EXEC_OPS',
        name: 'Alif Rahman',
        initials: 'AR',
        role: 'Executive Member — Guest & VIP Protocol',
        sector: 'PROTOCOL',
        bio: 'Leads VIP hospitality engineering, corporate executive protocol, greenroom artist management, and high-touch banquet execution.',
        specialties: ['VIP Hospitality', 'Artist Relations', 'Corporate Protocol', 'Reception Choreography'],
        stats: { Architecture: 84, Logistics: 90, Production: 85, ClientCmd: 98, CrisisOps: 91 }
      },
      {
        id: 'shommo',
        tier: 'executive',
        code: 'EXEC_ID // 03',
        clearance: 'CREATIVE_SYS',
        name: 'Shommo Dip Saha',
        initials: 'SS',
        role: 'Executive Member — Creative & Visual Systems',
        sector: 'CREATIVE',
        bio: 'Oversees visual identity systems, bespoke stage aesthetics, 3D entry gate design, experiential branding, and synchronized media cues.',
        specialties: ['Visual Identity', 'Stage Aesthetics', 'Print & Merch CAD', 'LED Motion Graphics'],
        stats: { Architecture: 96, Logistics: 82, Production: 92, ClientCmd: 88, CrisisOps: 85 }
      },
      {
        id: 'rafi',
        tier: 'executive',
        code: 'EXEC_ID // 04',
        clearance: 'FIELD_CONTROL',
        name: 'Ahnaf Shahriar Rafi',
        initials: 'ASR',
        role: 'Executive Member — Access & Security Flow',
        sector: 'SECURITY & FLOW',
        bio: 'Manages access control matrices, security perimeter grids, serialized ticketing/raffle architecture, and zero-bottleneck crowd flow dynamics.',
        specialties: ['Access Matrices', 'Perimeter Security', 'Ticketing & Raffle Tech', 'Crowd Flow Control'],
        stats: { Architecture: 85, Logistics: 94, Production: 88, ClientCmd: 89, CrisisOps: 97 }
      }
    ],
    eventTypes: {
      corporate: { name: 'Corporate Gala / Club Night', baseKw: 28, baseCrew: 14, stageRatio: 0.9 },
      concert: { name: 'Live Concert / Cultural Fest', baseKw: 70, baseCrew: 30, stageRatio: 1.35 },
      brand: { name: 'Brand Launch / Expo Pavilion', baseKw: 38, baseCrew: 18, stageRatio: 1.05 },
      luxury: { name: 'Bespoke Wedding / Luxury Gala', baseKw: 34, baseCrew: 22, stageRatio: 1.0 },
      campus: { name: 'University Fest / Rag Day', baseKw: 60, baseCrew: 26, stageRatio: 1.25 }
    },
    subsystems: [
      { id: 'stage-truss', label: '3D Stage & Aluminum Truss', kw: 16, crew: 7, tag: 'STRUCTURAL' },
      { id: 'line-array', label: 'Line-Array Concert Audio', kw: 28, crew: 5, tag: 'ACOUSTICS' },
      { id: 'led-dmx', label: 'P3 LED Wall & DMX Matrix', kw: 22, crew: 6, tag: 'VISUAL FX' },
      { id: 'passes-security', label: 'VIP Passes, Gates & Security', kw: 5, crew: 9, tag: 'ACCESS' },
      { id: 'laser-pyro', label: 'Laser Beams & Cold Pyro FX', kw: 12, crew: 3, tag: 'PYRO/FX' },
      { id: 'branding-print', label: 'Entry Gates, Banners & Merch', kw: 4, crew: 5, tag: 'BRANDING' },
      { id: 'broadcast-cam', label: 'Multi-Cam Live Feed & Drone', kw: 8, crew: 5, tag: 'MEDIA' },
      { id: 'raffle-reg', label: 'QR Check-In & Digital Raffle', kw: 3, crew: 4, tag: 'TECH OPS' },
      { id: 'vip-lounge', label: 'VIP Hospitality & Lounge Set', kw: 6, crew: 6, tag: 'PROTOCOL' },
      { id: 'dual-gen', label: 'Dual-Generator Backup Grid', kw: 0, crew: 3, tag: 'REDUNDANCY' }
    ],
    services: [
      {
        id: 'srv-corporate',
        code: 'SYS_MOD // 01',
        category: 'corporate',
        icon: 'fa-building-columns',
        title: 'Corporate & Club Galas',
        protocol: 'EXECUTIVE',
        summary: 'AGM summits, executive banquets, Khulna Club nights, formal farewells, and institutional award ceremonies.',
        leadTime: '14–30 Days',
        linkedSubsystems: ['stage-truss', 'line-array', 'vip-lounge', 'passes-security'],
        inventory: ['Executive Podium & Stage Backdrop', 'Broadcast-Clear Wireless Mics', 'Table Spotlighting & Ambient Wash', 'Serialized VIP Invitations & Lanyards', 'Protocol Usher & Hospitality Team']
      },
      {
        id: 'srv-concert',
        code: 'SYS_MOD // 02',
        category: 'concert',
        icon: 'fa-music',
        title: 'Concerts & Cultural Fests',
        protocol: 'HIGH-DECIBEL',
        summary: 'Arena-grade live music production, university fests (KUET/KU), artist tech riders, and dual-hang line-array acoustics.',
        leadTime: '21–45 Days',
        linkedSubsystems: ['stage-truss', 'line-array', 'led-dmx', 'laser-pyro', 'passes-security', 'dual-gen'],
        inventory: ['Box Truss Goalpost Roof Rig', 'Dual-Hang Line-Array + Subwoofers', 'Digital FOH Console & Stage Monitors', 'Mojo Crowd Barricades & Pit Crew', 'Artist Backstage & Rider Fulfillment']
      },
      {
        id: 'srv-av',
        code: 'SYS_MOD // 03',
        category: 'av',
        icon: 'fa-cubes',
        title: 'Stage & AV Architecture',
        protocol: 'STRUCTURAL',
        summary: 'Custom 3D stage fabrication, P3/P2.5 LED matrix walls, intelligent beam/wash DMX arrays, lasers, and cold pyro.',
        leadTime: '10–21 Days',
        linkedSubsystems: ['stage-truss', 'led-dmx', 'laser-pyro', 'dual-gen'],
        inventory: ['CAD 3D Stage Elevation & Render', 'Seamless P3/P2.5 LED Backdrop Wall', 'Moving-Head Beam & Wash DMX Grid', 'Timecoded Cold Spark & CO2 Jets', 'Synchronized Dual 3-Phase Generators']
      },
      {
        id: 'srv-branding',
        code: 'SYS_MOD // 04',
        category: 'branding',
        icon: 'fa-pen-ruler',
        title: 'Visual Identity & Passes',
        protocol: 'CREATIVE CAD',
        summary: 'Monumental 3D entry arches, experiential photo zones, PVC VIP passes, serialized raffle draw systems, and crew apparel.',
        leadTime: '7–14 Days',
        linkedSubsystems: ['branding-print', 'passes-security', 'raffle-reg'],
        inventory: ['Monumental Branded Entry Arch', 'UV-Printed PVC VIP & Crew Badges', 'Anti-Counterfeit Hologram Tickets', 'Digital Live Raffle Draw Software', 'Custom Crew Polos & Directional Signage']
      },
      {
        id: 'srv-brand',
        code: 'SYS_MOD // 05',
        category: 'brand',
        icon: 'fa-rocket',
        title: 'Brand Activations & Expos',
        protocol: 'EXPERIENTIAL',
        summary: 'High-impact product unveilings, trade exhibition pavilions, interactive tech demo booths, and roadshows in Khulna.',
        leadTime: '14–28 Days',
        linkedSubsystems: ['branding-print', 'led-dmx', 'broadcast-cam', 'raffle-reg'],
        inventory: ['Modular Aluminum Expo Booths', 'Product Reveal Kinetic Drop / Screen', 'QR Lead-Capture Kiosks', 'Multi-Cam Highlight Reel & Drone', 'Brand Ambassador Briefing & Ops']
      },
      {
        id: 'srv-luxury',
        code: 'SYS_MOD // 06',
        category: 'luxury',
        icon: 'fa-gem',
        title: 'Bespoke Luxury Receptions',
        protocol: 'BESPOKE',
        summary: 'Architectural wedding receptions, milestone private galas, custom ambient lighting canopies, and curated hospitality.',
        leadTime: '21–60 Days',
        linkedSubsystems: ['stage-truss', 'vip-lounge', 'led-dmx', 'branding-print'],
        inventory: ['Architectural Floral & Acrylic Stage', 'Warm Fairy & Pin-Spot Table Lighting', 'Acoustic Duo / Live Ensemble Audio', 'Valet & VIP Family Escort Desk', 'Full Timeline & Ceremony Calling']
      }
    ],
    venues: [
      { id: 'khulna-club', name: 'Khulna Club', area: 'Central Khulna', maxPax: 1200, env: 'indoor', ceiling: '18 ft Truss Clear', powerNote: 'Dedicated 3-Phase + Backup Recommended', splLimit: 'Moderate–High Indoor EQ' },
      { id: 'castle-salam', name: 'Hotel Castle Salam', area: 'Gollamari / KDA Ave', maxPax: 850, env: 'indoor', ceiling: '15 ft Ballroom Clear', powerNote: 'Hotel Gen + Aux AV Tie-In', splLimit: 'Acoustic Controlled Ballroom' },
      { id: 'city-inn', name: 'Hotel City Inn Khulna', area: 'Moylapota Moor', maxPax: 750, env: 'indoor', ceiling: '14 ft Hall Clear', powerNote: 'Dual-Line Tie-In Recommended', splLimit: 'Controlled Indoor SPL' },
      { id: 'css-ava', name: 'CSS Ava Center', area: 'Rupsha Strand / Khulna', maxPax: 900, env: 'indoor', ceiling: '20 ft Auditorium Rig', powerNote: 'Clean Auditorium Power Grid', splLimit: 'Concert-Capable Indoor Acoustic' },
      { id: 'kuet-campus', name: 'KUET / Khulna Univ. Grounds', area: 'Fulbari / Gollamari', maxPax: 5000, env: 'outdoor', ceiling: 'Open Sky (32 ft Goalpost Truss)', powerNote: 'Dual 125 kVA Silent Generators Required', splLimit: 'Full Line-Array Long Throw' },
      { id: 'circuit-field', name: 'Khulna Open Arena / Ground', area: 'City Center', maxPax: 4500, env: 'outdoor', ceiling: 'Open Sky (Waterproof Canopy)', powerNote: 'Independent Twin Gen Grid', splLimit: 'High-SPL Arena Coverage' },
      { id: 'custom-venue', name: 'Custom / Nationwide Destination', area: 'Jessore / Mongla / Dhaka', maxPax: 5000, env: 'semi', ceiling: 'Site-Survey Calibrated', powerNote: 'On-Site Load Survey Included', splLimit: 'Custom Acoustic Dispersion' }
    ],
    portfolio: [
      {
        id: 'naksa-cultural-fest',
        code: 'EXECUTED // 01',
        category: 'cultural',
        title: 'NAKSA CULTURAL FEST',
        subtitle: 'CULTURAL FESTIVAL // KHULNA',
        scale: 'Cultural Fest',
        power: 'Stage & AV Rig',
        crew: 'Full Ops Crew',
        tags: ['Stage & Lighting', 'Live Sound', 'Event Production'],
        summary: 'Complete cultural festival production featuring stage engineering, live audio-visual orchestration, crowd coordination, and cue-to-cue show calling.',
        metrics: { Production: 'Turnkey Live', Execution: 'Stage & AV', Status: 'Executed' },
        blueprintPreset: { eventType: 'concert', guests: 1200, environment: 'outdoor', subsystems: ['stage-truss', 'line-array', 'led-dmx', 'passes-security'] }
      },
      {
        id: 'bsaa-family-night',
        code: 'EXECUTED // 02',
        category: 'corporate',
        title: 'BSAA FAMILY NIGHT CORPORATE EVENT',
        subtitle: 'CORPORATE GALA & FAMILY NIGHT',
        scale: 'Corporate Gala',
        power: 'Ballroom AV Setup',
        crew: 'Protocol & Tech',
        tags: ['Corporate Event', 'Guest Protocol', 'Audio & Lighting'],
        summary: 'Executive corporate & family evening engineered with custom stage aesthetics, ambient lighting, balanced acoustics, and curated guest hospitality.',
        metrics: { Format: 'Corporate Gala', Focus: 'Guest Flow', Status: 'Executed' },
        blueprintPreset: { eventType: 'corporate', guests: 600, environment: 'indoor', subsystems: ['stage-truss', 'line-array', 'vip-lounge', 'passes-security'] }
      },
      {
        id: 'naksa-iftar',
        code: 'EXECUTED // 03',
        category: 'community',
        title: 'NAKSA IFTAR',
        subtitle: 'IFTAR GATHERING // KHULNA',
        scale: 'Iftar Gathering',
        power: 'Audio & Ambient',
        crew: 'Hospitality Ops',
        tags: ['Hospitality Flow', 'Warm Lighting', 'Event Audio'],
        summary: 'Thoughtfully coordinated Iftar gathering featuring smooth guest reception, dining zone logistics, warm ambient lighting, and clear event audio.',
        metrics: { Format: 'Community Iftar', Focus: 'Hospitality', Status: 'Executed' },
        blueprintPreset: { eventType: 'corporate', guests: 400, environment: 'indoor', subsystems: ['line-array', 'vip-lounge', 'passes-security'] }
      }
    ],
    testimonials: [
      {
        quote: 'Their CAD planning before load-in meant our Khulna Club evening had zero audio feedback, crisp lighting transitions, and effortless VIP entry.',
        author: 'Executive Gala Committee Representative',
        org: 'Khulna Club Evening Production',
        rating: '5.0 // VERIFIED OPS'
      },
      {
        quote: 'From heavy box-truss rigging in unpredictable weather to serialized digital passes for over two thousand attendees, Nibir & Fattah’s crew ran like clockwork.',
        author: 'Cultural Fest Organizing Lead',
        org: 'Khulna Campus Festival Series',
        rating: '5.0 // HIGH-SPL LIVE'
      },
      {
        quote: 'Rare to find an event team in Bangladesh that bridges architectural aesthetics with genuine electrical, acoustic, and crowd-safety engineering.',
        author: 'Regional Brand Activation Manager',
        org: 'Corporate Product Unveiling',
        rating: '5.0 // TURNKEY BRIEF'
      }
    ],
    faqs: [
      { q: 'How far in advance should we book The Blueprint Event Management?', cat: 'timeline', a: 'For corporate galas and branding activations (100–800 guests), 14–21 days is optimal. For full-scale concerts, university fests, or luxury weddings, 30–60 days ensures priority truss, LED wall, and generator allocation. Fast-track emergency builds within 5–7 days can be requested directly on +880 1788-706868.' },
      { q: 'Do you operate exclusively in Khulna or across Bangladesh?', cat: 'venues', a: 'Our engineering headquarters and core crew are based in Khulna (serving Khulna Club, Hotel Castle Salam, City Inn, CSS Ava Center, KUET, and Khulna University). We also deploy turnkey mobile production rigs to Jessore, Mongla, Satkhira, Barishal, and Dhaka.' },
      { q: 'What happens if an outdoor event faces sudden rain or power outages?', cat: 'technical', a: 'Every outdoor blueprint includes optional waterproof box-truss canopies, elevated cable ramps, IP-rated stage lighting protection, and twin synchronized 3-phase backup generators with instant transfer switches so the show never drops.' },
      { q: 'Can we book only Stage/AV or Branding & Passes without full event planning?', cat: 'booking', a: 'Yes! Our modular architecture lets you engage individual systems—such as 3D stage & P3 LED walls, concert line-array audio, or custom VIP PVC passes & digital raffle software—or combine everything into a turnkey package.' },
      { q: 'How do we receive a tailored proposal after configuring Blueprint Lab?', cat: 'booking', a: 'Once you select your event format, guest scale, and subsystems in Blueprint Lab, click Dispatch via WhatsApp or submit the Project Brief. Our Founding Panel will conduct a quick venue survey and send a tailored proposal.' },
      { q: 'Do you handle artist tech riders and live show calling?', cat: 'technical', a: 'Yes. Founder Nibir Guha Roy and our production crew execute complete technical riders (digital FOH mixers, IEMs, backline, monitor mixes) alongside cue-to-cue live show calling.' },
      { q: 'Can you print serialized raffle tickets, QR passes, and crew merchandise?', cat: 'booking', a: 'Yes! Our Creative & Access sectors produce anti-counterfeit numbered raffle books, digital live-draw screens, UV-printed PVC VIP passes with custom lanyards, 3D entry arches, and branded crew polos.' },
      { q: 'How do I send my custom CAD floorplan or spec sheet to your team?', cat: 'timeline', a: 'Once configured in Blueprint Lab, click "Dispatch to Hotline 01 (+880 1788-706868)" or "Hotline 02 (+880 1703-700799)" to send your full spec directly via WhatsApp, or export your PNG floorplan and attach it.' }
    ]
  };

  window.BlueprintApp = {
    version: '5.0.0',
    state: appState,
    data: DATA,
    features: registeredFeatures,
    on,
    emit,
    saveState,
    playTone,
    toast,
    copyText,
    escapeHtml,
    downloadFile,
    openModal,
    closeModal,
    registerFeature
  };
})();
