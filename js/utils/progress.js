// Cross-mode learning progress tracker backed by localStorage.
// Each of the 5 modes has a completion flag.  The header dots update live.

const STORAGE_KEY = "mitre_platform_progress_v1";

const MODES = ["story", "matrix", "simulator", "quiz", "playbook"];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* storage quota or private-browsing — silently ignore */ }
}

/**
 * Mark a mode as complete and refresh the progress dots in the header.
 * @param {"story"|"matrix"|"simulator"|"quiz"|"playbook"} mode
 */
export function markComplete(mode) {
  const data = load();
  if (!data[mode]) {
    data[mode] = true;
    save(data);
    renderProgressDots(data);
  }
}

/** Return the current completion state object. */
export function getProgress() {
  return load();
}

/** Return how many of the 5 modes are complete (0–5). */
export function completedCount() {
  const data = load();
  return MODES.filter(m => data[m]).length;
}

/** Render / update the 5 progress dots in the header. */
export function renderProgressDots(data) {
  const container = document.getElementById("progressDotsContainer");
  if (!container) return;
  if (!data) data = load();

  container.innerHTML = MODES.map(mode => {
    const done = !!data[mode];
    const label = {
      story: "Story", matrix: "Matrix", simulator: "Simulator",
      quiz: "Quiz", playbook: "Playbook"
    }[mode];
    return `<span class="progress-dot ${done ? "done" : ""}" title="${label}: ${done ? "Complete ✓" : "Not yet started"}"></span>`;
  }).join("");
}

/** Reset all progress (useful for testing). */
export function resetProgress() {
  save({});
  renderProgressDots({});
}
