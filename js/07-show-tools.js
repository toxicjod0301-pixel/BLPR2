/* ==========================================================================
   07-SHOW-TOOLS // VIP PASS STUDIO, RAFFLE ENGINE, RUN-OF-SHOW & CHECKLIST
   ========================================================================== */

(function () {
  'use strict';
  const App = window.BlueprintApp;
  if (!App) return;

  function initShowTools() {
    /* ==================== 75. LIVE VIP PASS & CREDENTIAL DESIGNER ==================== */
    const passEventInput = document.getElementById('passEventInput');
    const passHolderInput = document.getElementById('passHolderInput');
    const passTierSelect = document.getElementById('passTierSelect');
    const passSerialInput = document.getElementById('passSerialInput');
    const passAccentSelect = document.getElementById('passAccentSelect');
    const passCanvas = document.getElementById('vipPassPreviewCanvas');
    const passCtx = passCanvas ? passCanvas.getContext('2d') : null;

    function renderPass() {
      if (!passCanvas || !passCtx) return;
      const W = passCanvas.width;
      const H = passCanvas.height;
      const eventTitle = (passEventInput?.value || 'KHULNA WINTER GALA 2026').toUpperCase();
      const holder = (passHolderInput?.value || 'VIP GUEST ACCESS').toUpperCase();
      const tier = (passTierSelect?.value || 'VIP_ALPHA').toUpperCase();
      const serial = (passSerialInput?.value || 'BP-KHL-0842').toUpperCase();
      const accent = passAccentSelect?.value || '#00f0ff';

      // Card Base
      const bg = passCtx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#040914');
      bg.addColorStop(1, '#0d1b2f');
      passCtx.fillStyle = bg;
      passCtx.fillRect(0, 0, W, H);

      // Subtle Grid
      passCtx.strokeStyle = 'rgba(255,255,255,0.05)';
      passCtx.lineWidth = 1;
      for (let x = 0; x < W; x += 24) { passCtx.beginPath(); passCtx.moveTo(x, 0); passCtx.lineTo(x, H); passCtx.stroke(); }
      for (let y = 0; y < H; y += 24) { passCtx.beginPath(); passCtx.moveTo(0, y); passCtx.lineTo(W, y); passCtx.stroke(); }

      // Lanyard Slot
      passCtx.fillStyle = '#02050b';
      passCtx.fillRect(W / 2 - 34, 14, 68, 12);
      passCtx.strokeStyle = accent;
      passCtx.strokeRect(W / 2 - 34, 14, 68, 12);

      // Outer Frame
      passCtx.strokeStyle = accent;
      passCtx.lineWidth = 2;
      passCtx.strokeRect(12, 10, W - 24, H - 20);

      // Header Brand
      passCtx.fillStyle = accent;
      passCtx.font = 'bold 11px "JetBrains Mono", monospace';
      passCtx.fillText('THE BLUEPRINT // KHULNA HQ', 24, 52);

      // Tier Badge
      passCtx.fillStyle = accent;
      passCtx.fillRect(24, 70, W - 48, 44);
      passCtx.fillStyle = '#040914';
      passCtx.font = 'bold 20px "Orbitron", sans-serif';
      passCtx.textAlign = 'center';
      passCtx.fillText(tier, W / 2, 99);

      // Event Title & Holder
      passCtx.textAlign = 'left';
      passCtx.fillStyle = '#94a3b8';
      passCtx.font = '10px "JetBrains Mono", monospace';
      passCtx.fillText('EVENT DESIGNATION', 24, 142);
      passCtx.fillStyle = '#ffffff';
      passCtx.font = 'bold 14px "Space Grotesk", sans-serif';
      passCtx.fillText(eventTitle.slice(0, 26), 24, 162);

      passCtx.fillStyle = '#94a3b8';
      passCtx.font = '10px "JetBrains Mono", monospace';
      passCtx.fillText('CREDENTIAL HOLDER', 24, 198);
      passCtx.fillStyle = accent;
      passCtx.font = 'bold 16px "Orbitron", sans-serif';
      passCtx.fillText(holder.slice(0, 22), 24, 220);

      // Deterministic Security Matrix Barcode Pattern (Unique to Serial)
      const bx = 24;
      const by = 250;
      passCtx.fillStyle = 'rgba(255,255,255,0.06)';
      passCtx.fillRect(bx, by, W - 48, 48);
      let seed = serial.split('').reduce((a, c) => a + c.charCodeAt(0) * 17, 13);
      for (let i = 0; i < 38; i++) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        const barW = (seed % 3) + 1;
        if (seed % 2 === 0) {
          passCtx.fillStyle = i % 7 === 0 ? accent : '#f8fafc';
          passCtx.fillRect(bx + 12 + i * 6, by + 8, barW * 1.4, 32);
        }
      }

      // Footer Serial
      passCtx.fillStyle = '#cbd5e1';
      passCtx.font = 'bold 11px "JetBrains Mono", monospace';
      passCtx.fillText(`SERIAL // ${serial}`, 24, H - 24);
      passCtx.textAlign = 'right';
      passCtx.fillStyle = accent;
      passCtx.fillText('VERIFIED ACCESS', W - 24, H - 24);
      passCtx.textAlign = 'left';
    }

    [passEventInput, passHolderInput, passTierSelect, passSerialInput, passAccentSelect].forEach((el) => {
      el?.addEventListener('input', renderPass);
      el?.addEventListener('change', renderPass);
    });
    document.getElementById('passRandomSerialBtn')?.addEventListener('click', () => {
      if (passSerialInput) {
        passSerialInput.value = 'BP-KHL-' + Math.floor(1000 + Math.random() * 8999);
        renderPass();
        App.playTone('click');
      }
    });
    document.getElementById('passDownloadBtn')?.addEventListener('click', () => {
      if (!passCanvas) return;
      const a = document.createElement('a');
      a.download = `Blueprint-Pass-${passSerialInput?.value || 'VIP'}.png`;
      a.href = passCanvas.toDataURL('image/png');
      a.click();
      App.playTone('confirm');
      App.toast('VIP Credential PVC Pass exported as PNG!', 'success', 'PASS STUDIO');
    });
    renderPass();
    App.registerFeature(75, 'Show Tools', 'Live VIP PVC Pass & Credential Studio', 'Customize event tier, holder name, security barcode, and export PNG.');

    /* ==================== 76. CYBER RAFFLE & LUCKY DRAW SIMULATOR ==================== */
    const rafflePoolInput = document.getElementById('rafflePoolInput');
    const raffleReadout = document.getElementById('raffleDrawReadout');
    const raffleHistoryList = document.getElementById('raffleWinnerHistory');
    const raffleDrawBtn = document.getElementById('raffleRunBtn');
    const raffleWinners = [];

    if (raffleDrawBtn && raffleReadout) {
      raffleDrawBtn.addEventListener('click', () => {
        const raw = (rafflePoolInput?.value || '').split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
        const pool = raw.length ? raw : ['TKT-101', 'TKT-102', 'TKT-103', 'TKT-104', 'TKT-105', 'TKT-106', 'TKT-107', 'TKT-108'];
        raffleDrawBtn.disabled = true;
        let ticks = 0;
        const spin = setInterval(() => {
          ticks++;
          const pick = pool[Math.floor(Math.random() * pool.length)];
          raffleReadout.textContent = pick;
          App.playTone('click');
          if (ticks >= 22) {
            clearInterval(spin);
            raffleDrawBtn.disabled = false;
            const winner = pool[Math.floor(Math.random() * pool.length)];
            raffleReadout.textContent = `★ ${winner} ★`;
            raffleWinners.unshift({ winner, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) });
            if (raffleHistoryList) {
              raffleHistoryList.innerHTML = raffleWinners.slice(0, 5).map((w, i) =>
                `<div class="flex justify-between text-[11px] font-mono-cad py-1 border-b border-current/10"><span>#${i + 1} ${App.escapeHtml(w.winner)}</span><span class="bp-muted-text">${w.time}</span></div>`
              ).join('');
            }
            App.playTone('confirm');
            App.toast(`Raffle Winner Drawn: ${winner}`, 'success', 'RAFFLE SYSTEM');
          }
        }, 65);
      });
    }
    App.registerFeature(76, 'Show Tools', 'Live Cyber Raffle Draw Simulator', 'Interactive serialized lucky draw engine for galas and fests.');

    /* ==================== 77. RUN-OF-SHOW CUE-TO-CUE TIMELINE BUILDER ==================== */
    const cueTableBody = document.getElementById('cueTimelineBody');
    const addCueForm = document.getElementById('addCueForm');

    function renderCues() {
      if (!cueTableBody) return;
      const cues = App.state.cues || [];
      cueTableBody.innerHTML = cues.map((c, idx) => `
        <tr class="border-b border-current/10 hover:bg-white/5 text-xs">
          <td class="py-2.5 px-2 font-mono-cad bp-accent-text whitespace-nowrap">${App.escapeHtml(c.time)}</td>
          <td class="py-2.5 px-2 font-mono-cad text-[10px]"><span class="px-2 py-0.5 rounded bg-white/10">${App.escapeHtml(c.dept)}</span></td>
          <td class="py-2.5 px-2 font-medium">${App.escapeHtml(c.title)}</td>
          <td class="py-2.5 px-2 font-mono-cad text-[11px] bp-muted-text whitespace-nowrap">${c.duration}m</td>
          <td class="py-2.5 px-2 text-right whitespace-nowrap space-x-1">
            <button type="button" data-cue-up="${idx}" title="Move Up" class="px-1.5 py-0.5 rounded border border-current/20 hover:border-current text-[10px]"><i class="fa-solid fa-arrow-up"></i></button>
            <button type="button" data-cue-del="${idx}" title="Remove Cue" class="px-1.5 py-0.5 rounded border border-rose-400/30 text-rose-400 hover:bg-rose-500/15 text-[10px]"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');

      cueTableBody.querySelectorAll('[data-cue-up]').forEach((b) => {
        b.addEventListener('click', () => {
          const i = Number(b.getAttribute('data-cue-up'));
          if (i <= 0) return;
          const tmp = App.state.cues[i - 1];
          App.state.cues[i - 1] = App.state.cues[i];
          App.state.cues[i] = tmp;
          App.saveState();
          renderCues();
        });
      });
      cueTableBody.querySelectorAll('[data-cue-del]').forEach((b) => {
        b.addEventListener('click', () => {
          const i = Number(b.getAttribute('data-cue-del'));
          App.state.cues.splice(i, 1);
          App.saveState();
          renderCues();
        });
      });
    }

    addCueForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const time = document.getElementById('newCueTime')?.value || '20:00';
      const dept = document.getElementById('newCueDept')?.value || 'STAGE';
      const duration = Number(document.getElementById('newCueDur')?.value || 30);
      const title = document.getElementById('newCueTitle')?.value.trim();
      if (!title) return;
      App.state.cues.push({ id: 'c-' + Date.now(), time, duration, dept, title, owner: 'Command Desk' });
      App.saveState();
      addCueForm.reset();
      renderCues();
      App.playTone('confirm');
      App.toast(`Added cue "${title}" at ${time}`, 'success', 'RUN OF SHOW');
    });

    document.getElementById('exportCuesCsvBtn')?.addEventListener('click', () => {
      const rows = ['Time,Department,Duration(min),Cue Title,Owner'];
      (App.state.cues || []).forEach((c) => {
        rows.push(`"${c.time}","${c.dept}",${c.duration},"${c.title.replace(/"/g, '""')}","${c.owner}"`);
      });
      App.downloadFile('The-Blueprint-Run-Of-Show.csv', rows.join('\n'), 'text/csv;charset=utf-8');
      App.toast('Run-of-Show Cue Sheet exported (.csv)', 'success', 'CSV EXPORT');
    });

    renderCues();
    App.registerFeature(77, 'Show Tools', 'Cue-to-Cue Run-of-Show Builder', 'Add, reorder, delete, and export CSV production show schedules.');

    /* ==================== 78. TECHNICAL READINESS CHECKLIST ==================== */
    const checklistWrap = document.getElementById('readinessChecklistWrap');
    const checklistPctEl = document.getElementById('readinessPctReadout');
    const checklistItems = [
      { id: 'chk-power', label: '3-Phase Main + Dual-Gen Transfer Tested' },
      { id: 'chk-sound', label: 'FOH Line-Array Dispersion & Feedback Ring-Out' },
      { id: 'chk-truss', label: 'Box Truss Ballast & Wind-Load Lock Verified' },
      { id: 'chk-passes', label: 'VIP PVC Badges & Gate Scanners Synchronized' },
      { id: 'chk-weather', label: 'Waterproof Stage Canopy & Cable Ramps Ready' },
      { id: 'chk-brief', label: '6-Channel Crew Radio & Cue Sheet Distributed' }
    ];

    function renderChecklist() {
      if (!checklistWrap) return;
      let done = 0;
      checklistWrap.innerHTML = checklistItems.map((item) => {
        const checked = !!App.state.checklist[item.id];
        if (checked) done++;
        return `
          <label class="flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${checked ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-current/15 bg-black/20'}">
            <input type="checkbox" data-chk-id="${item.id}" ${checked ? 'checked' : ''} class="accent-emerald-400 w-4 h-4">
            <span class="text-xs ${checked ? 'line-through opacity-75' : ''}">${App.escapeHtml(item.label)}</span>
          </label>
        `;
      }).join('');
      const pct = Math.round((done / checklistItems.length) * 100);
      if (checklistPctEl) checklistPctEl.textContent = `${pct}% READY`;

      checklistWrap.querySelectorAll('[data-chk-id]').forEach((el) => {
        el.addEventListener('change', () => {
          App.state.checklist[el.getAttribute('data-chk-id')] = el.checked;
          App.saveState();
          App.playTone('click');
          renderChecklist();
        });
      });
    }
    renderChecklist();
    App.registerFeature(78, 'Show Tools', 'Pre-Event Technical Readiness Checklist', 'Interactive crew safety & AV verification tracker with live % score.');
  }

  document.addEventListener('DOMContentLoaded', initShowTools);
})();
