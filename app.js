// Lesson Prep Planner — app state and rendering.
// starterActivities comes from activities-data.js (loaded before this file).

const STORAGE_KEY = "lessonPrepPlan";

// The only data this app writes: user-created scheduled entries.
// Loaded once from localStorage, then mutated in place by every action
// below so the form, checkboxes, totals, and list all read/write the
// same in-memory array (per AGENTS.md's state-sharing rule).
let scheduledEntries = loadScheduledEntries();

// Currently selected "Filter by date" bucket (see DATE_FILTERS below).
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

function isPastDate(dateStr) {
  return dateStr < todayDateStr();
}

// Keeps the native date picker from offering past days. Refreshed on every
// render/focus so a page left open across midnight doesn't fall behind.
function refreshDateInputMin() {
  const dateInput = document.getElementById("date-input");
  dateInput.min = todayDateStr();
}

// --- Date bucket math for the "Filter by date" dropdown ---
// Everything below works on "YYYY-MM-DD" strings via Date.UTC so local
// timezone never shifts the displayed day (same reasoning as formatDateDisplay).

function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Week is treated as Sunday–Saturday, matching the common US convention.
function endOfWeekDateStr(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0 = Sun ... 6 = Sat
  return addDays(dateStr, 6 - dayOfWeek);
}

function endOfMonthDateStr(dateStr) {
  const [year, month] = dateStr.split("-").map(Number);
  // Day 0 of next month rolls back to the last day of this month.
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

// Date-filter dropdown values, matching how teachers actually think about
// upcoming prep ("what's today?", "what's this week?") instead of picking
// one exact date out of a long list.
const DATE_FILTERS = {
  ALL: "all",
  TODAY: "today",
  TOMORROW: "tomorrow",
  WEEK: "week",
  MONTH: "month",
  LATER: "later",
  PAST: "past"
};

function hasPastEntries() {
  const today = todayDateStr();
  return scheduledEntries.some((entry) => entry.date < today);
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
  const today = todayDateStr();

  // "Past" is the one bucket that intentionally breaks from "upcoming
  // only" — it exists so overdue entries can be found and cleaned up
  // instead of just vanishing from the list once their date passes.
  if (dateFilter === DATE_FILTERS.PAST) {
    return scheduledEntries
      .filter((entry) => entry.date < today)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date)); // most recently passed first
  }

  const upcoming = getUpcomingEntries();

  switch (dateFilter) {
    case DATE_FILTERS.TODAY:
      return upcoming.filter((entry) => entry.date === today);
    case DATE_FILTERS.TOMORROW: {
      const tomorrow = addDays(today, 1);
      return upcoming.filter((entry) => entry.date === tomorrow);
    }
    case DATE_FILTERS.WEEK: {
      const weekEnd = endOfWeekDateStr(today);
      return upcoming.filter((entry) => entry.date <= weekEnd);
    }
    case DATE_FILTERS.MONTH: {
      const monthEnd = endOfMonthDateStr(today);
      return upcoming.filter((entry) => entry.date <= monthEnd);
    }
    case DATE_FILTERS.LATER: {
      const monthEnd = endOfMonthDateStr(today);
      return upcoming.filter((entry) => entry.date > monthEnd);
    }
    case DATE_FILTERS.ALL:
    default:
      return upcoming;
  }
}

// User-facing copy for each filter, reused by both the dropdown and the
// "nothing to show" empty state so the two always agree.
const DATE_FILTER_LABELS = {
  [DATE_FILTERS.ALL]: "All Upcoming",
  [DATE_FILTERS.TODAY]: "Today",
  [DATE_FILTERS.TOMORROW]: "Tomorrow",
  [DATE_FILTERS.WEEK]: "This Week",
  [DATE_FILTERS.MONTH]: "This Month",
  [DATE_FILTERS.LATER]: "Later",
  [DATE_FILTERS.PAST]: "Past (Outdated)"
};

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
    .map((date) => {
      // A past date only ends up here if time has moved on since it was
      // scheduled — label it so the stale total isn't mistaken for upcoming prep.
      const pastClass = isPastDate(date) ? " chip-past" : "";
      const pastLabel = isPastDate(date) ? " (Past)" : "";
      return `<span class="chip${pastClass}">${formatDateDisplay(date)}${pastLabel} — ${totals[date]} min prep</span>`;
    })
    .join("");
}

function renderDateFilterOptions() {
  const select = document.getElementById("date-filter");
  const previousValue = dateFilter;

  // Fixed, data-independent buckets that match how a teacher actually
  // thinks about upcoming prep, instead of one option per literal date.
  const buckets = [
    DATE_FILTERS.ALL,
    DATE_FILTERS.TODAY,
    DATE_FILTERS.TOMORROW,
    DATE_FILTERS.WEEK,
    DATE_FILTERS.MONTH,
    DATE_FILTERS.LATER
  ];

  const options = buckets.map(
    (value) => `<option value="${value}">${DATE_FILTER_LABELS[value]}</option>`
  );

  // "Past" only shows up once something is actually overdue, so a clean
  // plan doesn't offer a bucket that's guaranteed to be empty.
  if (hasPastEntries()) {
    options.push(`<option value="${DATE_FILTERS.PAST}">${DATE_FILTER_LABELS[DATE_FILTERS.PAST]}</option>`);
  }

  select.innerHTML = options.join("");

  // Keep the current filter selected if it's still a valid choice (e.g.
  // "Past" stays selected while overdue entries exist); otherwise fall
  // back to "All Upcoming" rather than silently resetting to something
  // unexpected.
  const validValues = buckets.concat(hasPastEntries() ? [DATE_FILTERS.PAST] : []);
  dateFilter = validValues.includes(previousValue) ? previousValue : DATE_FILTERS.ALL;
  select.value = dateFilter;
}

// Keeps the empty state in sync with whichever bucket is selected, instead
// of always showing the generic "nothing scheduled" message.
function getEmptyListMessage() {
  if (scheduledEntries.length === 0) {
    return "No activities scheduled yet — pick one above to get started.";
  }
  if (dateFilter === DATE_FILTERS.PAST) {
    return "Nothing overdue — every past activity has been handled or removed.";
  }
  if (dateFilter === DATE_FILTERS.ALL) {
    return "No upcoming activities scheduled yet — pick one above to get started.";
  }
  return `No activities scheduled for ${DATE_FILTER_LABELS[dateFilter]}.`;
}

function renderActivitiesList() {
  const container = document.getElementById("activities-list");
  const visible = getVisibleEntries();

  if (visible.length === 0) {
    container.innerHTML = `<p class="empty-message">${getEmptyListMessage()}</p>`;
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

  // Only reachable via the "Past" filter bucket (the other buckets only
  // ever surface today-or-later entries) — flag it so it reads as overdue.
  const overdue = isPastDate(entry.date);
  const cardClass = overdue ? "activity-card activity-card-past" : "activity-card";
  const dateClass = overdue ? "meta-pill meta-pill-past" : "meta-pill";
  const dateLabel = overdue ? `${formatDateDisplay(entry.date)} — Overdue` : formatDateDisplay(entry.date);

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
    <article class="${cardClass}">
      <div class="card-top-row">
        <h3>${activity.name}</h3>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      <div class="meta-pills">
        <span class="${dateClass}">${dateLabel}</span>
        <span class="meta-pill">Ages ${activity.ageRange}</span>
        <span class="meta-pill">${activity.durationMinutes} min</span>
      </div>
      <img class="activity-photo" src="${activity.image}" alt="${activity.name}">
      <ul class="materials-list">${materialsHtml}</ul>
      <div class="card-actions">
        <button type="button" class="pill-btn pill-btn-outline" data-remove-id="${entry.scheduleId}">Remove</button>
      </div>
    </article>`;
}

function renderAll() {
  refreshDateInputMin();
  renderActivityOptions();
  renderSummaryChips();
  renderDateFilterOptions();
  renderActivitiesList();
}

// --- Validation + schedule action (PRD.md sections 2 and 4) ---

function showFieldError(fieldErrorId, message) {
  const span = document.getElementById(fieldErrorId);
  span.textContent = message;
  span.hidden = false;
}

function clearFieldError(fieldErrorId) {
  const span = document.getElementById(fieldErrorId);
  span.textContent = "";
  span.hidden = true;
}

function handleScheduleSubmit(event) {
  event.preventDefault();

  const activitySelect = document.getElementById("activity-select");
  const dateInput = document.getElementById("date-input");
  const activityId = activitySelect.value;
  const date = dateInput.value;

  // Validate both fields before touching state, so an invalid submission
  // never partially adds an entry or clears what the user already typed.
  let hasError = false;

  if (!activityId) {
    showFieldError("activity-error", "Please choose an activity.");
    hasError = true;
  } else {
    clearFieldError("activity-error");
  }

  if (!date) {
    showFieldError("date-error", "Please choose a date.");
    hasError = true;
  } else if (isPastDate(date)) {
    // This is a planner for future prep — a past date can't be scheduled,
    // even if it was typed in directly rather than picked from the calendar.
    showFieldError("date-error", "Please choose today or a future date.");
    hasError = true;
  } else {
    clearFieldError("date-error");
  }

  if (hasError) return;

  const activity = getActivityById(activityId);
  const materialsReady = {};
  activity.materials.forEach((material) => {
    materialsReady[material] = false;
  });

  scheduledEntries.push({
    scheduleId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    activityId,
    date,
    materialsReady
  });

  saveScheduledEntries();

  // Reset the form for the next entry, since the activity/date just used
  // are no longer meaningful to leave filled in.
  activitySelect.value = "";
  dateInput.value = "";

  renderSummaryChips();
  renderDateFilterOptions();
  renderActivitiesList();
}

document.getElementById("schedule-form").addEventListener("submit", handleScheduleSubmit);

// Refresh the picker's minimum date on focus, in case the tab was left
// open past midnight and "today" has since moved forward.
document.getElementById("date-input").addEventListener("focus", refreshDateInputMin);

// --- Toggle material ready (event delegation: one listener for every card) ---

function handleActivitiesListChange(event) {
  const checkbox = event.target;
  if (checkbox.type !== "checkbox") return;

  const { scheduleId, material } = checkbox.dataset;
  const entry = scheduledEntries.find((e) => e.scheduleId === scheduleId);
  if (!entry) return;

  entry.materialsReady[material] = checkbox.checked;
  saveScheduledEntries();

  // Only the one card's status badge needs to change, but re-rendering the
  // whole list keeps this simple and the list is small enough that it's
  // not worth hand-patching a single badge.
  renderActivitiesList();
}

document.getElementById("activities-list").addEventListener("change", handleActivitiesListChange);

// --- Remove a single scheduled entry ---

function handleActivitiesListClick(event) {
  const button = event.target.closest("[data-remove-id]");
  if (!button) return;

  const scheduleId = button.dataset.removeId;
  scheduledEntries = scheduledEntries.filter((e) => e.scheduleId !== scheduleId);
  saveScheduledEntries();

  renderSummaryChips();
  renderDateFilterOptions();
  renderActivitiesList();
}

document.getElementById("activities-list").addEventListener("click", handleActivitiesListClick);

// --- Filter by date ---

function handleDateFilterChange(event) {
  dateFilter = event.target.value;
  renderActivitiesList();
}

document.getElementById("date-filter").addEventListener("change", handleDateFilterChange);

// --- Reset ---

function handleResetClick() {
  scheduledEntries = [];
  dateFilter = "all";
  saveScheduledEntries();

  renderSummaryChips();
  renderDateFilterOptions();
  renderActivitiesList();

  const confirmation = document.getElementById("reset-confirmation");
  confirmation.hidden = false;
  clearTimeout(handleResetClick.hideTimer);
  handleResetClick.hideTimer = setTimeout(() => {
    confirmation.hidden = true;
  }, 3000);
}

document.getElementById("reset-button").addEventListener("click", handleResetClick);

renderAll();
