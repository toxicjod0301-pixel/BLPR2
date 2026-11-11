/* ==========================================================================
   01-HUD-SHELL // NAVIGATION, THEMES, COMMAND PALETTE, SHORTCUTS & SYSTEM HUD
   ========================================================================== */

(function () {
  'use strict';
  const App = window.BlueprintApp;
  if (!App) return;

  function initHudShell() {
    // 01. Boot Preloader (skippable + fast auto-complete)
    const preloader = document.getElementById('bpPreloader');
    const skipPreloaderBtn = document.getElementById('skipPreloaderBtn');
    const dismissPreloader = () => {
      if (!preloader || preloader.classList.contains('is-done')) return;
      preloader.classList.add('is-done');
      setTimeout(() => preloader.remove(), 500);
    };
    if (preloader) {
      if (sessionStorage.getItem('bp_booted')) {
        preloader.remove();
      } else {
        sessionStorage.setItem('bp_booted', '1');
        setTimeout(dismissPreloader, 750);
      }
    }
    if (skipPreloaderBtn) skipPreloaderBtn.addEventListener('click', dismissPreloader);
    App.registerFeature(1, 'Shell & UX', 'Architectural Boot Preloader', 'Fast animated schematic reveal with skip & session memory.');

    // 02. Live Bangladesh Standard Time (BST / Asia/Dhaka) Clock
    const clockEl = document.getElementById('liveClock');
    const shiftEl = document.getElementById('liveShiftBadge');
    const updateClock = () => {
      const now = new Date();
      try {
        const bstStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Dhaka', hour12: false });
        const bstHour = parseInt(bstStr.split(':')[0], 10);
        if (clockEl) clockEl.textContent = `KHULNA_BST: ${bstStr}`;
        if (shiftEl) {
          shiftEl.textContent = (bstHour >= 9 && bstHour < 22) ? 'OPS_DESK: ACTIVE' : '24/7 NIGHT_DISPATCH';
        }
      } catch (_) {
        if (clockEl) clockEl.textContent = `SYS_TIME: ${now.toTimeString().slice(0, 8)} BST`;
      }
    };
    updateClock();
    setInterval(updateClock, 1000);
    App.registerFeature(2, 'Shell & UX', 'Live Khulna BST Command Clock', 'Real-time Asia/Dhaka UTC+6 telemetry clock & active shift badge.');

    // 03. Scroll Progress Ruler & Section Code Telemetry
    const progressBar = document.getElementById('scrollProgressBar');
    const progressPct = document.getElementById('scrollProgressPct');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const backToTopRing = document.getElementById('backToTopRing');
    const mainHeader = document.getElementById('mainHeader');

    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));

      if (progressBar) progressBar.style.width = `${pct.toFixed(1)}%`;
      if (progressPct) progressPct.textContent = `${Math.round(pct)}%`;

      // 12. Smart Sticky Navbar Compact State
      if (mainHeader) {
        mainHeader.classList.toggle('shadow-2xl', scrollTop > 40);
      }

      // 19. Back-to-top Orbital Gauge
      if (backToTopBtn) {
        const show = scrollTop > 420;
        backToTopBtn.classList.toggle('opacity-0', !show);
        backToTopBtn.classList.toggle('pointer-events-none', !show);
        backToTopBtn.classList.toggle('translate-y-3', !show);
      }
      if (backToTopRing) {
        const circumference = 113.1;
        backToTopRing.style.strokeDashoffset = (circumference - (pct / 100) * circumference).toFixed(2);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        App.playTone('click');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    App.registerFeature(3, 'Shell & UX', 'Precision Scroll Ruler', 'Live 0-100% architectural scroll gauge in top HUD.');
    App.registerFeature(12, 'Shell & UX', 'Sticky Adaptive Command Bar', 'Elevated backdrop header with quick tools.');
    App.registerFeature(19, 'Shell & UX', 'Orbital Back-to-Top Ring', 'SVG circular scroll indicator floating button.');

    // 04. Scroll Spy Side Section Rail + Active Nav Highlight
    const sections = Array.from(document.querySelectorAll('section[data-sec-code]'));
    const railDots = Array.from(document.querySelectorAll('.bp-rail-dot'));
    const navLinks = Array.from(document.querySelectorAll('.bp-nav-link'));
    const activeSecLabel = document.getElementById('activeSectionLabel');

    if ('IntersectionObserver' in window && sections.length) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          const code = entry.target.getAttribute('data-sec-code') || 'SEC';
          if (activeSecLabel) activeSecLabel.textContent = code;
          railDots.forEach((d) => d.classList.toggle('is-active', d.getAttribute('data-target') === id));
          navLinks.forEach((l) => {
            const match = l.getAttribute('href') === `#${id}`;
            l.classList.toggle('bp-accent-text', match);
            l.classList.toggle('bg-white/5', match);
          });
        });
      }, { rootMargin: '-38% 0px -52% 0px', threshold: 0.01 });
      sections.forEach((s) => spy.observe(s));
    }
    App.registerFeature(4, 'Shell & UX', 'Floating Scroll-Spy Section Rail', 'Interactive right-edge section index synchronized via IntersectionObserver.');

    // 104. Smooth Anchor Offset Navigation
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        App.playTone('click');
        const offset = 96;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      });
    });
    App.registerFeature(104, 'Accessibility', 'Offset-Calibrated Smooth Anchor Nav', 'Automatically offsets fixed sticky header height when jumping to sections.');

    // 06. Multi-Theme Engine (4 Themes persisted to localStorage)
    const applyTheme = (theme, announce = false) => {
      const valid = ['cyan', 'gold', 'crimson', 'light'].includes(theme) ? theme : 'cyan';
      App.state.theme = valid;
      document.documentElement.setAttribute('data-theme', valid);
      App.saveState();
      document.querySelectorAll('[data-set-theme]').forEach((btn) => {
        const active = btn.getAttribute('data-set-theme') === valid;
        btn.classList.toggle('ring-2', active);
        btn.classList.toggle('ring-white', active && valid !== 'light');
        btn.classList.toggle('ring-sky-600', active && valid === 'light');
      });
      App.emit('theme:changed', valid);
      if (announce) {
        const names = { cyan: 'Blueprint Cyan', gold: 'Imperial Gala Gold', crimson: 'Live Arena Crimson', light: 'Architect Daylight Paper' };
        App.toast(`Theme switched to ${names[valid]}`, 'info', 'THEME ENGINE');
      }
    };
    applyTheme(App.state.theme, false);
    document.querySelectorAll('[data-set-theme]').forEach((btn) => {
      btn.addEventListener('click', () => {
        App.playTone('confirm');
        applyTheme(btn.getAttribute('data-set-theme'), true);
      });
    });
    App.applyTheme = applyTheme;
    App.registerFeature(6, 'Shell & UX', '4-Mode Architectural Theme Engine', 'Switch between Blueprint Cyan, Imperial Gold, Live Crimson, and Architect Light.');

    // 07. FX Intensity Control (Full / Balanced / Minimal)
    const fxBtn = document.getElementById('fxModeToggleBtn');
    const applyFx = (mode, announce = false) => {
      const order = ['full', 'balanced', 'minimal'];
      const valid = order.includes(mode) ? mode : 'full';
      App.state.fxMode = valid;
      document.documentElement.setAttribute('data-fx', valid);
      App.saveState();
      if (fxBtn) {
        const labels = { full: 'FX: FULL', balanced: 'FX: LITE', minimal: 'FX: MIN' };
        fxBtn.querySelector('span').textContent = labels[valid];
      }
      App.emit('fx:changed', valid);
      if (announce) App.toast(`Visual FX set to ${valid.toUpperCase()} mode`, 'info', 'GRAPHICS ENGINE');
    };
    applyFx(App.state.fxMode, false);
    if (fxBtn) {
      fxBtn.addEventListener('click', () => {
        const order = ['full', 'balanced', 'minimal'];
        const next = order[(order.indexOf(App.state.fxMode) + 1) % order.length];
        App.playTone('click');
        applyFx(next, true);
      });
    }
    App.registerFeature(7, 'Accessibility', 'FX Intensity & Reduced-Motion Control', 'Cycle Full / Balanced / Minimal motion levels anytime.');

    // 08. Web Audio UI Sound Toggle
    const soundBtn = document.getElementById('soundToggleBtn');
    const updateSoundUI = () => {
      if (!soundBtn) return;
      const on = !!App.state.soundEnabled;
      soundBtn.classList.toggle('bp-accent-text', on);
      soundBtn.setAttribute('aria-pressed', String(on));
      const icon = soundBtn.querySelector('i');
      const label = soundBtn.querySelector('span');
      if (icon) icon.className = on ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
      if (label) label.textContent = on ? 'SFX: ON' : 'SFX: OFF';
    };
    updateSoundUI();
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        App.state.soundEnabled = !App.state.soundEnabled;
        App.saveState();
        updateSoundUI();
        if (App.state.soundEnabled) App.playTone('confirm');
        App.toast(`Interactive UI Sound FX ${App.state.soundEnabled ? 'Enabled' : 'Muted'}`, 'info', 'AUDIO BUS');
      });
    }
    App.registerFeature(8, 'Shell & UX', 'Synthesized Web Audio FX Bus', 'Opt-in Web Audio API tactile micro-tones with zero external assets.');

    // Studio Preferences Drawer Trigger
    document.querySelectorAll('[data-open-settings]').forEach((b) => {
      b.addEventListener('click', () => App.openModal('studioSettingsModal'));
    });

    // 13. Mobile Command Drawer
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileMenuClose');
    const toggleMobile = (force) => {
      if (!mobileDrawer) return;
      const open = typeof force === 'boolean' ? force : mobileDrawer.classList.contains('hidden');
      mobileDrawer.classList.toggle('hidden', !open);
      mobileBtn?.setAttribute('aria-expanded', String(open));
      App.playTone('click');
    };
    if (mobileBtn) mobileBtn.addEventListener('click', () => toggleMobile());
    if (mobileClose) mobileClose.addEventListener('click', () => toggleMobile(false));
    if (mobileDrawer) {
      mobileDrawer.querySelectorAll('a, button[data-mobile-close]').forEach((el) => {
        el.addEventListener('click', () => toggleMobile(false));
      });
    }
    App.registerFeature(13, 'Shell & UX', 'Responsive Mobile Command Drawer', 'Quick mobile navigation with direct hotlines and theme switches.');

    // 05. Global Command Palette (Ctrl+K / Cmd+K)
    const cmdInput = document.getElementById('cmdPaletteInput');
    const cmdResults = document.getElementById('cmdPaletteResults');
    const openCmdButtons = document.querySelectorAll('[data-open-cmd]');

    const commands = [
      { title: 'Jump: Hero & Architectural Overview', cat: 'Navigate', icon: 'fa-compass', run: () => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }) },
      { title: 'Jump: 01. About & 4-Phase Protocol', cat: 'Navigate', icon: 'fa-diagram-project', run: () => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' }) },
      { title: 'Jump: 02. Command Roster & Team', cat: 'Navigate', icon: 'fa-users-gear', run: () => document.getElementById('leadership')?.scrollIntoView({ behavior: 'smooth' }) },
      { title: 'Jump: 03. Services & Khulna Venues', cat: 'Navigate', icon: 'fa-cubes', run: () => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }) },
      { title: 'Jump: 04. Blueprint Lab Configurator', cat: 'Navigate', icon: 'fa-sliders', run: () => document.getElementById('blueprint-lab')?.scrollIntoView({ behavior: 'smooth' }) },
      { title: 'Jump: 05. Executed Portfolio Archive', cat: 'Navigate', icon: 'fa-layer-group', run: () => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' }) },
      { title: 'Jump: 06. Khulna HQ & Direct Brief', cat: 'Navigate', icon: 'fa-satellite-dish', run: () => document.getElementById('comms')?.scrollIntoView({ behavior: 'smooth' }) },
      { title: 'Lab: Open CAD Stage Floorplan Designer', cat: 'Studio', icon: 'fa-vector-square', run: () => { App.emit('lab:switchTab', 'cad'); document.getElementById('blueprint-lab')?.scrollIntoView({ behavior: 'smooth' }); } },
      { title: 'Lab: Open DMX Lighting & Soundcheck Rig', cat: 'Studio', icon: 'fa-bolt', run: () => { App.emit('lab:switchTab', 'dmx'); document.getElementById('blueprint-lab')?.scrollIntoView({ behavior: 'smooth' }); } },
      { title: 'Lab: Open VIP Pass, Raffle & Run-of-Show', cat: 'Studio', icon: 'fa-id-badge', run: () => { App.emit('lab:switchTab', 'tools'); document.getElementById('blueprint-lab')?.scrollIntoView({ behavior: 'smooth' }); } },
      { title: 'Team: Open Photo Calibration Studio', cat: 'Roster', icon: 'fa-camera', run: () => App.openModal('photoCalibModal') },
      { title: 'Wizard: Launch 3-Step Event Diagnostic', cat: 'Planner', icon: 'fa-wand-magic-sparkles', run: () => App.openModal('diagnosticModal') },
      { title: 'Comms: Call Hotline 01 (+880 1788-706868)', cat: 'Hotline', icon: 'fa-phone', run: () => { window.location.href = 'tel:+8801788706868'; } },
      { title: 'Comms: Call Hotline 02 (+880 1703-700799)', cat: 'Hotline', icon: 'fa-phone', run: () => { window.location.href = 'tel:+8801703700799'; } },
      { title: 'Comms: Copy Both Khulna Hotlines', cat: 'Hotline', icon: 'fa-copy', run: () => App.copyText('+8801788706868 | +8801703700799', 'Both Khulna HQ hotlines copied!') },
      { title: 'Theme: Blueprint Cyan (Default)', cat: 'Appearance', icon: 'fa-palette', run: () => applyTheme('cyan', true) },
      { title: 'Theme: Imperial Gala Gold', cat: 'Appearance', icon: 'fa-crown', run: () => applyTheme('gold', true) },
      { title: 'Theme: Live Arena Crimson', cat: 'Appearance', icon: 'fa-fire', run: () => applyTheme('crimson', true) },
      { title: 'Theme: Architect Daylight Sheet', cat: 'Appearance', icon: 'fa-sun', run: () => applyTheme('light', true) },
      { title: 'System: Explore All 105+ JS Features', cat: 'Diagnostics', icon: 'fa-terminal', run: () => App.openModal('featuresModal') },
      { title: 'System: Print Architectural Spec Sheet', cat: 'Export', icon: 'fa-print', run: () => window.print() }
    ];

    function renderCommands(query = '') {
      if (!cmdResults) return;
      const q = query.trim().toLowerCase();
      const filtered = commands.filter((c) => !q || c.title.toLowerCase().includes(q) || c.cat.toLowerCase().includes(q));
      cmdResults.innerHTML = '';
      if (!filtered.length) {
        cmdResults.innerHTML = `<div class="p-6 text-center text-xs font-mono-cad bp-muted-text">No matching commands for "${App.escapeHtml(query)}"</div>`;
        return;
      }
      filtered.forEach((cmd, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `w-full text-left px-4 py-3 rounded-lg flex items-center justify-between gap-3 transition-colors ${idx === 0 ? 'bg-white/10' : 'hover:bg-white/5'}`;
        btn.innerHTML = `
          <div class="flex items-center gap-3 min-w-0">
            <i class="fa-solid ${cmd.icon} bp-accent-text w-4 text-center"></i>
            <span class="text-sm font-medium truncate">${App.escapeHtml(cmd.title)}</span>
          </div>
          <span class="font-mono-cad text-[10px] px-2 py-0.5 rounded border border-current/20 bp-muted-text shrink-0">${cmd.cat}</span>
        `;
        btn.addEventListener('click', () => {
          App.closeModal('cmdPaletteModal');
          cmd.run();
        });
        cmdResults.appendChild(btn);
      });
    }

    openCmdButtons.forEach((b) => b.addEventListener('click', () => {
      App.openModal('cmdPaletteModal');
      if (cmdInput) { cmdInput.value = ''; renderCommands(''); }
    }));
    if (cmdInput) {
      cmdInput.addEventListener('input', () => renderCommands(cmdInput.value));
      cmdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const first = cmdResults?.querySelector('button');
          if (first) { e.preventDefault(); first.click(); }
        }
      });
    }
    App.registerFeature(5, 'Shell & UX', 'Global Command Palette (Ctrl+K)', 'Instant fuzzy search across sections, tools, hotlines, and themes.');

    // 17. Keyboard Shortcuts Overlay (? key) & Global Hotkeys
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || e.target?.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        App.openModal('cmdPaletteModal');
        if (cmdInput) { cmdInput.value = ''; renderCommands(''); }
        return;
      }
      if (typing) return;
      if (e.key === '?') {
        e.preventDefault();
        App.openModal('shortcutsModal');
      } else if (e.key.toLowerCase() === 't') {
        const order = ['cyan', 'gold', 'crimson', 'light'];
        applyTheme(order[(order.indexOf(App.state.theme) + 1) % order.length], true);
      } else if (e.key.toLowerCase() === 'm') {
        soundBtn?.click();
      } else if (/^[1-6]$/.test(e.key)) {
        const map = ['architecture', 'leadership', 'services', 'blueprint-lab', 'portfolio', 'comms'];
        const sec = document.getElementById(map[Number(e.key) - 1]);
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
      }
    });
    document.querySelectorAll('[data-open-shortcuts]').forEach((b) => b.addEventListener('click', () => App.openModal('shortcutsModal')));
    App.registerFeature(17, 'Accessibility', 'Keyboard Shortcuts & Cheat Sheet (?)', 'Press Ctrl+K for Command Palette, 1-6 for sections, T for theme, ? for help.');

    // 18. Online / Offline & Draft Auto-Save Status Indicator
    const netEl = document.getElementById('networkStatusBadge');
    const updateNet = () => {
      if (!netEl) return;
      const online = navigator.onLine;
      netEl.innerHTML = online
        ? '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>ONLINE // KHULNA HQ</span>'
        : '<span class="w-2 h-2 rounded-full bg-amber-400"></span><span>OFFLINE DRAFT MODE</span>';
    };
    window.addEventListener('online', updateNet);
    window.addEventListener('offline', updateNet);
    updateNet();

    const saveStatusEl = document.getElementById('autoSaveBadge');
    App.on('state:saved', () => {
      if (!saveStatusEl) return;
      saveStatusEl.textContent = 'SAVED ✓';
      saveStatusEl.classList.add('bp-accent-text');
      setTimeout(() => {
        saveStatusEl.textContent = 'AUTO-SYNC';
        saveStatusEl.classList.remove('bp-accent-text');
      }, 1200);
    });
    App.registerFeature(18, 'Shell & UX', 'Offline & Auto-Save Telemetry', 'Monitors connectivity and local state persistence.');

    // 20. Print Spec Button
    document.querySelectorAll('[data-print-blueprint]').forEach((b) => {
      b.addEventListener('click', () => {
        App.playTone('confirm');
        window.print();
      });
    });
    App.registerFeature(20, 'Export', 'Print-Optimized Architectural Sheet', 'Clean white-paper CAD print layout triggered via Ctrl+P or button.');

    // 100. Interactive Feature Diagnostics Explorer Modal
    const renderFeaturesModal = (cat = 'all') => {
      const list = document.getElementById('featuresCatalogList');
      const countEl = document.getElementById('featuresTotalCount');
      if (countEl) countEl.textContent = String(App.features.length);
      if (!list) return;
      const items = App.features.slice().sort((a, b) => a.num - b.num)
        .filter((f) => cat === 'all' || f.category === cat);
      list.innerHTML = items.map((f) => `
        <div class="p-3 rounded-lg border border-current/15 bg-black/20 flex items-start gap-3">
          <span class="font-mono-cad text-[11px] font-bold px-2 py-0.5 rounded bg-white/10 bp-accent-text shrink-0">#${String(f.num).padStart(3, '0')}</span>
          <div class="min-w-0">
            <div class="text-xs font-bold">${App.escapeHtml(f.name)}</div>
            <div class="text-[11px] bp-muted-text mt-0.5">${App.escapeHtml(f.description)}</div>
          </div>
        </div>
      `).join('');
    };
    document.querySelectorAll('[data-open-features]').forEach((b) => {
      b.addEventListener('click', () => {
        renderFeaturesModal('all');
        App.openModal('featuresModal');
      });
    });
    document.getElementById('featuresCatFilter')?.addEventListener('change', (e) => {
      renderFeaturesModal(e.target.value);
    });
    App.registerFeature(100, 'Diagnostics', 'Live 105+ JS Feature Telemetry Explorer', 'Inspect every active interactive JavaScript module in real time.');

    // Modal close bindings
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => App.closeModal(btn.getAttribute('data-close-modal')));
    });
    document.querySelectorAll('.bp-modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) App.closeModal(backdrop.id);
      });
    });

    // 106. Accessibility Font Scale Switcher (95% / 100% / 110%)
    const fontScaleBtn = document.getElementById('fontScaleToggleBtn');
    const applyFontScale = (scale, announce = false) => {
      const sizes = ['94%', '100%', '110%'];
      const valid = sizes.includes(scale) ? scale : '100%';
      App.state.fontScale = valid;
      document.documentElement.style.fontSize = valid;
      App.saveState();
      if (fontScaleBtn) fontScaleBtn.textContent = valid === '100%' ? 'A' : (valid === '110%' ? 'A+' : 'A-');
      if (announce) App.toast(`UI Typography Scale set to ${valid}`, 'info', 'READABILITY');
    };
    applyFontScale(App.state.fontScale || '100%', false);
    if (fontScaleBtn) {
      fontScaleBtn.addEventListener('click', () => {
        const order = ['100%', '110%', '94%'];
        const next = order[(order.indexOf(App.state.fontScale || '100%') + 1) % order.length];
        App.playTone('click');
        applyFontScale(next, true);
      });
    }
    App.registerFeature(106, 'Accessibility', 'Live Typography Scale Control (A-/A/A+)', 'Adjust global root font scaling across 94%, 100%, and 110%.');
    App.registerFeature(107, 'Shell & UX', 'One-Thumb Mobile Quick-Action Dock', 'Sticky bottom mobile navigation for Call, WhatsApp, Lab, and Menu.');

    // Global feature registration entries for shell utilities
    App.registerFeature(16, 'Shell & UX', 'Stackable Toast Notification Queue', 'Non-blocking corner notifications with dismiss controls.');
    App.registerFeature(101, 'Shell & UX', 'Copy-to-Clipboard Visual Feedback', 'Instant clipboard writes with toast and button confirmation.');
    App.registerFeature(103, 'Accessibility', 'Focus Management & ESC Modal Locking', 'Accessible modal dialog trapping and Escape closure.');
  }

  document.addEventListener('DOMContentLoaded', initHudShell);
})();
