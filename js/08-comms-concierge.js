/* ==========================================================================
   08-COMMS-CONCIERGE // FAQ, LEAD TIME, KHULNA MAP, SMART BRIEF & ASSISTANT
   ========================================================================== */

(function () {
  'use strict';
  const App = window.BlueprintApp;
  if (!App) return;

  function initCommsAndConcierge() {
    /* ==================== 89. SEARCHABLE FAQ ACCORDION ==================== */
    const faqList = document.getElementById('faqAccordionList');
    const faqSearch = document.getElementById('faqSearchInput');
    const faqCatBtns = document.querySelectorAll('[data-faq-cat]');
    let faqCat = 'all';

    function renderFaqs() {
      if (!faqList) return;
      const q = (faqSearch?.value || '').trim().toLowerCase();
      const filtered = App.data.faqs.filter((f) => {
        const cOk = faqCat === 'all' || f.cat === faqCat;
        const qOk = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
        return cOk && qOk;
      });
      if (!filtered.length) {
        faqList.innerHTML = '<div class="p-6 text-center text-xs font-mono-cad bp-muted-text">No FAQ entries match your query. Ask our Concierge Assistant below!</div>';
        return;
      }
      faqList.innerHTML = filtered.map((f, idx) => `
        <div class="bp-accordion-item bp-card rounded-xl overflow-hidden ${idx === 0 ? 'is-open' : ''}">
          <button type="button" class="w-full text-left p-4 flex items-center justify-between gap-3 font-medium text-sm hover:bp-accent-text transition-colors" aria-expanded="${idx === 0}">
            <span>${App.escapeHtml(f.q)}</span>
            <i class="fa-solid fa-chevron-down text-xs bp-accent-text transition-transform duration-200 ${idx === 0 ? 'rotate-180' : ''}"></i>
          </button>
          <div class="bp-accordion-body">
            <div class="bp-accordion-inner px-4 pb-4 text-xs sm:text-sm bp-soft-text leading-relaxed border-t border-current/10 pt-3">
              ${App.escapeHtml(f.a)}
            </div>
          </div>
        </div>
      `).join('');

      faqList.querySelectorAll('.bp-accordion-item > button').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = btn.parentElement;
          const isOpen = item.classList.toggle('is-open');
          btn.setAttribute('aria-expanded', String(isOpen));
          btn.querySelector('i')?.classList.toggle('rotate-180', isOpen);
          App.playTone('click');
        });
      });
    }
    faqCatBtns.forEach((b) => b.addEventListener('click', () => {
      faqCat = b.getAttribute('data-faq-cat');
      faqCatBtns.forEach((x) => x.classList.toggle('is-active', x === b));
      renderFaqs();
    }));
    faqSearch?.addEventListener('input', renderFaqs);
    renderFaqs();
    App.registerFeature(89, 'Comms & FAQ', 'Searchable Categorized FAQ Accordion', 'Filter questions across Booking, Technical AV, Venues, and Timelines.');

    /* ==================== 90. LEAD-TIME & READINESS CALCULATOR ==================== */
    const dateInput = document.getElementById('leadTimeDateInput');
    const leadOutput = document.getElementById('leadTimeReadout');
    if (dateInput && leadOutput) {
      const futureDefault = new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10);
      dateInput.value = App.state.briefDraft.date || futureDefault;
      const calcLead = () => {
        const target = new Date(dateInput.value);
        if (isNaN(target.getTime())) return;
        const diffDays = Math.ceil((target.getTime() - Date.now()) / 86400000);
        let status = 'OPTIMAL WINDOW';
        let color = 'text-emerald-400';
        let advice = 'Full CAD drafting, custom branding print & priority rig allocation available.';
        if (diffDays < 0) {
          status = 'PAST DATE';
          color = 'text-rose-400';
          advice = 'Please select an upcoming event date.';
        } else if (diffDays <= 7) {
          status = 'CRITICAL FAST-TRACK';
          color = 'text-rose-400';
          advice = 'Call +880 1788-706868 immediately for emergency rapid-deployment availability.';
        } else if (diffDays <= 18) {
          status = 'EXPEDITED OPS';
          color = 'text-amber-400';
          advice = 'Fast-track site survey & rigging lock recommended within 48 hours.';
        }
        leadOutput.innerHTML = `
          <div class="flex items-center justify-between font-mono-cad text-xs">
            <span>T-${Math.max(0, diffDays)} DAYS REMAINING</span>
            <span class="${color} font-bold">${status}</span>
          </div>
          <p class="text-[11px] bp-soft-text mt-1">${advice}</p>
        `;
      };
      dateInput.addEventListener('change', calcLead);
      calcLead();
    }
    App.registerFeature(90, 'Comms & FAQ', 'Event Lead-Time Readiness Calculator', 'Calculates days remaining and recommends optimal Khulna booking protocol.');

    /* ==================== 91. INTERACTIVE KHULNA TACTICAL COVERAGE MAP ==================== */
    const zoneButtons = document.querySelectorAll('[data-khulna-zone]');
    const zoneReadout = document.getElementById('khulnaZoneReadout');
    const zoneData = {
      central: { title: 'CENTRAL KHULNA // HQ SECTOR', coords: '22.8456° N, 89.5403° E', eta: '15–25 Min Mobilization', venues: 'Khulna Club, Hotel Castle Salam, Circuit House Arena' },
      moylapota: { title: 'MOYLAPOTA & SONADANGA SECTOR', coords: '22.8205° N, 89.5469° E', eta: '20 Min Mobilization', venues: 'Hotel City Inn, Royal International, Convention Halls' },
      rupsha: { title: 'RUPSHA & BOYRA AUDITORIUM SECTOR', coords: '22.8112° N, 89.5631° E', eta: '25 Min Mobilization', venues: 'CSS Ava Center, Cultural Auditoriums, Riverside Grounds' },
      fulbari: { title: 'FULBARI / KUET & CAMPUS BELT', coords: '22.9005° N, 89.5023° E', eta: '35 Min Rig Convoy', venues: 'KUET Auditorium, Open Grounds, Alumni Festivals' },
      regional: { title: 'BANGLADESH REGIONAL DEPLOYMENT', coords: 'JESSORE • MONGLA • DHAKA', eta: 'Same-Day / Advance Convoy', venues: 'Full mobile truss, line-array & crew convoy nationwide' }
    };
    zoneButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-khulna-zone');
        zoneButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
        const info = zoneData[key];
        if (zoneReadout && info) {
          zoneReadout.innerHTML = `
            <div class="font-mono-cad text-[10px] bp-accent-text">${info.coords}</div>
            <div class="font-tech font-bold text-sm mt-0.5">${info.title}</div>
            <div class="text-xs bp-soft-text mt-1">Key Venues: ${info.venues}</div>
            <div class="font-mono-cad text-[11px] text-emerald-400 mt-1.5">● ${info.eta}</div>
          `;
        }
        App.playTone('ping');
      });
    });
    App.registerFeature(91, 'Comms & FAQ', 'Interactive Khulna Tactical Coverage Map', 'Clickable Khulna sector nodes with venue & convoy mobilization telemetry.');

    /* ==================== 92-97. SMART PROJECT BRIEF FORM, VALIDATION, DRAFT & TICKET ==================== */
    const briefForm = document.getElementById('projectBriefForm');
    const cName = document.getElementById('clientName');
    const cPhone = document.getElementById('clientPhone');
    const cType = document.getElementById('clientEventType');
    const cHotline = document.getElementById('targetHotline');
    const cVenue = document.getElementById('clientVenue');
    const cMsg = document.getElementById('clientMessage');
    const cMsgCount = document.getElementById('briefMsgCount');
    const attachLabChk = document.getElementById('attachLabSpecChk');
    const attachedPreview = document.getElementById('briefAttachedPreview');

    // Restore saved draft
    if (App.state.briefDraft) {
      if (cName && App.state.briefDraft.name) cName.value = App.state.briefDraft.name;
      if (cPhone && App.state.briefDraft.phone) cPhone.value = App.state.briefDraft.phone;
      if (cType && App.state.briefDraft.type) cType.value = App.state.briefDraft.type;
      if (cHotline && App.state.briefDraft.hotline) cHotline.value = App.state.briefDraft.hotline;
      if (cVenue && App.state.briefDraft.venue) cVenue.value = App.state.briefDraft.venue;
      if (cMsg && App.state.briefDraft.message) cMsg.value = App.state.briefDraft.message;
    }

    function updateBriefAttachments() {
      if (!attachedPreview) return;
      const shortlistNames = App.state.shortlist.map((id) => App.data.portfolio.find((p) => p.id === id)?.title).filter(Boolean);
      const labAttached = attachLabChk ? attachLabChk.checked : true;
      const parts = [];
      if (labAttached) parts.push(`Blueprint Lab Config (${App.state.config.guests.toLocaleString()} Pax • ${App.state.config.subsystems.length} Subsystems)`);
      if (shortlistNames.length) parts.push(`Inspiration Shortlist: ${shortlistNames.join(', ')}`);
      attachedPreview.textContent = parts.length ? 'AUTO-ATTACHED: ' + parts.join(' | ') : 'No Blueprint attachments selected.';
    }
    App.on('lab:updated', updateBriefAttachments);
    App.on('shortlist:changed', updateBriefAttachments);
    attachLabChk?.addEventListener('change', updateBriefAttachments);
    updateBriefAttachments();

    function saveDraft() {
      App.state.briefDraft = {
        name: cName?.value || '',
        phone: cPhone?.value || '',
        type: cType?.value || '',
        hotline: cHotline?.value || '8801788706868',
        venue: cVenue?.value || '',
        date: dateInput?.value || '',
        message: cMsg?.value || ''
      };
      if (cMsgCount && cMsg) cMsgCount.textContent = `${cMsg.value.length} / 1000`;
      App.saveState();
    }
    [cName, cPhone, cType, cHotline, cVenue, cMsg, dateInput].forEach((el) => {
      el?.addEventListener('input', saveDraft);
      el?.addEventListener('change', saveDraft);
    });
    if (cMsgCount && cMsg) cMsgCount.textContent = `${cMsg.value.length} / 1000`;

    // Real-time phone hint validation
    cPhone?.addEventListener('blur', () => {
      const digits = cPhone.value.replace(/\D/g, '');
      const valid = digits.length >= 10;
      cPhone.classList.toggle('border-rose-400', cPhone.value.trim().length > 0 && !valid);
      cPhone.classList.toggle('border-emerald-400', valid);
    });

    function buildFullWaMessage() {
      const name = cName?.value.trim() || 'Client';
      const phone = cPhone?.value.trim() || 'Not provided';
      const type = cType?.value || 'Event Inquiry';
      const venue = cVenue?.value.trim() || 'TBD (Khulna)';
      const dateStr = dateInput?.value || 'TBD';
      const msg = cMsg?.value.trim() || 'Requesting consultation.';
      const shortlistNames = App.state.shortlist.map((id) => App.data.portfolio.find((p) => p.id === id)?.title).filter(Boolean);
      const specBlock = attachLabChk?.checked && App.getBlueprintSpecText ? `\n\n${App.getBlueprintSpecText()}` : '';
      const refBlock = shortlistNames.length ? `\n\nReference Blueprints: ${shortlistNames.join(', ')}` : '';
      return `*NEW PROJECT BRIEF // THE BLUEPRINT*\n\n*Client:* ${name}\n*Phone:* ${phone}\n*Event Type:* ${type}\n*Venue:* ${venue}\n*Target Date:* ${dateStr}\n*Notes:* ${msg}${refBlock}${specBlock}`;
    }

    document.getElementById('exportBriefTxtBtn')?.addEventListener('click', () => {
      App.downloadFile('Project-Brief-The-Blueprint.txt', buildFullWaMessage().replace(/\*/g, ''));
      App.toast('Downloaded full project brief (.txt)', 'success');
    });

    briefForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = cName?.value.trim();
      const phone = cPhone?.value.trim();
      if (!name || !phone || phone.replace(/\D/g, '').length < 8) {
        App.toast('Please enter your Name and valid Phone / WhatsApp number.', 'warning', 'VALIDATION');
        return;
      }
      const hotline = cHotline?.value || '8801788706868';
      const ticketId = 'BP-KHL-' + Math.floor(1000 + Math.random() * 8999);
      const encoded = encodeURIComponent(buildFullWaMessage());
      const waUrl = `https://wa.me/${hotline}?text=${encoded}`;

      const ticketBody = document.getElementById('dispatchConfirmBody');
      if (ticketBody) {
        ticketBody.innerHTML = `
          <div class="text-center space-y-4">
            <div class="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 text-2xl">
              <i class="fa-solid fa-satellite-dish"></i>
            </div>
            <div>
              <div class="font-mono-cad text-xs bp-accent-text">MISSION TICKET LOGGED</div>
              <h3 class="font-tech font-bold text-2xl mt-1">${ticketId}</h3>
              <p class="text-xs bp-soft-text mt-1">Prepared for ${App.escapeHtml(name)} • Target Hotline +${hotline}</p>
            </div>
            <div class="p-3 rounded-lg bg-black/30 border border-current/15 text-left font-mono-cad text-[11px] max-h-40 overflow-y-auto whitespace-pre-wrap">${App.escapeHtml(buildFullWaMessage().replace(/\*/g, ''))}</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="py-3 px-4 rounded-lg bp-btn-primary font-tech text-xs font-bold flex items-center justify-center gap-2">
                <i class="fa-brands fa-whatsapp text-base"></i> OPEN WHATSAPP DISPATCH
              </a>
              <button type="button" id="ticketCopyBriefBtn" class="py-3 px-4 rounded-lg bp-btn-outline font-mono-cad text-xs font-bold">
                COPY BRIEF TEXT
              </button>
            </div>
          </div>
        `;
        document.getElementById('ticketCopyBriefBtn')?.addEventListener('click', () => {
          App.copyText(buildFullWaMessage().replace(/\*/g, ''), 'Mission Brief copied!');
        });
      }
      App.playTone('confirm');
      App.openModal('dispatchConfirmModal');
      window.open(waUrl, '_blank', 'noopener');
    });

    App.registerFeature(92, 'Comms & FAQ', 'Smart Project Brief Wizard Form', 'Streamlined brief submission with instant ticket dispatch.');
    App.registerFeature(93, 'Comms & FAQ', 'Real-Time Inline Input Validation', 'Instant phone formatting feedback and character counter.');
    App.registerFeature(94, 'Comms & FAQ', 'Brief Form Draft Auto-Persistence', 'Saves form fields automatically across reloads.');
    App.registerFeature(95, 'Comms & FAQ', 'Auto-Attach Lab Specs & Shortlist', 'Appends Blueprint Lab specs & starred reference events automatically.');
    App.registerFeature(96, 'Comms & FAQ', 'Multi-Channel Brief Dispatch & .TXT Export', 'Send via Hotline 01, Hotline 02, Clipboard, or TXT download.');
    App.registerFeature(97, 'Comms & FAQ', 'Mission Ticket Confirmation Modal', 'Generates unique BP-KHL ticket ID with direct WhatsApp launch.');

    /* ==================== 98 & 99. FLOATING CONCIERGE & LOCAL Q&A ASSISTANT ==================== */
    const concToggle = document.getElementById('conciergeToggleBtn');
    const concPanel = document.getElementById('conciergeChatPanel');
    const concClose = document.getElementById('conciergeCloseBtn');
    const concLog = document.getElementById('conciergeMessagesLog');
    const concForm = document.getElementById('conciergeChatForm');
    const concInput = document.getElementById('conciergeChatInput');

    const appendMsg = (sender, text) => {
      if (!concLog) return;
      const div = document.createElement('div');
      div.className = sender === 'user'
        ? 'ml-8 p-2.5 rounded-xl rounded-br-none bg-cyan-500/20 border border-cyan-400/40 text-xs'
        : 'mr-6 p-2.5 rounded-xl rounded-bl-none bg-black/40 border border-current/20 text-xs bp-soft-text';
      div.innerHTML = text;
      concLog.appendChild(div);
      concLog.scrollTop = concLog.scrollHeight;
    };

    const answerQuestion = (q) => {
      const s = q.toLowerCase();
      if (s.includes('phone') || s.includes('call') || s.includes('number') || s.includes('contact') || s.includes('hotline') || s.includes('whatsapp')) {
        return 'Our Khulna Command Hotlines are <strong>+880 1788-706868</strong> (Line 01) and <strong>+880 1703-700799</strong> (Line 02). Both support direct Calls & WhatsApp!';
      }
      if (s.includes('founder') || s.includes('team') || s.includes('owner') || s.includes('who') || s.includes('fattah') || s.includes('nibir')) {
        return 'Our Founding Panel is led by <strong>Abdullah Bin Murshed Fattah</strong> (Founder & Chief Architect) and <strong>Nibir Guha Roy</strong> (Founder & Production Director), backed by Executive Members Mashukul Islam, Alif Rahman, Shommo Dip Saha & Ahnaf Shahriar Rafi.';
      }
      if (s.includes('book') || s.includes('consult') || s.includes('proposal') || s.includes('spec') || s.includes('how')) {
        return 'Use our <strong>Blueprint Lab</strong> (#04) to build your event technical specs & stage floorplan, then dispatch directly to our Khulna HQ via WhatsApp!';
      }
      if (s.includes('venue') || s.includes('khulna') || s.includes('club') || s.includes('kuet') || s.includes('salam')) {
        return 'We engineer events across Khulna Club, Hotel Castle Salam, City Inn, CSS Ava Center, KUET & Khulna University grounds, plus nationwide venues. Check Section 03 for full venue power & ceiling telemetry.';
      }
      if (s.includes('pass') || s.includes('raffle') || s.includes('ticket') || s.includes('stage') || s.includes('3d')) {
        return 'Check out our <strong>Blueprint Lab Studio</strong> tabs: you can design a drag-and-drop <strong>CAD Stage Floorplan</strong>, test <strong>DMX Lighting</strong>, export a custom <strong>PVC VIP Pass PNG</strong>, and run a <strong>Raffle Draw</strong>!';
      }
      return 'Great question! You can explore our <strong>Blueprint Lab</strong> for technical specs & stage CAD, or call/WhatsApp our Khulna HQ directly at <strong>+880 1788-706868</strong> or <strong>+880 1703-700799</strong>.';
    };

    const toggleConcierge = (open) => {
      if (!concPanel) return;
      const show = typeof open === 'boolean' ? open : concPanel.classList.contains('hidden');
      concPanel.classList.toggle('hidden', !show);
      App.playTone('click');
    };
    concToggle?.addEventListener('click', () => toggleConcierge());
    concClose?.addEventListener('click', () => toggleConcierge(false));

    concForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = concInput?.value.trim();
      if (!q) return;
      appendMsg('user', App.escapeHtml(q));
      concInput.value = '';
      setTimeout(() => {
        appendMsg('bot', answerQuestion(q));
        App.playTone('ping');
      }, 220);
    });

    document.querySelectorAll('[data-conc-prompt]').forEach((b) => {
      b.addEventListener('click', () => {
        const prompt = b.getAttribute('data-conc-prompt');
        appendMsg('user', App.escapeHtml(prompt));
        setTimeout(() => appendMsg('bot', answerQuestion(prompt)), 180);
      });
    });

    App.registerFeature(98, 'Comms & FAQ', 'Floating Quick-Assist HUD Concierge', 'Always-accessible corner assistant for hotlines, estimates & navigation.');
    App.registerFeature(99, 'Comms & FAQ', 'Instant Local Knowledge Q&A Bot', 'Answers questions about Khulna venues, Founding Panel, AV specs & booking offline.');
  }

  document.addEventListener('DOMContentLoaded', initCommsAndConcierge);
})();
