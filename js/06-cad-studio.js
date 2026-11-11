/* ==========================================================================
   06-CAD-STUDIO // DRAG-DROP VENUE CAD FLOORPLANNER & DMX + SOUNDCHECK RIG
   ========================================================================== */

(function () {
  'use strict';
  const App = window.BlueprintApp;
  if (!App) return;

  function initCadStudio() {
    const canvas = document.getElementById('cadDesignerCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const coordDisplay = document.getElementById('cadDesignerCoords');
    const selectedLabel = document.getElementById('cadSelectedLabel');

    const PALETTE = {
      stage: { label: 'MAIN STAGE', w: 150, h: 64, color: '#00f0ff', fill: 'rgba(0, 240, 255, 0.22)' },
      led: { label: 'P3 LED WALL', w: 130, h: 16, color: '#7df9ff', fill: 'rgba(125, 249, 255, 0.35)' },
      speaker: { label: 'LINE ARRAY', w: 30, h: 36, color: '#38bdf8', fill: 'rgba(56, 189, 248, 0.28)' },
      foh: { label: 'FOH CTRL', w: 68, h: 42, color: '#f59e0b', fill: 'rgba(245, 158, 11, 0.22)' },
      vip: { label: 'VIP TABLE', w: 46, h: 46, color: '#fbbf24', fill: 'rgba(251, 191, 36, 0.2)', circle: true },
      gate: { label: 'ENTRY GATE', w: 80, h: 22, color: '#10b981', fill: 'rgba(16, 185, 129, 0.24)' },
      barricade: { label: 'BARRICADE', w: 190, h: 12, color: '#f43f5e', fill: 'rgba(244, 63, 94, 0.28)' },
      booth: { label: 'PHOTO BOOTH', w: 56, h: 40, color: '#c084fc', fill: 'rgba(192, 132, 252, 0.22)' }
    };

    let items = [];
    let selectedId = null;
    let snapGrid = true;
    let layers = { grid: true, acoustics: true, dimensions: true, crowd: true };
    let history = [];
    let redoStack = [];
    let dragging = false;
    let dragOffset = { x: 0, y: 0 };

    function pushHistory() {
      history.push(JSON.stringify(items));
      if (history.length > 30) history.shift();
      redoStack = [];
    }

    function autoLayout() {
      pushHistory();
      const guests = App.state.config?.guests || 600;
      const w = 720;
      items = [
        { id: 'i1', kind: 'led', label: 'P3 LED WALL', x: w / 2, y: 46, w: 160, h: 18, rot: 0, scale: 1 },
        { id: 'i2', kind: 'stage', label: 'MAIN STAGE', x: w / 2, y: 88, w: guests >= 1500 ? 220 : 170, h: 68, rot: 0, scale: 1 },
        { id: 'i3', kind: 'speaker', label: 'ARRAY L', x: w / 2 - (guests >= 1500 ? 135 : 108), y: 88, w: 30, h: 36, rot: 0, scale: 1 },
        { id: 'i4', kind: 'speaker', label: 'ARRAY R', x: w / 2 + (guests >= 1500 ? 135 : 108), y: 88, w: 30, h: 36, rot: 0, scale: 1 },
        { id: 'i5', kind: 'barricade', label: 'MOJO BARRICADE', x: w / 2, y: 142, w: 260, h: 12, rot: 0, scale: 1 },
        { id: 'i6', kind: 'vip', label: 'VIP 01', x: 240, y: 215, w: 46, h: 46, rot: 0, scale: 1, circle: true },
        { id: 'i7', kind: 'vip', label: 'VIP 02', x: 360, y: 215, w: 46, h: 46, rot: 0, scale: 1, circle: true },
        { id: 'i8', kind: 'vip', label: 'VIP 03', x: 480, y: 215, w: 46, h: 46, rot: 0, scale: 1, circle: true },
        { id: 'i9', kind: 'foh', label: 'FOH CTRL', x: w / 2, y: 315, w: 74, h: 42, rot: 0, scale: 1 },
        { id: 'i10', kind: 'booth', label: 'PHOTO ZONE', x: 110, y: 310, w: 62, h: 42, rot: 0, scale: 1 },
        { id: 'i11', kind: 'gate', label: 'VIP ENTRY GATE', x: w / 2, y: 392, w: 110, h: 24, rot: 0, scale: 1 }
      ];
      selectedId = 'i2';
      renderCad();
    }

    function getCanvasPoint(e) {
      if (!canvas) return { x: 0, y: 0 };
      const r = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * canvas.width,
        y: ((e.clientY - r.top) / r.height) * canvas.height
      };
    }

    function renderCad() {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#050c18';
      ctx.fillRect(0, 0, W, H);

      // Grid Layer
      if (layers.grid) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= W; x += 20) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y <= H; y += 20) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.16)';
        for (let x = 0; x <= W; x += 100) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y <= H; y += 100) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
      }

      // Crowd Zone Overlay
      if (layers.crowd) {
        const grad = ctx.createRadialGradient(W / 2, 220, 25, W / 2, 230, 230);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
        grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(100, 145, W - 200, 220);
      }

      // Acoustic SPL Coverage Cones from Speaker Arrays
      if (layers.acoustics) {
        items.filter((i) => i.kind === 'speaker').forEach((sp) => {
          ctx.save();
          ctx.translate(sp.x, sp.y);
          ctx.rotate((sp.rot * Math.PI) / 180);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, 250, Math.PI * 0.28, Math.PI * 0.72);
          ctx.closePath();
          ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.32)';
          ctx.setLineDash([5, 4]);
          ctx.stroke();
          ctx.restore();
        });
      }

      // Draw Items
      items.forEach((item) => {
        const spec = PALETTE[item.kind] || PALETTE.stage;
        const w = item.w * item.scale;
        const h = item.h * item.scale;
        const isSel = item.id === selectedId;

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate((item.rot * Math.PI) / 180);

        ctx.fillStyle = spec.fill;
        ctx.strokeStyle = isSel ? '#ffffff' : spec.color;
        ctx.lineWidth = isSel ? 2.4 : 1.5;

        if (item.circle || spec.circle) {
          ctx.beginPath();
          ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeRect(-w / 2, -h / 2, w, h);
        }

        // Dimensions Callout
        if (layers.dimensions && isSel) {
          ctx.fillStyle = '#00f0ff';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.round(w / 5)}ft × ${Math.round(h / 5)}ft`, 0, -h / 2 - 7);
        }

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, 0, 0);
        ctx.restore();
      });

      // CAD Title Block Stamp
      ctx.fillStyle = 'rgba(5, 12, 24, 0.85)';
      ctx.fillRect(10, H - 34, 310, 24);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.strokeRect(10, H - 34, 310, 24);
      ctx.fillStyle = '#7df9ff';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('THE BLUEPRINT // CAD FLOORPLAN STUDIO // KHULNA HQ', 18, H - 18);

      const sel = items.find((i) => i.id === selectedId);
      if (selectedLabel) {
        selectedLabel.textContent = sel
          ? `SELECTED: ${sel.label} (${Math.round(sel.x / 5)}ft, ${Math.round(sel.y / 5)}ft | ${sel.rot}°)`
          : 'CLICK ANY ELEMENT ON CANVAS TO SELECT & DRAG';
      }
    }

    if (canvas && ctx) {
      autoLayout();

      canvas.addEventListener('pointerdown', (e) => {
        const pt = getCanvasPoint(e);
        const hit = [...items].reverse().find((item) => {
          const hw = (item.w * item.scale) / 2 + 6;
          const hh = (item.h * item.scale) / 2 + 6;
          return Math.abs(pt.x - item.x) <= hw && Math.abs(pt.y - item.y) <= hh;
        });
        if (hit) {
          pushHistory();
          selectedId = hit.id;
          dragging = true;
          dragOffset.x = pt.x - hit.x;
          dragOffset.y = pt.y - hit.y;
          canvas.setPointerCapture(e.pointerId);
          App.playTone('click');
        } else {
          selectedId = null;
        }
        renderCad();
      });

      canvas.addEventListener('pointermove', (e) => {
        const pt = getCanvasPoint(e);
        if (coordDisplay) {
          coordDisplay.textContent = `X: ${Math.round(pt.x / 5)}ft | Y: ${Math.round(pt.y / 5)}ft`;
        }
        if (!dragging || !selectedId) return;
        const item = items.find((i) => i.id === selectedId);
        if (!item) return;
        let nx = pt.x - dragOffset.x;
        let ny = pt.y - dragOffset.y;
        if (snapGrid) {
          nx = Math.round(nx / 20) * 20;
          ny = Math.round(ny / 20) * 20;
        }
        item.x = Math.max(24, Math.min(canvas.width - 24, nx));
        item.y = Math.max(24, Math.min(canvas.height - 46, ny));
        renderCad();
      });

      canvas.addEventListener('pointerup', () => { dragging = false; });

      // Add element palette buttons
      document.querySelectorAll('[data-cad-add]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const kind = btn.getAttribute('data-cad-add');
          const spec = PALETTE[kind];
          if (!spec) return;
          pushHistory();
          const newItem = {
            id: 'item-' + Date.now(),
            kind,
            label: spec.label,
            x: 360 + (Math.random() * 40 - 20),
            y: 210 + (Math.random() * 40 - 20),
            w: spec.w,
            h: spec.h,
            rot: 0,
            scale: 1,
            circle: !!spec.circle
          };
          items.push(newItem);
          selectedId = newItem.id;
          renderCad();
          App.playTone('confirm');
        });
      });

      // Controls: Rotate, Scale+, Scale-, Duplicate, Delete, Snap, Auto, Undo, Redo, Export PNG
      document.getElementById('cadRotateBtn')?.addEventListener('click', () => {
        const item = items.find((i) => i.id === selectedId);
        if (!item) return;
        pushHistory();
        item.rot = (item.rot + 15) % 360;
        renderCad();
      });
      document.getElementById('cadScaleUpBtn')?.addEventListener('click', () => {
        const item = items.find((i) => i.id === selectedId);
        if (!item) return;
        pushHistory();
        item.scale = Math.min(1.8, +(item.scale + 0.1).toFixed(2));
        renderCad();
      });
      document.getElementById('cadScaleDownBtn')?.addEventListener('click', () => {
        const item = items.find((i) => i.id === selectedId);
        if (!item) return;
        pushHistory();
        item.scale = Math.max(0.6, +(item.scale - 0.1).toFixed(2));
        renderCad();
      });
      document.getElementById('cadDuplicateBtn')?.addEventListener('click', () => {
        const item = items.find((i) => i.id === selectedId);
        if (!item) return;
        pushHistory();
        const clone = Object.assign({}, item, { id: 'item-' + Date.now(), x: item.x + 30, y: item.y + 30 });
        items.push(clone);
        selectedId = clone.id;
        renderCad();
      });
      document.getElementById('cadDeleteBtn')?.addEventListener('click', () => {
        if (!selectedId) return;
        pushHistory();
        items = items.filter((i) => i.id !== selectedId);
        selectedId = null;
        renderCad();
      });
      document.getElementById('cadAutoLayoutBtn')?.addEventListener('click', () => {
        autoLayout();
        App.toast('Auto-arranged optimal venue floorplan for current guest count!', 'success', 'CAD AUTO-LAYOUT');
      });
      document.getElementById('cadSnapToggle')?.addEventListener('change', (e) => {
        snapGrid = e.target.checked;
      });
      document.querySelectorAll('[data-cad-layer]').forEach((chk) => {
        chk.addEventListener('change', () => {
          layers[chk.getAttribute('data-cad-layer')] = chk.checked;
          renderCad();
        });
      });
      document.getElementById('cadUndoBtn')?.addEventListener('click', () => {
        if (!history.length) return;
        redoStack.push(JSON.stringify(items));
        items = JSON.parse(history.pop());
        renderCad();
      });
      document.getElementById('cadRedoBtn')?.addEventListener('click', () => {
        if (!redoStack.length) return;
        history.push(JSON.stringify(items));
        items = JSON.parse(redoStack.pop());
        renderCad();
      });
      document.getElementById('cadExportPngBtn')?.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'The-Blueprint-Stage-Floorplan-Khulna.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        App.playTone('confirm');
        App.toast('Exported high-resolution CAD Floorplan PNG!', 'success', 'CAD EXPORT');
      });
    }

    App.registerFeature(65, 'CAD Studio', 'Drag & Drop Venue Floorplan Canvas', 'Place and arrange Stages, LED Walls, Line Arrays, VIP Tables & Gates.');
    App.registerFeature(66, 'CAD Studio', '20px Snap-to-Grid Coordinate Engine', 'Precision snap alignment with live feet X/Y cursor readout.');
    App.registerFeature(67, 'CAD Studio', 'Element Rotate, Scale, Duplicate & Delete', 'Transform any placed rigging or seating element on the fly.');
    App.registerFeature(68, 'CAD Studio', 'Smart Auto-Layout Floorplan Generator', 'Calculates balanced stage/FOH/VIP placement from current guest count.');
    App.registerFeature(69, 'CAD Studio', 'Acoustic SPL Cone & Sightline Overlay', 'Visualizes speaker dispersion arcs across the audience floor.');
    App.registerFeature(70, 'CAD Studio', '30-Step Undo / Redo Command History', 'Non-destructive floorplan iteration with full undo/redo stack.');
    App.registerFeature(71, 'CAD Studio', 'CAD Layer Visibility Toggles', 'Toggle Grid, Acoustic Cones, Dimensions, and Crowd Zones.');
    App.registerFeature(72, 'CAD Studio', 'High-Res PNG Blueprint Schematic Export', 'Download stamped CAD floorplan image for client meetings.');

    /* ==================== 73 & 74. LIVE DMX LIGHTING & SOUNDCHECK SIMULATOR ==================== */
    const dmxCanvas = document.getElementById('dmxStageCanvas');
    const dmxCtx = dmxCanvas ? dmxCanvas.getContext('2d') : null;
    let dmxPreset = 'cyber';
    let dmxSpread = 45;
    let dmxSpeed = 1.4;
    let dmxHaze = 0.35;
    let dmxPhase = 0;

    const DMX_THEMES = {
      cyber: ['#00f0ff', '#7df9ff', '#38bdf8'],
      gold: ['#f59e0b', '#fde68a', '#fb923c'],
      concert: ['#fb7185', '#c084fc', '#00f0ff'],
      emerald: ['#10b981', '#34d399', '#7df9ff']
    };

    document.querySelectorAll('[data-dmx-preset]').forEach((b) => {
      b.addEventListener('click', () => {
        dmxPreset = b.getAttribute('data-dmx-preset');
        document.querySelectorAll('[data-dmx-preset]').forEach((x) => x.classList.toggle('is-active', x === b));
        App.playTone('click');
      });
    });
    document.getElementById('dmxSpreadRange')?.addEventListener('input', (e) => { dmxSpread = Number(e.target.value); });
    document.getElementById('dmxSpeedRange')?.addEventListener('input', (e) => { dmxSpeed = Number(e.target.value) / 10; });
    document.getElementById('dmxHazeRange')?.addEventListener('input', (e) => { dmxHaze = Number(e.target.value) / 100; });

    function drawDmx() {
      if (dmxCanvas && dmxCtx && !document.hidden) {
        const panel = document.querySelector('[data-lab-panel="dmx"]');
        if (panel && !panel.classList.contains('hidden')) {
          const W = dmxCanvas.width;
          const H = dmxCanvas.height;
          dmxPhase += 0.03 * dmxSpeed;
          dmxCtx.fillStyle = '#03060f';
          dmxCtx.fillRect(0, 0, W, H);

          // Truss Bar
          dmxCtx.strokeStyle = 'rgba(255,255,255,0.28)';
          dmxCtx.lineWidth = 3;
          dmxCtx.strokeRect(40, 14, W - 80, 12);

          // Moving Head Beams
          const cols = DMX_THEMES[dmxPreset] || DMX_THEMES.cyber;
          const heads = 6;
          for (let i = 0; i < heads; i++) {
            const hx = 75 + ((W - 150) / (heads - 1)) * i;
            const swing = Math.sin(dmxPhase + i * 0.85) * 0.52;
            const tx = hx + Math.sin(swing) * 230;
            const col = cols[i % cols.length];

            const grad = dmxCtx.createLinearGradient(hx, 26, tx, H);
            grad.addColorStop(0, col);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            dmxCtx.save();
            dmxCtx.globalAlpha = 0.25 + dmxHaze * 0.45;
            dmxCtx.fillStyle = grad;
            dmxCtx.beginPath();
            dmxCtx.moveTo(hx - 4, 26);
            dmxCtx.lineTo(hx + 4, 26);
            dmxCtx.lineTo(tx + dmxSpread, H);
            dmxCtx.lineTo(tx - dmxSpread, H);
            dmxCtx.closePath();
            dmxCtx.fill();
            dmxCtx.restore();

            dmxCtx.fillStyle = '#fff';
            dmxCtx.beginPath();
            dmxCtx.arc(hx, 26, 4, 0, Math.PI * 2);
            dmxCtx.fill();
          }

          // Stage Floor Reflection
          dmxCtx.fillStyle = 'rgba(0, 240, 255, 0.14)';
          dmxCtx.fillRect(60, H - 22, W - 120, 14);
          dmxCtx.strokeStyle = cols[0];
          dmxCtx.strokeRect(60, H - 22, W - 120, 14);
        }
      }
      requestAnimationFrame(drawDmx);
    }
    if (dmxCanvas) requestAnimationFrame(drawDmx);

    // 74. Web Audio Soundcheck Test Tone & Live EQ Bars
    let soundOsc = null;
    let soundCtx = null;
    let soundGain = null;
    const eqBars = document.querySelectorAll('.bp-eq-bar');
    const soundTestBtn = document.getElementById('soundcheckToggleBtn');
    const soundFreqSelect = document.getElementById('soundcheckFreqSelect');

    function animateEqBars(active) {
      eqBars.forEach((bar, idx) => {
        const h = active ? 22 + Math.abs(Math.sin(performance.now() / 160 + idx * 0.9)) * 75 : 16;
        bar.style.height = `${h.toFixed(0)}%`;
      });
      if (soundOsc) requestAnimationFrame(() => animateEqBars(true));
    }

    if (soundTestBtn) {
      soundTestBtn.addEventListener('click', () => {
        if (soundOsc) {
          soundOsc.stop();
          soundOsc.disconnect();
          soundOsc = null;
          soundTestBtn.innerHTML = '<i class="fa-solid fa-play mr-1.5"></i>START LINE-ARRAY TEST TONE';
          soundTestBtn.classList.remove('bp-btn-primary');
          soundTestBtn.classList.add('bp-btn-outline');
          animateEqBars(false);
          return;
        }
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        if (!soundCtx) soundCtx = new Ctx();
        if (soundCtx.state === 'suspended') soundCtx.resume();
        soundOsc = soundCtx.createOscillator();
        soundGain = soundCtx.createGain();
        soundOsc.type = 'sine';
        soundOsc.frequency.value = Number(soundFreqSelect?.value || 220);
        soundGain.gain.value = 0.04;
        soundOsc.connect(soundGain);
        soundGain.connect(soundCtx.destination);
        soundOsc.start();
        soundTestBtn.innerHTML = '<i class="fa-solid fa-stop mr-1.5"></i>STOP TEST TONE';
        soundTestBtn.classList.add('bp-btn-primary');
        soundTestBtn.classList.remove('bp-btn-outline');
        animateEqBars(true);
      });
    }
    soundFreqSelect?.addEventListener('change', (e) => {
      if (soundOsc && soundCtx) {
        soundOsc.frequency.setValueAtTime(Number(e.target.value), soundCtx.currentTime);
      }
    });

    App.registerFeature(73, 'CAD Studio', 'Live DMX Lighting Console Simulator', 'Interactive beam spread, haze density, sweep speed, and color cues.');
    App.registerFeature(74, 'CAD Studio', 'Web Audio Line-Array Soundcheck Rig', 'Selectable frequency acoustic sweep test with live EQ visualizer.');
  }

  document.addEventListener('DOMContentLoaded', initCadStudio);
})();
