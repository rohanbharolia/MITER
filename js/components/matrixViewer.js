// Interactive MITRE ATT&CK Matrix Explorer & Technique Inspector
// Renders the 14-tactic grid, real-time search filtering, and animated technique mechanics modal

import { MITRE_TACTICS } from "../data/mitreData.js";   // MITRE_STATS removed — unused import
import { soundFX } from "../utils/audioFx.js";
import { escapeHtml } from "../utils/helpers.js";        // shared utility — no local duplicate needed

export class MatrixViewer {
  constructor(containerElement, modalElements) {
    this.container = containerElement;
    this.modal = modalElements;
    this.currentFilter = "ALL";
    this.searchQuery = "";

    // Store as a named method so destroy() can remove it without leaking
    this._escHandler = (e) => {
      if (e.key === "Escape" && this.modal.backdrop && !this.modal.backdrop.classList.contains("hidden")) {
        this.closeModal();
      }
    };

    this.initModalEvents();
    this.render();
  }

  initModalEvents() {
    if (this.modal.closeBtn) {
      this.modal.closeBtn.addEventListener("click", () => {
        soundFX.playClick();
        this.closeModal();
      });
    }

    if (this.modal.backdrop) {
      this.modal.backdrop.addEventListener("click", (e) => {
        if (e.target === this.modal.backdrop) {
          this.closeModal();
        }
      });
    }

    window.addEventListener("keydown", this._escHandler);
  }

  /** Remove the window-level Escape listener. Call when tearing down this viewer. */
  destroy() {
    window.removeEventListener("keydown", this._escHandler);
  }

  setFilter(tacticId) {
    this.currentFilter = tacticId;
    this.render();
  }

  setSearch(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = "";

    // Filter tactics based on selected category or search query
    const filteredTactics = MITRE_TACTICS.filter(tactic => {
      if (this.currentFilter !== "ALL" && tactic.id !== this.currentFilter) {
        return false;
      }

      if (!this.searchQuery) return true;

      const matchesTactic = tactic.name.toLowerCase().includes(this.searchQuery) ||
                            tactic.id.toLowerCase().includes(this.searchQuery) ||
                            tactic.description.toLowerCase().includes(this.searchQuery);

      const matchesTech = tactic.techniques.some(tech => 
        tech.name.toLowerCase().includes(this.searchQuery) ||
        tech.id.toLowerCase().includes(this.searchQuery) ||
        tech.summary.toLowerCase().includes(this.searchQuery) ||
        tech.adversaryUsage.toLowerCase().includes(this.searchQuery)
      );

      return matchesTactic || matchesTech;
    });

    if (filteredTactics.length === 0) {
      this.container.innerHTML = `
        <div class="empty-results-box">
          <span class="icon">🔍</span>
          <h3>No MITRE Tactics or Techniques match "${escapeHtml(this.searchQuery)}"</h3>
          <p>Try searching for terms like <code>phishing</code>, <code>lsass</code>, <code>powershell</code>, <code>kerberos</code>, or <code>ransomware</code>.</p>
        </div>
      `;
      return;
    }

    const grid = document.createElement("div");
    grid.className = "matrix-grid";

    filteredTactics.forEach(tactic => {
      const col = document.createElement("div");
      col.className = "matrix-column";
      col.style.setProperty("--tactic-color", tactic.color);

      // Tactic Header Card
      const header = document.createElement("div");
      header.className = "tactic-col-header";
      header.innerHTML = `
        <div class="tactic-top-row">
          <span class="tactic-id-badge">${tactic.id}</span>
          <span class="order-badge">Tactic #${tactic.order}</span>
        </div>
        <h3 class="tactic-title">${tactic.name}</h3>
        <p class="tactic-goal">${tactic.adversaryGoal}</p>
        <div class="analogy-pill" title="${tactic.analogy}">
          💡 <span>${tactic.analogy}</span>
        </div>
      `;

      col.appendChild(header);

      // Techniques Container
      const techList = document.createElement("div");
      techList.className = "techniques-list";

      tactic.techniques.forEach(tech => {
        const isMatch = !this.searchQuery || 
          tech.name.toLowerCase().includes(this.searchQuery) ||
          tech.id.toLowerCase().includes(this.searchQuery) ||
          tech.summary.toLowerCase().includes(this.searchQuery);

        const card = document.createElement("div");
        // Fix: when no search is active every card is fully visible (no modifier
        // class).  When searching, matched cards get "highlight" (defined in CSS)
        // and unmatched get "dimmed" (opacity 0.3).  Previously "highlight" was
        // applied unconditionally when there was no search, but it had no CSS
        // rule — cards were effectively unstyled by accident.
        let cardClass = "technique-card";
        if (this.searchQuery) {
          cardClass += isMatch ? " highlight" : " dimmed";
        }
        card.className = cardClass;
        card.innerHTML = `
          <div class="tech-header">
            <span class="tech-id">${tech.id}</span>
            <span class="tech-view-hint">Inspect ↗</span>
          </div>
          <h4 class="tech-name">${tech.name}</h4>
          <p class="tech-summary">${tech.summary}</p>
        `;

        card.addEventListener("click", () => {
          soundFX.playClick();
          this.openTechniqueModal(tech, tactic);
        });

        techList.appendChild(card);
      });

      col.appendChild(techList);
      grid.appendChild(col);
    });

    this.container.appendChild(grid);
  }

  openTechniqueModal(tech, tactic) {
    if (!this.modal.backdrop) return;

    soundFX.playTacticChange();

    // Populate modal contents
    if (this.modal.techId) this.modal.techId.textContent = `${tech.id} • ${tech.subTechnique || "Core Technique"}`;
    if (this.modal.techName) this.modal.techName.textContent = tech.name;
    if (this.modal.tacticPill) {
      this.modal.tacticPill.textContent = `${tactic.name} (${tactic.id})`;
      this.modal.tacticPill.style.background = tactic.color;
    }
    if (this.modal.summary) this.modal.summary.textContent = tech.summary;
    if (this.modal.adversaryUsage) this.modal.adversaryUsage.textContent = tech.adversaryUsage;
    if (this.modal.commandSnippet) this.modal.commandSnippet.textContent = tech.commandExample;
    if (this.modal.detection) this.modal.detection.textContent = tech.detection;
    if (this.modal.mitigation) this.modal.mitigation.textContent = tech.mitigation;

    // Render animated visual mechanics diagram for the technique
    this.renderMechanicsDiagram(tech);

    this.modal.backdrop.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  renderMechanicsDiagram(tech) {
    if (!this.modal.diagramContainer) return;
    this.modal.diagramContainer.innerHTML = "";

    // Generate tailored interactive visual flow diagrams for specific technique types
    let diagramHtml = "";
    if (tech.id === "T1566") {
      // Phishing diagram
      diagramHtml = `
        <div class="tech-flow-diagram">
          <div class="flow-step step-red">
            <span class="flow-icon">📧</span>
            <strong>1. Attacker Sends Lure</strong>
            <p>Spoofed sender email with weaponized ISO/ZIP</p>
          </div>
          <div class="flow-arrow">➔</div>
          <div class="flow-step step-yellow">
            <span class="flow-icon">🧑‍💼</span>
            <strong>2. User Interaction</strong>
            <p>Victim opens attachment & runs payload shortcut</p>
          </div>
          <div class="flow-arrow">➔</div>
          <div class="flow-step step-blue">
            <span class="flow-icon">⚡</span>
            <strong>3. In-Memory Beacon</strong>
            <p>PowerShell connects back to C2 without touching disk</p>
          </div>
        </div>
      `;
    } else if (tech.id === "T1003") {
      // LSASS Credential Dumping diagram
      diagramHtml = `
        <div class="tech-flow-diagram">
          <div class="flow-step step-red">
            <span class="flow-icon">🔑</span>
            <strong>1. SYSTEM Privilege</strong>
            <p>Attacker elevates to SYSTEM or Debug privileges</p>
          </div>
          <div class="flow-arrow">➔</div>
          <div class="flow-step step-yellow">
            <span class="flow-icon">🧠</span>
            <strong>2. Read LSASS.EXE</strong>
            <p>Procdump / MiniDump API reads process memory</p>
          </div>
          <div class="flow-arrow">➔</div>
          <div class="flow-step step-blue">
            <span class="flow-icon">🔓</span>
            <strong>3. Hash Extraction</strong>
            <p>Kerberos tickets and Domain Admin NTLM hashes stolen</p>
          </div>
        </div>
      `;
    } else if (tech.id === "T1055") {
      // Process Injection diagram
      diagramHtml = `
        <div class="tech-flow-diagram">
          <div class="flow-step step-red">
            <span class="flow-icon">💉</span>
            <strong>1. Target Process</strong>
            <p>Locates legitimate process (e.g. spoolsv, explorer)</p>
          </div>
          <div class="flow-arrow">➔</div>
          <div class="flow-step step-yellow">
            <span class="flow-icon">💾</span>
            <strong>2. VirtualAllocEx</strong>
            <p>Allocates RWX memory space inside remote process</p>
          </div>
          <div class="flow-arrow">➔</div>
          <div class="flow-step step-blue">
            <span class="flow-icon">👻</span>
            <strong>3. Remote Thread</strong>
            <p>CreateRemoteThread executes stealth shellcode</p>
          </div>
        </div>
      `;
    } else if (tech.id === "T1486") {
      // Data Encrypted for Impact
      diagramHtml = `
        <div class="tech-flow-diagram">
          <div class="flow-step step-red">
            <span class="flow-icon">🛑</span>
            <strong>1. Neutralize Recovery</strong>
            <p>Wipes Volume Shadow Copies & terminates SQL/Exchange</p>
          </div>
          <div class="flow-arrow">➔</div>
          <div class="flow-step step-yellow">
            <span class="flow-icon">🔐</span>
            <strong>2. Rapid AES Encryption</strong>
            <p>High-speed multi-threaded encryption of all file shares</p>
          </div>
          <div class="flow-arrow">➔</div>
          <div class="flow-step step-blue">
            <span class="flow-icon">📄</span>
            <strong>3. Extortion Note</strong>
            <p>Drops README ransom note with Tor extortion link</p>
          </div>
        </div>
      `;
    } else {
      // Generic high-yield attack chain diagram
      diagramHtml = `
        <div class="tech-flow-diagram">
          <div class="flow-step step-red">
            <span class="flow-icon">🎯</span>
            <strong>1. Adversary Action</strong>
            <p>Executes ${tech.name} against target asset</p>
          </div>
          <div class="flow-arrow">➔</div>
          <div class="flow-step step-yellow">
            <span class="flow-icon">🛡️</span>
            <strong>2. Security Telemetry</strong>
            <p>Generates host or network detection signals</p>
          </div>
          <div class="flow-arrow">➔</div>
          <div class="flow-step step-blue">
            <span class="flow-icon">🔒</span>
            <strong>3. SOC Countermeasure</strong>
            <p>Hardening & defensive controls block or isolate</p>
          </div>
        </div>
      `;
    }

    this.modal.diagramContainer.innerHTML = diagramHtml;
  }

  closeModal() {
    if (!this.modal.backdrop) return;
    this.modal.backdrop.classList.add("hidden");
    document.body.style.overflow = "auto";
  }
}
