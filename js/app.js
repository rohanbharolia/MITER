// Main Application Bootstrap for MITRE ATT&CK Interactive Animation & Storytelling Platform

import { CAMPAIGN_STORY } from "./data/campaignData.js";
import { MITRE_TACTICS } from "./data/mitreData.js";
import { soundFX } from "./utils/audioFx.js";
import { NetworkCanvas } from "./components/networkCanvas.js";
import { StoryPlayer } from "./components/storyPlayer.js";
import { MatrixViewer } from "./components/matrixViewer.js";
import { SimulatorLab } from "./components/simulatorLab.js";
import { QuizArena } from "./components/quizArena.js";
import { PlaybookView } from "./components/playbookView.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Navigation Tab Switching
  const navTabs = document.querySelectorAll(".nav-tab");   // Fix: was ".main-nav-tab" (wrong class)
  const tabPanes = document.querySelectorAll(".tab-pane");

  navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.tab;
      soundFX.playClick();

      navTabs.forEach(t => t.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");

      // If switching back to story canvas, trigger resize
      if (targetId === "tab-story" && window.networkCanvasInstance) {
        setTimeout(() => window.networkCanvasInstance.resize(), 100);
      }
    });
  });

  // 2. Audio Toggle
  // Update only the text label, preserving the original SVG icon markup.
  const btnAudioToggle = document.getElementById("btnAudioToggle");
  const audioLabel = btnAudioToggle ? btnAudioToggle.querySelector(".btn-label") : null;
  if (btnAudioToggle) {
    btnAudioToggle.addEventListener("click", () => {
      const isEnabled = soundFX.toggle();
      // Update the text span only — do NOT replace innerHTML (that destroys the SVG icon)
      if (audioLabel) audioLabel.textContent = isEnabled ? "Sound On" : "Sound Off";
      btnAudioToggle.classList.toggle("muted", !isEnabled);
      btnAudioToggle.setAttribute("aria-pressed", String(!isEnabled));
      if (isEnabled) soundFX.playClick();
    });
  }

  // 3. Initialize Network Canvas
  const canvasElement = document.getElementById("cyberNetworkCanvas");
  let networkCanvas = null;

  const handleNodeClick = (node) => {
    // Show host node inspector drawer
    const drawer = document.getElementById("nodeInspectorDrawer");
    if (!drawer) return;

    drawer.classList.remove("hidden");
    document.getElementById("inspNodeTitle").textContent = `${node.label} (${node.role})`;
    document.getElementById("inspNodeStatus").textContent = `STATUS: ${node.status.toUpperCase()}`;
    document.getElementById("inspNodeRole").textContent = node.role;
    document.getElementById("inspNodeType").textContent = `Asset Category: ${node.type}`;

    // Sample telemetry
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

  // Close Node Inspector Drawer
  const btnCloseDrawer = document.getElementById("btnCloseNodeInspector");
  if (btnCloseDrawer) {
    btnCloseDrawer.addEventListener("click", () => {
      soundFX.playClick();
      document.getElementById("nodeInspectorDrawer").classList.add("hidden");
    });
  }

  // 4. Initialize Story Player
  const storyElements = {
    btnPlay: document.getElementById("btnPlayStory"),
    btnNext: document.getElementById("btnNextAct"),
    btnPrev: document.getElementById("btnPrevAct"),
    btnRestart: document.getElementById("btnRestartStory"),
    speedSelect: document.getElementById("storySpeedSelect"),
    timelineScrubber: document.getElementById("timelineScrubber"),
    progressBar: document.getElementById("storyProgressBar"),
    actBadge: document.getElementById("actBadge"),
    tacticName: document.getElementById("actTacticName"),
    tacticId: document.getElementById("actTacticId"),
    chapterTitle: document.getElementById("actChapterTitle"),
    storyNarrative: document.getElementById("actNarrativeText"),
    analogyBadge: document.getElementById("actAnalogyBadge"),
    analogyText: document.getElementById("actAnalogyText"),
    attackerPersp: document.getElementById("actAttackerPersp"),
    defenderPersp: document.getElementById("actDefenderPersp"),
    terminalOutput: document.getElementById("terminalOutput"),
    socAlertBox: document.getElementById("socAlertBox")
  };

  const storyPlayer = new StoryPlayer(networkCanvas, storyElements);

  // 5. Initialize Matrix Viewer
  const matrixContainer = document.getElementById("matrixBoardContainer");
  const modalElements = {
    backdrop: document.getElementById("techniqueModalBackdrop"),
    closeBtn: document.getElementById("btnCloseTechModal"),
    techId: document.getElementById("modalTechId"),
    techName: document.getElementById("modalTechName"),
    tacticPill: document.getElementById("modalTacticPill"),
    summary: document.getElementById("modalSummary"),
    adversaryUsage: document.getElementById("modalUsage"),
    commandSnippet: document.getElementById("modalCommandSnippet"),
    detection: document.getElementById("modalDetection"),
    mitigation: document.getElementById("modalMitigation"),
    diagramContainer: document.getElementById("modalDiagramContainer")
  };

  const matrixViewer = new MatrixViewer(matrixContainer, modalElements);

  // Matrix Search input
  const matrixSearchInput = document.getElementById("matrixSearchInput");
  if (matrixSearchInput) {
    matrixSearchInput.addEventListener("input", (e) => {
      matrixViewer.setSearch(e.target.value);
    });
  }

  // Matrix Tactic Filter Select
  const matrixTacticFilter = document.getElementById("matrixTacticFilter");
  if (matrixTacticFilter) {
    // Populate select options
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

  // 6. Initialize Simulator Lab
  const simContainer = document.getElementById("simulatorContainer");
  if (simContainer) {
    new SimulatorLab(simContainer);
  }

  // 7. Initialize Quiz & Attack Chain Arena
  const quizContainer = document.getElementById("quizArenaContainer");
  if (quizContainer) {
    new QuizArena(quizContainer);
  }

  // 8. Initialize Defense Playbook Encyclopedia
  const playbookContainer = document.getElementById("playbookContainer");
  if (playbookContainer) {
    new PlaybookView(playbookContainer);
  }
});
