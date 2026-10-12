# MITRE ATT&CK Interactive Storytelling & Animation Platform

An interactive, visual, animated cybersecurity learning platform designed to demystify and simplify the entire **MITRE ATT&CK Enterprise Matrix (all 14 Tactics & Core Techniques)**.

---

## 🚀 Key Features

### 1. 🎬 Story Mode: "Operation Apex Dawn" (14-Act Cyber Saga)
- **Chronological Attack Kill-Chain**: An end-to-end animated campaign tracing threat group **PHANTOM HYDRA (APT-94)** infiltrating **Apex Global Financial Corp**.
- **Interactive Scrubber & Timeline**: Scrub through all 14 MITRE tactics from *Reconnaissance (TA0043)* to *Impact (TA0040)*.
- **Live Infrastructure Canvas**: Real-time animated network topology with dynamic packet trails, glowing data beams, and compromised node states (Active, Probed, Compromised, Persisted, Elevated, Discovered, Staged, Exfiltrated, Encrypted).
- **Dual Perspectives HUD**: Side-by-side view of **Adversary Mindset** ("Why they chose this move") vs. **SOC Telemetry** ("What the SIEM/EDR alerted on").
- **Real-World Analogies**: ELI5 physical analogies for each tactic (e.g., *Casing the house*, *Buzzing the intercom*, *Stealing the manager's master keyring*, *Wiping fingerprints*, *Blowing up the vault*).
- **Live Command Console**: Authentic PowerShell, Bash, and CMD command typewriter streams.

### 2. 🗺️ MITRE ATT&CK Matrix Explorer & Technique Inspector
- **14-Tactic Visual Board**: Horizontal matrix grid featuring all 14 Enterprise tactics.
- **Real-Time Search & Filters**: Search by technique ID (`T1566`, `T1003`, `T1055`), name (`LSASS`, `Phishing`, `Kerberoasting`, `Ransomware`), or tactic.
- **Technique Deep-Dive Modal**:
  - Animated visual mechanics diagrams (step-by-step visual workflow).
  - Authentic execution commands.
  - SIEM / EDR detection signatures and Event IDs (Sysmon Event 1, 8, 10; Windows Event 4624, 4698, 1102).
  - Hardening and mitigation controls (D3FEND, CIS Benchmarks, Credential Guard, LSA Protection).

### 3. 🎮 Interactive Simulation Lab (Red vs. Blue)
- Branching scenario simulator where learners make tactical decisions at key crossroads:
  - **Scenario 1**: Breach the Perimeter (Spearphishing vs Password Spray vs Edge CVE)
  - **Scenario 2**: Credential Crossroads (LSASS Dump vs Kerberoasting vs Unsecured Configs)
  - **Scenario 3**: SOC War Room (Automated Host Isolation vs System Reboot vs IP Blocking)
- Immediate interactive consequences, telemetry generation, and MITRE educational takeaways.

### 4. 🧩 Attack Chain Arena & Knowledge Quiz
- **Assemble The Attack Chain**: Interactive sequencing puzzle where learners reconstruct the chronological kill chain.
- **Scenario Knowledge Quizzes**: Multiple-choice scenario identification challenges with immediate scoring, streaks, and technical explanations.

### 5. 📚 Defense Playbook & MITRE Encyclopedia
- Detailed reference guide across all 14 tactics.
- Red vs. Blue direct confrontation tables.
- **Export to JSON**: One-click export of the entire MITRE ATT&CK dataset.

---

## 🛠️ Tech Stack & Architecture

- **Vanilla HTML5 & CSS3**: Pure custom cyber design system with dark mode, glowing neon accents, and smooth transitions.
- **HTML5 Canvas Visualizer**: High-performance HiDPI network topology with dynamic particle systems and bezier packet trails.
- **Web Audio API Sound Engine**: In-browser procedural sound synthesizer for clicks, pulses, alerts, and alarm drones (no external MP3/WAV files required).
- **ES6 JavaScript Modules**: Clean separation of data, components, and controllers.

---

## 🌐 Running Locally

The local server is already running on port **8080**:
```bash
# To access in your browser:
http://localhost:8080
```
Or start anytime with:
```bash
python -m http.server 8080
```
