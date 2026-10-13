// Main Application Bootstrap for MITRE ATT&CK Interactive Animation & Storytelling Platform

import { CAMPAIGN_STORY } from "./data/campaignData.js";
import { MITRE_TACTICS } from "./data/mitreData.js";
import { soundFX } from "./utils/audioFx.js";
import { GLOSSARY } from "./utils/glossary.js";
import { renderProgressDots, markComplete } from "./utils/progress.js";
import { NetworkCanvas } from "./components/networkCanvas.js";
import { StoryPlayer } from "./components/storyPlayer.js";
import { MatrixViewer } from "./components/matrixViewer.js";
import { SimulatorLab } from "./components/simulatorLab.js";
import { QuizArena } from "./components/quizArena.js";
import { PlaybookView } from "./components/playbookView.js";

document.addEventListener("DOMContentLoaded", () => {

  // ─────────────────────────────────────────────────────────
  // 0. ONBOARDING MODAL
  // ─────────────────────────────────────────────────────────
  const onboardingModal = document.getElementById("onboardingModal");
  const btnStartLearning = document.getElementById("btnStartLearning");
  const onboardDontShow = document.getElementById("onboardDontShow");
  const btnShowHelp = document.getElementById("btnShowHelp");

  function showOnboarding() {
    if (onboardingModal) onboardingModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
  function hideOnboarding() {
    if (onboardingModal) onboardingModal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  // Show on first visit unless user opted out
  if (!localStorage.getItem("mitre_onboard_dismissed")) {
    showOnboarding();
  }

  if (btnStartLearning) {
    btnStartLearning.addEventListener("click", () => {
      if (onboardDontShow && onboardDontShow.checked) {
        localStorage.setItem("mitre_onboard_dismissed", "1");
      }
      hideOnboarding();
      soundFX.playClick();
    });
  }

  // Re-open via the ? button in the header
  if (btnShowHelp) {
    btnShowHelp.addEventListener("click", () => {
      soundFX.playClick();
      showOnboarding();
    });
  }

  // ─────────────────────────────────────────────────────────
  // 1. NAVIGATION TAB SWITCHING
  // ─────────────────────────────────────────────────────────
  const navTabs = document.querySelectorAll(".nav-tab");   // Fix: was ".main-nav-tab"
  const tabPanes = document.querySelectorAll(".tab-pane");

  // Map tab IDs to progress mode keys
  const tabToMode = {
    "tab-story": "story",
    "tab-matrix": "matrix",
    "tab-simulator": "simulator",
    "tab-arena": "quiz",
    "tab-playbook": "playbook"
  };

  navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.tab;
      soundFX.playClick();

      navTabs.forEach(t => t.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");

      // Mark the mode as visited (partial completion)
      const mode = tabToMode[targetId];
      if (mode) markComplete(mode);

      // If switching back to story canvas, trigger resize
      if (targetId === "tab-story" && window.networkCanvasInstance) {
        setTimeout(() => window.networkCanvasInstance.resize(), 100);
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // 2. AUDIO TOGGLE
  // ─────────────────────────────────────────────────────────
  const btnAudioToggle = document.getElementById("btnAudioToggle");
  const audioLabel = btnAudioToggle ? btnAudioToggle.querySelector(".btn-label") : null;
  if (btnAudioToggle) {
    btnAudioToggle.addEventListener("click", () => {
      const isEnabled = soundFX.toggle();
      if (audioLabel) audioLabel.textContent = isEnabled ? "Sound On" : "Sound Off";
      btnAudioToggle.classList.toggle("muted", !isEnabled);
      btnAudioToggle.setAttribute("aria-pressed", String(!isEnabled));
      if (isEnabled) soundFX.playClick();
    });
  }

  // ─────────────────────────────────────────────────────────
  // 3. INITIALIZE NETWORK CANVAS
  // ─────────────────────────────────────────────────────────
  const canvasElement = document.getElementById("cyberNetworkCanvas");
  let networkCanvas = null;

  const handleNodeClick = (node) => {
    const drawer = document.getElementById("nodeInspectorDrawer");
    if (!drawer) return;

    drawer.classList.remove("hidden");
    document.getElementById("inspNodeTitle").textContent = `${node.label} (${node.role})`;
    document.getElementById("inspNodeStatus").textContent = `STATUS: ${node.status.toUpperCase()}`;
    document.getElementById("inspNodeRole").textContent = node.role;
    document.getElementById("inspNodeType").textContent = `Asset Category: ${node.type}`;

    const ip = node.id === "attacker" ? "185.220.101.5 (Offshore Tor Exit)" :
               node.id === "firewall" ? "198.51.100.1 (Perimeter Gateway)" :
               node.id === "workstation" ? "10.0.3.45 (VLAN 30 - Workstations)" :
               node.id === "domainController" ? "10.0.1.10 (VLAN 10 - Server Core)" :
               node.id === "database" ? "10.0.2.50 (VLAN 20 - Data Tier)" : "Cloud SaaS";
    document.getElementById("inspNodeIp").textContent = `IP / Subnet: ${ip}`;
  };

  if (canvasElement) {
    networkCanvas = new NetworkCanvas(canvasElement, handleNodeClick);
    networkCanvas.setNodes(CAMPAIGN_STORY.nodes);
    networkCanvas.start();
    window.networkCanvasInstance = networkCanvas;
  }

  const btnCloseDrawer = document.getElementById("btnCloseNodeInspector");
  if (btnCloseDrawer) {
    btnCloseDrawer.addEventListener("click", () => {
      soundFX.playClick();
      document.getElementById("nodeInspectorDrawer").classList.add("hidden");
    });
  }

  // ─────────────────────────────────────────────────────────
  // 4. SOC PLAIN-ENGLISH TOGGLE
  // ─────────────────────────────────────────────────────────
  const btnSocToggle = document.getElementById("btnSocToggle");
  let socMode = "technical"; // "technical" | "plain"

  if (btnSocToggle) {
    btnSocToggle.addEventListener("click", () => {
      socMode = socMode === "technical" ? "plain" : "technical";
      const msgEl    = document.getElementById("socMessage");
      const plainEl  = document.getElementById("socPlain");
      if (msgEl && plainEl) {
        if (socMode === "plain") {
          msgEl.style.display   = "none";
          plainEl.style.display = "block";
          btnSocToggle.textContent = "⚙️ Technical View";
        } else {
          msgEl.style.display   = "block";
          plainEl.style.display = "none";
          btnSocToggle.textContent = "🔍 Plain English";
        }
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // 5. INITIALIZE STORY PLAYER
  // ─────────────────────────────────────────────────────────
  const storyElements = {
    btnPlay:        document.getElementById("btnPlayStory"),
    btnNext:        document.getElementById("btnNextAct"),
    btnPrev:        document.getElementById("btnPrevAct"),
    btnRestart:     document.getElementById("btnRestartStory"),
    speedSelect:    document.getElementById("storySpeedSelect"),
    timelineScrubber: document.getElementById("timelineScrubber"),
    progressBar:    document.getElementById("storyProgressBar"),
    actBadge:       document.getElementById("actBadge"),
    tacticName:     document.getElementById("actTacticName"),
    tacticId:       document.getElementById("actTacticId"),
    chapterTitle:   document.getElementById("actChapterTitle"),
    storyNarrative: document.getElementById("actNarrativeText"),
    analogyBadge:   document.getElementById("actAnalogyBadge"),
    analogyText:    document.getElementById("actAnalogyText"),
    attackerPersp:  document.getElementById("actAttackerPersp"),
    defenderPersp:  document.getElementById("actDefenderPersp"),
    terminalOutput: document.getElementById("terminalOutput"),
    terminalCaption: document.getElementById("terminalCaption"),
    socAlertBox:    document.getElementById("socAlertBox"),
    socMessage:     document.getElementById("socMessage"),
    socPlain:       document.getElementById("socPlain"),
    socAction:      document.getElementById("socAction")
  };

  const storyPlayer = new StoryPlayer(networkCanvas, storyElements);

  // ─────────────────────────────────────────────────────────
  // 6. INITIALIZE MATRIX VIEWER
  // ─────────────────────────────────────────────────────────
  const matrixContainer = document.getElementById("matrixBoardContainer");
  const modalElements = {
    backdrop:        document.getElementById("techniqueModalBackdrop"),
    closeBtn:        document.getElementById("btnCloseTechModal"),
    techId:          document.getElementById("modalTechId"),
    techName:        document.getElementById("modalTechName"),
    tacticPill:      document.getElementById("modalTacticPill"),
    summary:         document.getElementById("modalSummary"),
    adversaryUsage:  document.getElementById("modalUsage"),
    commandSnippet:  document.getElementById("modalCommandSnippet"),
    detection:       document.getElementById("modalDetection"),
    mitigation:      document.getElementById("modalMitigation"),
    diagramContainer: document.getElementById("modalDiagramContainer")
  };

  const matrixViewer = new MatrixViewer(matrixContainer, modalElements);

  const matrixSearchInput = document.getElementById("matrixSearchInput");
  if (matrixSearchInput) {
    matrixSearchInput.addEventListener("input", (e) => {
      matrixViewer.setSearch(e.target.value);
    });
  }

  const matrixTacticFilter = document.getElementById("matrixTacticFilter");
  if (matrixTacticFilter) {
    MITRE_TACTICS.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.order}. ${t.name} (${t.id})`;
      matrixTacticFilter.appendChild(opt);
    });
    matrixTacticFilter.addEventListener("change", (e) => {
      soundFX.playClick();
      matrixViewer.setFilter(e.target.value);
    });
  }

  // ─────────────────────────────────────────────────────────
  // 7. INITIALIZE SIMULATOR, QUIZ, PLAYBOOK
  // ─────────────────────────────────────────────────────────
  const simContainer = document.getElementById("simulatorContainer");
  if (simContainer) new SimulatorLab(simContainer);

  const quizContainer = document.getElementById("quizArenaContainer");
  if (quizContainer) new QuizArena(quizContainer);

  const playbookContainer = document.getElementById("playbookContainer");
  if (playbookContainer) new PlaybookView(playbookContainer);

  // ─────────────────────────────────────────────────────────
  // 8. PROGRESS DOTS — render on startup
  // ─────────────────────────────────────────────────────────
  renderProgressDots();
  // Always mark story as started (user is on it by default)
  markComplete("story");

  // ─────────────────────────────────────────────────────────
  // 9. GLOSSARY JARGON TOOLTIPS
  // ─────────────────────────────────────────────────────────
  const tooltip = document.getElementById("jargonTooltip");
  const tooltipTerm = document.getElementById("jargonTerm");
  const tooltipDef  = document.getElementById("jargonDef");
  let tooltipHideTimer = null;

  function showTooltip(el) {
    const term = el.dataset.term;
    const def  = GLOSSARY[term];
    if (!def || !tooltip) return;

    clearTimeout(tooltipHideTimer);
    tooltipTerm.textContent = term.toUpperCase();
    tooltipDef.textContent  = def;
    tooltip.classList.remove("hidden");

    // Position the tooltip near the hovered element
    const rect = el.getBoundingClientRect();
    const ttW  = 260;
    let left   = rect.left + window.scrollX;
    let top    = rect.bottom + window.scrollY + 6;

    // Keep inside viewport
    if (left + ttW > window.innerWidth) left = window.innerWidth - ttW - 12;
    if (left < 8) left = 8;

    tooltip.style.left = `${left}px`;
    tooltip.style.top  = `${top}px`;
  }

  function hideTooltip() {
    tooltipHideTimer = setTimeout(() => {
      if (tooltip) tooltip.classList.add("hidden");
    }, 120);
  }

  // Use event delegation — tooltips work on any .jargon-term added dynamically
  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest(".jargon-term");
    if (el) showTooltip(el);
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(".jargon-term")) hideTooltip();
  });
  // Keep tooltip open when hovering the tooltip itself
  if (tooltip) {
    tooltip.addEventListener("mouseover", () => clearTimeout(tooltipHideTimer));
    tooltip.addEventListener("mouseout", hideTooltip);
  }
});
