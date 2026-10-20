// Lesson Prep Planner — app state and rendering.
// starterActivities comes from activities-data.js (loaded before this file).

const STORAGE_KEY = "lessonPrepPlan";

// The only data this app writes: user-created scheduled entries.
// Loaded once from localStorage, then mutated in place by every action
// below so the form, checkboxes, totals, and list all read/write the
// same in-memory array (per AGENTS.md's state-sharing rule).
let scheduledEntries = loadScheduledEntries();

// Currently selected "Filter by date" value. "all" shows every entry.
// This is render-only state — it is never persisted.
let dateFilter = "all";

function loadScheduledEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function saveScheduledEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduledEntries));
}

function getActivityById(activityId) {
  return starterActivities.find((activity) => activity.id === activityId);
}

function isEntryReady(entry) {
  return Object.values(entry.materialsReady).every(Boolean);
}

// "2025-10-22" -> "Oct 22" without going through Date parsing (which
// treats YYYY-MM-DD as UTC and can shift the displayed day).
function formatDateDisplay(dateStr) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${months[month - 1]} ${day}`;
}

function todayDateStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// --- Calculated outputs (PRD.md section 3) ---

function calculatePrepMinutesByDay() {
  const totals = {};
  for (const entry of scheduledEntries) {
    const activity = getActivityById(entry.activityId);
    if (!activity) continue;
    totals[entry.date] = (totals[entry.date] || 0) + activity.prepMinutes;
  }
  return totals;
}

function getUpcomingEntries() {
  const today = todayDateStr();
  return scheduledEntries
    .filter((entry) => entry.date >= today)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getVisibleEntries() {
  const upcoming = getUpcomingEntries();
  if (dateFilter === "all") return upcoming;
  return upcoming.filter((entry) => entry.date === dateFilter);
}

// --- Rendering ---

function renderActivityOptions() {
  const select = document.getElementById("activity-select");
  const placeholder = '<option value="">Choose an activity…</option>';
  const options = starterActivities
    .map((activity) => `<option value="${activity.id}">${activity.name}</option>`)
    .join("");
  select.innerHTML = placeholder + options;
}

function renderSummaryChips() {
  const container = document.getElementById("summary-chips");
  const totals = calculatePrepMinutesByDay();
  const dates = Object.keys(totals).sort();

  if (dates.length === 0) {
    container.innerHTML = '<p class="empty-message">No prep time scheduled yet.</p>';
    return;
  }

  container.innerHTML = dates
    .map((date) => `<span class="chip">${formatDateDisplay(date)} — ${totals[date]} min prep</span>`)
    .join("");
}

function renderDateFilterOptions() {
  const select = document.getElementById("date-filter");
  const previousValue = dateFilter;
  const dates = Array.from(new Set(scheduledEntries.map((entry) => entry.date))).sort();

  const options = ['<option value="all">All dates</option>']
    .concat(dates.map((date) => `<option value="${date}">${formatDateDisplay(date)}</option>`));
  select.innerHTML = options.join("");

  // Keep the current filter selected if it's still a valid date; otherwise
  // fall back to "All dates" rather than silently resetting the user's
  // choice to something unexpected.
  dateFilter = dates.includes(previousValue) ? previousValue : "all";
  select.value = dateFilter;
}

function renderActivitiesList() {
  const container = document.getElementById("activities-list");
  const visible = getVisibleEntries();

  if (visible.length === 0) {
    container.innerHTML =
      '<p class="empty-message">No activities scheduled yet — pick one above to get started.</p>';
    return;
  }

  container.innerHTML = visible.map(renderActivityCard).join("");
}

function renderActivityCard(entry) {
  const activity = getActivityById(entry.activityId);
  if (!activity) return "";

  const ready = isEntryReady(entry);
  const statusClass = ready ? "status-ready" : "status-needs-prep";
  const statusText = ready ? "Ready" : "Needs Prep";

  const materialsHtml = activity.materials
    .map((material) => {
      const checked = entry.materialsReady[material] ? "checked" : "";
      return `
        <li>
          <label>
            <input type="checkbox" data-schedule-id="${entry.scheduleId}" data-material="${material}" ${checked}>
            ${material}
          </label>
        </li>`;
    })
    .join("");

  return `
    <article class="activity-card">
      <div class="card-top-row">
        <h3>${activity.name}</h3>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      <div class="meta-pills">
        <span class="meta-pill">${formatDateDisplay(entry.date)}</span>
        <span class="meta-pill">Ages ${activity.ageRange}</span>
        <span class="meta-pill">${activity.durationMinutes} min</span>
      </div>
      <ul class="materials-list">${materialsHtml}</ul>
      <div class="card-actions">
        <button type="button" class="pill-btn pill-btn-outline" data-remove-id="${entry.scheduleId}">Remove</button>
      </div>
    </article>`;
}

function renderAll() {
  renderActivityOptions();
  renderSummaryChips();
  renderDateFilterOptions();
  renderActivitiesList();
}

renderAll();
