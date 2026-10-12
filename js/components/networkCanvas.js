// High-Performance Interactive Cyber Network Visualizer (HTML5 Canvas)
// Renders network nodes, glowing data beams, animated packet trails, and node statuses

import { soundFX } from "../utils/audioFx.js";

// Target frame duration in ms (60 fps baseline).
// All animation speeds are authored at 60 fps; delta-time scaling keeps them
// consistent on 144 Hz or throttled displays.
const TARGET_FPS_MS = 1000 / 60;

export class NetworkCanvas {
  constructor(canvasElement, onNodeSelect) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.onNodeSelect = onNodeSelect;

    this.nodes = [];
    this.links = [
      { from: "attacker", to: "firewall", type: "external" },
      { from: "darkweb", to: "firewall", type: "external" },
      { from: "firewall", to: "workstation", type: "internal" },
      { from: "firewall", to: "jumpbox", type: "internal" },
      { from: "workstation", to: "jumpbox", type: "lateral" },
      { from: "workstation", to: "domainController", type: "lateral" },
      { from: "jumpbox", to: "database", type: "lateral" },
      { from: "domainController", to: "database", type: "lateral" },
      { from: "database", to: "exfilCloud", type: "egress" }
    ];

    this.activePacket = null;
    this.particles = [];
    this.ambientParticles = [];
    this.animFrameId = null;
    this.hoveredNode = null;
    this.selectedNode = null;

    // Fix: track the previous timestamp so we can compute a proper delta-time
    // each frame instead of advancing animation by a fixed amount per tick.
    this._lastTimestamp = null;

    this.scale = 1;
    this.width = 0;
    this.height = 0;

    // Keep resize handler reference for potential future cleanup
    this._resizeHandler = () => this.resize();
    window.addEventListener("resize", this._resizeHandler);

    this.initEvents();
    this.initAmbientParticles();
  }

  setNodes(nodesData) {
    this.nodes = JSON.parse(JSON.stringify(nodesData));
    this.resize();
  }

  initEvents() {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let found = null;
      for (const node of this.nodes) {
        const nx = this.scaleCoordX(node.x);
        const ny = this.scaleCoordY(node.y);
        const dist = Math.hypot(mouseX - nx, mouseY - ny);
        // Fix: hit-test radius now matches the drawn node radius (22px) exactly,
        // so the pointer changes only when the cursor is over the visible circle.
        if (dist <= 22) {
          found = node;
          break;
        }
      }

      if (this.hoveredNode !== found) {
        this.hoveredNode = found;
        this.canvas.style.cursor = found ? "pointer" : "default";
      }
    });

    this.canvas.addEventListener("click", () => {
      if (this.hoveredNode) {
        // Fix: clicking the same node again deselects it; clicking away from all
        // nodes also clears selection (handled by hoveredNode being null).
        this.selectedNode = this.hoveredNode === this.selectedNode
          ? null
          : this.hoveredNode;

        soundFX.playClick();
        if (this.onNodeSelect && this.selectedNode) {
          this.onNodeSelect(this.selectedNode);
        }
      } else {
        // Clicked blank canvas — clear selection
        this.selectedNode = null;
      }
    });
  }

  initAmbientParticles() {
    this.ambientParticles = [];
    for (let i = 0; i < 35; i++) {
      this.ambientParticles.push({
        x: Math.random() * 1000,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.1
      });
    }
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    this.width = parent.clientWidth;
    this.height = parent.clientHeight || 460;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  scaleCoordX(baseX) {
    // Base design is 1000 px wide
    return (baseX / 1000) * this.width;
  }

  scaleCoordY(baseY) {
    // Base design is 500 px tall
    return (baseY / 500) * this.height;
  }

  getNodeById(id) {
    return this.nodes.find(n => n.id === id);
  }

  updateNodeStatus(nodeId, newStatus) {
    const node = this.getNodeById(nodeId);
    if (node) node.status = newStatus;

    // Fix: if the currently selected node changes status (e.g. goes from secure
    // to compromised), deselect it so stale inspector data isn't shown.
    if (this.selectedNode && this.selectedNode.id === nodeId) {
      this.selectedNode = null;
    }
  }

  triggerPacketFlow(flowData) {
    if (!flowData) return;
    const fromNode = this.getNodeById(flowData.from);
    const toNode = this.getNodeById(flowData.to);
    if (!fromNode || !toNode) return;

    // Skip self-loop flows (from === to) — they animate as a stationary dot.
    if (fromNode.id === toNode.id) return;

    this.activePacket = {
      from: fromNode,
      to: toNode,
      progress: 0,
      type: flowData.type,
      label: flowData.label || "Data Beam",
      // Fix: speed is now a 0-1 progress-per-frame value at 60 fps baseline.
      // Delta-time scaling in drawPacketFlow() ensures consistent speed at any
      // refresh rate.
      speed: (flowData.speed || 1.0) * 0.015,
      trail: []
    };

    soundFX.playPacketPulse();
  }

  start() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this._lastTimestamp = null;
    const loop = (timestamp) => {
      this.render(timestamp);
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /**
   * Compute a delta-time multiplier normalised to 60 fps.
   * Returns 1.0 on a 60 Hz display, ~2.4 on 144 Hz, ~0.5 on 30 Hz.
   * Clamped to [0.1, 4] to avoid huge jumps after tab switches or long pauses.
   */
  _getDelta(timestamp) {
    if (this._lastTimestamp === null) {
      this._lastTimestamp = timestamp;
      return 1;
    }
    const elapsed = timestamp - this._lastTimestamp;
    this._lastTimestamp = timestamp;
    // Clamp delta to avoid physics explosion after long tab-backgrounding
    return Math.min(Math.max(elapsed / TARGET_FPS_MS, 0.1), 4);
  }

  render(timestamp) {
    // Fix: compute delta-time multiplier once per frame and pass to every
    // sub-system that advances animation state.
    const delta = this._getDelta(timestamp);

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw subtle background cyber grid
    this.drawCyberGrid();

    // 2. Draw ambient digital dust (delta-time scaled)
    this.drawAmbientDust(delta);

    // 3. Draw connection links
    this.drawLinks(timestamp);

    // 4. Draw active packet flow animation (delta-time scaled)
    this.drawPacketFlow(delta);

    // 5. Draw node impact sparks / explosion particles (delta-time scaled)
    this.drawParticles(delta);

    // 6. Draw network nodes
    this.drawNodes(timestamp);
  }

  drawCyberGrid() {
    const ctx = this.ctx;
    ctx.strokeStyle = "rgba(14, 165, 233, 0.06)";
    ctx.lineWidth = 1;

    const gridSize = 36;
    for (let x = 0; x < this.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Zone demarcations
    const advX = this.scaleCoordX(180);
    const periX = this.scaleCoordX(380);

    ctx.strokeStyle = "rgba(239, 68, 68, 0.15)";
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(advX, 0);
    ctx.lineTo(advX, this.height);
    ctx.stroke();

    ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
    ctx.beginPath();
    ctx.moveTo(periX, 0);
    ctx.lineTo(periX, this.height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(239, 68, 68, 0.4)";
    ctx.fillText("// ADVERSARY ZONE", 16, 24);

    ctx.fillStyle = "rgba(245, 158, 11, 0.4)";
    ctx.fillText("// DMZ PERIMETER", advX + 16, 24);

    ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
    ctx.fillText("// INTERNAL INTRANET & DOMAIN CORE", periX + 16, 24);
  }

  // Fix: accepts delta so particles move at the same speed regardless of refresh rate
  drawAmbientDust(delta) {
    const ctx = this.ctx;
    for (const p of this.ambientParticles) {
      p.x += p.vx * delta;
      p.y += p.vy * delta;

      // Wrap in logical 1000×500 space (matching initAmbientParticles bounds)
      if (p.x < 0) p.x = 1000;
      if (p.x > 1000) p.x = 0;
      if (p.y < 0) p.y = 500;
      if (p.y > 500) p.y = 0;

      const px = this.scaleCoordX(p.x);
      const py = this.scaleCoordY(p.y);

      ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawLinks(timestamp) {
    const ctx = this.ctx;
    for (const link of this.links) {
      const fromNode = this.getNodeById(link.from);
      const toNode = this.getNodeById(link.to);
      if (!fromNode || !toNode) continue;

      const x1 = this.scaleCoordX(fromNode.x);
      const y1 = this.scaleCoordY(fromNode.y);
      const x2 = this.scaleCoordX(toNode.x);
      const y2 = this.scaleCoordY(toNode.y);

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, "rgba(56, 189, 248, 0.15)");
      grad.addColorStop(1, "rgba(99, 102, 241, 0.2)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Ambient pulse along the wire — uses absolute timestamp for a smooth
      // looping offset, independent of delta (it's cosmetic, not physics).
      const t = (timestamp * 0.0006 + (fromNode.x * 0.01)) % 1;
      const pulseX = x1 + (x2 - x1) * t;
      const pulseY = y1 + (y2 - y1) * t;

      ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
      ctx.beginPath();
      ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Fix: packet progress is scaled by delta so speed is frame-rate independent
  drawPacketFlow(delta) {
    if (!this.activePacket) return;

    const p = this.activePacket;
    // Advance progress proportional to elapsed time (delta ≈ 1 at 60 Hz)
    p.progress += p.speed * delta;

    const x1 = this.scaleCoordX(p.from.x);
    const y1 = this.scaleCoordY(p.from.y);
    const x2 = this.scaleCoordX(p.to.x);
    const y2 = this.scaleCoordY(p.to.y);

    const currentX = x1 + (x2 - x1) * Math.min(p.progress, 1);
    const currentY = y1 + (y2 - y1) * Math.min(p.progress, 1);

    p.trail.push({ x: currentX, y: currentY, alpha: 1.0 });
    if (p.trail.length > 15) p.trail.shift();

    let color = "#38bdf8";
    if (p.type === "phish" || p.type === "shellcode") color = "#ef4444";
    else if (p.type === "lateral") color = "#10b981";
    else if (p.type === "creds") color = "#eab308";
    else if (p.type === "exfil") color = "#0ea5e9";
    else if (p.type === "impact") color = "#f43f5e";

    const ctx = this.ctx;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(`⚡ ${p.label}`, currentX, currentY - 14);

    if (p.progress >= 1.0) {
      this.spawnSparks(x2, y2, color);
      this.activePacket = null;
    }
  }

  spawnSparks(x, y, color) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02,
        color,
        size: Math.random() * 3 + 2
      });
    }
  }

  // Fix: particle velocity and decay are scaled by delta for frame-rate independence
  drawParticles(delta) {
    const ctx = this.ctx;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * delta;
      pt.y += pt.vy * delta;
      pt.life -= pt.decay * delta;

      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.life;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }

  drawNodes(timestamp) {
    const ctx = this.ctx;

    for (const node of this.nodes) {
      const x = this.scaleCoordX(node.x);
      const y = this.scaleCoordY(node.y);
      const isHovered = this.hoveredNode === node;
      const isSelected = this.selectedNode === node;

      // Status color definitions
      let statusColor = "#38bdf8";
      let statusText = "SECURE";

      switch (node.status) {
        case "active":
          statusColor = "#ef4444";
          statusText = "ADVERSARY";
          break;
        case "targeted":
        case "probed":
          statusColor = "#f59e0b";
          statusText = "TARGETED";
          break;
        case "compromised":
        case "persisted":
          statusColor = "#ec4899";
          statusText = "COMPROMISED";
          break;
        case "elevated":
          statusColor = "#f97316";
          statusText = "SYSTEM TOKEN";
          break;
        case "discovered":
        case "staged":
          statusColor = "#14b8a6";
          statusText = "DATA STAGED";
          break;
        case "exfiltrated":
          statusColor = "#0ea5e9";
          statusText = "EXFILTRATED";
          break;
        case "encrypted":
          statusColor = "#f43f5e";
          statusText = "LOCKED / CRYPT";
          break;
        default:
          statusColor = "#10b981";
          statusText = "NORMAL";
          break;
      }

      // Outer animated radar pulse ring for compromised / elevated / encrypted nodes
      if (node.status === "compromised" || node.status === "encrypted" || node.status === "elevated") {
        const pulseRatio = (timestamp * 0.002) % 1;
        ctx.strokeStyle = statusColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 1 - pulseRatio;
        ctx.beginPath();
        // Fix: pulse starts from the node radius (22) so it always starts at the
        // visible edge and expands outward — consistent with the drawn circle.
        ctx.arc(x, y, 22 + pulseRatio * 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // Node base circle — radius 22 matches hit-test radius exactly
      ctx.shadowColor = statusColor;
      ctx.shadowBlur = isHovered || isSelected ? 22 : 12;

      ctx.fillStyle = "#090d16";
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      // Border ring
      ctx.strokeStyle = statusColor;
      ctx.lineWidth = isHovered || isSelected ? 3 : 2;
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Icon emoji inside node
      ctx.font = "14px 'Segoe UI Emoji', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let icon = "💻";
      if (node.id === "attacker") icon = "💀";
      else if (node.id === "darkweb") icon = "🌐";
      else if (node.id === "firewall") icon = "🛡️";
      else if (node.id === "jumpbox") icon = "📟";
      else if (node.id === "domainController") icon = "🏛️";
      else if (node.id === "database") icon = "🗄️";
      else if (node.id === "exfilCloud") icon = "☁️";
      if (node.status === "encrypted") icon = "🔒";

      ctx.fillText(icon, x, y);

      // Node Title Label
      ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.fillStyle = "#e2e8f0";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(node.label, x, y + 27);

      // Status pill
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = statusColor;
      ctx.fillText(`[${statusText}]`, x, y + 42);
    }
  }
}
