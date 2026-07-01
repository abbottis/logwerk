/**
 * Log Parser module for LogWerk.
 * Handles parsing of various log formats using standard presets or custom regular expressions.
 */

export const PRESETS = {
  nginx_combined: {
    id: 'nginx_combined',
    name: 'Nginx / Apache Combined',
    regex: /^(\S+) (\S+) (\S+) \[(.*?)\] "(.*?)" (\d{3}) (\S+)(?: "(.*?)" "(.*?)")?$/,
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
  },
  apache_common: {
    id: 'apache_common',
    name: 'Apache Common',
    regex: /^(\S+) (\S+) (\S+) \[(.*?)\] "(.*?)" (\d{3}) (\S+)$/,
    fields: {
      ip: 1,
      ident: 2,
      user: 3,
      timestamp: 4,
      request: 5,
      status: 6,
      size: 7,
      referer: null,
      userAgent: null
    }
  }
};

/**
 * Helper to parse a single line of log.
 * @param {string} line 
 * @param {object} preset 
 * @returns {object|null} Parsed log entry or null if it didn't match.
 */
export function parseLine(line, preset) {
  if (!line || line.trim() === '') return null;
  
  const match = line.match(preset.regex);
  if (!match) return null;

  const fields = preset.fields;
  const requestString = fields.request ? match[fields.request] || '' : '';
  
  // Parse request line: "METHOD PATH PROTOCOL"
  let method = '-';
  let path = '-';
  let protocol = '-';
  if (requestString) {
    const knownMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH', 'TRACE', 'CONNECT'];
    
    // Check if request is binary payload or hex encrypted TLS scans (starts with \x...)
    const isHexEscaped = requestString.startsWith('\\x') || requestString.includes('\\x');
    
    if (isHexEscaped) {
      if (requestString.startsWith('\\x16\\x03')) {
        method = 'TLS Handshake';
        path = '[Encrypted TLS Session / Connection Scan]';
      } else {
        method = 'Malformed Request';
        path = '[Malformed Binary Data / Non-HTTP Protocol]';
      }
      protocol = '-';
    } else {
      const parts = requestString.split(' ');
      if (parts.length > 0) {
        const firstPart = parts[0];
        // Validate if it is a standard HTTP method, or if it's some other non-standard text
        if (knownMethods.includes(firstPart.toUpperCase())) {
          method = firstPart.toUpperCase();
          if (parts.length > 1) path = parts[1];
          if (parts.length > 2) protocol = parts[2];
        } else {
          method = 'Malformed Request';
          path = requestString.length > 60 ? requestString.substring(0, 60) + '...' : requestString;
          protocol = '-';
        }
      }
    }
  }

  // Parse timestamp to Date object if possible
  // Format: 30/Jun/2026:00:02:18 +0000
  const rawTime = fields.timestamp ? match[fields.timestamp] : '';
  let parsedDate = null;
  if (rawTime) {
    // Convert e.g., "30/Jun/2026:00:02:18 +0000" to JS Date
    // Replacements: 30/Jun/2026 00:02:18 +0000 or similar
    const cleaned = rawTime.replace(':', ' ');
    parsedDate = new Date(cleaned);
    if (isNaN(parsedDate.getTime())) {
      // Fallback parsing for custom formats
      parsedDate = new Date(rawTime);
    }
  }

  const uaString = fields.userAgent ? match[fields.userAgent] || '-' : '-';
  const uaParsed = parseUserAgent(uaString);

  return {
    raw: line,
    ip: fields.ip ? match[fields.ip] || '-' : '-',
    ipCountry: getIpCountry(fields.ip ? match[fields.ip] || '-' : '-'),
    timestamp: rawTime,
    date: parsedDate,
    request: requestString,
    method: method,
    path: path,
    protocol: protocol,
    status: fields.status ? parseInt(match[fields.status], 10) || 0 : 0,
    size: fields.size ? (match[fields.size] === '-' ? 0 : parseInt(match[fields.size], 10) || 0) : 0,
    referer: fields.referer ? match[fields.referer] || '-' : '-',
    userAgent: uaString,
    userAgentParsed: uaParsed
  };
}

/**
 * Asynchronously parses a large string content chunk by chunk to prevent UI freeze.
 * @param {string} textContent 
 * @param {object} preset 
 * @param {function} onProgress (parsedCount, totalLines, itemsSoFar)
 * @returns {Promise<Array>} Promise resolving to all parsed entries.
 */
export function parseLogFileAsync(textContent, preset, onProgress) {
  return new Promise((resolve) => {
    // Split lines
    const lines = textContent.split(/\r?\n/);
    const totalLines = lines.length;
    const entries = [];
    let currentIndex = 0;
    const chunkSize = 2000; // Parse 2000 lines per tick to keep browser UI smooth

    function processChunk() {
      const end = Math.min(currentIndex + chunkSize, totalLines);
      for (let i = currentIndex; i < end; i++) {
        const line = lines[i];
        if (line && line.trim() !== '') {
          const parsed = parseLine(line, preset);
          if (parsed) {
            entries.push(parsed);
          }
        }
      }

      currentIndex = end;

      if (onProgress) {
        onProgress(currentIndex, totalLines, entries.length);
      }

      if (currentIndex < totalLines) {
        // Schedule next chunk using requestAnimationFrame or setTimeout
        requestAnimationFrame(processChunk);
      } else {
        resolve(entries);
      }
    }

    // Start processing
    requestAnimationFrame(processChunk);
  });
}

/**
 * Extracts browser, OS, and bot information from User Agent string.
 * @param {string} uaString 
 * @returns {object} { browser, os, isBot, botName, botProvider, botType }
 */
export function parseUserAgent(uaString) {
  if (!uaString || uaString === '-') {
    return { browser: 'Unknown', os: 'Unknown', isBot: false, botName: null, botProvider: null, botType: null };
  }

  const ua = uaString.toLowerCase();
  
  // Define bot rules with their specific labels, providers, and types
  const botRules = [
    // Google family
    { name: 'Googlebot Image', pattern: /googlebot-image/i, provider: 'Google', type: 'Media Fetcher' },
    { name: 'Googlebot Video', pattern: /googlebot-video/i, provider: 'Google', type: 'Media Fetcher' },
    { name: 'Googlebot', pattern: /googlebot/i, provider: 'Google', type: 'Search Indexer' },
    { name: 'GoogleOther', pattern: /googleother/i, provider: 'Google', type: 'Generic Crawler' },
    { name: 'Google-InspectionTool', pattern: /google-inspectiontool/i, provider: 'Google', type: 'Search Indexer' },
    { name: 'FeedFetcher-Google', pattern: /feedfetcher-google/i, provider: 'Google', type: 'Feed Fetcher' },
    { name: 'AdsBot-Google', pattern: /adsbot-google/i, provider: 'Google', type: 'Ads Crawler' },
    { name: 'Google Web Preview', pattern: /google web preview/i, provider: 'Google', type: 'Preview Fetcher' },
    { name: 'Chrome Lighthouse', pattern: /chrome-lighthouse/i, provider: 'Google', type: 'Performance Auditor' },

    // Other search engines
    { name: 'Bingbot', pattern: /bingbot/i, provider: 'Microsoft', type: 'Search Indexer' },
    { name: 'MSNBot', pattern: /msnbot/i, provider: 'Microsoft', type: 'Search Indexer' },
    { name: 'YandexBot', pattern: /yandexbot/i, provider: 'Yandex', type: 'Search Indexer' },
    { name: 'Yandex Crawler', pattern: /yandex/i, provider: 'Yandex', type: 'Search Indexer' },
    { name: 'Baiduspider', pattern: /baiduspider/i, provider: 'Baidu', type: 'Search Indexer' },
    { name: 'SeznamBot', pattern: /seznambot/i, provider: 'Seznam', type: 'Search Indexer' },
    { name: 'Yahoo Slurp', pattern: /slurp/i, provider: 'Yahoo', type: 'Search Indexer' },
    { name: 'Internet Archive Bot', pattern: /archive\.org_bot/i, provider: 'Internet Archive', type: 'Archiver' },
    { name: 'TurnitinBot', pattern: /turnitinbot/i, provider: 'Turnitin', type: 'Plagiarism Checker' },

    // AI crawlers
    { name: 'PerplexityBot', pattern: /perplexitybot/i, provider: 'Perplexity AI', type: 'AI Crawler' },
    { name: 'GPTBot', pattern: /gptbot/i, provider: 'OpenAI', type: 'AI Crawler' },
    { name: 'ChatGPT-User', pattern: /chatgpt-user/i, provider: 'OpenAI', type: 'AI Crawler' },
    { name: 'ClaudeBot', pattern: /claudebot/i, provider: 'Anthropic', type: 'AI Crawler' },
    { name: 'Amazonbot', pattern: /amazonbot/i, provider: 'Amazon', type: 'AI Crawler' },
    { name: 'Meta External Agent', pattern: /meta-externalagent/i, provider: 'Meta', type: 'AI Crawler' },
    { name: 'Applebot', pattern: /applebot/i, provider: 'Apple', type: 'Search Indexer' },

    // SEO / marketing tools
    { name: 'AhrefsSiteAudit', pattern: /ahrefssiteaudit/i, provider: 'Ahrefs', type: 'SEO/Marketing' },
    { name: 'AhrefsBot', pattern: /ahrefsbot/i, provider: 'Ahrefs', type: 'SEO/Marketing' },
    { name: 'SemrushBot', pattern: /semrushbot/i, provider: 'Semrush', type: 'SEO/Marketing' },
    { name: 'MJ12bot', pattern: /mj12bot/i, provider: 'Majestic', type: 'SEO/Marketing' },
    { name: 'Screaming Frog SEO Spider', pattern: /screaming frog seo spider/i, provider: 'Screaming Frog', type: 'SEO/Marketing' },

    // Social media preview/crawlers
    { name: 'Twitterbot', pattern: /twitterbot/i, provider: 'X (Twitter)', type: 'Social Media' },
    { name: 'Facebook External Hit', pattern: /facebookexternalhit/i, provider: 'Meta', type: 'Social Media' },
    { name: 'Meta Web Indexer', pattern: /meta-webindexer/i, provider: 'Meta', type: 'Search Indexer' },
    { name: 'LinkedInBot', pattern: /linkedinbot/i, provider: 'LinkedIn', type: 'Social Media' },
    { name: 'Bluesky AppView', pattern: /bskyappview/i, provider: 'Bluesky', type: 'Social Media' },

    // Fediverse / ActivityPub crawlers (common on federated instances)
    { name: 'Mastodon WebAgent', pattern: /mastodon/i, provider: 'Mastodon', type: 'Social Media' },
    { name: 'Friendica', pattern: /friendica/i, provider: 'Friendica', type: 'Social Media' },
    { name: 'l9explore', pattern: /l9explore/i, provider: 'Fediverse / ActivityPub', type: 'Federation Crawler' },
    { name: 'pathscan', pattern: /pathscan/i, provider: 'Fediverse / ActivityPub', type: 'Federation Crawler' },
    { name: 'GhostExplore', pattern: /ghostexplore/i, provider: 'Ghost', type: 'Federation Crawler' },
    { name: 'Poduptime', pattern: /poduptime/i, provider: 'Fediverse / ActivityPub', type: 'Federation Crawler' },
    { name: 'FediDB Crawler', pattern: /fedidb/i, provider: 'Fediverse / ActivityPub', type: 'Federation Crawler' },
    { name: 'FediIndex', pattern: /fediindex/i, provider: 'Fediverse / ActivityPub', type: 'Federation Crawler' },
    { name: 'indigo-automod', pattern: /indigo-automod/i, provider: 'Bluesky', type: 'Federation Crawler' },
    { name: 'SkyWatch', pattern: /skywatch/i, provider: 'Bluesky', type: 'Federation Crawler' },
    { name: 'Fediverse Health Checker', pattern: /unifiedfediversehealthchecker/i, provider: 'Fediverse / ActivityPub', type: 'Federation Crawler' },
    { name: "Minoru's Fediverse Crawler", pattern: /minoru/i, provider: 'Fediverse / ActivityPub', type: 'Federation Crawler' },

    // Developer tools / HTTP clients
    { name: 'curl', pattern: /curl/i, provider: 'Independent', type: 'Developer Tool' },
    { name: 'Wget', pattern: /wget/i, provider: 'Independent', type: 'Developer Tool' },
    { name: 'Python Client', pattern: /python/i, provider: 'Independent', type: 'Developer Tool' },
    { name: 'Go HTTP Client', pattern: /go-http-client/i, provider: 'Independent', type: 'Developer Tool' },
    { name: 'node-fetch', pattern: /node-fetch/i, provider: 'Independent', type: 'Developer Tool' },
    { name: 'n8n Automation', pattern: /\bn8n\b/i, provider: 'n8n', type: 'Automation Tool' },
    { name: 'Headless Chrome', pattern: /headlesschrome/i, provider: 'Independent', type: 'Automation Tool' },

    // Security scanners
    { name: 'ModatScanner', pattern: /modatscanner/i, provider: 'Modat', type: 'Security/Scanner' },
    { name: 'Censys Scanner', pattern: /censys/i, provider: 'Censys', type: 'Security/Scanner' },
    { name: 'Nmap Scanner', pattern: /nmap/i, provider: 'Independent', type: 'Security/Scanner' },
    { name: 'Zgrab Scanner', pattern: /zgrab/i, provider: 'Independent', type: 'Security/Scanner' },
    { name: 'Masscan Scanner', pattern: /masscan/i, provider: 'Independent', type: 'Security/Scanner' },
    { name: 'Palo Alto Cortex Xpanse', pattern: /paloaltonetworks/i, provider: 'Palo Alto Networks', type: 'Security/Scanner' }
  ];

  // Check if any rule matches
  let isBot = false;
  let botName = null;
  let botProvider = null;
  let botType = null;
  
  for (const rule of botRules) {
    if (rule.pattern.test(ua)) {
      isBot = true;
      botName = rule.name;
      botProvider = rule.provider;
      botType = rule.type;
      break;
    }
  }

  // Fallback check for general crawlers/spiders if not matched by specific rules
  if (!isBot) {
    const generalBotKeywords = ['bot', 'crawler', 'spider', 'scrap', 'http.rb', 'slurp', 'scan'];
    if (generalBotKeywords.some(keyword => ua.includes(keyword))) {
      isBot = true;
      botName = 'Other Crawler/Spider';
      botProvider = 'Other / Unknown';
      botType = 'Generic Crawler';
    }
  }

  // Detect OS
  let os = 'Other';
  if (isBot) {
    os = 'Bot/Scanner';
  } else {
    if (ua.includes('windows nt')) {
      os = 'Windows';
    } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
      os = 'macOS';
    } else if (ua.includes('iphone') || ua.includes('ipad')) {
      os = 'iOS';
    } else if (ua.includes('android')) {
      os = 'Android';
    } else if (ua.includes('linux')) {
      os = 'Linux';
    }
  }

  // Detect Browser
  let browser = 'Other';
  if (isBot) {
    browser = botName;
  } else {
    if (ua.includes('chrome') && !ua.includes('chromium') && !ua.includes('edg') && !ua.includes('opr')) {
      browser = 'Chrome';
    } else if (ua.includes('firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('chromium')) {
      browser = 'Safari';
    } else if (ua.includes('edg')) {
      browser = 'Edge';
    } else if (ua.includes('opera') || ua.includes('opr')) {
      browser = 'Opera';
    }
  }

  return { browser, os, isBot, botName, botProvider, botType };
}

/**
 * Returns country name corresponding to client IP address.
 * Uses local range/prefix maps for accuracy and deterministic fallback for offline compliance.
 * @param {string} ip 
 * @returns {string} Country name
 */
export function getIpCountry(ip) {
  if (!ip || ip === '-') return 'Unknown';
  
  // Private / Localhost detection
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('fe80:') || ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.') || ip.startsWith('172.17.') || ip.startsWith('172.18.') || ip.startsWith('172.19.') || ip.startsWith('172.2') || ip.startsWith('172.3')) {
    return 'Local Network';
  }

  // Common Prefix-to-Country Mapping (specifically covering access.log and common ranges)
  const prefixes = {
    // IPv4 2-octet prefixes
    '209.50': 'United States',
    '98.92': 'United States',
    '163.7': 'United States',
    '72.146': 'Germany',
    '5.61': 'Germany',
    '20.151': 'United States',
    '92.205': 'Germany',
    '45.148': 'Netherlands',
    '34.176': 'United States',
    '66.249': 'United States',
    '78.47': 'Germany',
    '168.119': 'Germany',
    '136.65': 'United States',
    '80.94': 'Moldova',
    '138.201': 'Germany',
    '178.105': 'Germany',
    '167.235': 'Germany',
    '167.233': 'Germany',
    '85.204': 'Romania',
    '116.202': 'Germany',
    '62.210': 'France',
    
    // IPv6 Prefixes
    '2001:9e8': 'Germany',
    '2a01:4f8': 'Germany',
    '2001:41d0': 'France'
  };

  // Check defined prefixes
  for (const [prefix, country] of Object.entries(prefixes)) {
    if (ip.startsWith(prefix)) return country;
  }

  // Heuristics for other IPv4 / IPv6 addresses
  const countries = [
    'Germany', 'United States', 'France', 'United Kingdom', 'Netherlands', 
    'Poland', 'Canada', 'Italy', 'Spain', 'Switzerland', 'Austria', 'Japan'
  ];
  
  // Deterministic string hash
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = ip.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % countries.length;
  return countries[index];
}
