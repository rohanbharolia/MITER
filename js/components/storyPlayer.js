// Interactive Story Player Controller for "Operation Apex Dawn"
// Manages playback, scrubbing, terminal streams, and adversary/defender perspective sync

import { CAMPAIGN_STORY } from "../data/campaignData.js";
import { MITRE_TACTICS } from "../data/mitreData.js";
import { soundFX } from "../utils/audioFx.js";
import { escapeHtml } from "../utils/helpers.js";
import { wrapJargon } from "../utils/glossary.js";

export class StoryPlayer {
  constructor(canvasInstance, elements) {
    this.canvas = canvasInstance;
    this.elements = elements;

    this.currentActIndex = 0;
    this.isPlaying = false;
    this.playSpeed = 1.0; // 0.5x, 1x, 2x
    this.timer = null;
    this.typewriterTimer = null;

    // Keep a reference to the bound keydown handler so we can remove it later
    this._keydownHandler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === "ArrowRight") {
        this.nextAct();
      } else if (e.code === "ArrowLeft") {
        this.prevAct();
      }
    };

    this.initControls();
    this.renderTimelineScrubber();
    this.loadAct(0);
  }

  initControls() {
    if (this.elements.btnPlay) {
      this.elements.btnPlay.addEventListener("click", () => this.togglePlay());
    }
    if (this.elements.btnNext) {
      this.elements.btnNext.addEventListener("click", () => {
        soundFX.playClick();
        this.nextAct();
      });
    }
    if (this.elements.btnPrev) {
      this.elements.btnPrev.addEventListener("click", () => {
        soundFX.playClick();
        this.prevAct();
      });
    }
    if (this.elements.btnRestart) {
      this.elements.btnRestart.addEventListener("click", () => {
        soundFX.playClick();
        this.loadAct(0);
      });
    }

    if (this.elements.speedSelect) {
      this.elements.speedSelect.addEventListener("change", (e) => {
        this.playSpeed = parseFloat(e.target.value) || 1.0;
        if (this.isPlaying) {
          this.pause();
          this.play();
        }
      });
    }

    // Keyboard shortcuts: Space for play/pause, Left/Right for steps.
    // Stored as a named method so destroy() can remove it properly.
    window.addEventListener("keydown", this._keydownHandler);
  }

  /**
   * Remove all window-level listeners added by this instance.
   * Call when tearing down the StoryPlayer.
   */
  destroy() {
    window.removeEventListener("keydown", this._keydownHandler);
    this.pause();
  }

  renderTimelineScrubber() {
    if (!this.elements.timelineScrubber) return;
    this.elements.timelineScrubber.innerHTML = "";

    CAMPAIGN_STORY.acts.forEach((act, idx) => {
      const stepBtn = document.createElement("button");
      stepBtn.className = "timeline-step-btn";
      stepBtn.dataset.index = idx;
      stepBtn.title = `${act.tacticName} (${act.tacticId})`;

      const tacticDef = MITRE_TACTICS.find(t => t.id === act.tacticId);
      const color = tacticDef ? tacticDef.color : "#38bdf8";

      stepBtn.innerHTML = `
        <span class="step-num">${idx + 1}</span>
        <span class="step-label">${act.tacticName.split(" ")[0]}</span>
      `;
      stepBtn.style.setProperty("--step-color", color);

      stepBtn.addEventListener("click", () => {
        soundFX.playClick();
        this.loadAct(idx);
      });

      this.elements.timelineScrubber.appendChild(stepBtn);
    });
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    soundFX.playClick();
    if (this.elements.btnPlay) {
      this.elements.btnPlay.innerHTML = `<span>⏸</span> Pause Story`;
      this.elements.btnPlay.classList.add("playing");
    }

    const duration = 6500 / this.playSpeed;
    this.timer = setInterval(() => {
      if (this.currentActIndex < CAMPAIGN_STORY.acts.length - 1) {
        this.loadAct(this.currentActIndex + 1);
      } else {
        this.pause();
      }
    }, duration);
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.elements.btnPlay) {
      this.elements.btnPlay.innerHTML = `<span>▶</span> Play Animation`;
      this.elements.btnPlay.classList.remove("playing");
    }
  }

  nextAct() {
    if (this.currentActIndex < CAMPAIGN_STORY.acts.length - 1) {
      this.loadAct(this.currentActIndex + 1);
    }
  }

  prevAct() {
    if (this.currentActIndex > 0) {
      this.loadAct(this.currentActIndex - 1);
    }
  }

  loadAct(index) {
    this.currentActIndex = index;
    const act = CAMPAIGN_STORY.acts[index];
    const tactic = MITRE_TACTICS.find(t => t.id === act.tacticId);

    // Fix: use tacticId "TA0040" (Impact) instead of the magic number actNumber === 14
    if (act.tacticId === "TA0040") {
      soundFX.playImpactAlarm();
    } else {
      soundFX.playTacticChange();
    }

    // 1. Update Timeline Scrubber active state
    if (this.elements.timelineScrubber) {
      const btns = this.elements.timelineScrubber.querySelectorAll(".timeline-step-btn");
      btns.forEach((btn, idx) => {
        btn.classList.toggle("active", idx === index);
        btn.classList.toggle("completed", idx < index);
      });
    }

    // 2. Update Progress Bar
    if (this.elements.progressBar) {
      const pct = ((index + 1) / CAMPAIGN_STORY.acts.length) * 100;
      this.elements.progressBar.style.width = `${pct}%`;
    }

    // 3. Update Header Banner and Badge
    if (this.elements.actBadge) {
      this.elements.actBadge.textContent = `ACT ${act.actNumber} OF 14`;
      this.elements.actBadge.style.background = tactic ? tactic.color : "#38bdf8";
    }
    if (this.elements.tacticName) {
      this.elements.tacticName.textContent = act.tacticName;
      if (tactic) this.elements.tacticName.style.color = tactic.color;
    }
    if (this.elements.tacticId) {
      this.elements.tacticId.textContent = `${act.tacticId} • ${act.techniqueId} (${act.techniqueName})`;
    }
    if (this.elements.chapterTitle) {
      this.elements.chapterTitle.textContent = act.chapterTitle;
    }

    // 4. Update Narrative & Analogy Card — wrap jargon terms for inline tooltips
    if (this.elements.storyNarrative) {
      this.elements.storyNarrative.innerHTML = wrapJargon(act.storyNarrative);
    }
    if (this.elements.analogyBadge) {
      this.elements.analogyBadge.textContent = `💡 Real-World Analogy: ${act.analogyBadge}`;
    }
    if (this.elements.analogyText) {
      this.elements.analogyText.textContent = act.analogyText;
    }

    // 5. Update Perspectives — wrap jargon in defender perspective
    if (this.elements.attackerPersp) {
      this.elements.attackerPersp.textContent = act.attackerPerspective;
    }
    if (this.elements.defenderPersp) {
      this.elements.defenderPersp.innerHTML = wrapJargon(act.defenderPerspective);
    }

    // 6. Terminal Output with Typewriter effect
    this.streamTerminalCommand(act.commandExecuted);

    // 7. SOC Telemetry Feed
    if (this.elements.socAlertBox) {
      const t = act.socTelemetry;

      // Fix: preserve the base "soc-card" class so CSS severity rules (.soc-card.severity-*)
      // continue to apply.
      this.elements.socAlertBox.className = `soc-card severity-${t.severity.toLowerCase()}`;

      // Severity badge label → plain English explanation
      const severityPlain = {
        "EMERGENCY": "🚨 Catastrophic — active ransomware or total breach. All hands on deck.",
        "CRITICAL":  "🔴 Immediate action needed — attacker is doing serious damage right now.",
        "HIGH":      "🟠 Urgent — a significant attack step just happened. Respond quickly.",
        "MEDIUM":    "🟡 Suspicious activity — investigate soon, may be early-stage attack.",
        "LOW":       "🔵 Low-level noise — worth logging, likely not an active threat.",
        "INFO":      "ℹ️ Informational only — baseline monitoring, no threat detected."
      };

      // Build the header (shared between both views)
      const headerHtml = `
        <div class="soc-header">
          <span class="severity-pill">${t.severity}</span>
          <span class="soc-code">${t.eventCode}</span>
          <span class="soc-time">${new Date().toLocaleTimeString()}</span>
          <button class="soc-toggle-btn" id="btnSocToggle" title="Switch between technical and plain English">
            🔍 Plain English
          </button>
        </div>
      `;

      this.elements.socAlertBox.innerHTML = headerHtml;

      // Technical message
      const msgEl = document.createElement("p");
      msgEl.className = "soc-message";
      msgEl.id = "socMessage";
      msgEl.innerHTML = wrapJargon(escapeHtml(t.message));
      this.elements.socAlertBox.appendChild(msgEl);

      // Plain-English message (hidden by default)
      const plainEl = document.createElement("p");
      plainEl.className = "soc-plain";
      plainEl.id = "socPlain";
      plainEl.style.display = "none";
      plainEl.textContent = severityPlain[t.severity] || t.message;
      this.elements.socAlertBox.appendChild(plainEl);

      // Action row
      const actionEl = document.createElement("p");
      actionEl.className = "soc-action";
      actionEl.id = "socAction";
      actionEl.innerHTML = `🛡️ <strong>SOC Playbook:</strong> ${escapeHtml(t.recommendedAction)}`;
      this.elements.socAlertBox.appendChild(actionEl);

      // Re-wire the toggle button (re-rendered each act)
      const toggleBtn = this.elements.socAlertBox.querySelector("#btnSocToggle");
      let socMode = "technical";
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          socMode = socMode === "technical" ? "plain" : "technical";
          if (socMode === "plain") {
            msgEl.style.display   = "none";
            plainEl.style.display = "block";
            toggleBtn.textContent = "⚙️ Technical View";
          } else {
            msgEl.style.display   = "block";
            plainEl.style.display = "none";
            toggleBtn.textContent = "🔍 Plain English";
          }
        });
      }

      if (t.severity === "CRITICAL" || t.severity === "EMERGENCY" || t.severity === "HIGH") {
        soundFX.playSocAlert();
      }
    }

    // 7b. Terminal caption — plain-English explanation of what the command does
    if (this.elements.terminalCaption) {
      if (act.commandCaption) {
        this.elements.terminalCaption.textContent = `💬 ${act.commandCaption}`;
        this.elements.terminalCaption.style.display = "block";
      } else {
        this.elements.terminalCaption.style.display = "none";
      }
    }

    // 8. Synchronize Canvas Node Statuses & Trigger Packet
    if (this.canvas) {
      // Re-apply cumulative node statuses up to this act
      this.resetCumulativeNodeStatuses(index);

      // Trigger the packet laser animation
      if (act.packetFlow) {
        this.canvas.triggerPacketFlow(act.packetFlow);
      }
    }
  }

  resetCumulativeNodeStatuses(targetIndex) {
    // Reset all nodes to base
    CAMPAIGN_STORY.nodes.forEach(n => {
      this.canvas.updateNodeStatus(n.id, n.status);
    });

    // Apply statuses up to current index
    for (let i = 0; i <= targetIndex; i++) {
      const act = CAMPAIGN_STORY.acts[i];
      if (act.nodeStatusUpdates) {
        Object.entries(act.nodeStatusUpdates).forEach(([nodeId, status]) => {
          this.canvas.updateNodeStatus(nodeId, status);
        });
      }
    }
  }

  streamTerminalCommand(commandText) {
    if (!this.elements.terminalOutput) return;

    // Fix: was clearInterval on a setTimeout handle — must use clearTimeout
    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }

    const lines = commandText.split("\n");
    let currentLineIdx = 0;
    this.elements.terminalOutput.innerHTML = "";

    const renderLine = () => {
      if (currentLineIdx >= lines.length) return;
      const line = lines[currentLineIdx];
      const lineDiv = document.createElement("div");
      lineDiv.className = "terminal-line";
      lineDiv.innerHTML = `<span class="prompt">phantom@hydra-c2:~$</span> <span class="cmd-text">${escapeHtml(line)}</span>`;
      this.elements.terminalOutput.appendChild(lineDiv);
      this.elements.terminalOutput.scrollTop = this.elements.terminalOutput.scrollHeight;
      currentLineIdx++;
      // Fix: use setTimeout (not setInterval) and track handle for proper clearTimeout
      this.typewriterTimer = setTimeout(renderLine, 350 / this.playSpeed);
    };

    renderLine();
  }
}
