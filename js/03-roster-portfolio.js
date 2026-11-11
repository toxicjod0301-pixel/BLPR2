/* ==========================================================================
   03-ROSTER-PORTFOLIO // TEAM ROSTER, PHOTO STUDIO, PORTFOLIO & TESTIMONIALS
   ========================================================================== */

(function () {
  'use strict';
  const App = window.BlueprintApp;
  if (!App) return;

  function initRosterAndPortfolio() {
    const teamGridFounders = document.getElementById('foundersGrid');
    const teamGridExecs = document.getElementById('executivesGrid');
    const orgTreeWrap = document.getElementById('orgTopologyView');
    const teamFilterBtns = document.querySelectorAll('[data-team-filter]');
    const viewGridBtn = document.getElementById('teamViewGridBtn');
    const viewOrgBtn = document.getElementById('teamViewOrgBtn');
    let currentTeamFilter = 'all';

    function renderMonogramVisual(member) {
      return `
        <div class="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-center">
          <svg viewBox="0 0 120 120" class="w-24 h-24 bp-svg-glow opacity-90">
            <polygon points="60,8 110,36 110,84 60,112 10,84 10,36" fill="none" stroke="currentColor" class="bp-accent-text" stroke-width="1.5" />
            <polygon points="60,18 100,41 100,79 60,102 20,79 20,41" fill="rgba(255,255,255,0.03)" stroke="currentColor" class="bp-accent-text" stroke-width="0.8" stroke-dasharray="3 2" />
            <text x="60" y="67" text-anchor="middle" fill="currentColor" class="bp-accent-text font-tech" font-size="26" font-weight="800">${App.escapeHtml(member.initials)}</text>
          </svg>
          <span class="font-mono-cad text-[10px] bp-muted-text mt-2 tracking-widest uppercase">ID CAD // PHOTO UNASSIGNED</span>
          <button type="button" data-open-calib-for="${member.id}" class="mt-2 px-2.5 py-1 rounded border border-current/30 text-[10px] font-mono-cad bp-accent-text hover:bg-white/10 transition-colors z-10">
            <i class="fa-solid fa-camera mr-1"></i>CALIBRATE PHOTO
          </button>
        </div>
      `;
    }

    function renderMemberPortrait(member, heightClass) {
      const assigned = App.state.teamPhotos[member.id];
      if (assigned && assigned.src) {
        const px = typeof assigned.posX === 'number' ? assigned.posX : 50;
        const py = typeof assigned.posY === 'number' ? assigned.posY : 15;
        return `
          <div class="relative ${heightClass} w-full overflow-hidden bg-black/40">
            <img src="${App.escapeHtml(assigned.src)}" alt="${App.escapeHtml(member.name)} — ${App.escapeHtml(member.role)}"
              style="object-position: ${px}% ${py}%;"
              onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
            <div class="hidden w-full h-full">${renderMonogramVisual(member)}</div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none"></div>
          </div>
        `;
      }
      return `<div class="relative ${heightClass} w-full overflow-hidden">${renderMonogramVisual(member)}<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div></div>`;
    }

    function renderTeam() {
      const members = App.data.team.filter((m) => {
        if (currentTeamFilter === 'all') return true;
        if (currentTeamFilter === 'founder') return m.tier === 'founder';
        if (currentTeamFilter === 'executive') return m.tier === 'executive';
        return m.sector.toLowerCase().includes(currentTeamFilter);
      });

      const founders = members.filter((m) => m.tier === 'founder');
      const execs = members.filter((m) => m.tier === 'executive');

      if (teamGridFounders) {
        teamGridFounders.innerHTML = founders.map((m) => `
          <article class="bp-card bp-ticks bp-spotlight bp-card-tilt rounded-2xl overflow-hidden group flex flex-col justify-between">
            <div>
              <div class="px-5 py-3 bg-black/40 border-b border-current/15 flex items-center justify-between font-mono-cad text-[11px]">
                <span class="bp-secondary-text font-bold"><i class="fa-solid fa-crown mr-1.5"></i>${m.code}</span>
                <span class="bp-accent-text">${m.clearance}</span>
              </div>
              <div class="relative">
                ${renderMemberPortrait(m, 'h-80 sm:h-96')}
                <div class="absolute bottom-4 left-5 right-5 pointer-events-none">
                  <span class="inline-block px-2.5 py-0.5 rounded bg-black/60 border border-current/40 font-mono-cad text-[10px] bp-accent2-text uppercase tracking-widest mb-1.5">${App.escapeHtml(m.role)}</span>
                  <h3 class="font-tech font-extrabold text-xl sm:text-2xl text-white bp-text-glow leading-tight">${App.escapeHtml(m.name)}</h3>
                </div>
              </div>
              <div class="p-6">
                <p class="bp-soft-text text-xs sm:text-sm leading-relaxed mb-4">${App.escapeHtml(m.bio)}</p>
                <div class="grid grid-cols-2 gap-2 pt-3 border-t border-current/15 font-mono-cad text-[11px] bp-accent-text mb-4">
                  ${m.specialties.slice(0, 2).map((s) => `<span><i class="fa-solid fa-check-double mr-1.5"></i>${App.escapeHtml(s)}</span>`).join('')}
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" data-open-dossier="${m.id}" class="flex-1 py-2 px-3 rounded-lg bp-btn-outline font-mono-cad text-[11px] font-bold">
                    <i class="fa-solid fa-id-card mr-1.5"></i>VIEW DOSSIER & STATS
                  </button>
                  <button type="button" data-open-calib-for="${m.id}" title="Assign or adjust portrait" class="py-2 px-3 rounded-lg border border-current/25 hover:border-current text-xs bp-muted-text hover:bp-accent-text transition-colors">
                    <i class="fa-solid fa-camera"></i>
                  </button>
                </div>
              </div>
            </div>
          </article>
        `).join('') || '<div class="col-span-2 text-xs font-mono-cad bp-muted-text py-4">No Founding Panel members match active filter.</div>';
      }

      if (teamGridExecs) {
        teamGridExecs.innerHTML = execs.map((m) => `
          <article class="bp-card bp-ticks bp-spotlight rounded-xl overflow-hidden group flex flex-col justify-between">
            <div>
              <div class="px-4 py-2 bg-black/40 border-b border-current/15 flex justify-between items-center font-mono-cad text-[10px] bp-accent-text">
                <span>${m.code}</span>
                <span>${m.clearance}</span>
              </div>
              <div class="relative">
                ${renderMemberPortrait(m, 'h-64')}
                <div class="absolute bottom-3 left-4 right-4 pointer-events-none">
                  <span class="font-mono-cad text-[10px] bp-accent-text uppercase tracking-wider block">EXECUTIVE MEMBER</span>
                  <h4 class="font-tech font-bold text-base text-white">${App.escapeHtml(m.name)}</h4>
                </div>
              </div>
              <div class="p-4">
                <p class="text-xs bp-soft-text leading-relaxed mb-3">${App.escapeHtml(m.bio)}</p>
                <div class="flex items-center gap-2">
                  <button type="button" data-open-dossier="${m.id}" class="flex-1 py-1.5 px-2.5 rounded bp-btn-outline font-mono-cad text-[10px] font-bold">
                    INSPECT DOSSIER
                  </button>
                  <button type="button" data-open-calib-for="${m.id}" title="Assign or adjust portrait" class="py-1.5 px-2.5 rounded border border-current/25 text-[11px] bp-muted-text hover:bp-accent-text">
                    <i class="fa-solid fa-camera"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="px-4 py-2 bg-black/30 border-t border-current/15 font-mono-cad text-[10px] bp-accent2-text flex justify-between">
              <span>SECTOR: ${m.sector}</span>
              <span class="text-emerald-400">● ACTIVE</span>
            </div>
          </article>
        `).join('') || '<div class="col-span-4 text-xs font-mono-cad bp-muted-text py-4">No Executive Members match active filter.</div>';
      }

      bindTeamCardActions();
    }

    function bindTeamCardActions() {
      document.querySelectorAll('[data-open-dossier]').forEach((btn) => {
        btn.addEventListener('click', () => openDossier(btn.getAttribute('data-open-dossier')));
      });
      document.querySelectorAll('[data-open-calib-for]').forEach((btn) => {
        btn.addEventListener('click', () => openCalibrationStudio(btn.getAttribute('data-open-calib-for')));
      });
    }

    // 32 & 33. Interactive Member Dossier Modal + SVG 5-Axis Radar Chart
    function buildRadarSvg(stats) {
      const keys = Object.keys(stats);
      const cx = 110;
      const cy = 110;
      const maxR = 72;
      const pts = keys.map((k, i) => {
        const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
        const val = (stats[k] || 80) / 100;
        return [cx + Math.cos(angle) * maxR * val, cy + Math.sin(angle) * maxR * val];
      });
      const ring = (scale) => keys.map((_, i) => {
        const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
        return `${(cx + Math.cos(angle) * maxR * scale).toFixed(1)},${(cy + Math.sin(angle) * maxR * scale).toFixed(1)}`;
      }).join(' ');

      return `
        <svg viewBox="0 0 220 220" class="w-48 h-48 mx-auto bp-svg-glow">
          <polygon points="${ring(1)}" fill="none" stroke="currentColor" class="bp-accent-text" opacity="0.25" />
          <polygon points="${ring(0.66)}" fill="none" stroke="currentColor" class="bp-accent-text" opacity="0.18" />
          <polygon points="${ring(0.33)}" fill="none" stroke="currentColor" class="bp-accent-text" opacity="0.15" />
          ${keys.map((k, i) => {
            const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
            const lx = cx + Math.cos(angle) * (maxR + 18);
            const ly = cy + Math.sin(angle) * (maxR + 14);
            const gx = cx + Math.cos(angle) * maxR;
            const gy = cy + Math.sin(angle) * maxR;
            return `
              <line x1="${cx}" y1="${cy}" x2="${gx.toFixed(1)}" y2="${gy.toFixed(1)}" stroke="currentColor" class="bp-accent-text" opacity="0.2" />
              <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" fill="currentColor" class="bp-muted-text font-mono-cad" font-size="8">${k}</text>
            `;
          }).join('')}
          <polygon points="${pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="rgba(var(--bp-accent-rgb), 0.25)" stroke="currentColor" class="bp-accent-text" stroke-width="2" />
          ${pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="#fff" />`).join('')}
        </svg>
      `;
    }

    function openDossier(memberId) {
      const m = App.data.team.find((x) => x.id === memberId);
      if (!m) return;
      const body = document.getElementById('dossierModalBody');
      if (!body) return;
      const photo = App.state.teamPhotos[m.id];
      body.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div class="md:col-span-5 space-y-4">
            <div class="rounded-xl overflow-hidden border border-current/25 aspect-[4/5] bg-black/40">
              ${photo?.src
                ? `<img src="${App.escapeHtml(photo.src)}" alt="${App.escapeHtml(m.name)}" style="object-position:${photo.posX ?? 50}% ${photo.posY ?? 15}%" class="w-full h-full object-cover">`
                : renderMonogramVisual(m)}
            </div>
            <div class="p-3 rounded-lg bg-black/25 border border-current/15 font-mono-cad text-[11px] space-y-1">
              <div class="flex justify-between"><span class="bp-muted-text">DESIGNATION:</span><span class="bp-accent-text">${m.code}</span></div>
              <div class="flex justify-between"><span class="bp-muted-text">SECTOR:</span><span>${m.sector}</span></div>
              <div class="flex justify-between"><span class="bp-muted-text">CLEARANCE:</span><span class="bp-secondary-text">${m.clearance}</span></div>
            </div>
          </div>
          <div class="md:col-span-7 space-y-4">
            <div>
              <div class="font-mono-cad text-xs bp-accent-text uppercase">${App.escapeHtml(m.role)}</div>
              <h3 class="font-tech font-bold text-2xl mt-1">${App.escapeHtml(m.name)}</h3>
            </div>
            <p class="text-sm bp-soft-text leading-relaxed">${App.escapeHtml(m.bio)}</p>
            <div>
              <div class="font-mono-cad text-[11px] bp-accent-text mb-2">SPECIALIZED COMMAND MODULES</div>
              <div class="flex flex-wrap gap-2">
                ${m.specialties.map((s) => `<span class="px-2.5 py-1 rounded-md bg-white/5 border border-current/20 font-mono-cad text-[11px]">${App.escapeHtml(s)}</span>`).join('')}
              </div>
            </div>
            <div class="p-4 rounded-xl bg-black/25 border border-current/15">
              <div class="font-mono-cad text-[11px] bp-accent-text text-center mb-1">CAPABILITY RADAR MATRIX</div>
              ${buildRadarSvg(m.stats)}
            </div>
            <div class="flex flex-wrap gap-2 pt-2">
              <button type="button" id="dossierRouteBriefBtn" class="flex-1 py-2.5 px-4 rounded-lg bp-btn-primary font-tech text-xs font-bold">
                REQUEST ${App.escapeHtml(m.name.split(' ')[0].toUpperCase())} FOR BRIEF
              </button>
              <button type="button" id="dossierCalibPhotoBtn" class="py-2.5 px-4 rounded-lg bp-btn-outline font-mono-cad text-xs">
                EDIT PHOTO
              </button>
            </div>
          </div>
        </div>
      `;
      document.getElementById('dossierRouteBriefBtn')?.addEventListener('click', () => {
        const msgBox = document.getElementById('clientMessage');
        if (msgBox) {
          msgBox.value = `Attention: ${m.name} (${m.sector} Lead) — ` + msgBox.value;
          msgBox.dispatchEvent(new Event('input'));
        }
        App.closeModal('dossierModal');
        document.getElementById('comms')?.scrollIntoView({ behavior: 'smooth' });
        App.toast(`Brief routed to ${m.name} (${m.sector})`, 'success', 'ROSTER ROUTING');
      });
      document.getElementById('dossierCalibPhotoBtn')?.addEventListener('click', () => {
        App.closeModal('dossierModal');
        openCalibrationStudio(m.id);
      });
      App.openModal('dossierModal');
    }

    // 34, 35, 36, 37. Photo Calibration Studio (Workspace Image Mapper + Crop Sliders + Upload + Export)
    let activeCalibMemberId = 'nibir';

    function openCalibrationStudio(memberId) {
      activeCalibMemberId = memberId || 'nibir';
      renderCalibrationStudio();
      App.openModal('photoCalibModal');
    }

    function renderCalibrationStudio() {
      const memberTabs = document.getElementById('calibMemberList');
      const galleryGrid = document.getElementById('calibGalleryGrid');
      const posXInput = document.getElementById('calibPosX');
      const posYInput = document.getElementById('calibPosY');
      const previewImg = document.getElementById('calibLivePreviewImg');
      const previewLabel = document.getElementById('calibPreviewName');

      if (memberTabs) {
        memberTabs.innerHTML = App.data.team.map((m) => {
          const hasPhoto = !!(App.state.teamPhotos[m.id]?.src);
          const active = m.id === activeCalibMemberId;
          return `
            <button type="button" data-calib-member="${m.id}" class="w-full text-left px-3 py-2.5 rounded-lg border transition-all flex items-center justify-between text-xs ${active ? 'bp-tab-btn is-active font-bold' : 'border-current/20 hover:bg-white/5'}">
              <span class="truncate">${App.escapeHtml(m.name)}</span>
              <span class="font-mono-cad text-[10px]">${hasPhoto ? '● SET' : '○ NONE'}</span>
            </button>
          `;
        }).join('');
        memberTabs.querySelectorAll('[data-calib-member]').forEach((b) => {
          b.addEventListener('click', () => {
            activeCalibMemberId = b.getAttribute('data-calib-member');
            renderCalibrationStudio();
          });
        });
      }

      const activeMember = App.data.team.find((m) => m.id === activeCalibMemberId);
      const currentMap = App.state.teamPhotos[activeCalibMemberId] || { src: '', posX: 50, posY: 15 };
      if (previewLabel && activeMember) previewLabel.textContent = `${activeMember.name} (${activeMember.role})`;
      if (posXInput) posXInput.value = currentMap.posX ?? 50;
      if (posYInput) posYInput.value = currentMap.posY ?? 15;
      if (previewImg) {
        if (currentMap.src) {
          previewImg.src = currentMap.src;
          previewImg.style.objectPosition = `${currentMap.posX ?? 50}% ${currentMap.posY ?? 15}%`;
          previewImg.classList.remove('hidden');
        } else {
          previewImg.classList.add('hidden');
        }
      }

      if (galleryGrid) {
        galleryGrid.innerHTML = App.data.workspaceImages.map((img) => {
          const isSelected = currentMap.src === img.file;
          return `
            <button type="button" data-assign-img="${App.escapeHtml(img.file)}" class="rounded-lg overflow-hidden border text-left transition-all ${isSelected ? 'ring-2 ring-cyan-400 border-cyan-400' : 'border-current/20 hover:border-current/60'}">
              <img src="${App.escapeHtml(img.file)}" alt="${App.escapeHtml(img.hint)}" class="w-full h-24 object-cover object-top bg-black/40">
              <div class="p-1.5 text-[10px] font-mono-cad truncate bg-black/50">${App.escapeHtml(img.hint)}</div>
            </button>
          `;
        }).join('');
        galleryGrid.querySelectorAll('[data-assign-img]').forEach((b) => {
          b.addEventListener('click', () => {
            const file = b.getAttribute('data-assign-img');
            App.state.teamPhotos[activeCalibMemberId] = { src: file, posX: 50, posY: 15 };
            App.saveState();
            App.playTone('confirm');
            renderCalibrationStudio();
            renderTeam();
            App.toast(`Assigned ${file} to ${activeMember?.name}`, 'success', 'PHOTO CALIBRATED');
          });
        });
      }
    }

    document.getElementById('calibPosX')?.addEventListener('input', (e) => {
      if (!App.state.teamPhotos[activeCalibMemberId]) return;
      App.state.teamPhotos[activeCalibMemberId].posX = Number(e.target.value);
      App.saveState();
      renderCalibrationStudio();
      renderTeam();
    });
    document.getElementById('calibPosY')?.addEventListener('input', (e) => {
      if (!App.state.teamPhotos[activeCalibMemberId]) return;
      App.state.teamPhotos[activeCalibMemberId].posY = Number(e.target.value);
      App.saveState();
      renderCalibrationStudio();
      renderTeam();
    });
    document.getElementById('calibUploadInput')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        App.state.teamPhotos[activeCalibMemberId] = { src: reader.result, posX: 50, posY: 15 };
        App.saveState();
        renderCalibrationStudio();
        renderTeam();
        App.toast('Uploaded custom portrait for member', 'success', 'PHOTO UPLOAD');
      };
      reader.readAsDataURL(file);
    });
    document.getElementById('calibClearMemberBtn')?.addEventListener('click', () => {
      delete App.state.teamPhotos[activeCalibMemberId];
      App.saveState();
      renderCalibrationStudio();
      renderTeam();
      App.toast('Cleared member photo to CAD monogram', 'info', 'PHOTO RESET');
    });
    document.getElementById('calibExportMapBtn')?.addEventListener('click', () => {
      const mapping = App.data.team.map((m) => ({
        name: m.name,
        role: m.role,
        photo: App.state.teamPhotos[m.id]?.src?.startsWith('data:') ? '[Custom Uploaded Image]' : (App.state.teamPhotos[m.id]?.src || 'UNASSIGNED')
      }));
      App.copyText(JSON.stringify(mapping, null, 2), 'Team photo mapping JSON copied!');
    });
    document.querySelectorAll('[data-open-calib-studio]').forEach((b) => {
      b.addEventListener('click', () => openCalibrationStudio('nibir'));
    });

    // 31, 39, 41. Roster Filters, Org Topology Toggle & Roster Share
    teamFilterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        currentTeamFilter = btn.getAttribute('data-team-filter');
        teamFilterBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        renderTeam();
        App.playTone('click');
      });
    });

    if (viewGridBtn && viewOrgBtn) {
      viewGridBtn.addEventListener('click', () => {
        viewGridBtn.classList.add('is-active');
        viewOrgBtn.classList.remove('is-active');
        document.getElementById('teamGridWrap')?.classList.remove('hidden');
        orgTreeWrap?.classList.add('hidden');
        App.playTone('click');
      });
      viewOrgBtn.addEventListener('click', () => {
        viewOrgBtn.classList.add('is-active');
        viewGridBtn.classList.remove('is-active');
        document.getElementById('teamGridWrap')?.classList.add('hidden');
        orgTreeWrap?.classList.remove('hidden');
        App.playTone('click');
      });
    }

    document.getElementById('copyRosterBtn')?.addEventListener('click', () => {
      const txt = 'THE BLUEPRINT EVENT MANAGEMENT // COMMAND ROSTER (KHULNA)\n' +
        App.data.team.map((m) => `- ${m.name} (${m.role} | ${m.sector})`).join('\n');
      App.copyText(txt, 'Command Roster summary copied!');
    });

    renderTeam();
    App.registerFeature(31, 'Command Roster', 'Tier & Sector Roster Filter', 'Filter between Founding Panel, Executive Command, and functional sectors.');
    App.registerFeature(32, 'Command Roster', 'Interactive Member Dossier Modal', 'Full biographical dossier, specialties, and brief routing.');
    App.registerFeature(33, 'Command Roster', 'SVG 5-Axis Capability Radar Chart', 'Dynamic SVG polygon radar telemetry per team member.');
    App.registerFeature(34, 'Command Roster', 'Workspace Photo Calibration Studio', 'Map local workspace JPEGs or custom uploads to team profiles.');
    App.registerFeature(35, 'Command Roster', 'Portrait X/Y Framing Sliders', 'Fine-tune face alignment with object-position sliders.');
    App.registerFeature(36, 'Command Roster', 'Export Team Photo Mapping JSON', 'Copy structured member-to-photo configuration.');
    App.registerFeature(37, 'Command Roster', 'Reset Member Portrait to CAD Monogram', 'Switch cleanly between real photography and holographic SVG monograms.');
    App.registerFeature(38, 'Command Roster', 'Direct Lead Inquiry Routing', 'Route project brief attention directly to a specific command leader.');
    App.registerFeature(39, 'Command Roster', 'Org Chart Command Topology View', 'Toggle between editorial portrait cards and hierarchical command diagram.');
    App.registerFeature(40, 'Command Roster', 'Live Sector Readiness Badges', 'Active operational status indicators per command sector.');
    App.registerFeature(41, 'Command Roster', 'One-Click Roster Copy', 'Copy complete leadership roster formatted for stakeholder decks.');
    App.registerFeature(42, 'Command Roster', 'Clearance Level Indicators', 'Alpha and Sector clearance hierarchy markers.');

    /* ==================== PORTFOLIO SHOWCASE (FEATURES 81–88) ==================== */
    const portfolioGrid = document.getElementById('portfolioGrid');
    const portfolioSearch = document.getElementById('portfolioSearchInput');
    const portfolioFilters = document.querySelectorAll('[data-port-filter]');
    const portGridBtn = document.getElementById('portViewGridBtn');
    const portListBtn = document.getElementById('portViewListBtn');
    let portFilter = 'all';
    let portLayout = 'grid';

    function updateShortlistUI() {
      const validIds = new Set(App.data.portfolio.map((p) => p.id));
      App.state.shortlist = (App.state.shortlist || []).filter((id) => validIds.has(id));
      const badge = document.getElementById('shortlistCountBadge');
      if (badge) badge.textContent = String(App.state.shortlist.length);
      App.emit('shortlist:changed', App.state.shortlist);
    }

    function renderPortfolio() {
      if (!portfolioGrid) return;
      const q = (portfolioSearch?.value || '').trim().toLowerCase();
      const items = App.data.portfolio.filter((item) => {
        const catOk = portFilter === 'all' || item.category === portFilter;
        const qOk = !q || item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q) || item.tags.join(' ').toLowerCase().includes(q);
        return catOk && qOk;
      });

      if (!items.length) {
        portfolioGrid.className = 'grid grid-cols-1';
        portfolioGrid.innerHTML = '<div class="bp-card p-8 rounded-xl text-center font-mono-cad text-xs bp-muted-text">No executed blueprints match your filter/search.</div>';
        return;
      }

      if (portLayout === 'list') {
        portfolioGrid.className = 'space-y-3';
        portfolioGrid.innerHTML = items.map((item) => {
          const starred = App.state.shortlist.includes(item.id);
          return `
            <div class="bp-card rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="min-w-0">
                <div class="font-mono-cad text-[10px] bp-accent-text">${item.code} // ${item.subtitle}</div>
                <h3 class="font-tech font-bold text-base mt-0.5">${App.escapeHtml(item.title)}</h3>
                <p class="text-xs bp-soft-text mt-1">${App.escapeHtml(item.summary)}</p>
              </div>
              <div class="flex flex-wrap items-center gap-3 shrink-0 font-mono-cad text-xs">
                <span class="px-2.5 py-1 rounded bg-black/30 border border-current/15">${item.scale}</span>
                <span class="px-2.5 py-1 rounded bg-black/30 border border-current/15">${item.power}</span>
                <button type="button" data-toggle-star="${item.id}" class="px-3 py-1.5 rounded border ${starred ? 'border-amber-400 text-amber-400 bg-amber-400/10' : 'border-current/25 bp-muted-text'}">
                  <i class="fa-${starred ? 'solid' : 'regular'} fa-star mr-1"></i>${starred ? 'SAVED' : 'SAVE'}
                </button>
                <button type="button" data-open-case="${item.id}" class="px-3 py-1.5 rounded bp-btn-primary text-xs font-bold">INSPECT</button>
              </div>
            </div>
          `;
        }).join('');
      } else {
        portfolioGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
        portfolioGrid.innerHTML = items.map((item) => {
          const starred = App.state.shortlist.includes(item.id);
          const metricsHtml = Object.entries(item.metrics).map(([k, v]) =>
            `<div class="p-2 rounded bg-black/25 border border-current/10 text-center"><div class="font-mono-cad text-[9px] bp-muted-text">${k}</div><div class="font-tech font-bold text-xs bp-accent-text">${v}</div></div>`
          ).join('');
          return `
            <article class="bp-card bp-ticks bp-spotlight rounded-xl overflow-hidden flex flex-col justify-between">
              <div>
                <div class="p-5 bg-gradient-to-br from-black/50 via-transparent to-black/30 border-b border-current/15">
                  <div class="flex items-center justify-between font-mono-cad text-[10px] mb-3">
                    <span class="bp-accent-text">${item.code}</span>
                    <button type="button" data-toggle-star="${item.id}" title="Shortlist as inspiration" class="px-2 py-0.5 rounded border ${starred ? 'border-amber-400 text-amber-400 bg-amber-400/10' : 'border-current/20 bp-muted-text hover:text-amber-300'} transition-colors">
                      <i class="fa-${starred ? 'solid' : 'regular'} fa-star mr-1"></i>${starred ? 'SHORTLISTED' : 'INSPIRE'}
                    </button>
                  </div>
                  <div class="font-mono-cad text-[10px] bp-muted-text">${item.subtitle}</div>
                  <h3 class="font-tech font-bold text-lg mt-1 leading-snug">${App.escapeHtml(item.title)}</h3>
                  <div class="flex flex-wrap gap-1.5 mt-3">
                    ${item.tags.map((t) => `<span class="px-2 py-0.5 rounded bg-white/5 border border-current/15 font-mono-cad text-[10px] bp-accent2-text">${t}</span>`).join('')}
                  </div>
                </div>
                <div class="p-5 space-y-4">
                  <p class="text-xs bp-soft-text leading-relaxed">${App.escapeHtml(item.summary)}</p>
                  <div class="grid grid-cols-3 gap-2">${metricsHtml}</div>
                </div>
              </div>
              <div class="px-5 py-3 bg-black/30 border-t border-current/15 flex items-center justify-between gap-2">
                <span class="font-mono-cad text-[11px] bp-accent-text">${item.scale} • ${item.power}</span>
                <div class="flex gap-2">
                  <button type="button" data-load-preset="${item.id}" title="Load similar setup in Blueprint Lab" class="px-2.5 py-1 rounded bp-btn-outline font-mono-cad text-[10px] font-bold">
                    LOAD LAB
                  </button>
                  <button type="button" data-open-case="${item.id}" class="px-2.5 py-1 rounded bp-btn-primary font-mono-cad text-[10px] font-bold">
                    INSPECT
                  </button>
                </div>
              </div>
            </article>
          `;
        }).join('');
      }

      portfolioGrid.querySelectorAll('[data-toggle-star]').forEach((b) => {
        b.addEventListener('click', () => {
          const id = b.getAttribute('data-toggle-star');
          const idx = App.state.shortlist.indexOf(id);
          if (idx === -1) {
            App.state.shortlist.push(id);
            App.toast('Added reference blueprint to your Brief Shortlist!', 'success', 'SHORTLIST');
          } else {
            App.state.shortlist.splice(idx, 1);
            App.toast('Removed from Brief Shortlist', 'info', 'SHORTLIST');
          }
          App.saveState();
          updateShortlistUI();
          renderPortfolio();
        });
      });

      portfolioGrid.querySelectorAll('[data-load-preset]').forEach((b) => {
        b.addEventListener('click', () => {
          const item = App.data.portfolio.find((p) => p.id === b.getAttribute('data-load-preset'));
          if (!item) return;
          Object.assign(App.state.config, item.blueprintPreset);
          App.saveState();
          App.emit('lab:syncFromState');
          document.getElementById('blueprint-lab')?.scrollIntoView({ behavior: 'smooth' });
          App.toast(`Loaded "${item.title}" architecture into Blueprint Lab!`, 'success', 'PRESET LOADED');
        });
      });

      portfolioGrid.querySelectorAll('[data-open-case]').forEach((b) => {
        b.addEventListener('click', () => openCaseModal(b.getAttribute('data-open-case')));
      });
    }

    function openCaseModal(caseId) {
      const item = App.data.portfolio.find((p) => p.id === caseId);
      const body = document.getElementById('caseStudyModalBody');
      if (!item || !body) return;
      body.innerHTML = `
        <div class="space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-current/15">
            <div>
              <div class="font-mono-cad text-xs bp-accent-text">${item.code} // ${item.subtitle}</div>
              <h3 class="font-tech font-bold text-2xl mt-1">${App.escapeHtml(item.title)}</h3>
            </div>
            <span class="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono-cad text-xs">EXECUTED // KHULNA</span>
          </div>
          <p class="text-sm bp-soft-text leading-relaxed">${App.escapeHtml(item.summary)}</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 rounded-lg bg-black/25 border border-current/15"><div class="font-mono-cad text-[10px] bp-muted-text">GUEST SCALE</div><div class="font-tech font-bold text-base bp-accent-text">${item.scale}</div></div>
            <div class="p-3 rounded-lg bg-black/25 border border-current/15"><div class="font-mono-cad text-[10px] bp-muted-text">POWER DRAW</div><div class="font-tech font-bold text-base">${item.power}</div></div>
            <div class="p-3 rounded-lg bg-black/25 border border-current/15"><div class="font-mono-cad text-[10px] bp-muted-text">CREW DEPLOYED</div><div class="font-tech font-bold text-base">${item.crew}</div></div>
            <div class="p-3 rounded-lg bg-black/25 border border-current/15"><div class="font-mono-cad text-[10px] bp-muted-text">CATEGORY</div><div class="font-tech font-bold text-base uppercase">${item.category}</div></div>
          </div>
          <div class="p-4 rounded-xl bg-black/25 border border-current/20">
            <div class="font-mono-cad text-xs bp-accent-text mb-2">TECHNICAL ARCHITECTURE & EXECUTION CREDITS</div>
            <div class="flex flex-wrap gap-2">
              ${item.tags.map((t) => `<span class="px-2.5 py-1 rounded bg-white/10 font-mono-cad text-xs">${t}</span>`).join('')}
            </div>
          </div>
          <div class="flex flex-wrap gap-3 pt-2">
            <button type="button" id="caseLoadLabBtn" class="flex-1 py-3 px-4 rounded-lg bp-btn-primary font-tech text-xs font-bold">
              LOAD THIS ARCHITECTURE IN BLUEPRINT LAB
            </button>
            <button type="button" id="caseAddBriefBtn" class="py-3 px-4 rounded-lg bp-btn-outline font-tech text-xs font-bold">
              ATTACH AS REFERENCE
            </button>
          </div>
        </div>
      `;
      document.getElementById('caseLoadLabBtn')?.addEventListener('click', () => {
        Object.assign(App.state.config, item.blueprintPreset);
        App.saveState();
        App.emit('lab:syncFromState');
        App.closeModal('caseStudyModal');
        document.getElementById('blueprint-lab')?.scrollIntoView({ behavior: 'smooth' });
        App.toast(`Loaded ${item.title} parameters into Blueprint Lab!`, 'success', 'BLUEPRINT CLONED');
      });
      document.getElementById('caseAddBriefBtn')?.addEventListener('click', () => {
        if (!App.state.shortlist.includes(item.id)) {
          App.state.shortlist.push(item.id);
          App.saveState();
          updateShortlistUI();
          renderPortfolio();
        }
        App.closeModal('caseStudyModal');
        document.getElementById('comms')?.scrollIntoView({ behavior: 'smooth' });
        App.toast('Case study attached to Project Brief!', 'success', 'REFERENCE ATTACHED');
      });
      App.openModal('caseStudyModal');
    }

    portfolioFilters.forEach((btn) => {
      btn.addEventListener('click', () => {
        portFilter = btn.getAttribute('data-port-filter');
        portfolioFilters.forEach((b) => b.classList.toggle('is-active', b === btn));
        renderPortfolio();
        App.playTone('click');
      });
    });
    portfolioSearch?.addEventListener('input', renderPortfolio);
    portGridBtn?.addEventListener('click', () => {
      portLayout = 'grid';
      portGridBtn.classList.add('is-active');
      portListBtn?.classList.remove('is-active');
      renderPortfolio();
    });
    portListBtn?.addEventListener('click', () => {
      portLayout = 'list';
      portListBtn.classList.add('is-active');
      portGridBtn?.classList.remove('is-active');
      renderPortfolio();
    });

    // 83. Interactive Before/After CAD Schematic Comparison Slider
    const compareBox = document.getElementById('blueprintCompareBox');
    const compareAfter = document.getElementById('blueprintCompareAfter');
    const compareHandle = document.getElementById('blueprintCompareHandle');
    const compareRange = document.getElementById('blueprintCompareRange');
    if (compareBox && compareAfter && compareHandle) {
      const setSplit = (pct) => {
        const clamped = Math.max(5, Math.min(95, pct));
        compareAfter.style.clipPath = `inset(0 0 0 ${clamped}%)`;
        compareHandle.style.left = `${clamped}%`;
        if (compareRange) compareRange.value = String(Math.round(clamped));
      };
      let dragging = false;
      const moveFromClientX = (clientX) => {
        const r = compareBox.getBoundingClientRect();
        setSplit(((clientX - r.left) / r.width) * 100);
      };
      compareBox.addEventListener('mousedown', (e) => { dragging = true; moveFromClientX(e.clientX); });
      window.addEventListener('mousemove', (e) => { if (dragging) moveFromClientX(e.clientX); });
      window.addEventListener('mouseup', () => { dragging = false; });
      compareBox.addEventListener('touchstart', (e) => { dragging = true; if (e.touches[0]) moveFromClientX(e.touches[0].clientX); }, { passive: true });
      compareBox.addEventListener('touchmove', (e) => { if (dragging && e.touches[0]) moveFromClientX(e.touches[0].clientX); }, { passive: true });
      compareBox.addEventListener('touchend', () => { dragging = false; });
      compareRange?.addEventListener('input', (e) => setSplit(Number(e.target.value)));
      setSplit(52);
    }

    // 86 & 102. Client Testimonials Carousel with Swipe & Pause-on-Hover
    const testWrap = document.getElementById('testimonialCarouselBox');
    const testQuote = document.getElementById('testimonialQuote');
    const testAuthor = document.getElementById('testimonialAuthor');
    const testOrg = document.getElementById('testimonialOrg');
    const testRating = document.getElementById('testimonialRating');
    const testDots = document.getElementById('testimonialDots');
    let tIdx = 0;
    let tPaused = false;
    let touchStartX = 0;

    function renderTestimonial() {
      const list = App.data.testimonials;
      const item = list[tIdx];
      if (!item) return;
      if (testQuote) testQuote.textContent = `"${item.quote}"`;
      if (testAuthor) testAuthor.textContent = item.author;
      if (testOrg) testOrg.textContent = item.org;
      if (testRating) testRating.textContent = item.rating;
      if (testDots) {
        testDots.innerHTML = list.map((_, i) =>
          `<button type="button" aria-label="Show review ${i + 1}" data-tdot="${i}" class="h-2 rounded-full transition-all ${i === tIdx ? 'w-7 bg-cyan-400' : 'w-2 bg-white/25'}"></button>`
        ).join('');
        testDots.querySelectorAll('[data-tdot]').forEach((b) => {
          b.addEventListener('click', () => { tIdx = Number(b.getAttribute('data-tdot')); renderTestimonial(); });
        });
      }
    }
    document.getElementById('testimonialPrevBtn')?.addEventListener('click', () => {
      tIdx = (tIdx - 1 + App.data.testimonials.length) % App.data.testimonials.length;
      renderTestimonial();
      App.playTone('click');
    });
    document.getElementById('testimonialNextBtn')?.addEventListener('click', () => {
      tIdx = (tIdx + 1) % App.data.testimonials.length;
      renderTestimonial();
      App.playTone('click');
    });
    if (testWrap) {
      testWrap.addEventListener('mouseenter', () => { tPaused = true; });
      testWrap.addEventListener('mouseleave', () => { tPaused = false; });
      testWrap.addEventListener('touchstart', (e) => { touchStartX = e.touches[0]?.clientX || 0; }, { passive: true });
      testWrap.addEventListener('touchend', (e) => {
        const dx = (e.changedTouches[0]?.clientX || 0) - touchStartX;
        if (Math.abs(dx) > 40) {
          tIdx = dx < 0 ? (tIdx + 1) % App.data.testimonials.length : (tIdx - 1 + App.data.testimonials.length) % App.data.testimonials.length;
          renderTestimonial();
        }
      });
      setInterval(() => {
        if (!tPaused && !document.hidden) {
          tIdx = (tIdx + 1) % App.data.testimonials.length;
          renderTestimonial();
        }
      }, 6000);
    }

    renderPortfolio();
    updateShortlistUI();
    renderTestimonial();

    App.registerFeature(81, 'Portfolio', 'Multi-Category Filter & Live Search', 'Filter executed events by category or instant keyword search.');
    App.registerFeature(82, 'Portfolio', 'Interactive Case Study Inspector Modal', 'Deep-dive production specs, crew counts, and metrics.');
    App.registerFeature(83, 'Portfolio', 'CAD vs Live Execution Comparison Slider', 'Draggable split-view contrasting wireframe layout against live stage output.');
    App.registerFeature(84, 'Portfolio', 'Case Study Telemetry Micro-Cards', 'Live performance metrics (Peak SPL, Cue Accuracy, Throughput).');
    App.registerFeature(85, 'Portfolio', 'Reference Event Shortlist / Bookmarking', 'Star past projects to auto-attach as inspiration in your brief.');
    App.registerFeature(86, 'Portfolio', 'Interactive Client Review Carousel', 'Auto-advancing testimonial deck with pause-on-hover and dot navigation.');
    App.registerFeature(87, 'Portfolio', 'Grid / Compact Spec Table Toggle', 'Switch portfolio layout between visual cards and tabular specification view.');
    App.registerFeature(88, 'Portfolio', '1-Click Preset Clone into Blueprint Lab', 'Replicate any portfolio production inside the interactive configurator.');
    App.registerFeature(102, 'Accessibility', 'Mobile Touch Swipe Gesture Support', 'Horizontal swipe navigation on carousels and comparisons.');
  }

  document.addEventListener('DOMContentLoaded', initRosterAndPortfolio);
})();
