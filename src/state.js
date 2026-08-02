let db = (load(STORAGE_KEY, [])).map(normalizeItem);
let wishdb = load(WISH_KEY, []);

let currentPage = 'biblioteca';
let tipoFilter  = '';
let statusFilter = '';
let editingId   = null;
let favEdit     = false;

let isDeleteMode = false;
let selectedIds = new Set();
let isBoxMode = false;
let isColecaoMode = false;
let containerSelectedIds = new Set();
let containerModeType = '';
let groupByAuthor = false;
let localSaveGuard = false;
let revertGuard = false;

let unsubscribeSync = null;

let detailId = null;
let detailDirty = false;
let detailUnsaved = {};

let expTime = 'Tanto faz';

let currentBoxView = null;
let containerSortBy = 'manual';
let containerViewMode = 'grid';

let installPrompt = null;

const jornadaCache = new Map();

let settingsTheme = load('indexa_settingsTheme', 'system');
let settingsScale = load('indexa_settingsScale', 100);
let settingsDensity = load('indexa_settingsDensity', 'normal');
let settingsLayout = load('indexa_settingsLayout', 'grid');
let settingsAnimations = load('indexa_settingsAnimations', true);
let settingsCovers = load('indexa_settingsCovers', true);
let settingsItemsPerPage = load('indexa_settingsItemsPerPage', 0);

let lightMode = load('biblioteca_lightMode', false);
function applyTheme() {
  if (settingsTheme === 'system') {
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    lightMode = prefersLight;
  } else {
    lightMode = settingsTheme === 'light';
  }
  document.body.classList.toggle('light-mode', lightMode);
}
applyTheme();

let profileGoals = load('indexa_profileGoals', []);
let profilePrefs = load('indexa_profilePrefs', {});
