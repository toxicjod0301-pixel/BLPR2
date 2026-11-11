/* ==========================================================================
   05-BLUEPRINT-LAB // EVENT CONFIGURATOR, POWER/CREW SPECS & SHARE URL
   ========================================================================== */

(function () {
  'use strict';
  const App = window.BlueprintApp;
  if (!App) return;

  function initBlueprintLab() {
    // Lab Studio Tab Switcher
    const labTabBtns = document.querySelectorAll('[data-lab-tab]');
    const labPanels = document.querySelectorAll('[data-lab-panel]');
    function switchLabTab(tabName) {
      labTabBtns.forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-lab-tab') === tabName));
      labPanels.forEach((p) => p.classList.toggle('hidden', p.getAttribute('data-lab-panel') !== tabName));
      App.emit('lab:tabChanged', tabName);
    }
    labTabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        switchLabTab(btn.getAttribute('data-lab-tab'));
        App.playTone('click');
      });
    });
    App.on('lab:switchTab', switchLabTab);

    // Elements
    const typeWrap = document.getElementById('labEventTypesWrap');
    const slider = document.getElementById('capacitySlider');
    const numInput = document.getElementById('capacityNumInput');
    const readout = document.getElementById('capacityReadout');
    const envBtns = document.querySelectorAll('[data-env-btn]');
    const durBtns = document.querySelectorAll('[data-dur-btn]');
    const subsWrap = document.getElementById('labSubsystemsGrid');
    const savedListWrap = document.getElementById('savedBlueprintsList');

    // Render Event Type Cards
    function renderEventTypes() {
      if (!typeWrap) return;
      const entries = Object.entries(App.data.eventTypes);
      typeWrap.innerHTML = entries.map(([key, info]) => {
        const active = App.state.config.eventType === key;
        return `
          <button type="button" data-select-etype="${key}" class="text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${active ? 'bp-tab-btn is-active font-bold' : 'border-current/20 bg-black/25 hover:border-current/50'}">
            <div>
              <div class="font-tech text-xs">${App.escapeHtml(info.name)}</div>
              <div class="font-mono-cad text-[10px] opacity-75 mt-0.5">BASE ${info.baseKw}kW • ${info.baseCrew} CREW</div>
            </div>
            <i class="fa-${active ? 'solid fa-circle-check' : 'regular fa-circle'} text-sm"></i>
          </button>
        `;
      }).join('');

      typeWrap.querySelectorAll('[data-select-etype]').forEach((b) => {
        b.addEventListener('click', () => {
          App.state.config.eventType = b.getAttribute('data-select-etype');
          App.saveState();
          App.playTone('click');
          renderEventTypes();
          recalculate();
        });
      });
    }

    // Render 10 Production Subsystems
    function renderSubsystems() {
      if (!subsWrap) return;
      subsWrap.innerHTML = App.data.subsystems.map((sub) => {
        const checked = App.state.config.subsystems.includes(sub.id);
        return `
          <label class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? 'border-cyan-400/70 bg-cyan-500/10' : 'border-current/20 bg-black/20 hover:border-current/45'}">
            <input type="checkbox" data-sub-id="${sub.id}" ${checked ? 'checked' : ''} class="mt-0.5 accent-cyan-400 w-4 h-4 shrink-0">
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-semibold truncate">${App.escapeHtml(sub.label)}</span>
                <span class="font-mono-cad text-[9px] px-1.5 py-0.5 rounded bg-black/30 bp-accent-text shrink-0">${sub.tag}</span>
              </div>
              <div class="font-mono-cad text-[10px] bp-muted-text mt-0.5">+${sub.kw} kW • +${sub.crew} Crew</div>
            </div>
          </label>
        `;
      }).join('');

      subsWrap.querySelectorAll('[data-sub-id]').forEach((chk) => {
        chk.addEventListener('change', () => {
          const id = chk.getAttribute('data-sub-id');
          const set = new Set(App.state.config.subsystems);
          if (chk.checked) set.add(id);
          else set.delete(id);
          App.state.config.subsystems = Array.from(set);
          App.saveState();
          App.playTone('click');
          renderSubsystems();
          recalculate();
        });
      });
    }

    // Core Calculation & Telemetry Update
    function computeSpecs() {
      const cfg = App.state.config;
      const eType = App.data.eventTypes[cfg.eventType] || App.data.eventTypes.corporate;
      const guests = Math.max(50, Math.min(10000, Number(cfg.guests) || 600));
      const envMult = cfg.environment === 'outdoor' ? 1.24 : (cfg.environment === 'semi' ? 1.12 : 1.0);
      const durMult = Number(cfg.durationHours || 6) >= 12 ? 1.45 : (Number(cfg.durationHours || 6) >= 8 ? 1.18 : 1.0);

      let totalKw = eType.baseKw + Math.round(guests * 0.02);
      let totalCrew = eType.baseCrew + Math.round(guests / 170);
      const activeSubObjs = [];

      App.data.subsystems.forEach((sub) => {
        if (cfg.subsystems.includes(sub.id)) {
          totalKw += sub.kw;
          totalCrew += sub.crew;
          activeSubObjs.push(sub);
        }
      });

      totalKw = Math.round(totalKw * envMult * (durMult > 1 ? 1.08 : 1.0));
      const totalKva = Math.round(totalKw * 1.25);

      let stageSpan = '32 FT x 16 FT';
      let tier = 'TIER // EXECUTIVE';
      let svgWidth = 128;
      if (guests >= 900 && guests < 2400) {
        stageSpan = '48 FT x 24 FT';
        tier = 'TIER // ARENA-PRO';
        svgWidth = 166;
      } else if (guests >= 2400) {
        stageSpan = '64 FT x 32 FT (MEGA RIG)';
        tier = 'TIER // FESTIVAL-PRIME';
        svgWidth = 204;
      }

      // Crew Breakdown
      const crewRiggers = Math.max(3, Math.round(totalCrew * 0.28));
      const crewAv = Math.max(3, Math.round(totalCrew * 0.26));
      const crewSecurity = Math.max(4, Math.round(totalCrew * 0.28));
      const crewProtocol = Math.max(2, totalCrew - crewRiggers - crewAv - crewSecurity);

      return {
        eType, guests, env: cfg.environment, durationHours: cfg.durationHours,
        totalKw, totalKva, totalCrew, activeSubObjs,
        stageSpan, tier, svgWidth,
        crewBreakdown: { riggers: crewRiggers, av: crewAv, security: crewSecurity, protocol: crewProtocol }
      };
    }

    function recalculate() {
      const s = computeSpecs();
      if (slider) slider.value = String(s.guests);
      if (numInput) numInput.value = String(s.guests);
      if (readout) readout.textContent = `${s.guests.toLocaleString()} GUESTS`;

      envBtns.forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-env-btn') === s.env));
      durBtns.forEach((b) => b.classList.toggle('is-active', Number(b.getAttribute('data-dur-btn')) === Number(s.durationHours)));

      const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
      setText('cadTierLabel', s.tier);
      setText('cadStageLabel', `STAGE_SPAN // ${s.stageSpan}`);
      setText('specType', s.eType.name);
      setText('specPower', `${s.totalKw} kW (${s.totalKva} kVA 3-Phase)`);
      setText('specCrew', `${s.totalCrew} Engineers & Crew`);
      setText('specEnvSummary', `${s.env.toUpperCase()} • ${s.durationHours} HRS`);

      const svgStage = document.getElementById('svgStageBox');
      if (svgStage) {
        svgStage.setAttribute('width', String(s.svgWidth));
        svgStage.setAttribute('x', String(140 - s.svgWidth / 2));
      }

      // Active Module Pills
      const modsList = document.getElementById('specModulesList');
      if (modsList) {
        modsList.innerHTML = s.activeSubObjs.length
          ? s.activeSubObjs.map((m) => `<span class="px-2 py-0.5 rounded bg-white/5 border border-current/25 font-mono-cad text-[10px] bp-accent-text">${App.escapeHtml(m.label)}</span>`).join('')
          : '<span class="text-xs bp-muted-text">Base Production Management Only</span>';
      }

      // Technical Deployment Matrix Summary (Zero Budgeting)
      const techMatrix = document.getElementById('techDeploymentMatrix');
      if (techMatrix) {
        const venue = App.data.venues.find((v) => v.id === App.state.config.venueId)?.name || 'Khulna / Custom';
        techMatrix.innerHTML = `
          <div class="flex justify-between"><span>Target Venue</span><span class="font-mono-cad">${App.escapeHtml(venue)}</span></div>
          <div class="flex justify-between"><span>Stage Truss Footprint</span><span class="font-mono-cad">${s.stageSpan}</span></div>
          <div class="flex justify-between"><span>3-Phase Generator Target</span><span class="font-mono-cad">${s.totalKva} kVA Silent</span></div>
          <div class="flex justify-between"><span>Active Subsystems</span><span class="font-mono-cad">${s.activeSubObjs.length} Modules Engaged</span></div>
        `;
      }

      // Crew Stacked Allocation Bar
      const crewBar = document.getElementById('crewAllocationBar');
      const crewLegend = document.getElementById('crewAllocationLegend');
      if (crewBar && crewLegend) {
        const tot = Math.max(1, s.totalCrew);
        const pR = ((s.crewBreakdown.riggers / tot) * 100).toFixed(1);
        const pA = ((s.crewBreakdown.av / tot) * 100).toFixed(1);
        const pS = ((s.crewBreakdown.security / tot) * 100).toFixed(1);
        const pP = Math.max(0, 100 - parseFloat(pR) - parseFloat(pA) - parseFloat(pS)).toFixed(1);
        crewBar.innerHTML = `
          <div style="width:${pR}%" class="bg-cyan-400 h-full" title="Riggers & Stage: ${s.crewBreakdown.riggers}"></div>
          <div style="width:${pA}%" class="bg-sky-400 h-full" title="AV & DMX: ${s.crewBreakdown.av}"></div>
          <div style="width:${pS}%" class="bg-amber-400 h-full" title="Security & Gates: ${s.crewBreakdown.security}"></div>
          <div style="width:${pP}%" class="bg-emerald-400 h-full" title="Protocol & VIP: ${s.crewBreakdown.protocol}"></div>
        `;
        crewLegend.innerHTML = `
          <span><i class="fa-solid fa-square text-cyan-400 mr-1"></i>Stage (${s.crewBreakdown.riggers})</span>
          <span><i class="fa-solid fa-square text-sky-400 mr-1"></i>AV/DMX (${s.crewBreakdown.av})</span>
          <span><i class="fa-solid fa-square text-amber-400 mr-1"></i>Security (${s.crewBreakdown.security})</span>
          <span><i class="fa-solid fa-square text-emerald-400 mr-1"></i>Protocol (${s.crewBreakdown.protocol})</span>
        `;
      }

      App.emit('lab:updated', s);
    }

    // Event Listeners
    const updateGuests = (val) => {
      const clamped = Math.max(100, Math.min(5000, Number(val) || 500));
      App.state.config.guests = clamped;
      App.saveState();
      recalculate();
    };
    slider?.addEventListener('input', (e) => updateGuests(e.target.value));
    numInput?.addEventListener('change', (e) => updateGuests(e.target.value));
    document.querySelectorAll('[data-guest-preset]').forEach((b) => {
      b.addEventListener('click', () => {
        updateGuests(b.getAttribute('data-guest-preset'));
        App.playTone('click');
      });
    });
    document.getElementById('guestMinusBtn')?.addEventListener('click', () => updateGuests((App.state.config.guests || 500) - 100));
    document.getElementById('guestPlusBtn')?.addEventListener('click', () => updateGuests((App.state.config.guests || 500) + 100));

    envBtns.forEach((b) => b.addEventListener('click', () => {
      App.state.config.environment = b.getAttribute('data-env-btn');
      App.saveState();
      App.playTone('click');
      recalculate();
    }));
    durBtns.forEach((b) => b.addEventListener('click', () => {
      App.state.config.durationHours = Number(b.getAttribute('data-dur-btn'));
      App.saveState();
      App.playTone('click');
      recalculate();
    }));

    // 62. Save / Load Named Blueprints
    function renderSavedBlueprints() {
      if (!savedListWrap) return;
      const list = App.state.savedBlueprints || [];
      if (!list.length) {
        savedListWrap.innerHTML = '<div class="text-[11px] font-mono-cad bp-muted-text">No saved snapshots yet. Click "Save Snapshot" to store this build.</div>';
        return;
      }
      savedListWrap.innerHTML = list.map((bp, i) => `
        <div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/25 border border-current/15 text-xs">
          <button type="button" data-load-snap="${i}" class="text-left flex-1 truncate hover:bp-accent-text font-medium">
            <i class="fa-solid fa-folder-open mr-1.5 bp-accent-text"></i>${App.escapeHtml(bp.name)} <span class="font-mono-cad text-[10px] bp-muted-text">(${bp.config.guests} pax)</span>
          </button>
          <button type="button" data-del-snap="${i}" aria-label="Delete snapshot" class="text-rose-400 hover:text-rose-300 px-1.5">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `).join('');
      savedListWrap.querySelectorAll('[data-load-snap]').forEach((b) => {
        b.addEventListener('click', () => {
          const snap = App.state.savedBlueprints[Number(b.getAttribute('data-load-snap'))];
          if (!snap) return;
          App.state.config = JSON.parse(JSON.stringify(snap.config));
          App.saveState();
          renderEventTypes();
          renderSubsystems();
          recalculate();
          App.playTone('confirm');
          App.toast(`Loaded snapshot "${snap.name}"`, 'success', 'SNAPSHOT LOADED');
        });
      });
      savedListWrap.querySelectorAll('[data-del-snap]').forEach((b) => {
        b.addEventListener('click', () => {
          const idx = Number(b.getAttribute('data-del-snap'));
          App.state.savedBlueprints.splice(idx, 1);
          App.saveState();
          renderSavedBlueprints();
        });
      });
    }

    document.getElementById('saveSnapshotBtn')?.addEventListener('click', () => {
      const nameInput = document.getElementById('snapshotNameInput');
      const s = computeSpecs();
      const name = (nameInput?.value.trim()) || `${s.eType.name.split('/')[0].trim()} (${s.guests}px)`;
      App.state.savedBlueprints.unshift({ name, created: new Date().toISOString(), config: JSON.parse(JSON.stringify(App.state.config)) });
      App.state.savedBlueprints = App.state.savedBlueprints.slice(0, 8);
      if (nameInput) nameInput.value = '';
      App.saveState();
      renderSavedBlueprints();
      App.playTone('confirm');
      App.toast(`Saved blueprint snapshot "${name}"`, 'success', 'SNAPSHOT SAVED');
    });

    // 63. Shareable URL Hash Encode / Decode
    function loadFromUrlHash() {
      try {
        if (!window.location.hash.startsWith('#bp=')) return;
        const encoded = window.location.hash.slice(4);
        const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
        if (decoded && decoded.guests) {
          Object.assign(App.state.config, decoded);
          App.saveState();
          App.toast('Loaded shared Event Blueprint from URL!', 'success', 'SHARED LINK');
        }
      } catch (_) {}
    }
    loadFromUrlHash();

    document.getElementById('copyShareUrlBtn')?.addEventListener('click', () => {
      const token = btoa(unescape(encodeURIComponent(JSON.stringify(App.state.config))));
      const url = `${window.location.origin}${window.location.pathname}#bp=${token}`;
      window.history.replaceState(null, '', `#bp=${token}`);
      App.copyText(url, 'Shareable Blueprint URL copied to clipboard!');
    });

    // 64. Reset & Randomize Demo
    document.getElementById('resetLabBtn')?.addEventListener('click', () => {
      App.state.config = { eventType: 'corporate', guests: 600, environment: 'indoor', durationHours: 6, venueId: 'khulna-club', subsystems: ['stage-truss', 'line-array', 'led-dmx', 'passes-security'] };
      App.saveState();
      renderEventTypes();
      renderSubsystems();
      recalculate();
      App.toast('Blueprint Lab reset to executive default', 'info');
    });

    document.getElementById('randomizeLabBtn')?.addEventListener('click', () => {
      const types = Object.keys(App.data.eventTypes);
      const envs = ['indoor', 'semi', 'outdoor'];
      App.state.config.eventType = types[Math.floor(Math.random() * types.length)];
      App.state.config.environment = envs[Math.floor(Math.random() * envs.length)];
      App.state.config.guests = (Math.floor(Math.random() * 40) + 2) * 100;
      App.state.config.subsystems = App.data.subsystems.filter(() => Math.random() > 0.35).map((x) => x.id);
      App.saveState();
      renderEventTypes();
      renderSubsystems();
      recalculate();
      App.playTone('ping');
      App.toast('Generated randomized event scenario!', 'info', 'DEMO GENERATOR');
    });

    // 79 & 80. Formatted Spec Sheet Summary, Download Proposal & WhatsApp Dispatch
    function getSpecSummaryText() {
      const s = computeSpecs();
      const venue = App.data.venues.find((v) => v.id === App.state.config.venueId)?.name || 'Khulna / Custom';
      return [
        'THE BLUEPRINT EVENT MANAGEMENT // KHULNA TECHNICAL PROPOSAL',
        '==============================================================',
        `Event Architecture : ${s.eType.name}`,
        `Target Venue       : ${venue} (${s.env.toUpperCase()})`,
        `Audience Scale     : ${s.guests.toLocaleString()} Guests`,
        `Production Duration: ${s.durationHours} Hours`,
        `Stage Rigging Tier : ${s.stageSpan} (${s.tier})`,
        `Power Requirement  : ${s.totalKw} kW / ${s.totalKva} kVA 3-Phase`,
        `Recommended Crew   : ${s.totalCrew} Specialists (Stage:${s.crewBreakdown.riggers}, AV:${s.crewBreakdown.av}, Sec:${s.crewBreakdown.security}, VIP:${s.crewBreakdown.protocol})`,
        `Active Subsystems  : ${s.activeSubObjs.map((x) => x.label).join(', ') || 'Standard Ops'}`,
        '--------------------------------------------------------------',
        'Khulna HQ Hotlines : +880 1788-706868 | +880 1703-700799'
      ].join('\n');
    }
    App.getBlueprintSpecText = getSpecSummaryText;

    document.getElementById('copySpecBtn')?.addEventListener('click', () => {
      App.copyText(getSpecSummaryText(), 'Technical Blueprint spec copied!');
    });
    document.getElementById('downloadProposalBtn')?.addEventListener('click', () => {
      App.downloadFile('The-Blueprint-Event-Spec-Khulna.txt', getSpecSummaryText());
      App.toast('Downloaded formatted proposal (.txt)', 'success', 'PROPOSAL EXPORT');
    });
    document.getElementById('transmitWhatsappBtn1')?.addEventListener('click', () => {
      const msg = encodeURIComponent(`Hello The Blueprint Event Management (Khulna),\n\nI engineered this specification on your Blueprint Lab:\n\n${getSpecSummaryText()}`);
      window.open(`https://wa.me/8801788706868?text=${msg}`, '_blank', 'noopener');
    });
    document.getElementById('transmitWhatsappBtn2')?.addEventListener('click', () => {
      const msg = encodeURIComponent(`Hello The Blueprint Event Management (Khulna),\n\nI engineered this specification on your Blueprint Lab:\n\n${getSpecSummaryText()}`);
      window.open(`https://wa.me/8801703700799?text=${msg}`, '_blank', 'noopener');
    });
    document.getElementById('syncSpecToBriefBtn')?.addEventListener('click', () => {
      const msgBox = document.getElementById('clientMessage');
      if (msgBox) {
        msgBox.value = getSpecSummaryText();
        msgBox.dispatchEvent(new Event('input'));
      }
      document.getElementById('comms')?.scrollIntoView({ behavior: 'smooth' });
      App.toast('Blueprint specs attached to Project Brief form!', 'success', 'SYNCED TO BRIEF');
    });

    App.on('lab:syncFromState', () => { renderEventTypes(); renderSubsystems(); recalculate(); });

    renderEventTypes();
    renderSubsystems();
    renderSavedBlueprints();
    recalculate();

    // Register Lab Features 53-64 & 79-80
    App.registerFeature(53, 'Blueprint Lab', '5 Event Architecture Presets', 'Corporate, Concert, Brand Expo, Bespoke Luxury, and University Fest.');
    App.registerFeature(54, 'Blueprint Lab', 'Precision Guest Capacity Controls', 'Synced range slider, numeric input, +/- steppers, and quick presets.');
    App.registerFeature(55, 'Blueprint Lab', 'Venue Environment Multiplier', 'Indoor, Semi-Covered, and Open-Air load & truss scaling.');
    App.registerFeature(56, 'Blueprint Lab', 'Duration & Shift Scaler', 'Adjusts crew shift factors for 4hr, 6hr, 8hr, and 12hr productions.');
    App.registerFeature(57, 'Blueprint Lab', '10 Toggleable Production Subsystems', 'Modular AV, Truss, LED, Pyro, Passes, Multi-Cam, Raffle & Dual-Gen stack.');
    App.registerFeature(58, 'Blueprint Lab', 'Environment & Duration Telemetry Summary', 'Live venue mode and production shift duration indicator.');
    App.registerFeature(59, 'Blueprint Lab', 'Technical Deployment Spec Matrix', 'Real-time truss span, venue match, and subsystem readout.');
    App.registerFeature(60, 'Blueprint Lab', '3-Phase Power & kVA Calculator', 'Automatic kW-to-kVA generator sizing.');
    App.registerFeature(61, 'Blueprint Lab', 'Dynamic Crew Allocation Stacked Bar', 'Visual split across Riggers, AV/DMX, Security, and Protocol.');
    App.registerFeature(62, 'Blueprint Lab', 'Save & Load Named Blueprint Snapshots', 'Persist multiple event configurations locally in browser storage.');
    App.registerFeature(63, 'Blueprint Lab', 'Shareable URL Hash Encoding (#bp=...)', 'Encode complete configurator state into a shareable permalink.');
    App.registerFeature(64, 'Blueprint Lab', 'Reset & Scenario Demo Randomizer', 'Generate test event scenarios or cleanly reset parameters.');
    App.registerFeature(79, 'Blueprint Lab', 'Download Formatted Technical Proposal', 'Export full technical summary as a clean .txt proposal.');
    App.registerFeature(80, 'Blueprint Lab', 'Dual-Hotline WhatsApp & Brief Sync', 'Dispatch specs to +8801788706868, +8801703700799, or Brief form.');
  }

  document.addEventListener('DOMContentLoaded', initBlueprintLab);
})();
