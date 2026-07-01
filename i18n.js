/**
 * Localization (i18n/l10n) module for LogWerk.
 * Contains translation dictionaries and dynamic UI translation logic.
 */

const TRANSLATIONS = {
  en: {
    title: 'LogWerk',
    subtitle: 'Server Log Analytics Dashboard',
    dropzoneTitle: 'Drag & drop log files here',
    dropzoneBrowse: 'or click to browse your computer',
    dropzoneSupported: 'Supports Nginx Combined, Apache Common, and custom regex configurations.',
    selectPreset: 'Select Log Format Preset',
    presetCombined: 'Nginx / Apache Combined',
    presetCommon: 'Apache Common',
    presetCustom: 'Custom RegEx Pattern',
    customRegexLabel: 'Custom Regular Expression Pattern',
    customRegexPlaceholder: 'e.g., ^(\\S+) (\\S+) ...',
    parsingStatus: 'Parsing log file... Please wait.',
    parsedSuccess: 'Successfully parsed {count} log entries in {time}ms.',
    parseFailed: 'Failed to parse log file. Check format selection or custom RegEx.',
    
    // Stats Card Titles
    statTotal: 'Total Requests',
    statSuccess: 'Successful (2xx/3xx)',
    statClientErrors: 'Client Errors (4xx)',
    statServerErrors: 'Server Errors (5xx)',
    statDataSent: 'Data Transferred',
    statBots: 'Bot Requests',
    statHumans: 'Human Requests',
    
    // Analytics Section Titles
    chartTraffic: 'Traffic Over Time',
    chartStatus: 'HTTP Status Distribution',
    chartPaths: 'Top Requested Paths',
    chartIps: 'Top Client IP Addresses',
    chartBrowsers: 'Top Browsers',
    chartOs: 'Top Operating Systems',
    chartBotsTitle: 'Bot Traffic Analysis',
    chartBotProviders: 'Top Bot Providers',
    chartBotTypes: 'Bot Purpose / Usage',
    chartBots: 'Top Specific Bots',
    
    // Filters & Search
    searchPlaceholder: 'Search by IP, path, status, agent, referer...',
    filterStatus: 'Status Code Filter',
    filterStatusAll: 'All Statuses',
    filterMethod: 'HTTP Method Filter',
    filterMethodAll: 'All Methods',
    sortDateDefault: 'Original Order',
    sortDateDesc: 'Newest First',
    sortDateAsc: 'Oldest First',
    filterTrafficType: 'Traffic Type Filter',
    filterTrafficAll: 'All Traffic',
    filterTrafficHumans: 'Humans Only',
    filterTrafficBots: 'Bots Only',
    filterBotAll: 'All Bots',
    filterBotSelect: 'Specific Bot Filter',
    resetFilters: 'Reset Filters',
    exportData: 'Export Filtered (CSV)',
    
    // Table
    colIp: 'Client IP',
    colAccessDetails: 'Access Details',
    colDate: 'Timestamp',
    colMethod: 'Method',
    colPath: 'Request Path',
    colStatus: 'Status',
    colSize: 'Size',
    colAction: 'Action',
    actionView: 'Inspect',
    noData: 'No log data loaded yet. Please drag & drop or upload a log file above.',
    noMatchingData: 'No entries match your search and filter criteria.',
    paginationPrev: 'Previous',
    paginationNext: 'Next',
    paginationInfo: 'Showing {start} to {end} of {total} entries',
    
    // Sessions
    tabLogAnalysis: 'Log Analysis',
    tabSessions: 'Session Journeys',
    sessionClick: 'Click',
    sessionClicks: 'Clicks',
    sessionDuration: 'Duration',
    sessionPagesVisited: 'Pages Visited',
    sessionNoData: 'No active sessions found under current filter criteria.',
    filterSessionClicksLabel: 'Min Clicks:',
    filterSessionClicksAll: '1+ Clicks (All)',
    filterSessionClicks2: '2+ Clicks (Exclude Bounces)',
    filterSessionClicks5: '5+ Clicks (Deep Engagement)',
    filterSessionTypeLabel: 'Session Type:',
    filterSessionTypeAll: 'All Sessions',
    filterSessionTypeHumans: 'Humans Only (Recommended)',
    filterSessionTypeBots: 'Bots Only',
    filterSessionSortLabel: 'Sort By:',
    filterSessionSortRecent: 'Most Recent',
    filterSessionSortClicks: 'Most Active (Clicks)',
    filterSessionSortDuration: 'Longest Duration',
    sessionsCount: '{count} Sessions',
    
    // Modal
    modalTitle: 'Log Entry Details',
    modalRaw: 'Raw Log Line',
    modalParsedDetails: 'Parsed Request Information',
    modalClientInfo: 'Client & User Agent Info',
    modalReferer: 'Referer URL',
    modalUaString: 'Full User Agent String',
    modalBrowser: 'Detected Browser',
    modalOs: 'Detected OS',
    modalIsBot: 'Is Bot/Scanner?',
    modalBotName: 'Bot Name',
    modalBotProvider: 'Bot Provider',
    modalBotType: 'Bot Purpose/Type',
    modalClose: 'Close Details'
  },
  de: {
    title: 'LogWerk',
    subtitle: 'Server-Loganalyse Dashboard',
    dropzoneTitle: 'Logdateien hierher ziehen',
    dropzoneBrowse: 'oder hier klicken, um Computer zu durchsuchen',
    dropzoneSupported: 'Unterstützt Nginx Combined, Apache Common und benutzerdefinierte RegEx-Formate.',
    selectPreset: 'Log-Format-Voreinstellung wählen',
    presetCombined: 'Nginx / Apache Combined',
    presetCommon: 'Apache Common',
    presetCustom: 'Benutzerdefiniertes RegEx-Muster',
    customRegexLabel: 'Benutzerdefiniertes RegEx-Muster',
    customRegexPlaceholder: 'z.B. ^(\\S+) (\\S+) ...',
    parsingStatus: 'Logdatei wird geparst... Bitte warten.',
    parsedSuccess: '{count} Log-Einträge erfolgreich in {time}ms geparst.',
    parseFailed: 'Fehler beim Parsen der Logdatei. Überprüfen Sie das Format oder das RegEx-Muster.',
    
    // Stats Card Titles
    statTotal: 'Anfragen Gesamt',
    statSuccess: 'Erfolgreich (2xx/3xx)',
    statClientErrors: 'Client-Fehler (4xx)',
    statServerErrors: 'Server-Fehler (5xx)',
    statDataSent: 'Daten übertragen',
    statBots: 'Bot-Anfragen',
    statHumans: 'Menschliche Anfragen',
    
    // Analytics Section Titles
    chartTraffic: 'Verlauf über die Zeit',
    chartStatus: 'HTTP-Status Verteilung',
    chartPaths: 'Häufigste Pfade',
    chartIps: 'Häufigste Client-IPs',
    chartBrowsers: 'Häufigste Browser',
    chartOs: 'Häufigste Betriebssysteme',
    chartBotsTitle: 'Bot-Traffic-Analyse',
    chartBotProviders: 'Häufigste Bot-Anbieter',
    chartBotTypes: 'Bot-Verwendungszweck',
    chartBots: 'Häufigste spezifische Bots',
    
    // Filters & Search
    searchPlaceholder: 'Suche nach IP, Pfad, Status, Agent, Referer...',
    filterStatus: 'Statuscode-Filter',
    filterStatusAll: 'Alle Statuscodes',
    filterMethod: 'HTTP-Methoden-Filter',
    filterMethodAll: 'Alle Methoden',
    sortDateDefault: 'Ursprüngliche Reihenfolge',
    sortDateDesc: 'Neueste zuerst',
    sortDateAsc: 'Älteste zuerst',
    filterTrafficType: 'Verkehrsart-Filter',
    filterTrafficAll: 'Gesamter Verkehr',
    filterTrafficHumans: 'Nur Menschen',
    filterTrafficBots: 'Nur Bots/Scanner',
    filterBotAll: 'Alle Bots',
    filterBotSelect: 'Spezifischer Bot-Filter',
    resetFilters: 'Filter zurücksetzen',
    exportData: 'Gefilterte exportieren (CSV)',
    
    // Table
    colIp: 'Client-IP',
    colAccessDetails: 'Zugangsdetails',
    colDate: 'Zeitstempel',
    colMethod: 'Methode',
    colPath: 'Pfad',
    colStatus: 'Status',
    colSize: 'Größe',
    colAction: 'Aktion',
    actionView: 'Details',
    noData: 'Noch keine Logdaten geladen. Bitte ziehen Sie eine Logdatei hierher oder laden Sie eine hoch.',
    noMatchingData: 'Keine Einträge entsprechen Ihren Filter- oder Suchkriterien.',
    paginationPrev: 'Zurück',
    paginationNext: 'Weiter',
    paginationInfo: 'Zeige {start} bis {end} von {total} Einträgen',
    
    // Sessions
    tabLogAnalysis: 'Log-Analyse',
    tabSessions: 'Besucherverlauf',
    sessionClick: 'Klick',
    sessionClicks: 'Klicks',
    sessionDuration: 'Dauer',
    sessionPagesVisited: 'Besuchte Seiten',
    sessionNoData: 'Keine aktiven Sitzungen unter den aktuellen Filtereinstellungen gefunden.',
    filterSessionClicksLabel: 'Min. Klicks:',
    filterSessionClicksAll: '1+ Klicks (Alle)',
    filterSessionClicks2: '2+ Klicks (Ohne Bounces)',
    filterSessionClicks5: '5+ Klicks (Hohe Aktivität)',
    filterSessionTypeLabel: 'Sitzungstyp:',
    filterSessionTypeAll: 'Alle Sitzungen',
    filterSessionTypeHumans: 'Nur Menschen (Empfohlen)',
    filterSessionTypeBots: 'Nur Bots',
    filterSessionSortLabel: 'Sortierung:',
    filterSessionSortRecent: 'Neueste zuerst',
    filterSessionSortClicks: 'Aktivste zuerst (Klicks)',
    filterSessionSortDuration: 'Längste Dauer',
    sessionsCount: '{count} Sitzungen',
    
    // Modal
    modalTitle: 'Details des Log-Eintrags',
    modalRaw: 'Rohe Logzeile',
    modalParsedDetails: 'Geparste Anfragedetails',
    modalClientInfo: 'Client- & User-Agent-Details',
    modalReferer: 'Referer URL',
    modalUaString: 'Vollständiger User-Agent String',
    modalBrowser: 'Erkannter Browser',
    modalOs: 'Erkanntes OS',
    modalIsBot: 'Ist Bot/Scanner?',
    modalBotName: 'Bot-Name',
    modalBotProvider: 'Bot-Anbieter',
    modalBotType: 'Bot-Typ / Zweck',
    modalClose: 'Schließen'
  },
  fr: {
    title: 'LogWerk',
    subtitle: "Tableau de bord d'analyse des journaux serveur",
    dropzoneTitle: 'Glissez-déposez vos fichiers journaux ici',
    dropzoneBrowse: 'ou cliquez pour parcourir votre ordinateur',
    dropzoneSupported: 'Prend en charge Nginx Combined, Apache Common et les expressions régulières personnalisées.',
    selectPreset: 'Sélectionner le format de journal',
    presetCombined: 'Nginx / Apache Combined',
    presetCommon: 'Apache Common',
    presetCustom: 'Expression régulière personnalisée',
    customRegexLabel: 'Modèle d\'expression régulière personnalisé',
    customRegexPlaceholder: 'ex. ^(\\S+) (\\S+) ...',
    parsingStatus: 'Analyse du fichier journal en cours... Veuillez patienter.',
    parsedSuccess: '{count} entrées de journal analysées avec succès en {time}ms.',
    parseFailed: "Échec de l'analyse du fichier journal. Vérifiez le format ou l'expression régulière.",

    // Stats Card Titles
    statTotal: 'Requêtes totales',
    statSuccess: 'Réussies (2xx/3xx)',
    statClientErrors: 'Erreurs client (4xx)',
    statServerErrors: 'Erreurs serveur (5xx)',
    statDataSent: 'Données transférées',
    statBots: 'Requêtes de bots',
    statHumans: 'Requêtes humaines',

    // Analytics Section Titles
    chartTraffic: 'Trafic dans le temps',
    chartStatus: 'Répartition des statuts HTTP',
    chartPaths: 'Chemins les plus demandés',
    chartIps: 'Adresses IP client les plus fréquentes',
    chartBrowsers: 'Navigateurs les plus fréquents',
    chartOs: "Systèmes d'exploitation les plus fréquents",
    chartBotsTitle: 'Analyse du trafic de bots',
    chartBotProviders: 'Principaux fournisseurs de bots',
    chartBotTypes: 'Objectif / Usage des bots',
    chartBots: 'Bots spécifiques les plus fréquents',

    // Filters & Search
    searchPlaceholder: 'Rechercher par IP, chemin, statut, agent, référent...',
    filterStatus: 'Filtre par code de statut',
    filterStatusAll: 'Tous les statuts',
    filterMethod: 'Filtre par méthode HTTP',
    filterMethodAll: 'Toutes les méthodes',
    sortDateDefault: "Ordre d'origine",
    sortDateDesc: 'Plus récent d\'abord',
    sortDateAsc: 'Plus ancien d\'abord',
    filterTrafficType: 'Filtre par type de trafic',
    filterTrafficAll: 'Tout le trafic',
    filterTrafficHumans: 'Humains uniquement',
    filterTrafficBots: 'Bots uniquement',
    filterBotAll: 'Tous les bots',
    filterBotSelect: 'Filtre par bot spécifique',
    resetFilters: 'Réinitialiser les filtres',
    exportData: 'Exporter la sélection (CSV)',

    // Table
    colIp: 'IP client',
    colAccessDetails: "Détails d'accès",
    colDate: 'Horodatage',
    colMethod: 'Méthode',
    colPath: 'Chemin de la requête',
    colStatus: 'Statut',
    colSize: 'Taille',
    colAction: 'Action',
    actionView: 'Inspecter',
    noData: 'Aucune donnée de journal chargée. Veuillez glisser-déposer ou téléverser un fichier journal ci-dessus.',
    noMatchingData: 'Aucune entrée ne correspond à vos critères de recherche et de filtrage.',
    paginationPrev: 'Précédent',
    paginationNext: 'Suivant',
    paginationInfo: 'Affichage de {start} à {end} sur {total} entrées',

    // Sessions
    tabLogAnalysis: 'Analyse des journaux',
    tabSessions: 'Parcours de session',
    sessionClick: 'Clic',
    sessionClicks: 'Clics',
    sessionDuration: 'Durée',
    sessionPagesVisited: 'Pages visitées',
    sessionNoData: 'Aucune session active trouvée selon les critères de filtrage actuels.',
    filterSessionClicksLabel: 'Clics min. :',
    filterSessionClicksAll: '1+ clics (Toutes)',
    filterSessionClicks2: '2+ clics (Hors rebonds)',
    filterSessionClicks5: '5+ clics (Fort engagement)',
    filterSessionTypeLabel: 'Type de session :',
    filterSessionTypeAll: 'Toutes les sessions',
    filterSessionTypeHumans: 'Humains uniquement (Recommandé)',
    filterSessionTypeBots: 'Bots uniquement',
    filterSessionSortLabel: 'Trier par :',
    filterSessionSortRecent: 'Plus récent',
    filterSessionSortClicks: 'Plus actif (clics)',
    filterSessionSortDuration: 'Durée la plus longue',
    sessionsCount: '{count} sessions',

    // Modal
    modalTitle: "Détails de l'entrée de journal",
    modalRaw: 'Ligne de journal brute',
    modalParsedDetails: 'Informations de requête analysées',
    modalClientInfo: 'Informations client & user agent',
    modalReferer: 'URL du référent',
    modalUaString: 'Chaîne complète du user agent',
    modalBrowser: 'Navigateur détecté',
    modalOs: 'OS détecté',
    modalIsBot: 'Est un bot/scanner ?',
    modalBotName: 'Nom du bot',
    modalBotProvider: 'Fournisseur du bot',
    modalBotType: 'Objectif / type de bot',
    modalClose: 'Fermer les détails'
  },
  es: {
    title: 'LogWerk',
    subtitle: 'Panel de análisis de registros del servidor',
    dropzoneTitle: 'Arrastra y suelta tus archivos de registro aquí',
    dropzoneBrowse: 'o haz clic para buscar en tu computadora',
    dropzoneSupported: 'Compatible con Nginx Combined, Apache Common y expresiones regulares personalizadas.',
    selectPreset: 'Seleccionar formato de registro',
    presetCombined: 'Nginx / Apache Combined',
    presetCommon: 'Apache Common',
    presetCustom: 'Expresión regular personalizada',
    customRegexLabel: 'Patrón de expresión regular personalizado',
    customRegexPlaceholder: 'p. ej., ^(\\S+) (\\S+) ...',
    parsingStatus: 'Analizando el archivo de registro... Por favor, espere.',
    parsedSuccess: 'Se analizaron correctamente {count} entradas de registro en {time}ms.',
    parseFailed: 'Error al analizar el archivo de registro. Verifique el formato o la expresión regular.',

    // Stats Card Titles
    statTotal: 'Solicitudes totales',
    statSuccess: 'Exitosas (2xx/3xx)',
    statClientErrors: 'Errores de cliente (4xx)',
    statServerErrors: 'Errores de servidor (5xx)',
    statDataSent: 'Datos transferidos',
    statBots: 'Solicitudes de bots',
    statHumans: 'Solicitudes humanas',

    // Analytics Section Titles
    chartTraffic: 'Tráfico a lo largo del tiempo',
    chartStatus: 'Distribución de estados HTTP',
    chartPaths: 'Rutas más solicitadas',
    chartIps: 'Direcciones IP de cliente más frecuentes',
    chartBrowsers: 'Navegadores más frecuentes',
    chartOs: 'Sistemas operativos más frecuentes',
    chartBotsTitle: 'Análisis de tráfico de bots',
    chartBotProviders: 'Principales proveedores de bots',
    chartBotTypes: 'Propósito / uso de bots',
    chartBots: 'Bots específicos más frecuentes',

    // Filters & Search
    searchPlaceholder: 'Buscar por IP, ruta, estado, agente, referente...',
    filterStatus: 'Filtro de código de estado',
    filterStatusAll: 'Todos los estados',
    filterMethod: 'Filtro de método HTTP',
    filterMethodAll: 'Todos los métodos',
    sortDateDefault: 'Orden original',
    sortDateDesc: 'Más reciente primero',
    sortDateAsc: 'Más antiguo primero',
    filterTrafficType: 'Filtro de tipo de tráfico',
    filterTrafficAll: 'Todo el tráfico',
    filterTrafficHumans: 'Solo humanos',
    filterTrafficBots: 'Solo bots',
    filterBotAll: 'Todos los bots',
    filterBotSelect: 'Filtro de bot específico',
    resetFilters: 'Restablecer filtros',
    exportData: 'Exportar filtrado (CSV)',

    // Table
    colIp: 'IP del cliente',
    colAccessDetails: 'Detalles de acceso',
    colDate: 'Marca de tiempo',
    colMethod: 'Método',
    colPath: 'Ruta de la solicitud',
    colStatus: 'Estado',
    colSize: 'Tamaño',
    colAction: 'Acción',
    actionView: 'Inspeccionar',
    noData: 'Aún no se han cargado datos de registro. Arrastra y suelta o sube un archivo de registro arriba.',
    noMatchingData: 'Ninguna entrada coincide con sus criterios de búsqueda y filtrado.',
    paginationPrev: 'Anterior',
    paginationNext: 'Siguiente',
    paginationInfo: 'Mostrando {start} a {end} de {total} entradas',

    // Sessions
    tabLogAnalysis: 'Análisis de registros',
    tabSessions: 'Recorridos de sesión',
    sessionClick: 'Clic',
    sessionClicks: 'Clics',
    sessionDuration: 'Duración',
    sessionPagesVisited: 'Páginas visitadas',
    sessionNoData: 'No se encontraron sesiones activas con los criterios de filtrado actuales.',
    filterSessionClicksLabel: 'Clics mín.:',
    filterSessionClicksAll: '1+ clics (Todas)',
    filterSessionClicks2: '2+ clics (Sin rebotes)',
    filterSessionClicks5: '5+ clics (Alto compromiso)',
    filterSessionTypeLabel: 'Tipo de sesión:',
    filterSessionTypeAll: 'Todas las sesiones',
    filterSessionTypeHumans: 'Solo humanos (Recomendado)',
    filterSessionTypeBots: 'Solo bots',
    filterSessionSortLabel: 'Ordenar por:',
    filterSessionSortRecent: 'Más reciente',
    filterSessionSortClicks: 'Más activo (clics)',
    filterSessionSortDuration: 'Mayor duración',
    sessionsCount: '{count} sesiones',

    // Modal
    modalTitle: 'Detalles de la entrada de registro',
    modalRaw: 'Línea de registro sin procesar',
    modalParsedDetails: 'Información de solicitud analizada',
    modalClientInfo: 'Información del cliente y user agent',
    modalReferer: 'URL del referente',
    modalUaString: 'Cadena completa de user agent',
    modalBrowser: 'Navegador detectado',
    modalOs: 'SO detectado',
    modalIsBot: '¿Es un bot/escáner?',
    modalBotName: 'Nombre del bot',
    modalBotProvider: 'Proveedor del bot',
    modalBotType: 'Propósito / tipo de bot',
    modalClose: 'Cerrar detalles'
  },
  it: {
    title: 'LogWerk',
    subtitle: 'Dashboard di analisi dei log del server',
    dropzoneTitle: 'Trascina qui i file di log',
    dropzoneBrowse: 'oppure clicca per sfogliare il computer',
    dropzoneSupported: 'Supporta Nginx Combined, Apache Common ed espressioni regolari personalizzate.',
    selectPreset: 'Seleziona il formato di log',
    presetCombined: 'Nginx / Apache Combined',
    presetCommon: 'Apache Common',
    presetCustom: 'Espressione regolare personalizzata',
    customRegexLabel: 'Modello di espressione regolare personalizzato',
    customRegexPlaceholder: 'es. ^(\\S+) (\\S+) ...',
    parsingStatus: 'Analisi del file di log in corso... Attendere prego.',
    parsedSuccess: '{count} voci di log analizzate con successo in {time}ms.',
    parseFailed: "Analisi del file di log non riuscita. Controlla il formato o l'espressione regolare.",

    // Stats Card Titles
    statTotal: 'Richieste totali',
    statSuccess: 'Riuscite (2xx/3xx)',
    statClientErrors: 'Errori client (4xx)',
    statServerErrors: 'Errori server (5xx)',
    statDataSent: 'Dati trasferiti',
    statBots: 'Richieste di bot',
    statHumans: 'Richieste umane',

    // Analytics Section Titles
    chartTraffic: 'Traffico nel tempo',
    chartStatus: 'Distribuzione stati HTTP',
    chartPaths: 'Percorsi più richiesti',
    chartIps: 'Indirizzi IP client più frequenti',
    chartBrowsers: 'Browser più frequenti',
    chartOs: 'Sistemi operativi più frequenti',
    chartBotsTitle: 'Analisi del traffico bot',
    chartBotProviders: 'Principali fornitori di bot',
    chartBotTypes: 'Scopo / utilizzo dei bot',
    chartBots: 'Bot specifici più frequenti',

    // Filters & Search
    searchPlaceholder: 'Cerca per IP, percorso, stato, agente, referer...',
    filterStatus: 'Filtro codice di stato',
    filterStatusAll: 'Tutti gli stati',
    filterMethod: 'Filtro metodo HTTP',
    filterMethodAll: 'Tutti i metodi',
    sortDateDefault: 'Ordine originale',
    sortDateDesc: 'Più recenti prima',
    sortDateAsc: 'Meno recenti prima',
    filterTrafficType: 'Filtro tipo di traffico',
    filterTrafficAll: 'Tutto il traffico',
    filterTrafficHumans: 'Solo umani',
    filterTrafficBots: 'Solo bot',
    filterBotAll: 'Tutti i bot',
    filterBotSelect: 'Filtro bot specifico',
    resetFilters: 'Reimposta filtri',
    exportData: 'Esporta filtrati (CSV)',

    // Table
    colIp: 'IP client',
    colAccessDetails: 'Dettagli di accesso',
    colDate: 'Timestamp',
    colMethod: 'Metodo',
    colPath: 'Percorso richiesta',
    colStatus: 'Stato',
    colSize: 'Dimensione',
    colAction: 'Azione',
    actionView: 'Ispeziona',
    noData: 'Nessun dato di log caricato. Trascina e rilascia o carica un file di log qui sopra.',
    noMatchingData: 'Nessuna voce corrisponde ai criteri di ricerca e filtro.',
    paginationPrev: 'Precedente',
    paginationNext: 'Successivo',
    paginationInfo: 'Visualizzazione da {start} a {end} di {total} voci',

    // Sessions
    tabLogAnalysis: 'Analisi log',
    tabSessions: 'Percorsi di sessione',
    sessionClick: 'Clic',
    sessionClicks: 'Clic',
    sessionDuration: 'Durata',
    sessionPagesVisited: 'Pagine visitate',
    sessionNoData: 'Nessuna sessione attiva trovata con i criteri di filtro attuali.',
    filterSessionClicksLabel: 'Clic min.:',
    filterSessionClicksAll: '1+ clic (Tutte)',
    filterSessionClicks2: '2+ clic (Esclude i rimbalzi)',
    filterSessionClicks5: '5+ clic (Alto coinvolgimento)',
    filterSessionTypeLabel: 'Tipo di sessione:',
    filterSessionTypeAll: 'Tutte le sessioni',
    filterSessionTypeHumans: 'Solo umani (Consigliato)',
    filterSessionTypeBots: 'Solo bot',
    filterSessionSortLabel: 'Ordina per:',
    filterSessionSortRecent: 'Più recenti',
    filterSessionSortClicks: 'Più attivi (clic)',
    filterSessionSortDuration: 'Durata maggiore',
    sessionsCount: '{count} sessioni',

    // Modal
    modalTitle: 'Dettagli voce di log',
    modalRaw: 'Riga di log grezza',
    modalParsedDetails: 'Informazioni richiesta analizzate',
    modalClientInfo: 'Informazioni client e user agent',
    modalReferer: 'URL referer',
    modalUaString: 'Stringa user agent completa',
    modalBrowser: 'Browser rilevato',
    modalOs: 'SO rilevato',
    modalIsBot: 'È un bot/scanner?',
    modalBotName: 'Nome del bot',
    modalBotProvider: 'Fornitore del bot',
    modalBotType: 'Scopo / tipo di bot',
    modalClose: 'Chiudi dettagli'
  },
  uk: {
    title: 'LogWerk',
    subtitle: 'Аналітична панель логів сервера',
    dropzoneTitle: 'Перетягніть файли логів сюди',
    dropzoneBrowse: 'або виберіть файл на комп’ютері',
    dropzoneSupported: 'Підтримує формати Nginx Combined, Apache Common та власні регулярні вирази.',
    selectPreset: 'Виберіть встановлений формат',
    presetCombined: 'Nginx / Apache Combined',
    presetCommon: 'Apache Common',
    presetCustom: 'Власний регулярний вираз',
    customRegexLabel: 'Власний регулярний вираз',
    customRegexPlaceholder: 'наприклад, ^(\\S+) (\\S+) ...',
    parsingStatus: 'Аналіз файлу логів... Будь ласка, зачекайте.',
    parsedSuccess: 'Успішно оброблено {count} записів логів за {time} мс.',
    parseFailed: 'Не вдалося обробити файл логів. Перевірте вибраний формат або регулярний вираз.',
    
    // Stats Card Titles
    statTotal: 'Всього запитів',
    statSuccess: 'Успішні (2xx/3xx)',
    statClientErrors: 'Помилки клієнта (4xx)',
    statServerErrors: 'Помилки сервера (5xx)',
    statDataSent: 'Переданий трафік',
    statBots: 'Запити ботів',
    statHumans: 'Запити людей',
    
    // Analytics Section Titles
    chartTraffic: 'Трафік у часі',
    chartStatus: 'Розподіл HTTP-статусів',
    chartPaths: 'Популярні шляхи запитів',
    chartIps: 'Топ IP-адрес клієнтів',
    chartBrowsers: 'Топ браузерів',
    chartOs: 'Топ операційних систем',
    chartBotsTitle: 'Аналіз трафіку ботів',
    chartBotProviders: 'Топ провайдерів ботів',
    chartBotTypes: 'Мета / Тип ботів',
    chartBots: 'Топ конкретних ботів',
    
    // Filters & Search
    searchPlaceholder: 'Пошук за IP, шляхом, статусом, агентом, реферером...',
    filterStatus: 'Фільтр HTTP-статусів',
    filterStatusAll: 'Всі статуси',
    filterMethod: 'Фільтр HTTP-методів',
    filterMethodAll: 'Всі методи',
    sortDateDefault: 'Початковий порядок',
    sortDateDesc: 'Спочатку нові',
    sortDateAsc: 'Спочатку старі',
    filterTrafficType: 'Фільтр типу трафіку',
    filterTrafficAll: 'Весь трафік',
    filterTrafficHumans: 'Тільки люди',
    filterTrafficBots: 'Тільки боти',
    filterBotAll: 'Всі боти',
    filterBotSelect: 'Фільтр конкретного бота',
    resetFilters: 'Скинути фільтри',
    exportData: 'Експорт відфільтрованого (CSV)',
    
    // Table
    colIp: 'IP-адреса клієнта',
    colAccessDetails: 'Деталі доступу',
    colDate: 'Часова мітка',
    colMethod: 'Метод',
    colPath: 'Шлях запиту',
    colStatus: 'Статус',
    colSize: 'Розмір',
    colAction: 'Дія',
    actionView: 'Переглянути',
    noData: 'Дані логів ще не завантажені. Перетягніть файл логу сюди або завантажте його.',
    noMatchingData: 'Не знайдено записів, що відповідають критеріям пошуку та фільтрації.',
    paginationPrev: 'Назад',
    paginationNext: 'Вперед',
    paginationInfo: 'Показано з {start} по {end} із {total} записів',
    
    // Sessions
    tabLogAnalysis: 'Аналіз логів',
    tabSessions: 'Сесії відвідувачів',
    sessionClick: 'Клік',
    sessionClicks: 'Кліки',
    sessionDuration: 'Тривалість',
    sessionPagesVisited: 'Відвідані сторінки',
    sessionNoData: 'Не знайдено активних сесій за поточними критеріями фільтрації.',
    filterSessionClicksLabel: 'Мін. кліків:',
    filterSessionClicksAll: '1+ кліків (Всі)',
    filterSessionClicks2: '2+ кліків (Без відмов)',
    filterSessionClicks5: '5+ кліків (Висока активність)',
    filterSessionTypeLabel: 'Тип сесії:',
    filterSessionTypeAll: 'Всі сесії',
    filterSessionTypeHumans: 'Тільки люди (Рекомендовано)',
    filterSessionTypeBots: 'Тільки боти',
    filterSessionSortLabel: 'Сортування:',
    filterSessionSortRecent: 'Спочатку нові',
    filterSessionSortClicks: 'Спочатку активні (кліки)',
    filterSessionSortDuration: 'Найдовша тривалість',
    sessionsCount: '{count} Сесії',
    
    // Modal
    modalTitle: 'Деталі запису логу',
    modalRaw: 'Вихідний рядок логу',
    modalParsedDetails: 'Розібрані деталі запиту',
    modalClientInfo: 'Інформація про клієнта та User Agent',
    modalReferer: 'Referer URL',
    modalUaString: 'Повний рядок User Agent',
    modalBrowser: 'Виявлений браузер',
    modalOs: 'Виявлена ОС',
    modalIsBot: 'Це бот/сканер?',
    modalBotName: 'Ім’я бота',
    modalBotProvider: 'Провайдер бота',
    modalBotType: 'Призначення/Тип бота',
    modalClose: 'Закрити деталі'
  }
};

let currentLanguage = 'en';

/**
 * Initializes language from locale storage or browser preference
 */
export function initI18n() {
  const savedLang = localStorage.getItem('logwerk_lang');
  if (savedLang && TRANSLATIONS[savedLang]) {
    currentLanguage = savedLang;
  } else {
    const browserLang = navigator.language.split('-')[0];
    if (TRANSLATIONS[browserLang]) {
      currentLanguage = browserLang;
    } else {
      currentLanguage = 'en';
    }
  }
  translatePage();
}

/**
 * Switch language and refresh page translations
 * @param {string} lang 'en' or 'de'
 */
export function setLanguage(lang) {
  if (TRANSLATIONS[lang]) {
    currentLanguage = lang;
    localStorage.setItem('logwerk_lang', lang);
    translatePage();
  }
}

/**
 * Get current language
 * @returns {string} 'en' or 'de'
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * Translates a single key
 * @param {string} key 
 * @param {object} replacements Key-value pairs for string interpolation (e.g. {count})
 * @returns {string} Translated text
 */
export function t(key, replacements = {}) {
  const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS['en'];
  let text = dict[key] || TRANSLATIONS['en'][key] || key;
  
  Object.keys(replacements).forEach(placeholder => {
    text = text.replace(`{${placeholder}}`, replacements[placeholder]);
  });
  
  return text;
}

/**
 * Scans DOM for elements with `data-i18n` attribute and translates them
 */
export function translatePage() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    
    // Check if we need to translate a placeholder instead of textContent
    if (element.hasAttribute('placeholder')) {
      element.setAttribute('placeholder', t(key));
    } else {
      element.textContent = t(key);
    }
  });

  // Handle document title
  document.title = t('title') + ' - ' + t('subtitle');

  // Trigger custom event so parent applications can re-render dynamic items if needed
  const event = new CustomEvent('languagechanged', { detail: currentLanguage });
  window.dispatchEvent(event);
}
