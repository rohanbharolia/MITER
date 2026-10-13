// Interactive MITRE Knowledge Arena & Attack Chain Challenge
// Includes "Assemble The Attack Chain" sequence puzzle and scenario identification quizzes

import { MITRE_TACTICS } from "../data/mitreData.js";
import { soundFX } from "../utils/audioFx.js";

const QUIZ_QUESTIONS = [
  {
    id: "q1",
    difficulty: "intermediate",
    difficultyLabel: "🟡 Intermediate",
    scenario: "A threat actor utilizes `rundll32.exe C:\\windows\\system32\\comsvcs.dll, MiniDump` against process ID 684 (lsass.exe). What is their primary tactical objective?",
    options: [
      { text: "TA0006: Credential Access (Dump plaintext tokens and password hashes)", correct: true },
      { text: "TA0001: Initial Access (Breach perimeter network)", correct: false },
      { text: "TA0005: Defense Evasion (Blind antivirus scanning engine)", correct: false },
      { text: "TA0040: Impact (Encrypt host storage drives)", correct: false }
    ],
    explanation: "Minidumping the LSASS process extracts cached NTLM hashes, Kerberos tickets, and credentials from memory, representing Credential Access (TA0006, T1003.001). LSASS is where Windows stores passwords of currently logged-in users."
  },
  {
    id: "q2",
    difficulty: "beginner",
    difficultyLabel: "🟢 Beginner",
    scenario: "An employee receives an email titled 'Urgent Payroll Update' containing a password-protected zip file with an LNK shortcut pointing to PowerShell. Which Initial Access technique is this?",
    options: [
      { text: "T1190: Exploit Public-Facing Application", correct: false },
      { text: "T1566.001: Spearphishing Attachment", correct: true },
      { text: "T1078: Valid Accounts", correct: false },
      { text: "T1133: External Remote Services", correct: false }
    ],
    explanation: "Sending deceptive emails with weaponized attachments (ZIP, ISO, PDF, Office documents) is Spearphishing Attachment (T1566.001 under Initial Access TA0001). This is the #1 way attackers get their first foothold in an organisation."
  },
  {
    id: "q3",
    difficulty: "beginner",
    difficultyLabel: "🟢 Beginner",
    scenario: "After compromising an HR desktop, the adversary creates a recurring task via `schtasks.exe` to run a beacon every 60 minutes as SYSTEM. Why do they do this?",
    options: [
      { text: "To increase network bandwidth speed", correct: false },
      { text: "Persistence (TA0003): Maintain their foothold across system reboots", correct: true },
      { text: "Exfiltration (TA0010): Send data to cloud repositories", correct: false },
      { text: "Discovery (TA0007): Query domain controller LDAP records", correct: false }
    ],
    explanation: "Scheduled tasks (T1053) ensure that even if the victim restarts their computer, the malware automatically restarts. This is called Persistence (TA0003) — ensuring the attacker can't be locked out by a simple reboot."
  },
  {
    id: "q4",
    difficulty: "intermediate",
    difficultyLabel: "🟡 Intermediate",
    scenario: "The attacker reuses an extracted NTLM password hash to connect to a remote server over port 445 (SMB) without needing the plaintext password. What technique is this?",
    options: [
      { text: "T1550.002: Pass-the-Hash (PtH) under Lateral Movement", correct: true },
      { text: "T1486: Data Encrypted for Impact", correct: false },
      { text: "T1562: Impair Defenses", correct: false },
      { text: "T1046: Network Service Discovery", correct: false }
    ],
    explanation: "Pass-the-Hash (T1550.002) allows attackers to authenticate to remote services using stolen NTLM hashes — they never need to know the actual password. This enables Lateral Movement (TA0008) to spread across internal machines."
  },
  {
    id: "q5",
    difficulty: "advanced",
    difficultyLabel: "🔴 Advanced",
    scenario: "A script runs `vssadmin.exe delete shadows /all /quiet` followed by high-entropy file overwrites across all network shares. Which MITRE Tactic does this represent?",
    options: [
      { text: "TA0043: Reconnaissance", correct: false },
      { text: "TA0042: Resource Development", correct: false },
      { text: "TA0040: Impact (Disrupt availability and encrypt data)", correct: true },
      { text: "TA0009: Collection", correct: false }
    ],
    explanation: "Deleting Volume Shadow Copies (Windows backups) and then encrypting files is the signature of ransomware, classified under Impact (TA0040). The VSS deletion prevents recovery — that's why offline, air-gapped backups are critical."
  }
];

export class QuizArena {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentMode = "quiz"; // 'quiz' or 'chain'
    this.currentQIndex = 0;
    this.score = 0;
    this.streak = 0;

    // Chain builder state
    this.chainPool = [
      { id: "TA0043", name: "Reconnaissance", order: 1 },
      { id: "TA0001", name: "Initial Access", order: 2 },
      { id: "TA0002", name: "Execution", order: 3 },
      { id: "TA0006", name: "Credential Access", order: 4 },
      { id: "TA0008", name: "Lateral Movement", order: 5 },
      { id: "TA0010", name: "Exfiltration", order: 6 },
      { id: "TA0040", name: "Impact", order: 7 }
    ];
    this.userChain = [];

    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = "";

    const arena = document.createElement("div");
    arena.className = "quiz-arena-wrapper";

    arena.innerHTML = `
      <div class="arena-header">
        <div class="arena-mode-switch">
          <button class="mode-btn ${this.currentMode === "quiz" ? "active" : ""}" id="btnModeQuiz">
            🎯 Scenario Knowledge Quiz
          </button>
          <button class="mode-btn ${this.currentMode === "chain" ? "active" : ""}" id="btnModeChain">
            🧩 Assemble The Attack Chain
          </button>
        </div>
        <div class="arena-stats">
          <span class="stat-pill">🏆 Score: <strong>${this.score}</strong></span>
          <span class="stat-pill streak">🔥 Streak: <strong>${this.streak}</strong></span>
        </div>
      </div>

      <div class="arena-body" id="arenaBody"></div>
    `;

    this.container.appendChild(arena);

    arena.querySelector("#btnModeQuiz").addEventListener("click", () => {
      soundFX.playClick();
      this.currentMode = "quiz";
      this.render();
    });

    arena.querySelector("#btnModeChain").addEventListener("click", () => {
      soundFX.playClick();
      this.currentMode = "chain";
      this.initChainPuzzle();
      this.render();
    });

    const body = arena.querySelector("#arenaBody");
    if (this.currentMode === "quiz") {
      this.renderQuiz(body);
    } else {
      this.renderChainPuzzle(body);
    }
  }

  renderQuiz(container) {
    const q = QUIZ_QUESTIONS[this.currentQIndex];

    container.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-progress-row">
          <span class="quiz-q-num">Question ${this.currentQIndex + 1} of ${QUIZ_QUESTIONS.length}</span>
          <div class="quiz-bar">
            <div class="quiz-bar-fill" style="width: ${((this.currentQIndex + 1) / QUIZ_QUESTIONS.length) * 100}%"></div>
          </div>
          <span class="difficulty-badge difficulty-${q.difficulty}">${q.difficultyLabel}</span>
        </div>

        <h3 class="quiz-scenario-text">${q.scenario}</h3>

        <div class="quiz-options-list">
          ${q.options.map((opt, idx) => `
            <button class="quiz-opt-btn" data-opt-idx="${idx}">
              <span class="opt-bullet">${String.fromCharCode(65 + idx)}</span>
              <span class="opt-text">${opt.text}</span>
            </button>
          `).join("")}
        </div>

        <div id="quizFeedbackBox" class="quiz-feedback-box hidden"></div>
      </div>
    `;

    const optBtns = container.querySelectorAll(".quiz-opt-btn");
    const feedbackBox = container.querySelector("#quizFeedbackBox");

    optBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.optIdx, 10);
        const opt = q.options[idx];

        // Disable all buttons
        optBtns.forEach(b => b.disabled = true);

        if (opt.correct) {
          btn.classList.add("correct");
          soundFX.playSuccess();
          this.score += 100;
          this.streak += 1;
        } else {
          btn.classList.add("incorrect");
          soundFX.playError();
          this.streak = 0;
          // Highlight correct option
          q.options.forEach((o, i) => {
            if (o.correct) optBtns[i].classList.add("correct");
          });
        }

        // Update score display in header
        this.container.querySelector(".stat-pill strong").textContent = this.score;
        this.container.querySelector(".streak strong").textContent = this.streak;

        feedbackBox.classList.remove("hidden");
        feedbackBox.innerHTML = `
          <div class="feedback-badge ${opt.correct ? "success" : "failure"}">
            ${opt.correct ? "✅ Correct!" : "❌ Incorrect — here's why:"}
          </div>
          <p class="feedback-explanation">${q.explanation}</p>
          <button class="next-q-btn" id="btnNextQuestion">
            ${this.currentQIndex < QUIZ_QUESTIONS.length - 1 ? "Next Scenario ➔" : "See Your Results 🏆"}
          </button>
        `;

        feedbackBox.querySelector("#btnNextQuestion").addEventListener("click", () => {
          soundFX.playClick();
          if (this.currentQIndex < QUIZ_QUESTIONS.length - 1) {
            this.currentQIndex++;
            this.render();
          } else {
            // Show completion screen
            this._showQuizCompletion(container);
          }
        });
      });
    });
  }

  _showQuizCompletion(container) {
    const pct = Math.round((this.score / (QUIZ_QUESTIONS.length * 100)) * 100);
    const grade = pct >= 80 ? "🏆 Expert Analyst" : pct >= 60 ? "🥈 Competent Defender" : "🎓 Keep Practising";
    container.innerHTML = `
      <div class="quiz-completion-card">
        <div class="completion-header">
          <div class="completion-icon">${pct >= 80 ? "🏆" : pct >= 60 ? "🥈" : "📚"}</div>
          <h3 class="completion-title">Quiz Complete!</h3>
          <p class="completion-grade">${grade}</p>
        </div>
        <div class="completion-stats">
          <div class="comp-stat">
            <span class="comp-stat-val">${this.score}</span>
            <span class="comp-stat-label">Points Earned</span>
          </div>
          <div class="comp-stat">
            <span class="comp-stat-val">${pct}%</span>
            <span class="comp-stat-label">Accuracy</span>
          </div>
          <div class="comp-stat">
            <span class="comp-stat-val">${this.streak}</span>
            <span class="comp-stat-label">Final Streak</span>
          </div>
        </div>
        <div class="completion-next">
          <p>Ready for the next challenge?</p>
          <div class="completion-actions">
            <button class="next-q-btn" id="btnRetryQuiz">🔄 Retry Quiz</button>
            <button class="puzzle-action-btn check" id="btnGoToChain">🧩 Try Attack Chain Puzzle</button>
          </div>
        </div>
      </div>
    `;
    container.querySelector("#btnRetryQuiz").addEventListener("click", () => {
      soundFX.playClick();
      this.currentQIndex = 0;
      this.score = 0;
      this.streak = 0;
      this.render();
    });
    container.querySelector("#btnGoToChain").addEventListener("click", () => {
      soundFX.playClick();
      this.currentMode = "chain";
      this.initChainPuzzle();
      this.render();
    });
  }

  initChainPuzzle() {
    this.userChain = [];
    // Shuffle the available pool
    this.shuffledPool = [...this.chainPool].sort(() => Math.random() - 0.5);
  }

  renderChainPuzzle(container) {
    container.innerHTML = `
      <div class="chain-puzzle-card">
        <div class="puzzle-header">
          <h3>🧩 Mission: Reconstruct The Chronological Cyber Attack Chain</h3>
          <p>Click the tactics in the correct sequential order an advanced adversary progresses through (from Reconnaissance to Impact).</p>
          <div class="puzzle-why-box">
            <strong>Why does order matter?</strong> Attackers must follow a logical progression — you can't steal credentials before you've gained access, and you can't move laterally before you have credentials. Understanding this sequence is the foundation of threat hunting.
            <br><span class="puzzle-note">This puzzle covers 7 key phases of the full 14-tactic kill-chain.</span>
          </div>
        </div>

        <div class="puzzle-slots-container">
          <h4>Your Attack Sequence:</h4>
          <div class="slots-row" id="slotsRow">
            ${this.chainPool.map((_, i) => {
              const item = this.userChain[i];
              return `
                <div class="chain-slot ${item ? "filled" : "empty"}" data-slot-index="${i}">
                  ${item ? `
                    <span class="slot-badge">${item.id}</span>
                    <span class="slot-name">${item.name}</span>
                    <button class="remove-slot-btn" data-remove-index="${i}">×</button>
                  ` : `
                    <span class="slot-placeholder">Step ${i + 1}</span>
                  `}
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <div class="puzzle-pool-container">
          <h4>Available Tactics (Click to append):</h4>
          <div class="pool-row" id="poolRow">
            ${this.shuffledPool.map((item, idx) => {
              const isUsed = this.userChain.some(u => u.id === item.id);
              return `
                <button class="pool-item-btn ${isUsed ? "used" : ""}" data-item-id="${item.id}" ${isUsed ? "disabled" : ""}>
                  <span class="tactic-tag">${item.id}</span>
                  <span class="tactic-label">${item.name}</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>

        <div class="puzzle-actions">
          <button class="puzzle-action-btn check" id="btnCheckChain" ${this.userChain.length === this.chainPool.length ? "" : "disabled"}>
            🔍 Verify Attack Sequence
          </button>
          <button class="puzzle-action-btn reset" id="btnResetChain">
            🔄 Reset
          </button>
        </div>

        <div id="chainFeedbackBox" class="chain-feedback-box hidden"></div>
      </div>
    `;

    // Pool buttons
    const poolBtns = container.querySelectorAll(".pool-item-btn");
    poolBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.itemId;
        const item = this.chainPool.find(t => t.id === id);
        if (item && !this.userChain.some(u => u.id === id) && this.userChain.length < this.chainPool.length) {
          soundFX.playClick();
          this.userChain.push(item);
          this.render();
        }
      });
    });

    // Remove buttons
    const removeBtns = container.querySelectorAll(".remove-slot-btn");
    removeBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const rIdx = parseInt(btn.dataset.removeIndex, 10);
        this.userChain.splice(rIdx, 1);
        soundFX.playClick();
        this.render();
      });
    });

    // Reset button
    container.querySelector("#btnResetChain").addEventListener("click", () => {
      soundFX.playClick();
      this.initChainPuzzle();
      this.render();
    });

    // Verify button
    const checkBtn = container.querySelector("#btnCheckChain");
    if (checkBtn) {
      checkBtn.addEventListener("click", () => {
        const isCorrect = this.userChain.every((item, idx) => item.order === idx + 1);
        const feedbackBox = container.querySelector("#chainFeedbackBox");

        feedbackBox.classList.remove("hidden");
        if (isCorrect) {
          soundFX.playSuccess();
          this.score += 250;
          this.streak += 2;
          this.container.querySelector(".stat-pill strong").textContent = this.score;
          this.container.querySelector(".streak strong").textContent = this.streak;

          feedbackBox.innerHTML = `
            <div class="chain-feedback correct">
              <h4>🎉 Master Adversary Chain Verified!</h4>
              <p>You correctly sequenced the entire kill-chain progression: <strong>Reconnaissance ➔ Initial Access ➔ Execution ➔ Credential Access ➔ Lateral Movement ➔ Exfiltration ➔ Impact</strong>.</p>
              <p style="margin-top:.5rem">These 7 phases map directly to Acts 1, 3, 4, 8, 10, 13, and 14 in <strong>Story Mode</strong> — go back and watch them with this sequence in mind!</p>
              <p style="margin-top:.5rem">Understanding this progression is the core foundation of MITRE ATT&amp;CK threat hunting and incident response.</p>
            </div>
          `;
        } else {
          soundFX.playError();
          this.streak = 0;
          this.container.querySelector(".streak strong").textContent = this.streak;

          feedbackBox.innerHTML = `
            <div class="chain-feedback error">
              <h4>❌ Sequence Mismatch</h4>
              <p>The order is not quite right. Remember the kill chain flow: Attackers must first <em>gain access</em> before they can <em>execute code</em>, and must <em>harvest credentials</em> before they can <em>move laterally</em> to the database!</p>
            </div>
          `;
        }
      });
    }
  }
}
