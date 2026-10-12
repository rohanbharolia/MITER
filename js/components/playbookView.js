// MITRE ATT&CK Defense Playbook & Tactic Encyclopedia
// Provides comprehensive reference, D3FEND defensive mapping, and attack chain export

import { MITRE_TACTICS, MITRE_STATS } from "../data/mitreData.js";
import { soundFX } from "../utils/audioFx.js";

export class PlaybookView {
  constructor(containerElement) {
    this.container = containerElement;
    this.selectedTactic = MITRE_TACTICS[0];
    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = "";

    const playbook = document.createElement("div");
    playbook.className = "playbook-wrapper";

    playbook.innerHTML = `
      <div class="playbook-sidebar">
        <div class="sidebar-header">
          <h3>📚 14 Tactics Guide</h3>
          <p>Select a tactic for deep defense guidance</p>
        </div>
        <div class="tactic-nav-list">
          ${MITRE_TACTICS.map(t => `
            <button class="tactic-nav-item ${t.id === this.selectedTactic.id ? "active" : ""}" data-tactic-id="${t.id}" style="--nav-color: ${t.color}">
              <span class="nav-id">${t.id}</span>
              <span class="nav-name">${t.order}. ${t.name}</span>
            </button>
          `).join("")}
        </div>
        <div class="export-box">
          <button class="export-btn" id="btnExportMitreJson">
            📥 Export Attack Framework JSON
          </button>
        </div>
      </div>

      <div class="playbook-detail-panel" id="playbookDetailPanel">
        ${this.renderTacticDetail(this.selectedTactic)}
      </div>
    `;

    this.container.appendChild(playbook);

    // Attach click events on navigation
    const navItems = playbook.querySelectorAll(".tactic-nav-item");
    const detailPanel = playbook.querySelector("#playbookDetailPanel");

    navItems.forEach(item => {
      item.addEventListener("click", () => {
        const id = item.dataset.tacticId;
        const tactic = MITRE_TACTICS.find(t => t.id === id);
        if (tactic) {
          soundFX.playClick();
          this.selectedTactic = tactic;
          navItems.forEach(n => n.classList.remove("active"));
          item.classList.add("active");
          detailPanel.innerHTML = this.renderTacticDetail(tactic);
          this.attachDetailEvents(detailPanel, tactic);
        }
      });
    });

    // Export button
    playbook.querySelector("#btnExportMitreJson").addEventListener("click", () => {
      soundFX.playClick();
      this.exportJson();
    });

    this.attachDetailEvents(detailPanel, this.selectedTactic);
  }

  renderTacticDetail(tactic) {
    return `
      <div class="playbook-article">
        <div class="article-header" style="border-left: 4px solid ${tactic.color}">
          <div class="article-meta">
            <span class="pill-id" style="background: ${tactic.color}">${tactic.id}</span>
            <span class="pill-order">Tactic Phase #${tactic.order} of 14</span>
          </div>
          <h2 class="article-title">${tactic.name}</h2>
          <p class="article-goal"><strong>Adversary Objective:</strong> ${tactic.adversaryGoal}</p>
        </div>

        <div class="analogy-banner">
          <div class="analogy-icon">💡</div>
          <div class="analogy-content">
            <h4>Real-World Analogy</h4>
            <p>${tactic.analogy}</p>
          </div>
        </div>

        <div class="article-section">
          <h3>📖 Framework Context & Mechanics</h3>
          <p class="article-description">${tactic.description}</p>
        </div>

        <div class="article-section">
          <h3>⚔️ Red vs Blue Direct Confrontation</h3>
          <div class="red-blue-table">
            <div class="rb-card red">
              <div class="rb-title">🔴 Adversary Move</div>
              <p>${tactic.redVsBlue.redAction}</p>
            </div>
            <div class="rb-card blue">
              <div class="rb-title">🛡️ Defender Countermeasure</div>
              <p>${tactic.redVsBlue.blueCounter}</p>
            </div>
          </div>
        </div>

        <div class="article-section">
          <h3>🎯 Core Techniques & Detection Playbooks</h3>
          <div class="playbook-tech-grid">
            ${tactic.techniques.map(tech => `
              <div class="playbook-tech-card">
                <div class="tech-card-head">
                  <span class="tech-code">${tech.id}</span>
                  <h4>${tech.name}</h4>
                </div>
                <p class="tech-sub">${tech.subTechnique || "Core Technique"}</p>
                <div class="tech-block">
                  <strong>Adversary Execution:</strong>
                  <code>${tech.commandExample}</code>
                </div>
                <div class="tech-block detection">
                  <strong>Detection Logic (SIEM / EDR):</strong>
                  <p>${tech.detection}</p>
                </div>
                <div class="tech-block mitigation">
                  <strong>Mitigation Strategy:</strong>
                  <p>${tech.mitigation}</p>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }

  attachDetailEvents(panel, tactic) {
    // any dynamic controls in detail panel
  }

  exportJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(MITRE_TACTICS, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `mitre_attack_framework_14_tactics.json`);
    dlAnchorElem.click();
  }
}
