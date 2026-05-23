// app.js - SiliconQuest Core Logic

// Global State
const state = {
  activeTab: 'dashboard',
  jobs: [],
  quiz: {
    questions: [],
    currentIndex: 0,
    score: 0,
    attempted: 0,
    answered: false
  },
  flashcards: {
    cards: [],
    currentIndex: 0,
    filter: 'All',
    mastered: new Set() // Set of card IDs that have been reviewed
  },
  waveform: {
    signals: [],
    cyclesCount: 16
  },
  sandbox: {
    activeTemplateIndex: 0
  },
  resumeText: "",
  crawledJobs: []
};

// Default Sample Jobs to load if localStorage is empty
const sampleJobs = [
  {
    id: "job-1",
    company: "NVIDIA",
    role: "RTL Design Engineer",
    status: "tech_interview",
    location: "Santa Clara, CA (Hybrid)",
    salary: "$155,000 - $185,000 + RSUs",
    date: "2026-05-28",
    url: "https://www.nvidia.com/en-us/about-nvidia/careers/",
    notes: "Technical interview scheduled with the GPU Interconnect team. Topics: Clock Domain Crossing (CDC), AXI4 protocol features, and FIFO synchronization."
  },
  {
    id: "job-2",
    company: "AMD",
    role: "Silicon Design Engineer - CPU Core",
    status: "applied",
    location: "Austin, TX (On-site)",
    salary: "$145,000 - $170,000",
    date: "2026-05-22",
    url: "https://www.amd.com/en/corporate/careers",
    notes: "Applied via employee referral. Under review by recruiter."
  },
  {
    id: "job-3",
    company: "Apple",
    role: "SoC RTL Design Engineer",
    status: "wishlist",
    location: "Cupertino, CA (Hybrid)",
    salary: "$160,000 - $200,000",
    date: "",
    url: "https://www.apple.com/careers/",
    notes: "Requires deep knowledge of low-power clock gating and custom FSM optimizations. Will apply once portfolio is ready."
  },
  {
    id: "job-4",
    company: "Qualcomm",
    role: "RTL Design Engineer - 5G Modem",
    status: "hr_round",
    location: "San Diego, CA",
    salary: "$138,000 + bonus",
    date: "2026-05-20",
    url: "https://www.qualcomm.com/company/careers",
    notes: "Completed technical rounds! Crushed the setup/hold time exercises. Waiting for final director call."
  }
];

// Default Waveform Presets
const waveformPresets = {
  axi: [
    { name: "PCLK", type: "clock", states: Array(16).fill(null).map((_, i) => i % 2 === 0 ? "0" : "1") },
    { name: "ARESETn", type: "binary", states: ["0", "0", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"] },
    { name: "TVALID", type: "binary", states: ["0", "0", "0", "1", "1", "0", "0", "1", "1", "1", "0", "0", "0", "0", "0", "0"] },
    { name: "TREADY", type: "binary", states: ["0", "0", "0", "0", "1", "1", "1", "0", "1", "1", "1", "0", "0", "0", "0", "0"] },
    { name: "TDATA", type: "bus", states: ["Z", "Z", "Z", "D1", "D1", "Z", "Z", "D2", "D2", "D3", "Z", "Z", "Z", "Z", "Z", "Z"] }
  ],
  apb: [
    { name: "PCLK", type: "clock", states: Array(16).fill(null).map((_, i) => i % 2 === 0 ? "0" : "1") },
    { name: "PRESETn", type: "binary", states: ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"] },
    { name: "PADDR", type: "bus", states: ["Z", "Z", "A1", "A1", "Z", "Z", "A2", "A2", "Z", "Z", "Z", "Z", "Z", "Z", "Z", "Z"] },
    { name: "PSEL", type: "binary", states: ["0", "0", "1", "1", "0", "0", "1", "1", "0", "0", "0", "0", "0", "0", "0", "0"] },
    { name: "PENABLE", type: "binary", states: ["0", "0", "0", "1", "0", "0", "0", "1", "0", "0", "0", "0", "0", "0", "0", "0"] },
    { name: "PREADY", type: "binary", states: ["0", "0", "1", "1", "0", "0", "1", "1", "0", "0", "0", "0", "0", "0", "0", "0"] },
    { name: "PRDATA", type: "bus", states: ["Z", "Z", "Z", "D1", "Z", "Z", "Z", "D2", "Z", "Z", "Z", "Z", "Z", "Z", "Z", "Z"] }
  ],
  fifo: [
    { name: "clk", type: "clock", states: Array(16).fill(null).map((_, i) => i % 2 === 0 ? "0" : "1") },
    { name: "wr_en", type: "binary", states: ["0", "1", "1", "1", "0", "0", "0", "1", "1", "0", "0", "0", "0", "0", "0", "0"] },
    { name: "din", type: "bus", states: ["Z", "D0", "D1", "D2", "Z", "Z", "Z", "D3", "D4", "Z", "Z", "Z", "Z", "Z", "Z", "Z"] },
    { name: "full", type: "binary", states: ["0", "0", "0", "0", "0", "0", "0", "0", "1", "1", "0", "0", "0", "0", "0", "0"] },
    { name: "rd_en", type: "binary", states: ["0", "0", "0", "0", "0", "1", "1", "0", "0", "0", "1", "0", "0", "0", "0", "0"] },
    { name: "dout", type: "bus", states: ["Z", "Z", "Z", "Z", "Z", "D0", "D1", "Z", "Z", "Z", "D2", "Z", "Z", "Z", "Z", "Z"] }
  ],
  cdc: [
    { name: "clk_a", type: "clock", states: Array(16).fill(null).map((_, i) => i % 2 === 0 ? "0" : "1") },
    { name: "data_a", type: "binary", states: ["0", "0", "1", "1", "1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"] },
    { name: "clk_b", type: "clock", states: ["0", "0", "0", "1", "1", "1", "0", "0", "0", "1", "1", "1", "0", "0", "0", "1"] },
    { name: "sync_ff1", type: "binary", states: ["0", "0", "0", "0", "1", "1", "1", "1", "1", "0", "0", "0", "0", "0", "0", "0"] },
    { name: "sync_ff2", type: "binary", states: ["0", "0", "0", "0", "0", "0", "0", "0", "1", "1", "1", "1", "1", "0", "0", "0"] }
  ]
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEventListeners();
  initRouting();
  renderDashboard();
  renderTracker();
  renderFlashcards();
  renderQuiz();
  renderWaveform();
  renderCompanies();
  renderSandbox();
});

// Load Data from LocalStorage / mockData.js
function loadData() {
  // Load Jobs
  const storedJobs = localStorage.getItem("siliconquest_jobs");
  if (storedJobs) {
    state.jobs = JSON.parse(storedJobs);
  } else {
    state.jobs = [...sampleJobs];
    localStorage.setItem("siliconquest_jobs", JSON.stringify(state.jobs));
  }

  // Load Quiz & Flashcards data from mockData
  if (typeof mockData !== "undefined") {
    state.quiz.questions = mockData.rtlQuestions;
    state.flashcards.cards = mockData.rtlFlashcards;
  }

  // Load Waveform custom signal state or set preset default (AXI)
  state.waveform.signals = JSON.parse(JSON.stringify(waveformPresets.axi));

  // Load Resume
  const storedResume = localStorage.getItem("siliconquest_resume");
  if (storedResume && storedResume.trim().length > 0) {
    // If it contains the old mock resume, auto-upgrade it to her actual resume
    if (storedResume.includes("Silicon Tech Labs") || 
        storedResume.includes("Detail-oriented RTL Design Engineer") ||
        (storedResume.includes("Incise Infotech Limited") && !storedResume.includes("Genus"))) {
      state.resumeText = sampleResumeText;
      localStorage.setItem("siliconquest_resume", sampleResumeText);
    } else {
      state.resumeText = storedResume;
    }
  } else {
    state.resumeText = sampleResumeText;
    localStorage.setItem("siliconquest_resume", sampleResumeText);
  }
}

// Save Jobs to LocalStorage
function saveJobs() {
  localStorage.setItem("siliconquest_jobs", JSON.stringify(state.jobs));
}

// Router & Tab Switching logic
function initRouting() {
  const hash = window.location.hash || '#dashboard';
  const tabName = hash.replace('#', '');
  switchTab(tabName);
}

function setupEventListeners() {
  // Navigation Links
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tabName = link.getAttribute("data-tab");
      window.location.hash = tabName;
      switchTab(tabName);
    });
  });

  // Listen to hash changes for browser back/forward buttons
  window.addEventListener("hashchange", () => {
    const tabName = window.location.hash.replace('#', '') || 'dashboard';
    switchTab(tabName);
  });

  // Global Quick Add Job button
  document.getElementById("add-job-shortcut").addEventListener("click", () => openJobModal());
  document.getElementById("add-job-btn").addEventListener("click", () => openJobModal());

  // Modal Cancel/Close buttons
  document.getElementById("close-modal-x").addEventListener("click", closeJobModal);
  document.getElementById("cancel-job-btn").addEventListener("click", closeJobModal);
  document.getElementById("job-form").addEventListener("submit", handleJobFormSubmit);
  document.getElementById("delete-job-btn").addEventListener("click", handleJobDelete);

  // Flashcards UI Listeners
  document.getElementById("flashcard-element").addEventListener("click", toggleFlashcardFlip);
  document.getElementById("next-card-btn").addEventListener("click", nextFlashcard);
  document.getElementById("prev-card-btn").addEventListener("click", prevFlashcard);
  document.getElementById("mark-mastered-btn").addEventListener("click", toggleFlashcardMastered);

  // Flashcard Filters
  document.getElementById("flashcard-filters").addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-chip")) {
      document.querySelectorAll("#flashcard-filters .filter-chip").forEach(c => c.classList.remove("active"));
      e.target.classList.add("active");
      state.flashcards.filter = e.target.getAttribute("data-filter");
      state.flashcards.currentIndex = 0;
      renderFlashcards();
    }
  });

  // Quiz UI Listeners
  document.getElementById("quiz-next-btn").addEventListener("click", nextQuizQuestion);
  document.getElementById("reset-quiz-btn").addEventListener("click", resetQuiz);

  // Waveform UI Listeners
  document.getElementById("waveform-preset-dropdown").addEventListener("change", (e) => {
    const preset = e.target.value;
    if (preset !== "none" && waveformPresets[preset]) {
      state.waveform.signals = JSON.parse(JSON.stringify(waveformPresets[preset]));
      renderWaveform();
    }
  });

  document.getElementById("add-signal-row-btn").addEventListener("click", addCustomSignal);

  // Dashboard Protocol Shortcuts
  document.querySelectorAll(".protocol-shortcut-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const preset = btn.getAttribute("data-preset");
      const dropdown = document.getElementById("waveform-preset-dropdown");
      dropdown.value = preset;
      state.waveform.signals = JSON.parse(JSON.stringify(waveformPresets[preset]));
      renderWaveform();
      window.location.hash = "waveform";
      switchTab("waveform");
    });
  });

  // Dashboard Prep Hub button
  document.querySelectorAll(".tab-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      window.location.hash = target;
      switchTab(target);
    });
  });

  // Company Search & Filter
  document.getElementById("company-search").addEventListener("input", renderCompanies);
  document.getElementById("company-type-filter").addEventListener("change", renderCompanies);

  // Code Sandbox Copy button
  document.getElementById("copy-code-btn").addEventListener("click", copyRTLCode);

  // Resume Matcher Listeners
  document.getElementById("analyze-resume-btn").addEventListener("click", () => {
    analyzeResume();
    crawlSiliconJobs();
  });
  document.getElementById("clear-resume-btn").addEventListener("click", clearResume);

  // Results Subtabs Listeners
  document.getElementById("btn-show-scores").addEventListener("click", showScoresPanel);
  document.getElementById("btn-show-crawler").addEventListener("click", showCrawlerPanel);

  // Crawler Filters Listeners
  document.getElementById("crawler-date-filter").addEventListener("change", renderCrawledJobs);
  document.getElementById("crawler-min-score").addEventListener("change", renderCrawledJobs);

  // Resume Upload / Template Listeners
  document.getElementById("btn-load-sample-resume").addEventListener("click", loadSampleResume);
  document.getElementById("resume-file-input").addEventListener("change", handleResumeFileUpload);
}

function switchTab(tabName) {
  // Hide all panels
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
  // Remove active state from nav links
  document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));

  // Show target panel
  const targetPanel = document.getElementById(`${tabName}-panel`);
  const targetLink = document.querySelector(`.nav-link[data-tab="${tabName}"]`);

  if (targetPanel && targetLink) {
    targetPanel.classList.add("active");
    targetLink.classList.add("active");
    state.activeTab = tabName;

    // Update Header Titles
    const titleEl = document.getElementById("current-tab-title");
    const subtitleEl = document.getElementById("current-tab-subtitle");

    const titles = {
      dashboard: { title: "Dashboard", subtitle: "Hardware acceleration for your career search" },
      tracker: { title: "Job Tracker", subtitle: "Organize and progress your semiconductor applications" },
      prep: { title: "Interview Prep Hub", subtitle: "Review critical digital design and SystemVerilog concepts" },
      waveform: { title: "Signal Architect", subtitle: "Interactive timing diagram generator for hardware protocols" },
      matcher: { title: "Silicon Matcher", subtitle: "Compare your resume against top semiconductor firms" },
      directory: { title: "Companies", subtitle: "Profiles and interview focus areas of top chipmakers" },
      sandbox: { title: "RTL Reference Library", subtitle: "Synthesizable RTL templates frequently tested in interviews" }
    };

    if (titles[tabName]) {
      titleEl.innerText = titles[tabName].title;
      subtitleEl.innerText = titles[tabName].subtitle;
    }

    // Dynamic triggers upon entering a tab
    if (tabName === 'dashboard') {
      renderDashboard();
    } else if (tabName === 'tracker') {
      renderTracker();
    } else if (tabName === 'prep') {
      renderFlashcards();
    } else if (tabName === 'matcher') {
      renderMatcher();
    }
  }
}


/* ==========================================================================
   DASHBOARD CONTROLLER
   ========================================================================== */
function renderDashboard() {
  // Update Counts
  document.getElementById("stat-applied-count").innerText = state.jobs.filter(j => j.status !== 'wishlist' && j.status !== 'archived').length;
  document.getElementById("stat-interview-count").innerText = state.jobs.filter(j => j.status === 'tech_interview' || j.status === 'hr_round').length;

  // Quiz Accuracy
  const accuracy = state.quiz.attempted > 0 ? Math.round((state.quiz.score / state.quiz.attempted) * 100) : 0;
  document.getElementById("stat-quiz-score").innerText = `${accuracy}%`;

  // Calculate Readiness Percentages based on mastered flashcards or correct answers
  // For standard gamified display, we read state.flashcards.mastered sets and quiz responses.
  const totalCards = state.flashcards.cards.length || 6;
  const masteredCount = state.flashcards.mastered.size;
  
  // Categorize cards mastered
  const topics = {
    "Digital Design": { total: 0, mastered: 0, bar: "bar-logic", pct: "bar-logic-pct" },
    "Verilog / SystemVerilog": { total: 0, mastered: 0, bar: "bar-sv", pct: "bar-sv-pct" },
    "Clock Domain Crossing (CDC)": { total: 0, mastered: 0, bar: "bar-cdc", pct: "bar-cdc-pct" },
    "Static Timing Analysis (STA)": { total: 0, mastered: 0, bar: "bar-sta", pct: "bar-sta-pct" }
  };

  // Base progress logic
  state.flashcards.cards.forEach(card => {
    if (topics[card.category]) {
      topics[card.category].total++;
      if (state.flashcards.mastered.has(card.id)) {
        topics[card.category].mastered++;
      }
    }
  });

  // Calculate percentages
  Object.keys(topics).forEach(key => {
    const topic = topics[key];
    // Give a baseline of 25% for her 2+ YOE experience so it doesn't start at 0, plus mastered increments
    const baseProgress = 40; 
    const calculated = topic.total > 0 ? Math.round((topic.mastered / topic.total) * (100 - baseProgress)) : 0;
    const finalPct = Math.min(100, baseProgress + calculated);

    document.getElementById(topic.pct).innerText = `${finalPct}%`;
    document.getElementById(topic.bar).style.width = `${finalPct}%`;
  });

  // Render Upcoming Interviews
  const eventList = document.getElementById("upcoming-events-list");
  eventList.innerHTML = "";

  const interviews = state.jobs.filter(j => (j.status === 'tech_interview' || j.status === 'hr_round') && j.date);
  
  // Sort by date ascending
  interviews.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (interviews.length === 0) {
    eventList.innerHTML = `<li class="empty-list-msg">No upcoming interviews. Add some in the Job Tracker!</li>`;
  } else {
    interviews.forEach(job => {
      const li = document.createElement("li");
      li.className = "event-item";
      
      const formattedDate = new Date(job.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });

      const label = job.status === 'tech_interview' ? 'Tech Round' : 'Manager/HR';

      li.innerHTML = `
        <div>
          <span class="event-company">${job.company}</span>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">${job.role} (${label})</div>
        </div>
        <span class="event-date">${formattedDate}</span>
      `;
      eventList.appendChild(li);
    });
  }
}


/* ==========================================================================
   JOB TRACKER CONTROLLER
   ========================================================================== */
function renderTracker() {
  // Update totals
  document.getElementById("total-jobs-count").innerText = state.jobs.length;

  const statuses = ["wishlist", "applied", "tech_interview", "hr_round", "offer"];

  // Clear containers
  statuses.forEach(status => {
    const container = document.getElementById(`cards-${status}`);
    container.innerHTML = "";
    document.getElementById(`count-${status}`).innerText = "0";
  });

  // Render Cards
  state.jobs.forEach(job => {
    const container = document.getElementById(`cards-${job.status}`);
    if (container) {
      // Increment column count
      const countEl = document.getElementById(`count-${job.status}`);
      countEl.innerText = parseInt(countEl.innerText) + 1;

      // Create card element
      const card = document.createElement("div");
      card.className = "job-card";
      card.setAttribute("draggable", "true");
      card.setAttribute("id", job.id);
      card.addEventListener("dragstart", handleDragStart);
      card.addEventListener("dragend", handleDragEnd);

      // Color coding for status dots
      const dotColors = {
        wishlist: "var(--status-wishlist)",
        applied: "var(--status-applied)",
        tech_interview: "var(--status-tech)",
        hr_round: "var(--status-hr)",
        offer: "var(--status-offer)"
      };

      const dotColor = dotColors[job.status] || "gray";

      card.innerHTML = `
        <div class="card-top">
          <span class="card-company">${job.company}</span>
          <span class="card-dot" style="background-color: ${dotColor}; box-shadow: 0 0 8px ${dotColor};"></span>
        </div>
        <div class="card-role">${job.role}</div>
        ${job.location ? `
          <div class="card-info-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>${job.location}</span>
          </div>
        ` : ''}
        ${job.date ? `
          <div class="card-info-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>${job.date}</span>
          </div>
        ` : ''}
        <div class="card-actions-row">
          <span class="card-date">${job.salary ? job.salary : '---'}</span>
          <button class="card-btn" onclick="openJobModal('${job.id}')">Edit/View</button>
        </div>
      `;

      container.appendChild(card);
    }
  });
}

// Drag & Drop Handlers
let draggedCardId = null;

function handleDragStart(e) {
  draggedCardId = this.id;
  this.classList.add("dragging");
  e.dataTransfer.setData("text/plain", this.id);
  e.dataTransfer.effectAllowed = "move";
}

function handleDragEnd() {
  this.classList.remove("dragging");
  draggedCardId = null;
}

// Exposed globally in HTML attributes
window.allowDrop = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
};

window.dropCard = function(e) {
  e.preventDefault();
  const id = e.dataTransfer.getData("text/plain");
  // Find column
  let target = e.target;
  while (target && !target.classList.contains("column-cards-container")) {
    target = target.parentElement;
  }

  if (target && id) {
    const newStatus = target.parentElement.getAttribute("data-status");
    const jobIndex = state.jobs.findIndex(j => j.id === id);
    if (jobIndex > -1 && newStatus) {
      state.jobs[jobIndex].status = newStatus;
      saveJobs();
      renderTracker();
    }
  }
};

window.openJobModal = openJobModal;

// Modal Operations
function openJobModal(jobId = null) {
  const modal = document.getElementById("job-modal");
  const form = document.getElementById("job-form");
  const modalTitle = document.getElementById("modal-title");
  const deleteBtn = document.getElementById("delete-job-btn");

  form.reset();
  document.getElementById("job-id-field").value = "";

  if (jobId) {
    modalTitle.innerText = "Edit Application Details";
    deleteBtn.classList.remove("hidden");
    const job = state.jobs.find(j => j.id === jobId);
    if (job) {
      document.getElementById("job-id-field").value = job.id;
      document.getElementById("form-company").value = job.company;
      document.getElementById("form-role").value = job.role;
      document.getElementById("form-status").value = job.status;
      document.getElementById("form-location").value = job.location || "";
      document.getElementById("form-salary").value = job.salary || "";
      document.getElementById("form-date").value = job.date || "";
      document.getElementById("form-url").value = job.url || "";
      document.getElementById("form-notes").value = job.notes || "";
    }
  } else {
    modalTitle.innerText = "Add New Application";
    deleteBtn.classList.add("hidden");
  }

  modal.classList.remove("hidden");
}

function closeJobModal() {
  document.getElementById("job-modal").classList.add("hidden");
}

function handleJobFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("job-id-field").value;
  const jobData = {
    company: document.getElementById("form-company").value.trim(),
    role: document.getElementById("form-role").value.trim(),
    status: document.getElementById("form-status").value,
    location: document.getElementById("form-location").value.trim(),
    salary: document.getElementById("form-salary").value.trim(),
    date: document.getElementById("form-date").value,
    url: document.getElementById("form-url").value.trim(),
    notes: document.getElementById("form-notes").value.trim()
  };

  if (id) {
    // Edit existing
    const index = state.jobs.findIndex(j => j.id === id);
    if (index > -1) {
      state.jobs[index] = { ...state.jobs[index], ...jobData };
    }
  } else {
    // Add new
    const newJob = {
      id: "job-" + Date.now(),
      ...jobData
    };
    state.jobs.push(newJob);
  }

  saveJobs();
  closeJobModal();
  renderTracker();
}

function handleJobDelete() {
  const id = document.getElementById("job-id-field").value;
  if (id && confirm("Are you sure you want to delete this job application?")) {
    state.jobs = state.jobs.filter(j => j.id !== id);
    saveJobs();
    closeJobModal();
    renderTracker();
  }
}


/* ==========================================================================
   INTERVIEW PREP HUB (FLASHCARDS & QUIZ)
   ========================================================================== */
function renderFlashcards() {
  const cardElement = document.getElementById("flashcard-element");
  
  // Filter cards
  const filteredCards = state.flashcards.cards.filter(c => {
    if (state.flashcards.filter === 'All') return true;
    return c.category === state.flashcards.filter;
  });

  const totalCount = filteredCards.length;
  document.getElementById("card-total-count").innerText = totalCount;

  if (totalCount === 0) {
    document.getElementById("card-current-index").innerText = "0";
    document.getElementById("card-front-category").innerText = "None";
    document.getElementById("card-front-text").innerText = "No flashcards found in this category.";
    document.getElementById("card-back-category").innerText = "None";
    document.getElementById("card-back-text").innerText = "";
    return;
  }

  // Bound index safety
  if (state.flashcards.currentIndex >= totalCount) {
    state.flashcards.currentIndex = 0;
  } else if (state.flashcards.currentIndex < 0) {
    state.flashcards.currentIndex = totalCount - 1;
  }

  document.getElementById("card-current-index").innerText = state.flashcards.currentIndex + 1;

  const card = filteredCards[state.flashcards.currentIndex];
  
  // Flip card back to front before updating content to avoid revealing answers early
  cardElement.classList.remove("flipped");

  // Render elements after a slight timeout if it was flipped to let animation finish,
  // but since we render synchronously here, we just replace contents.
  document.getElementById("card-front-category").innerText = card.category;
  document.getElementById("card-front-text").innerText = card.front;
  document.getElementById("card-back-category").innerText = `${card.category} (Solution)`;
  document.getElementById("card-back-text").innerText = card.back;

  // Update master toggle button text
  const masteredBtn = document.getElementById("mark-mastered-btn");
  if (state.flashcards.mastered.has(card.id)) {
    masteredBtn.innerText = "Mastered (Click to Review Again)";
    masteredBtn.style.color = "var(--status-offer)";
    masteredBtn.style.borderColor = "var(--status-offer)";
  } else {
    masteredBtn.innerText = "Mark as Mastered";
    masteredBtn.style.color = "var(--text-primary)";
    masteredBtn.style.borderColor = "rgba(255, 255, 255, 0.1)";
  }
}

function toggleFlashcardFlip() {
  this.classList.toggle("flipped");
}

function nextFlashcard() {
  state.flashcards.currentIndex++;
  renderFlashcards();
}

function prevFlashcard() {
  state.flashcards.currentIndex--;
  renderFlashcards();
}

function toggleFlashcardMastered(e) {
  e.stopPropagation(); // Avoid flipping the card when clicking the button

  const filteredCards = state.flashcards.cards.filter(c => {
    if (state.flashcards.filter === 'All') return true;
    return c.category === state.flashcards.filter;
  });

  const card = filteredCards[state.flashcards.currentIndex];
  if (card) {
    if (state.flashcards.mastered.has(card.id)) {
      state.flashcards.mastered.delete(card.id);
    } else {
      state.flashcards.mastered.add(card.id);
    }
    renderFlashcards();
    renderDashboard(); // refresh dashboard progress bars
  }
}

// Practice Quiz Engine
function renderQuiz() {
  const qState = state.quiz;
  const questionNumEl = document.getElementById("quiz-question-num");
  const categoryEl = document.getElementById("quiz-question-category");
  const textEl = document.getElementById("quiz-question-text");
  const optionsContainer = document.getElementById("quiz-options-container");
  const explanationContainer = document.getElementById("quiz-explanation-container");
  const nextBtn = document.getElementById("quiz-next-btn");

  // Reset display values
  document.getElementById("quiz-score-val").innerText = qState.score;
  document.getElementById("quiz-attempted-val").innerText = qState.attempted;

  const totalQ = qState.questions.length;
  if (totalQ === 0) return;

  // Set Progress Bar
  const progressPct = totalQ > 0 ? ((qState.currentIndex) / totalQ) * 100 : 0;
  document.getElementById("quiz-progress").style.width = `${progressPct}%`;

  if (qState.currentIndex >= totalQ) {
    // Quiz finished
    questionNumEl.innerText = "Quiz Completed!";
    categoryEl.innerText = "Finished";
    textEl.innerHTML = `Great job! You answered all questions. <br><br>Final Score: <strong>${qState.score}</strong> out of <strong>${totalQ}</strong> (Accuracy: ${Math.round((qState.score/totalQ)*100)}%)`;
    optionsContainer.innerHTML = "";
    explanationContainer.classList.add("hidden");
    nextBtn.classList.add("hidden");
    return;
  }

  const question = qState.questions[qState.currentIndex];
  
  questionNumEl.innerText = `Question ${qState.currentIndex + 1} of ${totalQ}`;
  categoryEl.innerText = question.category;
  textEl.innerText = question.question;

  optionsContainer.innerHTML = "";
  explanationContainer.classList.add("hidden");
  nextBtn.classList.add("hidden");
  qState.answered = false;

  // Generate options
  question.options.forEach((optText, index) => {
    const optionDiv = document.createElement("div");
    optionDiv.className = "quiz-option";
    optionDiv.innerHTML = `
      <div class="quiz-option-marker">${String.fromCharCode(65 + index)}</div>
      <span>${optText}</span>
    `;
    optionDiv.addEventListener("click", () => handleQuizOptionClick(index, optionDiv));
    optionsContainer.appendChild(optionDiv);
  });
}

function handleQuizOptionClick(selectedIndex, optionElement) {
  const qState = state.quiz;
  if (qState.answered) return; // Prevent double clicking

  qState.answered = true;
  qState.attempted++;

  const question = qState.questions[qState.currentIndex];
  const correctIndex = question.answer;

  const optionsList = document.querySelectorAll(".quiz-option");

  optionsList.forEach((opt, idx) => {
    opt.classList.add("disabled");
    if (idx === correctIndex) {
      opt.classList.add("correct");
    } else if (idx === selectedIndex) {
      opt.classList.add("incorrect");
    }
  });

  if (selectedIndex === correctIndex) {
    qState.score++;
  }

  // Update Score counters
  document.getElementById("quiz-score-val").innerText = qState.score;
  document.getElementById("quiz-attempted-val").innerText = qState.attempted;

  // Reveal Explanation
  const explanationText = document.getElementById("quiz-explanation-text");
  explanationText.innerText = question.explanation;
  document.getElementById("quiz-explanation-container").classList.remove("hidden");

  // Show Next Button
  document.getElementById("quiz-next-btn").classList.remove("hidden");
}

function nextQuizQuestion() {
  state.quiz.currentIndex++;
  renderQuiz();
}

function resetQuiz() {
  state.quiz.currentIndex = 0;
  state.quiz.score = 0;
  state.quiz.attempted = 0;
  state.quiz.answered = false;
  renderQuiz();
  renderDashboard(); // refresh accuracy stat on dashboard
}


/* ==========================================================================
   SIGNAL ARCHITECT (INTERACTIVE WAVEFORM VISUALIZER)
   ========================================================================== */
function renderWaveform() {
  // 1. Draw SVG Timing Diagram
  drawWaveformSVG();

  // 2. Populate interactive timeline grid editor
  buildInteractiveGrid();

  // 3. Build left signal settings editor list
  buildSignalListEditor();
}

function drawWaveformSVG() {
  const wrapper = document.getElementById("svg-render-wrapper");
  const signals = state.waveform.signals;
  const cycles = state.waveform.cyclesCount;

  if (signals.length === 0) {
    wrapper.innerHTML = "<p style='color: var(--text-muted); text-align: center; padding: 2rem;'>No signals defined. Add a signal to start!</p>";
    return;
  }

  // Dimensions
  const signalHeight = 45;
  const signalGap = 15;
  const labelWidth = 120;
  const cycleWidth = 40;
  const headerHeight = 30;
  const footerHeight = 10;
  
  const width = labelWidth + (cycles * cycleWidth) + 20;
  const height = headerHeight + (signals.length * (signalHeight + signalGap)) + footerHeight;

  let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background-color: #040810; font-family: var(--font-code);">`;

  // Define Gradients and Patterns
  svgContent += `
    <defs>
      <pattern id="gridPattern" width="${cycleWidth}" height="${height}" patternUnits="userSpaceOnUse">
        <line x1="${cycleWidth}" y1="0" x2="${cycleWidth}" y2="${height}" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
      </pattern>
      <linearGradient id="busGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(16, 185, 129, 0.15)" />
        <stop offset="100%" stop-color="rgba(0, 242, 254, 0.15)" />
      </linearGradient>
      <linearGradient id="unknownGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(255, 123, 0, 0.05)" />
        <stop offset="100%" stop-color="rgba(255, 123, 0, 0.15)" />
      </linearGradient>
    </defs>
  `;

  // Draw Grid background in waveform area
  svgContent += `<rect x="${labelWidth}" y="0" width="${cycles * cycleWidth}" height="${height}" fill="url(#gridPattern)" />`;

  // Vertical boundary line separating labels and waves
  svgContent += `<line x1="${labelWidth}" y1="0" x2="${labelWidth}" y2="${height}" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />`;

  // Cycle numbers at top
  for (let c = 0; c < cycles; c++) {
    const x = labelWidth + (c * cycleWidth) + (cycleWidth / 2);
    svgContent += `<text x="${x}" y="20" fill="var(--text-muted)" font-size="10" text-anchor="middle">T${c}</text>`;
  }

  // Draw waveforms
  signals.forEach((sig, index) => {
    const signalY = headerHeight + (index * (signalHeight + signalGap));
    const waveBaseY = signalY + signalHeight - 5;
    const waveHighY = signalY + 5;
    const waveMidY = signalY + (signalHeight / 2);
    const waveH = signalHeight - 10;

    // Signal Label text
    svgContent += `
      <text x="${labelWidth - 15}" y="${waveMidY + 4}" fill="var(--text-primary)" font-size="12" font-weight="600" text-anchor="end">${sig.name}</text>
    `;

    // Path string builder
    let pathD = "";
    let fillElements = ""; // buses and unknowns require colored polygon overlays

    for (let c = 0; c < cycles; c++) {
      const stateVal = sig.states[c] || "0";
      const xStart = labelWidth + (c * cycleWidth);
      const xEnd = xStart + cycleWidth;

      const prevVal = c > 0 ? sig.states[c - 1] : stateVal;

      if (sig.type === "clock" || sig.type === "binary") {
        const yVal = stateVal === "1" ? waveHighY : waveBaseY;
        const prevY = prevVal === "1" ? waveHighY : waveBaseY;

        if (c === 0) {
          pathD += `M ${xStart} ${yVal}`;
        } else {
          // transition edge line
          if (prevVal !== stateVal) {
            pathD += ` L ${xStart} ${yVal}`;
          }
        }
        pathD += ` L ${xEnd} ${yVal}`;
      } 
      else if (sig.type === "bus") {
        // Bus lines require drawing double lines (top & bottom)
        const isUnknown = stateVal === "X";
        const isHiZ = stateVal === "Z";

        if (isHiZ) {
          // flat middle line
          if (c === 0 || prevVal !== "Z") {
            pathD += ` M ${xStart} ${waveMidY}`;
          }
          pathD += ` L ${xEnd} ${waveMidY}`;
        } 
        else if (isUnknown) {
          // Hatching or gradient for unknown blocks
          fillElements += `<rect x="${xStart}" y="${waveHighY}" width="${cycleWidth}" height="${waveH}" fill="url(#unknownGrad)" stroke="var(--accent-orange)" stroke-width="1" />`;
          fillElements += `<line x1="${xStart}" y1="${waveHighY}" x2="${xEnd}" y2="${waveBaseY}" stroke="rgba(255, 123, 0, 0.4)" stroke-width="1" />`;
          fillElements += `<line x1="${xStart}" y1="${waveBaseY}" x2="${xEnd}" y2="${waveHighY}" stroke="rgba(255, 123, 0, 0.4)" stroke-width="1" />`;
        }
        else {
          // Bus segment: standard "D" representing valid data
          // Draw standard hexagonal bubble outline and filled background
          const bevel = 6;
          
          // Determine if we need a start bevel
          const startBevel = (c === 0 || prevVal === "Z" || prevVal === "X" || prevVal !== stateVal);
          
          // Determine if we need an end bevel
          const nextVal = c < cycles - 1 ? sig.states[c + 1] : null;
          const endBevel = (c === cycles - 1 || nextVal === "Z" || nextVal === "X" || nextVal !== stateVal);

          const leftX = startBevel ? xStart + bevel : xStart;
          const rightX = endBevel ? xEnd - bevel : xEnd;

          let points = [];
          if (startBevel) {
            points.push(`${xStart},${waveMidY}`);
            points.push(`${leftX},${waveHighY}`);
          } else {
            points.push(`${xStart},${waveHighY}`);
          }

          if (endBevel) {
            points.push(`${rightX},${waveHighY}`);
            points.push(`${xEnd},${waveMidY}`);
            points.push(`${rightX},${waveBaseY}`);
          } else {
            points.push(`${xEnd},${waveHighY}`);
            points.push(`${xEnd},${waveBaseY}`);
          }

          if (startBevel) {
            points.push(`${leftX},${waveBaseY}`);
          } else {
            points.push(`${xStart},${waveBaseY}`);
          }

          const busPolyPoints = points.join(" ");

          fillElements += `<polygon points="${busPolyPoints}" fill="url(#busGrad)" stroke="var(--status-offer)" stroke-width="1.5" />`;

          // Write Data Label text if it's a multi-cycle bus block or unique value label
          let labelText = stateVal === "D" ? "DATA" : stateVal;
          // Only render text label if it's the start of the data segment
          if (prevVal !== stateVal) {
            // Find how many cycles this data spans to center text
            let span = 1;
            for (let nextC = c + 1; nextC < cycles; nextC++) {
              if (sig.states[nextC] === stateVal) {
                span++;
              } else {
                break;
              }
            }
            const textCenterX = xStart + ((span * cycleWidth) / 2);
            svgContent += `<text x="${textCenterX}" y="${waveMidY + 4}" fill="var(--text-primary)" font-size="9" font-weight="700" text-anchor="middle">${labelText}</text>`;
          }
        }
      }
    }

    // Output paths
    if (pathD) {
      const strokeColor = sig.type === "clock" ? "var(--primary-blue)" : "var(--primary-cyan)";
      svgContent += `<path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linejoin="round" />`;
    }

    if (fillElements) {
      svgContent += fillElements;
    }
  });

  svgContent += "</svg>";
  wrapper.innerHTML = svgContent;
}

function buildInteractiveGrid() {
  const tbody = document.getElementById("matrix-body-rows");
  const signals = state.waveform.signals;
  const cycles = state.waveform.cyclesCount;

  tbody.innerHTML = "";

  signals.forEach((sig, sigIdx) => {
    const tr = document.createElement("tr");
    
    // Name Column
    const nameTd = document.createElement("td");
    nameTd.className = "matrix-sig-name-col";
    nameTd.innerText = sig.name;
    tr.appendChild(nameTd);

    // Type Column
    const typeTd = document.createElement("td");
    typeTd.className = "matrix-sig-type-col";
    typeTd.innerText = sig.type;
    tr.appendChild(typeTd);

    // 16 States Buttons
    for (let c = 0; c < cycles; c++) {
      const td = document.createElement("td");
      const stateVal = sig.states[c] || "0";
      
      const btn = document.createElement("button");
      btn.className = `matrix-cell-btn state-${stateVal.startsWith("D") ? "D" : stateVal}`;
      btn.innerText = stateVal.startsWith("D") && stateVal !== "D" ? stateVal : stateVal;
      
      btn.addEventListener("click", () => toggleCellState(sigIdx, c, btn));
      btn.addEventListener("dblclick", (e) => {
        e.preventDefault();
        if (sig.type === "bus") {
          editBusLabel(sigIdx, c, btn);
        }
      });

      td.appendChild(btn);
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });
}

function toggleCellState(sigIdx, cycleIdx, btnElement) {
  const sig = state.waveform.signals[sigIdx];
  const currentState = sig.states[cycleIdx];

  let nextState = "0";

  if (sig.type === "clock" || sig.type === "binary") {
    nextState = currentState === "0" ? "1" : "0";
  } else if (sig.type === "bus") {
    // Cycle states: D -> X -> Z -> D
    if (currentState.startsWith("D")) {
      nextState = "X";
    } else if (currentState === "X") {
      nextState = "Z";
    } else if (currentState === "Z") {
      nextState = "D";
    } else {
      nextState = "0"; // fallback
    }
  }

  sig.states[cycleIdx] = nextState;
  
  // Update button presentation
  btnElement.className = `matrix-cell-btn state-${nextState.startsWith("D") ? "D" : nextState}`;
  btnElement.innerText = nextState.startsWith("D") && nextState !== "D" ? nextState : nextState;

  // Redraw SVG
  drawWaveformSVG();
}

function editBusLabel(sigIdx, cycleIdx, btnElement) {
  const sig = state.waveform.signals[sigIdx];
  const label = prompt("Enter text label for bus segment (e.g. ADDR1, DATA_IN, IDLE):", sig.states[cycleIdx]);
  
  if (label !== null) {
    const sanitized = label.trim().substring(0, 8); // truncate if too long
    sig.states[cycleIdx] = sanitized || "D";
    btnElement.innerText = sanitized || "D";
    btnElement.className = "matrix-cell-btn state-D";
    drawWaveformSVG();
  }
}

function buildSignalListEditor() {
  const container = document.getElementById("signals-rows-config");
  container.innerHTML = "";

  state.waveform.signals.forEach((sig, index) => {
    const row = document.createElement("div");
    row.className = "signal-row-config-item";
    
    // Assign trace color highlight dynamically
    const colors = ["var(--primary-cyan)", "var(--primary-blue)", "var(--accent-purple)", "var(--accent-orange)", "var(--status-offer)"];
    const traceColor = colors[index % colors.length];

    row.innerHTML = `
      <div class="sig-color-indicator" style="background-color: ${traceColor}"></div>
      <input type="text" class="sig-name-input" value="${sig.name}" data-index="${index}">
      <select class="sig-type-select" data-index="${index}">
        <option value="binary" ${sig.type === "binary" ? "selected" : ""}>Binary</option>
        <option value="clock" ${sig.type === "clock" ? "selected" : ""}>Clock</option>
        <option value="bus" ${sig.type === "bus" ? "selected" : ""}>Bus</option>
      </select>
      <button class="delete-sig-btn" data-index="${index}">&times;</button>
    `;

    // Listeners for inline modifications
    row.querySelector(".sig-name-input").addEventListener("change", (e) => {
      const idx = e.target.getAttribute("data-index");
      state.waveform.signals[idx].name = e.target.value.trim().substring(0, 12);
      renderWaveform();
    });

    row.querySelector(".sig-type-select").addEventListener("change", (e) => {
      const idx = e.target.getAttribute("data-index");
      const newType = e.target.value;
      state.waveform.signals[idx].type = newType;
      
      // Reset state values to match type
      if (newType === "clock") {
        state.waveform.signals[idx].states = Array(16).fill(null).map((_, i) => i % 2 === 0 ? "0" : "1");
      } else if (newType === "binary") {
        state.waveform.signals[idx].states = Array(16).fill("0");
      } else {
        state.waveform.signals[idx].states = Array(16).fill("Z");
      }
      renderWaveform();
    });

    row.querySelector(".delete-sig-btn").addEventListener("click", () => {
      state.waveform.signals.splice(index, 1);
      document.getElementById("waveform-preset-dropdown").value = "none";
      renderWaveform();
    });

    container.appendChild(row);
  });
}

function addCustomSignal() {
  const signalName = `sig_new_${state.waveform.signals.length}`;
  state.waveform.signals.push({
    name: signalName,
    type: "binary",
    states: Array(16).fill("0")
  });
  document.getElementById("waveform-preset-dropdown").value = "none";
  renderWaveform();
}



/* ==========================================================================
   SILICON MATCHER CONTROLLER (RESUME ANALYZER & LIVE CRAWLER)
   ========================================================================== */
const sampleResumeText = `YASWANTHINI S
RTL DESIGN ENGINEER
+91 9361575908 · yaswanthini22@gmail.com

PROFESSIONAL SUMMARY
RTL Design Engineer with 2+ years of experience in digital design and SoC development. Skilled in Verilog RTL coding, microarchitecture design, AMBA AHB/APB/I2C protocols, CDC/RDC, Lint, DFT, LEC, and STA using Cadence JasperGold and Genus. Hands-on experience designing Asynchronous FIFOs, UART, Router, and FSM-based modules, with exposure to mixed-signal behavioral modeling, power management IPs, synthesis, and PPA optimization. Strong cross-functional collaborator with experience working alongside DV, PD, and firmware teams through tape-out activities.

TECHNICAL SKILLS
- Languages: Verilog, SystemVerilog, VHDL, TCL Scripting
- Protocols: AMBA AHB, AMBA APB, UART, I2C, JTAG
- Design: RTL Micro-Architecture, ASIC Design Flow, GPU Block Design, Mixed-Signal Behavioral Modeling, CDC/RDC Analysis, Lint Analysis (Cadence JasperGold), DFT, LEC, STA, FSM Design, Asynchronous FIFO Design, PPA Optimization, Constraint Development, Synthesis, Power Management IPs, Memory Architecture
- EDA Tools: JasperGold (Lint/Formal), ModelSim, Cadence Simulation, Cadence Genus, Quartus Prime
- Collaboration: DV Test Plan Review, Tape-out Sign-off, Cross-functional Architecture Spec Development, Firmware Interface Definition

PROFESSIONAL EXPERIENCE
RTL Design Engineer | Incise Infotech Limited (2025 – Present) | Noida, India
- Developed RTL and micro-architecture for high-performance digital blocks using Verilog.
- Performed CDC/RDC, Lint, and LEC analysis using Cadence JasperGold; collaborated with DV teams for feature validation and sign-off.
- Worked on FSMs, FIFOs, and protocol controllers with focus on timing closure, STA, and PPA optimization.
- Executed synthesis and digital timing analysis using Cadence Genus to meet design targets.
- Contributed to DFT integration and partnered with back-end team through chip tape-out.

RTL Design Engineer | PrimeSOC Technologies (2025) | Bangalore, India
- Designed and implemented RTL modules for SoC digital blocks and protocol-based features.
- Performed Lint, CDC, and STA analysis to ensure clean RTL for tape-out readiness.
- Collaborated with PD and DV teams for timing closure, verification, and PPA improvement.
- Developed behavioral models for mixed-signal interface blocks and supported firmware team in defining program flow.

RTL Design Engineer | Multilink Technologies (May 2023 – 2024) | India
- Developed Verilog RTL for UART TX/RX and AMBA AHB/APB based digital interfaces.
- Debugged functional issues using ModelSim and supported simulation sign-off activities.
- Contributed to CDC checks, micro-architecture development, and DV testbench reviews.

PROJECTS
1. GPU-Style Micro-Architecture Block — FSM, Arbitration & Pipeline Control
- Architected a packet-based routing block with centralized FSM, priority arbitration, and round-robin scheduling across 4 output ports.
- Developed micro-architecture specifications, timing diagrams, and interface protocols; achieved 100% Lint clean and LEC-clean sign-off.
- Achieved timing closure at 500 MHz on 28nm node with PPA within 5% target.

2. Asynchronous FIFO with CDC & Metastability Handling
- Designed parameterized asynchronous FIFO using Gray code synchronization across dual clock domains.
- Performed CDC/RDC analysis with zero unresolved violations; resolved metastability-related structural issues.
- Achieved 12% area reduction through RTL optimization; delivered reusable RTL IP for SoC integration.

3. AMBA AHB & APB Subsystem
- Designed AHB master/slave RTL and AHB-to-APB bridge supporting multiple burst transactions.
- Validated protocol functionality across simulation environments using self-checking testbenches.
- Supported timing sign-off at 200 MHz; contributed to STA and LEC closure.

4. UART Full-Duplex Controller with Error Detection
- Implemented configurable UART controller with fractional baud rate generator and 16x oversampling.
- Added parity, frame, and overrun error detection with interrupt support for reliable communication.
- Verified functionality using directed/random testbenches.

5. Parameterized Clock Divider — Low Power Clock Generation
- Designed parameterized integer/fractional clock divider with glitch-free clock switching logic.
- Achieved 22% dynamic power reduction through synthesis-based PPA optimization.
- Delivered reusable parameterized RTL IP with synthesis scripts for downstream subsystem integration.

EDUCATION
- Bachelor of Engineering — Electronics and Communication Engineering
  Dr. Mahalingam College of Engineering and Technology (2023) | CGPA: 8.0 / 10.0

CERTIFICATIONS & TRAINING
- Advanced Chip Design and Verification — Maven Silicon (2024–2025)`;

function loadSampleResume() {
  const textarea = document.getElementById("resume-text-input");
  if (textarea) {
    textarea.value = sampleResumeText;
    state.resumeText = sampleResumeText;
    localStorage.setItem("siliconquest_resume", sampleResumeText);
    analyzeResume();
    crawlSiliconJobs();
  }
}

function handleResumeFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const text = evt.target.result;
    const textarea = document.getElementById("resume-text-input");
    if (textarea) {
      textarea.value = text;
      state.resumeText = text;
      localStorage.setItem("siliconquest_resume", text);
      analyzeResume();
      crawlSiliconJobs();
    }
  };
  reader.readAsText(file);
}

const rtlMasterKeywords = [
  "Verilog", "SystemVerilog", "UVM", "OVM", "VHDL", "SVA", "DPI", 
  "AXI", "APB", "AHB", "CHI", "PCIe", "USB", "DDR", "HBM", "SerDes", 
  "SPI", "I2C", "UART", "CDC", "STA", "DFT", "synthesis", "FSM", 
  "GPU", "CPU", "RISC-V", "SoC", "ASIC", "FPGA", "low-power", 
  "clock gating", "setup/hold", "metastability", "formal verification",
  "C++", "Python", "Tcl", "Perl", "Shell", "Spyglass", "PrimeTime",
  "VCS", "Design Compiler", "ModelSim", "LEC", "Genus", "JTAG"
];

let currentMatcherSubtab = "scores"; // "scores" or "crawler"

function renderMatcher() {
  renderSearchLinks();
  const textarea = document.getElementById("resume-text-input");
  if (textarea) {
    textarea.value = state.resumeText || "";
  }
  if (state.resumeText && state.resumeText.trim().length > 0) {
    analyzeResume();
  }
}

function renderSearchLinks() {
  const container = document.getElementById("search-links-container");
  if (!container || container.children.length > 0) return;
  
  if (typeof mockData === "undefined" || !mockData.searchLinks) return;

  mockData.searchLinks.forEach(link => {
    const a = document.createElement("a");
    a.className = "search-portal-link";
    a.href = link.url;
    a.target = "_blank";
    a.innerHTML = `
      <span>${link.name}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
    `;
    container.appendChild(a);
  });
}

function showScoresPanel() {
  currentMatcherSubtab = "scores";
  document.getElementById("btn-show-scores").classList.add("active");
  document.getElementById("btn-show-crawler").classList.remove("active");
  document.getElementById("company-scores-view").classList.remove("hidden");
  document.getElementById("live-crawler-view").classList.add("hidden");
  
  const count = document.querySelectorAll("#matcher-results-list .match-result-item").length;
  document.getElementById("match-results-count").innerText = `${count} Companies`;
}

function showCrawlerPanel() {
  currentMatcherSubtab = "crawler";
  document.getElementById("btn-show-crawler").classList.add("active");
  document.getElementById("btn-show-scores").classList.remove("active");
  document.getElementById("live-crawler-view").classList.remove("hidden");
  document.getElementById("company-scores-view").classList.add("hidden");
  
  const count = document.querySelectorAll("#crawler-results-list .live-job-item").length;
  document.getElementById("match-results-count").innerText = `${count} Jobs`;
}

function extractSkills(resumeText) {
  return rtlMasterKeywords.filter(kw => containsKeyword(resumeText, kw));
}

function calculateJobMatch(userSkills, jobText) {
  if (userSkills.length === 0) return { score: 0, matched: [], missing: [] };
  
  // Find all RTL keywords mentioned in the job description
  const jobSkills = rtlMasterKeywords.filter(kw => containsKeyword(jobText, kw));
  
  // Matched skills are those the user has AND the job mentions
  const matched = userSkills.filter(skill => jobSkills.includes(skill));
  
  // Missing/Recommended skills are those the job mentions but the user does NOT have
  const missing = jobSkills.filter(skill => !userSkills.includes(skill));
  
  // Match score is the percentage of the job's skills that the user matches
  const score = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 0;
  
  return { score, matched, missing };
}

function checkExperienceRequirements(jobText) {
  const expRegex = /\b([0-9]+)\s*(?:-|to)\s*([0-9]+)\s*(?:years?|yoe)\b/gi;
  const singleExpRegex = /\b([0-9]+)\s*(?:\+|plus)?\s*(?:years?|yoe)\b/gi;
  
  let minYears = null;
  let maxYears = null;

  const rangeMatch = [...jobText.matchAll(expRegex)];
  if (rangeMatch.length > 0) {
    minYears = parseInt(rangeMatch[0][1]);
    maxYears = parseInt(rangeMatch[0][2]);
  } else {
    const singleMatch = [...jobText.matchAll(singleExpRegex)];
    if (singleMatch.length > 0) {
      const years = singleMatch.map(m => parseInt(m[1]));
      minYears = Math.min(...years);
    }
  }

  let label = "Mid Level";
  let matchesProfile = true; 

  if (minYears !== null) {
    if (minYears <= 3) {
      label = `${minYears}${maxYears ? '-' + maxYears : '+'} YOE Required`;
      matchesProfile = true; 
    } else {
      label = `${minYears}+ YOE (Senior)`;
      matchesProfile = false; 
    }
  } else {
    const isSenior = /senior|lead|principal|staff/i.test(jobText);
    const isJunior = /junior|entry|associate|graduate/i.test(jobText);
    if (isSenior) {
      label = "Senior Level";
      matchesProfile = false;
    } else if (isJunior) {
      label = "Junior / Entry Level";
      matchesProfile = true;
    }
  }

  return { label, matchesProfile };
}

async function crawlSiliconJobs() {
  const text = state.resumeText;
  if (!text || text.trim().length === 0) return;

  const userSkills = extractSkills(text);
  if (userSkills.length === 0) {
    return; // Already alerts in analyzeResume
  }

  const loader = document.getElementById("crawler-loading-status");
  const resultsContainer = document.getElementById("crawler-results-list");
  const progressBar = document.getElementById("crawler-progress-bar");
  const progressText = document.getElementById("crawler-loading-step");

  if (!loader || !resultsContainer || !progressBar || !progressText) return;

  loader.classList.remove("hidden");
  progressBar.style.width = "0%";
  progressText.innerText = "Connecting to semiconductor job boards...";
  resultsContainer.innerHTML = "";

  // Switch tab automatically to crawler so she sees progress!
  showCrawlerPanel();

  const companies = mockData.greenhouseCompanies || [];
  const total = companies.length;
  let completed = 0;
  const crawledJobs = [];

  const updateProgress = (companyName) => {
    completed++;
    const pct = Math.round((completed / total) * 100);
    progressBar.style.width = `${pct}%`;
    progressText.innerText = `Scanning board: ${companyName} (${pct}%)`;
  };

  const promises = companies.map(async (company) => {
    try {
      if (company.type === "Greenhouse") {
        const response = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company.token}/jobs?content=true`);
        if (!response.ok) throw new Error("API failed");
        
        const data = await response.json();
        const jobs = data.jobs || [];

        jobs.forEach(job => {
          const title = job.title;
          const isHardware = /RTL|Design|ASIC|FPGA|Verilog|SystemVerilog|Hardware|SoC|Silicon|Logic|Processor/i.test(title);
          
          if (isHardware) {
            const contentHTML = job.content || "";
            const contentText = contentHTML.replace(/<[^>]*>/g, ' ');
            const match = calculateJobMatch(userSkills, contentText);
            const exp = checkExperienceRequirements(contentText);
            
            crawledJobs.push({
              company: company.name,
              title: title,
              url: job.absolute_url,
              score: match.score,
              matched: match.matched,
              missing: match.missing,
              expLabel: exp.label,
              matchesProfile: exp.matchesProfile,
              location: job.location ? job.location.name : "Remote / US",
              date: job.updated_at || new Date().toISOString()
            });
          }
        });
      } 
      else if (company.type === "Lever") {
        const response = await fetch(`https://api.lever.co/v0/postings/${company.token}?mode=json`);
        if (!response.ok) throw new Error("API failed");
        
        const jobs = await response.json();

        jobs.forEach(job => {
          const title = job.title;
          const isHardware = /RTL|Design|ASIC|FPGA|Verilog|SystemVerilog|Hardware|SoC|Silicon|Logic|Processor/i.test(title);
          
          if (isHardware) {
            let descText = (job.description || "") + " " + (job.requirements || "");
            if (job.lists) {
              job.lists.forEach(list => {
                descText += " " + (list.text || "") + " " + (list.content || "");
              });
            }
            const match = calculateJobMatch(userSkills, descText);
            const exp = checkExperienceRequirements(descText);
            
            crawledJobs.push({
              company: company.name,
              title: title,
              url: job.hostedUrl,
              score: match.score,
              matched: match.matched,
              missing: match.missing,
              expLabel: exp.label,
              matchesProfile: exp.matchesProfile,
              location: job.categories ? (job.categories.location || "Remote") : "Remote",
              date: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString()
            });
          }
        });
      }
    } catch (err) {
      console.warn(`Failed to crawl jobs for ${company.name}:`, err);
    } finally {
      updateProgress(company.name);
    }
  });

  await Promise.all(promises);

  loader.classList.add("hidden");
  state.crawledJobs = crawledJobs;
  renderCrawledJobs();
}

function timeAgo(dateStr) {
  if (!dateStr) return "Unknown date";
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }
  const months = Math.floor(diffDays / 30);
  return `${months} ${months === 1 ? "month" : "months"} ago`;
}

function renderCrawledJobs() {
  const resultsContainer = document.getElementById("crawler-results-list");
  if (!resultsContainer) return;

  const dateFilterEl = document.getElementById("crawler-date-filter");
  const minScoreEl = document.getElementById("crawler-min-score");
  
  const dateFilterVal = dateFilterEl ? dateFilterEl.value : "all";
  const minScoreVal = minScoreEl ? parseInt(minScoreEl.value || "50") : 50;

  resultsContainer.innerHTML = "";

  // Filter jobs
  const filteredJobs = state.crawledJobs.filter(job => {
    // 1. Min Score Filter
    if (job.score < minScoreVal) return false;

    // 2. Date Filter
    if (dateFilterVal !== "all" && job.date) {
      const jobDate = new Date(job.date);
      const now = new Date();
      const diffTime = Math.abs(now - jobDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const maxDays = parseInt(dateFilterVal) * 7;
      if (diffDays > maxDays) return false;
    }

    return true;
  });

  if (filteredJobs.length === 0) {
    resultsContainer.innerHTML = `
      <div class="matcher-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="color: var(--text-muted); margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        <p>No active openings match the current filters. Try lowering the match score threshold or changing the date filter!</p>
      </div>
    `;
  } else {
    // Sort by score descending, then matchesProfile descending, then company name
    filteredJobs.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.matchesProfile !== b.matchesProfile) return b.matchesProfile ? -1 : 1;
      return a.company.localeCompare(b.company);
    });

    filteredJobs.forEach(job => {
      const item = document.createElement("div");
      item.className = "live-job-item";

      const matchedBadges = job.matched.map(kw => `<span class="badge-matched">${kw}</span>`).join("");
      const missingBadges = job.missing.map(kw => `<span class="badge-missing">${kw}</span>`).join("");

      const expBadgeClass = job.matchesProfile ? "badge-exp matches-profile" : "badge-exp";
      const expBadgeText = job.matchesProfile ? `✓ ${job.expLabel}` : job.expLabel;

      item.innerHTML = `
        <div class="live-job-company">${job.company}</div>
        <h4 class="live-job-title">${job.title}</h4>
        
        <div class="live-job-meta-row">
          <div class="live-job-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>${job.location}</span>
          </div>
          <div class="live-job-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>${timeAgo(job.date)}</span>
          </div>
          <span class="${expBadgeClass}">${expBadgeText}</span>
        </div>

        <div class="match-bar-track" style="margin-bottom: 0.75rem;">
          <div class="match-bar-fill" style="width: ${job.score}%"></div>
        </div>

        <div class="match-skills-section" style="margin-top: 0.5rem;">
          ${job.matched.length > 0 ? `
            <span class="match-skills-label">Matched Skills:</span>
            <div class="skills-grid">${matchedBadges}</div>
          ` : ""}
          ${job.missing.length > 0 ? `
            <span class="match-skills-label">Missing Target Skills:</span>
            <div class="skills-grid">${missingBadges}</div>
          ` : ""}
        </div>

        <div class="live-job-footer">
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--primary-cyan);">${job.score}% Match</span>
          <a href="${job.url}" target="_blank" class="live-job-link">
            <span>Apply Now</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </a>
        </div>
      `;

      resultsContainer.appendChild(item);
    });
  }

  if (currentMatcherSubtab === "crawler") {
    document.getElementById("match-results-count").innerText = `${filteredJobs.length} Jobs`;
  }
}

function clearResume() {
  state.resumeText = "";
  localStorage.removeItem("siliconquest_resume");
  const textarea = document.getElementById("resume-text-input");
  if (textarea) {
    textarea.value = "";
  }
  
  document.getElementById("match-results-count").innerText = "0 Companies";
  document.getElementById("matcher-results-desc").innerText = "Paste your resume and click 'Analyze & Crawl' to compute keyword match indexes.";
  document.getElementById("matcher-results-list").innerHTML = `
    <div class="matcher-placeholder">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="color: var(--text-muted); margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
      <p>Enter your resume credentials to run the matching compiler.</p>
    </div>
  `;

  document.getElementById("crawler-results-list").innerHTML = `
    <div class="matcher-placeholder" id="crawler-placeholder-msg">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="color: var(--text-muted); margin-bottom: 1rem;"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      <p>Crawl live Greenhouse/Lever listings for openings with &lt;3 YOE and &gt;50% match score.</p>
    </div>
  `;
}

function containsKeyword(text, keyword) {
  const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  // If keyword contains non-alphanumeric or special characters (+ or - or space), check index/substring
  if (/[\-+.\s]/.test(keyword)) {
    return new RegExp(escaped, 'gi').test(text);
  }
  // Standard word boundary match
  return new RegExp('\\b' + escaped + '\\b', 'gi').test(text);
}

function analyzeResume() {
  const textarea = document.getElementById("resume-text-input");
  if (!textarea) return;
  
  const text = textarea.value.trim();
  if (text.length === 0) {
    alert("Please paste your resume text before running the analyzer.");
    return;
  }
  
  state.resumeText = text;
  localStorage.setItem("siliconquest_resume", text);

  if (typeof mockData === "undefined" || !mockData.companies) return;

  const resultsList = document.getElementById("matcher-results-list");
  if (!resultsList) return;
  
  resultsList.innerHTML = "";

  const scoredCompanies = mockData.companies.map(company => {
    const targetKeywords = company.keywords || [];
    const matched = [];
    const missing = [];
    
    targetKeywords.forEach(keyword => {
      if (containsKeyword(text, keyword)) {
        matched.push(keyword);
      } else {
        missing.push(keyword);
      }
    });

    const score = targetKeywords.length > 0 ? Math.round((matched.length / targetKeywords.length) * 100) : 0;

    return {
      company,
      score,
      matched,
      missing
    };
  });

  // Sort by score descending, then by name ascending
  scoredCompanies.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.company.name.localeCompare(b.company.name);
  });

  // Update headers
  document.getElementById("match-results-count").innerText = `${scoredCompanies.length} Companies`;
  document.getElementById("matcher-results-desc").innerText = "Resume match results sorted by score compatibility:";

  // Calculate missing target skills across companies (where score < 100) to find the biggest gaps
  const missingFreq = {};
  scoredCompanies.forEach(res => {
    if (res.score < 100) {
      res.missing.forEach(skill => {
        missingFreq[skill] = (missingFreq[skill] || 0) + 1;
      });
    }
  });

  const sortedMissing = Object.keys(missingFreq).sort((a, b) => missingFreq[b] - missingFreq[a]);
  const topMissing = sortedMissing.slice(0, 3);

  // Prepend Skill Gap Advisor if there are missing skills
  if (topMissing.length > 0) {
    const advisorCard = document.createElement("div");
    advisorCard.className = "skill-advisor-card";
    
    const skillListStr = topMissing.map(s => `<span class="badge-missing">${s}</span>`).join(" ");
    
    advisorCard.innerHTML = `
      <div class="skill-advisor-header">
        <span class="advisor-icon">💡</span>
        <h4 class="advisor-title">RTL Career Optimizer / Skill Gap Advisor</h4>
      </div>
      <p class="advisor-desc">
        Based on target chipmaker profiles, adding these skills to your resume will boost compatibility at up to <strong>${missingFreq[topMissing[0]]}</strong> companies:
      </p>
      <div class="advisor-skills-grid">
        ${skillListStr}
      </div>
    `;
    resultsList.appendChild(advisorCard);
  }

  scoredCompanies.forEach(res => {
    const item = document.createElement("div");
    item.className = "match-result-item";

    const matchedBadges = res.matched.map(kw => `<span class="badge-matched">${kw}</span>`).join("");
    const missingBadges = res.missing.map(kw => `<span class="badge-missing">${kw}</span>`).join("");

    // Find the corresponding direct search portal url or careers link
    const searchPortal = mockData.searchLinks.find(link => 
      link.name.toLowerCase().includes(res.company.name.toLowerCase())
    );
    const applyUrl = searchPortal ? searchPortal.url : res.company.careersLink;

    item.innerHTML = `
      <div class="match-result-header">
        <span class="match-comp-name">${res.company.name}</span>
        <span class="match-score-badge">${res.score}% Match</span>
      </div>
      <div class="match-bar-track">
        <div class="match-bar-fill" style="width: ${res.score}%"></div>
      </div>
      <div class="match-skills-section">
        ${res.matched.length > 0 ? `
          <span class="match-skills-label">Matched Skills:</span>
          <div class="skills-grid">${matchedBadges}</div>
        ` : ''}
        ${res.missing.length > 0 ? `
          <span class="match-skills-label">Missing/Recommended Skills:</span>
          <div class="skills-grid">${missingBadges}</div>
        ` : ''}
      </div>
      <div class="match-result-footer" style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.75rem;">
        <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-code);">${res.company.type} Portal</span>
        <a href="${applyUrl}" target="_blank" class="live-job-link" style="font-size: 0.78rem; display: inline-flex; align-items: center; gap: 0.25rem; color: var(--primary-cyan); text-decoration: none; font-weight: 600; padding: 0.25rem 0.5rem; background: rgba(0, 242, 254, 0.05); border-radius: 4px; border: 1px solid rgba(0, 242, 254, 0.15); transition: all 0.2s ease;">
          <span>Apply at ${res.company.name}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </a>
      </div>
    `;

    resultsList.appendChild(item);
  });
}


/* ==========================================================================
   COMPANIES DIRECTORY CONTROLLER
   ========================================================================== */
function renderCompanies() {
  const grid = document.getElementById("company-cards-grid");
  const searchQuery = document.getElementById("company-search").value.toLowerCase();
  const filterType = document.getElementById("company-type-filter").value;

  grid.innerHTML = "";

  if (typeof mockData === "undefined" || !mockData.companies) return;

  const filtered = mockData.companies.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery) ||
                        c.focus.toLowerCase().includes(searchQuery) ||
                        c.locations.some(loc => loc.toLowerCase().includes(searchQuery));
    
    const matchType = filterType === 'all' || c.type === filterType;

    return matchSearch && matchType;
  });

  if (filtered.length === 0) {
    grid.innerHTML = "<p style='color: var(--text-muted); text-align: center; grid-column: span 3; padding: 3rem;'>No companies match your filters.</p>";
    return;
  }

  filtered.forEach(c => {
    const card = document.createElement("div");
    card.className = "card glass-card company-card";

    // Generate difficulty stars
    let starsStr = "";
    const count = Math.floor(c.difficulty);
    for (let i = 0; i < count; i++) starsStr += "★";
    if (c.difficulty % 1 !== 0) starsStr += "½";

    card.innerHTML = `
      <div class="comp-header">
        <span class="comp-name">${c.name}</span>
        <span class="comp-badge">${c.type}</span>
      </div>
      <div class="comp-info-row">
        <span class="comp-label">Interview Focus Topics:</span>
        <p class="comp-focus">${c.focus}</p>
      </div>
      <div class="comp-meta-row">
        <span>difficulty: <span class="comp-stars">${starsStr}</span></span>
        <span style="font-size: 0.72rem; max-width: 140px; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.locations[0]} & more</span>
      </div>
      <div class="comp-link-wrapper">
        <a href="${c.careersLink}" target="_blank" class="comp-link">
          <span>View Careers Portal</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </a>
      </div>
    `;

    grid.appendChild(card);
  });
}


/* ==========================================================================
   RTL CODE SANDBOX & REFERENCE
   ========================================================================== */
function renderSandbox() {
  const menu = document.getElementById("sandbox-templates-menu");
  
  if (typeof mockData === "undefined" || !mockData.rtlTemplates) return;

  menu.innerHTML = "";

  mockData.rtlTemplates.forEach((temp, index) => {
    const li = document.createElement("li");
    li.className = `sandbox-menu-item ${index === state.sandbox.activeTemplateIndex ? 'active' : ''}`;
    li.innerText = temp.title;
    li.addEventListener("click", () => {
      state.sandbox.activeTemplateIndex = index;
      // update menu links
      document.querySelectorAll(".sandbox-menu-item").forEach((item, idx) => {
        if (idx === index) item.classList.add("active");
        else item.classList.remove("active");
      });
      loadTemplateContent();
    });
    menu.appendChild(li);
  });

  loadTemplateContent();
}

function loadTemplateContent() {
  const temp = mockData.rtlTemplates[state.sandbox.activeTemplateIndex];
  if (!temp) return;

  document.getElementById("template-title").innerText = temp.title;
  document.getElementById("template-desc").innerText = temp.description;
  document.getElementById("template-code-block").innerText = temp.code;

  // Load key points
  const pointsList = document.getElementById("template-key-points-list");
  pointsList.innerHTML = "";

  temp.keyPoints.forEach(point => {
    const li = document.createElement("li");
    li.innerHTML = point;
    pointsList.appendChild(li);
  });
}

function copyRTLCode() {
  const code = document.getElementById("template-code-block").innerText;
  const btn = document.getElementById("copy-code-btn");

  navigator.clipboard.writeText(code).then(() => {
    const originalText = btn.innerText;
    btn.innerText = "Copied! ✓";
    btn.style.color = "var(--status-offer)";
    btn.style.borderColor = "var(--status-offer)";

    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.color = "";
      btn.style.borderColor = "";
    }, 2000);
  }).catch(err => {
    console.error("Could not copy text: ", err);
  });
}
