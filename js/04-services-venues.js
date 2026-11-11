/* ==========================================================================
   04-SERVICES-VENUES // CAPABILITIES MATRIX, WIZARD, KHULNA VENUES & COMPARE
   ========================================================================== */

(function () {
  'use strict';
  const App = window.BlueprintApp;
  if (!App) return;

  function initServicesAndVenues() {
    const servicesGrid = document.getElementById('servicesMatrixGrid');
    const srvSearchInput = document.getElementById('serviceSearchInput');
    const srvFilterBtns = document.querySelectorAll('[data-srv-filter]');
    let srvFilter = 'all';

    function renderServices() {
      if (!servicesGrid) return;
      const q = (srvSearchInput?.value || '').trim().toLowerCase();
      const items = App.data.services.filter((s) => {
        const catOk = srvFilter === 'all' || s.category === srvFilter;
        const qOk = !q || s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q) || s.inventory.join(' ').toLowerCase().includes(q);
        return catOk && qOk;
      });

      if (!items.length) {
        servicesGrid.innerHTML = '<div class="col-span-full bp-card p-8 rounded-xl text-center font-mono-cad text-xs bp-muted-text">No capability modules matched your search.</div>';
        return;
      }

      servicesGrid.innerHTML = items.map((s) => {
        const activeCount = s.linkedSubsystems.filter((id) => App.state.config.subsystems.includes(id)).length;
        const fullyEngaged = activeCount === s.linkedSubsystems.length;
        return `
          <article class="bp-card bp-ticks bp-spotlight bp-card-tilt rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="px-2.5 py-1 rounded bg-white/5 border border-current/25 font-mono-cad text-[10px] bp-accent-text">${s.code}</span>
                <div class="w-10 h-10 rounded-lg bg-white/5 border border-current/20 flex items-center justify-center bp-accent-text text-lg">
                  <i class="fa-solid ${s.icon}"></i>
                </div>
              </div>
              <h3 class="font-tech font-bold text-lg mb-2">${App.escapeHtml(s.title)}</h3>
              <p class="text-xs sm:text-sm bp-soft-text leading-relaxed mb-4">${App.escapeHtml(s.summary)}</p>
            </div>
            <div class="pt-3 border-t border-current/15 space-y-2.5">
              <div class="flex justify-between items-center font-mono-cad text-[10px] bp-muted-text">
                <span>PROTOCOL: <strong class="bp-accent2-text">${s.protocol}</strong></span>
                <span>LEAD: ${s.leadTime}</span>
              </div>
              <div class="flex gap-2">
                <button type="button" data-add-srv-lab="${s.id}" class="flex-1 py-2 px-3 rounded-lg font-mono-cad text-[11px] font-bold transition-all ${fullyEngaged ? 'bp-btn-primary' : 'bp-btn-outline'}">
                  <i class="fa-solid ${fullyEngaged ? 'fa-check' : 'fa-plus'} mr-1"></i>${fullyEngaged ? 'ENGAGED IN LAB' : 'ADD TO BLUEPRINT'}
                </button>
                <button type="button" data-open-srv="${s.id}" class="py-2 px-3 rounded-lg border border-current/25 hover:border-current text-xs font-mono-cad">
                  SPECS
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('');

      servicesGrid.querySelectorAll('[data-add-srv-lab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const s = App.data.services.find((x) => x.id === btn.getAttribute('data-add-srv-lab'));
          if (!s) return;
          const merged = new Set([...App.state.config.subsystems, ...s.linkedSubsystems]);
          App.state.config.subsystems = Array.from(merged);
          App.saveState();
          App.emit('lab:syncFromState');
          renderServices();
          App.playTone('confirm');
          App.toast(`Synced "${s.title}" modules into Blueprint Lab!`, 'success', 'BLUEPRINT SYNC');
        });
      });

      servicesGrid.querySelectorAll('[data-open-srv]').forEach((btn) => {
        btn.addEventListener('click', () => openServiceModal(btn.getAttribute('data-open-srv')));
      });
    }

    function openServiceModal(id) {
      const s = App.data.services.find((x) => x.id === id);
      const body = document.getElementById('serviceModalBody');
      if (!s || !body) return;
      body.innerHTML = `
        <div class="space-y-5">
          <div class="flex items-start justify-between gap-4 border-b border-current/15 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-white/10 border border-current/30 flex items-center justify-center bp-accent-text text-xl">
                <i class="fa-solid ${s.icon}"></i>
              </div>
              <div>
                <div class="font-mono-cad text-xs bp-accent-text">${s.code} // PROTOCOL: ${s.protocol}</div>
                <h3 class="font-tech font-bold text-xl">${App.escapeHtml(s.title)}</h3>
              </div>
            </div>
            <span class="font-mono-cad text-xs px-2.5 py-1 rounded bg-white/10">${s.leadTime}</span>
          </div>
          <p class="text-sm bp-soft-text leading-relaxed">${App.escapeHtml(s.summary)}</p>
          <div>
            <div class="font-mono-cad text-xs bp-accent-text mb-2.5">INCLUDED TECHNICAL INVENTORY & DELIVERABLES</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${s.inventory.map((inv) => `<div class="p-3 rounded-lg bg-black/25 border border-current/15 text-xs flex items-center gap-2.5"><i class="fa-solid fa-circle-check bp-accent-text"></i><span>${App.escapeHtml(inv)}</span></div>`).join('')}
            </div>
          </div>
          <div class="flex flex-wrap gap-3 pt-2">
            <button type="button" id="srvModalSyncBtn" class="flex-1 py-3 px-4 rounded-lg bp-btn-primary font-tech text-xs font-bold">
              LOAD INTO BLUEPRINT LAB
            </button>
            <button type="button" id="srvModalBriefBtn" class="py-3 px-4 rounded-lg bp-btn-outline font-tech text-xs font-bold">
              BOOK CONSULTATION
            </button>
          </div>
        </div>
      `;
      document.getElementById('srvModalSyncBtn')?.addEventListener('click', () => {
        const merged = new Set([...App.state.config.subsystems, ...s.linkedSubsystems]);
        App.state.config.subsystems = Array.from(merged);
        App.saveState();
        App.emit('lab:syncFromState');
        renderServices();
        App.closeModal('serviceModal');
        document.getElementById('blueprint-lab')?.scrollIntoView({ behavior: 'smooth' });
        App.toast(`Loaded ${s.title} into Blueprint Lab`, 'success');
      });
      document.getElementById('srvModalBriefBtn')?.addEventListener('click', () => {
        const msgEl = document.getElementById('clientMessage');
        if (msgEl) {
          msgEl.value = `Interested in ${s.title} (${s.protocol}). ` + msgEl.value;
          msgEl.dispatchEvent(new Event('input'));
        }
        App.closeModal('serviceModal');
        document.getElementById('comms')?.scrollIntoView({ behavior: 'smooth' });
        App.toast(`Prepared brief inquiry for ${s.title}`, 'info');
      });
      App.openModal('serviceModal');
    }

    srvFilterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        srvFilter = btn.getAttribute('data-srv-filter');
        srvFilterBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        renderServices();
        App.playTone('click');
      });
    });
    srvSearchInput?.addEventListener('input', renderServices);
    App.on('lab:updated', renderServices);

    // 48, 49, 50. Khulna Venue Compatibility Matrix + SPL & Monsoon Advisor
    const venueBtnsWrap = document.getElementById('khulnaVenueList');
    const venueDetailCard = document.getElementById('khulnaVenueDetail');
    const monsoonToggle = document.getElementById('monsoonContingencyToggle');
    const monsoonBox = document.getElementById('monsoonContingencyBox');

    function renderVenues() {
      const selectedId = App.state.config.venueId || 'khulna-club';
      const v = App.data.venues.find((x) => x.id === selectedId) || App.data.venues[0];

      if (venueBtnsWrap) {
        venueBtnsWrap.innerHTML = App.data.venues.map((item) => {
          const active = item.id === v.id;
          return `
            <button type="button" data-venue-select="${item.id}" class="text-left p-3 rounded-lg border transition-all ${active ? 'bp-tab-btn is-active font-bold' : 'border-current/20 hover:border-current/50 bg-black/20'}">
              <div class="text-xs font-bold truncate">${App.escapeHtml(item.name)}</div>
              <div class="font-mono-cad text-[10px] opacity-80 mt-0.5">${item.area} • Up to ${item.maxPax.toLocaleString()}</div>
            </button>
          `;
        }).join('');

        venueBtnsWrap.querySelectorAll('[data-venue-select]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const picked = App.data.venues.find((x) => x.id === btn.getAttribute('data-venue-select'));
            if (!picked) return;
            App.state.config.venueId = picked.id;
            App.state.config.environment = picked.env;
            if (App.state.config.guests > picked.maxPax) {
              App.state.config.guests = picked.maxPax;
            }
            App.saveState();
            App.emit('lab:syncFromState');
            renderVenues();
            App.playTone('click');
            App.toast(`Calibrated Lab for ${picked.name} (${picked.env.toUpperCase()})`, 'info', 'VENUE MATRIX');
          });
        });
      }

      if (venueDetailCard) {
        const currentGuests = App.state.config.guests || 600;
        const capacityWarning = currentGuests > v.maxPax
          ? `<div class="mt-3 p-2.5 rounded-lg bg-rose-500/15 border border-rose-400/40 text-rose-300 text-xs font-mono-cad"><i class="fa-solid fa-triangle-exclamation mr-1.5"></i>Note: Configured guest count (${currentGuests}) exceeds recommended max (${v.maxPax}) for ${v.name}.</div>`
          : `<div class="mt-3 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-mono-cad"><i class="fa-solid fa-circle-check mr-1.5"></i>Capacity Optimal: ${currentGuests.toLocaleString()} / ${v.maxPax.toLocaleString()} Max Pax</div>`;

        venueDetailCard.innerHTML = `
          <div class="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-current/15">
            <div>
              <div class="font-mono-cad text-[10px] bp-accent-text">VENUE TELEMETRY // ${v.area.toUpperCase()}</div>
              <h4 class="font-tech font-bold text-lg">${App.escapeHtml(v.name)}</h4>
            </div>
            <span class="px-2.5 py-1 rounded bg-white/10 font-mono-cad text-[10px] uppercase">${v.env} RIG</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="p-3 rounded-lg bg-black/25 border border-current/15">
              <div class="font-mono-cad text-[10px] bp-muted-text">TRUSS / CEILING</div>
              <div class="font-semibold mt-1">${App.escapeHtml(v.ceiling)}</div>
            </div>
            <div class="p-3 rounded-lg bg-black/25 border border-current/15">
              <div class="font-mono-cad text-[10px] bp-muted-text">POWER INFRASTRUCTURE</div>
              <div class="font-semibold mt-1">${App.escapeHtml(v.powerNote)}</div>
            </div>
            <div class="p-3 rounded-lg bg-black/25 border border-current/15">
              <div class="font-mono-cad text-[10px] bp-muted-text">ACOUSTIC PROFILE</div>
              <div class="font-semibold mt-1">${App.escapeHtml(v.splLimit)}</div>
            </div>
          </div>
          ${capacityWarning}
        `;
      }
    }

    if (monsoonToggle && monsoonBox) {
      monsoonToggle.addEventListener('change', () => {
        monsoonBox.classList.toggle('hidden', !monsoonToggle.checked);
        App.playTone('click');
      });
    }

    // 46. 3-Step Event Diagnostic Wizard Modal
    const wizardForm = document.getElementById('diagnosticWizardForm');
    if (wizardForm) {
      wizardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const goal = wizardForm.querySelector('input[name="wizGoal"]:checked')?.value || 'corporate';
        const env = wizardForm.querySelector('input[name="wizEnv"]:checked')?.value || 'indoor';
        const scale = parseInt(wizardForm.querySelector('input[name="wizScale"]:checked')?.value || '600', 10);

        const recMap = {
          corporate: ['stage-truss', 'line-array', 'vip-lounge', 'passes-security', 'raffle-reg'],
          concert: ['stage-truss', 'line-array', 'led-dmx', 'laser-pyro', 'passes-security', 'dual-gen'],
          brand: ['stage-truss', 'led-dmx', 'branding-print', 'broadcast-cam', 'raffle-reg'],
          luxury: ['stage-truss', 'line-array', 'vip-lounge', 'branding-print']
        };
        App.state.config.eventType = goal;
        App.state.config.environment = env;
        App.state.config.guests = scale;
        App.state.config.subsystems = recMap[goal] || recMap.corporate;
        if (env === 'outdoor' && !App.state.config.subsystems.includes('dual-gen')) {
          App.state.config.subsystems.push('dual-gen');
        }
        App.saveState();
        App.emit('lab:syncFromState');
        renderServices();
        renderVenues();
        App.closeModal('diagnosticModal');
        document.getElementById('blueprint-lab')?.scrollIntoView({ behavior: 'smooth' });
        App.playTone('confirm');
        App.toast('Diagnostic complete! Optimal specification loaded in Blueprint Lab.', 'success', 'WIZARD COMPLETE');
      });
    }
    document.querySelectorAll('[data-open-wizard]').forEach((b) => {
      b.addEventListener('click', () => App.openModal('diagnosticModal'));
    });

    // 51. Side-by-Side Tier Comparison Modal
    document.querySelectorAll('[data-open-compare]').forEach((b) => {
      b.addEventListener('click', () => App.openModal('compareTiersModal'));
    });

    renderServices();
    renderVenues();
    App.on('lab:updated', renderVenues);

    App.registerFeature(43, 'Services & Venues', 'Service Module Filter & Search', 'Instant keyword & discipline filter across all 6 core service modules.');
    App.registerFeature(44, 'Services & Venues', 'Service Technical Spec Sheet Modal', 'Detailed inventory, lead times, and direct brief dispatch.');
    App.registerFeature(45, 'Services & Venues', '1-Click Service-to-Lab Sync', 'Push any service module equipment stack straight into Blueprint Lab.');
    App.registerFeature(46, 'Services & Venues', '3-Step Event Diagnostic Wizard', 'Guided questionnaire generating an optimal turnkey Blueprint configuration.');
    App.registerFeature(47, 'Services & Venues', 'Expandable Equipment Checklists', 'Inline accordion inventories right inside every capability card.');
    App.registerFeature(48, 'Services & Venues', 'Khulna Venue Compatibility Matrix', 'Pre-loaded specs for Khulna Club, Castle Salam, City Inn, CSS Ava, KUET & KU.');
    App.registerFeature(49, 'Services & Venues', 'Dynamic Venue Capacity & SPL Advisor', 'Alerts when configured guest scale exceeds indoor hall capacity.');
    App.registerFeature(50, 'Services & Venues', 'Monsoon & Weather Contingency Planner', 'Interactive checklist for rain-shed truss canopies and waterproof cabling.');
    App.registerFeature(51, 'Services & Venues', 'Package Tier Side-by-Side Comparator', 'Compare Executive Gala, Arena Concert, and Luxury Gala specs side by side.');
    App.registerFeature(52, 'Services & Venues', 'Direct Service Quote Pre-Fill', 'Routes chosen service requirements straight to the Khulna HQ brief form.');
  }

  document.addEventListener('DOMContentLoaded', initServicesAndVenues);
})();
