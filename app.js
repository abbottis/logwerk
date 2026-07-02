import { PRESETS, parseLine, parseLogFileAsync, parseUserAgent } from './parser.js';
import { initI18n, setLanguage, getLanguage, t } from './i18n.js';

// Application State
let logEntries = [];
let filteredEntries = [];
let currentPage = 1;
const entriesPerPage = 50;
let activeTab = 'dashboard';

// Chart.js Instances
let charts = {
  traffic: null,
  status: null,
  paths: null,
  ips: null,
  browsers: null,
  os: null,
  bots: null,
  botProviders: null,
  botTypes: null,
  referers: null,
  contentTypes: null,
  bandwidth: null,
  protocols: null,
  threats: null,
  err404: null
};

// DOM Elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const customRegexBlock = document.getElementById('custom-regex-block');
const customRegexInput = document.getElementById('custom-regex');
const statusContainer = document.getElementById('status-container');
const statusCard = document.getElementById('status-card');
const statusMessage = document.getElementById('status-message');
const statusSpinner = document.getElementById('status-spinner');
const statusIconSuccess = document.getElementById('status-icon-success');
const statusIconError = document.getElementById('status-icon-error');
const parserProgressContainer = document.getElementById('parser-progress-container');
const parserProgressBar = document.getElementById('parser-progress-bar');
const dashboardContent = document.getElementById('dashboard-content');
const botAnalyticsPanel = document.getElementById('bot-analytics-panel');
const tabBtnDashboard = document.getElementById('tab-btn-dashboard');
const tabBtnSessions = document.getElementById('tab-btn-sessions');
const tabBtnSecurity = document.getElementById('tab-btn-security');
const panelDashboard = document.getElementById('panel-dashboard');
const panelSessions = document.getElementById('panel-sessions');
const panelSecurity = document.getElementById('panel-security');
const trafficHeatmap = document.getElementById('traffic-heatmap');
const secStatThreats = document.getElementById('sec-stat-threats');
const secStatIps = document.getElementById('sec-stat-ips');
const secStatAuth = document.getElementById('sec-stat-auth');
const secIpsTable = document.getElementById('sec-ips-table');
const secAuthTable = document.getElementById('sec-auth-table');
const secEmptyState = document.getElementById('sec-empty-state');
const sessionsContainer = document.getElementById('sessions-container');
const filterSessionClicks = document.getElementById('filter-session-clicks');
const filterSessionType = document.getElementById('filter-session-type');
const filterSessionSort = document.getElementById('filter-session-sort');
const sessionsCountBadge = document.getElementById('sessions-count-badge');

// Stats DOM Elements
const statTotal = document.getElementById('stat-total');
const statSuccess = document.getElementById('stat-success');
const statClientError = document.getElementById('stat-client-error');
const statServerError = document.getElementById('stat-server-error');
const statHumans = document.getElementById('stat-humans');
const statBots = document.getElementById('stat-bots');
const statData = document.getElementById('stat-data');

// Table & Filters DOM Elements
const logTableBody = document.getElementById('log-table-body');
const searchInput = document.getElementById('search-input');
const filterTrafficSelect = document.getElementById('filter-traffic-select');
const filterBotContainer = document.getElementById('filter-bot-container');
const filterBotSelect = document.getElementById('filter-bot-select');
const filterStatusSelect = document.getElementById('filter-status-select');
const filterMethodSelect = document.getElementById('filter-method-select');
const filterDateSort = document.getElementById('filter-date-sort');
const btnResetFilters = document.getElementById('btn-reset-filters');
const btnExport = document.getElementById('btn-export');
const btnPagePrev = document.getElementById('btn-page-prev');
const btnPageNext = document.getElementById('btn-page-next');
const paginationInfo = document.getElementById('pagination-info');
const paginationPages = document.getElementById('pagination-pages');

// Modal DOM Elements
const detailModal = document.getElementById('detail-modal');
const detailModalBackdrop = document.getElementById('detail-modal-backdrop');
const detailModalPanel = document.getElementById('detail-modal-panel');
const btnModalClose = document.getElementById('btn-modal-close');
const btnModalCloseFooter = document.getElementById('btn-modal-close-footer');

const detailStatusBadge = document.getElementById('detail-status-badge');
const detailRaw = document.getElementById('detail-raw');
const detailIp = document.getElementById('detail-ip');
const detailDate = document.getElementById('detail-date');
const detailMethod = document.getElementById('detail-method');
const detailProtocol = document.getElementById('detail-protocol');
const detailPath = document.getElementById('detail-path');
const detailStatus = document.getElementById('detail-status');
const detailSize = document.getElementById('detail-size');
const detailBrowser = document.getElementById('detail-browser');
const detailOs = document.getElementById('detail-os');
const detailIsBot = document.getElementById('detail-is-bot');
const detailBotName = document.getElementById('detail-bot-name');
const detailBotProvider = document.getElementById('detail-bot-provider');
const detailBotType = document.getElementById('detail-bot-type');
const detailReferer = document.getElementById('detail-referer');
const detailUa = document.getElementById('detail-ua');

// Initialize Chart.js global styling
Chart.defaults.color = 'rgba(255, 255, 255, 0.6)';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
Chart.defaults.font.family = "'Inter', sans-serif";

// Initialize App
window.addEventListener('DOMContentLoaded', async () => {
  initI18n();
  setupLanguageSwitcher();
  setupEventListeners();

  // Clean custom regex block styling
  customRegexInput.placeholder = t('customRegexPlaceholder');

  document.getElementById('footer-year').textContent = new Date().getFullYear();

  // Load from IndexedDB cache if available
  const cachedLog = await loadLogFromCache();
  if (cachedLog) {
    const presetRadio = document.querySelector(`input[name="preset"][value="${cachedLog.preset}"]`);
    if (presetRadio) {
      presetRadio.checked = true;
      presetRadio.dispatchEvent(new Event('change'));
    }
    if (cachedLog.preset === 'custom' && cachedLog.customRegex) {
      customRegexInput.value = cachedLog.customRegex;
    }
    parseAndRenderCachedLog(cachedLog);
  }
});

// Watch for language changes to update localized text dynamically
window.addEventListener('languagechanged', () => {
  updateLanguageToggles();
  // Translate search placeholder
  searchInput.placeholder = t('searchPlaceholder');
  // Re-render statistics & data displays
  if (logEntries.length > 0) {
    const currentMethodVal = filterMethodSelect.value;
    const currentBotVal = filterBotSelect.value;
    
    populateMethodFilter();
    populateBotFilter();
    
    filterMethodSelect.value = currentMethodVal;
    filterBotSelect.value = currentBotVal;

    updateStatistics();
    renderTable();
    renderCharts();
    if (activeTab === 'sessions') {
      renderSessions();
    }
    if (activeTab === 'security') {
      renderSecurity();
    }
  }
});

// Language Switcher Setup
function setupLanguageSwitcher() {
  const btnEn = document.getElementById('btn-lang-en');
  const btnDe = document.getElementById('btn-lang-de');
  const btnFr = document.getElementById('btn-lang-fr');
  const btnEs = document.getElementById('btn-lang-es');
  const btnIt = document.getElementById('btn-lang-it');
  const btnUk = document.getElementById('btn-lang-uk');

  btnEn.addEventListener('click', () => setLanguage('en'));
  btnDe.addEventListener('click', () => setLanguage('de'));
  btnFr.addEventListener('click', () => setLanguage('fr'));
  btnEs.addEventListener('click', () => setLanguage('es'));
  btnIt.addEventListener('click', () => setLanguage('it'));
  btnUk.addEventListener('click', () => setLanguage('uk'));

  updateLanguageToggles();
}

function updateLanguageToggles() {
  const btnEn = document.getElementById('btn-lang-en');
  const btnDe = document.getElementById('btn-lang-de');
  const btnFr = document.getElementById('btn-lang-fr');
  const btnEs = document.getElementById('btn-lang-es');
  const btnIt = document.getElementById('btn-lang-it');
  const btnUk = document.getElementById('btn-lang-uk');
  const lang = getLanguage();

  const buttons = {
    en: btnEn,
    de: btnDe,
    fr: btnFr,
    es: btnEs,
    it: btnIt,
    uk: btnUk
  };

  Object.keys(buttons).forEach(key => {
    const btn = buttons[key];
    if (!btn) return;
    if (key === lang) {
      btn.className = 'px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 bg-brand-600 text-white';
    } else {
      btn.className = 'px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 text-slate-400 hover:text-slate-200';
    }
  });
}

// Event Listeners Setup
function setupEventListeners() {
  // Drag & Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('border-brand-500', 'bg-slate-900/40');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-brand-500', 'bg-slate-900/40');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleLogFile(files[0]);
    }
  });

  dropzone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleLogFile(e.target.files[0]);
    }
  });

  // Preset configuration change
  const presetRadios = document.querySelectorAll('input[name="preset"]');
  presetRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'custom') {
        customRegexBlock.classList.remove('hidden');
        customRegexBlock.classList.add('animate-fade-in-up');
      } else {
        customRegexBlock.classList.add('hidden');
      }
    });
  });

  // Search & Filters inputs
  searchInput.addEventListener('input', () => {
    currentPage = 1;
    applyFilters();
  });
  
  filterTrafficSelect.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });
  
  filterStatusSelect.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });
  
  filterMethodSelect.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  filterDateSort.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  filterBotSelect.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  btnResetFilters.addEventListener('click', () => {
    searchInput.value = '';
    filterTrafficSelect.value = 'all';
    filterBotSelect.value = 'all';
    filterStatusSelect.value = 'all';
    filterMethodSelect.value = 'all';
    filterDateSort.value = 'none';
    filterSessionClicks.value = '2';
    filterSessionType.value = 'humans';
    filterSessionSort.value = 'recent';
    currentPage = 1;
    applyFilters();
  });

  btnExport.addEventListener('click', exportFilteredToCSV);

  // Tab selections
  tabBtnDashboard.addEventListener('click', () => switchTab('dashboard'));
  tabBtnSessions.addEventListener('click', () => switchTab('sessions'));
  tabBtnSecurity.addEventListener('click', () => switchTab('security'));

  // Session filters
  filterSessionClicks.addEventListener('change', () => {
    if (activeTab === 'sessions') renderSessions();
  });
  filterSessionType.addEventListener('change', () => {
    if (activeTab === 'sessions') renderSessions();
  });
  filterSessionSort.addEventListener('change', () => {
    if (activeTab === 'sessions') renderSessions();
  });

  // Pagination
  btnPagePrev.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  btnPageNext.addEventListener('click', () => {
    const maxPage = Math.ceil(filteredEntries.length / entriesPerPage);
    if (currentPage < maxPage) {
      currentPage++;
      renderTable();
    }
  });

  // Modal close handlers
  btnModalClose.addEventListener('click', closeModal);
  btnModalCloseFooter.addEventListener('click', closeModal);
  detailModalBackdrop.addEventListener('click', closeModal);
}

// Modal open/close actions
function openModal(entry) {
  // Extract User Agent details
  const uaInfo = entry.userAgentParsed;
  
  // Set values
  detailRaw.textContent = entry.raw;
  detailIp.textContent = entry.ip;
  detailDate.textContent = entry.timestamp;
  detailMethod.textContent = entry.method;
  detailProtocol.textContent = entry.protocol;
  detailPath.textContent = entry.path;
  detailStatus.textContent = entry.status;
  detailSize.textContent = formatBytes(entry.size);
  detailBrowser.textContent = uaInfo.browser;
  detailOs.textContent = uaInfo.os;
  detailIsBot.textContent = uaInfo.isBot ? (getLanguage() === 'de' ? 'Ja' : 'Yes') : (getLanguage() === 'de' ? 'Nein' : 'No');
  detailBotName.textContent = uaInfo.isBot ? uaInfo.botName : '-';
  detailBotProvider.textContent = uaInfo.isBot ? uaInfo.botProvider : '-';
  detailBotType.textContent = uaInfo.isBot ? uaInfo.botType : '-';
  detailReferer.textContent = entry.referer;
  detailUa.textContent = entry.userAgent;

  // Badge Status Styling
  detailStatusBadge.textContent = entry.status;
  detailStatusBadge.className = 'px-3 py-1 text-xs font-black rounded-lg ' + getStatusColorClass(entry.status);

  // Open Animations
  detailModal.classList.remove('hidden');
  setTimeout(() => {
    detailModalBackdrop.classList.remove('opacity-0');
    detailModalBackdrop.classList.add('opacity-100');
    detailModalPanel.classList.remove('translate-x-full');
    detailModalPanel.classList.add('translate-x-0');
  }, 10);
}

function closeModal() {
  detailModalBackdrop.classList.remove('opacity-100');
  detailModalBackdrop.classList.add('opacity-0');
  detailModalPanel.classList.remove('translate-x-0');
  detailModalPanel.classList.add('translate-x-full');
  
  setTimeout(() => {
    detailModal.classList.add('hidden');
  }, 300);
}

// Format selected preset configuration
function getSelectedPreset() {
  const selectedPreset = document.querySelector('input[name="preset"]:checked').value;
  
  if (selectedPreset === 'custom') {
    const regexVal = customRegexInput.value.trim();
    if (!regexVal) {
      alert('Please provide a custom Regular Expression pattern.');
      return null;
    }
    
    try {
      // Build a basic regex object.
      // We will parse standard patterns using a basic array offset mapping.
      // E.g., remote IP, ident, user, timestamp, request, status, body size, referer, user agent
      const compiled = new RegExp(regexVal);
      const requiredGroups = 9;
      // Count capture groups by matching an alternation against an empty
      // string: the resulting match array length (minus the full match)
      // tells us exactly how many capturing groups the pattern defines,
      // without relying on any real input line.
      const groupCount = new RegExp(compiled.source + '|').exec('').length - 1;
      if (groupCount < requiredGroups) {
        alert(
          `Custom RegEx must define ${requiredGroups} capture groups in this exact order: ` +
          'IP, Ident, User, Timestamp, Request, Status, Size, Referer, User-Agent. ' +
          `Your pattern only defines ${groupCount}.`
        );
        return null;
      }
      return {
        id: 'custom',
        name: 'Custom',
        regex: compiled,
        fields: {
          ip: 1,
          ident: 2,
          user: 3,
          timestamp: 4,
          request: 5,
          status: 6,
          size: 7,
          referer: 8,
          userAgent: 9
        }
      };
    } catch (e) {
      alert('Invalid Regular Expression syntax: ' + e.message);
      return null;
    }
  }

  return PRESETS[selectedPreset];
}

// File Reading & Parser Coordinator
async function isGzipFile(file) {
  // gzip magic bytes: 0x1F 0x8B — checked instead of the file extension so
  // drag & drop works regardless of how the rotated file is named
  if (file.size < 2) return false;
  const header = new Uint8Array(await file.slice(0, 2).arrayBuffer());
  return header[0] === 0x1f && header[1] === 0x8b;
}

async function readLogFile(file) {
  if (await isGzipFile(file)) {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error(t('gzipUnsupported'));
    }
    statusMessage.textContent = t('decompressingStatus');
    const decompressed = file.stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(decompressed).text();
  }
  return file.text();
}

async function handleLogFile(file) {
  const preset = getSelectedPreset();
  if (!preset) return;

  // Show status
  statusContainer.classList.remove('hidden');
  statusCard.className = 'glass-panel p-4 rounded-xl flex items-center justify-between border-slate-800';
  statusSpinner.classList.remove('hidden');
  statusIconSuccess.classList.add('hidden');
  statusIconError.classList.add('hidden');
  statusMessage.textContent = t('parsingStatus');
  parserProgressContainer.classList.remove('hidden');
  parserProgressBar.style.width = '0%';

  const startTime = performance.now();

  try {
    const content = await readLogFile(file);

    logEntries = await parseLogFileAsync(content, preset, (parsedCount, totalLines) => {
      // Update Progress bar
      const percent = Math.round((parsedCount / totalLines) * 100);
      parserProgressBar.style.width = percent + '%';
      statusMessage.textContent = `${t('parsingStatus')} (${percent}%)`;
    });

    const duration = Math.round(performance.now() - startTime);

    if (logEntries.length === 0) {
      throw new Error('No lines matched the selected log format.');
    }

    // Success layout
    statusSpinner.classList.add('hidden');
    statusIconSuccess.classList.remove('hidden');
    parserProgressContainer.classList.add('hidden');
    statusCard.classList.add('border-emerald-500/30', 'bg-emerald-950/10');
    statusMessage.textContent = t('parsedSuccess', { count: logEntries.length, time: duration });

    // Populate Method select filter dynamically
    populateMethodFilter();
    populateBotFilter();

    // Show Dashboard content
    dashboardContent.classList.remove('hidden');

    // Update data and draw UI
    applyFilters();

    // Save to IndexedDB cache (decompressed content, so restore skips the gzip step)
    const selectedPresetVal = document.querySelector('input[name="preset"]:checked').value;
    const customRegexVal = customRegexInput.value;
    saveLogToCache(file.name, content, selectedPresetVal, customRegexVal);

  } catch (error) {
    console.error(error);
    statusSpinner.classList.add('hidden');
    statusIconError.classList.remove('hidden');
    parserProgressContainer.classList.add('hidden');
    statusCard.classList.add('border-rose-500/30', 'bg-rose-950/10');
    statusMessage.textContent = t('parseFailed') + ` (${error.message})`;
  }
}

// Filter Options Setup
function populateMethodFilter() {
  const methods = new Set();
  logEntries.forEach(entry => {
    if (entry.method && entry.method !== '-') {
      methods.add(entry.method.toUpperCase());
    }
  });

  // Preserve 'all' option
  filterMethodSelect.innerHTML = `<option value="all">${t('filterMethodAll')}</option>`;
  
  // Sort and append
  Array.from(methods).sort().forEach(method => {
    const option = document.createElement('option');
    option.value = method.toLowerCase();
    option.textContent = method;
    filterMethodSelect.appendChild(option);
  });
}

// Apply Filters to active entries
function applyFilters() {
  const searchQuery = searchInput.value.toLowerCase().trim();
  const trafficFilter = filterTrafficSelect.value;
  const statusFilter = filterStatusSelect.value;
  const methodFilter = filterMethodSelect.value;

  // Toggle Bot Filter visibility
  if (trafficFilter === 'bots') {
    filterBotContainer.classList.remove('hidden');
  } else {
    filterBotContainer.classList.add('hidden');
    filterBotSelect.value = 'all';
  }
  const botFilter = filterBotSelect.value;

  filteredEntries = logEntries.filter(entry => {
    // Search query match: IP, Request String, Status Code, User Agent, Referer
    let matchesSearch = true;
    if (searchQuery) {
      matchesSearch = (
        entry.ip.toLowerCase().includes(searchQuery) ||
        entry.request.toLowerCase().includes(searchQuery) ||
        entry.status.toString().includes(searchQuery) ||
        entry.userAgent.toLowerCase().includes(searchQuery) ||
        entry.referer.toLowerCase().includes(searchQuery)
      );
    }

    // Traffic type filter match
    let matchesTraffic = true;
    if (trafficFilter !== 'all') {
      const isBot = entry.userAgentParsed.isBot;
      if (trafficFilter === 'humans' && isBot) matchesTraffic = false;
      if (trafficFilter === 'bots' && !isBot) matchesTraffic = false;
    }

    // Specific Bot filter match
    let matchesBot = true;
    if (trafficFilter === 'bots' && botFilter !== 'all') {
      matchesBot = entry.userAgentParsed.botName === botFilter;
    }

    // Status filter match: 2xx, 3xx, 4xx, 5xx
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const statusClass = Math.floor(entry.status / 100);
      if (statusFilter === '2xx' && statusClass !== 2) matchesStatus = false;
      if (statusFilter === '3xx' && statusClass !== 3) matchesStatus = false;
      if (statusFilter === '4xx' && statusClass !== 4) matchesStatus = false;
      if (statusFilter === '5xx' && statusClass !== 5) matchesStatus = false;
    }

    // Method filter match
    let matchesMethod = true;
    if (methodFilter !== 'all') {
      matchesMethod = entry.method.toLowerCase() === methodFilter;
    }

    return matchesSearch && matchesTraffic && matchesBot && matchesStatus && matchesMethod;
  });

  // Date sort: order by log age (oldest/newest first), or leave as parsed
  const dateSort = filterDateSort.value;
  if (dateSort === 'asc' || dateSort === 'desc') {
    filteredEntries.sort((a, b) => {
      const aTime = a.date ? a.date.getTime() : 0;
      const bTime = b.date ? b.date.getTime() : 0;
      return dateSort === 'asc' ? aTime - bTime : bTime - aTime;
    });
  }

  currentPage = 1;
  updateStatistics();
  renderTable();
  renderCharts();
  
  if (activeTab === 'sessions') {
    renderSessions();
  }
  if (activeTab === 'security') {
    renderSecurity();
  }
}

// Calculate Statistics
function updateStatistics() {
  const total = filteredEntries.length;
  let successCount = 0;
  let clientErrCount = 0;
  let serverErrCount = 0;
  let humanCount = 0;
  let botCount = 0;
  let totalBytes = 0;

  filteredEntries.forEach(entry => {
    const statusClass = Math.floor(entry.status / 100);
    if (statusClass === 2 || statusClass === 3) {
      successCount++;
    } else if (statusClass === 4) {
      clientErrCount++;
    } else if (statusClass === 5) {
      serverErrCount++;
    }

    if (entry.userAgentParsed.isBot) {
      botCount++;
    } else {
      humanCount++;
    }

    totalBytes += entry.size;
  });

  statTotal.textContent = total.toLocaleString();
  statSuccess.textContent = `${successCount.toLocaleString()} (${total > 0 ? Math.round((successCount/total)*100) : 0}%)`;
  statClientError.textContent = `${clientErrCount.toLocaleString()} (${total > 0 ? Math.round((clientErrCount/total)*100) : 0}%)`;
  statServerError.textContent = `${serverErrCount.toLocaleString()} (${total > 0 ? Math.round((serverErrCount/total)*100) : 0}%)`;
  statHumans.textContent = `${humanCount.toLocaleString()} (${total > 0 ? Math.round((humanCount/total)*100) : 0}%)`;
  statBots.textContent = `${botCount.toLocaleString()} (${total > 0 ? Math.round((botCount/total)*100) : 0}%)`;
  statData.textContent = formatBytes(totalBytes);
}

// Render Paginated Log Entries Table
function renderTable() {
  const total = filteredEntries.length;
  
  if (total === 0) {
    logTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="px-6 py-12 text-center text-slate-500 font-medium" data-i18n="noMatchingData">
          ${t('noMatchingData')}
        </td>
      </tr>
    `;
    paginationInfo.textContent = '';
    paginationPages.innerHTML = '';
    btnPagePrev.disabled = true;
    btnPageNext.disabled = true;
    return;
  }

  const maxPage = Math.ceil(total / entriesPerPage);
  if (currentPage > maxPage) currentPage = maxPage;
  if (currentPage < 1) currentPage = 1;

  const startIdx = (currentPage - 1) * entriesPerPage;
  const endIdx = Math.min(startIdx + entriesPerPage, total);
  
  const pageEntries = filteredEntries.slice(startIdx, endIdx);
  
  let html = '';
  pageEntries.forEach(entry => {
    const statusClass = getStatusColorClass(entry.status);
    
    let accessDetailHtml = '';
    if (entry.userAgentParsed.isBot) {
      accessDetailHtml = `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          🤖 ${entry.userAgentParsed.botName}
        </span>
      `;
    } else {
      accessDetailHtml = `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          👤 ${entry.ipCountry}
        </span>
      `;
    }

    html += `
      <tr class="hover:bg-slate-900/35 transition-colors border-b border-slate-900/60 cursor-pointer" data-id="${entry.timestamp}-${entry.ip}-${entry.size}">
        <td class="px-6 py-3.5 font-mono text-xs text-slate-300 font-medium">${entry.ip}</td>
        <td class="px-6 py-3.5">${accessDetailHtml}</td>
        <td class="px-6 py-3.5 text-xs text-slate-400">${entry.timestamp}</td>
        <td class="px-6 py-3.5">
          <span class="px-2 py-0.5 text-[10px] font-black rounded uppercase bg-slate-800 text-slate-300 tracking-wider border border-slate-700/50">${entry.method}</span>
        </td>
        <td class="px-6 py-3.5 font-mono text-xs text-slate-300 truncate max-w-xs md:max-w-md" title="${entry.path}">${entry.path}</td>
        <td class="px-6 py-3.5">
          <span class="px-2 py-0.5 text-xs font-black rounded-lg ${statusClass}">${entry.status}</span>
        </td>
        <td class="px-6 py-3.5 text-xs text-slate-300 font-mono">${formatBytes(entry.size)}</td>
        <td class="px-6 py-3.5">
          <button class="btn-inspect text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors uppercase tracking-wider" data-i18n="actionView">${t('actionView')}</button>
        </td>
      </tr>
    `;
  });

  logTableBody.innerHTML = html;

  // Add click listener for inspecting row
  const rows = logTableBody.querySelectorAll('tr');
  rows.forEach((row, idx) => {
    row.addEventListener('click', (e) => {
      // Don't open detail if button was clicked directly (it's covered, but safe)
      openModal(pageEntries[idx]);
    });
  });

  // Update pagination info text
  paginationInfo.textContent = t('paginationInfo', {
    start: (startIdx + 1).toLocaleString(),
    end: endIdx.toLocaleString(),
    total: total.toLocaleString()
  });

  // Enable/Disable buttons
  btnPagePrev.disabled = currentPage === 1;
  btnPageNext.disabled = currentPage === maxPage;

  // Render Page buttons
  renderPaginationPages(maxPage);
}

// Draw page indices selector buttons
function renderPaginationPages(maxPage) {
  paginationPages.innerHTML = '';
  
  const range = 2; // Show active page, plus/minus 2 pages
  let startPage = Math.max(1, currentPage - range);
  let endPage = Math.min(maxPage, currentPage + range);

  if (startPage > 1) {
    appendPageButton(1);
    if (startPage > 2) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'px-1 text-slate-600';
      ellipsis.textContent = '...';
      paginationPages.appendChild(ellipsis);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    appendPageButton(i, i === currentPage);
  }

  if (endPage < maxPage) {
    if (endPage < maxPage - 1) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'px-1 text-slate-600';
      ellipsis.textContent = '...';
      paginationPages.appendChild(ellipsis);
    }
    appendPageButton(maxPage);
  }
}

function appendPageButton(pageNumber, isActive = false) {
  const btn = document.createElement('button');
  btn.className = `px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all duration-200 ${
    isActive 
      ? 'bg-brand-600 text-white border-brand-500' 
      : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
  }`;
  btn.textContent = pageNumber;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentPage = pageNumber;
    renderTable();
  });
  paginationPages.appendChild(btn);
}

// Chart rendering
function renderCharts() {
  destroyCharts();

  if (filteredEntries.length === 0) return;

  renderTrafficChart();
  renderStatusChart();
  renderPathsChart();
  renderIpsChart();
  renderUaCharts();
  renderRefererChart();
  renderContentTypeChart();
  renderBandwidthChart();
  renderProtocolChart();
  renderHeatmap();

  // Show/Hide and render bot analysis if bots are present
  const hasBots = filteredEntries.some(entry => entry.userAgentParsed.isBot);
  if (hasBots) {
    botAnalyticsPanel.classList.remove('hidden');
    renderBotCharts();
  } else {
    botAnalyticsPanel.classList.add('hidden');
  }
}

function destroyCharts() {
  Object.keys(charts).forEach(key => {
    if (charts[key]) {
      charts[key].destroy();
      charts[key] = null;
    }
  });
}

function renderTrafficChart() {
  // Group log traffic by hour
  const hoursMap = {};
  for (let i = 0; i < 24; i++) {
    hoursMap[i.toString().padStart(2, '0') + ':00'] = 0;
  }

  filteredEntries.forEach(entry => {
    if (entry.date) {
      const hour = entry.date.getHours().toString().padStart(2, '0') + ':00';
      if (hoursMap[hour] !== undefined) {
        hoursMap[hour]++;
      }
    }
  });

  const labels = Object.keys(hoursMap).sort();
  const data = labels.map(label => hoursMap[label]);

  const ctx = document.getElementById('chart-traffic').getContext('2d');
  charts.traffic = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: t('statTotal'),
        data: data,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2.5,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
}

function renderStatusChart() {
  const statusMap = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0, 'Other': 0 };
  
  filteredEntries.forEach(entry => {
    const statusClass = Math.floor(entry.status / 100);
    if (statusClass === 2) statusMap['2xx']++;
    else if (statusClass === 3) statusMap['3xx']++;
    else if (statusClass === 4) statusMap['4xx']++;
    else if (statusClass === 5) statusMap['5xx']++;
    else statusMap['Other']++;
  });

  const labels = Object.keys(statusMap).filter(key => statusMap[key] > 0);
  const data = labels.map(label => statusMap[label]);
  
  // Custom colors for status codes
  const colors = {
    '2xx': 'rgba(16, 185, 129, 0.75)', // Emerald
    '3xx': 'rgba(59, 130, 246, 0.75)', // Blue
    '4xx': 'rgba(245, 158, 11, 0.75)', // Amber
    '5xx': 'rgba(244, 63, 94, 0.75)',  // Rose
    'Other': 'rgba(148, 163, 184, 0.75)' // Slate
  };
  
  const borderColors = {
    '2xx': 'rgb(16, 185, 129)',
    '3xx': 'rgb(59, 130, 246)',
    '4xx': 'rgb(245, 158, 11)',
    '5xx': 'rgb(244, 63, 94)',
    'Other': 'rgb(148, 163, 184)'
  };

  const bgColors = labels.map(label => colors[label]);
  const borderColorsArr = labels.map(label => borderColors[label]);

  const ctx = document.getElementById('chart-status').getContext('2d');
  charts.status = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors,
        borderColor: borderColorsArr,
        borderWidth: 1.5,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, padding: 15 }
        }
      }
    }
  });
}

function renderPathsChart() {
  const pathMap = {};
  filteredEntries.forEach(entry => {
    if (entry.path && entry.path !== '-') {
      pathMap[entry.path] = (pathMap[entry.path] || 0) + 1;
    }
  });

  // Sort and select top 6
  const sorted = Object.entries(pathMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const labels = sorted.map(item => item[0]);
  const data = sorted.map(item => item[1]);

  const ctx = document.getElementById('chart-paths').getContext('2d');
  charts.paths = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: 'rgba(99, 102, 241, 0.65)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } },
        y: {
          ticks: {
            callback: function(value) {
              const label = this.getLabelForValue(value);
              return label.length > 20 ? label.substring(0, 20) + '...' : label;
            }
          }
        }
      }
    }
  });
}

function renderIpsChart() {
  const ipMap = {};
  filteredEntries.forEach(entry => {
    if (entry.ip && entry.ip !== '-') {
      ipMap[entry.ip] = (ipMap[entry.ip] || 0) + 1;
    }
  });

  const sorted = Object.entries(ipMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const labels = sorted.map(item => item[0]);
  const data = sorted.map(item => item[1]);

  const ctx = document.getElementById('chart-ips').getContext('2d');
  charts.ips = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: 'rgba(236, 72, 153, 0.65)', // Pink
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}

function renderUaCharts() {
  const browserMap = {};
  const osMap = {};
  const botMap = {};

  filteredEntries.forEach(entry => {
    const info = entry.userAgentParsed;
    if (info.isBot) {
      const name = info.botName || 'Other Bot/Scanner';
      botMap[name] = (botMap[name] || 0) + 1;
    } else {
      browserMap[info.browser] = (browserMap[info.browser] || 0) + 1;
      osMap[info.os] = (osMap[info.os] || 0) + 1;
    }
  });

  // Browser Chart
  const bSorted = Object.entries(browserMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const bLabels = bSorted.map(item => item[0]);
  const bData = bSorted.map(item => item[1]);

  const ctxB = document.getElementById('chart-browsers').getContext('2d');
  charts.browsers = new Chart(ctxB, {
    type: 'bar',
    data: {
      labels: bLabels,
      datasets: [{
        data: bData,
        backgroundColor: 'rgba(14, 165, 233, 0.65)', // Sky
        borderColor: 'rgb(14, 165, 233)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });

  // OS Chart
  const osSorted = Object.entries(osMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const osLabels = osSorted.map(item => item[0]);
  const osData = osSorted.map(item => item[1]);

  const ctxOs = document.getElementById('chart-os').getContext('2d');
  charts.os = new Chart(ctxOs, {
    type: 'bar',
    data: {
      labels: osLabels,
      datasets: [{
        data: osData,
        backgroundColor: 'rgba(168, 85, 247, 0.65)', // Purple
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });

}

function renderBotCharts() {
  const providerMap = {};
  const typeMap = {};
  const botMap = {};

  filteredEntries.forEach(entry => {
    const info = entry.userAgentParsed;
    if (info.isBot) {
      const name = info.botName || 'Other Bot/Scanner';
      const provider = info.botProvider || 'Other / Unknown';
      const type = info.botType || 'Generic Crawler';
      
      botMap[name] = (botMap[name] || 0) + 1;
      providerMap[provider] = (providerMap[provider] || 0) + 1;
      typeMap[type] = (typeMap[type] || 0) + 1;
    }
  });

  // Providers Chart
  const pSorted = Object.entries(providerMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const pLabels = pSorted.map(item => item[0]);
  const pData = pSorted.map(item => item[1]);

  const ctxP = document.getElementById('chart-bot-providers').getContext('2d');
  charts.botProviders = new Chart(ctxP, {
    type: 'bar',
    data: {
      labels: pLabels,
      datasets: [{
        data: pData,
        backgroundColor: 'rgba(59, 130, 246, 0.65)', // Blue
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });

  // Types / Purpose Chart
  const tSorted = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const tLabels = tSorted.map(item => item[0]);
  const tData = tSorted.map(item => item[1]);

  const ctxT = document.getElementById('chart-bot-types').getContext('2d');
  charts.botTypes = new Chart(ctxT, {
    type: 'bar',
    data: {
      labels: tLabels,
      datasets: [{
        data: tData,
        backgroundColor: 'rgba(16, 185, 129, 0.65)', // Emerald
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });

  // Top Specific Bots Chart
  const botSorted = Object.entries(botMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const botLabels = botSorted.map(item => item[0]);
  const botData = botSorted.map(item => item[1]);

  const ctxBot = document.getElementById('chart-bots').getContext('2d');
  charts.bots = new Chart(ctxBot, {
    type: 'bar',
    data: {
      labels: botLabels,
      datasets: [{
        data: botData,
        backgroundColor: 'rgba(167, 139, 250, 0.65)', // Light Purple
        borderColor: 'rgb(167, 139, 250)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}

// Helpers
function renderRefererChart() {
  // Group referers by host; empty referer counts as direct traffic
  const refMap = {};
  filteredEntries.forEach(entry => {
    let key;
    if (!entry.referer || entry.referer === '-') {
      key = t('refererDirect');
    } else {
      try {
        key = new URL(entry.referer).host;
      } catch {
        key = entry.referer;
      }
    }
    refMap[key] = (refMap[key] || 0) + 1;
  });

  const sorted = Object.entries(refMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const ctx = document.getElementById('chart-referers').getContext('2d');
  charts.referers = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(item => item[0]),
      datasets: [{
        data: sorted.map(item => item[1]),
        backgroundColor: 'rgba(20, 184, 166, 0.65)',
        borderColor: 'rgb(20, 184, 166)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } },
        y: {
          ticks: {
            callback: function(value) {
              const label = this.getLabelForValue(value);
              return label.length > 30 ? label.substring(0, 30) + '...' : label;
            }
          }
        }
      }
    }
  });
}

function renderContentTypeChart() {
  const typeMap = {};
  filteredEntries.forEach(entry => {
    typeMap[entry.contentType] = (typeMap[entry.contentType] || 0) + 1;
  });

  const sorted = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);
  const palette = [
    'rgba(139, 92, 246, 0.75)',  // Violet
    'rgba(16, 185, 129, 0.75)',  // Emerald
    'rgba(59, 130, 246, 0.75)',  // Blue
    'rgba(245, 158, 11, 0.75)',  // Amber
    'rgba(236, 72, 153, 0.75)',  // Pink
    'rgba(20, 184, 166, 0.75)',  // Teal
    'rgba(148, 163, 184, 0.75)'  // Slate
  ];

  const ctx = document.getElementById('chart-content-types').getContext('2d');
  charts.contentTypes = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sorted.map(item => t(item[0])),
      datasets: [{
        data: sorted.map(item => item[1]),
        backgroundColor: sorted.map((_, i) => palette[i % palette.length]),
        borderColor: 'rgba(15, 23, 42, 0.8)',
        borderWidth: 1.5,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, padding: 12 }
        }
      }
    }
  });
}

function renderBandwidthChart() {
  const byteMap = {};
  filteredEntries.forEach(entry => {
    if (entry.path && entry.path !== '-' && entry.size > 0) {
      byteMap[entry.path] = (byteMap[entry.path] || 0) + entry.size;
    }
  });

  const sorted = Object.entries(byteMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const ctx = document.getElementById('chart-bandwidth').getContext('2d');
  charts.bandwidth = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(item => item[0]),
      datasets: [{
        data: sorted.map(item => item[1]),
        backgroundColor: 'rgba(59, 130, 246, 0.65)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => formatBytes(context.parsed.x)
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { callback: (value) => formatBytes(value, 0) }
        },
        y: {
          ticks: {
            callback: function(value) {
              const label = this.getLabelForValue(value);
              return label.length > 20 ? label.substring(0, 20) + '...' : label;
            }
          }
        }
      }
    }
  });
}

function renderProtocolChart() {
  const protoMap = {};
  filteredEntries.forEach(entry => {
    const key = (entry.protocol && entry.protocol !== '-') ? entry.protocol : t('protocolUnknown');
    protoMap[key] = (protoMap[key] || 0) + 1;
  });

  const sorted = Object.entries(protoMap).sort((a, b) => b[1] - a[1]);
  const palette = [
    'rgba(99, 102, 241, 0.75)',  // Indigo
    'rgba(16, 185, 129, 0.75)',  // Emerald
    'rgba(245, 158, 11, 0.75)',  // Amber
    'rgba(148, 163, 184, 0.75)'  // Slate
  ];

  const ctx = document.getElementById('chart-protocols').getContext('2d');
  charts.protocols = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sorted.map(item => item[0]),
      datasets: [{
        data: sorted.map(item => item[1]),
        backgroundColor: sorted.map((_, i) => palette[i % palette.length]),
        borderColor: 'rgba(15, 23, 42, 0.8)',
        borderWidth: 1.5,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, padding: 12 }
        }
      }
    }
  });
}

// Weekday x hour traffic heatmap, rendered as a CSS grid (Chart.js has no native heatmap)
function renderHeatmap() {
  const grid = Array.from({ length: 7 }, () => new Array(24).fill(0));
  filteredEntries.forEach(entry => {
    if (entry.date) {
      // getDay(): 0 = Sunday; shift so the grid starts on Monday
      const day = (entry.date.getDay() + 6) % 7;
      grid[day][entry.date.getHours()]++;
    }
  });

  const max = Math.max(1, ...grid.map(row => Math.max(...row)));
  const dayFormatter = new Intl.DateTimeFormat(getLanguage(), { weekday: 'short' });
  // 2024-01-01 is a Monday
  const dayNames = Array.from({ length: 7 }, (_, i) => dayFormatter.format(new Date(2024, 0, 1 + i)));

  let html = '<div class="min-w-[720px] grid gap-[3px]" style="grid-template-columns: 3rem repeat(24, minmax(0, 1fr));">';
  html += '<div></div>';
  for (let h = 0; h < 24; h++) {
    html += `<div class="text-[9px] text-slate-500 text-center">${h}</div>`;
  }
  for (let d = 0; d < 7; d++) {
    html += `<div class="text-[10px] font-semibold text-slate-400 flex items-center">${dayNames[d]}</div>`;
    for (let h = 0; h < 24; h++) {
      const count = grid[d][h];
      const alpha = count === 0 ? 0.04 : 0.15 + 0.85 * (count / max);
      html += `<div class="h-5 rounded-sm" style="background: rgba(139, 92, 246, ${alpha.toFixed(2)})" title="${dayNames[d]} ${h}:00 — ${count.toLocaleString()}"></div>`;
    }
  }
  html += '</div>';
  trafficHeatmap.innerHTML = html;
}

// Security Tab: attack patterns, 404 hotspots, and failed-auth aggregation
function renderSecurity() {
  const total = filteredEntries.length;
  const threatEntries = filteredEntries.filter(entry => entry.threat);
  const authFailures = filteredEntries.filter(entry => entry.status === 401);
  const notFoundEntries = filteredEntries.filter(entry => entry.status === 404);

  // Destroy previous security charts (renderSecurity runs independently of renderCharts)
  ['threats', 'err404'].forEach(key => {
    if (charts[key]) {
      charts[key].destroy();
      charts[key] = null;
    }
  });

  // Aggregate suspicious activity per IP
  const threatIpMap = {};
  threatEntries.forEach(entry => {
    if (!threatIpMap[entry.ip]) {
      threatIpMap[entry.ip] = { count: 0, categories: new Set(), lastSeen: null };
    }
    const item = threatIpMap[entry.ip];
    item.count++;
    item.categories.add(entry.threat);
    if (entry.date && (!item.lastSeen || entry.date > item.lastSeen)) {
      item.lastSeen = entry.date;
    }
  });

  // Stat cards
  const threatPercent = total > 0 ? Math.round((threatEntries.length / total) * 100) : 0;
  secStatThreats.textContent = `${threatEntries.length.toLocaleString()} (${threatPercent}%)`;
  secStatIps.textContent = Object.keys(threatIpMap).length.toLocaleString();
  secStatAuth.textContent = authFailures.length.toLocaleString();

  const hasFindings = threatEntries.length > 0 || authFailures.length > 0 || notFoundEntries.length > 0;
  secEmptyState.classList.toggle('hidden', hasFindings);

  // Threat category doughnut
  const categoryMap = {};
  threatEntries.forEach(entry => {
    categoryMap[entry.threat] = (categoryMap[entry.threat] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const threatPalette = [
    'rgba(244, 63, 94, 0.75)',   // Rose
    'rgba(245, 158, 11, 0.75)',  // Amber
    'rgba(236, 72, 153, 0.75)',  // Pink
    'rgba(249, 115, 22, 0.75)',  // Orange
    'rgba(168, 85, 247, 0.75)',  // Purple
    'rgba(59, 130, 246, 0.75)',  // Blue
    'rgba(148, 163, 184, 0.75)'  // Slate
  ];

  if (sortedCategories.length > 0) {
    const ctx = document.getElementById('chart-threats').getContext('2d');
    charts.threats = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: sortedCategories.map(item => t(item[0])),
        datasets: [{
          data: sortedCategories.map(item => item[1]),
          backgroundColor: sortedCategories.map((_, i) => threatPalette[i % threatPalette.length]),
          borderColor: 'rgba(15, 23, 42, 0.8)',
          borderWidth: 1.5,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 10 }
          }
        }
      }
    });
  }

  // Suspicious IPs table (top 10 by count)
  const topThreatIps = Object.entries(threatIpMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  secIpsTable.innerHTML = topThreatIps.map(([ip, item]) => {
    const categories = [...item.categories].map(cat =>
      `<span class="inline-block px-1.5 py-0.5 mr-1 mb-0.5 rounded text-[10px] font-sans font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">${t(cat)}</span>`
    ).join('');
    return `
      <tr>
        <td class="py-2 pr-4">${escapeHtml(ip)}</td>
        <td class="py-2 pr-4">${item.count.toLocaleString()}</td>
        <td class="py-2 pr-4 font-sans">${categories}</td>
        <td class="py-2 whitespace-nowrap">${item.lastSeen ? item.lastSeen.toLocaleString(getLanguage()) : '-'}</td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="4" class="py-4 text-center text-slate-500 font-sans">${t('secNoData')}</td></tr>`;

  // Top 404 paths bar chart
  const pathMap404 = {};
  notFoundEntries.forEach(entry => {
    if (entry.path && entry.path !== '-') {
      pathMap404[entry.path] = (pathMap404[entry.path] || 0) + 1;
    }
  });
  const sorted404 = Object.entries(pathMap404)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (sorted404.length > 0) {
    const ctx404 = document.getElementById('chart-404').getContext('2d');
    charts.err404 = new Chart(ctx404, {
      type: 'bar',
      data: {
        labels: sorted404.map(item => item[0]),
        datasets: [{
          data: sorted404.map(item => item[1]),
          backgroundColor: 'rgba(245, 158, 11, 0.65)',
          borderColor: 'rgb(245, 158, 11)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { beginAtZero: true, ticks: { precision: 0 } },
          y: {
            ticks: {
              callback: function(value) {
                const label = this.getLabelForValue(value);
                return label.length > 28 ? label.substring(0, 28) + '...' : label;
              }
            }
          }
        }
      }
    });
  }

  // Failed logins per IP table (top 10)
  const authIpMap = {};
  authFailures.forEach(entry => {
    if (!authIpMap[entry.ip]) {
      authIpMap[entry.ip] = { count: 0, paths: new Set(), lastSeen: null };
    }
    const item = authIpMap[entry.ip];
    item.count++;
    item.paths.add(entry.path);
    if (entry.date && (!item.lastSeen || entry.date > item.lastSeen)) {
      item.lastSeen = entry.date;
    }
  });

  const topAuthIps = Object.entries(authIpMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  secAuthTable.innerHTML = topAuthIps.map(([ip, item]) => {
    const paths = [...item.paths].slice(0, 3).map(p => escapeHtml(p)).join(', ') + (item.paths.size > 3 ? ', …' : '');
    return `
      <tr>
        <td class="py-2 pr-4">${escapeHtml(ip)}</td>
        <td class="py-2 pr-4">${item.count.toLocaleString()}</td>
        <td class="py-2 pr-4 truncate max-w-[240px]" title="${escapeHtml([...item.paths].join(', '))}">${paths}</td>
        <td class="py-2 whitespace-nowrap">${item.lastSeen ? item.lastSeen.toLocaleString(getLanguage()) : '-'}</td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="4" class="py-4 text-center text-slate-500 font-sans">${t('secNoData')}</td></tr>`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getStatusColorClass(status) {
  const statusClass = Math.floor(status / 100);
  if (statusClass === 2) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
  if (statusClass === 3) return 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
  if (statusClass === 4) return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
  if (statusClass === 5) return 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
  return 'bg-slate-800 text-slate-300 border border-slate-700/50';
}

function exportFilteredToCSV() {
  if (filteredEntries.length === 0) return;
  
  const headers = ['Client IP', 'Timestamp', 'Method', 'Path', 'Protocol', 'Status', 'Size (Bytes)', 'Referer', 'User Agent'];
  const rows = filteredEntries.map(entry => [
    entry.ip,
    entry.timestamp,
    entry.method,
    entry.path,
    entry.protocol,
    entry.status,
    entry.size,
    entry.referer,
    entry.userAgent
  ]);

  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `logwerk_filtered_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  
  link.click();
  document.body.removeChild(link);
}

function populateBotFilter() {
  const bots = new Set();
  logEntries.forEach(entry => {
    if (entry.userAgentParsed.isBot && entry.userAgentParsed.botName) {
      bots.add(entry.userAgentParsed.botName);
    }
  });

  filterBotSelect.innerHTML = `<option value="all">${t('filterBotAll')}</option>`;
  
  Array.from(bots).sort().forEach(bot => {
    const option = document.createElement('option');
    option.value = bot;
    option.textContent = bot;
    filterBotSelect.appendChild(option);
  });
}

async function parseAndRenderCachedLog(cachedLog) {
  const preset = getSelectedPreset();
  if (!preset) return;

  statusContainer.classList.remove('hidden');
  statusCard.className = 'glass-panel p-4 rounded-xl flex items-center justify-between border-slate-800';
  statusSpinner.classList.remove('hidden');
  statusIconSuccess.classList.add('hidden');
  statusIconError.classList.add('hidden');
  statusMessage.textContent = t('parsingStatus');
  parserProgressContainer.classList.remove('hidden');
  parserProgressBar.style.width = '0%';

  const startTime = performance.now();

  try {
    logEntries = await parseLogFileAsync(cachedLog.content, preset, (parsedCount, totalLines) => {
      const percent = Math.round((parsedCount / totalLines) * 100);
      parserProgressBar.style.width = percent + '%';
      statusMessage.textContent = `${t('parsingStatus')} (${percent}%)`;
    });

    const duration = Math.round(performance.now() - startTime);

    if (logEntries.length === 0) {
      throw new Error('No lines matched the selected log format.');
    }

    statusSpinner.classList.add('hidden');
    statusIconSuccess.classList.remove('hidden');
    parserProgressContainer.classList.add('hidden');
    statusCard.classList.add('border-emerald-500/30', 'bg-emerald-950/10');
    
    const lang = getLanguage();
    const successMsg = lang === 'de' 
      ? `${logEntries.length} Einträge erfolgreich in ${duration}ms geparst (Aus Browser-Cache geladen: ${cachedLog.fileName})`
      : `Successfully parsed ${logEntries.length} log entries in ${duration}ms (Restored from cache: ${cachedLog.fileName})`;
    
    statusMessage.textContent = successMsg;

    populateMethodFilter();
    populateBotFilter();
    dashboardContent.classList.remove('hidden');
    applyFilters();
  } catch (error) {
    console.error(error);
    statusSpinner.classList.add('hidden');
    statusIconError.classList.remove('hidden');
    parserProgressContainer.classList.add('hidden');
    statusCard.classList.add('border-rose-500/30', 'bg-rose-950/10');
    statusMessage.textContent = t('parseFailed') + ` (${error.message})`;
  }
}

// IndexedDB Cache Wrapper
const DB_NAME = 'LogWerkDB';
const STORE_NAME = 'logs';

function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function saveLogToCache(fileName, fileContent, presetValue, customRegexValue) {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put({
      id: 'recent_log',
      fileName,
      content: fileContent,
      preset: presetValue,
      customRegex: customRegexValue,
      timestamp: Date.now()
    });
  } catch (err) {
    console.error('Failed to save log to IndexedDB cache:', err);
  }
}

async function loadLogFromCache() {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const req = store.get('recent_log');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error('Failed to read log from IndexedDB cache:', err);
    return null;
  }
}

// Tab navigation handler
function switchTab(tab) {
  activeTab = tab;

  const tabs = {
    dashboard: { btn: tabBtnDashboard, panel: panelDashboard },
    sessions: { btn: tabBtnSessions, panel: panelSessions },
    security: { btn: tabBtnSecurity, panel: panelSecurity }
  };

  Object.entries(tabs).forEach(([name, { btn, panel }]) => {
    if (name === tab) {
      btn.classList.add('border-brand-500', 'text-slate-100');
      btn.classList.remove('border-transparent', 'text-slate-400');
      panel.classList.remove('hidden');
    } else {
      btn.classList.remove('border-brand-500', 'text-slate-100');
      btn.classList.add('border-transparent', 'text-slate-400');
      panel.classList.add('hidden');
    }
  });

  if (tab === 'sessions') renderSessions();
  if (tab === 'security') renderSecurity();
}

// Helper to format duration in readable format
function formatDuration(ms) {
  if (ms <= 0) return '0s';
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  let str = '';
  if (hours > 0) str += `${hours}h `;
  if (minutes > 0 || hours > 0) str += `${minutes}m `;
  if (seconds > 0 || str === '') str += `${seconds}s`;
  return str.trim();
}

// Groups filtered log entries into visitor sessions based on a 30-minute threshold
function groupEntriesIntoSessions() {
  const clientGroups = {};
  filteredEntries.forEach(entry => {
    // JSON.stringify quotes/escapes each part, so a crafted User-Agent
    // containing the old '|||' separator can no longer collide two
    // different (ip, userAgent) pairs into the same fingerprint.
    const fingerprint = JSON.stringify([entry.ip, entry.userAgent]);
    if (!clientGroups[fingerprint]) {
      clientGroups[fingerprint] = [];
    }
    clientGroups[fingerprint].push(entry);
  });

  const sessions = [];
  const thresholdMs = 30 * 60 * 1000; // 30 minutes

  Object.keys(clientGroups).forEach(fingerprint => {
    const entries = clientGroups[fingerprint].sort((a, b) => {
      const timeA = a.date ? a.date.getTime() : 0;
      const timeB = b.date ? b.date.getTime() : 0;
      return timeA - timeB;
    });

    let currentSession = null;

    entries.forEach(entry => {
      const entryTime = entry.date ? entry.date.getTime() : 0;
      
      if (!currentSession || (entryTime - currentSession.lastRequestTime > thresholdMs)) {
        currentSession = {
          ip: entry.ip,
          ipCountry: entry.ipCountry,
          userAgentParsed: entry.userAgentParsed,
          userAgent: entry.userAgent,
          startTime: entryTime,
          lastRequestTime: entryTime,
          entries: [entry]
        };
        sessions.push(currentSession);
      } else {
        currentSession.entries.push(entry);
        currentSession.lastRequestTime = entryTime;
      }
    });
  });

  return sessions.sort((a, b) => b.startTime - a.startTime);
}

// Render Sessions Timeline Layout
function renderSessions() {
  const sessions = groupEntriesIntoSessions();

  // Filter sessions
  const minClicks = parseInt(filterSessionClicks.value) || 1;
  const sessionType = filterSessionType.value;
  const sortBy = filterSessionSort.value;

  let filteredSessions = sessions.filter(session => {
    // 1. Min Clicks
    if (session.entries.length < minClicks) return false;

    // 2. Session Type
    const isBot = session.userAgentParsed.isBot;
    if (sessionType === 'humans' && isBot) return false;
    if (sessionType === 'bots' && !isBot) return false;

    return true;
  });

  // Sort sessions
  if (sortBy === 'clicks') {
    filteredSessions.sort((a, b) => b.entries.length - a.entries.length);
  } else if (sortBy === 'duration') {
    filteredSessions.sort((a, b) => {
      const durA = a.lastRequestTime - a.startTime;
      const durB = b.lastRequestTime - b.startTime;
      return durB - durA;
    });
  } else {
    filteredSessions.sort((a, b) => b.startTime - a.startTime);
  }

  // Update sessions count badge
  sessionsCountBadge.textContent = t('sessionsCount', { count: filteredSessions.length });

  sessionsContainer.innerHTML = '';

  if (filteredSessions.length === 0) {
    sessionsContainer.innerHTML = `
      <div class="glass-panel p-12 text-center text-slate-500 font-medium">
        ${t('sessionNoData')}
      </div>
    `;
    return;
  }

  filteredSessions.forEach(session => {
    // Generate badge (Bot or Country)
    let badgeHtml = '';
    if (session.userAgentParsed.isBot) {
      badgeHtml = `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          🤖 ${session.userAgentParsed.botName}
        </span>
      `;
    } else {
      badgeHtml = `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          👤 ${session.ipCountry}
        </span>
      `;
    }

    // Generate chronological request steps HTML
    let stepsHtml = '';
    session.entries.forEach(entry => {
      const offsetMs = entry.date ? entry.date.getTime() - session.startTime : 0;
      const offsetStr = offsetMs === 0 ? '0s' : '+' + formatDuration(offsetMs);
      const statusColor = getStatusColorClass(entry.status);

      stepsHtml += `
        <div class="relative flex items-center justify-between group/step">
          <!-- Dot timeline node -->
          <div class="absolute -left-[30px] w-2 h-2 rounded-full bg-slate-800 border border-slate-700 group-hover/step:bg-brand-500 group-hover/step:border-brand-400 transition-colors"></div>
          
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-mono text-slate-500 w-12">${offsetStr}</span>
            <span class="px-1.5 py-0.5 text-[9px] font-black rounded bg-slate-900/60 text-slate-400 border border-slate-800 uppercase tracking-wider">${entry.method}</span>
            <span class="font-mono text-xs text-slate-300 truncate max-w-xs md:max-w-lg" title="${entry.path}">${entry.path}</span>
          </div>
          
          <div class="flex items-center gap-4">
            <span class="px-2 py-0.5 text-[10px] font-black rounded-lg ${statusColor}">${entry.status}</span>
            <span class="text-[10px] font-mono text-slate-400 w-16 text-right">${formatBytes(entry.size)}</span>
          </div>
        </div>
      `;
    });

    const sessionDuration = session.lastRequestTime - session.startTime;

    const detailsCard = document.createElement('details');
    detailsCard.className = 'glass-panel rounded-xl overflow-hidden group border border-slate-900 hover:border-slate-800 transition-all duration-300';
    detailsCard.open = true; // Open by default
    detailsCard.innerHTML = `
      <summary class="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-900/15 transition-colors select-none list-none [&::-webkit-details-marker]:hidden">
        <div class="flex flex-wrap items-center gap-3">
          <span class="font-mono text-sm text-slate-200 font-semibold">${session.ip}</span>
          ${badgeHtml}
          <span class="text-xs text-slate-500 font-medium font-sans">
            ${session.userAgentParsed.browser} • ${session.userAgentParsed.os}
          </span>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="text-right text-xs">
            <span class="font-semibold text-slate-300">${session.entries.length} ${session.entries.length === 1 ? t('sessionClick') : t('sessionClicks')}</span>
            <span class="mx-1.5 text-slate-700">•</span>
            <span class="text-slate-400 font-medium">${formatDuration(sessionDuration)}</span>
          </div>
          <!-- Collapse SVG icon -->
          <svg class="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </summary>
      
      <div class="px-6 pb-5 pt-3 border-t border-slate-900 bg-slate-950/20">
        <div class="relative border-l border-slate-900 ml-4 pl-6 space-y-4 pt-1">
          ${stepsHtml}
        </div>
      </div>
    `;
    sessionsContainer.appendChild(detailsCard);
  });
}
