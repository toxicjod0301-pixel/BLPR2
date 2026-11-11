/* ==========================================================================
   02-VISUAL-FX // CAD CANVAS, 3D TILT, HERO EMBLEM LAB, COUNTERS & PROTOCOL
   ========================================================================== */

(function () {
  'use strict';
  const App = window.BlueprintApp;
  if (!App) return;

  function initVisualFx() {
    // 09 & 105. HiDPI CAD Canvas Background with Particles, Crosshair, Click Ripples & Tab Visibility Pause
    const canvas = document.getElementById('cadBgCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const coordsEl = document.getElementById('mouseCoords');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let mouseX = width * 0.5;
    let mouseY = height * 0.4;
    let rafId = null;
    const ripples = [];
    const nodes = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.5 + Math.random() * 1.6
    }));

    function getAccentRgb() {
      return getComputedStyle(document.documentElement).getPropertyValue('--bp-accent-rgb').trim() || '0, 240, 255';
    }

    function sizeCanvas() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    if (canvas && ctx) {
      sizeCanvas();
      window.addEventListener('resize', sizeCanvas);
      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (coordsEl) {
          coordsEl.textContent = `CAD_CURSOR // X:${String(Math.round(mouseX)).padStart(4, '0')} Y:${String(Math.round(mouseY)).padStart(4, '0')}`;
        }
      }, { passive: true });

      window.addEventListener('click', (e) => {
        if (App.state.fxMode === 'minimal') return;
        ripples.push({ x: e.clientX, y: e.clientY, r: 4, alpha: 0.55 });
      });

      const draw = () => {
        if (document.hidden || App.state.fxMode === 'minimal') {
          rafId = null;
          return;
        }
        ctx.clearRect(0, 0, width, height);
        const rgb = getAccentRgb();
        const isFull = App.state.fxMode === 'full';

        // Crosshair guidelines (desktop)
        if (width >= 1024) {
          ctx.strokeStyle = `rgba(${rgb}, 0.11)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, mouseY);
          ctx.lineTo(width, mouseY);
          ctx.moveTo(mouseX, 0);
          ctx.lineTo(mouseX, height);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(mouseX, mouseY, 18, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${rgb}, 0.25)`;
          ctx.stroke();
        }

        // Particle Constellation
        if (isFull) {
          for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;

            ctx.fillStyle = `rgba(${rgb}, 0.45)`;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();

            for (let j = i + 1; j < nodes.length; j++) {
              const m = nodes[j];
              const dx = n.x - m.x;
              const dy = n.y - m.y;
              const dist = Math.hypot(dx, dy);
              if (dist < 140) {
                ctx.strokeStyle = `rgba(${rgb}, ${(1 - dist / 140) * 0.14})`;
                ctx.beginPath();
                ctx.moveTo(n.x, n.y);
                ctx.lineTo(m.x, m.y);
                ctx.stroke();
              }
            }
          }
        }

        // Click sonar ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
          const rp = ripples[i];
          rp.r += 2.6;
          rp.alpha -= 0.016;
          if (rp.alpha <= 0) {
            ripples.splice(i, 1);
            continue;
          }
          ctx.strokeStyle = `rgba(${rgb}, ${rp.alpha.toFixed(3)})`;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
          ctx.stroke();
        }

        rafId = requestAnimationFrame(draw);
      };

      const startLoop = () => {
        if (!rafId && !document.hidden && App.state.fxMode !== 'minimal') {
          rafId = requestAnimationFrame(draw);
        }
      };
      startLoop();
      document.addEventListener('visibilitychange', startLoop);
      App.on('fx:changed', startLoop);
    }
    App.registerFeature(9, 'Visual FX', 'Interactive HiDPI CAD Constellation Canvas', 'Live particle lattice, crosshair telemetry, and sonar click ripples.');
    App.registerFeature(105, 'Performance', 'Tab Visibility Canvas Auto-Pause', 'Pauses background animation loops when browser tab is hidden.');

    // 10. Magnetic Primary Buttons (Desktop Only)
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (!isCoarse) {
      document.querySelectorAll('.bp-magnetic').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          if (App.state.fxMode === 'minimal') return;
          const r = btn.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width / 2) * 0.18;
          const dy = (e.clientY - r.top - r.height / 2) * 0.18;
          btn.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
        });
      });
    }
    App.registerFeature(10, 'Visual FX', 'Magnetic Action Buttons', 'Subtle physics attraction on hero CTAs.');

    // 11. Spotlight Glow & Subtle 3D Tilt on Cards
    document.querySelectorAll('.bp-spotlight').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        if (card.classList.contains('bp-card-tilt') && App.state.fxMode === 'full' && !isCoarse) {
          const rx = ((y / r.height) - 0.5) * -5;
          const ry = ((x / r.width) - 0.5) * 5;
          card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-2px)`;
        }
      });
      card.addEventListener('mouseleave', () => {
        if (card.classList.contains('bp-card-tilt')) card.style.transform = '';
      });
    });
    App.registerFeature(11, 'Visual FX', '3D Perspective Tilt & Cursor Spotlight', 'Dynamic specular glow and tilt across HUD modules.');

    // 14 & 15. Scroll Reveal & Animated Numeric Counters
    const revealEls = document.querySelectorAll('.reveal-up');
    if ('IntersectionObserver' in window) {
      const revealObs = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.08 });
      revealEls.forEach((el) => revealObs.observe(el));

      const counterObs = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-count-to') || '0');
          const suffix = el.getAttribute('data-count-suffix') || '';
          const decimals = parseInt(el.getAttribute('data-count-dec') || '0', 10);
          const start = performance.now();
          const dur = 1100;
          const tick = (now) => {
            const p = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = target * eased;
            el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString()) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.unobserve(el);
        });
      }, { threshold: 0.35 });
      document.querySelectorAll('[data-count-to]').forEach((el) => counterObs.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
    App.registerFeature(14, 'Visual FX', 'Eased Telemetry Metric Counters', 'Intersection-triggered numeric animations for KPI metrics.');
    App.registerFeature(15, 'Visual FX', 'Staggered Scroll Reveal Engine', 'Smooth section entrance choreography with reduced-motion fallback.');

    // 21 & 22. Interactive Hero Emblem Modes & Node Inspector
    const emblemCard = document.getElementById('heroEmblemCard');
    const emblemSvg = document.getElementById('heroEmblemSvg');
    const emblemModeBtns = document.querySelectorAll('[data-emblem-mode]');
    const emblemNodeDetail = document.getElementById('emblemNodeDetail');
    const emblemNodes = document.querySelectorAll('[data-emblem-node]');

    emblemModeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-emblem-mode');
        emblemModeBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        if (emblemSvg) {
          emblemSvg.setAttribute('data-view-mode', mode);
          const wireframeGroup = emblemSvg.querySelector('#emblemWireframeOverlay');
          const dmxBeams = emblemSvg.querySelector('#emblemDmxBeams');
          if (wireframeGroup) wireframeGroup.style.opacity = mode === 'wireframe' ? '1' : '0.28';
          if (dmxBeams) dmxBeams.style.opacity = mode === 'dmx' ? '0.95' : '0';
        }
        App.playTone('click');
      });
    });

    if (emblemCard && emblemSvg) {
      emblemCard.addEventListener('mousemove', (e) => {
        if (App.state.fxMode === 'minimal') return;
        const r = emblemCard.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -12;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 14;
        emblemSvg.style.transform = `perspective(700px) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg)`;
      });
      emblemCard.addEventListener('mouseleave', () => {
        emblemSvg.style.transform = '';
      });
    }

    const nodeMessages = {
      precision: 'NODE 01 // CAD PRECISION: Every venue floorplan & truss span drafted to millimeter tolerance before load-in.',
      rigging: 'NODE 02 // AV RIGGING: Heavy box trussing, concert line-arrays & DMX moving heads engineered for zero failure.',
      protocol: 'NODE 03 // VIP PROTOCOL: Serialized PVC access control, greenroom hospitality & diplomatic guest flow.',
      command: 'NODE 04 // LIVE SHOW CALLING: Synchronized timecode execution by Founders A.B.M. Fattah & N.G. Roy.'
    };
    emblemNodes.forEach((node) => {
      node.addEventListener('click', () => {
        const key = node.getAttribute('data-emblem-node');
        if (emblemNodeDetail) emblemNodeDetail.textContent = nodeMessages[key] || '';
        App.playTone('ping');
      });
    });
    App.registerFeature(21, 'Hero & Brand', 'Interactive 3D Emblem Mode Switcher', 'Toggle Vector CAD, Blueprint Wireframe, and Live DMX Stage views.');
    App.registerFeature(22, 'Hero & Brand', 'Clickable Emblem Pillar Nodes', 'Inspect core agency engineering pillars directly on the hero schematic.');

    // 23. Scramble-Decode Cycling Hero Headline Discipline
    const scrambleEl = document.getElementById('heroScrambleWord');
    const words = ['THE EXPERIENCE.', 'LIVE CONCERTS.', 'EXECUTIVE GALAS.', 'KHULNA LANDMARKS.', 'BRAND LAUNCHES.'];
    let wordIdx = 0;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/_';
    if (scrambleEl) {
      setInterval(() => {
        if (document.hidden || App.state.fxMode === 'minimal') return;
        wordIdx = (wordIdx + 1) % words.length;
        const target = words[wordIdx];
        let iter = 0;
        const timer = setInterval(() => {
          scrambleEl.textContent = target.split('').map((ch, i) => {
            if (ch === ' ' || ch === '.') return ch;
            if (i < iter) return target[i];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('');
          iter += 0.65;
          if (iter >= target.length) {
            scrambleEl.textContent = target;
            clearInterval(timer);
          }
        }, 32);
      }, 3800);
    }
    App.registerFeature(23, 'Hero & Brand', 'Text Scramble Discipline Cycler', 'Cycles event production specialties with matrix decode animation.');

    // 24. Khulna Booking Season Availability Micro-Calendar
    const seasonStrip = document.getElementById('seasonAvailabilityStrip');
    if (seasonStrip) {
      const months = [
        { m: 'NOV 26', status: 'LIMITED', cls: 'text-amber-400 border-amber-400/40', note: '2 Weekend Slots Open' },
        { m: 'DEC 26', status: 'PEAK', cls: 'text-rose-400 border-rose-400/40', note: 'High Demand — Book Early' },
        { m: 'JAN 27', status: 'OPEN', cls: 'text-emerald-400 border-emerald-400/40', note: 'Full Rig Available' },
        { m: 'FEB 27', status: 'OPEN', cls: 'text-emerald-400 border-emerald-400/40', note: 'Campus Fest Season' }
      ];
      seasonStrip.innerHTML = months.map((item) => `
        <button type="button" data-season-pick="${item.m}" class="text-left p-2.5 rounded-lg border ${item.cls} bg-black/20 hover:bg-white/5 transition-all">
          <div class="flex items-center justify-between font-mono-cad text-[10px]">
            <span class="font-bold">${item.m}</span>
            <span>${item.status}</span>
          </div>
          <div class="text-[11px] bp-soft-text mt-1 truncate">${item.note}</div>
        </button>
      `).join('');
      seasonStrip.querySelectorAll('[data-season-pick]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const picked = btn.getAttribute('data-season-pick');
          const venueInput = document.getElementById('clientVenue');
          if (venueInput && !venueInput.value.includes(picked)) {
            venueInput.value = `Target: ${picked} — Khulna`;
            venueInput.dispatchEvent(new Event('input'));
          }
          App.toast(`Selected ${picked} target window in Project Brief`, 'info', 'BOOKING WINDOW');
          document.getElementById('comms')?.scrollIntoView({ behavior: 'smooth' });
        });
      });
    }
    App.registerFeature(24, 'Hero & Brand', 'Live Khulna Season Availability Pulse', 'Click target month slot to pre-fill booking date in brief.');

    // 25 & 26. Hotline vCard (.vcf) Generator & Copy Actions
    const downloadVcf = (name, tel) => {
      const vcf = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:The Blueprint Event Management (${name})`,
        'ORG:The Blueprint Event Management;Khulna HQ',
        `TEL;TYPE=WORK,VOICE:${tel}`,
        'ADR;TYPE=WORK:;;Khulna;Khulna Division;;Bangladesh',
        'NOTE:Founding Panel: Abdullah Bin Murshed Fattah & Nibir Guha Roy',
        'END:VCARD'
      ].join('\r\n');
      App.downloadFile(`Blueprint-${name.replace(/\s+/g, '-')}.vcf`, vcf, 'text/vcard');
      App.toast(`Saved ${name} contact card (.vcf)`, 'success', 'VCARD EXPORT');
    };
    document.querySelectorAll('[data-download-vcf]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const line = btn.getAttribute('data-download-vcf');
        if (line === '1') downloadVcf('Hotline-01', '+8801788706868');
        else downloadVcf('Hotline-02', '+8801703700799');
      });
    });
    document.querySelectorAll('[data-copy-phone]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const num = btn.getAttribute('data-copy-phone');
        const original = btn.innerHTML;
        App.copyText(num, `Phone number ${num} copied!`);
        btn.innerHTML = '<i class="fa-solid fa-check"></i> COPIED';
        setTimeout(() => { btn.innerHTML = original; }, 1600);
      });
    });
    App.registerFeature(25, 'Comms', 'Dual Khulna Hotline Quick Actions', 'One-tap Call, WhatsApp, and Copy controls across header, hero, and footer.');
    App.registerFeature(26, 'Comms', 'Instant vCard (.vcf) Contact Download', 'Save either Khulna HQ hotline directly to mobile/desktop contacts.');

    // 27. Agency Philosophy / Engineering / Footprint Tabs
    const philBtns = document.querySelectorAll('[data-phil-tab]');
    const philPanels = document.querySelectorAll('[data-phil-panel]');
    philBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-phil-tab');
        philBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        philPanels.forEach((p) => p.classList.toggle('hidden', p.getAttribute('data-phil-panel') !== key));
        App.playTone('click');
      });
    });
    App.registerFeature(27, 'Architecture', 'Interactive Philosophy & Engineering Tabs', 'Switch between Mission, Technical Standards, and Khulna Footprint.');

    // 28. Interactive 4-Phase Execution Stepper Inspector
    const phaseCards = document.querySelectorAll('[data-phase-step]');
    const phaseDetailBox = document.getElementById('phaseProtocolDetail');
    const phaseSpecs = {
      '1': { title: 'PHASE 01 // CONCEPT & CAD DRAFTING', deliverables: ['3D Stage Elevation Render', 'Scaled Crowd & Seating Floorplan', 'Custom Visual Key-Art & Gate Branding', 'Itemized Power & Truss Load Sheet'], sla: 'Turnaround: 48–72 Hours from Survey' },
      '2': { title: 'PHASE 02 // STRUCTURAL & AV RIGGING', deliverables: ['Box Truss Goalpost Assembly', 'Line-Array Dispersion Calibration', 'P3/P2.5 LED Screen Wall Mapping', 'Synchronized DMX Moving-Head Pre-Program'], sla: 'Load-in: 12–24 Hours Pre-Doors' },
      '3': { title: 'PHASE 03 // LOGISTICS & ACCESS MATRIX', deliverables: ['Serialized PVC VIP & Crew Lanyards', 'QR Check-In & Digital Raffle Terminal', 'Mojo Barricade & Perimeter Crew Briefing', 'Greenroom & Executive Protocol Desk'], sla: 'Gate Check: 90 Mins Before Doors' },
      '4': { title: 'PHASE 04 // LIVE SHOW CALLING', deliverables: ['Master Timecode Cue Sheet Execution', '6-Channel Crew Radio Dispatch', 'Live Backup Generator Auto-Transfer Standby', 'Post-Event Load-Out & Venue Handover'], sla: 'Zero-Latency Real-Time Command' }
    };
    phaseCards.forEach((card) => {
      card.addEventListener('click', () => {
        const step = card.getAttribute('data-phase-step');
        phaseCards.forEach((c) => c.classList.toggle('ring-2', c === card));
        const info = phaseSpecs[step];
        if (phaseDetailBox && info) {
          phaseDetailBox.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 mb-3 border-b border-current/15">
              <div class="font-tech font-bold text-sm bp-accent-text">${info.title}</div>
              <span class="font-mono-cad text-[11px] px-2.5 py-0.5 rounded bg-white/10">${info.sla}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              ${info.deliverables.map((d) => `<div class="p-2.5 rounded-lg bg-black/20 border border-current/15 text-xs flex items-center gap-2"><i class="fa-solid fa-check bp-accent-text"></i><span>${d}</span></div>`).join('')}
            </div>
          `;
        }
        App.playTone('click');
      });
    });
    App.registerFeature(28, 'Architecture', 'Interactive 4-Phase Protocol Stepper', 'Inspect phase deliverables, turnaround SLAs, and execution checklists.');

    // 29. Standard Vendor vs The Blueprint Comparison Toggle
    const compRange = document.getElementById('vendorCompareRange');
    const compBlueprintLabel = document.getElementById('compareBlueprintSummary');
    if (compRange && compBlueprintLabel) {
      const updateComp = () => {
        const v = parseInt(compRange.value, 10);
        const tier = v < 40 ? 'Standard Event Vendor Approach: Fragmented subcontractors, ad-hoc cabling, zero CAD pre-check.'
          : v < 75 ? 'Hybrid Production: Partial floorplan, single power line, manual gate coordination.'
          : 'THE BLUEPRINT SYSTEM: Full CAD floorplan, 3-phase dual-gen redundancy, DMX pre-cueing & unified command!';
        compBlueprintLabel.textContent = tier;
      };
      compRange.addEventListener('input', updateComp);
      updateComp();
    }
    App.registerFeature(29, 'Architecture', 'Vendor vs Blueprint Benchmark Slider', 'Interactive readiness scale contrasting traditional setups vs engineered architecture.');
    App.registerFeature(30, 'Architecture', 'Live SLA Readiness Gauges', 'Visual KPI bars for cue precision, power uptime, and gate flow.');
  }

  document.addEventListener('DOMContentLoaded', initVisualFx);
})();
