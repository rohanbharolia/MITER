// Interactive Red vs Blue Decision Lab
// Allows learners to make tactical choices, observe simulated outcomes, and test mitigations

import { MITRE_TACTICS } from "../data/mitreData.js";
import { soundFX } from "../utils/audioFx.js";

export const SIMULATION_SCENARIOS = [
  {
    id: "scen-initial-access",
    title: "Scenario 1: Breach The Perimeter",
    phase: "Initial Foothold Phase",
    adversaryGoal: "Bypass edge defenses and obtain execution on an internal corporate workstation.",
    briefing: "You are tasked with gaining initial access into Apex Global. The perimeter firewall has a strict IDS, but an HR recruiter's email was discovered on LinkedIn.",
    choices: [
      {
        id: "choice-phish",
        label: "Execute Spearphishing with Malicious ISO/LNK (T1566.001)",
        tactic: "TA0001 (Initial Access)",
        type: "adversary",
        outcome: "SUCCESSFUL BREACH! The HR user opened the ISO and double-clicked the disguised shortcut. An in-memory PowerShell beacon connected back to C2.",
        socReaction: "Blue Team Alert: Sysmon Event 1 shows explorer.exe spawning powershell.exe with -W Hidden parameters. Tier-1 analyst notified.",
        scoreDelta: { red: +40, detectionRisk: "HIGH" },
        learningTakeaway: "Adversaries use container files (ISO/VHD) to bypass Mark-of-the-Web (MOTW) and email gateway antivirus inspections."
      },
      {
        id: "choice-bruteforce",
        label: "Launch Password Spray against OWA Portal (T1110.003)",
        tactic: "TA0006 (Credential Access)",
        type: "adversary",
        outcome: "DETECTED & BLOCKED! High-volume authentication attempts triggered the Azure AD Smart Lockout threshold after 5 attempts.",
        socReaction: "Blue Team Alert: Automated conditional access blocked the source IP and alerted the Identity Operations Center.",
        scoreDelta: { red: +10, detectionRisk: "CRITICAL" },
        learningTakeaway: "Password spraying against modern identity providers without IP rotation is quickly caught by rate-limiting and behavioral anomaly detection."
      },
      {
        id: "choice-vpn-cve",
        label: "Exploit Unpatched Edge VPN CVE (T1190)",
        tactic: "TA0001 (Initial Access)",
        type: "adversary",
        outcome: "DIRECT COMPROMISE! An unpatched buffer overflow on the edge SSL-VPN appliance gives you root shell directly on the DMZ perimeter.",
        socReaction: "Blue Team Alert: WAF signature match for unauthenticated RCE attempt. Perimeter SOC alert triaged.",
        scoreDelta: { red: +50, detectionRisk: "MEDIUM" },
        learningTakeaway: "Edge appliances (VPNs, firewalls, load balancers) are prime high-value targets because they sit directly on the internet with administrative privileges."
      }
    ]
  },
  {
    id: "scen-credential-dumping",
    title: "Scenario 2: The Credential Crossroads",
    phase: "Internal Escalation Phase",
    adversaryGoal: "Harvest domain credentials to pivot from a local workstation to the Active Directory domain.",
    briefing: "You have local administrator access on PC-04. A domain administrator logged in 30 minutes ago. How do you harvest their authentication material?",
    choices: [
      {
        id: "choice-procdump-lsass",
        label: "Direct Memory Dump of LSASS.EXE with Procdump (T1003.001)",
        tactic: "TA0006 (Credential Access)",
        type: "adversary",
        outcome: "HASHES ACQUIRED, BUT TRIPPED EDR! Memory dumped to C:\\Temp\\lsass.dmp. Domain Admin NTLM hash extracted, but EDR raised high-priority alert.",
        socReaction: "Blue Team Alert: EDR triggered on PROCESS_VM_READ against lsass.exe. Automated SOAR playbook initiated.",
        scoreDelta: { red: +45, detectionRisk: "HIGH" },
        learningTakeaway: "LSASS dumping is one of the most heavily monitored behaviors in modern endpoint detection; RunAsPPL and Credential Guard effectively neutralize it."
      },
      {
        id: "choice-kerberoasting",
        label: "Execute Kerberoasting against Domain SPNs (T1558.003)",
        tactic: "TA0006 (Credential Access)",
        type: "adversary",
        outcome: "STEALTH EXTRACTION! You requested Kerberos TGS tickets for SQL service accounts and exported their RC4 hashes for offline cracking.",
        socReaction: "Blue Team: Normal-looking Kerberos ticket request (Event 4769). Blends with standard domain traffic unless Honey-SPNs are configured.",
        scoreDelta: { red: +55, detectionRisk: "LOW" },
        learningTakeaway: "Kerberoasting requires no elevated rights—any authenticated domain user can request service tickets and crack the passwords offline with Hashcat."
      },
      {
        id: "choice-passwords-files",
        label: "Search Network Shares for Unsecured Passwords (T1552.001)",
        tactic: "TA0006 (Credential Access)",
        type: "adversary",
        outcome: "FOUND CREDENTIALS IN CONFIG FILE! A script on \\\\fileshare\\scripts contained hardcoded backup administrator credentials in cleartext.",
        socReaction: "Blue Team: Normal SMB file read. Zero alerts triggered on standard file access.",
        scoreDelta: { red: +50, detectionRisk: "MINIMAL" },
        learningTakeaway: "Hardcoded credentials in scripts and config files remain one of the most common ways attackers move laterally without tripping security alarms."
      }
    ]
  },
  {
    id: "scen-incident-response",
    title: "Scenario 3: SOC War Room - Contain The Threat",
    phase: "Defensive Response Phase",
    adversaryGoal: "Blue Team Decision: How to neutralize the threat before ransomware encryption begins.",
    briefing: "The SOC has detected unauthorized Pass-the-Hash lateral movement from PC-04 to Domain Controller DC-01. As Incident Commander, what is your containment strategy?",
    choices: [
      {
        id: "choice-isolate-and-reset",
        label: "SOAR Automated Host Isolation & Domain-Wide Kerberos Krbtgt Reset",
        tactic: "Mitigation / D3FEND (Isolate Host + Invalidate Credentials)",
        type: "defender",
        outcome: "PERFECT CONTAINMENT! PC-04 severed at the NIC layer. Krbtgt ticket reset invalidated all forged Golden/Silver tickets. Adversary access terminated!",
        socReaction: "Ransomware detonation prevented. Attack chain broken between Lateral Movement (TA0008) and Impact (TA0040).",
        scoreDelta: { blue: +100, containment: "COMPLETE" },
        learningTakeaway: "Isolating compromised endpoints prevents C2 and lateral spread, while resetting Active Directory Krbtgt tickets invalidates all forged Kerberos access."
      },
      {
        id: "choice-reboot-hosts",
        label: "Instruct IT Helpdesk to Reboot Affected Workstations",
        tactic: "Flawed Defensive Action",
        type: "defender",
        outcome: "CATASTROPHIC FAILURE! The adversary had already planted persistent scheduled tasks (T1053) and services. At reboot, beacons respawned as SYSTEM.",
        socReaction: "Ransomware executed on schedule 15 minutes after reboot across all enterprise file shares.",
        scoreDelta: { blue: -60, containment: "FAILED" },
        learningTakeaway: "Simply rebooting machines does not kill persistent APT footholds (TA0003). Adversaries design autostart registry keys and services specifically for this."
      },
      {
        id: "choice-block-ip-only",
        label: "Block Attacker C2 IP Address on Perimeter Firewall",
        tactic: "Incomplete Mitigation",
        type: "defender",
        outcome: "PARTIAL DELAY ONLY. Attacker beacon seamlessly failed over to secondary DNS tunneling and fallback cloud C2 endpoints. Attack continued.",
        socReaction: "Adversary retains active shells on internal hosts; firewall block alone fails to remove internal foothold.",
        scoreDelta: { blue: +20, containment: "PARTIAL" },
        learningTakeaway: "Modern malware uses multi-channel resilient C2 (T1008 / T1071). You must eradicate the malicious processes and credentials on internal hosts."
      }
    ]
  }
];

export class SimulatorLab {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentScenarioIndex = 0;
    this.selectedChoice = null;
    this.score = { redWins: 0, blueWins: 0 };

    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = "";

    const scenario = SIMULATION_SCENARIOS[this.currentScenarioIndex];

    const labWrapper = document.createElement("div");
    labWrapper.className = "sim-lab-wrapper";

    labWrapper.innerHTML = `
      <div class="sim-header">
        <div class="sim-scenario-selector">
          ${SIMULATION_SCENARIOS.map((scen, idx) => `
            <button class="scen-tab-btn ${idx === this.currentScenarioIndex ? "active" : ""}" data-index="${idx}">
              ${scen.title.split(":")[0]}
            </button>
          `).join("")}
        </div>
        <div class="sim-score-board">
          <span class="score-pill red">🔴 Red Tactical Points: <strong id="redScoreVal">${this.score.redWins}</strong></span>
          <span class="score-pill blue">🛡️ Blue SOC Rating: <strong id="blueScoreVal">${this.score.blueWins}</strong></span>
        </div>
      </div>

      <div class="sim-card-body">
        <div class="sim-briefing-panel">
          <div class="sim-badge-row">
            <span class="sim-phase-badge">${scenario.phase}</span>
            <span class="sim-id-badge">${scenario.id}</span>
          </div>
          <h2 class="sim-title">${scenario.title}</h2>
          <p class="sim-briefing-text"><strong>Mission Briefing:</strong> ${scenario.briefing}</p>
          <div class="sim-goal-box">
            🎯 <strong>Objective:</strong> ${scenario.adversaryGoal}
          </div>
        </div>

        <div class="sim-choices-panel">
          <h3 class="panel-subtitle">⚡ Select Your Tactical Response:</h3>
          <div class="sim-options-list">
            ${scenario.choices.map((choice, cIdx) => `
              <div class="sim-choice-card" data-choice-index="${cIdx}">
                <div class="choice-top">
                  <span class="choice-letter">${String.fromCharCode(65 + cIdx)}</span>
                  <span class="choice-tactic-tag">${choice.tactic}</span>
                </div>
                <h4 class="choice-label">${choice.label}</h4>
              </div>
            `).join("")}
          </div>
        </div>

        <div id="simOutcomeContainer" class="sim-outcome-container hidden"></div>
      </div>
    `;

    this.container.appendChild(labWrapper);
    this.attachEvents(labWrapper, scenario);
  }

  attachEvents(wrapper, scenario) {
    // Scenario tabs
    const tabs = wrapper.querySelectorAll(".scen-tab-btn");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const idx = parseInt(tab.dataset.index, 10);
        if (idx !== this.currentScenarioIndex) {
          soundFX.playClick();
          this.currentScenarioIndex = idx;
          this.selectedChoice = null;
          this.render();
        }
      });
    });

    // Choices
    const choiceCards = wrapper.querySelectorAll(".sim-choice-card");
    const outcomeBox = wrapper.querySelector("#simOutcomeContainer");

    choiceCards.forEach(card => {
      card.addEventListener("click", () => {
        const cIdx = parseInt(card.dataset.choiceIndex, 10);
        const choice = scenario.choices[cIdx];

        choiceCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");

        // Fix: read scoring directly from the choice's scoreDelta object instead
        // of using brittle hardcoded ID string checks.  Each choice already
        // carries the correct values in the data.
        const delta = choice.scoreDelta || {};

        if (choice.type === "defender") {
          // Positive blue delta → success sound; negative → error sound
          if (typeof delta.blue === "number" && delta.blue > 0) {
            soundFX.playSuccess();
            this.score.blueWins += delta.blue;
          } else if (typeof delta.blue === "number" && delta.blue < 0) {
            soundFX.playError();
            this.score.blueWins = Math.max(0, this.score.blueWins + delta.blue);
          } else {
            soundFX.playClick();
          }
        } else {
          // Adversary choice — apply red score delta
          soundFX.playClick();
          if (typeof delta.red === "number") {
            this.score.redWins += delta.red;
          }
        }

        // Update score display
        wrapper.querySelector("#redScoreVal").textContent = this.score.redWins;
        wrapper.querySelector("#blueScoreVal").textContent = this.score.blueWins;

        // Reveal animated outcome box
        outcomeBox.classList.remove("hidden");
        outcomeBox.innerHTML = `
          <div class="outcome-header ${choice.type}">
            <h4>💥 Tactical Execution Result</h4>
            <span class="risk-badge">Risk: ${choice.scoreDelta.detectionRisk || choice.scoreDelta.containment || "ANALYZED"}</span>
          </div>
          <div class="outcome-content">
            <div class="outcome-box result">
              <strong>Outcome:</strong>
              <p>${choice.outcome}</p>
            </div>
            <div class="outcome-box soc">
              <strong>SOC Detection / Defense Telemetry:</strong>
              <p>${choice.socReaction}</p>
            </div>
            <div class="outcome-box takeaway">
              <strong>🎓 MITRE ATT&CK Educational Takeaway:</strong>
              <p>${choice.learningTakeaway}</p>
            </div>
          </div>
        `;
        outcomeBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
  }
}
