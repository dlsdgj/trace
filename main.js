const { Plugin, WorkspaceLeaf, MarkdownRenderer, Notice, EditorSuggest } = require('obsidian');
const { Decoration, EditorView } = require('@codemirror/view');
const { StateField, StateEffect } = require('@codemirror/state');

const setMatchHighlights = StateEffect.define();

const matchHighlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(setMatchHighlights)) {
        decorations = e.value;
      }
    }
    return decorations;
  },
  provide: field => EditorView.decorations.from(field)
});

const setJumpHighlight = StateEffect.define();
const jumpHighlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const e of tr.effects) {
      if (e.is(setJumpHighlight)) {
        decorations = e.value;
      }
    }
    return decorations.map(tr.changes);
  },
  provide: field => EditorView.decorations.from(field)
});

class MatchHighlightPlugin {
  constructor(view) {
    this.view = view;
  }

  update() {}
}

const DEFAULT_SETTINGS = {
  top: 40,
  width: 2,
  maxWidth: 80,
  widthPx: 60,
  heightOffset: 65,
  opacity: 1.0,
  editorPadding: 10,
  sliderColor: '#F0B27F',
  highlightColor: '#ffc800',
  highlightCurrentColor: '#ff3232',
  contentOpacity: 1.0,
  collapseOnHover: false,
  collapseWidth: 8,
  matchBorderColor: '#ff6600',
  matchOpacity: 0.15,
  counterColor: '#aba6a6',
  counterBgColor: '#ff6600',
  counterSize: 9,
  counterTopOffset: -10,
  enableSelectionMatch: true,
  exhaustiveMode: true,
  matchListWidth: 280,
  matchListHeight: 400,
  floatingToggleX: 50,
  floatingToggleY: 100,
  floatingToggleSize: 20,
  floatingToggleVisible: true,
  floatingToggleOpacity: 0.6,
  hideStatusBar: false,
  rightOffset: 0,
  pinIconEnabled: true,
  pinIconMode: 'follow',
  pinIconSize: 12,
  pinIconOpacity: 0.7,
  pinIconFixedLeft: null,
  pinIconFixedTop: null,
  pinIconFollowOffsetX: 20,
  pinIconFollowOffsetY: -20,
  pinColorSchemes: [
    { borderColor: '#ff6600', counterBgColor: '#ff6600', counterColor: '#aba6a6', borderLinked: true, counterLinked: true },
    { borderColor: '#2196F3', counterBgColor: '#2196F3', counterColor: '#aba6a6', borderLinked: true, counterLinked: true },
    { borderColor: '#4CAF50', counterBgColor: '#4CAF50', counterColor: '#aba6a6', borderLinked: true, counterLinked: true },
    { borderColor: '#9C27B0', counterBgColor: '#9C27B0', counterColor: '#aba6a6', borderLinked: true, counterLinked: true },
    { borderColor: '#FF9800', counterBgColor: '#FF9800', counterColor: '#aba6a6', borderLinked: true, counterLinked: true },
    { borderColor: '#E91E63', counterBgColor: '#E91E63', counterColor: '#aba6a6', borderLinked: true, counterLinked: true }
  ],
  simplifiedColorScheme: true,
  clearCountOnClose: false,
  floatingToggleText: 'search',
  floatingToggleFontSize: 16,
  floatingTogglePaddingH: 10,
  floatingTogglePaddingV: 2,
  floatingToggleStyleClass: 'glass-chip',
  floatingToggleCustomStyle: '.glass-chip { background: rgba(255,255,255,0.34); backdrop-filter: blur(12px) saturate(1.7); -webkit-backdrop-filter: blur(12px) saturate(1.7); border: 1px solid rgba(255,255,255,0.75); border-radius: 12px; padding: 2px 10px; color: var(--text-normal); font-weight: 600; font-size: 0.9em; display: inline-block; box-shadow: var(--sm-chip-shadow, 0 5px 14px rgba(0,0,0,0.15)), inset 0 1px 0 rgba(255,255,255,0.9); }',
  keywordButtonStyles: {},
  minimapBlacklist: '*.canvas',
  searchWordCountMin: 0,
  searchWordCountMax: 0,
  language: 'zh',
  counterStylePreset: 'glass',
  multiKeywordRequireAll: true,
  searchOnInput: false,
  outlineOnHover: true,
  outlinePinnedMargin: true,
  chipShadowIntensity: 0.6,
  winShowDelay: 0,
  hoverWindow: true,
  winHideDelay: 160,
  zoneIndicator: true,
  zoneRatio: 0.5,
  searchZone: { top: 0.05, bottom: 0.40 },
  outlineZone: { top: 0.55, bottom: 0.95 },
  settingsTab: 'misc',
  olColors: { cp: '#FFB3D9', in: '#d6409f', kf: '#B3FFFF', mr: '#010101' },
  olEmoji: {},
  olHidden: { d: 1, B: 1, u: 1 },
  olFgColors: { mr: '#FCFCFC' },
  olAccOpen: {}
};

const I18N = {
  zh: {
    settingsTitle: 'Trace 设置',
    tabMisc: '杂项',
    tabOutline: '大纲',
    tabMatch: '匹配',
    tabMinimap: 'minimap',
    tabSearch: '搜索',
    usageTitle: '基本操作',
    usageZone: '· 悬停 minimap 上半区 → 搜索窗口；下半区 → 大纲窗口',
    usageChip: '· 点击窗口顶部 search 胶囊 → 弹出为独立悬浮按钮，再点收回',
    usagePin: '· 拖动窗口 → 固定并显示 × 按钮；点 × 取消固定并隐藏',
    usageToggle: '· 窗口顶部「划词搜索」胶囊 → 开关划词搜索功能',
    usageWheel: '· 悬浮按钮上滚轮：Ctrl 调字号，Alt 调透明度',
    usageRibbon: '· 左侧边栏放大镜图标 → 显示并固定搜索窗口',
    topDistance: '顶部距离 (px)',
    width: '宽度 (px)',
    bottomOffset: '底部偏移 (px)',
    rightOffset: '右边偏移 (px)',
    editorPadding: '编辑器间距 (px)',
    sliderColor: '滑块颜色',
    opacity: '透明度',
    contentOpacity: '内容透明度',
    hoverExpand: '悬停展开',
    hoverExpandHint: '开启后 minimap 平时折叠为细条，鼠标悬停时展开',
    expandedWidth: 'minimap展开时宽度 (px)',
    hoverWindow: '悬停到minimap打开大纲、搜索窗口',
    hoverWindowHint: '关闭后悬停 minimap 不再弹出搜索/大纲窗口',
    posSpacing: 'minimap位置与间距 (px)',
    winShowDelay: '窗口显示延时 (ms)',
    winShowDelayHint: '悬停 minimap 后延时弹出窗口，0 = 立即',
    winHideDelay: '窗口关闭延时 (ms)',
    winHideDelayHint: '触发窗口后鼠标离开，延时自动关闭窗口，0 = 立即',
    zoneIndicator: '分区指示',
    zoneIndicatorHint: '悬停 minimap 时显示上半搜索 / 下半大纲的触发区域',
    collapseWidth: '折叠宽度 (px)',
    floatingToggleText: '悬浮球显示文字',
    showFloating: '悬浮显示',
    toggleFloatingBtn: '显示/隐藏悬浮按钮',
    floatingToggleStyle: '悬浮按钮样式',
    minimap: 'minimap',
    minimapBlacklist: 'minimap 黑名单',
    minimapBlacklistDesc: '匹配路径的页面不显示 minimap（每行一个，支持 * 通配符）',
    fontSize: '文字大小 (px)',
    paddingH: '水平内边距 (px)',
    paddingV: '垂直内边距 (px)',
    hideStatusBar: '隐藏底部状态栏',
    searchLimit: '搜索方式',
    autoSearch: '自动搜索',
    autoSearchHint: '选中文字即后台搜索',
    manualSearch: '手动搜索',
    minWords: '最少字数 (0=不限)',
    maxWords: '最多字数 (0=不限)',
    pinIcon: '固定图标',
    enablePinIcon: '启用固定图标',
    iconMode: '图标模式',
    followMouse: '跟随鼠标',
    fixedPosition: '固定位置',
    followOffsetX: '水平偏移 (px)',
    followOffsetY: '垂直偏移 (px)',
    iconSize: '图标大小 (px)',
    iconOpacity: '图标透明度',
    iconText: '图标文字',
    colorSchemes: '配色方案 (按顺序使用)',
    simplifiedColor: '简化配色',
    addColor: '+ 添加配色',
    counterStyle: '计数样式',
    matchOpacity: '匹配透明度',
    counterOpacity: '计数透明度',
    counterBgOpacity: '计数背景透明度',
    counterFontSize: '计数字体大小',
    counterPaddingH: '计数水平内边距 (px)',
    counterPaddingV: '计数垂直内边距 (px)',
    counterTopOffset: '计数上偏移 (px)',
    counterStylePreset: '计数样式预设',
    counterPresetGlass: '毛玻璃',
    counterPresetOutlined: '描边气泡',
    multiKeywordRequireAll: '仅显示包含所有关键词的文档',
    searchOnInput: '输入即搜',
    enableSelectionMatch: '启用划词自动搜索',
    outlineOnHover: '悬停到 minimap 显示大纲窗口',
    outlineOnHoverDesc: '鼠标悬浮到 minimap 时显示文档大纲，高亮当前所在标题',
    outlinePinnedMargin: '固定时调整正文边距',
    chipShadowIntensity: 'Chip 阴影强度',
    chipShadowIntensityHint: '控制大纲与搜索窗口 Chip 的阴影强度，0=无阴影，1=最强',
    clearCountOnClose: '关闭文档清除计数',
    pinnedMatches: '已固定匹配项',
    clearAllCounts: '清除所有计数',
    rebuildCache: '重建标题缓存',
    resetDefault: '重置默认',
    about: '关于/更新',
    building: '正在构建...',
    border: '边框',
    underline: '下划线',
    counterBg: '计数背景',
    counterTextColor: '计数文字',
    bubbleBorder: '气泡边框',
    syncColors: '同步下划线与背景色',
    background: '背景',
    text: '文字',
    noPinned: '暂无固定匹配项',
    unknownFile: '未知文件',
    clearDocPinned: '清除该文档所有固定项',
    clear: '清除',
    remove: '删除',
    searchPlaceholder: '搜索... (竖线分隔多关键词: 鸽子|导航|磁场)',
    refreshSearch: '刷新搜索',
    refreshSearchHint: '重新搜索全库并刷新结果',
    unpin: '取消固定',
    clearPinned: (n) => `清除${n}个固定项`,
    pinMatch: '固定此匹配',
    recentSearch: '最近搜索',
    favoriteSearch: '收藏',
    addFavorite: '收藏',
    removeFavorite: '取消收藏',
    floatThisWord: '悬浮此词',
    removeFloat: '移除悬浮此词',
    exhaustiveMatch: (n, m) => `全库匹配: ${n} 个文档 (${m} 项结果)`,
    libraryMatch: (n, m) => `库中匹配: ${n} 个文档 (${m} 项结果)`,
    save: '保存',
    exportMarkdown: '导出匹配结果为 Markdown',
    copy: '复制',
    openDoc: '打开文档',
    exported: (f) => `已导出: ${f}`,
    exportFailed: (e) => `导出失败: ${e}`,
    sourceNotFound: (f) => `找不到源文档: ${f}`,
    editFloating: '编辑',
    hideFloating: '隐藏',
    closeKeyword: '关闭',
    settings: '设置',
    editTitle: '编辑悬浮按钮',
    toggleText: '显示文字',
    toggleFontSize: '字体大小',
    togglePaddingH: '水平内边距',
    togglePaddingV: '垂直内边距',
    toggleOpacity: '透明度',
    toggleSize: '按钮大小',
    styleClass: '样式类名',
    customStyle: '自定义样式',
    getMoreStyles: '(获取更多样式)',
    styleHint: '支持完整CSS格式，含伪元素。类名会自动作用域化。',
    preview: '预览',
    styleName: '样式名称',
    addStyle: '+ 添加样式',
    deleteStyle: '删除',
    setDefault: '默认',
    defaultStyle: '默认',
    noStyles: '暂无自定义样式，请使用 .className { } 格式定义',
    clickToSelect: '点击选择',
    confirm: '确认',
    cancel: '取消',
    close: '关闭',
    expandBefore: '展开前文',
    expandAfter: '展开后文',
    searchSettings: '搜索设置…',
    searchPinned: '搜索已固定的词…',
    accordion: '手风琴',
    accordionTip: '展开一项时自动折叠其余',
    restorePageDefault: '恢复本页默认值',
    restoredNotice: '已恢复预设值',
    autoSave: '更改自动保存',
    clearAllPinned: '清除全部…',
    iconOffset: '偏移（水平 / 垂直）',
    wordCount: '关键词字数',
    wordCountHint: '0 表示不限',
    searchOnInputHint: '关闭后需按回车搜索',
    colorSchemesHint: '按顺序循环使用',
    counterBubble: '计数气泡',
    styleLabel: '样式',
    optionsLabel: '选项',
    showFloatingToggle: '显示悬浮按钮',
    blacklistCount: (n) => `${n} 条`,
    noPinnedLong: '没有已固定的词。在文档中选中词语后固定即可添加',
    confirmClearAll: '再点一次确认',
    clearedAll: '已清除全部计数',
    restoredDefault: (page) => `已恢复「${page}」默认值`,
    clearedGroup: (name) => `已清除 ${name}`,
    removedWord: (w) => `已移除「${w}」`,
    pinCountCommand: '固定/取消固定当前选中计数',
    editFloatingBtn: '编辑悬浮按钮',
    fopPluginTip: '可将「固定计数」命令加入 file-ops-plus 菜单执行',
    fopPluginChip: 'file-ops-plus 菜单',
    fopOutlineTip: '可在 file-ops-plus 菜单中设置对应高亮方式选项',
    zoneRatio: '触发区间',
    zoneRatioHint: '搜索区与大纲区各自的上下边界(%)，区间外为缓冲带(只展开 minimap 不弹窗)；也可直接拖动 minimap 上的边界线',
    zoneSearch: '搜索区',
    zoneOutline: '大纲区',
    olViewTitle: '标', olViewGroup: '组', olViewDot: '点', olViewMatrix: '览',
    olTypeBold: '加粗', olTypeMark: 'HTML高亮', olTypeObsidian: 'Obsidian高亮',
    olColorY: '重要概念', olColorG: '解决方案', olColorB: '背景/关联', olColorR: '问题/风险', olColorP: '自己的思考', olColorO: '因果/机制', olColorCp: '核心观点', olColorIn: '洞见', olColorKf: '关键事实', olColorMr: '必须记住', olColorD: '默认', olColorBold: '加粗', olColorU: '未定义',
    olColorSettings: '高亮编码（颜色 / 含义）',
    olFmtWord: '文字', olAddCustom: '+ 添加条目', olDelCustom: '删除该条目',
    olModeNative: '原生', olLabelBg: '背景', olLabelFg: '文字色', olLabelName: '名称', olDelEntry: '删除', olEmojiHint: '留空 = 无 emoji 标记',
    olColorSettingsHint: '左=颜色预览，中=可编辑格式，右=含义；emoji 颜色仅影响大纲指示，HTML 色值即编辑器实际色',
    olShowMarks: '显示标注', olMinChars: '最少字数', olBranch: '单支展开', olAllExpand: '全部展开',
    olPin: '固定展开', olUnpin: '点击折叠', olFold: '已折叠，点击展开',
    olEmpty: '无标题', olNoMarks: '没有符合条件的标注', olRename: '双击重命名',
    olBranchTip: '单支展开：只展开当前章节', olAllExpandTip: '全部展开',
    olPinTip: '已固定展开，点击折叠', olUnpinTip: '已折叠，点击固定展开',
    olExpandAll: '全部展开/折叠', olExitIcon: '退出折叠', olFoldChipTip: '点击折叠/固定展开'
  },
  en: {
    settingsTitle: 'Trace Settings',
    tabMisc: 'Misc',
    tabOutline: 'Outline',
    tabMatch: 'Match',
    tabMinimap: 'Minimap',
    tabSearch: 'Search',
    usageTitle: 'Basics',
    usageZone: '· Hover minimap upper half → search window; lower half → outline window',
    usageChip: '· Click the search chip in window dock → pop out as floating button, click again to dock back',
    usagePin: '· Drag a window → pin it and show × ; click × to unpin and hide',
    usageToggle: '· "Selection match" chip in window dock → toggle selection search',
    usageWheel: '· Wheel on floating button: Ctrl = font size, Alt = opacity',
    usageRibbon: '· Magnifier icon in left ribbon → show and pin search window',
    topDistance: 'Top Distance (px)',
    width: 'Width (px)',
    bottomOffset: 'Bottom Offset (px)',
    rightOffset: 'Right Offset (px)',
    editorPadding: 'Editor Padding (px)',
    sliderColor: 'Slider Color',
    opacity: 'Opacity',
    contentOpacity: 'Content Opacity',
    hoverExpand: 'Hover Expand',
    hoverExpandHint: 'When enabled, minimap stays collapsed as a thin bar and expands on hover',
    expandedWidth: 'Expanded Width (px)',
    hoverWindow: 'Hover minimap to open outline/search windows',
    hoverWindowHint: 'When off, hovering the minimap does not open search/outline windows',
    posSpacing: 'Minimap Position & Spacing (px)',
    winShowDelay: 'Window show delay (ms)',
    winShowDelayHint: 'Delay before window pops up on minimap hover, 0 = instant',
    winHideDelay: 'Window hide delay (ms)',
    winHideDelayHint: 'Auto-close delay after mouse leaves the triggered window, 0 = instant',
    zoneIndicator: 'Zone indicator',
    zoneIndicatorHint: 'Show upper (search) / lower (outline) trigger zones on hover',
    collapseWidth: 'Collapse Width (px)',
    floatingToggleText: 'Floating Toggle Text',
    showFloating: 'Show Floating',
    toggleFloatingBtn: 'Show/Hide Floating Button',
    floatingToggleStyle: 'Floating Button Style',
    minimap: 'minimap',
    minimapBlacklist: 'Minimap Blacklist',
    minimapBlacklistDesc: 'Pages matching these paths will not show minimap (one per line, * wildcard supported)',
    fontSize: 'Font Size (px)',
    paddingH: 'Horizontal Padding (px)',
    paddingV: 'Vertical Padding (px)',
    hideStatusBar: 'Hide Status Bar',
    searchLimit: 'Search Mode',
    autoSearch: 'Auto search',
    autoSearchHint: 'Selecting text triggers background search',
    manualSearch: 'Manual search',
    minWords: 'Min Words (0=no limit; CJK counts by char)',
    maxWords: 'Max Words (0=no limit; CJK counts by char)',
    pinIcon: 'Pin Icon',
    enablePinIcon: 'Enable Pin Icon',
    iconMode: 'Icon Mode',
    followMouse: 'Follow Mouse',
    fixedPosition: 'Fixed Position',
    followOffsetX: 'Horizontal Offset (px)',
    followOffsetY: 'Vertical Offset (px)',
    iconSize: 'Icon Size (px)',
    iconOpacity: 'Icon Opacity',
    iconText: 'Icon Text',
    colorSchemes: 'Color Schemes (used in order)',
    simplifiedColor: 'Simplified Colors',
    addColor: '+ Add Color',
    counterStyle: 'Counter Style',
    matchOpacity: 'Match Opacity',
    counterOpacity: 'Counter Opacity',
    counterBgOpacity: 'Counter BG Opacity',
    counterFontSize: 'Counter Font Size',
    counterPaddingH: 'Counter H Padding (px)',
    counterPaddingV: 'Counter V Padding (px)',
    counterTopOffset: 'Counter Top Offset (px)',
    counterStylePreset: 'Counter Style Preset',
    counterPresetGlass: 'Glassmorphism',
    counterPresetOutlined: 'Outlined Bubble',
    multiKeywordRequireAll: 'Only show docs with all keywords',
    searchOnInput: 'Search on input',
    enableSelectionMatch: 'Enable selection auto-search',
    outlineOnHover: 'Show outline window when hovering minimap',
    outlineOnHoverDesc: 'Show document outline when hovering over minimap, highlight current heading',
    outlinePinnedMargin: 'Adjust content margin when pinned',
    chipShadowIntensity: 'Chip Shadow Intensity',
    chipShadowIntensityHint: 'Controls shadow intensity of outline & search window chips, 0=none, 1=max',
    clearCountOnClose: 'Clear Count on Close',
    pinnedMatches: 'Pinned Matches',
    clearAllCounts: 'Clear All Counts',
    rebuildCache: 'Rebuild Heading Cache',
    resetDefault: 'Reset Defaults',
    about: 'About/Updates',
    building: 'Building...',
    border: 'Border',
    underline: 'Underline',
    counterBg: 'Counter BG',
    counterTextColor: 'Counter Text',
    bubbleBorder: 'Bubble Border',
    syncColors: 'Sync underline & counter BG',
    background: 'Background',
    text: 'Text',
    noPinned: 'No pinned matches',
    unknownFile: 'Unknown file',
    clearDocPinned: 'Clear all pinned items for this doc',
    clear: 'Clear',
    remove: 'Remove',
    searchPlaceholder: 'Search... (pipe-separated: bird|navigation|magnet)',
    refreshSearch: 'Refresh search',
    refreshSearchHint: 'Re-search the vault and refresh results',
    unpin: 'Unpin',
    clearPinned: (n) => `Clear ${n} pinned items`,
    pinMatch: 'Pin this match',
    recentSearch: 'Recent Searches',
    favoriteSearch: 'Favorites',
    addFavorite: 'Favorite',
    removeFavorite: 'Unfavorite',
    floatThisWord: 'Float this word',
    removeFloat: 'Remove floating',
    exhaustiveMatch: (n, m) => `Exhaustive: ${n} docs (${m} results)`,
    libraryMatch: (n, m) => `Library: ${n} docs (${m} results)`,
    save: 'Save',
    exportMarkdown: 'Export results as Markdown',
    copy: 'Copy',
    openDoc: 'Open Document',
    exported: (f) => `Exported: ${f}`,
    exportFailed: (e) => `Export failed: ${e}`,
    sourceNotFound: (f) => `Source not found: ${f}`,
    editFloating: 'Edit',
    hideFloating: 'Hide',
    closeKeyword: 'Close',
    settings: 'Settings',
    editTitle: 'Edit Floating Toggle',
    toggleText: 'Display Text',
    toggleFontSize: 'Font Size',
    togglePaddingH: 'Horizontal Padding',
    togglePaddingV: 'Vertical Padding',
    toggleOpacity: 'Opacity',
    toggleSize: 'Button Size',
    styleClass: 'Style Class',
    customStyle: 'Custom Style',
    getMoreStyles: '(Get More Styles)',
    styleHint: 'Supports full CSS format including pseudo-elements. Class names are auto-scoped.',
    preview: 'Preview',
    styleName: 'Style Name',
    addStyle: '+ Add Style',
    deleteStyle: 'Delete',
    setDefault: 'Default',
    defaultStyle: 'Default',
    noStyles: 'No custom styles detected, use .className { } format',
    clickToSelect: 'Click to select',
    confirm: 'Confirm',
    cancel: 'Cancel',
    close: 'Close',
    expandBefore: 'Expand before',
    expandAfter: 'Expand after',
    searchSettings: 'Search settings…',
    searchPinned: 'Search pinned…',
    accordion: 'Accordion',
    accordionTip: 'Auto-collapse others on expand',
    restorePageDefault: 'Restore page defaults',
    restoredNotice: 'Preset values restored',
    autoSave: 'Auto-saved',
    clearAllPinned: 'Clear all…',
    iconOffset: 'Offset (X / Y)',
    wordCount: 'Word count',
    wordCountHint: '0 = no limit',
    searchOnInputHint: 'Off = press Enter',
    colorSchemesHint: 'Cycled in order',
    counterBubble: 'Counter Bubble',
    styleLabel: 'Style',
    optionsLabel: 'Options',
    showFloatingToggle: 'Show floating toggle',
    blacklistCount: (n) => `${n} items`,
    noPinnedLong: 'No pinned words. Select text in a doc and pin to add.',
    confirmClearAll: 'Click again to confirm',
    clearedAll: 'Cleared all counts',
    restoredDefault: (page) => `Restored ${page} defaults`,
    clearedGroup: (name) => `Cleared ${name}`,
    removedWord: (w) => `Removed "${w}"`,
    pinCountCommand: 'Pin/Unpin current selection count',
    editFloatingBtn: 'Edit Floating Toggle',
    fopPluginTip: 'Add "Pin Count" command to file-ops-plus menu',
    fopPluginChip: 'file-ops-plus menu',
    fopOutlineTip: 'Set highlight-style menu options in file-ops-plus',
    zoneRatio: 'Trigger zones',
    zoneRatioHint: 'Upper/lower bounds (%) for search & outline zones; outside = buffer (expand minimap only). Drag handles on minimap to adjust.',
    zoneSearch: 'Search',
    zoneOutline: 'Outline',
    olViewTitle: 'Title', olViewGroup: 'Group', olViewDot: 'Dot', olViewMatrix: 'Matrix',
    olTypeBold: 'Bold', olTypeMark: 'HTML Mark', olTypeObsidian: 'Obsidian Highlight',
    olColorY: 'Key Concept', olColorG: 'Solution', olColorB: 'Context', olColorR: 'Risk/Issue', olColorP: 'My Thinking', olColorO: 'Cause/Mechanism', olColorCp: 'Core Viewpoint', olColorIn: 'Insight', olColorKf: 'Key Fact', olColorMr: 'Must Remember', olColorD: 'Default', olColorBold: 'Bold', olColorU: 'Undefined',
    olColorSettings: 'Highlight Codes (Color / Meaning)',
    olFmtWord: 'text', olAddCustom: '+ Add entry', olDelCustom: 'Remove this entry',
    olModeNative: 'Native', olLabelBg: 'BG', olLabelFg: 'FG', olLabelName: 'Name', olDelEntry: 'Delete', olEmojiHint: 'Empty = no emoji mark',
    olColorSettingsHint: 'Left = preview, middle = editable format, right = meaning; emoji color only affects outline indicator, HTML hex = actual editor color',
    olShowMarks: 'Show marks', olMinChars: 'Min chars', olBranch: 'Single branch', olAllExpand: 'Expand all',
    olPin: 'Pinned open', olUnpin: 'Click to fold', olFold: 'Folded, click to pin',
    olEmpty: 'No headings', olNoMarks: 'No matching marks', olRename: 'Double-click to rename',
    olBranchTip: 'Single branch: only expand current section', olAllExpandTip: 'Expand all',
    olPinTip: 'Pinned open, click to fold', olUnpinTip: 'Folded, click to pin open',
    olExpandAll: 'Expand/collapse all', olExitIcon: 'Exit icon mode', olFoldChipTip: 'Click to fold/pin expand'
  }
};

function t(key, ...args) {
  const lang = (typeof window !== 'undefined' && window._swiftMatchLang) || 'zh';
  const val = I18N[lang]?.[key] ?? I18N.zh[key];
  if (typeof val === 'function') return val(...args);
  return val;
}

// 自定义 ribbon 图标：放大镜 + 镜内三个匹配点（单色，跟随 ribbon 主题色）
const SM_RIBBON_SVG = `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="7" cy="7" r="4.6"></circle><line x1="10.4" y1="10.4" x2="14" y2="14"></line><g fill="currentColor" stroke="none"><circle cx="5.4" cy="7" r="0.85"></circle><circle cx="7" cy="7" r="0.85"></circle><circle cx="8.6" cy="7" r="0.85"></circle></g></svg>`;

/**
 * FloatingPeer —— 大纲窗口 / 搜索窗口共享的"悬浮对等体"交互控制器。
 *
 * 统一收口：
 *  - 状态机：idle（悬停自动折叠） / pinned（固定） / detached（独立按钮）
 *  - 单一计时源：show() 清计时器，scheduleHide() 统一延时 + hover 区域终检
 *  - 窗口拖拽 / 缩放手柄：pointer 事件；拖窗口产生 pin（detached 模式除外）
 *  - chip：附着在窗口 dock 内；点击弹出为独立按钮或收回；独立按钮可拖拽并与窗口双向同步
 *  - 几何边界：窗口横向完整位于视口内；纵向允许超出（至少留 40px 可见）；chip 始终在视口内
 *  - 独立 × 关闭按钮（body 级，固定窗口时显示）
 *  - 持久化：localStorage `swiftmatch-peer-<id>` = { mode, win:{x,y,w,h,p}, chip:{x,y}, dx }
 *
 * opts:
 *  id, winEl, getDock(), chipEl
 *  defaultW, defaultH, minW, minH
 *  allowTopOverflow  窗口上缘是否允许超出视口（大纲 true / 搜索 false）
 *  rzSelector        缩放手柄选择器
 *  isInteractive(t)  返回 true 时该 pointerdown 不触发窗口拖拽
 *  onShow(anchorEl)  窗口需要渲染/刷新内容
 *  onHide()          窗口需要隐藏
 *  onPin/onUnpin     pin 状态变化回调（如正文 margin）
 *  onResize(w,h)     尺寸变化（特性同步内部尺寸变量）
 *  onMoved()         拖拽结束（特性持久化位置）
 *  onGeoApplied(g)   每次几何应用后（大纲 compact/视图切换等）
 *  keepEls()         窗口/chip/锚点之外的 hover 保持区域
 */
class FloatingPeer {
  constructor(plugin, opts) {
    this.plugin = plugin;
    this.opts = opts;
    this.id = opts.id;
    this.winEl = opts.winEl;
    this.chipEl = opts.chipEl;
    this.minW = opts.minW ?? 190;
    this.minH = opts.minH ?? 80;
    this.mode = 'idle';
    this.peeking = false;
    this._timer = null;
    this._anchors = [];
    this._closeBtn = null;
    this._win = { x: 0, y: 0, w: opts.defaultW ?? 270, h: opts.defaultH ?? 440, p: false };
    this._chip = { x: 0, y: 0 };
    this.chipDx = 0;
    this.chipGapY = opts.chipGapY ?? 30;

    this._load();
    this.bindWindow();
    this.bindChip();
    if (this.mode === 'detached') {
      this.chipEl.classList.remove('att');
      this.chipEl.classList.add('det');
      document.body.appendChild(this.chipEl);
      this.placeChip();
    }
    if (this.mode === 'pinned') {
      this.winEl.classList.add('pinned', 'show');
      this.peeking = true;
      this.ensureCloseBtn();
      this.updateCloseBtn();
      this.applyGeo();
      this.opts.onPin?.();
    }
  }

  // ---------- 锚点 ----------
  addAnchor(el) {
    const enter = () => this.show(el);
    const leave = () => this.scheduleHide();
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    this._anchors.push({ el, enter, leave });
  }

  // ---------- 显隐（唯一入口） ----------
  show(anchorEl, kind) {
    clearTimeout(this._timer);
    this._timer = null;
    if (!this._win.p) {
      this.defaultFromAnchor(anchorEl, kind);
      this._win.p = true;
    }
    this.peeking = true;
    this.opts.onShow?.(anchorEl);
    this.chipToDock();
    this.winEl.classList.add('show');
    this.applyGeo();
  }

  scheduleHide(ms) {
    if (this.mode === 'pinned') return;
    const d = ms ?? Math.max(0, this.plugin?.settings?.winHideDelay ?? 160);
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      if (this.mode === 'pinned') return;
      if (this.isAnyHovered()) { this.scheduleHide(160); return; }
      this.hideNow();
    }, d);
  }

  hideNow() {
    this.peeking = false;
    this.winEl.classList.remove('show');
    // 窗口隐藏时 × 必须一并隐藏，避免孤儿按钮（pinned 重显由 applyGeo/updateCloseBtn 恢复）
    if (this._closeBtn) this._closeBtn.style.display = 'none';
    this.opts.onHide?.();
  }

  isAnyHovered() {
    if (this.winEl.matches(':hover')) return true;
    if (this.mode === 'detached' && this.chipEl.matches(':hover')) return true;
    for (const a of this._anchors) { if (a.el.matches(':hover')) return true; }
    const keep = this.opts.keepEls?.() || [];
    for (const el of keep) { if (el && el.matches(':hover')) return true; }
    return false;
  }

  // ---------- pin ----------
  pin() {
    if (this.mode === 'detached') return;
    this.mode = 'pinned';
    this.winEl.classList.add('pinned');
    this.ensureCloseBtn();
    this.updateCloseBtn();
    this.opts.onPin?.();
    this.save();
  }

  unpin() {
    this.mode = 'idle';
    this.winEl.classList.remove('pinned');
    if (this._closeBtn) this._closeBtn.style.display = 'none';
    this.opts.onUnpin?.();
    this.save();
  }

  // ribbon 点击：可见→隐藏；不可见→显示并固定
  togglePin(anchorEl) {
    if (this.peeking) {
      if (this.mode === 'pinned') { this.hideNow(); this.unpin(); }
      else this.pin();
      return;
    }
    this.show(anchorEl, 'ribbon');
    this.pin();
  }

  // ---------- chip 附着 / 独立 ----------
  toggleChip() {
    if (this.mode === 'detached') this.attachChip();
    else this.detachChip();
  }

  // chip 收回到窗口 dock，窗口显示并固定（右上角出现关闭按钮）
  attachChip() {
    this.mode = 'idle';
    this.chipEl.classList.remove('det');
    this.chipEl.classList.add('att');
    this.chipEl.style.left = '';
    this.chipEl.style.top = '';
    this.chipToDock();
    this.save();
    this.show(null, 'dock');
    this.pin();
  }

  // chip 弹出为独立按钮；窗口解除固定并隐藏
  detachChip() {
    const r = this.winEl.getBoundingClientRect();
    this._win.x = r.left;
    this._win.y = r.top;
    const W = window.innerWidth;
    const cw = this.chipEl.offsetWidth || 46;
    this.chipDx = 0;
    this._win.p = true;
    this._chip.x = Math.max(0, Math.min(r.left, W - cw));
    this._chip.y = Math.max(0, r.top - this.chipGapY);
    this.mode = 'detached';
    this.chipEl.classList.remove('att');
    this.chipEl.classList.add('det');
    document.body.appendChild(this.chipEl);
    this.placeChip();
    // 解除固定的视觉状态（mode 保持 detached）
    this.winEl.classList.remove('pinned');
    if (this._closeBtn) this._closeBtn.style.display = 'none';
    this.opts.onUnpin?.();
    this.hideNow();
    this.save();
  }

  // attached 模式下把 chip 放入当前 dock（窗口重建/渲染后调用）
  chipToDock() {
    if (this.mode === 'detached') return;
    const dock = this.opts.getDock?.();
    if (dock && this.chipEl.parentElement !== dock) {
      dock.insertBefore(this.chipEl, dock.firstChild);
    }
  }

  placeChip() {
    const g = this._chip;
    const cw = this.chipEl.offsetWidth || 46;
    const ch = this.chipEl.offsetHeight || 24;
    g.x = Math.max(0, Math.min(g.x, window.innerWidth - cw));
    g.y = Math.max(0, Math.min(g.y, window.innerHeight - 70));
    this.chipEl.style.left = `${g.x}px`;
    this.chipEl.style.top = `${g.y}px`;
  }

  // detached：窗口移动后 chip 贴住窗口上方（横向保持 chipDx、纵向间距 chipGapY）
  syncChipFromWin() {
    const g = this._win;
    const cw = this.chipEl.offsetWidth || 46;
    let cx = g.x + this.chipDx;
    cx = Math.max(0, Math.min(cx, window.innerWidth - cw));
    let cy = g.y - this.chipGapY;
    cy = Math.max(0, Math.min(cy, window.innerHeight - 70));
    this._chip.x = cx;
    this._chip.y = cy;
    this.chipEl.style.left = `${cx}px`;
    this.chipEl.style.top = `${cy}px`;
    this.chipDx = cx - g.x;
  }

  // ---------- 窗口交互（拖拽 / 缩放） ----------
  bindWindow() {
    this._winPD = e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const rzSel = this.opts.rzSelector ?? '.minimap-outline-rz,.minimap-match-list-rz';
      const rz = e.target.closest(rzSel);
      if (rz) {
        e.preventDefault();
        e.stopPropagation();
        this.trackResize(e, rz);
        return;
      }
      if (this.opts.isInteractive?.(e.target)) return;
      e.preventDefault();
      this.trackWindowMove(e);
    };
    this.winEl.addEventListener('pointerdown', this._winPD);
    this._winLeave = () => this.scheduleHide();
    this.winEl.addEventListener('pointerleave', this._winLeave);
  }

  trackWindowMove(e) {
    const sx = e.clientX, sy = e.clientY;
    const s = { ...this._win };
    let moved = false, raf = 0;
    this.winEl.classList.add('drag');
    const mv = ev => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      moved = true;
      this._win.x = s.x + dx;
      this._win.y = s.y + dy;
      // rAF 合并高频 pointermove，避免每事件强制重排
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; this.applyGeo(); });
    };
    const up = () => {
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      if (raf) { cancelAnimationFrame(raf); this.applyGeo(); }
      this.winEl.classList.remove('drag');
      if (!moved) return;
      this.markJustMoved();
      this.save();
      this.opts.onMoved?.();
      if (this.mode !== 'detached') this.pin();
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  }

  trackResize(e, rz) {
    const d = rz.dataset.d;
    const sx = e.clientX, sy = e.clientY;
    const s = { ...this._win };
    const W = window.innerWidth, H = window.innerHeight;
    let moved = false, w = s.w, h = s.h, x = s.x, raf = 0;
    const mv = ev => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      moved = true;
      if (d.includes('r')) w = Math.max(this.minW, Math.min(s.w + dx, W - s.x));
      if (d.includes('l')) {
        w = Math.max(this.minW, Math.min(s.w - dx, s.x + s.w));
        x = s.x + s.w - w;
      }
      if (d.includes('b')) h = Math.max(this.minH, Math.min(s.h + dy, H + 400 - s.y));
      this._win.w = w; this._win.h = h; this._win.x = x;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; this.applyGeo(); });
    };
    const up = () => {
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      if (raf) { cancelAnimationFrame(raf); this.applyGeo(); }
      if (!moved) return;
      this.markJustMoved();
      this.opts.onResize?.(w, h);
      this.save();
      if (this.mode !== 'detached') this.pin();
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  }

  // ---------- chip 交互 ----------
  bindChip() {
    this._chipPD = e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const detached = this.mode === 'detached';
      const sx = e.clientX, sy = e.clientY;
      const sChip = { ...this._chip };
      let moved = false, raf = 0;
      let tx = sChip.x, ty = sChip.y;
      const apply = () => {
        raf = 0;
        this._chip.x = tx;
        this._chip.y = ty;
        this.chipEl.style.left = `${tx}px`;
        this.chipEl.style.top = `${ty}px`;
        this._win.x = tx - this.chipDx;
        this._win.y = ty + this.chipGapY;
        this.applyGeo();
        this.chipDx = tx - this._win.x;
      };
      const mv = ev => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < 4) return;
        if (!moved) { this.chipEl.classList.add('drag'); this.winEl.classList.add('drag'); }
        moved = true;
        if (!detached) return;
        const cw = this.chipEl.offsetWidth || 46;
        tx = Math.max(0, Math.min(sChip.x + dx, window.innerWidth - cw));
        ty = Math.max(0, Math.min(sChip.y + dy, window.innerHeight - 70));
        if (!raf) raf = requestAnimationFrame(apply);
      };
      const up = () => {
        window.removeEventListener('pointermove', mv);
        window.removeEventListener('pointerup', up);
        this.chipEl.classList.remove('drag'); this.winEl.classList.remove('drag');
        if (raf) { cancelAnimationFrame(raf); apply(); }
        if (moved) { this.save(); this.opts.onMoved?.(); }
        else this.toggleChip();
      };
      window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
    };
    this.chipEl.addEventListener('pointerdown', this._chipPD);
    // 独立按钮：hover 打开窗口，离开延时折叠
    this._chipEnter = () => { if (this.mode === 'detached') this.show(); };
    this._chipLeave = () => { if (this.mode === 'detached') this.scheduleHide(220); };
    this.chipEl.addEventListener('pointerenter', this._chipEnter);
    this.chipEl.addEventListener('pointerleave', this._chipLeave);
  }

  markJustMoved() {
    this.justMoved = true;
    setTimeout(() => { this.justMoved = false; }, 60);
  }

  // ---------- 几何 ----------
  defaultFromAnchor(anchorEl, kind) {
    const g = this._win;
    const W = window.innerWidth, H = window.innerHeight;

    if (kind === 'ribbon' && anchorEl) {
      const r = anchorEl.getBoundingClientRect();
      g.x = Math.max(0, Math.min(r.right + 8, W - g.w));
      g.y = Math.max(0, Math.min(r.top, H - 40 - g.h > 0 ? r.top : H - g.h - 8));
      return;
    }
    // 默认锚点为 minimap：优先其左侧，空间不足放右侧
    const mmRect = (anchorEl || this.plugin.minimapContainer)?.getBoundingClientRect?.();
    if (mmRect) {
      g.x = Math.max(0, mmRect.left - g.w - 8);
      if (mmRect.left - g.w - 8 < 8) g.x = mmRect.right + 8;
      g.y = mmRect.top;
    }
  }

  applyGeo() {
    const W = window.innerWidth, H = window.innerHeight;
    const g = this._win;
    g.w = Math.max(this.minW, Math.min(g.w, W));
    g.h = Math.max(this.minH, Math.min(g.h, H + 400));
    g.x = Math.max(0, Math.min(g.x, W - g.w));
    const yMin = this.opts.allowTopOverflow ? -g.h + 40 : 0;
    g.y = Math.max(yMin, Math.min(g.y, H - 40));

    this.winEl.style.left = `${g.x}px`;
    this.winEl.style.top = `${g.y}px`;
    this.winEl.style.width = `${g.w}px`;
    this.winEl.style.height = `${g.h}px`;

    if (this.mode === 'detached') this.syncChipFromWin();
    if (this._closeBtn) this.updateCloseBtn();
    this.opts.onGeoApplied?.(g);
  }

  // ---------- × 关闭按钮 ----------
  ensureCloseBtn() {
    if (this._closeBtn) return;
    const btn = document.createElement('div');
    btn.className = 'minimap-outline-close';
    btn.textContent = '×';
    btn.title = t('olUnpin');
    btn.style.display = 'none';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      this.hideNow();
      this.unpin();
    });
    btn.addEventListener('pointerdown', e => e.stopPropagation());
    document.body.appendChild(btn);
    this._closeBtn = btn;
  }

  updateCloseBtn() {
    const btn = this._closeBtn;
    if (!btn) return;
    btn.style.display = this.mode === 'pinned' ? 'block' : 'none';
    const g = this._win;
    btn.style.left = `${g.x + g.w - 10}px`;
    btn.style.top = `${g.y - 10}px`;
  }

  // ---------- 持久化 ----------
  save() {
    try {
      localStorage.setItem(`swiftmatch-peer-${this.id}`, JSON.stringify({
        mode: this.mode, win: this._win, chip: this._chip, dx: this.chipDx
      }));
    } catch (e) {}
  }

  _load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(`swiftmatch-peer-${this.id}`) || 'null'); } catch (e) {}
    if (!s) {
      // 特性级旧数据迁移（仅几何，模式归一为 idle）
      const legacy = this.opts.migrate?.();
      if (legacy) {
        if (legacy.win) Object.assign(this._win, legacy.win);
        this._win.p = !!legacy.positioned;
      }
      return;
    }
    this.mode = s.mode === 'pinned' || s.mode === 'detached' ? s.mode : 'idle';
    if (s.win) this._win = Object.assign(this._win, s.win);
    if (s.chip) Object.assign(this._chip, s.chip);
    this.chipDx = s.dx || 0;
  }

  destroy() {
    clearTimeout(this._timer);
    this.winEl.removeEventListener('pointerdown', this._winPD);
    this.winEl.removeEventListener('pointerleave', this._winLeave);
    this.chipEl.removeEventListener('pointerdown', this._chipPD);
    this.chipEl.removeEventListener('pointerenter', this._chipEnter);
    this.chipEl.removeEventListener('pointerleave', this._chipLeave);
    for (const a of this._anchors) {
      a.el.removeEventListener('pointerenter', a.enter);
      a.el.removeEventListener('pointerleave', a.leave);
    }
    this._anchors = [];
    if (this._closeBtn) { this._closeBtn.remove(); this._closeBtn = null; }
  }
}

// 输入 == 时弹出高亮颜色 emoji 选项（基于 Obsidian EditorSuggest）
class OlEmojiSuggest extends EditorSuggest {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  onTrigger(cursor, editor) {
    const before = editor.getLine(cursor.line).substring(0, cursor.ch);
    if (!before.endsWith('==')) return null;
    // 奇数个 == 才是开始高亮（偶数 = 正在输入闭合 ==，不弹）
    if ((before.match(/==/g) || []).length % 2 === 0) return null;
    return { start: cursor, end: cursor, query: '' };
  }

  getSuggestions() {
    const M = this.plugin._olEmojiMap();
    return Object.keys(M).map(k => ({ k, em: M[k], name: this.plugin._olNm(k) }));
  }

  renderSuggestion(item, el) {
    el.createSpan({ text: `${item.em}  ${item.name}` });
  }

  selectSuggestion(item) {
    const { editor, start, end } = this.context;
    editor.replaceRange(item.em, start, end);
  }
}

class MinimapPlugin extends Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    this.manifest = manifest;
    this.minimapContainer = null;
    this.minimapContent = null;
    this.scrollbar = null;
    this.isDraggingScrollbar = false;
    this.scrollbarDragStartY = 0;
    this.scrollbarDragStartScrollTop = 0;
    this.slider = null;
    this.isDragging = false;
    this.isJumping = false;
    this.dragStartY = 0;
    this.dragStartLine = 0;
    this.highlights = [];
    this.editorHighlights = [];
    this.decorationField = null;
    this.currentSelection = '';
    this.currentCursor = null;
    this.updateTimer = null;
    this.boundMouseMove = null;
    this.boundMouseUp = null;
    this.scrollHandler = null;
    this.editorScrollEl = null;
    this.opacity = 0.3;
    this.boundWheel = null;
    this.editorContentEl = null;
    this.originalPaddingRight = '';
    this.settings = Object.assign({}, DEFAULT_SETTINGS);
    this.settingsPanel = null;
    this.boundContextMenu = null;
    this.tooltip = null;
    this.matchList = null;
    this.previewPanel = null;
    this.isPreviewOpen = false;
    this.originalListPosition = 'right';
    this.isInteractingWithList = false;
    this.currentPreviewFile = null;
    this.currentPreviewHeading = null;
    this._previewOutsideClickHandler = null;
    this._listCloseHandler = null;
    this._pendingListClose = false;
    this.previewSourceLeaf = null;
    this._searchGeneration = 0;
    this._searchInProgress = false; this.floatingToggle?.classList.remove('busy');

    this._isListVisible = false;
    this._listUserDismissed = false;
    this._keepListVisible = false;
    this._chipSwitching = false;
    this._listPinnedSearchText = null;
    this._pinnedWordFileMap = null;
    this._pinnedWordMatchCount = 0;
    this._pendingShowList = null;
    this._triggeredByIndicator = false;
    this._cachedMatchList = null;
    this._cachedMatchListKey = null;
    this.listPosition = { left: null, top: null };
    this.listFixedPosition = { left: null, top: null };
    this.previewListPosition = { left: null, top: null };
    this.floatingStyles = [];
    this.floatingDefaultStyleId = null;
    this.listOpacity = 1.0;
    this.previewOpacity = 1.0;
    this.previewSize = { width: 600, height: 600 };
    this.matchListSize = { width: null, height: null };
    this.isDraggingList = false;
    this.listDragStartX = 0;
    this.listDragStartY = 0;
    this.listDragStartLeft = 0;
    this.listDragStartTop = 0;
    this.boundListWheel = null;
    this.listDataPath = null;
    this.savedMatchLists = [];
    this.matchListIndicator = null;
    this.currentMatchListData = null;

    this.matchListIndicators = [];
    this._currentIndicatorSelection = null;
    this._currentIndicatorMatchCount = null;
    this.lastIndicatorCoords = null;
    this.floatingToggle = null;
    this._isApplyingReadingHighlights = false;
    this._readingViewObserver = null;
    this._readingHighlightRetryTimer = null;
    this._pinIcon = null;
    this._lastMouseX = 0;
    this._lastMouseY = 0;
    this._recentSearches = [];
    this._recentSearchCaches = {};
    this._expandedGroups = {};
    this._recentSearchCachesData = []; // deprecated, kept for migration
    this._favoriteSearches = [];
    this._listScrollPositions = {}; // { term: scrollTop }
    this._lastListSearchTerm = null; // search term used when list was last visible
    this._lastListFileMap = null; // fileMap when list was last visible
    this._lastListMatchCount = 0; // matchCount when list was last visible
    this._floatingKeywordButtons = []; // [{ wrapper, term, fileMap, matchCount, position }]
    this._floatingKeywordsData = []; // deprecated, kept for migration
    this._listTriggerElement = null; // element that triggered the list display (keyword btn or floating toggle)
  }

  onload() {
    // 清扫上一实例（尤其是重构前旧代码）残留在 body 上的孤儿元素：
    // 旧版 matchList / × 按钮 / 悬浮 chip 挂在 body，旧 onunload 未移除，重载后无人引用、无法关闭
    document.querySelectorAll(
      '.minimap-match-list, .minimap-match-list-close, .minimap-outline-close, .minimap-outline-panel, .minimap-outline-fold-chip, .minimap-floating-toggle, .minimap-preview-panel, .minimap-tooltip'
    ).forEach(el => el.remove());

    this.loadSettings();
    this.loadListData();
    this.loadFloatingStyleData();
    this.opacity = this.settings.opacity;
    this.addCommands();
    this.registerEditorSuggest(new OlEmojiSuggest(this)); // == 触发 emoji 颜色选项

    // 左侧 ribbon：点击切换搜索窗口 pin；自定义放大镜 SVG
    const ribbonIcon = this.addRibbonIcon('search', 'Search-Trace', () => {
      if (!this._searchPeer) this.createFloatingToggle();
      this._searchPeer?.togglePin(ribbonIcon);
    });
    ribbonIcon.innerHTML = SM_RIBBON_SVG;
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundWheel = this.handleWheel.bind(this);
    this.boundContextMenu = this.showSettingsPanel.bind(this);
    this.boundListWheel = this.handleListWheel.bind(this);
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    
    // Watch for theme changes to refresh counter colors
    this._lastThemeDark = document.body.classList.contains('theme-dark');
    this._themeObserver = new MutationObserver(() => {
      const isDark = document.body.classList.contains('theme-dark');
      if (isDark !== this._lastThemeDark) {
        this._lastThemeDark = isDark;
        const preset = this.settings.counterStylePreset || 'glass';
        if (preset === 'glass') {
          this.clearHighlights();
          this.showPinnedDecorations();
          if (this.currentSelection) this.highlightMatches();
        }
      }
    });
    this._themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    this.registerEvents();
    
    setTimeout(async () => {
      this.setupMinimap();

      if (this.settings.floatingToggleVisible) {
        this.createFloatingToggle();
      }
      await this._restoreRecentSearchCaches();
      await this._restoreFloatingKeywordButtons();
    }, 300);
  }

  loadSettings() {
    const saved = localStorage.getItem('swift-match-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.settings = Object.assign({}, DEFAULT_SETTINGS, parsed);
        this.settings.exhaustiveMode = true;
        // width 单位迁移：% → px（旧有效宽度 = min(width% × 视口宽, maxWidth)）
        if (this.settings.widthPx == null) {
          const wPct = Number(this.settings.width) || DEFAULT_SETTINGS.width;
          const cap = Number(this.settings.maxWidth) || DEFAULT_SETTINGS.maxWidth;
          this.settings.widthPx = Math.max(20, Math.min(400, Math.round(Math.min(window.innerWidth * wPct / 100, cap))));
        }
        // Migrate legacy default (2/7) which blocked all CJK single-phrase searches.
        // Now countWords() handles CJK by character count, but the old 2/7 values
        // were a bug default — reset to 0/0 (no limit) so users start clean.
        if (this.settings.searchWordCountMin === 2 && this.settings.searchWordCountMax === 7) {
          this.settings.searchWordCountMin = 0;
          this.settings.searchWordCountMax = 0;
          this.saveSettings();
        }
        const OLD_CANDY_STYLE = '.candy-mark { background: linear-gradient(120deg, #ffebcc 0%, #ffd9a5 100%); color: #b45f2b; padding: 2px 6px; border-radius: 12px; font-weight: 500; font-size: 0.9em; display: inline-block; }';
        if (this.settings.floatingToggleStyleClass === 'candy-mark' && this.settings.floatingToggleCustomStyle === OLD_CANDY_STYLE) {
          this.settings.floatingToggleStyleClass = DEFAULT_SETTINGS.floatingToggleStyleClass;
          this.settings.floatingToggleCustomStyle = DEFAULT_SETTINGS.floatingToggleCustomStyle;
          this.saveSettings();
        }
        if (!this.settings.pinColorSchemes || !Array.isArray(this.settings.pinColorSchemes) || this.settings.pinColorSchemes.length === 0) {
          this.settings.pinColorSchemes = DEFAULT_SETTINGS.pinColorSchemes.map(s => ({...s}));
        }
        // 迁移旧 zoneRatio → 独立区间 searchZone/outlineZone（中间留缓冲带）
        if (!this.settings.searchZone || !this.settings.outlineZone) {
          const r = Math.max(0.2, Math.min(0.8, this.settings.zoneRatio ?? 0.5));
          this.settings.searchZone = { top: 0.02, bottom: Math.max(0.08, r - 0.05) };
          this.settings.outlineZone = { top: Math.min(0.92, r + 0.05), bottom: 0.98 };
          this.saveSettings();
        }
      } catch (e) {
        this.settings = Object.assign({}, DEFAULT_SETTINGS);
      }
    }
    window._swiftMatchLang = this.settings.language || 'zh';
  }

  saveSettings() {
    localStorage.setItem('swift-match-settings', JSON.stringify(this.settings));
  }

  async loadListData() {
    const dataDir = this.app.vault.configDir || '.obsidian';
    this.listDataPath = `${dataDir}/plugins/trace/list-data.json`;
    this.cacheDir = `${dataDir}/plugins/trace/cache`;
    this.keywordDir = `${dataDir}/plugins/trace/keywords`;
    
    try {
      const adapter = this.app.vault.adapter;
      if (await adapter.exists(this.listDataPath)) {
        const content = await adapter.read(this.listDataPath);
        const data = JSON.parse(content);
        this.listPosition = data.listPosition || { left: null, top: null };
        this.listFixedPosition = data.listFixedPosition || { left: null, top: null };
        this.previewListPosition = data.previewListPosition || { left: null, top: null };
        this.listOpacity = data.listOpacity ?? 1.0;
        this.previewOpacity = data.previewOpacity ?? 1.0;
        this.previewSize = data.previewSize || { width: 600, height: 600 };
        this.matchListSize = data.matchListSize || { width: null, height: null };
        this.savedMatchLists = data.savedMatchLists || [];
        this._matchListScrollTop = data.matchListScrollTop || 0;
        this._recentSearches = data.recentSearches || [];
        this._favoriteSearches = data.favoriteSearches || [];
        this._listScrollPositions = Object.fromEntries(
          Object.entries(data.listScrollPositions || {}).filter(([k]) =>
            this._favoriteSearches.includes(k) || this._recentSearches.includes(k)
          )
        );
      }
    } catch (e) {
      console.error('Failed to load list data:', e);
      this.listPosition = { left: null, top: null };
      this.listFixedPosition = { left: null, top: null };
      this.previewListPosition = { left: null, top: null };
      this.listOpacity = 1.0;
      this.previewOpacity = 1.0;
      this.previewSize = { width: 600, height: 600 };
      this.matchListSize = { width: null, height: null };
      this.savedMatchLists = [];
    }
  }

  _cacheKeyToFileName(term) {
    return term.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_');
  }

  async saveSearchCache(term, fileMap, matchCount) {
    const adapter = this.app.vault.adapter;
    if (!await adapter.exists(this.cacheDir)) {
      await adapter.mkdir(this.cacheDir);
    }
    const fileName = this._cacheKeyToFileName(term);
    const filePath = `${this.cacheDir}/${fileName}.json`;
    const fileMapData = Array.from(fileMap.entries()).map(([file, headings]) => ({
      path: file.path,
      basename: file.basename,
      headings
    }));
    await adapter.write(filePath, JSON.stringify({ term, matchCount, fileMapData }, null, 2));
  }

  async loadSearchCache(term) {
    const adapter = this.app.vault.adapter;
    const fileName = this._cacheKeyToFileName(term);
    const filePath = `${this.cacheDir}/${fileName}.json`;
    if (!await adapter.exists(filePath)) return null;
    try {
      const content = await adapter.read(filePath);
      const data = JSON.parse(content);
      const fileMap = await this.deserializeFileMap(data.fileMapData || []);
      return { fileMap, matchCount: data.matchCount || 0 };
    } catch (e) {
      return null;
    }
  }

  async deleteSearchCache(term) {
    const adapter = this.app.vault.adapter;
    const fileName = this._cacheKeyToFileName(term);
    const filePath = `${this.cacheDir}/${fileName}.json`;
    if (await adapter.exists(filePath)) {
      try { await adapter.remove(filePath); } catch (e) {}
    }
  }

  async saveKeywordData(term, position, fileMap, matchCount) {
    const adapter = this.app.vault.adapter;
    if (!await adapter.exists(this.keywordDir)) {
      await adapter.mkdir(this.keywordDir);
    }
    const fileName = this._cacheKeyToFileName(term);
    const filePath = `${this.keywordDir}/${fileName}.json`;
    const fileMapData = fileMap ? Array.from(fileMap.entries()).map(([file, headings]) => ({
      path: file.path,
      basename: file.basename,
      headings
    })) : [];
    await adapter.write(filePath, JSON.stringify({ term, position, matchCount, fileMapData }, null, 2));
  }

  async loadAllKeywordData() {
    const adapter = this.app.vault.adapter;
    if (!await adapter.exists(this.keywordDir)) return [];
    const result = [];
    try {
      const listed = await adapter.list(this.keywordDir);
      const files = Array.isArray(listed) ? listed : (listed?.files || []);
      for (const f of files) {
        const filePath = f.startsWith(this.keywordDir) ? f : `${this.keywordDir}/${f}`;
        if (!filePath.endsWith('.json')) continue;
        try {
          const content = await adapter.read(filePath);
          result.push(JSON.parse(content));
        } catch (e) {}
      }
    } catch (e) {}
    return result;
  }

  async deleteKeywordData(term) {
    const adapter = this.app.vault.adapter;
    const fileName = this._cacheKeyToFileName(term);
    const filePath = `${this.keywordDir}/${fileName}.json`;
    if (await adapter.exists(filePath)) {
      await adapter.remove(filePath);
    }
  }

  async saveListData() {
    if (!this.listDataPath) return;
    
    try {
      const adapter = this.app.vault.adapter;
      const data = {
        listPosition: this.listPosition,
        listFixedPosition: this.listFixedPosition,
        previewListPosition: this.previewListPosition,
        listOpacity: this.listOpacity,
        previewOpacity: this.previewOpacity,
        previewSize: this.previewSize,
        matchListSize: this.matchListSize,
        savedMatchLists: this.savedMatchLists,
        matchListScrollTop: this._matchListScrollTop || 0,
        recentSearches: this._recentSearches || [],
        favoriteSearches: this._favoriteSearches || [],
        listScrollPositions: Object.fromEntries(
          Object.entries(this._listScrollPositions || {}).filter(([k]) =>
            this._favoriteSearches.includes(k) || this._recentSearches.includes(k)
          )
        )
      };
      await adapter.write(this.listDataPath, JSON.stringify(data, null, 2));

      for (const [term, cache] of Object.entries(this._recentSearchCaches)) {
        if (cache && cache.fileMap && cache.fileMap.size > 0) {
          await this.saveSearchCache(term, cache.fileMap, cache.matchCount || 0);
        }
      }
    } catch (e) {
      console.error('Failed to save list data:', e);
    }
  }

  async loadFloatingStyleData() {
    const dataDir = this.app.vault.configDir || '.obsidian';
    this.floatingStyleDataPath = `${dataDir}/plugins/trace/data.json`;
    try {
      const adapter = this.app.vault.adapter;
      if (await adapter.exists(this.floatingStyleDataPath)) {
        const content = await adapter.read(this.floatingStyleDataPath);
        const data = JSON.parse(content);
        this.floatingStyles = data.floatingStyles || [];
        this.floatingDefaultStyleId = data.floatingDefaultStyleId || null;
      } else {
        this.floatingStyles = [];
        this.floatingDefaultStyleId = null;
      }
      // Migrate old single customStyle to new multi-style format
      if (this.floatingStyles.length === 0 && this.settings.floatingToggleCustomStyle) {
        this.floatingStyles.push({
          id: Date.now().toString(),
          name: this.settings.floatingToggleText || 'search',
          styleClass: this.settings.floatingToggleStyleClass || '',
          customStyle: this.settings.floatingToggleCustomStyle || ''
        });
        this.floatingDefaultStyleId = this.floatingStyles[0].id;
        await this.saveFloatingStyleData();
      }
    } catch (e) {
      console.error('Failed to load floating style data:', e);
      this.floatingStyles = [];
      this.floatingDefaultStyleId = null;
    }
  }

  async saveFloatingStyleData() {
    if (!this.floatingStyleDataPath) return;
    try {
      const adapter = this.app.vault.adapter;
      const data = {
        floatingStyles: this.floatingStyles,
        floatingDefaultStyleId: this.floatingDefaultStyleId
      };
      await adapter.write(this.floatingStyleDataPath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to save floating style data:', e);
    }
  }

  getActiveFloatingStyle() {
    if (!this.floatingDefaultStyleId || !this.floatingStyles || this.floatingStyles.length === 0) {
      return null;
    }
    return this.floatingStyles.find(s => s.id === this.floatingDefaultStyleId) || null;
  }

  applySettings() {
    this._applyChipShadow();
    if (!this.minimapContainer) return;
    
    const s = this.settings;
    this.minimapContainer.style.top = `${s.top}px`;
    this.minimapContainer.style.right = `${s.rightOffset}px`;
    // 宽度走 CSS 变量而非内联 width：内联样式会压过 .collapsed/.collapsed:hover 规则导致"悬停展开"失效
    this.minimapContainer.style.setProperty('--mm-width', `${s.widthPx ?? 60}px`);
    this.minimapContainer.style.height = `calc(100vh - ${s.top}px - ${s.heightOffset}px)`;
    this.minimapContainer.style.opacity = s.opacity;
    this.opacity = s.opacity;
    
    if (this.slider) {
      this.slider.style.backgroundColor = 'var(--interactive-accent)';
    }
    
    if (this.minimapContent) {
      this.minimapContent.style.opacity = s.contentOpacity;
    }
    
    if (this.minimapContainer) {
      // 始终折叠为细条：悬停展开开 = 悬停时展开（can-hover）；关 = 保持折叠宽度
      this.minimapContainer.classList.add('collapsed');
      this.minimapContainer.classList.toggle('can-hover', !!s.collapseOnHover);
      this.minimapContainer.style.setProperty('--collapse-width', `${s.collapseWidth}px`);
    }
    
    this.removeEditorPadding();
    this.applyEditorPadding();
    this.updateViewport();
    this.applyHideStatusBar();
  }

  _applyChipShadow() {
    const i = this.settings.chipShadowIntensity ?? 0.6;
    const y = (8 * i).toFixed(1);
    const blur = (22 * i).toFixed(1);
    const alpha = (0.25 * i).toFixed(3);
    const dy = (10 * i).toFixed(1);
    const dblur = (24 * i).toFixed(1);
    const dalpha = (0.3 * i).toFixed(3);
    document.documentElement.style.setProperty('--sm-chip-shadow', `0 ${y}px ${blur}px rgba(0,0,0,${alpha})`);
    document.documentElement.style.setProperty('--sm-chip-shadow-drag', `0 ${dy}px ${dblur}px rgba(0,0,0,${dalpha})`);
  }

  applyCounterStyles() {
    const s = this.settings;
    const counterSize = s.counterSize;
    const counterPadding = '0px 2px';
    const counterTopOffset = `${s.counterTopOffset}px`;

    // 更新阅读模式
    const readingEl = document.querySelector('.markdown-reading-view');
    if (readingEl) {
      readingEl.style.setProperty('--minimap-counter-opacity', 1);
      readingEl.style.setProperty('--minimap-counter-size', `${counterSize}px`);
      readingEl.style.setProperty('--minimap-counter-padding', counterPadding);
      readingEl.style.setProperty('--minimap-counter-top-offset', counterTopOffset);
    }

    // 更新编辑器模式
    const editor = this.getEditor();
    if (editor && editor.cm && editor.cm.scrollDOM) {
      const scrollDOM = editor.cm.scrollDOM;
      scrollDOM.style.setProperty('--minimap-counter-opacity', 1);
      scrollDOM.style.setProperty('--minimap-counter-size', `${counterSize}px`);
      scrollDOM.style.setProperty('--minimap-counter-padding', counterPadding);
      scrollDOM.style.setProperty('--minimap-counter-top-offset', counterTopOffset);
      // 背景透明度也需要更新（颜色从配色方案获取）
      const currentPreset = s.counterStylePreset || 'glass';
      const counterColor = currentPreset === 'glass'
        ? (document.body.classList.contains('theme-dark') ? '#e0dcdc' : '#aba6a6')
        : s.counterColor;
      const counterBgColor = s.counterBgColor;
      scrollDOM.style.setProperty('--minimap-counter-color', counterColor);
      scrollDOM.style.setProperty('--minimap-counter-bgcolor', currentPreset === 'outlined' ? counterBgColor : this.hexToRgba(counterBgColor, 1));
      if (readingEl) {
        readingEl.style.setProperty('--minimap-counter-color', counterColor);
        readingEl.style.setProperty('--minimap-counter-bgcolor', currentPreset === 'outlined' ? counterBgColor : this.hexToRgba(counterBgColor, 1));
      }
    }
  }

  initCollapsibleSections() {
    if (!this.settingsPanel) return;
    const sections = this.settingsPanel.querySelectorAll('.minimap-settings-section');
    sections.forEach(section => {
      const title = section.querySelector('.minimap-settings-section-title');
      if (!title) return;
      // 收集 title 后面的所有兄弟元素
      const siblings = [];
      let next = title.nextElementSibling;
      while (next) {
        siblings.push(next);
        next = next.nextElementSibling;
      }
      // 如果已经包裹过就跳过
      if (siblings.length === 0) return;
      if (siblings.length === 1 && siblings[0].classList.contains('minimap-section-content')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'minimap-section-content';
      siblings.forEach(el => wrapper.appendChild(el));
      section.appendChild(wrapper);
      title.addEventListener('click', () => {
        section.classList.toggle('collapsed');
        // 手风琴：展开时折叠同 tab 下其他 section
        if (!section.classList.contains('collapsed') && this._smAccordion) {
          const tabContent = section.closest('.minimap-settings-tab-content');
          if (tabContent) {
            tabContent.querySelectorAll('.minimap-settings-section').forEach(s => {
              if (s !== section) s.classList.add('collapsed');
            });
          }
        }
      });
    });
  }

  applyCounterVisibility() {
    this.clearHighlights();
    if (this.currentSelection) {
      this.highlightMatches();
    } else {
      const isReading = this.isReadingMode();
      if (isReading) {
        this.showPinnedDecorations();
      } else {
        const editor = this.getEditor();
        if (editor && editor.cm) {
          this.addEditorDecorationsWithPinned(editor.cm, [], 0);
        }
      }
    }
  }

  showSettingsPanel(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (this.settingsPanel) {
      this.closeSettingsPanel();
      return;
    }
    
    this.settingsPanel = document.createElement('div');
    this.settingsPanel.className = 'minimap-settings-panel';
    // 设置面板打开期间 minimap 区间遮罩常显，并强制展开 minimap 以便看清区间
    this._mmZonePinned = true;
    if (this.settings.collapseOnHover) this.minimapContainer?.classList.add('mm-zone-preview');
    this._mmShowZoneHint?.(null, true);
    this.settingsPanel.innerHTML = `
      <div class="minimap-settings-header">
        <b>${t('settingsTitle')}</b><small style="color:var(--sm-sub);font-weight:400;">v${this.manifest.version || '1.0.0'}</small><span class="sp"></span><span class="minimap-settings-lang" id="minimap-lang-toggle">${this.settings.language === 'zh' ? '中 / EN' : 'EN / 中'}</span><button class="minimap-settings-close">&times;</button>
      </div>
      <div class="minimap-settings-tabs">
        <div class="minimap-settings-tab active" data-tab="misc">${t('tabMisc')}</div>
        <div class="minimap-settings-tab" data-tab="outline">${t('tabOutline')}</div>
        <div class="minimap-settings-tab" data-tab="match">${t('tabMatch')}</div>
        <div class="minimap-settings-tab" data-tab="minimap">${t('tabMinimap')}</div>
        <div class="minimap-settings-tab" data-tab="search">${t('tabSearch')}</div>
      </div>
      <div class="minimap-settings-bar">
        <input class="minimap-settings-search" id="minimap-settings-search" placeholder="${t('searchSettings')}">
        <span class="minimap-settings-chip" id="minimap-accordion" title="${t('accordionTip')}">${t('accordion')}</span>
      </div>
      <div class="minimap-settings-content">
        <div class="minimap-settings-tab-content active" data-tab="misc">
          <div class="minimap-settings-section">
            <div class="minimap-settings-section-title">${t('usageTitle')}</div>
            <div class="minimap-settings-row"><span class="l" style="font-size:11.5px;color:var(--sm-sub);line-height:1.9;">${t('usageZone')}<br>${t('usageChip')}<br>${t('usagePin')}<br>${t('usageToggle')}<br>${t('usageWheel')}<br>${t('usageRibbon')}</span></div>
          </div>
        </div>
        <div class="minimap-settings-tab-content" data-tab="outline">
          <div class="minimap-settings-section">
            <div class="minimap-settings-section-title">${t('tabOutline')}</div>
            <div class="minimap-settings-row">
              <span class="l">${t('outlineOnHover')}<span class="minimap-settings-hint" title="${t('outlineOnHoverDesc')}">ⓘ</span></span>
              <label class="minimap-settings-switch"><input type="checkbox" id="minimap-outlineonhover" ${this.settings.outlineOnHover ? 'checked' : ''}><s></s></label>
            </div>
            <div class="minimap-settings-row">
              <span class="l">${t('outlinePinnedMargin')}</span>
              <label class="minimap-settings-switch"><input type="checkbox" id="minimap-outlinepinnedmargin" ${this.settings.outlinePinnedMargin ? 'checked' : ''}><s></s></label>
            </div>
          </div>
          <div class="minimap-settings-section">
            <div class="minimap-settings-section-title">${t('olColorSettings')}<span class="minimap-settings-hint" title="${t('olColorSettingsHint')}">ⓘ</span></div>
            ${this._olKeys().map(k => {
              const mode = this._olMode(k);
              const em = this._olEmojiMap()[k] || '';
              const bgc = this._olColMap()[k] || '#c8c8c8';
              const fgc = (this.settings.olFgColors || {})[k] || this._olTextOn(bgc);
              const nm = this._olNm(k);
              // 记住上次展开/折叠状态；无记录时原生 emoji 条目默认展开，其余折叠
              const _accOpen = this.settings.olAccOpen || {};
              const open = (k in _accOpen) ? !!_accOpen[k] : (mode === 'native' && k !== 'B' && !!em);
              const DEF_EMS = ['🟡', '🟢', '🔵', '🔴', '🟣', '🟠'];
              const emList = em && !DEF_EMS.includes(em) ? DEF_EMS.concat(em) : DEF_EMS;
              const emgrid = emList.map(e => `<button type="button" class="ol-acc-emb${e === em ? ' on' : ''}" data-em="${e}">${e}</button>`).join('');
              return `
            <div class="ol-acc-row${open ? ' open' : ''}" data-k="${k}">
              <div class="ol-acc-top">
                <span class="ol-acc-chev">▶</span>
                ${(mode === 'native' && em) ? em : `<span class="ol-acc-dot" style="background:${bgc}"></span>`}
                <span class="ol-acc-n">${this._olEsc(nm)}</span>
                ${this._olHlPreview(k)}
                <span class="ol-acc-tag">${mode === 'native' ? t('olModeNative') : 'HTML'}</span>
              </div>
              <div class="ol-acc-body">
                <span class="ol-acc-seg"><span data-mode="native" class="${mode === 'native' ? 'on' : ''}">${t('olModeNative')}</span><span data-mode="html" class="${mode === 'html' ? 'on' : ''}">HTML</span></span>
                ${k === 'B' ? '' : mode === 'native'
                  ? `<span class="ol-acc-lab">emoji</span><span class="ol-acc-emgrid">${emgrid}</span>`
                  : `<span class="ol-acc-lab">${t('olLabelBg')}</span><input type="color" class="ol-acc-c ol-acc-bg" value="${bgc}" title="${t('olLabelBg')}"><span class="ol-acc-lab">${t('olLabelFg')}</span><input type="color" class="ol-acc-c ol-acc-fg" value="${fgc}" title="${t('olLabelFg')}">`}
                <span class="ol-acc-lab">${t('olLabelName')}</span><input type="text" class="ol-acc-nm" value="${this._olEsc(nm)}">
                <span class="ol-acc-syn">${this._olEsc(this._olSyn(k))}</span>
                <button class="ol-acc-del">${t('olDelEntry')}</button>
              </div>
            </div>`; }).join('')}
            <button id="minimap-oladd" class="ol-acc-add">${t('olAddCustom')}</button>
            <div class="minimap-settings-row" style="margin-top:8px;border-top:1px solid var(--sm-line);padding-top:6px;">
              <span class="l" style="flex:1;font-size:11px;color:var(--sm-sub);">${t('fopOutlineTip')}</span>
              <a href="obsidian://show-plugin?id=file-ops-plus" style="border:1px solid var(--sm-line);background:#fff;border-radius:99px;padding:3px 11px;cursor:pointer;color:var(--sm-green);text-decoration:none;font-size:11.5px;white-space:nowrap;">⌘ ${t('fopPluginChip')}</a>
            </div>
          </div>
        </div>
        <div class="minimap-settings-tab-content" data-tab="match">
          <div class="minimap-settings-section">
            <div class="minimap-settings-section-title">${t('pinIcon')}</div>
            <div class="minimap-settings-row">
              <span class="l">${t('enablePinIcon')}</span>
              <label class="minimap-settings-switch"><input type="checkbox" id="minimap-piniconenabled" ${this.settings.pinIconEnabled ? 'checked' : ''}><s></s></label>
            </div>
            <div class="minimap-settings-row">
              <span class="l">${t('iconMode')}</span>
              <select id="minimap-piniconmode">
                <option value="follow" ${this.settings.pinIconMode === 'follow' ? 'selected' : ''}>${t('followMouse')}</option>
                <option value="fixed" ${this.settings.pinIconMode === 'fixed' ? 'selected' : ''}>${t('fixedPosition')}</option>
              </select>
            </div>
            <div class="minimap-settings-row">
              <span class="l">${t('iconSize').replace(/ \(.*\)/, '')}</span>
              <div class="minimap-settings-num s"><input type="number" id="minimap-piniconsize" value="${this.settings.pinIconSize}" min="12" max="40"><i>px</i></div>
            </div>
            <div class="minimap-settings-row">
              <span class="l">${t('iconOpacity')}</span>
              <div class="minimap-settings-slider"><input type="range" id="minimap-piniconopacity" value="${this.settings.pinIconOpacity}" min="0.1" max="1" step="0.1"><em id="minimap-piniconopacity-value">${this.settings.pinIconOpacity}</em></div>
            </div>
            <div class="minimap-settings-row" style="border-top:1px solid var(--sm-line);">
              <span class="l" style="flex:1;font-size:11px;color:var(--sm-sub);">${t('fopPluginTip')}</span>
              <a id="minimap-fop-plugin-link" href="obsidian://show-plugin?id=file-ops-plus" style="border:1px solid var(--sm-line);background:#fff;border-radius:99px;padding:3px 11px;cursor:pointer;color:var(--sm-green);text-decoration:none;font-size:11.5px;white-space:nowrap;">⌘ ${t('fopPluginChip')}</a>
            </div>
          </div>
          <div id="minimap-follow-offset-section" style="display:${this.settings.pinIconMode === 'follow' ? 'block' : 'none'};">
            <div class="minimap-settings-section">
              <div class="minimap-settings-section-title">${t('iconOffset')}</div>
              <div class="minimap-settings-row">
                <span class="l">${t('iconOffset')}</span>
                <div class="minimap-settings-pair"><div class="minimap-settings-num s"><input type="number" id="minimap-piniconfollowoffsetx" value="${this.settings.pinIconFollowOffsetX ?? 15}" min="-100" max="100" step="1"><i>x</i></div><div class="minimap-settings-num s"><input type="number" id="minimap-piniconfollowoffsety" value="${this.settings.pinIconFollowOffsetY ?? -10}" min="-100" max="100" step="1"><i>y</i></div></div>
              </div>
              <div class="minimap-settings-row" style="justify-content:center;">
                <div id="minimap-follow-offset-preview" style="position:relative;width:120px;height:80px;border:1px solid var(--sm-line);border-radius:4px;background:var(--sm-pane);overflow:hidden;">
                  <div id="minimap-follow-offset-cursor" style="position:absolute;width:6px;height:6px;background:var(--sm-sub);border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);"></div>
                  <div id="minimap-follow-offset-icon" style="position:absolute;width:14px;height:14px;background:var(--sm-green);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;color:#fff;font-weight:bold;">m</div>
                </div>
              </div>
            </div>
          </div>
          <div class="minimap-settings-section">
            <div class="minimap-settings-section-title">${t('colorSchemes').replace(/ \(.*\)/, '')}<span class="n">${t('colorSchemesHint')}</span></div>
            <div id="minimap-color-schemes" class="minimap-settings-sch"></div>
          </div>
          <div class="minimap-settings-section">
            <div class="minimap-settings-section-title">${t('counterBubble')}</div>
            <div class="minimap-settings-row">
              <span class="l">${t('styleLabel')}</span>
              <div id="minimap-counter-preset-chips" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
            </div>
            <div class="minimap-settings-row">
              <span class="l">${t('matchOpacity')}</span>
              <div class="minimap-settings-slider"><input type="range" id="minimap-matchopacity" value="${this.settings.matchOpacity ?? 0.6}" min="0.1" max="1" step="0.05"><em id="minimap-matchopacity-value">${this.settings.matchOpacity ?? 0.6}</em></div>
            </div>
            <div class="minimap-settings-row">
              <span class="l">${t('counterFontSize').replace(/ \(.*\)/, '')}</span>
              <div class="minimap-settings-num s"><input type="number" id="minimap-countersize" value="${this.settings.counterSize}" min="6" max="16"><i>px</i></div>
            </div>
            <div class="minimap-settings-row">
              <span class="l">${t('counterTopOffset').replace(/ \(.*\)/, '')}</span>
              <div class="minimap-settings-num s"><input type="number" id="minimap-countertopoffset" value="${this.settings.counterTopOffset}" min="-30" max="10"><i>px</i></div>
            </div>
          </div>
          <div class="minimap-settings-section">
            <div class="minimap-settings-section-title">${t('optionsLabel')}</div>
            <div class="minimap-settings-row">
              <span class="l">${t('clearCountOnClose')}</span>
              <label class="minimap-settings-switch"><input type="checkbox" id="minimap-clearcountonclose" ${this.settings.clearCountOnClose ? 'checked' : ''}><s></s></label>
            </div>
          </div>
          <div class="minimap-settings-section">
            <div class="minimap-settings-section-title">${t('pinnedMatches')}</div>
            <div class="minimap-settings-block">
              <button id="minimap-clearallcounts" class="minimap-settings-btn" style="width:100%;margin-bottom:6px;padding:3px 10px;cursor:pointer;border:1px solid var(--sm-line);border-radius:5px;background:#fff;color:#8a6b66;font:inherit;font-size:12px;">${t('clearAllPinned')}</button>
            </div>
            <div id="minimap-pinned-list" style="max-height:400px;overflow-y:auto;"></div>
          </div>
        </div>
        <div class="minimap-settings-tab-content" data-tab="minimap">
          <div class="minimap-settings-section">
            <div class="minimap-settings-section-title">${t('minimap')}</div>
            <div class="minimap-settings-row">
              <span class="l">${t('hoverExpand')}<span class="minimap-settings-hint" title="${t('hoverExpandHint')}">ⓘ</span></span>
              <label class="minimap-settings-switch"><input type="checkbox" id="minimap-collapseonhover" ${this.settings.collapseOnHover ? 'checked' : ''}><s></s></label>
            </div>
            <div class="minimap-settings-row${this.settings.collapseOnHover ? '' : ' disabled'}">
              <span class="l">${t('expandedWidth').replace(/ \(.*?\)/g, '')}</span>
              <div class="minimap-settings-num s"><input type="number" id="minimap-width" value="${this.settings.widthPx ?? 60}" min="20" max="400" step="5" ${this.settings.collapseOnHover ? '' : 'disabled'}><i>px</i></div>
            </div>
            <div class="minimap-settings-row">
              <span class="l">${t('collapseWidth').replace(/ \(.*?\)/g, '')}</span>
              <div class="minimap-settings-num s"><input type="number" id="minimap-collapsewidth" value="${this.settings.collapseWidth}" min="4" max="50"><i>px</i></div>
            </div>
            <div class="minimap-settings-row">

              <span class="l">${t('opacity')}</span>
              <div class="minimap-settings-slider"><input type="range" id="minimap-opacity" value="${this.settings.opacity}" min="0.1" max="1" step="0.1"><em id="minimap-opacity-value">${this.settings.opacity}</em></div>
            </div>
            <div class="minimap-settings-row">
              <span class="l">${t('contentOpacity')}</span>
              <div class="minimap-settings-slider"><input type="range" id="minimap-contentopacity" value="${this.settings.contentOpacity}" min="0.1" max="1" step="0.1"><em id="minimap-contentopacity-value">${this.settings.contentOpacity}</em></div>
            </div>
          </div>
          <div class="minimap-settings-section">
            <div class="minimap-settings-section-title">${t('posSpacing').replace(/ \(.*?\)/g, '')}</div>
            <div class="minimap-settings-block g3">
              <div><label>${t('topDistance').replace(/ \(.*?\)/g, '')}</label><div class="minimap-settings-num"><input type="number" id="minimap-top" value="${this.settings.top}" min="0" max="500"><i>px</i></div></div>
              <div><label>${t('bottomOffset').replace(/ \(.*?\)/g, '')}</label><div class="minimap-settings-num"><input type="number" id="minimap-heightoffset" value="${this.settings.heightOffset}" min="0" max="200"><i>px</i></div></div>
              <div><label>${t('rightOffset').replace(/ \(.*?\)/g, '')}</label><div class="minimap-settings-num"><input type="number" id="minimap-rightoffset" value="${this.settings.rightOffset}" min="-100" max="200"><i>px</i></div></div>
              <div><label>${t('editorPadding').replace(/ \(.*?\)/g, '')}</label><div class="minimap-settings-num"><input type="number" id="minimap-editorpadding" value="${this.settings.editorPadding}" min="0" max="100"><i>px</i></div></div>
            </div>
          </div>
          <div class="minimap-settings-section">
            <div class="minimap-settings-section-title">${t('minimapBlacklist')}</div>
            <div class="minimap-settings-block">
              <textarea id="minimap-blacklist" rows="3" style="height:200px" placeholder="${t('minimapBlacklistDesc')}">${this.settings.minimapBlacklist || ''}</textarea>
            </div>
          </div>
          <div class="minimap-settings-section">
            <div class="minimap-settings-row">
              <span class="l"><b>${t('hoverWindow')}</b><span class="minimap-settings-hint" title="${t('hoverWindowHint')}">ⓘ</span></span>
              <label class="minimap-settings-switch"><input type="checkbox" id="minimap-hoverwindow" ${this.settings.hoverWindow !== false ? 'checked' : ''}><s></s></label>
            </div>
            <div class="minimap-settings-row${this.settings.hoverWindow !== false ? '' : ' disabled'}">
              <span class="l">${t('winShowDelay').replace(/ \(.*\)/, '')}<span class="minimap-settings-hint" title="${t('winShowDelayHint')}">ⓘ</span></span>
              <div class="minimap-settings-num s"><input type="number" id="minimap-winshowdelay" value="${this.settings.winShowDelay ?? 0}" min="0" max="1500" step="50" ${this.settings.hoverWindow !== false ? '' : 'disabled'}><i>ms</i></div>
            </div>
            <div class="minimap-settings-row${this.settings.hoverWindow !== false ? '' : ' disabled'}">
              <span class="l">${t('winHideDelay').replace(/ \(.*\)/, '')}<span class="minimap-settings-hint" title="${t('winHideDelayHint')}">ⓘ</span></span>
              <div class="minimap-settings-num s"><input type="number" id="minimap-winhidedelay" value="${this.settings.winHideDelay ?? 160}" min="0" max="5000" step="100" ${this.settings.hoverWindow !== false ? '' : 'disabled'}><i>ms</i></div>
            </div>
            <div class="minimap-settings-row${this.settings.hoverWindow !== false ? '' : ' disabled'}">
              <span class="l">${t('zoneIndicator')}<span class="minimap-settings-hint" title="${t('zoneIndicatorHint')}">ⓘ</span></span>
              <label class="minimap-settings-switch"><input type="checkbox" id="minimap-zoneindicator" ${this.settings.zoneIndicator !== false ? 'checked' : ''} ${this.settings.hoverWindow !== false ? '' : 'disabled'}><s></s></label>
            </div>
            <div class="minimap-settings-row${this.settings.hoverWindow !== false ? '' : ' disabled'}">
              <span class="l">${t('zoneRatio')}<span class="minimap-settings-hint" title="${t('zoneRatioHint')}">ⓘ</span></span>
              <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;font-size:0.85em;color:var(--text-muted);">
                <label style="display:flex;align-items:center;gap:3px;">${t('zoneSearch')} <input type="number" id="minimap-szone-top" value="${Math.round((this.settings.searchZone?.top ?? 0.05) * 100)}" min="2" max="97" step="1" style="width:48px;" ${this.settings.hoverWindow !== false ? '' : 'disabled'}><i>%</i> ~ <input type="number" id="minimap-szone-bot" value="${Math.round((this.settings.searchZone?.bottom ?? 0.40) * 100)}" min="2" max="98" step="1" style="width:48px;" ${this.settings.hoverWindow !== false ? '' : 'disabled'}><i>%</i></label>
                <label style="display:flex;align-items:center;gap:3px;">${t('zoneOutline')} <input type="number" id="minimap-ozone-top" value="${Math.round((this.settings.outlineZone?.top ?? 0.55) * 100)}" min="3" max="98" step="1" style="width:48px;" ${this.settings.hoverWindow !== false ? '' : 'disabled'}><i>%</i> ~ <input type="number" id="minimap-ozone-bot" value="${Math.round((this.settings.outlineZone?.bottom ?? 0.95) * 100)}" min="3" max="98" step="1" style="width:48px;" ${this.settings.hoverWindow !== false ? '' : 'disabled'}><i>%</i></label>
              </div>
            </div>
          </div>
        </div>
        <div class="minimap-settings-tab-content" data-tab="search">
          <div class="minimap-settings-section">
            <div class="minimap-settings-section-title">${t('floatingToggleStyle')}</div>
            <div class="minimap-settings-row">
              <span class="l">${t('showFloatingToggle')}</span>
              <span id="minimap-showfloatingtoggle" style="cursor:pointer;display:inline-block;">${this.settings.floatingToggleText || 'search'}</span>
            </div>
            <div class="minimap-settings-row">
              <span class="l">${t('floatingToggleText')}</span>
              <input type="text" id="minimap-floatingtoggletext" value="${this.settings.floatingToggleText || 'search'}" placeholder="search" style="flex:1;min-width:0;max-width:160px;border:1px solid var(--sm-line);border-radius:5px;padding:2px 8px;font:inherit;background:var(--background-primary);color:var(--sm-ink);">
            </div>
            <div class="minimap-settings-row">

              <span class="l">${t('chipShadowIntensity')}<span class="minimap-settings-hint" title="${t('chipShadowIntensityHint')}">ⓘ</span></span>
              <div class="minimap-settings-slider"><input type="range" id="minimap-chipshadowintensity" value="${this.settings.chipShadowIntensity ?? 0.6}" min="0" max="1" step="0.1"><em id="minimap-chipshadowintensity-value">${this.settings.chipShadowIntensity ?? 0.6}</em></div>
            </div>
          </div>
          <div class="minimap-settings-section">
            <div class="minimap-settings-section-title">${t('searchLimit')}</div>
            <div class="minimap-settings-subtitle">${t('autoSearch')}<span style="font-size:0.8em;color:var(--text-faint);margin-left:6px;font-weight:normal;">${t('autoSearchHint')}</span></div>
            <div class="minimap-settings-row">
              <span class="l" title="${t('enableSelectionMatch')}">auto</span>
              <label class="minimap-settings-switch"><input type="checkbox" id="minimap-enableselectionmatch" ${this.settings.enableSelectionMatch ? 'checked' : ''}><s></s></label>
            </div>
            <div class="minimap-settings-row">
              <span class="l">${t('wordCount')}<span class="minimap-settings-hint" title="${t('wordCountHint')}">ⓘ</span></span>
              <div class="minimap-settings-pair">${t('minWords').replace(/ \(.*\)/, '')}<div class="minimap-settings-num s"><input type="number" id="minimap-searchwordcountmin" value="${this.settings.searchWordCountMin ?? 0}" min="0" max="100"><i>${this.settings.language === 'zh' ? '字' : 'ch'}</i></div>${t('maxWords').replace(/ \(.*\)/, '')}<div class="minimap-settings-num s"><input type="number" id="minimap-searchwordcountmax" value="${this.settings.searchWordCountMax ?? 0}" min="0" max="100"><i>${this.settings.language === 'zh' ? '字' : 'ch'}</i></div></div>
            </div>
            <div class="minimap-settings-subtitle">${t('manualSearch')}</div>
            <div class="minimap-settings-row">
              <span class="l">${t('multiKeywordRequireAll')}</span>
              <label class="minimap-settings-switch"><input type="checkbox" id="minimap-multikeywordrequireall" ${this.settings.multiKeywordRequireAll !== false ? 'checked' : ''}><s></s></label>
            </div>
            <div class="minimap-settings-row">
              <span class="l">${t('searchOnInput')}<span class="minimap-settings-hint" title="${t('searchOnInputHint')}">ⓘ</span></span>
              <label class="minimap-settings-switch"><input type="checkbox" id="minimap-searchoninput" ${this.settings.searchOnInput ? 'checked' : ''}><s></s></label>
            </div>
          </div>
        </div>
      </div>
      <div class="minimap-settings-footer">
        <span id="minimap-footer-info">${t('autoSave')}</span><span class="sp"></span><button class="d" id="minimap-reset">${t('restorePageDefault')}</button>
      </div>
    `;
    
    document.body.appendChild(this.settingsPanel);
    
    // Restore saved panel width
    const savedPanelWidth = localStorage.getItem('minimap-settings-panel-width');
    if (savedPanelWidth) {
      this.settingsPanel.style.width = savedPanelWidth;
    }
    
    // Save panel width on resize
    const resizeObserver = new ResizeObserver(() => {
      if (!this.settingsPanel) return;
      const width = this.settingsPanel.getBoundingClientRect().width;
      localStorage.setItem('minimap-settings-panel-width', `${width}px`);
    });
    resizeObserver.observe(this.settingsPanel);
    this._settingsPanelResizeObserver = resizeObserver;
    
    // Center the panel in the window
    const panelRect = this.settingsPanel.getBoundingClientRect();
    const centerX = (window.innerWidth - panelRect.width) / 2;
    const centerY = (window.innerHeight - panelRect.height) / 2;
    this.settingsPanel.style.left = `${Math.max(0, centerX)}px`;
    this.settingsPanel.style.top = `${Math.max(0, centerY)}px`;
    
    // Make panel draggable by header
    const header = this.settingsPanel.querySelector('.minimap-settings-header');
    let isDraggingPanel = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    
    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('minimap-settings-close')) return;
      if (e.target.id === 'minimap-lang-toggle') return;
      if (!this.settingsPanel) return;
      isDraggingPanel = true;
      dragOffsetX = e.clientX - this.settingsPanel.getBoundingClientRect().left;
      dragOffsetY = e.clientY - this.settingsPanel.getBoundingClientRect().top;
      header.style.cursor = 'grabbing';
      e.preventDefault();
    });
    
    const onPanelMouseMove = (e) => {
      if (!isDraggingPanel) return;
      if (!this.settingsPanel) return;
      const newLeft = e.clientX - dragOffsetX;
      const newTop = e.clientY - dragOffsetY;
      this.settingsPanel.style.left = `${newLeft}px`;
      this.settingsPanel.style.top = `${newTop}px`;
    };
    
    const onPanelMouseUp = () => {
      if (isDraggingPanel) {
        isDraggingPanel = false;
        header.style.cursor = 'grab';
      }
    };
    
    document.addEventListener('mousemove', onPanelMouseMove);
    document.addEventListener('mouseup', onPanelMouseUp);
    this._settingsPanelDragCleanup = () => {
      document.removeEventListener('mousemove', onPanelMouseMove);
      document.removeEventListener('mouseup', onPanelMouseUp);
    };
    
    const closeBtn = this.settingsPanel.querySelector('.minimap-settings-close');
    closeBtn.addEventListener('click', () => this.closeSettingsPanel());
    const langToggle = this.settingsPanel.querySelector('#minimap-lang-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.settings.language = this.settings.language === 'zh' ? 'en' : 'zh';
        window._swiftMatchLang = this.settings.language;
        this.saveSettings();
        this.updateCommandNames();
        this._olRefreshLang();
        // Close and reopen settings panel to apply language change
        this.closeSettingsPanel();
        setTimeout(() => {
          const mockEvent = { preventDefault: () => {}, stopPropagation: () => {} };
          this.showSettingsPanel(mockEvent);
        }, 100);
      });
    }
    
    this.settingsPanel.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    this.settingsPanel.querySelectorAll('.minimap-settings-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        if (!this.settingsPanel) return;
        this.settingsPanel.querySelectorAll('.minimap-settings-tab').forEach(t => t.classList.remove('active'));
        this.settingsPanel.querySelectorAll('.minimap-settings-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
          const tabName = tab.dataset.tab;
          this.settingsPanel.querySelector(`.minimap-settings-tab-content[data-tab="${tabName}"]`).classList.add('active');
          this.settings.settingsTab = tabName;
          this.saveSettings();
        });
      });
      // 恢复上次选中的 tab
      const _savedTab = this.settings.settingsTab;
      if (_savedTab && _savedTab !== 'misc') {
        this.settingsPanel.querySelector(`.minimap-settings-tab[data-tab="${_savedTab}"]`)?.click();
      }

      this.settingsPanel.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('wheel', (e) => {
        e.preventDefault();
        const step = parseFloat(input.step) || 1;
        const delta = e.deltaY > 0 ? -step : step;
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        let newVal = (parseFloat(input.value) || 0) + delta;
        if (!isNaN(min)) newVal = Math.max(min, newVal);
        if (!isNaN(max)) newVal = Math.min(max, newVal);
        // 按 step 小数位取整，避免 0.1+0.2 浮点尾巴
        const dec = (String(input.step).split('.')[1] || '').length;
        input.value = dec ? newVal.toFixed(dec) : String(Math.round(newVal));
        input.dispatchEvent(new Event('input'));
      }, { passive: false });
    });

    const inputs = {
      blacklist: this.settingsPanel.querySelector('#minimap-blacklist'),
      top: this.settingsPanel.querySelector('#minimap-top'),
      width: this.settingsPanel.querySelector('#minimap-width'),
      heightoffset: this.settingsPanel.querySelector('#minimap-heightoffset'),
      rightoffset: this.settingsPanel.querySelector('#minimap-rightoffset'),
      editorpadding: this.settingsPanel.querySelector('#minimap-editorpadding'),

      opacity: this.settingsPanel.querySelector('#minimap-opacity'),
      contentopacity: this.settingsPanel.querySelector('#minimap-contentopacity'),
      collapseonhover: this.settingsPanel.querySelector('#minimap-collapseonhover'),
      hoverwindow: this.settingsPanel.querySelector('#minimap-hoverwindow'),
      winshowdelay: this.settingsPanel.querySelector('#minimap-winshowdelay'),
      winhidedelay: this.settingsPanel.querySelector('#minimap-winhidedelay'),
      zoneindicator: this.settingsPanel.querySelector('#minimap-zoneindicator'),
      szonetop: this.settingsPanel.querySelector('#minimap-szone-top'),
      szonebot: this.settingsPanel.querySelector('#minimap-szone-bot'),
      ozonetop: this.settingsPanel.querySelector('#minimap-ozone-top'),
      ozonebot: this.settingsPanel.querySelector('#minimap-ozone-bot'),
      collapsewidth: this.settingsPanel.querySelector('#minimap-collapsewidth'),
      matchopacity: this.settingsPanel.querySelector('#minimap-matchopacity'),
      countersize: this.settingsPanel.querySelector('#minimap-countersize'),
      countertopoffset: this.settingsPanel.querySelector('#minimap-countertopoffset'),
      clearcountonclose: this.settingsPanel.querySelector('#minimap-clearcountonclose'),
      piniconenabled: this.settingsPanel.querySelector('#minimap-piniconenabled'),
      piniconmode: this.settingsPanel.querySelector('#minimap-piniconmode'),
      piniconsize: this.settingsPanel.querySelector('#minimap-piniconsize'),
      piniconopacity: this.settingsPanel.querySelector('#minimap-piniconopacity'),
      piniconfollowoffsetx: this.settingsPanel.querySelector('#minimap-piniconfollowoffsetx'),
      piniconfollowoffsety: this.settingsPanel.querySelector('#minimap-piniconfollowoffsety'),
      searchwordcountmin: this.settingsPanel.querySelector('#minimap-searchwordcountmin'),
      searchwordcountmax: this.settingsPanel.querySelector('#minimap-searchwordcountmax'),
      multikeywordrequireall: this.settingsPanel.querySelector('#minimap-multikeywordrequireall'),
      searchoninput: this.settingsPanel.querySelector('#minimap-searchoninput'),
      enableselectionmatch: this.settingsPanel.querySelector('#minimap-enableselectionmatch'),
      outlineonhover: this.settingsPanel.querySelector('#minimap-outlineonhover'),
      outlinepinnedmargin: this.settingsPanel.querySelector('#minimap-outlinepinnedmargin'),
      chipshadowintensity: this.settingsPanel.querySelector('#minimap-chipshadowintensity')
    };

    const matchOpacityValue = this.settingsPanel.querySelector('#minimap-matchopacity-value');
    
    const opacityValue = this.settingsPanel.querySelector('#minimap-opacity-value');
    const contentOpacityValue = this.settingsPanel.querySelector('#minimap-contentopacity-value');
    const pinIconOpacityValue = this.settingsPanel.querySelector('#minimap-piniconopacity-value');
    const chipShadowIntensityValue = this.settingsPanel.querySelector('#minimap-chipshadowintensity-value');
    
    // 轻量刷新（不重建 minimap）：slider、opacity 等视觉属性实时生效
    const refreshVisual = () => {
      this.settings.opacity = parseFloat(inputs.opacity.value) || DEFAULT_SETTINGS.opacity;
      this.settings.contentOpacity = parseFloat(inputs.contentopacity.value) || DEFAULT_SETTINGS.contentOpacity;

      this.settings.matchOpacity = parseFloat(inputs.matchopacity.value) || DEFAULT_SETTINGS.matchOpacity;
      this.settings.pinIconOpacity = parseFloat(inputs.piniconopacity.value) || DEFAULT_SETTINGS.pinIconOpacity;
      this.settings.chipShadowIntensity = isNaN(parseFloat(inputs.chipshadowintensity.value)) ? 0.6 : parseFloat(inputs.chipshadowintensity.value);
      opacityValue.textContent = this.settings.opacity.toFixed(1);
      contentOpacityValue.textContent = this.settings.contentOpacity.toFixed(1);
      matchOpacityValue.textContent = this.settings.matchOpacity.toFixed(2);
      pinIconOpacityValue.textContent = this.settings.pinIconOpacity.toFixed(1);
      chipShadowIntensityValue.textContent = this.settings.chipShadowIntensity.toFixed(1);
      this.saveSettings();
      this.applySettings();
    };

    // 全量保存：重建 minimap + 编辑器 padding（number / toggle 变更时触发）
    let _updateTimer = null;
    const updateSettingsCore = () => {
      this.settings.minimapBlacklist = inputs.blacklist.value;
      this.settings.top = parseFloat(inputs.top.value) || DEFAULT_SETTINGS.top;
      this.settings.widthPx = parseFloat(inputs.width.value) || DEFAULT_SETTINGS.widthPx;
      this.settings.heightOffset = parseFloat(inputs.heightoffset.value) || DEFAULT_SETTINGS.heightOffset;
      this.settings.rightOffset = parseFloat(inputs.rightoffset.value) || DEFAULT_SETTINGS.rightOffset;
      this.settings.editorPadding = isNaN(parseFloat(inputs.editorpadding.value)) ? DEFAULT_SETTINGS.editorPadding : parseFloat(inputs.editorpadding.value);
      this.settings.collapseOnHover = inputs.collapseonhover.checked;
      // 展开时宽度：悬停展开关闭时置灰不可编辑（此时 minimap 始终为折叠宽度）
      const widthRow = inputs.width?.closest('.minimap-settings-row');
      widthRow?.classList.toggle('disabled', !this.settings.collapseOnHover);
      if (inputs.width) inputs.width.disabled = !this.settings.collapseOnHover;
      // 悬停打开窗口总开关：关闭时整组子项置灰
      this.settings.hoverWindow = inputs.hoverwindow.checked;
      [inputs.winshowdelay, inputs.winhidedelay, inputs.zoneindicator, inputs.szonetop, inputs.szonebot, inputs.ozonetop, inputs.ozonebot].forEach(el => {
        el?.closest('.minimap-settings-row')?.classList.toggle('disabled', !this.settings.hoverWindow);
        if (el) el.disabled = !this.settings.hoverWindow;
      });
      this.settings.winShowDelay = Math.max(0, Math.min(1500, parseInt(inputs.winshowdelay.value) || 0));
      this.settings.winHideDelay = Math.max(0, Math.min(5000, parseInt(inputs.winhidedelay.value) || 0));
      this.settings.zoneIndicator = inputs.zoneindicator.checked;
      const _sz = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
      let sTop = _sz((parseInt(inputs.szonetop.value) || 5) / 100, 0.02, 0.97);
      let sBot = _sz((parseInt(inputs.szonebot.value) || 40) / 100, 0.02, 0.98);
      let oTop = _sz((parseInt(inputs.ozonetop.value) || 55) / 100, 0.03, 0.98);
      let oBot = _sz((parseInt(inputs.ozonebot.value) || 95) / 100, 0.03, 0.98);
      if (sTop > sBot) [sTop, sBot] = [sBot, sTop];
      if (oTop > oBot) [oTop, oBot] = [oBot, oTop];
      if (sBot > oTop) { const m = (sBot + oTop) / 2; sBot = m; oTop = m; }
      this.settings.searchZone = { top: sTop, bottom: sBot };
      this.settings.outlineZone = { top: oTop, bottom: oBot };
      this.settings.collapseWidth = parseFloat(inputs.collapsewidth.value) || DEFAULT_SETTINGS.collapseWidth;
      this.settings.counterSize = parseFloat(inputs.countersize.value) || DEFAULT_SETTINGS.counterSize;
      this.settings.counterTopOffset = isNaN(parseFloat(inputs.countertopoffset.value)) ? DEFAULT_SETTINGS.counterTopOffset : parseFloat(inputs.countertopoffset.value);

      this.settings.clearCountOnClose = inputs.clearcountonclose.checked;
      this.settings.searchWordCountMin = parseInt(inputs.searchwordcountmin.value) || 0;
      this.settings.searchWordCountMax = parseInt(inputs.searchwordcountmax.value) || 0;
      this.settings.pinIconEnabled = inputs.piniconenabled.checked;
      this.settings.pinIconMode = inputs.piniconmode.value;
      this.settings.pinIconSize = parseFloat(inputs.piniconsize.value) || DEFAULT_SETTINGS.pinIconSize;
      this.settings.pinIconFollowOffsetX = isNaN(parseInt(inputs.piniconfollowoffsetx.value)) ? DEFAULT_SETTINGS.pinIconFollowOffsetX : parseInt(inputs.piniconfollowoffsetx.value);
      this.settings.pinIconFollowOffsetY = isNaN(parseInt(inputs.piniconfollowoffsety.value)) ? DEFAULT_SETTINGS.pinIconFollowOffsetY : parseInt(inputs.piniconfollowoffsety.value);
      this.settings.multiKeywordRequireAll = inputs.multikeywordrequireall.checked;
      this.settings.searchOnInput = inputs.searchoninput.checked;
      this.settings.enableSelectionMatch = inputs.enableselectionmatch.checked;
      this.settings.outlineOnHover = inputs.outlineonhover.checked;
      this.settings.outlinePinnedMargin = inputs.outlinepinnedmargin.checked;
      if (!this.settings.outlinePinnedMargin) this._removeOutlineMargin();
      else if (this._olPeer?.mode === 'pinned') this._applyOutlineMargin();
      this.saveSettings();
      this.applySettings();
      this.setupMinimap();
      this.applyCounterStyles();
      this.updateFloatingToggleStyle();
      renderColorSchemes();
      if (this.currentSelection) this.highlightMatches();
    };
    // debounce 全量保存：滚轮连续调整数值时只在停顿 300ms 后重建一次
    const updateSettings = () => {
      if (_updateTimer) clearTimeout(_updateTimer);
      _updateTimer = setTimeout(() => { _updateTimer = null; updateSettingsCore(); }, 300);
    };

    Object.values(inputs).filter(Boolean).forEach(input => {
      input.addEventListener('input', updateSettings);
    });
    // 视觉类（slider / opacity / 颜色）高频拖拽：轻量刷新即时生效，全量保存 debounce 收尾
    [inputs.opacity, inputs.contentopacity, inputs.matchopacity, inputs.piniconopacity, inputs.chipshadowintensity].filter(Boolean).forEach(input => {
      input.addEventListener('input', refreshVisual);
    });
    // 比例输入实时同步 overlay 几何
    [inputs.szonetop, inputs.szonebot, inputs.ozonetop, inputs.ozonebot].filter(Boolean).forEach(input => {
      input.addEventListener('input', () => setTimeout(() => this._mmApplyHintGeo?.(), 0));
    });

    // 悬浮按钮文字：独立绑定，实时刷新 chip 与设置预览
    const ftTextInput = this.settingsPanel.querySelector('#minimap-floatingtoggletext');
    ftTextInput?.addEventListener('input', () => {
      this.settings.floatingToggleText = ftTextInput.value.trim() || 'search';
      this.saveSettings();
      this.updateFloatingToggleBadge();
      if (this._applySettingsBtnStyle) this._applySettingsBtnStyle();
    });

    // 大纲高亮编码：颜色写入 settings.olColors，名称写入 _olCfg.names（与大纲面板双击重命名共用）
    const OL_DEF_COLORS = { y: '#f6d84a', g: '#9ad48c', b: '#8ec5f0', r: '#f4a3a3', p: '#c4aef0', o: '#f5a623', cp: '#FFB3D9', in: '#d6409f', kf: '#B3FFFF', mr: '#010101', d: '#eadf9a', B: '#8a897f', u: '#c8c8c8' };
    const OL_DN = { y: 'olColorY', g: 'olColorG', b: 'olColorB', r: 'olColorR', p: 'olColorP', o: 'olColorO', cp: 'olColorCp', in: 'olColorIn', kf: 'olColorKf', mr: 'olColorMr', d: 'olColorD', B: 'olColorBold', u: 'olColorU' };
    // 重绘面板（添加/删除条目后），保持窗口位置、当前 tab 与滚动位置
    const rerenderPanel = () => {
      const p = this.settingsPanel;
      const pos = p ? { left: p.style.left, top: p.style.top } : null;
      // 保存滚动位置：主内容区及内部可滚动区域（pinned list 等）
      const scrolls = [];
      p?.querySelectorAll('.minimap-settings-content, .minimap-settings-content *').forEach(el => {
        if (el.scrollTop > 0 && (el.scrollHeight > el.clientHeight)) {
          scrolls.push({ el, top: el.scrollTop, left: el.scrollLeft });
        }
      });
      const keepTab = p?.querySelector('.minimap-settings-tab.active')?.dataset.tab || 'outline';
      this.closeSettingsPanel();
      this.showSettingsPanel({ preventDefault() {}, stopPropagation() {} });
      if (this.settingsPanel) {
        if (pos && pos.left) { this.settingsPanel.style.left = pos.left; this.settingsPanel.style.top = pos.top; }
        if (keepTab !== 'misc') this.settingsPanel.querySelector(`.minimap-settings-tab[data-tab="${keepTab}"]`)?.click();
        // 恢复滚动位置（按顺序匹配重建后的同名元素）
        const newScrollers = [];
        this.settingsPanel.querySelectorAll('.minimap-settings-content, .minimap-settings-content *').forEach(el => {
          if (el.scrollHeight > el.clientHeight) newScrollers.push(el);
        });
        scrolls.forEach((s, i) => {
          const target = newScrollers[i] || this.settingsPanel.querySelector('.minimap-settings-content');
          if (target) { target.scrollTop = s.top; target.scrollLeft = s.left; }
        });
      }
    };
    // E 手风琴式高亮编码：原生 emoji 行默认直接展开
    // emoji 本色：改 emoji 时颜色自动跟随，保持预览 / 语法 / 实际高亮三者一致
    const EMOJI_CANON = { '🟡': '#f6d84a', '🟢': '#9ad48c', '🔵': '#8ec5f0', '🔴': '#f4a3a3', '🟣': '#c4aef0', '🟠': '#f5a623', '💛': '#f6d84a', '💚': '#9ad48c', '💙': '#8ec5f0', '❤': '#f4a3a3', '💜': '#c4aef0', '🧡': '#f5a623' };
    this.settingsPanel.querySelectorAll('.ol-acc-row').forEach(row => {
      const k = row.dataset.k;
      // 折叠 / 展开（点控件不触发）
      row.querySelector('.ol-acc-top').addEventListener('click', e => {
        if (e.target.closest('input,button,select')) return;
        row.classList.toggle('open');
        if (!this.settings.olAccOpen) this.settings.olAccOpen = {};
        this.settings.olAccOpen[k] = row.classList.contains('open');
        this.saveSettings();
      });
      // 方式切换：原生 / HTML
      row.querySelectorAll('.ol-acc-seg span').forEach(s => {
        s.addEventListener('click', e => {
          e.stopPropagation();
          this._olSetMode(k, s.dataset.mode);
          this.saveSettings();
          rerenderPanel();
          if (this._outlinePanel) this._buildOutlineContent();
        });
      });
      // emoji 按钮组：点击即切换，无需手动输入；颜色跟随所选 emoji
      const DEF_KEY_EMOJI = { y: '🟡', g: '🟢', b: '🔵', r: '🔴', p: '🟣', o: '🟠' };
      row.querySelectorAll('.ol-acc-emb').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const v = btn.dataset.em;
          if (!this.settings.olEmoji) this.settings.olEmoji = {};
          if (!this.settings.olColors) this.settings.olColors = {};
          if (DEF_KEY_EMOJI[k] === v) {
            delete this.settings.olEmoji[k]; // 选回本键默认 emoji，清除覆盖
          } else {
            this.settings.olEmoji[k] = v;
          }
          if (EMOJI_CANON[v]) this.settings.olColors[k] = EMOJI_CANON[v];
          // 内置键恢复默认色时清除颜色覆盖（自定义 HTML 键不适用）
          const defC = OL_DEF_COLORS[k];
          if (defC && this.settings.olColors[k] === defC && DEF_KEY_EMOJI[k] === v) delete this.settings.olColors[k];
          this.saveSettings();
          rerenderPanel();
          if (this._outlinePanel) this._buildOutlineContent();
        });
      });
      // 背景 / 文字色：就地更新预览与语法，不重绘面板（避免系统取色器中断）
      const bgIn = row.querySelector('.ol-acc-bg');
      const fgIn = row.querySelector('.ol-acc-fg');
      const refreshRowVisual = () => {
        const wrap = document.createElement('div');
        wrap.innerHTML = this._olHlPreview(k);
        row.querySelector('.ol-acc-hl')?.replaceWith(wrap.firstElementChild);
        const syn = row.querySelector('.ol-acc-syn');
        if (syn) syn.textContent = this._olSyn(k);
        const dot = row.querySelector('.ol-acc-dot');
        if (dot) dot.style.background = this._olColMap()[k] || '#c8c8c8';
      };
      bgIn?.addEventListener('input', () => {
        if (!this.settings.olColors) this.settings.olColors = {};
        this.settings.olColors[k] = bgIn.value;
        this.saveSettings();
        refreshRowVisual();
      });
      bgIn?.addEventListener('change', () => { if (this._outlinePanel) this._buildOutlineContent(); });
      fgIn?.addEventListener('input', () => {
        if (!this.settings.olFgColors) this.settings.olFgColors = {};
        this.settings.olFgColors[k] = fgIn.value;
        this.saveSettings();
        refreshRowVisual();
      });
      fgIn?.addEventListener('change', () => { if (this._outlinePanel) this._buildOutlineContent(); });
      // 名称编辑（存 _olCfg.names，与大纲面板双击重命名共用）
      const nmIn = row.querySelector('.ol-acc-nm');
      nmIn?.addEventListener('change', () => {
        if (!this._olCfg) this._olCfg = Object.assign({ on: true, n: 5, t: { b: 1, h: 1, o: 1 }, v: 'h', f: {}, names: {} }, this._loadOLCfg());
        const v = nmIn.value.trim();
        if (v && (!OL_DN[k] || v !== t(OL_DN[k]))) this._olCfg.names[k] = v; else delete this._olCfg.names[k];
        this._saveOLCfg();
        const nEl = row.querySelector('.ol-acc-n');
        if (nEl) nEl.textContent = v || this._olNm(k);
        if (this._outlinePanel) this._buildOutlineContent();
      });
      // 删除条目：内置键隐藏（olHidden），自定义键移除
      row.querySelector('.ol-acc-del').addEventListener('click', e => {
        e.stopPropagation();
        if (OL_DEF_COLORS[k]) {
          if (!this.settings.olHidden) this.settings.olHidden = {};
          this.settings.olHidden[k] = 1;
        }
        if (this.settings.olColors) delete this.settings.olColors[k];
        if (this.settings.olEmoji) delete this.settings.olEmoji[k];
        if (this.settings.olFgColors) delete this.settings.olFgColors[k];
        if (this.settings.olAccOpen) delete this.settings.olAccOpen[k];
        if (this._olCfg && this._olCfg.names) delete this._olCfg.names[k];
        this.saveSettings();
        this._saveOLCfg();
        if (this._outlinePanel) this._buildOutlineContent();
        row.remove();
      });
    });
    // 添加自定义高亮编码条目（HTML 类型）
    this.settingsPanel.querySelector('#minimap-oladd')?.addEventListener('click', () => {
      if (!this.settings.olColors) this.settings.olColors = {};
      let i = 1;
      while (this.settings.olColors['c' + i] || OL_DEF_COLORS['c' + i]) i++;
      this.settings.olColors['c' + i] = '#ffd966';
      this.saveSettings();
      rerenderPanel();
      if (this._outlinePanel) this._buildOutlineContent();
    });

    const followOffsetSection = this.settingsPanel.querySelector('#minimap-follow-offset-section');
    const followOffsetIcon = this.settingsPanel.querySelector('#minimap-follow-offset-icon');
    const updateFollowOffsetVisibility = () => {
      if (!followOffsetSection) return;
      followOffsetSection.style.display = inputs.piniconmode.value === 'follow' ? 'block' : 'none';
    };
    const updateFollowOffsetPreview = () => {
      if (!followOffsetIcon) return;
      const ox = parseInt(inputs.piniconfollowoffsetx.value) || 0;
      const oy = parseInt(inputs.piniconfollowoffsety.value) || 0;
      const previewW = 120, previewH = 80;
      const iconSize = 14;
      const cx = previewW / 2;
      const cy = previewH / 2;
      const scale = 0.5;
      const ix = cx + ox * scale - iconSize / 2;
      const iy = cy + oy * scale - iconSize / 2;
      followOffsetIcon.style.left = `${Math.max(0, Math.min(previewW - iconSize, ix))}px`;
      followOffsetIcon.style.top = `${Math.max(0, Math.min(previewH - iconSize, iy))}px`;
    };
    inputs.piniconmode.addEventListener('change', updateFollowOffsetVisibility);
    inputs.piniconfollowoffsetx.addEventListener('input', updateFollowOffsetPreview);
    inputs.piniconfollowoffsety.addEventListener('input', updateFollowOffsetPreview);
    updateFollowOffsetPreview();
    
    const resetBtn = this.settingsPanel.querySelector('#minimap-reset');
    resetBtn?.addEventListener('click', () => {
      // 恢复出厂预设：深拷贝避免嵌套对象与 DEFAULT_SETTINGS 共享引用
      this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      this.settings.floatingToggleVisible = true;
      this.saveSettings();
      // 记录当前 tab 与窗口位置，重绘后恢复
      const activeTab = this.settingsPanel.querySelector('.minimap-settings-tab.active')?.dataset.tab || 'misc';
      const pos = { left: this.settingsPanel.style.left, top: this.settingsPanel.style.top };
      if (this.floatingToggle) this.destroyFloatingToggle();
      // 整面板重绘：全部 tab 与高亮编码手风琴（含被隐藏/自定义条目）恢复预设
      this.closeSettingsPanel();
      this.showSettingsPanel({ preventDefault() {}, stopPropagation() {} });
      if (this.settingsPanel) {
        if (pos.left) { this.settingsPanel.style.left = pos.left; this.settingsPanel.style.top = pos.top; }
        if (activeTab !== 'misc') this.settingsPanel.querySelector(`.minimap-settings-tab[data-tab="${activeTab}"]`)?.click();
      }
      this.createFloatingToggle();
      this.applySettings();
      if (this._outlinePanel) this._buildOutlineContent();
      new Notice(t('restoredNotice'));
    });
    

    const floatingToggleBtn = this.settingsPanel.querySelector('#minimap-showfloatingtoggle');
    // Apply current floating toggle style to the settings preview span
    const applyBtnStyle = () => {
      const el = floatingToggleBtn;
      const activeStyle = this.getActiveFloatingStyle();
      const styleClass = activeStyle ? (activeStyle.styleClass || '') : (this.settings.floatingToggleStyleClass || '');
      const customStyle = activeStyle ? (activeStyle.customStyle || '') : (this.settings.floatingToggleCustomStyle || '');
      const hasCustomStyle = !!(styleClass || customStyle);
      const text = this.settings.floatingToggleText || 'search';
      const fontSize = this.settings.floatingToggleFontSize || 11;
      const opacity = this.settings.floatingToggleOpacity ?? 0.6;
      el.textContent = text;

      if (hasCustomStyle) {
        el.style.cssText = `cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:${fontSize}px;opacity:${opacity};white-space:nowrap;line-height:1;padding:0;`;
        el.className = '';
        if (styleClass) el.classList.add(`swift-match-floating-style-${styleClass}`);
        // Inject scoped CSS for preview
        let previewStyleEl = document.getElementById('swift-match-settings-preview-style');
        if (!previewStyleEl) {
          previewStyleEl = document.createElement('style');
          previewStyleEl.id = 'swift-match-settings-preview-style';
          document.head.appendChild(previewStyleEl);
        }
        if (customStyle) {
          let scoped = customStyle.replace(/\.([a-zA-Z_-][\w-]*)/g, '.swift-match-floating-style-$1');
          previewStyleEl.textContent = scoped;
          const firstClass = customStyle.match(/\.([a-zA-Z_-][\w-]*)/);
          if (firstClass && !styleClass) el.classList.add(`swift-match-floating-style-${firstClass[1]}`);
        }
      } else {
        el.className = '';
        el.style.cssText = `cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:${fontSize}px;opacity:${opacity};white-space:nowrap;line-height:1;padding:2px 10px;border-radius:9999px;background-color:rgba(240,100,120,0.08);box-shadow:inset 0 0 0 1px rgba(240,120,100,0.4),0 2px 10px rgba(0,0,0,0.05);font-weight:800;background:linear-gradient(135deg,#f2709c,#ff9472,#f5af19,#f2709c);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 6px rgba(240,100,120,0.7)) drop-shadow(0 0 12px rgba(245,150,50,0.5));animation:hp-twilight-move 3.5s linear infinite;`;
      }
    };
    applyBtnStyle();
    this._applySettingsBtnStyle = applyBtnStyle;
    floatingToggleBtn.addEventListener('click', () => {
      if (this.floatingToggle) {
        this.destroyFloatingToggle();
      } else {
        this.createFloatingToggle();
      }
    });


    // Render color schemes
    const colorSchemesContainer = this.settingsPanel.querySelector('#minimap-color-schemes');
    let _colorSchemePopup = null;
    const closeColorSchemePopup = () => {
      if (_colorSchemePopup) { _colorSchemePopup.remove(); _colorSchemePopup = null; }
    };
    const renderColorSchemes = () => {
      colorSchemesContainer.innerHTML = '';
      closeColorSchemePopup();
      const schemes = this.settings.pinColorSchemes || [];
      const presetClass = this.getCounterPresetClass().trim();

      const chipsRow = document.createElement('div');
      chipsRow.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:4px 0;';

      schemes.forEach((scheme, index) => {
        const chip = document.createElement('div');
        chip.style.cssText = `
          display:inline-flex;align-items:flex-end;cursor:pointer;
          position:relative;user-select:none;
          transition:box-shadow 0.15s ease, transform 0.1s ease;
          margin-top:14px;
          background:rgba(255,255,255,0.06);
          border-radius:8px;
          padding:2px 6px 2px 4px;
          backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
        `;
        // Text part with rounded underline (same as actual highlight)
        const textSpan = document.createElement('span');
        const matchOpacity = this.settings.matchOpacity ?? 0.6;
        const c = this.hexToRgba(scheme.borderColor, matchOpacity);
        textSpan.style.cssText = `
          margin:0 -0.2em;padding:0 0.2em;
          -webkit-box-decoration-break:clone;box-decoration-break:clone;
          background:radial-gradient(farthest-side,${c} 98%,#0000) bottom left,linear-gradient(${c} 0 0) bottom,radial-gradient(farthest-side,${c} 98%,#0000) bottom right;
          background-size:8px 8px,calc(100% - 8px) 8px;
          background-repeat:no-repeat;
          color:var(--text-normal);font-size:12px;line-height:1.4;
        `;
        textSpan.textContent = 'Preview';
        chip.appendChild(textSpan);

        // Counter badge (positioned like actual counter - above text)
        const counter = document.createElement('span');
        const counterFontSize = this.settings.counterSize;
        const counterColor = scheme.counterColor;
        let counterStyle = `
          position:absolute;
          top:var(--minimap-counter-top-offset, -10px);
          left:0;
          display:inline-flex;align-items:center;justify-content:center;
          font-size:${counterFontSize}px;line-height:1;
          padding:0px 2px;
          white-space:nowrap;
          pointer-events:none;
        `;
        if (presetClass === 'minimap-counter-glass') {
          const isDark = document.body.classList.contains('theme-dark');
          const glassCounterColor = isDark ? '#e0dcdc' : '#aba6a6';
          counterStyle += `background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.25);box-shadow:0 2px 8px rgba(0,0,0,0.12),inset 0 1px 0 rgba(255,255,255,0.2);text-shadow:0 1px 2px rgba(0,0,0,0.3);border-radius:4px;color:${glassCounterColor};`;
        } else if (presetClass === 'minimap-counter-outlined') {
          const outlinedBorder = scheme.borderLinked !== false ? scheme.borderColor : scheme.counterBgColor;
          const outlinedColor = scheme.counterLinked !== false ? outlinedBorder : scheme.counterColor;
          counterStyle += `background:transparent;border:1.5px solid ${outlinedBorder};border-radius:4px;color:${outlinedColor};text-shadow:none;`;
        }
        counter.style.cssText = counterStyle;
        counter.textContent = `${index + 1}/${schemes.length}`;
        chip.appendChild(counter);

        chip.addEventListener('mouseenter', () => { chip.style.boxShadow = '0 0 0 2px var(--interactive-accent)'; chip.style.transform = 'scale(1.04)'; });
        chip.addEventListener('mouseleave', () => { chip.style.boxShadow = 'none'; chip.style.transform = 'none'; });

        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          closeColorSchemePopup();

          const popup = document.createElement('div');
          popup.style.cssText = `
            position:absolute;z-index:10000;
            background:var(--background-secondary);
            border:1px solid var(--background-modifier-border);
            border-radius:8px;padding:10px 12px;
            box-shadow:0 4px 16px rgba(0,0,0,0.2);
            display:flex;flex-direction:column;gap:8px;
          `;
          const containerRect = colorSchemesContainer.getBoundingClientRect();
          const panelRect = this.settingsPanel.getBoundingClientRect();
          popup.style.top = `${containerRect.bottom - panelRect.top + 4}px`;
          popup.style.left = `${Math.max(0, containerRect.left - panelRect.left)}px`;

          const updateChipStyle = () => {
            const s = this.settings.pinColorSchemes[index];
            const newC = this.hexToRgba(s.borderColor, this.settings.matchOpacity ?? 0.6);
            textSpan.style.background = `radial-gradient(farthest-side,${newC} 98%,#0000) bottom left,linear-gradient(${newC} 0 0) bottom,radial-gradient(farthest-side,${newC} 98%,#0000) bottom right`;
            textSpan.style.backgroundSize = '8px 8px,calc(100% - 8px) 8px';
            textSpan.style.backgroundRepeat = 'no-repeat';
            // Update counter style based on preset
            const currentPreset = this.settings.counterStylePreset || 'glass';
            if (currentPreset === 'glass') {
              const isDark = document.body.classList.contains('theme-dark');
              counter.style.color = isDark ? '#e0dcdc' : '#aba6a6';
              counter.style.background = 'rgba(255,255,255,0.15)';
            } else {
              const newCounterBg = s.borderLinked !== false ? s.borderColor : s.counterBgColor;
              counter.style.borderColor = newCounterBg;
              counter.style.color = s.counterLinked !== false ? newCounterBg : s.counterColor;
            }
          };

          const refreshHighlights = () => {
            this.saveSettings();
            updateChipStyle();
            this.applyCounterStyles();
            if (this.currentSelection) this.highlightMatches();
          };

          const currentPreset = this.settings.counterStylePreset || 'glass';

          // Horizontal row
          const fieldsRow = document.createElement('div');
          fieldsRow.style.cssText = 'display:flex;align-items:center;gap:6px;';

          // 下划线 (always shown)
          const underlineGroup = document.createElement('div');
          underlineGroup.style.cssText = 'display:flex;align-items:center;gap:2px;';
          underlineGroup.innerHTML = `<label style="font-size:10px;min-width:28px;">${t('underline')}</label>`;
          const underlineInput = document.createElement('input');
          underlineInput.type = 'color';
          underlineInput.value = scheme.borderColor;
          underlineInput.style.cssText = 'width:32px;height:24px;padding:0;cursor:pointer;';
          underlineInput.addEventListener('input', (ev) => {
            this.settings.pinColorSchemes[index].borderColor = ev.target.value;
            refreshHighlights();
          });
          underlineGroup.appendChild(underlineInput);
          fieldsRow.appendChild(underlineGroup);

          if (currentPreset === 'glass') {
            // 毛玻璃: 下划线 only (计数颜色固定，深浅自动切换)
          } else if (currentPreset === 'outlined') {
            // 描边气泡: 下划线 | =/≠ | 气泡边框 | =/≠ | 计数文字
            // = / ≠ toggle between 下划线 and 气泡边框
            const borderLinked = scheme.borderLinked !== false;
            const borderToggle = document.createElement('span');
            borderToggle.textContent = borderLinked ? '=' : '≠';
            borderToggle.style.cssText = `
              font-size:13px;font-weight:bold;cursor:pointer;
              color:${borderLinked ? 'var(--interactive-accent)' : 'var(--text-muted)'};
              user-select:none;padding:0 2px;
              transition:color 0.15s ease;
            `;
            borderToggle.addEventListener('mouseenter', () => { borderToggle.style.color = 'var(--interactive-accent)'; });
            borderToggle.addEventListener('mouseleave', () => { borderToggle.style.color = this.settings.pinColorSchemes[index].borderLinked !== false ? 'var(--interactive-accent)' : 'var(--text-muted)'; });
            borderToggle.addEventListener('click', () => {
              const s = this.settings.pinColorSchemes[index];
              if (s.borderLinked !== false) {
                s.borderLinked = false;
                borderToggle.textContent = '≠';
                borderToggle.style.color = 'var(--text-muted)';
                borderInput.style.opacity = '1';
              } else {
                s.borderLinked = true;
                s.counterBgColor = s.borderColor;
                borderInput.value = s.borderColor;
                borderToggle.textContent = '=';
                borderToggle.style.color = 'var(--interactive-accent)';
                borderInput.style.opacity = '0.4';
                // Also sync counter if counterLinked
                if (s.counterLinked !== false) {
                  s.counterColor = s.counterBgColor;
                  colorInput.value = s.counterBgColor;
                }
                refreshHighlights();
              }
            });
            fieldsRow.appendChild(borderToggle);

            // 气泡边框
            const borderGroup = document.createElement('div');
            borderGroup.style.cssText = 'display:flex;align-items:center;gap:2px;';
            borderGroup.innerHTML = `<label style="font-size:10px;min-width:28px;">${t('bubbleBorder')}</label>`;
            const borderInput = document.createElement('input');
            borderInput.type = 'color';
            borderInput.value = borderLinked ? scheme.borderColor : scheme.counterBgColor;
            borderInput.style.cssText = 'width:32px;height:24px;padding:0;cursor:pointer;';
            if (borderLinked) borderInput.style.opacity = '0.4';
            borderInput.addEventListener('input', (ev) => {
              if (this.settings.pinColorSchemes[index].borderLinked !== false) return;
              this.settings.pinColorSchemes[index].counterBgColor = ev.target.value;
              if (this.settings.pinColorSchemes[index].counterLinked !== false) {
                this.settings.pinColorSchemes[index].counterColor = ev.target.value;
                colorInput.value = ev.target.value;
              }
              refreshHighlights();
            });
            borderGroup.appendChild(borderInput);
            fieldsRow.appendChild(borderGroup);

            // = / ≠ toggle between 气泡边框 and 计数文字
            const linked = scheme.counterLinked !== false;
            const toggleSpan = document.createElement('span');
            toggleSpan.textContent = linked ? '=' : '≠';
            toggleSpan.style.cssText = `
              font-size:13px;font-weight:bold;cursor:pointer;
              color:${linked ? 'var(--interactive-accent)' : 'var(--text-muted)'};
              user-select:none;padding:0 2px;
              transition:color 0.15s ease;
            `;
            toggleSpan.addEventListener('mouseenter', () => { toggleSpan.style.color = 'var(--interactive-accent)'; });
            toggleSpan.addEventListener('mouseleave', () => { toggleSpan.style.color = this.settings.pinColorSchemes[index].counterLinked !== false ? 'var(--interactive-accent)' : 'var(--text-muted)'; });
            toggleSpan.addEventListener('click', () => {
              const s = this.settings.pinColorSchemes[index];
              if (s.counterLinked !== false) {
                s.counterLinked = false;
                toggleSpan.textContent = '≠';
                toggleSpan.style.color = 'var(--text-muted)';
                colorInput.style.opacity = '1';
              } else {
                s.counterLinked = true;
                s.counterColor = s.counterBgColor;
                colorInput.value = s.counterBgColor;
                toggleSpan.textContent = '=';
                toggleSpan.style.color = 'var(--interactive-accent)';
                colorInput.style.opacity = '0.4';
                refreshHighlights();
              }
            });
            fieldsRow.appendChild(toggleSpan);

            // 计数文字
            const colorGroup = document.createElement('div');
            colorGroup.style.cssText = 'display:flex;align-items:center;gap:2px;';
            colorGroup.innerHTML = `<label style="font-size:10px;min-width:28px;">${t('counterTextColor')}</label>`;
            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = linked ? (borderLinked ? scheme.borderColor : scheme.counterBgColor) : scheme.counterColor;
            colorInput.style.cssText = 'width:32px;height:24px;padding:0;cursor:pointer;';
            if (linked) colorInput.style.opacity = '0.4';
            colorInput.addEventListener('input', (ev) => {
              if (this.settings.pinColorSchemes[index].counterLinked !== false) return;
              this.settings.pinColorSchemes[index].counterColor = ev.target.value;
              refreshHighlights();
            });
            colorGroup.appendChild(colorInput);
            fieldsRow.appendChild(colorGroup);

            // Update underlineInput to sync border when borderLinked
            underlineInput.addEventListener('input', (ev) => {
              if (this.settings.pinColorSchemes[index].borderLinked !== false) {
                this.settings.pinColorSchemes[index].counterBgColor = ev.target.value;
                borderInput.value = ev.target.value;
                if (this.settings.pinColorSchemes[index].counterLinked !== false) {
                  this.settings.pinColorSchemes[index].counterColor = ev.target.value;
                  colorInput.value = ev.target.value;
                }
              }
            });
          }

          popup.appendChild(fieldsRow);

          // Delete button
          const delRow = document.createElement('div');
          delRow.style.cssText = 'display:flex;justify-content:flex-end;margin-top:2px;';
          const deleteBtn = document.createElement('button');
          deleteBtn.style.cssText = 'font-size:11px;padding:2px 10px;cursor:pointer;color:var(--text-muted);border:1px solid var(--background-modifier-border);border-radius:4px;background:transparent;';
          deleteBtn.textContent = t('remove');
          deleteBtn.addEventListener('click', () => {
            this.settings.pinColorSchemes.splice(index, 1);
            this.saveSettings();
            closeColorSchemePopup();
            renderColorSchemes();
            if (this.currentSelection) this.highlightMatches();
          });
          delRow.appendChild(deleteBtn);
          popup.appendChild(delRow);

          this.settingsPanel.appendChild(popup);
          _colorSchemePopup = popup;
        });

        chipsRow.appendChild(chip);
      });

      // "+" add chip
      const addChip = document.createElement('div');
      addChip.style.cssText = `
        display:inline-flex;align-items:center;justify-content:center;
        width:30px;height:26px;border-radius:14px;cursor:pointer;
        border:2px dashed var(--text-muted);
        color:var(--text-muted);font-size:16px;font-weight:bold;
        transition:all 0.15s ease;user-select:none;
        background:rgba(255,255,255,0.06);
        backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
      `;
      addChip.textContent = '+';
      addChip.addEventListener('mouseenter', () => {
        addChip.style.borderColor = 'var(--interactive-accent)';
        addChip.style.color = 'var(--interactive-accent)';
        addChip.style.background = 'rgba(255,255,255,0.1)';
      });
      addChip.addEventListener('mouseleave', () => {
        addChip.style.borderColor = 'var(--text-muted)';
        addChip.style.color = 'var(--text-muted)';
        addChip.style.background = 'rgba(255,255,255,0.06)';
      });
      addChip.addEventListener('click', () => {
        const colors = ['#f44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722', '#795548'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        this.settings.pinColorSchemes.push({
          borderColor: randomColor,
          counterBgColor: randomColor,
          counterColor: '#aba6a6',
          borderLinked: true,
          counterLinked: true
        });
        this.saveSettings();
        renderColorSchemes();
        if (this.currentSelection) this.highlightMatches();
      });
      chipsRow.appendChild(addChip);

      colorSchemesContainer.appendChild(chipsRow);
    };

    // Close popup on click inside settings panel but outside popup
    this.settingsPanel.addEventListener('click', (e) => {
      if (_colorSchemePopup && !_colorSchemePopup.contains(e.target)) {
        closeColorSchemePopup();
      }
    });

    // Render counter style preset chips
    const counterPresetChips = this.settingsPanel.querySelector('#minimap-counter-preset-chips');
    const presetOptions = [
      { value: 'glass', label: t('counterPresetGlass') },
      { value: 'outlined', label: t('counterPresetOutlined') }
    ];
    presetOptions.forEach(opt => {
      const chip = document.createElement('div');
      const isActive = this.settings.counterStylePreset === opt.value;
      chip.style.cssText = `
        display:inline-flex;align-items:center;justify-content:center;
        padding:3px 10px;border-radius:14px;cursor:pointer;
        font-size:11px;user-select:none;
        border:1.5px solid ${isActive ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'};
        background:${isActive ? 'var(--interactive-accent)' : 'transparent'};
        color:${isActive ? 'var(--text-on-accent)' : 'var(--text-muted)'};
        transition:all 0.15s ease;
      `;
      chip.textContent = opt.label;
      chip.addEventListener('click', () => {
        this.settings.counterStylePreset = opt.value;
        this.saveSettings();
        this.applyCounterStyles();
        renderColorSchemes();
        // Force refresh all decorations
        this.clearHighlights();
        this.showPinnedDecorations();
        if (this.currentSelection) this.highlightMatches();
        // Update chip styles
        counterPresetChips.querySelectorAll(':scope > div').forEach((c, i) => {
          const active = presetOptions[i].value === opt.value;
          c.style.borderColor = active ? 'var(--interactive-accent)' : 'var(--background-modifier-border)';
          c.style.background = active ? 'var(--interactive-accent)' : 'transparent';
          c.style.color = active ? 'var(--text-on-accent)' : 'var(--text-muted)';
        });
      });
      chip.addEventListener('mouseenter', () => {
        if (this.settings.counterStylePreset !== opt.value) {
          chip.style.borderColor = 'var(--text-muted)';
        }
      });
      chip.addEventListener('mouseleave', () => {
        if (this.settings.counterStylePreset !== opt.value) {
          chip.style.borderColor = 'var(--background-modifier-border)';
        }
      });
      counterPresetChips.appendChild(chip);
    });

    // Render pinned list
    const pinnedListContainer = this.settingsPanel.querySelector('#minimap-pinned-list');
    const renderPinnedList = () => {
      pinnedListContainer.innerHTML = '';
      const pinnedItems = this.savedMatchLists.filter(m => m.pinned);
      const footerInfoEl = this.settingsPanel?.querySelector('#minimap-footer-info');
      if (footerInfoEl) {
        const activeTab = this.settingsPanel.querySelector('.minimap-settings-tab.active');
        if (activeTab && activeTab.dataset.tab === 'match') {
          footerInfoEl.textContent = pinnedItems.length > 0 ? `${t('pinnedMatches')}: ${pinnedItems.length}` : t('noPinnedLong');
        }
      }
      if (pinnedItems.length === 0) {
        pinnedListContainer.innerHTML = `<div style="color:var(--sm-sub);font-size:12px;padding:8px;">${t('noPinned')}</div>`;
        return;
      }
      // Group by file name
      const fileGroups = new Map();
      pinnedItems.forEach(item => {
        const fileName = item.fileName || t('unknownFile');
        if (!fileGroups.has(fileName)) {
          fileGroups.set(fileName, []);
        }
        fileGroups.get(fileName).push(item);
      });
      fileGroups.forEach((items, fileName) => {
        const groupHeader = document.createElement('div');
        groupHeader.style.cssText = 'font-size:11px;color:var(--text-muted);padding:4px 0 2px;font-weight:600;display:flex;align-items:center;gap:6px;';
        const headerSpan = document.createElement('span');
        headerSpan.style.cssText = 'flex:1;';
        headerSpan.textContent = fileName;
        const clearBtn = document.createElement('button');
        clearBtn.style.cssText = 'font-size:10px;padding:0 4px;cursor:pointer;color:var(--text-muted);flex-shrink:0;';
        clearBtn.title = t('clearDocPinned');
        clearBtn.textContent = t('clear');
        clearBtn.addEventListener('click', () => {
          this.savedMatchLists = this.savedMatchLists.filter(item => !(item.fileName === fileName && item.pinned));
          this.saveListData();
          this.clearHighlights();
          this.showPinnedDecorations();
          if (this.currentSelection) {
            this.highlightMatches();
          }
          renderPinnedList();
        });
        groupHeader.appendChild(headerSpan);
        groupHeader.appendChild(clearBtn);
        pinnedListContainer.appendChild(groupHeader);
        items.forEach(item => {
          const colorScheme = this.getPinnedColorScheme(item);
          const row = document.createElement('div');
          row.className = 'minimap-settings-row';
          row.style.alignItems = 'center';
          row.style.gap = '6px';
          row.style.padding = '4px 0 4px 12px';
          const colorDot = document.createElement('span');
          colorDot.style.cssText = `width:12px;height:12px;border-radius:2px;background:${colorScheme.borderColor};flex-shrink:0;`;
          const label = document.createElement('span');
          label.style.cssText = 'flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
          label.title = item.selection;
          label.textContent = item.selection;
          const removeBtn = document.createElement('button');
          removeBtn.style.cssText = 'font-size:11px;padding:0 4px;cursor:pointer;color:var(--text-muted);';
          removeBtn.title = t('remove');
          removeBtn.textContent = '×';
          removeBtn.addEventListener('click', () => {
            this.removePinnedSelection(item.selection);
            renderPinnedList();
          });
          row.appendChild(colorDot);
          row.appendChild(label);
          row.appendChild(removeBtn);
          pinnedListContainer.appendChild(row);
        });
      });
    };

    // Bind clear all counts button
    const clearAllCountsBtn = this.settingsPanel.querySelector('#minimap-clearallcounts');
    if (clearAllCountsBtn) {
      clearAllCountsBtn.addEventListener('click', () => {
        this.savedMatchLists = this.savedMatchLists.filter(item => !item.pinned);
        this.saveListData();
        this.clearHighlights();
        if (this.currentSelection) {
          this.highlightMatches();
        }
        renderPinnedList();
      });
    }

    renderColorSchemes();
    renderPinnedList();

    // 初始化折叠功能
    this.initCollapsibleSections();

    // 搜索栏过滤
    this._smAccordion = false;
    const searchInput = this.settingsPanel.querySelector('#minimap-settings-search');
    const accordionChip = this.settingsPanel.querySelector('#minimap-accordion');
    const footerInfo = this.settingsPanel.querySelector('#minimap-footer-info');

    const filterSettings = () => {
      const q = (searchInput?.value || '').trim().toLowerCase();
      const activeTabContent = this.settingsPanel.querySelector('.minimap-settings-tab-content.active');
      if (!activeTabContent) return;
      const sections = activeTabContent.querySelectorAll('.minimap-settings-section');
      sections.forEach(sec => {
        let anyMatch = !q;
        const rows = sec.querySelectorAll('.minimap-settings-row, .minimap-settings-block');
        rows.forEach(r => {
          const m = !q || r.textContent.toLowerCase().includes(q) || (r.title || '').includes(q);
          r.style.display = m ? '' : 'none';
          if (m) anyMatch = true;
        });
        const titleMatch = !q || sec.querySelector('.minimap-settings-section-title')?.textContent.toLowerCase().includes(q);
        sec.style.display = (anyMatch || titleMatch) ? '' : 'none';
        if (q && anyMatch) sec.classList.remove('collapsed');
      });
    };

    if (searchInput) {
      searchInput.addEventListener('input', filterSettings);
    }

    if (accordionChip) {
      accordionChip.addEventListener('click', () => {
        this._smAccordion = !this._smAccordion;
        accordionChip.classList.toggle('on', this._smAccordion);
        // 手风琴模式：只展开第一个
        if (this._smAccordion) {
          const activeTabContent = this.settingsPanel.querySelector('.minimap-settings-tab-content.active');
          if (activeTabContent) {
            const secs = activeTabContent.querySelectorAll('.minimap-settings-section');
            let seen = false;
            secs.forEach(s => {
              if (s.style.display === 'none') return;
              if (!seen) { s.classList.remove('collapsed'); seen = true; }
              else s.classList.add('collapsed');
            });
          }
        }
      });
    }

    // 切换 tab 时更新搜索 placeholder 和 footer info
    this.settingsPanel.querySelectorAll('.minimap-settings-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.placeholder = tab.dataset.tab === 'match' ? t('searchPinned') : t('searchSettings');
        }
        // 恢复所有 section 显示
        this.settingsPanel.querySelectorAll('.minimap-settings-section, .minimap-settings-row, .minimap-settings-block').forEach(el => {
          el.style.display = '';
        });
        if (footerInfo) {
          if (tab.dataset.tab === 'match') {
            const n = this.savedMatchLists.filter(m => m.pinned).length;
            footerInfo.textContent = n > 0 ? `${t('pinnedMatches')}: ${n}` : t('noPinnedLong');
          } else {
            footerInfo.textContent = t('autoSave');
          }
        }
      });
    });

  }

  closeSettingsPanel() {
    if (this._settingsPanelResizeObserver) {
      this._settingsPanelResizeObserver.disconnect();
      this._settingsPanelResizeObserver = null;
    }
    if (this._settingsPanelDragCleanup) {
      this._settingsPanelDragCleanup();
      this._settingsPanelDragCleanup = null;
    }
    if (this.settingsPanel) {
      this.settingsPanel.remove();
      this.settingsPanel = null;
    }
    this._applySettingsBtnStyle = null;
    // Clean up settings preview style
    const previewStyleEl = document.getElementById('swift-match-settings-preview-style');
    if (previewStyleEl) previewStyleEl.remove();
    // 设置面板关闭：移除 minimap 区间常显遮罩与强制展开
    this._mmZonePinned = false;
    this.minimapContainer?.classList.remove('mm-zone-preview');
    this._mmHideZoneHint?.();
  }

  // peer.onShow 的内容构建：复用缓存 / pin 词 / 最近搜索（不处理显隐与定位）
  _showMatchListContent() {
    this._listTriggerElement = null;
    const hasCachedMatches = (this.settings.enableSelectionMatch && this._cachedMatchList && this._pendingSearchText) ||
      (this._listPinnedSearchText && this._pinnedWordFileMap);
    if (hasCachedMatches) {
      if (this._listPinnedSearchText && this._pinnedWordFileMap) {
        this._pendingShowList = { searchText: this._listPinnedSearchText, matchCount: this._pinnedWordMatchCount || 0 };
        this._isListVisible = true;
        this._exhaustiveSearchDone = true;
        this.renderMatchList(this._pinnedWordFileMap, this._pinnedWordMatchCount || 0, false);
        this._listShownFromHover = true;
      } else {
        this.showMatchListFromFloatingToggle();
      }
    } else if (this._recentSearches.length > 0) {
      const recentTerm = this._recentSearches[0];
      const cached = this._recentSearchCaches[recentTerm];
      if (cached && cached.fileMap && cached.fileMap.size > 0) {
        this._pendingShowList = { searchText: recentTerm, matchCount: cached.matchCount };
        this._cachedMatchList = cached.fileMap;
        this._cachedMatchListKey = recentTerm;
        this._pendingMatchCount = cached.matchCount;
        this._pendingSearchText = recentTerm;
        this._isListVisible = true;
        this._exhaustiveSearchDone = true;
        this.renderMatchList(cached.fileMap, cached.matchCount, false);
        this._listShownFromHover = true;
      } else {
        this.showRecentSearchList();
        this._listShownFromHover = true;
      }
    } else {
      this.showRecentSearchList();
      this._listShownFromHover = true;
    }
  }

  createFloatingToggle() {
    // 已存在：调用即关闭（保持设置页预览开关的旧契约）
    if (this.floatingToggle) {
      this.destroyFloatingToggle();
      return;
    }

    // ---- 搜索输入框：渲染时会被移入 match list header ----
    const searchBox = document.createElement('input');
    searchBox.className = 'minimap-floating-search-box';
    searchBox.type = 'text';
    searchBox.placeholder = t('searchPlaceholder');
    searchBox.style.cssText = `width:180px;height:24px;border:1px solid var(--background-modifier-border);border-radius:4px;background:var(--background-secondary);color:var(--text-normal);font-size:12px;padding:0 8px;outline:none;box-sizing:border-box;`;
    searchBox.addEventListener('mousedown', e => e.stopPropagation());
    searchBox.addEventListener('input', () => {
      if (!this.settings.searchOnInput) return;
      if (this._searchDebounceTimer) clearTimeout(this._searchDebounceTimer);
      this._searchDebounceTimer = setTimeout(() => {
        const query = searchBox.value.trim();
        if (query) {
          this.currentSelection = query;
          this._exhaustiveSearchDone = false;
          this._listUserDismissed = false;
          this._keepListVisible = true;
          this.showMatchList(query, 0);
          this._keepListVisible = false;
        }
      }, 300);
    });
    searchBox.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this._searchDebounceTimer) clearTimeout(this._searchDebounceTimer);
        const query = searchBox.value.trim();
        if (query) {
          this.currentSelection = query;
          this._exhaustiveSearchDone = false;
          this._listUserDismissed = false;
          this._keepListVisible = true;
          this.showMatchList(query, 0);
          this._keepListVisible = false;
        }
      } else if (e.key === 'Escape') {
        searchBox.value = '';
        searchBox.blur();
      }
    });
    this.floatingSearchBox = searchBox;
    
    // ---- chip 按钮：att 住在列表 dock，det 独立悬浮 ----
    const toggle = document.createElement('div');
    toggle.className = 'minimap-floating-toggle att';

    const textEl = document.createElement('span');
    textEl.className = 'swift';
    textEl.textContent = this.settings.floatingToggleText || 'search';
    toggle.appendChild(textEl);
    this.floatingToggle = toggle;
    this.floatingToggleText = textEl;

    // Ctrl+滚轮调字号 / Alt+滚轮调透明度
    toggle.addEventListener('wheel', e => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        let newSize = (this.settings.floatingToggleSize || 20) + delta;
        newSize = Math.max(10, Math.min(40, newSize));
        this.settings.floatingToggleSize = newSize;
        textEl.style.fontSize = `${Math.max(10, newSize * 0.55)}px`;
        this.settings.floatingToggleFontSize = Math.max(10, newSize * 0.55);
        this.saveSettings();
      } else if (e.altKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        let newOpacity = (this.settings.floatingToggleOpacity || 0.6) + delta;
        newOpacity = Math.max(0.1, Math.min(1, newOpacity));
        this.settings.floatingToggleOpacity = newOpacity;
        toggle.style.opacity = newOpacity.toString();
        this.saveSettings();
      }
    }, { passive: false });

    this.settings.floatingToggleVisible = true;
    this.saveSettings();
    this.updateFloatingToggleStyle();
    this._ensureSearchPeer();
  }

  destroyFloatingToggle() {
    if (this._searchPeer) {
      this._searchPeer.destroy();
      this._searchPeer = null;
    }
    if (this.floatingToggle) {
      this.floatingToggle.remove();
      this.floatingToggle = null;
    }
    this.floatingToggleText = null;
    this.floatingSearchBox = null;
    this._matchListPinned = false;
    this.settings.floatingToggleVisible = false;
    this.saveSettings();
  }

  // matchList 重建后：销毁旧 peer，按现有 chip 重新绑定
  _rebindSearchPeer() {
    if (!this.matchList) return;
    if (this._searchPeer) {
      this._searchPeer.destroy();
      this._searchPeer = null;
    }
    this._ensureSearchPeer();
  }

  _ensureSearchPeer() {
    if (this._searchPeer || !this.matchList || !this.floatingToggle) return;
    const peer = new FloatingPeer(this, {
      id: 'search',
      winEl: this.matchList,
      chipEl: this.floatingToggle,
      defaultW: this.settings.matchListWidth || 280,
      defaultH: this.settings.matchListHeight || 400,
      minW: 190,
      minH: 80,
      allowTopOverflow: false,

      rzSelector: '.minimap-match-list-rz',
      getDock: () => this._ensureMatchListDock(),
      isInteractive: t => !!t.closest('button,input,a,.chip,.minimap-floating-search-box,.minimap-match-list-item,.minimap-match-list-rz,.minimap-floating-toggle,.minimap-match-list-header,.minimap-match-list-recent,.swift-match-favorites-section,.minimap-match-list-save-btn,.swift-match-item,.swift-match-group-body,.swift-match-tabs-wrap,.swift-match-tabs,.swift-match-panel,.swift-match-list-vert,.swift-match-chips'),
      onShow: (anchorEl) => {
        this._listUserDismissed = false;
        const kw = anchorEl?.dataset?.keyword;
        if (kw && this._floatingKeywordButtons.some(b => b.wrapper === anchorEl)) {
          this._showKeywordList(anchorEl, kw);
        } else {
          this._showMatchListContent();
        }
        this.matchList.style.display = 'flex';
      },
      onHide: () => this._hideMatchListNow(),
      onPin: () => { this._matchListPinned = true; },
      onUnpin: () => {
        this._matchListPinned = false;
        if (this._searchPeer?.mode === 'detached' && this.floatingToggle) {
          this.floatingToggle.style.opacity = (this.settings.floatingToggleOpacity ?? 0.6).toString();
        }
      },
      onResize: (w, h) => {
        this.matchListSize.width = w;
        this.matchListSize.height = h;
        this.settings.matchListWidth = w;
        this.settings.matchListHeight = h;
        this.saveListData();
      },
      keepEls: () => {
        const els = [];
        if (this._mmZone === 'search') {
          if (this.minimapContainer) els.push(this.minimapContainer);
          if (this.previewPanel && this.previewPanel.style.display !== 'none') els.push(this.previewPanel);
        }
        for (const b of this._floatingKeywordButtons) els.push(b.wrapper);
        return els;
      },
      migrate: () => ({ win: { w: this.settings.matchListWidth || 280, h: this.settings.matchListHeight || 400 }, positioned: false })
    });
    this._searchPeer = peer;

    // 恢复 pinned：构造函数只加了 class，需要重建内容并应用几何
    if (peer.mode === 'pinned') {
      peer.opts.onShow?.(null);
      peer.applyGeo();
    }
  }

  // 关键词锚点触发的内容（peer onShow 分支）
  _showKeywordList(anchorEl, keyword) {
    this._listTriggerElement = anchorEl;
    const cached = this._recentSearchCaches[keyword];
    if (cached && cached.fileMap && cached.fileMap.size > 0) {
      this._cachedMatchList = cached.fileMap;
      this._cachedMatchListKey = keyword;
      this._pendingMatchCount = cached.matchCount;
      this._pendingShowList = { searchText: keyword, matchCount: cached.matchCount };
      this._isListVisible = true;
      this._exhaustiveSearchDone = true;
      this.renderMatchList(cached.fileMap, cached.matchCount, false);
      this._listShownFromHover = true;
    } else {
      this.currentSelection = keyword;
      this.highlightMatches();
    }
  }

  // peer.onHide：保存滚动 / 列表状态后真正隐藏
  _hideMatchListNow() {
    if (!this.matchList || this.matchList.style.display === 'none') return;
    const listContainer = this.matchList.querySelector('.minimap-match-list-container');
    if (listContainer) {
      const currentTerm = this._pendingShowList?.searchText || this._pendingSearchText;
      if (currentTerm) this._listScrollPositions[currentTerm] = listContainer.scrollTop;
      this._matchListScrollTop = listContainer.scrollTop;
    }
    const savedTerm = this._pendingShowList?.searchText || this._pendingSearchText;
    if (savedTerm) {
      this._lastListSearchTerm = savedTerm;
      this._lastListFileMap = this._cachedMatchList;
      this._lastListMatchCount = this._pendingMatchCount;
    }
    const favSection = this.matchList.querySelector('.swift-match-favorites-section');
    if (favSection) this._favSectionScrollTop = favSection.scrollTop;
    this.saveListData();
    this.matchList.style.display = 'none';
    this._pendingListClose = false;
    this._isListVisible = false;
    this._listUserDismissed = true;
    this._searchGeneration++;
    this._pendingShowList = null;
    this._listShownFromHover = false;
    this._listTriggerElement = null;
    this.listFixedPosition.left = null;
    this.listFixedPosition.top = null;
    if (this.floatingSearchBox) this.floatingSearchBox.value = '';
  }

  updateFloatingToggleStyle() {
    if (!this.floatingToggle || !this.floatingToggleText) return;
    const textEl = this.floatingToggleText;
    textEl.textContent = this.settings.floatingToggleText || 'search';
    textEl.style.fontSize = `${this.settings.floatingToggleFontSize || 11}px`;
    // chip 恒常显示，不再用删除线表示开关（开关已移至窗口标题栏）
    if (!this.settings.enableSelectionMatch) {
      this._listShownFromHover = false;
    }
    if (this._cachedMatchList && this._cachedMatchList.size > 0) {
      this.updateFloatingToggleBadge(this._cachedMatchList.size, this._pendingMatchCount || 0);
    }
    if (this._searchPeer?.mode === 'detached') {
      this.floatingToggle.style.opacity = (this.settings.floatingToggleOpacity ?? 0.6).toString();
    }
  }

  // 划词搜索开关：dock 内 chip，样式与大纲"手风琴模式"一致（.chip / .chip.on）
  _createSelectionMatchToggle() {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = 'auto';
    chip.title = t('enableSelectionMatch');
    const paint = () => chip.classList.toggle('on', !!this.settings.enableSelectionMatch);
    paint();
    chip.addEventListener('click', e => {
      e.stopPropagation();
      this.settings.enableSelectionMatch = !this.settings.enableSelectionMatch;
      this.saveSettings();
      paint();
      if (!this.settings.enableSelectionMatch) {
        this.currentSelection = '';
        this.clearHighlights();
      } else if (this.currentSelection) {
        this.highlightMatches();
      }
      this.updateFloatingToggleStyle();
    });
    return chip;
  }

  showFloatingContextMenu(x, y) {
    this.closeFloatingContextMenu();

    const menu = document.createElement('div');
    menu.className = 'swift-match-context-menu';
    menu.style.cssText = `
      position: fixed;
      z-index: 100001;
      background: var(--background-secondary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      padding: 4px 0;
      min-width: 140px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      font-size: 12px;
    `;

    const items = [

      { label: t('settings'), action: () => { this.closeFloatingContextMenu(); const mockEvent = { clientX: x, clientY: y, preventDefault: () => {}, stopPropagation: () => {} }; this.showSettingsPanel(mockEvent); } },
      { type: 'separator' },
      { label: t('hideFloating'), action: () => { this.closeFloatingContextMenu(); this.destroyFloatingToggle(); } }
    ];

    items.forEach(item => {
      if (item.type === 'separator') {
        const sep = document.createElement('div');
        sep.style.cssText = 'height:1px;background:var(--background-modifier-border);margin:4px 8px;';
        menu.appendChild(sep);
        return;
      }
      const el = document.createElement('div');
      el.textContent = item.label;
      el.style.cssText = `
        padding: 6px 16px;
        cursor: pointer;
        color: var(--text-normal);
        white-space: nowrap;
        border-radius: 3px;
        margin: 0 4px;
      `;
      el.addEventListener('mouseenter', () => { el.style.background = 'var(--background-modifier-hover)'; });
      el.addEventListener('mouseleave', () => { el.style.background = ''; });
      el.addEventListener('click', (e) => { e.stopPropagation(); item.action(); });
      menu.appendChild(el);
    });

    // Position menu
    const menuW = 160, menuH = items.length * 32;
    let left = x, top = y;
    if (left + menuW > window.innerWidth) left = window.innerWidth - menuW - 8;
    if (top + menuH > window.innerHeight) top = window.innerHeight - menuH - 8;
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;

    document.body.appendChild(menu);
    this._floatingContextMenu = menu;

    setTimeout(() => {
      this._floatingContextMenuCloser = (e) => {
        if (!menu.contains(e.target)) this.closeFloatingContextMenu();
      };
      document.addEventListener('mousedown', this._floatingContextMenuCloser);
    }, 50);
  }

  closeFloatingContextMenu() {
    if (this._floatingContextMenuCloser) {
      document.removeEventListener('mousedown', this._floatingContextMenuCloser);
      this._floatingContextMenuCloser = null;
    }
    if (this._floatingContextMenu) {
      this._floatingContextMenu.remove();
      this._floatingContextMenu = null;
    }
  }

  showFloatingEditPanel() {
    this.closeFloatingEditPanel();

    const { Modal } = require('obsidian');
    const modal = new Modal(this.app);
    modal.titleEl.textContent = t('editTitle');
    modal.contentEl.addClass('swift-match-edit-modal');

    const currentLabel = this.settings.floatingToggleText || 'search';

    // 横向排列：显示文字、字体大小、水平内边距、垂直内边距、透明度
    const inlineRow = modal.contentEl.createDiv();
    inlineRow.style.cssText = 'display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;';

    const labelDiv = inlineRow.createDiv();
    labelDiv.style.cssText = 'flex:1;min-width:100px;';
    const labelName = labelDiv.createEl('label');
    labelName.textContent = t('toggleText');
    labelName.style.cssText = 'display:block;margin-bottom:4px;font-weight:bold;font-size:0.9em;';
    const labelInput = labelDiv.createEl('input');
    labelInput.type = 'text';
    labelInput.placeholder = 'search';
    labelInput.value = currentLabel;
    labelInput.style.cssText = 'width:100%;padding:8px;border:1px solid var(--background-modifier-border);border-radius:4px;background:var(--background-primary);color:var(--text-normal);font-size:14px;';

    const fontSizeDiv = inlineRow.createDiv();
    fontSizeDiv.style.cssText = 'min-width:70px;';
    const fontSizeLabel = fontSizeDiv.createEl('label');
    fontSizeLabel.textContent = t('toggleFontSize');
    fontSizeLabel.style.cssText = 'display:block;margin-bottom:4px;font-weight:bold;font-size:0.9em;';
    const fontSizeInput = fontSizeDiv.createEl('input');
    fontSizeInput.type = 'number';
    fontSizeInput.min = 8; fontSizeInput.max = 24; fontSizeInput.step = 1;
    fontSizeInput.value = this.settings.floatingToggleFontSize || 11;
    fontSizeInput.style.cssText = 'width:70px;padding:8px;border:1px solid var(--background-modifier-border);border-radius:4px;background:var(--background-primary);color:var(--text-normal);font-size:14px;';

    const padHDiv = inlineRow.createDiv();
    padHDiv.style.cssText = 'min-width:70px;';
    const padHLabel = padHDiv.createEl('label');
    padHLabel.textContent = t('togglePaddingH');
    padHLabel.style.cssText = 'display:block;margin-bottom:4px;font-weight:bold;font-size:0.9em;';
    const padHInput = padHDiv.createEl('input');
    padHInput.type = 'number'; padHInput.min = 0; padHInput.max = 40; padHInput.step = 1;
    padHInput.value = this.settings.floatingTogglePaddingH ?? 10;
    padHInput.style.cssText = 'width:70px;padding:8px;border:1px solid var(--background-modifier-border);border-radius:4px;background:var(--background-primary);color:var(--text-normal);font-size:14px;';

    const padVDiv = inlineRow.createDiv();
    padVDiv.style.cssText = 'min-width:70px;';
    const padVLabel = padVDiv.createEl('label');
    padVLabel.textContent = t('togglePaddingV');
    padVLabel.style.cssText = 'display:block;margin-bottom:4px;font-weight:bold;font-size:0.9em;';
    const padVInput = padVDiv.createEl('input');
    padVInput.type = 'number'; padVInput.min = 0; padVInput.max = 20; padVInput.step = 1;
    padVInput.value = this.settings.floatingTogglePaddingV ?? 2;
    padVInput.style.cssText = 'width:70px;padding:8px;border:1px solid var(--background-modifier-border);border-radius:4px;background:var(--background-primary);color:var(--text-normal);font-size:14px;';

    const opacityDiv = inlineRow.createDiv();
    opacityDiv.style.cssText = 'min-width:70px;';
    const opacityLabel = opacityDiv.createEl('label');
    opacityLabel.textContent = t('toggleOpacity');
    opacityLabel.style.cssText = 'display:block;margin-bottom:4px;font-weight:bold;font-size:0.9em;';
    const opacityInput = opacityDiv.createEl('input');
    opacityInput.type = 'number'; opacityInput.min = 0.1; opacityInput.max = 1; opacityInput.step = 0.05;
    opacityInput.value = this.settings.floatingToggleOpacity ?? 0.6;
    opacityInput.style.cssText = 'width:70px;padding:8px;border:1px solid var(--background-modifier-border);border-radius:4px;background:var(--background-primary);color:var(--text-normal);font-size:14px;';

    // 自定义样式区域：一个CSS文本框 + 点击选择预览
    const stylesHeader = modal.contentEl.createDiv();
    stylesHeader.style.cssText = 'display:flex;align-items:baseline;gap:8px;margin-bottom:4px;';
    const stylesTitle = stylesHeader.createEl('label');
    stylesTitle.textContent = t('customStyle');
    stylesTitle.style.cssText = 'font-weight:bold;font-size:0.9em;';
    const stylesLink = stylesHeader.createEl('a');
    stylesLink.textContent = t('getMoreStyles');
    stylesLink.href = 'https://github.com/dlsdgj/obsidian-regex-css-highlighter/discussions/1';
    stylesLink.target = '_blank';
    stylesLink.style.cssText = 'font-size:0.75em;color:var(--text-accent);';

    const stylesHint = modal.contentEl.createEl('div');
    stylesHint.textContent = t('styleHint');
    stylesHint.style.cssText = 'font-size:0.75em;color:var(--text-muted);margin-bottom:4px;';

    // 注入预览用的style标签
    let previewStyleEl = document.getElementById('swift-match-preview-style');
    if (!previewStyleEl) {
      previewStyleEl = document.createElement('style');
      previewStyleEl.id = 'swift-match-preview-style';
      document.head.appendChild(previewStyleEl);
    }

    // CSS文本框
    const cssTextarea = modal.contentEl.createEl('textarea');
    cssTextarea.value = this.settings.floatingToggleCustomStyle || '';
    cssTextarea.placeholder = `.Swift {\n  background: transparent;\n  color: #534ab7;\n  border: 1px dashed #7f77dd;\n  border-radius: 3px;\n  padding: 1px 5px;\n}\n\n.Swift2 {\n  background: #e8f5e9;\n  color: #2e7d32;\n  border-radius: 12px;\n  padding: 2px 12px;\n}`;
    cssTextarea.rows = 10;
    cssTextarea.style.cssText = 'width:100%;padding:8px;border:1px solid var(--background-modifier-border);border-radius:4px;background:var(--background-primary);color:var(--text-normal);font-size:12px;font-family:monospace;resize:vertical;line-height:1.5;margin-bottom:8px;';

    // 预览选择区域
    const previewAreaLabel = modal.contentEl.createEl('div');
    previewAreaLabel.textContent = t('preview') + ' - ' + t('clickToSelect') + '：';
    previewAreaLabel.style.cssText = 'font-weight:600;margin-bottom:6px;font-size:0.9em;';

    const previewArea = modal.contentEl.createDiv();
    previewArea.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;padding:12px;border-radius:6px;border:1px solid var(--background-modifier-border);background:var(--background-secondary);';

    // 当前选中的class
    let selectedClass = this.settings.floatingToggleStyleClass || '';

    // 解析CSS中的class名
    const parseCSSClasses = (cssText) => {
      const classes = [];
      const regex = /\.([a-zA-Z0-9_-]+)(?:::[\w-]+|:[\w-]+)*\s*\{/g;
      let match;
      const seen = new Set();
      while ((match = regex.exec(cssText)) !== null) {
        const cls = match[1];
        if (!seen.has(cls)) {
          seen.add(cls);
          classes.push(cls);
        }
      }
      return classes;
    };

    // 构建预览
    const buildPreviews = () => {
      previewArea.empty();
      const cssText = cssTextarea.value;
      // 作用域化CSS并注入预览
      let scoped = cssText.replace(/\.([a-zA-Z_-][\w-]*)/g, '.swift-match-floating-style-$1');
      previewStyleEl.textContent = scoped;

      const classes = parseCSSClasses(cssText);
      if (classes.length === 0) {
        const hint = previewArea.createEl('div');
        hint.textContent = t('noStyles');
        hint.style.cssText = 'color:var(--text-muted);font-size:12px;';
        return;
      }

      classes.forEach(cls => {
        const wrapper = previewArea.createDiv();
        wrapper.style.cssText = `
          display:flex;flex-direction:column;align-items:center;gap:4px;
          cursor:pointer;padding:6px;border-radius:6px;
          border:2px solid ${cls === selectedClass ? 'var(--interactive-accent)' : 'transparent'};
          transition:border-color 0.15s;
        `;
        wrapper.addEventListener('mouseenter', () => {
          if (cls !== selectedClass) wrapper.style.borderColor = 'var(--background-modifier-border)';
        });
        wrapper.addEventListener('mouseleave', () => {
          wrapper.style.borderColor = cls === selectedClass ? 'var(--interactive-accent)' : 'transparent';
        });

        const previewEl = wrapper.createEl('div');
        previewEl.className = `swift-match-floating-style-${cls}`;
        previewEl.textContent = labelInput.value.trim() || currentLabel;
        previewEl.style.cssText = 'position:static;cursor:pointer;z-index:auto;opacity:1;';
        wrapper.appendChild(previewEl);

        const nameEl = wrapper.createEl('div');
        nameEl.textContent = `.${cls}`;
        nameEl.style.cssText = 'font-size:10px;color:var(--text-muted);font-family:monospace;';

        // 默认标记
        if (cls === selectedClass) {
          const defaultBadge = wrapper.createEl('div');
          defaultBadge.textContent = t('defaultStyle');
          defaultBadge.style.cssText = 'font-size:9px;color:var(--interactive-accent);font-weight:600;';
        }

        wrapper.addEventListener('click', () => {
          selectedClass = cls;
          buildPreviews();
        });

        previewArea.appendChild(wrapper);
      });
    };

    buildPreviews();

    // 实时更新预览
    const updatePreview = () => { buildPreviews(); };
    labelInput.addEventListener('input', updatePreview);
    cssTextarea.addEventListener('input', updatePreview);

    // 按钮容器
    const buttonContainer = modal.contentEl.createEl('div');
    buttonContainer.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;';
    const cancelBtn = buttonContainer.createEl('button');
    cancelBtn.textContent = t('cancel');
    cancelBtn.style.padding = '6px 16px';
    cancelBtn.addEventListener('click', () => modal.close());
    const confirmBtn = buttonContainer.createEl('button');
    confirmBtn.textContent = t('confirm');
    confirmBtn.style.cssText = 'padding:6px 16px;background-color:var(--interactive-accent);color:white;border:none;border-radius:4px;cursor:pointer;';
    confirmBtn.addEventListener('click', async () => {
      this.settings.floatingToggleText = labelInput.value.trim() || 'search';
      this.settings.floatingToggleFontSize = parseInt(fontSizeInput.value) || 11;
      this.settings.floatingTogglePaddingH = parseInt(padHInput.value) || 10;
      this.settings.floatingTogglePaddingV = parseInt(padVInput.value) || 2;
      this.settings.floatingToggleOpacity = parseFloat(opacityInput.value) || 0.6;
      this.settings.floatingToggleStyleClass = selectedClass;
      this.settings.floatingToggleCustomStyle = cssTextarea.value.trim();

      // 保存到data.json
      this.floatingStyles = [{
        id: this.floatingDefaultStyleId || Date.now().toString(),
        name: 'default',
        styleClass: selectedClass,
        customStyle: cssTextarea.value.trim()
      }];
      this.floatingDefaultStyleId = this.floatingStyles[0].id;

      await this.saveSettings();
      await this.saveFloatingStyleData();
      this.applyFloatingCustomStyle();
      this.updateFloatingToggleStyle();
      if (this._applySettingsBtnStyle) this._applySettingsBtnStyle();
      modal.close();
    });

    modal.open();
    this._floatingEditModal = modal;
  }

  applyFloatingCustomStyle() {
    const existingEl = document.getElementById('swift-match-custom-style');
    if (existingEl) existingEl.remove();
    // 优先从data.json获取当前激活样式
    const activeStyle = this.getActiveFloatingStyle();
    const customStyle = activeStyle ? (activeStyle.customStyle || '') : (this.settings.floatingToggleCustomStyle || '');
    if (!customStyle.trim()) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'swift-match-custom-style';
    let scoped = customStyle.replace(/\.([a-zA-Z_-][\w-]*)/g, '.swift-match-floating-style-$1');
    styleEl.textContent = scoped;
    document.head.appendChild(styleEl);
  }

  closeFloatingEditPanel() {
    if (this._floatingEditModal) {
      this._floatingEditModal.close();
      this._floatingEditModal = null;
    }
    // 清理所有预览样式
    document.querySelectorAll('[id^="swift-match-preview-style-"]').forEach(el => el.remove());
    const previewEl = document.getElementById('swift-match-preview-style');
    if (previewEl) previewEl.remove();
  }

  createFloatingKeywordButton(keyword, fileMap, matchCount) {
    // Remove existing button for the same keyword
    this.removeFloatingKeywordButton(keyword);

    // Cache search results
    if (fileMap && fileMap.size > 0) {
      this._recentSearchCaches[keyword] = { fileMap, matchCount };
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'swift-match-keyword-btn-wrapper';
    wrapper.style.cssText = `
      position: fixed;
      z-index: 99998;
      display: flex;
      align-items: center;
      user-select: none;
      left: 50px;
      top: ${100 + this._floatingKeywordButtons.length * 36}px;
    `;

    const btn = document.createElement('div');
    btn.className = 'swift-match-keyword-btn';
    btn.style.cssText = `
      position: relative;
      padding: 2px 10px;
      border-radius: 9999px;
      background-color: rgba(240, 100, 120, 0.08);
      box-shadow: inset 0 0 0 1px rgba(240, 120, 100, 0.4), 0 2px 10px rgba(0, 0, 0, 0.05);
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      opacity: 0.7;
      transition: transform 0.15s ease, opacity 0.2s ease;
    `;

    const textEl = document.createElement('span');
    const displayText = keyword.length > 12 ? keyword.substring(0, 12) + '…' : keyword;
    textEl.style.cssText = `
      font-weight: 800;
      background: linear-gradient(135deg, #f2709c, #ff9472, #f5af19, #f2709c);
      background-size: 250% 100%;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 6px rgba(240, 100, 120, 0.7)) drop-shadow(0 0 12px rgba(245, 150, 50, 0.5));
      animation: hp-twilight-move 3.5s linear infinite;
      font-size: 11px;
      white-space: nowrap;
      line-height: 1;
      padding: 0;
      pointer-events: none;
    `;
    textEl.textContent = displayText;
    btn.appendChild(textEl);
    wrapper.appendChild(btn);
    document.body.appendChild(wrapper);

    const btnData = {
      wrapper,
      btn,
      textEl,
      term: keyword,
      fileMap,
      matchCount,
      position: { left: 50, top: 100 + this._floatingKeywordButtons.length * 36 }
    };
    this._floatingKeywordButtons.push(btnData);

    // Apply saved styles if any
    if (this.settings.keywordButtonStyles?.[keyword]) {
      this.applyKeywordButtonStyle(keyword);
    }

    // Persist floating keyword data
    this._updateFloatingKeywordsData();

    // Hover: show search window（有 peer 时走统一控制器）
    wrapper.dataset.keyword = keyword;
    let hoverTimer = null;
    wrapper.addEventListener('mouseenter', () => {
      btn.style.opacity = '1';
      wrapper.style.zIndex = '100000';
      hoverTimer = setTimeout(() => {
        if (this._searchPeer) {
          this._searchPeer.show(wrapper);
          return;
        }
        this._listUserDismissed = false;
        const cached = this._recentSearchCaches[keyword];
        if (cached && cached.fileMap && cached.fileMap.size > 0) {
          this._cachedMatchList = cached.fileMap;
          this._cachedMatchListKey = keyword;
          this._pendingMatchCount = cached.matchCount;
          this._pendingShowList = { searchText: keyword, matchCount: cached.matchCount };
          this._listTriggerElement = wrapper;
          this._isListVisible = true;
          this._exhaustiveSearchDone = true;
          this.renderMatchList(cached.fileMap, cached.matchCount, false);
          this._listShownFromHover = true;
          this.positionListNearElement(wrapper);
        } else {
          this._listTriggerElement = wrapper;
          this.currentSelection = keyword;
          this.highlightMatches();
        }
      }, 200);
    });

    wrapper.addEventListener('mouseleave', () => {
      btn.style.opacity = '0.7';
      wrapper.style.zIndex = '99998';
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
      }
      if (this._searchPeer) {
        this._searchPeer.scheduleHide();
        return;
      }
      if (this._isListVisible && this._listShownFromHover) {
        setTimeout(() => {
          const listHovered = this.matchList && this.matchList.matches(':hover');
          const btnHovered = wrapper.matches(':hover');
          if (!listHovered && !btnHovered) {
            this.hideMatchList();
            this._listShownFromHover = false;
          }
        }, 100);
      }
    });

    // Drag support
    let isDragging = false;
    let hasDragged = false;
    let startX, startY, startLeft, startTop;

    const onDragMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged = true;
      let newLeft = startLeft + dx;
      let newTop = startTop + dy;
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - wrapper.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, window.innerHeight - 30));
      wrapper.style.left = `${newLeft}px`;
      wrapper.style.top = `${newTop}px`;
      btnData.position.left = newLeft;
      btnData.position.top = newTop;
    };

    const onDragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      btn.style.cursor = 'grab';
      btn.style.transform = '';
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    };

    btn.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      hasDragged = false;
      startX = e.clientX;
      startY = e.clientY;
      const rect = wrapper.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      btn.style.cursor = 'grabbing';
      btn.style.transform = 'scale(1.05)';
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    });

    // Right-click context menu
    wrapper.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showKeywordContextMenu(e.clientX, e.clientY, keyword);
    });
  }

  showKeywordContextMenu(x, y, keyword) {
    this.closeFloatingContextMenu();

    const menu = document.createElement('div');
    menu.className = 'swift-match-context-menu';
    menu.style.cssText = `
      position: fixed;
      z-index: 100001;
      background: var(--background-secondary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      padding: 4px 0;
      min-width: 120px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      font-size: 12px;
    `;

    const items = [
      { label: t('editFloating'), action: () => { this.closeFloatingContextMenu(); this.showKeywordEditPanel(keyword); } },
      { type: 'separator' },
      { label: t('closeKeyword'), action: () => { this.closeFloatingContextMenu(); this.removeFloatingKeywordButton(keyword); } }
    ];

    items.forEach(item => {
      if (item.type === 'separator') {
        const sep = document.createElement('div');
        sep.style.cssText = 'height:1px;background:var(--background-modifier-border);margin:4px 8px;';
        menu.appendChild(sep);
        return;
      }
      const el = document.createElement('div');
      el.textContent = item.label;
      el.style.cssText = `
        padding: 6px 16px;
        cursor: pointer;
        color: var(--text-normal);
        white-space: nowrap;
        border-radius: 3px;
        margin: 0 4px;
      `;
      el.addEventListener('mouseenter', () => { el.style.background = 'var(--background-modifier-hover)'; });
      el.addEventListener('mouseleave', () => { el.style.background = ''; });
      el.addEventListener('click', (e) => { e.stopPropagation(); item.action(); });
      menu.appendChild(el);
    });

    let left = x, top = y;
    if (left + 140 > window.innerWidth) left = window.innerWidth - 148;
    if (top + 80 > window.innerHeight) top = window.innerHeight - 88;
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;

    document.body.appendChild(menu);
    this._floatingContextMenu = menu;

    setTimeout(() => {
      this._floatingContextMenuCloser = (e) => {
        if (!menu.contains(e.target)) this.closeFloatingContextMenu();
      };
      document.addEventListener('mousedown', this._floatingContextMenuCloser);
    }, 50);
  }

  showKeywordEditPanel(keyword) {
    const { Modal } = require('obsidian');
    const modal = new Modal(this.app);
    modal.titleEl.textContent = `${t('editFloating')} - ${keyword}`;
    modal.contentEl.addClass('swift-match-edit-modal');

    const btnData = this._floatingKeywordButtons.find(b => b.term === keyword);
    if (!btnData) { modal.close(); return; }

    const savedStyles = this.settings.keywordButtonStyles?.[keyword] || {};
    const currentStyleClass = savedStyles.styleClass || '';
    const currentCustomStyle = savedStyles.customStyle || '';
    const currentLabel = savedStyles.label || keyword;

    // 显示文字
    const labelDiv = modal.contentEl.createDiv();
    labelDiv.style.marginBottom = '12px';
    const labelName = labelDiv.createEl('label');
    labelName.textContent = t('toggleText');
    labelName.style.cssText = 'display:block;margin-bottom:4px;font-weight:bold;font-size:0.9em;';
    const labelInput = labelDiv.createEl('input');
    labelInput.type = 'text';
    labelInput.placeholder = keyword;
    labelInput.value = currentLabel;
    labelInput.style.cssText = 'width:100%;padding:8px;border:1px solid var(--background-modifier-border);border-radius:4px;background:var(--background-primary);color:var(--text-normal);font-size:14px;';

    // 样式类名
    const styleClassDiv = modal.contentEl.createDiv();
    styleClassDiv.style.marginBottom = '12px';
    const styleClassName = styleClassDiv.createEl('label');
    styleClassName.textContent = t('styleClass');
    styleClassName.style.cssText = 'display:block;margin-bottom:4px;font-weight:bold;font-size:0.9em;';
    const styleClassInput = styleClassDiv.createEl('input');
    styleClassInput.type = 'text';
    styleClassInput.placeholder = 'CSS class name (e.g. my-style)';
    styleClassInput.value = currentStyleClass;
    styleClassInput.style.cssText = 'width:100%;padding:8px;border:1px solid var(--background-modifier-border);border-radius:4px;background:var(--background-primary);color:var(--text-normal);font-size:14px;';

    // 自定义样式
    const customStyleDiv = modal.contentEl.createDiv();
    customStyleDiv.style.marginBottom = '16px';
    const customStyleName = customStyleDiv.createEl('label');
    customStyleName.textContent = t('customStyle');
    customStyleName.style.cssText = 'display:block;margin-bottom:4px;font-weight:bold;font-size:0.9em;';
    const customStyleHint = customStyleDiv.createEl('div');
    customStyleHint.textContent = t('styleHint');
    customStyleHint.style.cssText = 'font-size:0.75em;color:var(--text-muted);margin-bottom:4px;';
    const customStyleInput = customStyleDiv.createEl('textarea');
    customStyleInput.placeholder = `.keyword-btn {\n  background: transparent;\n  color: #534ab7;\n  border: 1px dashed #7f77dd;\n  border-radius: 3px;\n  padding: 1px 5px;\n}`;
    customStyleInput.value = currentCustomStyle;
    customStyleInput.style.cssText = 'width:100%;min-height:160px;padding:8px;border:1px solid var(--background-modifier-border);border-radius:4px;background:var(--background-primary);color:var(--text-normal);font-size:13px;font-family:monospace;resize:vertical;';

    // 预览区域
    const previewDiv = modal.contentEl.createDiv();
    previewDiv.style.cssText = 'margin-bottom:16px;padding:12px;border:1px dashed var(--background-modifier-border);border-radius:6px;text-align:center;';
    const previewLabel = previewDiv.createEl('div');
    previewLabel.textContent = t('preview');
    previewLabel.style.cssText = 'font-size:0.8em;color:var(--text-muted);margin-bottom:8px;';
    const previewSpan = previewDiv.createEl('span');
    previewSpan.textContent = currentLabel;
    previewSpan.style.cssText = 'display:inline-block;padding:4px 8px;';

    const previewStyleId = `swift-match-keyword-preview-style-${keyword.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const applyPreviewStyle = (styleText) => {
      const existingEl = document.getElementById(previewStyleId);
      if (existingEl) existingEl.remove();
      if (!styleText.trim()) return;
      const styleEl = document.createElement('style');
      styleEl.id = previewStyleId;
      let scoped = styleText.replace(/\.([a-zA-Z_-][\w-]*)/g, '.swift-match-keyword-style-$1');
      styleEl.textContent = scoped;
      document.head.appendChild(styleEl);
    };

    const updatePreview = () => {
      const newLabel = labelInput.value.trim() || keyword;
      const newClass = styleClassInput.value.trim();
      const newCustomStyle = customStyleInput.value.trim();
      previewSpan.textContent = newLabel;
      previewSpan.className = '';
      previewSpan.style.cssText = 'display:inline-block;padding:4px 8px;';
      if (newClass) {
        previewSpan.classList.add(`swift-match-keyword-style-${newClass}`);
      }
      if (newCustomStyle) {
        applyPreviewStyle(newCustomStyle);
        const firstClass = newCustomStyle.match(/\.([a-zA-Z_-][\w-]*)/);
        if (firstClass) {
          previewSpan.classList.add(`swift-match-keyword-style-${firstClass[1]}`);
        }
      } else {
        const existingEl = document.getElementById(previewStyleId);
        if (existingEl) existingEl.remove();
      }
    };

    labelInput.addEventListener('input', updatePreview);
    styleClassInput.addEventListener('input', updatePreview);
    customStyleInput.addEventListener('input', updatePreview);
    updatePreview();

    // 按钮容器
    const buttonContainer = modal.contentEl.createEl('div');
    buttonContainer.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;';
    const cancelBtn = buttonContainer.createEl('button');
    cancelBtn.textContent = t('cancel');
    cancelBtn.style.padding = '6px 16px';
    cancelBtn.addEventListener('click', () => modal.close());
    const confirmBtn = buttonContainer.createEl('button');
    confirmBtn.textContent = t('confirm');
    confirmBtn.style.cssText = 'padding:6px 16px;background-color:var(--interactive-accent);color:white;border:none;border-radius:4px;cursor:pointer;';
    confirmBtn.addEventListener('click', async () => {
      const newLabel = labelInput.value.trim() || keyword;
      const newStyleClass = styleClassInput.value.trim();
      const newCustomStyle = customStyleInput.value.trim();

      // Save to settings
      if (!this.settings.keywordButtonStyles) this.settings.keywordButtonStyles = {};
      this.settings.keywordButtonStyles[keyword] = {
        label: newLabel,
        styleClass: newStyleClass,
        customStyle: newCustomStyle
      };
      await this.saveSettings();

      // Apply to button
      this.applyKeywordButtonStyle(keyword);
      modal.close();
    });

    modal.open();

    // Clean up preview style on modal close
    const origClose = modal.close.bind(modal);
    modal.close = () => {
      const previewEl = document.getElementById(previewStyleId);
      if (previewEl) previewEl.remove();
      origClose();
    };
  }

  applyKeywordButtonStyle(keyword) {
    const btnData = this._floatingKeywordButtons.find(b => b.term === keyword);
    if (!btnData) return;

    const savedStyles = this.settings.keywordButtonStyles?.[keyword] || {};
    const hasCustomStyle = !!(savedStyles.styleClass || savedStyles.customStyle);

    // Update label
    const displayLabel = savedStyles.label || keyword;
    const displayText = displayLabel.length > 12 ? displayLabel.substring(0, 12) + '…' : displayLabel;
    btnData.textEl.textContent = displayText;

    if (hasCustomStyle) {
      // Remove inline styles that conflict with custom CSS
      btnData.btn.style.cssText = `
        position: relative;
        cursor: grab;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        opacity: 0.7;
        transition: transform 0.15s ease, opacity 0.2s ease;
      `;
      btnData.textEl.style.cssText = `
        font-size: 11px;
        white-space: nowrap;
        line-height: 1;
        padding: 0;
        pointer-events: none;
      `;

      // Apply style class
      btnData.btn.className = 'swift-match-keyword-btn';
      if (savedStyles.styleClass) {
        btnData.btn.classList.add(`swift-match-keyword-style-${savedStyles.styleClass}`);
      }

      // Apply custom CSS
      const styleId = `swift-match-keyword-custom-style-${keyword.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const existingEl = document.getElementById(styleId);
      if (existingEl) existingEl.remove();
      if (savedStyles.customStyle) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        let scoped = savedStyles.customStyle.replace(/\.([a-zA-Z_-][\w-]*)/g, '.swift-match-keyword-style-$1');
        styleEl.textContent = scoped;
        document.head.appendChild(styleEl);
        const firstClass = savedStyles.customStyle.match(/\.([a-zA-Z_-][\w-]*)/);
        if (firstClass) {
          btnData.btn.classList.add(`swift-match-keyword-style-${firstClass[1]}`);
        }
      }
    } else {
      // Restore default styles
      btnData.btn.style.cssText = `
        position: relative;
        padding: 2px 10px;
        border-radius: 9999px;
        background-color: rgba(240, 100, 120, 0.08);
        box-shadow: inset 0 0 0 1px rgba(240, 120, 100, 0.4), 0 2px 10px rgba(0, 0, 0, 0.05);
        cursor: grab;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        opacity: 0.7;
        transition: transform 0.15s ease, opacity 0.2s ease;
      `;
      btnData.textEl.style.cssText = `
        font-weight: 800;
        background: linear-gradient(135deg, #f2709c, #ff9472, #f5af19, #f2709c);
        background-size: 250% 100%;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 0 6px rgba(240, 100, 120, 0.7)) drop-shadow(0 0 12px rgba(245, 150, 50, 0.5));
        animation: hp-twilight-move 3.5s linear infinite;
        font-size: 11px;
        white-space: nowrap;
        line-height: 1;
        padding: 0;
        pointer-events: none;
      `;
      btnData.btn.className = 'swift-match-keyword-btn';
    }
  }

  removeFloatingKeywordButton(keyword) {
    const idx = this._floatingKeywordButtons.findIndex(b => b.term === keyword);
    if (idx >= 0) {
      const btnData = this._floatingKeywordButtons[idx];
      if (btnData.wrapper && btnData.wrapper.parentNode) {
        btnData.wrapper.parentNode.removeChild(btnData.wrapper);
      }
      this._floatingKeywordButtons.splice(idx, 1);
      this.deleteKeywordData(keyword);
      this._updateFloatingKeywordsData();
    }
  }

  async _updateFloatingKeywordsData() {
    const adapter = this.app.vault.adapter;
    if (!await adapter.exists(this.keywordDir)) {
      await adapter.mkdir(this.keywordDir);
    }
    let existingFiles = [];
    try {
      const listed = await adapter.list(this.keywordDir);
      existingFiles = Array.isArray(listed) ? listed : (listed?.files || []);
    } catch (e) {}
    const savedTerms = new Set();
    for (const btn of this._floatingKeywordButtons) {
      savedTerms.add(this._cacheKeyToFileName(btn.term));
      await this.saveKeywordData(
        btn.term,
        btn.position || { left: 50, top: 100 },
        btn.fileMap,
        btn.matchCount || 0
      );
    }
    for (const f of existingFiles) {
      const filePath = f.startsWith(this.keywordDir) ? f : `${this.keywordDir}/${f}`;
      if (!filePath.endsWith('.json')) continue;
      const baseName = filePath.split('/').pop().replace('.json', '');
      if (!savedTerms.has(baseName)) {
        await adapter.remove(filePath).catch(() => {});
      }
    }
  }

  async _restoreFloatingKeywordButtons() {
    const allData = await this.loadAllKeywordData();
    if (!allData || allData.length === 0) return;
    
    for (const data of allData) {
      try {
        let fileMap = null;
        if (data.fileMapData && data.fileMapData.length > 0) {
          fileMap = await this.deserializeFileMap(data.fileMapData);
        }
        
        if (fileMap && fileMap.size > 0) {
          this._recentSearchCaches[data.term] = { fileMap, matchCount: data.matchCount || 0 };
          this.createFloatingKeywordButton(data.term, fileMap, data.matchCount || 0);
        } else {
          this.createFloatingKeywordButton(data.term, new Map(), 0);
        }
        const btnData = this._floatingKeywordButtons.find(b => b.term === data.term);
        if (btnData && data.position) {
          btnData.position = data.position;
          btnData.wrapper.style.left = data.position.left + 'px';
          btnData.wrapper.style.top = data.position.top + 'px';
        }
      } catch (e) {
        console.error('Failed to restore floating keyword button:', data.term, e);
      }
    }
  }

  async _restoreRecentSearchCaches() {
    const adapter = this.app.vault.adapter;
    if (!await adapter.exists(this.cacheDir)) return;
    try {
      const listed = await adapter.list(this.cacheDir);
      const files = Array.isArray(listed) ? listed : (listed?.files || []);
      for (const f of files) {
        const filePath = f.startsWith(this.cacheDir) ? f : `${this.cacheDir}/${f}`;
        if (!filePath.endsWith('.json')) continue;
        try {
          const content = await adapter.read(filePath);
          const data = JSON.parse(content);
          if (data.fileMapData && data.fileMapData.length > 0) {
            const fileMap = await this.deserializeFileMap(data.fileMapData);
            if (fileMap && fileMap.size > 0) {
              this._recentSearchCaches[data.term] = { fileMap, matchCount: data.matchCount || 0 };
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  positionListNearElement(el) {
    if (!this.matchList) return;

    const rect = el.getBoundingClientRect();
    const listWidth = this.matchListSize.width || this.settings.matchListWidth || 280;
    const listHeight = this.matchList.offsetHeight || (this.matchListSize.height || this.settings.matchListHeight || 400);

    let left = rect.left;
    let top = rect.bottom + 5;

    if (left + listWidth > window.innerWidth - 10) {
      left = window.innerWidth - listWidth - 10;
    }
    if (left < 10) left = 10;

    if (top + listHeight > window.innerHeight - 10) {
      const availableBelow = window.innerHeight - top - 10;
      const availableAbove = rect.top - 15;
      if (availableBelow >= 60) {
        this.matchList.style.maxHeight = `${availableBelow}px`;
      } else if (availableAbove >= 60) {
        top = rect.top - Math.min(listHeight, availableAbove) - 5;
        this.matchList.style.maxHeight = `${Math.min(listHeight, availableAbove)}px`;
      } else {
        this.matchList.style.maxHeight = `${Math.max(60, window.innerHeight - 20)}px`;
        top = 10;
      }
    } else {
      this.matchList.style.maxHeight = '';
    }

    this.matchList.style.left = `${left}px`;
    this.matchList.style.top = `${top}px`;
  }

  addCommands() {
    this.addCommand({
      id: 'toggle-minimap',
      name: 'Toggle Minimap',
      callback: () => {
        if (this.minimapContainer) {
          const isHidden = this.minimapContainer.style.display === 'none';
          this.minimapContainer.style.display = isHidden ? 'block' : 'none';
          if (isHidden) {
            this.applyEditorPadding();
          } else {
            this.removeEditorPadding();
          }
        }
      }
    });

    this.addCommand({
      id: 'toggle-count',
      name: t('pinCountCommand'),
      editorCallback: (editor) => {
        const selection = editor.getSelection();
        if (!selection || selection.trim().length === 0) return;
        const sel = selection.trim();
        this.currentSelection = sel;
        this.currentCursor = editor.getCursor();
        const exactPinned = this.savedMatchLists.find(m => m.selection === sel && m.pinned);
        const containedPinned = this.savedMatchLists.filter(m => m.pinned && sel.includes(m.selection));
        if (exactPinned) {
          this.removePinnedSelection(sel);
        } else if (containedPinned.length > 0) {
          for (const item of containedPinned) {
            const idx = this.savedMatchLists.findIndex(m => m.selection === item.selection && m.pinned);
            if (idx >= 0) this.savedMatchLists.splice(idx, 1);
          }
          this.saveListData();
        } else {
          this.pinCurrentSelection();
        }
        this.clearHighlights();
        this.showPinnedDecorations();
        this.highlightMatches();
      }
    });
  }

  updateCommandNames() {
    const cmds = this.app?.commands?.commands;
    if (!cmds) return;
    const prefix = this.manifest?.id + ':';
    if (cmds[prefix + 'toggle-count']) {
      cmds[prefix + 'toggle-count'].name = t('pinCountCommand');
    }
  }

  _isMinimapBlacklisted() {
    const leaf = this.app.workspace.activeLeaf;
    if (!leaf) return false;
    return this._isLeafBlacklisted(leaf);
  }

  _isLeafBlacklisted(leaf) {
    if (!leaf) return false;
    let filePath = leaf.view?.file?.path;
    let viewTitle = '';
    let viewType = leaf.view?.viewType || '';
    if (!filePath) {
      // Try getDisplayText() first (most reliable for plugin views)
      if (leaf.view && typeof leaf.view.getDisplayText === 'function') {
        viewTitle = leaf.view.getDisplayText()?.trim() || '';
      }
      // Fallback to DOM title
      if (!viewTitle) {
        const leafEl = leaf.containerEl || leaf.view?.containerEl;
        if (leafEl) {
          const navEl = leafEl.querySelector('.view-header-title');
          if (navEl) {
            viewTitle = navEl.textContent?.trim() || '';
          }
        }
      }
      // If title matches a vault file, use its path instead
      if (viewTitle) {
        const found = this.app.vault.getFiles().find(f => f.name === viewTitle || f.basename === viewTitle);
        if (found) filePath = found.path;
      }
    }
    if (!filePath && !viewTitle && !viewType) return false;
    const blacklist = (this.settings.minimapBlacklist || '').split('\n').map(s => s.trim()).filter(Boolean);
    for (const pattern of blacklist) {
      const regex = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$', 'i');
      if (filePath && regex.test(filePath)) return true;
      if (viewTitle && regex.test(viewTitle)) return true;
      if (viewType && regex.test(viewType)) return true;
    }
    return false;
  }

  _getViewInfoFromContainer(containerEl) {
    // Walk up the DOM to find the leaf that owns this container
    const leaves = [];
    this.app.workspace.iterateRootLeaves((leaf) => { leaves.push(leaf); });
    // Also check sidebar leaves
    if (this.app.workspace.leftSplit) {
      const leftLeaves = this.app.workspace.leftSplit.children?.flatMap(s => s.children || []) || [];
      leaves.push(...leftLeaves);
    }
    if (this.app.workspace.rightSplit) {
      const rightLeaves = this.app.workspace.rightSplit.children?.flatMap(s => s.children || []) || [];
      leaves.push(...rightLeaves);
    }
    for (const leaf of leaves) {
      if (leaf.view && leaf.view.containerEl && leaf.view.containerEl.contains(containerEl)) {
        return {
          filePath: leaf.view.file?.path || '',
          viewTitle: (typeof leaf.view.getDisplayText === 'function' ? leaf.view.getDisplayText()?.trim() : '') || '',
          viewType: leaf.view.viewType || ''
        };
      }
    }
    // Fallback: check DOM for view-header-title
    const navEl = containerEl.querySelector('.view-header-title');
    const viewTitle = navEl ? navEl.textContent?.trim() || '' : '';
    return { filePath: '', viewTitle, viewType: '' };
  }

  _isViewInfoBlacklisted(info) {
    const { filePath, viewTitle, viewType } = info;
    if (!filePath && !viewTitle && !viewType) return false;
    const blacklist = (this.settings.minimapBlacklist || '').split('\n').map(s => s.trim()).filter(Boolean);
    for (const pattern of blacklist) {
      const regex = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$', 'i');
      if (filePath && regex.test(filePath)) return true;
      if (viewTitle && regex.test(viewTitle)) return true;
      if (viewType && regex.test(viewType)) return true;
    }
    return false;
  }

  _cleanupBlacklistedLeaves() {
    // Remove minimap containers from all blacklisted leaves
    const leaves = [];
    this.app.workspace.iterateRootLeaves((leaf) => {
      leaves.push(leaf);
    });
    for (const leaf of leaves) {
      if (this._isLeafBlacklisted(leaf)) {
        const containerEl = leaf.view?.containerEl;
        if (containerEl) {
          const existing = containerEl.querySelector('.minimap-container');
          if (existing && existing.parentNode) {
            existing.parentNode.removeChild(existing);
          }
        }
      }
    }
  }

  setupMinimap() {
    const workspace = this.app.workspace;
    const activeLeaf = workspace.activeLeaf;
    if (!activeLeaf) return;
    // minimap 将重建，路由器标记失效
    this._mmRouter = null;
    this._mmZoneHint?.remove(); this._mmZoneHint = null;

    // 移除旧 body 级元素：matchList/previewPanel/tooltip 每次重建都会新建，
    // 旧的若不显式移除会成为无法关闭的孤儿窗口
    this._searchPeer?.destroy(); this._searchPeer = null;
    if (this.matchList) { this.matchList.remove(); this.matchList = null; }
    if (this.previewPanel) { this.previewPanel.remove(); this.previewPanel = null; }
    if (this.tooltip) { this.tooltip.remove(); this.tooltip = null; }

    // Clean up minimap on all blacklisted leaves (handles settings changes)
    this._cleanupBlacklistedLeaves();

    if (this._isMinimapBlacklisted()) {
      this.removeEditorPadding();
      if (this.minimapContainer && this.minimapContainer.parentNode) {
        this.minimapContainer.parentNode.removeChild(this.minimapContainer);
      }
      this.minimapContainer = null;
      this.minimapContent = null;
      this.slider = null;
      return;
    }

    const editorEl = activeLeaf.view.containerEl;
    if (!editorEl) return;

    // Also check if the containerEl belongs to a blacklisted view
    // (activeLeaf may not reflect the actual view for plugin pages like Thino)
    const containerViewInfo = this._getViewInfoFromContainer(editorEl);
    if (this._isViewInfoBlacklisted(containerViewInfo)) {
      this.removeEditorPadding();
      if (this.minimapContainer && this.minimapContainer.parentNode) {
        this.minimapContainer.parentNode.removeChild(this.minimapContainer);
      }
      this.minimapContainer = null;
      this.minimapContent = null;
      this.slider = null;
      return;
    }

    this.removeEditorPadding();

    if (this.minimapContainer && this.minimapContainer.parentNode) {
      this.minimapContainer.parentNode.removeChild(this.minimapContainer);
    }

    this.minimapContainer = document.createElement('div');
    this.minimapContainer.className = 'minimap-container';
    editorEl.appendChild(this.minimapContainer);
    
    this.minimapContainer.addEventListener('contextmenu', this.boundContextMenu);

    this.minimapContent = document.createElement('div');
    this.minimapContent.className = 'minimap-content';
    this.minimapContainer.appendChild(this.minimapContent);

    this.slider = document.createElement('div');
    this.slider.className = 'minimap-slider';
    this.minimapContainer.appendChild(this.slider);

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'minimap-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);

    this.matchList = document.createElement('div');
    this.matchList.className = 'minimap-match-list';
    this.matchList.style.display = 'none';
    document.body.appendChild(this.matchList);

    this.previewPanel = document.createElement('div');
    this.previewPanel.className = 'minimap-preview-panel';
    this.previewPanel.style.display = 'none';
    this.previewPanel.style.position = 'absolute';
    document.body.appendChild(this.previewPanel);

    this.applySettings();

    this._rebindSearchPeer();
    this.setupListWheel();
    this.setupSliderEvents();
    this.updateMinimapContent();
    this.setupScrollListener();
    this.decorationField = null;

    if (!this.isReadingMode()) {
      this.registerEditorField();
      this.setupPinnedMatchHover();
    }

    this.minimapContainer.addEventListener('wheel', this.boundWheel, { passive: false });
    
    this.setupOutlineOnHover();
    this.setupMinimapZoneRouter();
    this.setupMinimapWidthHandle();
    // 设置面板打开期间重建 minimap 后恢复区间常显遮罩与强制展开
    if (this._mmZonePinned) {
      if (this.settings.collapseOnHover) this.minimapContainer?.classList.add('mm-zone-preview');
      this._mmShowZoneHint?.(null, true);
    }
  }

  setupMinimapWidthHandle() {
    const mm = this.minimapContainer;
    if (!mm || mm.querySelector('.minimap-width-handle')) return;
    const handle = document.createElement('div');
    handle.className = 'minimap-width-handle';
    mm.appendChild(handle);
    handle.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      this._mmResizing = true;
      const expanded = !!this.settings.collapseOnHover;
      if (expanded) mm.classList.add('mm-resizing');
      mm.style.transition = 'none';
      const startX = e.clientX;
      const startW = expanded ? (this.settings.widthPx ?? 60) : (this.settings.collapseWidth ?? 8);
      const onMove = ev => {
        let w = startW - (ev.clientX - startX);
        if (expanded) {
          w = Math.max(20, Math.min(400, Math.round(w)));
          this.settings.widthPx = w;
          mm.style.setProperty('--mm-width', w + 'px');
          const inp = this.settingsPanel?.querySelector('#minimap-width');
          if (inp) inp.value = w;
        } else {
          w = Math.max(4, Math.min(50, Math.round(w)));
          this.settings.collapseWidth = w;
          mm.style.setProperty('--collapse-width', w + 'px');
          const inp = this.settingsPanel?.querySelector('#minimap-collapsewidth');
          if (inp) inp.value = w;
        }
      };
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        mm.style.transition = '';
        mm.classList.remove('mm-resizing');
        this._mmResizing = false;
        this.saveSettings();
        this.applySettings();
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp, { once: true });
    });
  }

  setupMinimapZoneRouter() {
    const mm = this.minimapContainer;
    if (!mm || this._mmRouter) return;

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const normZones = () => {
      let s = this.settings.searchZone || { top: 0.05, bottom: 0.40 };
      let o = this.settings.outlineZone || { top: 0.55, bottom: 0.95 };
      s = { top: clamp(s.top, 0.02, 0.97), bottom: clamp(s.bottom, 0.02, 0.98) };
      o = { top: clamp(o.top, 0.03, 0.98), bottom: clamp(o.bottom, 0.03, 0.98) };
      if (s.top > s.bottom) [s.top, s.bottom] = [s.bottom, s.top];
      if (o.top > o.bottom) [o.top, o.bottom] = [o.bottom, o.top];
      if (s.bottom > o.top) { const m = (s.bottom + o.top) / 2; s.bottom = m; o.top = m; }
      return { s, o };
    };
    const zoneFromEvent = e => {
      const r = mm.getBoundingClientRect();
      const p = clamp((e.clientY - r.top) / r.height, 0, 1);
      const { s, o } = normZones();
      if (p >= s.top && p <= s.bottom) return 'search';
      if (p >= o.top && p <= o.bottom) return 'outline';
      return 'buffer';
    };

    let showTimer = null;
    const clearShowTimer = () => { if (showTimer) { clearTimeout(showTimer); showTimer = null; } };

    const hideZoneHint = () => { this._mmZoneHint?.remove(); this._mmZoneHint = null; };

    let zone = null;
    const activate = z => {
      this._mmZone = z;
      clearShowTimer();
      // 缓冲带：不弹窗，minimap 自身 hoverExpand 由 CSS :hover 驱动不受影响
      if (z === 'buffer') {
        this._searchPeer?.scheduleHide();
        this._olPeer?.scheduleHide();
        return;
      }
      // 大纲功能关闭时，大纲区不触发窗口
      if (z === 'outline' && !this.settings.outlineOnHover) {
        this._olPeer?.scheduleHide();
        return;
      }
      const delay = this.settings.winShowDelay || 0;
      const doShow = () => {
        showTimer = null;
        if (zone !== z) return; // 延时期间分区已变，放弃旧分区
        if (z === 'search') {
          this._searchPeer?.show(mm);
          this._olPeer?.scheduleHide();
        } else {
          if (!this.settings.outlineOnHover) return;
          this._olPeer?.show(mm);
          this._searchPeer?.scheduleHide();
        }
      };
      if (delay > 0) showTimer = setTimeout(doShow, delay);
      else doShow();
    };

    const updateOnState = (hint, z) => {
      hint.querySelector('.mzh-zone.search')?.classList.toggle('on', z === 'search');
      hint.querySelector('.mzh-zone.outline')?.classList.toggle('on', z === 'outline');
      hint.querySelector('.mzh-zone.buffer')?.classList.toggle('on', z === 'buffer');
    };
    const applyHintGeo = (hint) => {
      const { s, o } = normZones();
      const block = (sel, top, h) => { const el = hint.querySelector(sel); if (!el) return; el.style.top = (top * 100) + '%'; el.style.height = (h * 100) + '%'; };
      block('.mzh-zone.buffer', 0, 1); // 缓冲区底层铺满，由搜索/大纲色块覆盖
      block('.mzh-zone.search', s.top, s.bottom - s.top);
      block('.mzh-zone.outline', o.top, o.bottom - o.top);
      const handle = (edge, pct) => { const el = hint.querySelector(`.mzh-handle[data-edge="${edge}"]`); if (el) el.style.top = (pct * 100) + '%'; };
      handle('sTop', s.top);
      handle('sBot', s.bottom);
      handle('oTop', o.top);
      handle('oBot', o.bottom);
    };
    const showZoneHint = (z, force) => {
      hideZoneHint();
      if (!force && !this.settings.zoneIndicator) return;
      const olOn = !!this.settings.outlineOnHover;
      const hint = document.createElement('div');
      hint.className = 'minimap-zone-hint';
      hint.innerHTML =
        `<div class="mzh-zone buffer${z === 'buffer' ? ' on' : ''}"></div>` +
        `<div class="mzh-zone search${z === 'search' ? ' on' : ''}"><span>🔍 ${t('tabSearch')}</span></div>` +
        `<div class="mzh-zone outline${z === 'outline' ? ' on' : ''}${olOn ? '' : ' disabled'}"><span>≡ ${t('tabOutline')}</span></div>` +
        `<div class="mzh-handle" data-edge="sTop" title="${t('zoneRatio')}"></div>` +
        `<div class="mzh-handle" data-edge="sBot" title="${t('zoneRatio')}"></div>` +
        `<div class="mzh-handle" data-edge="oTop" title="${t('zoneRatio')}"></div>` +
        `<div class="mzh-handle" data-edge="oBot" title="${t('zoneRatio')}"></div>`;
      mm.appendChild(hint);
      applyHintGeo(hint);
      updateOnState(hint, z);
      // 拖动边界线手动调整区间
      hint.querySelectorAll('.mzh-handle').forEach(hd => {
        hd.addEventListener('pointerdown', e => {
          e.preventDefault();
          e.stopPropagation();
          this._mmDividing = true;
          const edge = hd.dataset.edge;
          const r = mm.getBoundingClientRect();
          const onDv = ev => {
            const pct = clamp((ev.clientY - r.top) / r.height, 0.02, 0.98);
            let { s, o } = normZones();
            if (edge === 'sTop') s.top = clamp(pct, 0.02, s.bottom - 0.02);
            else if (edge === 'sBot') s.bottom = clamp(pct, s.top + 0.02, o.top - 0.02);
            else if (edge === 'oTop') o.top = clamp(pct, s.bottom + 0.02, o.bottom - 0.02);
            else if (edge === 'oBot') o.bottom = clamp(pct, o.top + 0.02, 0.98);
            this.settings.searchZone = s;
            this.settings.outlineZone = o;
            const sp = this.settingsPanel;
            if (sp) {
              const setV = (id, v) => { const el = sp.querySelector(id); if (el) el.value = v; };
              setV('#minimap-szone-top', Math.round(s.top * 100));
              setV('#minimap-szone-bot', Math.round(s.bottom * 100));
              setV('#minimap-ozone-top', Math.round(o.top * 100));
              setV('#minimap-ozone-bot', Math.round(o.bottom * 100));
            }
            applyHintGeo(hint);
            const nz = zoneFromEvent(ev);
            if (nz !== zone) { zone = nz; activate(nz); updateOnState(hint, nz); }
          };
          const onUp = () => {
            document.removeEventListener('pointermove', onDv);
            this._mmDividing = false;
            this.saveSettings();
          };
          document.addEventListener('pointermove', onDv);
          document.addEventListener('pointerup', onUp, { once: true });
        });
      });
      this._mmZoneHint = hint;
    };
    this._mmShowZoneHint = showZoneHint;
    this._mmHideZoneHint = hideZoneHint;
    this._mmApplyHintGeo = () => { if (this._mmZoneHint) applyHintGeo(this._mmZoneHint); };

    const onMove = e => {
      if (this._mmDividing || this._mmResizing) return; // 拖边界线/调宽度时不重绘 overlay
      if (this.settings.hoverWindow === false) return; // 悬停打开窗口总开关关闭
      const z = zoneFromEvent(e);
      if (z !== zone) { zone = z; activate(z); showZoneHint(z, !!this._mmZonePinned); }
    };
    const onEnter = e => {
      if (this._mmResizing) return;
      if (this.settings.hoverWindow === false) return; // 悬停打开窗口总开关关闭
      zone = zoneFromEvent(e);
      activate(zone);
      showZoneHint(zone, !!this._mmZonePinned);
    };
    const onLeave = () => {
      zone = null;
      this._mmZone = null;
      clearShowTimer();
      if (!this._mmZonePinned) hideZoneHint(); // 设置面板常显时不隐藏
      this._searchPeer?.scheduleHide();
      this._olPeer?.scheduleHide();
    };

    mm.addEventListener('pointermove', onMove);
    mm.addEventListener('pointerenter', onEnter);
    mm.addEventListener('pointerleave', onLeave);
    this._mmRouter = { onMove, onEnter, onLeave };
  }

  setupOutlineOnHover() {
    // pinned 窗口跨标签页保留：仅刷新内容，不销毁重建（避免窗口闪烁 / 关闭按钮残留）
    if (this._olPeer && this._olPeer.mode === 'pinned' && this.settings.outlineOnHover && this._outlinePanel) {
      this._olRebuildWithRetry();
      return;
    }
    this._removeOutlineOnHover();
    if (!this.settings.outlineOnHover || !this.minimapContainer) return;

    this._olCfg = Object.assign({ on: true, n: 5, t: { b: 1, h: 1, o: 1 }, v: 'h', f: {}, names: {} }, this._loadOLCfg());
    this._olBranch = true;
    this._olIconMode = false;
    this._olTempExpand = false;
    this._olMan = new Map();
    this._olEx = new Set();
    this._olCurIdx = -1;
    this._olHeadings = [];
    this._olAllMarks = [];
    this._olMarks = [];
    this._olScrollEl = null;

    const panel = document.createElement('div');
    panel.className = 'minimap-outline-panel';
    document.body.appendChild(panel);
    this._outlinePanel = panel;

    const dock = this._buildOutlineDock();
    panel.appendChild(dock);
    this._olDock = dock;

    const tabBar = this._buildOutlineTabs();
    panel.appendChild(tabBar);

    const pl = document.createElement('div');
    pl.className = 'minimap-outline-items';
    panel.appendChild(pl);
    this._olPl = pl;

    ['l', 'r', 'b', 'bl', 'br'].forEach(d => {
      const rz = document.createElement('i');
      rz.className = `minimap-outline-rz ${d}`;
      rz.dataset.d = d;
      panel.appendChild(rz);
    });

    const foldChip = document.createElement('div');
    foldChip.className = 'minimap-outline-fold-chip att chip';
    foldChip.textContent = '0%';
    foldChip.title = t('olFoldChipTip');
    this._olFoldChip = foldChip;
    dock.insertBefore(foldChip, dock.firstChild);

    panel.addEventListener('dblclick', e => this._olDblClick(e));
    pl.addEventListener('click', e => this._olClick(e));

    this._olPeer = new FloatingPeer(this, {
      id: 'outline',
      winEl: panel,
      chipEl: foldChip,
      defaultW: 270,
      defaultH: 440,
      minW: 190,
      minH: 80,
      allowTopOverflow: true,
      getDock: () => this._olDock,
      isInteractive: t => !!t.closest('.minimap-outline-close,.minimap-outline-tabs,.minimap-outline-tab,.chip,.vw b,.stp b,.minimap-outline-zn[contenteditable="true"],.minimap-outline-it,.minimap-outline-zh,.minimap-outline-lc,.minimap-outline-cd,.minimap-outline-cc'),
      onShow: () => {
        this._buildOutlineContent();
        this._olMarkCurrent();
        this._attachOLScroll();
      },
      onPin: () => {
        if (this.settings.outlinePinnedMargin) this._applyOutlineMargin();
      },
      onUnpin: () => this._removeOutlineMargin(),
      onGeoApplied: g => {
        panel.classList.toggle('compact', g.h < 110);
        if (g.h < 120 && this._olCfg.v !== 'h') {
          this._olCfg.v = 'h';
          this._saveOLCfg();
          this._buildOutlineContent();
          this._olMarkCurrent();
        }
      },
      keepEls: () => this._mmZone === 'outline' ? [this.minimapContainer] : [],
      migrate: () => {
        try {
          const s = JSON.parse(localStorage.getItem('swift-match-outline-geo') || 'null');
          if (s && s.w) return { win: { w: s.w, h: s.h, x: s.x, y: s.y }, positioned: true };
        } catch (e) {}
        return null;
      }
    });

    this._boundOLEditorChange = () => {
      if (!this._outlinePanel?.classList.contains('show')) return;
      clearTimeout(this._olRebuildTimer);
      this._olRebuildTimer = setTimeout(() => {
        this._buildOutlineContent();
        this._olMarkCurrent();
      }, 300);
    };
    this.app.workspace.on('editor-change', this._boundOLEditorChange);

    this._boundOLLeafChange = () => {
      if (this._olPeer.mode !== 'pinned' || !this._outlinePanel?.classList.contains('show')) return;
      this._olRebuildWithRetry();
    };
    this.app.workspace.on('active-leaf-change', this._boundOLLeafChange);

    this._buildOutlineContent();
    this._attachOLScroll();
    this._olSyncScroll();
  }

  // 大纲滚动容器绑定（idempotent，切 leaf 时换绑）
  _attachOLScroll() {
    const scrollEl = this._getScrollContainer();
    if (!scrollEl) return;
    if (this._olScrollEl === scrollEl) return;
    if (this._olScrollEl) this._olScrollEl.removeEventListener('scroll', this._boundOLScroll);
    this._olScrollEl = scrollEl;
    this._boundOLScroll = () => this._olSyncScroll();
    scrollEl.addEventListener('scroll', this._boundOLScroll, { passive: true });
  }

  _removeOutlineOnHover() {
    if (this._olPeer) {
      this._olPeer.destroy();
      this._olPeer = null;
    }
    if (this._outlinePanel) {
      this._outlinePanel.remove();
      this._outlinePanel = null;
    }
    if (this._olFoldChip) {
      this._olFoldChip.remove();
      this._olFoldChip = null;
    }
    this._olDock = null;
    if (this._olScrollEl && this._boundOLScroll) {
      this._olScrollEl.removeEventListener('scroll', this._boundOLScroll);
      this._olScrollEl = null;
    }
    if (this._boundOLEditorChange) {
      this.app.workspace.off('editor-change', this._boundOLEditorChange);
      this._boundOLEditorChange = null;
    }
    if (this._boundOLLeafChange) {
      this.app.workspace.off('active-leaf-change', this._boundOLLeafChange);
      this._boundOLLeafChange = null;
    }
    clearTimeout(this._olRebuildTimer);
    this._removeOutlineMargin();
  }

  _loadOLCfg() {
    try { return JSON.parse(localStorage.getItem('swiftmatch-outline-marks') || 'null') || {}; } catch (e) { return {}; }
  }

  _saveOLCfg() {
    try { localStorage.setItem('swiftmatch-outline-marks', JSON.stringify(this._olCfg)); } catch (e) {}
  }

  _buildOutlineDock() {
    const dock = document.createElement('div');
    dock.className = 'minimap-outline-dock';


    const br = document.createElement('span');
    br.className = 'chip on';
    br.id = 'ol-br';
    br.textContent = t('accordion');
    br.title = t('accordionTip');
    br.addEventListener('click', e => {
      e.stopPropagation();
      this._olBranch = !this._olBranch;
      this._olMan = new Map();
      br.classList.toggle('on', this._olBranch);

      this._olSyncScroll();
      this._olMarkCurrent();
    });
    dock.appendChild(br);

    const exAll = document.createElement('span');
    exAll.className = 'chip';
    exAll.id = 'ol-exall';
    exAll.textContent = '⤢';
    exAll.title = t('olExpandAll');
    exAll.addEventListener('click', e => {
      e.stopPropagation();
      if (this._olCfg.v !== 'b') return;
      const allEx = this._olAllExpanded();
      if (allEx) this._olEx.clear();
      else {
        this._olMarks.forEach((L, i) => {
          const by = {};
          L.forEach(m => (by[m.c] = by[m.c] || []).push(m));
          this._olKeys().filter(k => by[k]).forEach(k => this._olEx.add(i + ':' + k));
        });
      }
      this._buildOutlineContent();
      this._olMarkCurrent();
    });
    dock.appendChild(exAll);

    return dock;
  }

  _olAllExpanded() {
    for (let i = 0; i < this._olMarks.length; i++) {
      const L = this._olMarks[i];
      const by = {};
      L.forEach(m => (by[m.c] = by[m.c] || []).push(m));
      for (const k of this._olKeys()) if (by[k] && !this._olEx.has(i + ':' + k)) return false;
    }
    return true;
  }

  _buildOutlineTabs() {
    const tabBar = document.createElement('div');
    tabBar.className = 'minimap-outline-tabs';
    let hoverTimer = null;
    [['h', 'olViewTitle'], ['a', 'olViewGroup'], ['b', 'olViewDot'], ['c', 'olViewMatrix']].forEach(([v, key]) => {
      const b = document.createElement('span');
      b.className = 'minimap-outline-tab';
      b.dataset.v = v;
      b.textContent = t(key);
      const switchTo = () => {
        if (this._olCfg.v === v) return;
        this._olCfg.v = v;
        this._saveOLCfg();
        this._olSyncUI();
        this._buildOutlineContent();
        this._olMarkCurrent();
      };
      b.addEventListener('click', e => { e.stopPropagation(); switchTo(); });
      b.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(switchTo, 150);
      });
      b.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
      tabBar.appendChild(b);
    });
    return tabBar;
  }

  _olSyncUI() {
    if (!this._outlinePanel) return;
    this._outlinePanel.querySelectorAll('.minimap-outline-tab').forEach(b => b.classList.toggle('on', b.dataset.v === this._olCfg.v));
    const exAll = this._outlinePanel.querySelector('#ol-exall');
    if (exAll) exAll.style.display = this._olCfg.v === 'b' ? '' : 'none';
  }

  _olRefreshLang() {
    if (!this._outlinePanel) return;
    const br = this._outlinePanel.querySelector('#ol-br');
    if (br) { br.textContent = t('accordion'); br.title = t('accordionTip'); }
    const exAll = this._outlinePanel.querySelector('#ol-exall');
    if (exAll) exAll.title = t('olExpandAll');
    const exitBtn = this._outlinePanel.querySelector('.minimap-outline-icon-exit');
    if (exitBtn) exitBtn.title = t('olExitIcon');
    if (this._olFoldChip) this._olFoldChip.title = t('olFoldChipTip');
    this._outlinePanel.querySelectorAll('.minimap-outline-tab').forEach(b => {
      const map = { h: 'olViewTitle', a: 'olViewGroup', b: 'olViewDot', c: 'olViewMatrix' };
      if (map[b.dataset.v]) b.textContent = t(map[b.dataset.v]);
    });
    const cb = this._olPeer?._closeBtn;
    if (cb) cb.title = t('olUnpin');
    this._buildOutlineContent();
    this._olMarkCurrent();
  }

  _olDblClick(e) {
    const zn = e.target.closest('.minimap-outline-zn');
    if (zn) {
      e.stopPropagation();
      zn.contentEditable = 'true';
      zn.focus();
      getSelection().selectAllChildren(zn);
      const onBlur = () => {
        zn.contentEditable = 'false';
        const k = zn.closest('.minimap-outline-zh').dataset.c;
        const v = zn.textContent.trim();
        const dn = { y: 'olColorY', g: 'olColorG', b: 'olColorB', r: 'olColorR', p: 'olColorP', o: 'olColorO', cp: 'olColorCp', in: 'olColorIn', kf: 'olColorKf', mr: 'olColorMr', d: 'olColorD', B: 'olColorBold', u: 'olColorU' };
        if (v && v !== t(dn[k])) this._olCfg.names[k] = v; else delete this._olCfg.names[k];
        this._saveOLCfg();
        this._buildOutlineContent();
        this._olMarkCurrent();
      };
      zn.addEventListener('blur', onBlur, { once: true });
      zn.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); zn.blur(); } });
      return;
    }
    if (e.target.closest('.minimap-outline-it,.chip,.stp,.minimap-outline-zh,.minimap-outline-lc,.minimap-outline-cd,.minimap-outline-cc')) return;
    const peer = this._olPeer;
    if (!peer) return;
    peer._win.w = 270;
    peer._win.h = 440;
    peer.applyGeo();
    peer.save();
  }

  _olGetHeadings() {
    const file = this.app.workspace.activeLeaf?.view?.file;
    if (!file) return [];
    const cache = this.app.metadataCache.getFileCache(file);
    if (!cache || !cache.headings) return [];
    const headings = cache.headings.map((h, i) => ({ level: h.level, text: h.heading, pos: h.position?.start?.line ?? 0, i, g: 0 }));
    const minLv = headings.length ? Math.min(...headings.map(h => h.level)) : 1;
    let gi = -1;
    headings.forEach((h, i) => { if (h.level === minLv) gi = i; h.g = gi >= 0 ? gi : i; });
    return headings;
  }

  // 严格匹配：文档颜色与设定色完全一致才归组，否则归入 u（未定义）
  _olQuantColor(at) {
    const m = /background(?:-color)?\s*:\s*(#[0-9a-f]{3,8}|rgba?\([^)]*\))/i.exec(at || '');
    if (!m) return 'u';
    const c = m[1];
    let rgb;
    if (c[0] === '#') {
      let h = c.slice(1);
      if (h.length < 6) h = [...h].slice(0, 3).map(x => x + x).join('');
      rgb = [0, 2, 4].map(j => parseInt(h.substr(j, 2), 16));
    } else {
      rgb = c.match(/[\d.]+/g).slice(0, 3).map(Number);
    }
    const COL = this._olColMap();
    for (const k of this._olKeys()) {
      const hex = COL[k];
      if (!hex || hex[0] !== '#' || hex.length < 7) continue;
      if (parseInt(hex.substr(1, 2), 16) === rgb[0] && parseInt(hex.substr(3, 2), 16) === rgb[1] && parseInt(hex.substr(5, 2), 16) === rgb[2]) return k;
    }
    return 'u';
  }

  // emoji → 颜色键：默认映射可被 settings.olEmoji（键→emoji）覆盖；olHidden 隐藏的键不参与
  _olEmojiMap() {
    const hid = (this.settings && this.settings.olHidden) || {};
    const m = Object.assign({ y: '🟡', g: '🟢', b: '🔵', r: '🔴', p: '🟣', o: '🟠' }, this.settings && this.settings.olEmoji);
    for (const k of Object.keys(m)) { if (hid[k] || !m[k]) delete m[k]; } // '' = 已切为 HTML 模式的抑制标记
    return m;
  }

  _olEmojiColor(text) {
    const M = this._olEmojiMap();
    const ALIAS = { '💛': '🟡', '💚': '🟢', '💙': '🔵', '❤': '🔴', '💜': '🟣', '🧡': '🟠' };
    for (const [k, e] of Object.entries(M)) { if (e && text.includes(e)) return k; }
    for (const [a, canon] of Object.entries(ALIAS)) {
      if (text.includes(a)) { for (const [k, e] of Object.entries(M)) { if (e === canon) return k; } }
    }
    return null;
  }

  // 返回 null 表示该分类已被用户删除，标注不显示
  _olCkey(ty, at, text) {
    const hid = this.settings.olHidden || {};
    if (ty === 'b') return hid.B ? null : 'B';
    if (ty === 'o') {
      const ec = this._olEmojiColor(text || '');
      if (ec) return ec;
      return hid.d ? null : 'd';
    }
    const ec = this._olEmojiColor(text || '');
    if (ec) return ec;
    const cls = /class\s*=\s*"([^"]*)"/i.exec(at || '');
    if (cls) {
      const cm = { yellow: 'y', green: 'g', blue: 'b', red: 'r', purple: 'p', orange: 'o' };
      for (const [n, k] of Object.entries(cm)) { if (cls[1].toLowerCase().includes(n)) return hid[k] ? null : k; }
    }
    const dc = /data-color\s*=\s*"([^"]*)"/i.exec(at || '');
    const q = dc ? this._olQuantColor(`background:${dc[1]}`) : this._olQuantColor(at);
    return hid[q] ? null : q; // 未定义色归 u；u 被删除则不显示
  }

  _olColMap() {
    // 默认色板可被 settings.olColors 覆盖；u = 未定义颜色（灰）；olHidden 隐藏的键不参与
    const hid = this.settings.olHidden || {};
    const m = Object.assign({ y: '#f6d84a', g: '#9ad48c', b: '#8ec5f0', r: '#f4a3a3', p: '#c4aef0', o: '#f5a623', d: '#eadf9a', B: '#8a897f', u: '#c8c8c8' }, this.settings.olColors);
    for (const k of Object.keys(hid)) delete m[k];
    return m;
  }
  _olKeys() {
    const hid = this.settings.olHidden || {};
    const base = ['y', 'g', 'b', 'r', 'p', 'o', 'd', 'B', 'u'];
    const extra = Object.keys(this.settings.olColors || {}).filter(k => !base.includes(k));
    return base.concat(extra).filter(k => !hid[k]);
  }

  // 按底色亮度选前景色（设置行底色=对应颜色时保证可读）
  _olTextOn(c) {
    const m = /^#([0-9a-f]{6})$/i.exec(c || '');
    if (!m) return 'var(--sm-ink)';
    const n = parseInt(m[1], 16);
    const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
    return lum > 150 ? '#2a2a2a' : '#ffffff';
  }

  _olNm(k) {
    const dn = { y: 'olColorY', g: 'olColorG', b: 'olColorB', r: 'olColorR', p: 'olColorP', o: 'olColorO', cp: 'olColorCp', in: 'olColorIn', kf: 'olColorKf', mr: 'olColorMr', d: 'olColorD', B: 'olColorBold', u: 'olColorU' };
    return (this._olCfg && this._olCfg.names && this._olCfg.names[k]) || (dn[k] ? t(dn[k]) : k);
  }

  // 高亮编码对应的完整书写格式示例（emoji 在 == 内才会被识别；emoji 行不含 mark 标签——两者是独立触发通道）
  _olFmtSample(k) {
    const em = this._olEmojiMap()[k];
    const w = t('olFmtWord');
    if (k === 'B') return `**${w}**`;
    if (k === 'u') return `<mark>${w}</mark>`;
    if (em) return `==${em}${w}==`;
    return `<mark style="background:${this._olColMap()[k]}">${w}</mark>`;
  }

  // 内置键的默认色
  _olDefaultCol(k) {
    return { y: '#f6d84a', g: '#9ad48c', b: '#8ec5f0', r: '#f4a3a3', p: '#c4aef0', o: '#f5a623', cp: '#FFB3D9', in: '#d6409f', kf: '#B3FFFF', mr: '#010101', d: '#eadf9a', B: '#8a897f', u: '#c8c8c8' }[k] || null;
  }

  // 默认使用 emoji 的原生键
  static get OL_NATIVE_KEYS() { return ['y', 'g', 'b', 'r', 'p', 'o', 'd', 'B']; }

  // 条目方式：native = ==emoji文字==；html = <mark style>。'' sentinel 表示已切 HTML
  _olMode(k) {
    const oe = (this.settings.olEmoji || {})[k];
    if (oe === '') return 'html';
    if (oe) return 'native';
    return MinimapPlugin.OL_NATIVE_KEYS.includes(k) ? 'native' : 'html';
  }

  // 切换条目方式
  _olSetMode(k, mode) {
    if (this._olMode(k) === mode) return;
    if (!this.settings.olEmoji) this.settings.olEmoji = {};
    if (mode === 'html') {
      this.settings.olEmoji[k] = ''; // 抑制 emoji（含默认 emoji）
      if (!this.settings.olColors) this.settings.olColors = {};
      if (!this.settings.olColors[k]) {
        const c = this._olDefaultCol(k);
        if (c) this.settings.olColors[k] = c;
      }
    } else {
      delete this.settings.olEmoji[k];
      // 内置颜色键恢复默认色板（HTML 标签色不再归入此键）
      if (this._olDefaultCol(k) && this.settings.olColors) delete this.settings.olColors[k];
    }
  }

  // 行头渲染效果预览
  _olHlPreview(k) {
    const w = t('olFmtWord');
    if (k === 'B') return `<span class="ol-acc-hl"><b>${w}</b></span>`;
    if (this._olMode(k) === 'native') {
      const c = this._olColMap()[k] || '#c8c8c8';
      const em = this._olEmojiMap()[k] || '';
      return `<span class="ol-acc-hl" style="background:${c}33;box-shadow:inset 0 -1.5px ${c}">${em}${w}</span>`;
    }
    const bg = this._olColMap()[k] || '#c8c8c8';
    const fg = (this.settings.olFgColors || {})[k] || this._olTextOn(bg);
    return `<span class="ol-acc-hl" style="background:${bg};color:${fg}">${w}</span>`;
  }

  // 行体语法小字
  _olSyn(k) {
    const w = t('olFmtWord');
    if (k === 'B') return `**${w}**`;
    if (this._olMode(k) === 'native') {
      const em = this._olEmojiMap()[k] || '';
      return `==${em}${w}==`;
    }
    const bg = this._olColMap()[k];
    const fg = (this.settings.olFgColors || {})[k];
    let st = bg ? `background:${bg}` : '';
    if (fg) st += (st ? ';' : '') + `color:${fg}`;
    return st ? `<mark style="${st}">${w}</mark>` : `<mark>${w}</mark>`;
  }

  _olEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // 从 HTML 标签属性中解析文档实际背景色（编辑器实际显示色）
  _olActualColor(at) {
    const m = /background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))/i.exec(at || '');
    return m ? m[1] : null;
  }

  // 从 HTML 标签属性中解析文档实际文字色
  _olActualFg(at) {
    const m = /(?:^|;)\s*color\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))/i.exec(at || '');
    return m ? m[1] : null;
  }

  _olExtractMarks(headings) {

    const editor = this.getEditor();
    if (!editor) return headings.map(() => []);
    const text = editor.getValue();
    const lines = text.split('\n');
    const RE = /\*\*(.+?)\*\*|<(?:mark|span)([^>]*)>(.+?)<\/(?:mark|span)>|==(.+?)==/g;
    const allMarks = [];
    for (let i = 0; i < headings.length; i++) {
      const startLine = headings[i].pos;
      const endLine = i < headings.length - 1 ? headings[i + 1].pos : lines.length;
      const sectionText = lines.slice(startLine, endLine).join('\n');
      const marks = [];
      let k = 0, m;
      RE.lastIndex = 0;
      while ((m = RE.exec(sectionText)) !== null) {
        const ty = m[1] != null ? 'b' : m[3] != null ? 'h' : 'o';
        const x = m[1] ?? m[3] ?? m[4];
        const at = m[2] || '';
        const before = sectionText.substring(0, m.index).split('\n');
        const line = startLine + before.length - 1;
        const ch = before[before.length - 1].length;
        if (this._olCfg.t[ty] && [...x].length >= this._olCfg.n) {
          const c = this._olCkey(ty, at, x);
          if (c) marks.push({ k, ty, x, c, cc: ty === 'h' ? this._olActualColor(at) : null, fc: ty === 'h' ? this._olActualFg(at) : null, line, ch });
        }
        k++;
      }
      allMarks.push(marks);
    }
    return allMarks;
  }

  // 跨标签页重建大纲内容：等 metadataCache 就绪，headings 为空则重试，避免窗口空白
  _olRebuildWithRetry() {
    clearTimeout(this._olRebuildTimer);
    let tries = 0;
    const run = () => {
      const hs = this._olGetHeadings();
      if (hs.length > 0 || tries >= 8) {
        this._buildOutlineContent();
        this._olMarkCurrent();
        this._attachOLScroll();
        this._olSyncScroll();
        return;
      }
      tries++;
      this._olRebuildTimer = setTimeout(run, 80);
    };
    this._olRebuildTimer = setTimeout(run, 120);
  }

  _buildOutlineContent() {
    const panel = this._outlinePanel;
    const pl = this._olPl;
    if (!panel || !pl) return;
    let headings = this._olGetHeadings();
    if (headings.length === 0) {
      const file = this.app.workspace.activeLeaf?.view?.file;
      headings = [{ level: 1, text: file?.basename || '', pos: 0, i: 0, g: 0 }];
    }
    this._olHeadings = headings;
    this._olBuildTree();
    const allMarks = this._olExtractMarks(headings);
    this._olAllMarks = allMarks;
    this._olMarks = allMarks.map(a => a.filter(m => !this._olCfg.f[m.c]));
    this._olSyncUI();
    const v = this._olCfg.v;
    pl.classList.toggle('vz', v === 'a' || v === 'c');
    let html;
    if (v === 'a') html = this._olBuildGroup();
    else if (v === 'c') html = this._olBuildMatrix();
    else html = this._olBuildTitle();
    const s0 = pl.scrollTop;
    pl.innerHTML = `<div class="minimap-outline-inner"><i class="minimap-outline-rail"></i><i class="minimap-outline-fill" id="ol-fl"></i>${html}</div>`;
    pl.scrollTop = s0;
  }

  _olMkItem(i, m) {
    const COL = this._olColMap();
    const col = m.cc || COL[m.c] || '#c8c8c8'; // 指示色优先用文档实际色（HTML 标签色），否则用设定色
    const lv = Math.min(this._olHeadings[i]?.level || 2, 6);
    const cls = lv >= 2 ? `m${lv}` : '';
    const tx = this._olEsc(m.x);
    const fg = m.fc || (this.settings.olFgColors || {})[m.c];
    let label;
    if (m.ty === 'b') label = `<b>${tx}</b>`;
    else label = `<mark style="background:${col}${fg ? `;color:${fg}` : ''}">${tx}</mark>`;
    return `<div class="minimap-outline-it mk ${cls}" data-i="${i}" data-k="${m.k}"><span class="minimap-outline-mi ${m.ty}" style="--ol-c:${col}"></span><span class="tx" title="${tx}">${label}</span></div>`;
  }

  _olMkh(i) {
    const L = this._olMarks[i];
    if (!L || !L.length) return '';
    if (this._olCfg.v === 'h') return '';
    if (this._olCfg.v !== 'b') return L.map(m => this._olMkItem(i, m)).join('');
    const by = {};
    L.forEach(m => (by[m.c] = by[m.c] || []).push(m));
    const ks = this._olKeys().filter(k => by[k]);
    const lv = Math.min(this._olHeadings[i]?.level || 2, 6);
    const cls = lv >= 2 ? `m${lv}` : '';
    return `<div class="minimap-outline-crowb ${cls}">` + ks.map(k => {
      const ex = this._olEx.has(i + ':' + k);
      return `<span class="minimap-outline-cd${ex ? ' on' : ''}" data-i="${i}" data-c="${k}" title="${this._olNm(k)} ${by[k].length}"><i style="background:${this._olColMap()[k]}"></i>${by[k].length}</span>`;
    }).join('') + '</div>' + ks.filter(k => this._olEx.has(i + ':' + k)).map(k => by[k].map(m => this._olMkItem(i, m)).join('')).join('');
  }

  // 构建多层级标题树：_olParent[i]=父标题索引(-1=根)，_olRoot[i]=所属根标题索引，h._ch=直接子标题索引；
  // 并预计算方案C导轨：_olDepths[i]=树深度，_olGuides[i]=导轨列 HTML（标题/点阵/矩阵视图共用）
  _olBuildTree() {
    const headings = this._olHeadings;
    const parent = {}, root = {}, roots = [];
    const stack = [];
    headings.forEach((h, i) => {
      h._ch = [];
      while (stack.length && stack[stack.length - 1].level >= h.level) stack.pop();
      if (stack.length) {
        const top = stack[stack.length - 1];
        parent[i] = top.i;
        root[i] = root[top.i];
        top.h._ch.push(i);
      } else {
        parent[i] = -1;
        root[i] = i;
        roots.push(i);
      }
      stack.push({ i, level: h.level, h });
    });
    this._olParent = parent;
    this._olRoot = root;
    this._olRoots = roots;
    const depths = {}, guides = {};
    const walk = (arr, depth, chain) => arr.forEach((i, idx) => {
      const hasNext = idx < arr.length - 1;
      depths[i] = depth;
      guides[i] = this._olGuideCells(depth, chain, hasNext);
      walk(headings[i]._ch, depth + 1, depth >= 1 ? [...chain, hasNext] : chain);
    });
    walk(roots, 0, []);
    this._olDepths = depths;
    this._olGuides = guides;
  }

  // 方案C 导轨列：每深度一列 18×26；chain[j]=该列祖先是否还有后续兄弟（贯通线）；末列肘线+空心环
  _olGuideCells(depth, chain, hasNext) {
    let gs = '';
    for (let j = 0; j < depth; j++) {
      let inner = '';
      if (j < depth - 1) {
        if (chain[j]) inner = `<path d="M9 0V26" opacity=".55"/>`;
      } else {
        inner = `<path d="M9 0V9Q9 13 13 13" opacity=".8"/>${hasNext ? `<path d="M9 13V26" opacity=".55"/>` : ''}<circle cx="15.5" cy="13" r="2.4"/>`;
      }
      gs += `<span class="ol-gc ol-gc-j${j % 6}">${inner ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="26" viewBox="0 0 18 26">${inner}</svg>` : ''}</span>`;
    }
    return gs;
  }

  _olBuildTitle() {
    const headings = this._olHeadings;
    const renderList = (arr) => arr.map((i) => {
      const it = headings[i];
      const lv = Math.min((this._olDepths[i] || 0) + 1, 6);
      const mk = this._olMkh(i);
      const ch = it._ch || [];
      const kids = renderList(ch);
      const hk = ch.length > 0 || !!mk;
      const n = ch.length + (this._olMarks[i]?.length || 0);
      const gs = this._olGuides[i] || '';
      return `<div class="minimap-outline-gp${hk ? ' hk' : ''}" data-i="${i}"><div class="minimap-outline-it l${lv}" data-i="${i}">${gs}<span class="minimap-outline-ch">▸</span><span class="tx" title="${this._olEsc(it.text)}">${this._olEsc(it.text)}</span>${n ? `<span class="minimap-outline-cnt">${n}</span>` : ''}</div><div class="minimap-outline-kids">${mk}${kids}</div></div>`;
    }).join('');
    return renderList(this._olRoots || []);
  }

  _olCounts() {
    const c = {};
    this._olAllMarks.forEach(a => a.forEach(m => c[m.c] = (c[m.c] || 0) + 1));
    return c;
  }

  _olLegend() {
    const c = this._olCounts();
    const COL = this._olColMap();
    return '<div class="minimap-outline-legend">' + this._olKeys().filter(k => c[k]).map(k => {
      const off = this._olCfg.f[k] ? ' off' : '';
      return `<span class="minimap-outline-lc${off}" data-c="${k}" title="${this._olNm(k)}"><i style="background:${COL[k]}"></i><em>${this._olNm(k)} ${c[k]}</em></span>`;
    }).join('') + '</div>';
  }

  _olNumOf(i) {
    const headings = this._olHeadings;
    const it = headings[i];
    const m = it.text.match(/^(\d+\.\d+|[一二三四五六七八九十]+)/);
    if (m) return m[1];
    const g = headings[it.g]?.text.match(/^[一二三四五六七八九十]+/);
    return (g ? g[0] : '') + '·';
  }

  _olBuildGroup() {
    const headings = this._olHeadings;
    const g = {};
    headings.forEach((_, i) => this._olMarks[i].forEach(m => (g[m.c] = g[m.c] || []).push([i, m])));
    const COL = this._olColMap();
    return this._olLegend() + (this._olKeys().filter(k => g[k]).map(k => {
      return `<div class="minimap-outline-zg"><div class="minimap-outline-zh" data-c="${k}"><span class="minimap-outline-zc">▾</span><i class="sw" style="background:${COL[k]}"></i><span class="minimap-outline-zn" title="${t('olRename')}">${this._olNm(k)}</span><span class="minimap-outline-cnt">${g[k].length}</span></div><div class="minimap-outline-zi">` + g[k].map(([i, m]) => {
        const dp = this._olDepths[i] || 0;
        return `<div class="minimap-outline-it mk minimap-outline-za" data-i="${i}" data-k="${m.k}" style="margin-left:${16 + dp * 14}px"><span class="ol-gd ol-gc-j${dp % 6}"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="0 0 12 20"><circle cx="6" cy="10" r="2.6"/></svg></span><span class="minimap-outline-mi ${m.ty}" style="--ol-c:${COL[m.c]}"></span><span class="tx" title="${this._olEsc(m.x)}">${this._olEsc(m.x)}</span><span class="minimap-outline-rf" title="${this._olEsc(headings[i].text)}">${this._olNumOf(i)}</span></div>`;
      }).join('') + '</div></div>';
    }).join('') || `<div class="minimap-outline-empty">${t('olNoMarks')}</div>`);
  }

  _olBuildMatrix() {
    const headings = this._olHeadings;
    const c = this._olCounts();
    const ks = this._olKeys().filter(k => c[k] && !this._olCfg.f[k]);
    const COL = this._olColMap();
    const cols = `1fr repeat(${ks.length || 1}, 22px)`;
    return this._olLegend() + headings.map((it, i) => {
      const cells = ks.map(k => {
        const L = this._olMarks[i].filter(m => m.c === k);
        return L.length ? `<span class="minimap-outline-cc" data-i="${i}" data-c="${k}" style="background:${COL[k]}" title="${this._olNm(k)} ${L.length}：${this._olEsc(L.map(m => m.x).join(' / '))}">${L.length}</span>` : '<span class="minimap-outline-c0"></span>';
      }).join('');
      const lv = Math.min((this._olDepths[i] || 0) + 1, 6);
      return `<div class="minimap-outline-it minimap-outline-crw l${lv}" data-i="${i}" style="grid-template-columns:${cols}"><span class="txc">${this._olGuides[i] || ''}<span class="tx" title="${this._olEsc(it.text)}">${this._olEsc(it.text)}</span></span>${cells}</div>`;
    }).join('');
  }

  _olClick(e) {
    if (this._olPeer?.justMoved) return;
    const lc = e.target.closest('.minimap-outline-lc');
    if (lc) {
      e.stopPropagation();
      this._olCfg.f[lc.dataset.c] = !this._olCfg.f[lc.dataset.c];
      this._saveOLCfg();
      this._buildOutlineContent();
      this._olMarkCurrent();
      return;
    }
    const zh = e.target.closest('.minimap-outline-zh');
    if (zh) {
      e.stopPropagation();
      if (!e.target.isContentEditable) zh.parentNode.classList.toggle('c');
      return;
    }
    const cd = e.target.closest('.minimap-outline-cd');
    if (cd) {
      e.stopPropagation();
      const key = cd.dataset.i + ':' + cd.dataset.c;
      this._olEx.has(key) ? this._olEx.delete(key) : this._olEx.add(key);
      this._buildOutlineContent();
      this._olMarkCurrent();
      return;
    }
    const cc = e.target.closest('.minimap-outline-cc');
    if (cc) {
      e.stopPropagation();
      const i = +cc.dataset.i;
      const m = this._olMarks[i]?.find(x => x.c === cc.dataset.c);
      if (m) this._olJumpToMark(i, m.k);
      return;
    }
    const ch = e.target.closest('.minimap-outline-ch');
    if (ch) {
      e.stopPropagation();
      const gp = ch.closest('.minimap-outline-gp');
      const i = gp ? +gp.dataset.i : -1;
      if (i >= 0) {
        const open = !gp.classList.contains('open');
        this._olMan.set(i, open);
        if (open) {
          // 展开时确保祖先链全部展开
          let p = this._olParent?.[i] ?? -1;
          while (p >= 0) { this._olMan.set(p, true); p = this._olParent?.[p] ?? -1; }
          // 手风琴模式：折叠同级（含祖先链上的同级）
          if (this._olBranch) {
            const closeSibs = (el) => {
              [...(el.parentElement?.children || [])].forEach(sib => {
                if (sib !== el && sib.classList?.contains('minimap-outline-gp')) this._olMan.set(+sib.dataset.i, false);
              });
            };
            closeSibs(gp);
            let pel = gp.parentElement?.closest('.minimap-outline-gp');
            while (pel) { closeSibs(pel); pel = pel.parentElement?.closest('.minimap-outline-gp'); }
          }
        }
        this._olMarkCurrent();
      }
      return;
    }
    const it = e.target.closest('.minimap-outline-it');
    if (!it) return;
    e.stopPropagation();
    const i = +it.dataset.i;
    if (it.dataset.k !== undefined) { this._olJumpToMark(i, +it.dataset.k); return; }
    this._jumpToHeadingInActiveDoc(this._olHeadings[i]?.text, i);
    this._olFlashHeading(i);
  }

  _olJumpToMark(i, k) {
    const marks = this._olAllMarks[i];
    if (!marks) return;
    const m = marks.find(x => x.k === k);
    if (!m) return;
    if (this.isReadingMode()) {
      const viewEl = this.app.workspace.activeLeaf?.view?.containerEl;
      const readingEl = viewEl?.querySelector('.markdown-reading-view, .markdown-preview-view');
      if (readingEl) {
        const domHeadings = readingEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const startH = domHeadings[i];
        const endH = domHeadings[i + 1];
        const allEls = readingEl.querySelectorAll('strong, mark, span[style*="background"]');
        let count = 0;
        for (const el of allEls) {
          if (startH && el.compareDocumentPosition(startH) & Node.DOCUMENT_POSITION_PRECEDING) continue;
          if (endH && el.compareDocumentPosition(endH) & Node.DOCUMENT_POSITION_FOLLOWING) continue;
          if (count === k) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); this._olFlash(el); return; }
          count++;
        }
      }
    }
    const editor = this.getEditor();
    if (editor) {
      editor.setCursor({ line: m.line, ch: m.ch });
      editor.scrollIntoView({ from: { line: m.line, ch: m.ch }, to: { line: m.line, ch: m.ch + (m.x?.length || 1) } }, true);
    }
  }

  _olFlash(el) {
    if (!el) return;
    el.classList.remove('minimap-outline-flash');
    void el.offsetWidth;
    el.classList.add('minimap-outline-flash');
  }

  _olFlashHeading(i) {
    if (this.isReadingMode()) {
      const viewEl = this.app.workspace.activeLeaf?.view?.containerEl;
      const readingEl = viewEl?.querySelector('.markdown-reading-view, .markdown-preview-view');
      if (readingEl) {
        const domHeadings = readingEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const h = domHeadings[i];
        if (h) this._olFlash(h);
      }
    }
  }

  _olSyncScroll() {

    const scrollEl = this._getScrollContainer();
    if (!scrollEl) return;
    const scrollTop = scrollEl.scrollTop;
    const max = scrollEl.scrollHeight - scrollEl.clientHeight;
    const p = max > 0 ? scrollTop / max : 0;
    const pctTxt = Math.round(p * 100) + '%';
    const pct = this._olDock?.querySelector('#ol-pct');
    if (pct) pct.textContent = pctTxt;
    if (this._olFoldChip) this._olFoldChip.textContent = pctTxt;
    const fl = this._olPl?.querySelector('#ol-fl');
    if (fl && fl.parentNode) fl.style.height = Math.max(0, (fl.parentNode.clientHeight - 24) * p) + 'px';
    const headings = this._olHeadings;
    if (!headings.length) return;
    let curIdx = -1;
    if (this.isReadingMode()) {
      const viewEl = this.app.workspace.activeLeaf?.view?.containerEl;
      const readingEl = viewEl?.querySelector('.markdown-reading-view, .markdown-preview-view');
      if (readingEl) {
        const domHeadings = readingEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const containerTop = scrollEl.getBoundingClientRect().top;
        for (let i = 0; i < domHeadings.length; i++) {
          if (domHeadings[i].getBoundingClientRect().top <= containerTop + 40) curIdx = i;
          else break;
        }
      }
    } else {
      const editor = this.getEditor();
      let resolved = false;
      if (editor && editor.posAtCoords && scrollEl) {
        const r = scrollEl.getBoundingClientRect();
        try {
          const pos = editor.posAtCoords({ left: r.left + 4, top: r.top + 40 }, false);
          if (pos && typeof pos.line === 'number') {
            const topLine = pos.line;
            for (let i = 0; i < headings.length; i++) {
              if (headings[i].pos <= topLine) curIdx = i;
              else break;
            }
            resolved = true;
          }
        } catch (e) {}
      }
      if (!resolved && editor && editor.getScrollInfo) {
        const si = editor.getScrollInfo();
        const topLine = Math.floor(si.top / 24);
        for (let i = 0; i < headings.length; i++) {
          if (headings[i].pos <= topLine) curIdx = i;
          else break;
        }
      }
    }
    if (curIdx !== this._olCurIdx) {
      this._olCurIdx = curIdx;
      // 手风琴模式：当前标题一旦变化即清除手动折叠残留，展开状态完全由当前位置的祖先链决定
      if (this._olBranch) this._olMan.clear();
      this._olMarkCurrent();
    }
  }

  _olMarkCurrent() {
    const pl = this._olPl;

    if (!pl) return;
    const headings = this._olHeadings;
    const cur = this._olCurIdx;
    const effCur = (cur >= 0 && cur < headings.length) ? cur : (headings.length ? 0 : -1);
    const cg = effCur >= 0 ? (this._olRoot?.[effCur] ?? headings[effCur].g) : -1;
    // 当前标题的祖先链（含自身）：手风琴模式下默认只展开这条链
    const ancSet = new Set();
    const par = this._olParent || {};
    for (let p = effCur; p !== undefined && p >= 0; p = par[p] ?? -1) ancSet.add(p);
    pl.querySelectorAll('.minimap-outline-gp').forEach(gp => {
      const i = +gp.dataset.i;
      const m = this._olMan.get(i);
      gp.classList.toggle('anc', i === cg);
      gp.classList.toggle('open', m !== undefined ? m : (this._olBranch ? ancSet.has(i) : true));
    });
    pl.querySelectorAll('.minimap-outline-it').forEach(el => {
      const mk = el.classList.contains('mk');
      el.classList.toggle('cur', !mk && +el.dataset.i === cur);
      el.classList.toggle('incur', mk && headings[+el.dataset.i]?.g === cg);
    });
    const curEl = pl.querySelector('.minimap-outline-it.cur') || pl.querySelector('.minimap-outline-it.incur');
    if (curEl && this._outlinePanel?.classList.contains('show')) {
      const target = curEl.getBoundingClientRect().top - pl.getBoundingClientRect().top + pl.scrollTop - pl.clientHeight / 2;
      pl.scrollTo({ top: target, behavior: 'smooth' });
    }
  }

  _applyOutlineMargin() {
    if (!this.settings.outlinePinnedMargin) return;
    const activeLeaf = this.app.workspace.activeLeaf;
    if (!activeLeaf) return;
    const containerEl = activeLeaf.view.containerEl;
    if (!containerEl) return;
    let contentEl;
    if (this.isReadingMode()) {
      contentEl = containerEl.querySelector('.markdown-reading-view') ||
                  containerEl.querySelector('.markdown-preview-view');
    } else {
      contentEl = containerEl.querySelector('.cm-content') ||
                  containerEl.querySelector('.cm-editor') ||
                  containerEl.querySelector('.markdown-source-view');
    }
    if (contentEl) {
      if (this._outlineOriginalMarginRight === undefined) {
        this._outlineOriginalMarginRight = contentEl.style.marginRight || '';
      }
      contentEl.style.marginRight = `${this._olPeer?._win.w || 270}px`;
    }
  }

  _removeOutlineMargin() {
    if (this._outlineOriginalMarginRight !== undefined) {
      const activeLeaf = this.app.workspace.activeLeaf;
      if (activeLeaf) {
        const containerEl = activeLeaf.view.containerEl;
        if (containerEl) {
          let contentEl;
          if (this.isReadingMode()) {
            contentEl = containerEl.querySelector('.markdown-reading-view') ||
                        containerEl.querySelector('.markdown-preview-view');
          } else {
            contentEl = containerEl.querySelector('.cm-content') ||
                        containerEl.querySelector('.cm-editor') ||
                        containerEl.querySelector('.markdown-source-view');
          }
          if (contentEl) {
            contentEl.style.marginRight = this._outlineOriginalMarginRight;
          }
        }
      }
      this._outlineOriginalMarginRight = undefined;
    }
  }

  _highlightCurrentHeading() {
    this._olSyncScroll();
  }


  _getScrollContainer() {
    if (this.isReadingMode()) {
      return this.getReadingViewScrollEl();
    }
    const leaf = this.app.workspace.activeLeaf;
    if (!leaf) return null;
    return leaf.view.containerEl.querySelector('.cm-scroller') || leaf.view.containerEl;
  }

  _ensureMatchListResizeHandles() {
    if (!this.matchList) return;
    this._ensureMatchListDock();
    if (!this.matchList.querySelector('.minimap-match-list-rz')) {
      ['l', 'r', 'b', 'bl', 'br'].forEach(d => {
        const rz = document.createElement('i');
        rz.className = `minimap-match-list-rz ${d}`;
        rz.dataset.d = d;
        this.matchList.appendChild(rz);
      });
    }
    // chip 非独立模式时回到 dock
    if (this._searchPeer && this._searchPeer.mode !== 'detached') {
      this._searchPeer.chipToDock();
    }
  }

  _ensureMatchListDock() {
    if (!this.matchList) return null;
    let dock = this.matchList.querySelector('.minimap-match-list-dock');
    if (!dock) {
      dock = document.createElement('div');
      dock.className = 'minimap-match-list-dock';
      this.matchList.insertBefore(dock, this.matchList.firstChild);
    }
    // 划词开关 chip：引用常驻，innerHTML 清空后重新挂回 dock；
    // Swift chip 弹出为独立按钮后，它自然前移到 dock 首位
    if (!this._selMatchToggle) this._selMatchToggle = this._createSelectionMatchToggle();
    if (this._selMatchToggle.parentElement !== dock) dock.appendChild(this._selMatchToggle);
    return dock;
  }

  _clearMatchListContent() {
    this.matchList.innerHTML = '';
    // dock + 划词开关 chip 始终重建（detached 时窗口内也保留开关）
    this._ensureMatchListDock();
    // Swift chip 引用仍在（JS 对象），放回新建的 dock
    if (this._searchPeer && this._searchPeer.mode !== 'detached') {
      this._searchPeer.chipToDock();
    }
  }

  setupListWheel() {
    if (!this.matchList) return;
    
    this.matchList.addEventListener('wheel', this.boundListWheel, { passive: false });
    if (this.previewPanel) {
      this.previewPanel.addEventListener('wheel', this.boundListWheel, { passive: false });
    }
  }

  handleListWheel(e) {
    if (!e.ctrlKey) return;
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    
    if (this.isPreviewOpen && this.previewPanel) {
      this.previewOpacity = Math.max(0.1, Math.min(1.0, this.previewOpacity + delta));
      this.previewPanel.style.opacity = this.previewOpacity;
    } else {
      this.listOpacity = Math.max(0.1, Math.min(1.0, this.listOpacity + delta));
      this.matchList.style.opacity = this.listOpacity;
    }
    
    this.saveListData();
  }

  registerEditorField() {
    const editor = this.getEditor();
    if (!editor || !editor.cm) return;

    if (!this.decorationField) {
      this.decorationField = matchHighlightField;
      editor.cm.dispatch({
        effects: StateEffect.appendConfig.of([this.decorationField])
      });
    }
    if (!this.jumpDecoField) {
      this.jumpDecoField = jumpHighlightField;
      editor.cm.dispatch({
        effects: StateEffect.appendConfig.of([this.jumpDecoField])
      });
    }

    this.matchHighlightPlugin = MatchHighlightPlugin;
  }

  setupPinnedMatchHover() {
    const editor = this.getEditor();
    if (!editor || !editor.cm) return;

    const cm = editor.cm;
    const scrollDOM = cm.scrollDOM;
    if (!scrollDOM) return;

    if (this._pinnedMatchHoverHandler) {
      scrollDOM.removeEventListener('mouseover', this._pinnedMatchHoverHandler);
    }

    this._pinnedMatchHoverHandler = (e) => {
      const target = e.target;
      if (!target.classList || !target.classList.contains('minimap-editor-match')) return;
      if (!target.classList.contains('pinned')) return;
      if (this._isListVisible) return;

      const selection = target.dataset.selection;
      if (!selection) return;

      const savedItem = this.savedMatchLists.find(item => item.selection === selection && item.pinned);
      if (!savedItem) return;

      this._searchGeneration++;
      this._triggeredByIndicator = true;
      
      const targetRect = target.getBoundingClientRect();
      this.lastIndicatorCoords = {
        screenX: targetRect.right + 10,
        screenY: targetRect.top + targetRect.height / 2,
        targetRect: targetRect
      };
      this._currentIndicatorSelection = selection;
      this._currentIndicatorMatchCount = savedItem.matchCount;
      this.showMatchList(selection, savedItem.matchCount);
    };

    scrollDOM.addEventListener('mouseover', this._pinnedMatchHoverHandler);
  }

  applyEditorPadding() {
    const activeLeaf = this.app.workspace.activeLeaf;
    if (!activeLeaf) return;
    
    const containerEl = activeLeaf.view.containerEl;
    if (!containerEl) return;
    
    if (this.isReadingMode()) {
      this.editorContentEl = containerEl.querySelector('.markdown-reading-view') ||
                             containerEl.querySelector('.markdown-preview-view');
    } else {
      this.editorContentEl = containerEl.querySelector('.cm-content') || 
                             containerEl.querySelector('.cm-editor') ||
                             containerEl.querySelector('.markdown-source-view');
    }
    
    if (this.editorContentEl) {
      this.originalPaddingRight = this.editorContentEl.style.paddingRight || '';
      const minimapWidth = this.minimapContainer ? this.minimapContainer.offsetWidth : 80;
      const padding = this.settings.editorPadding || 10;
      this.editorContentEl.style.paddingRight = `${minimapWidth + padding}px`;
    }
  }

  removeEditorPadding() {
    if (this.editorContentEl) {
      this.editorContentEl.style.paddingRight = this.originalPaddingRight;
    }
  }

  applyHideStatusBar() {
    const statusBar = document.querySelector('.status-bar');
    if (!statusBar) return;

    if (this.settings.hideStatusBar) {
      statusBar.classList.add('minimap-hide-statusbar');
    } else {
      statusBar.classList.remove('minimap-hide-statusbar');
    }
  }

  setupScrollListener() {
    if (this.scrollHandler) {
      document.removeEventListener('scroll', this.scrollHandler, true);
    }
    
    const activeLeaf = this.app.workspace.activeLeaf;
    if (activeLeaf) {
      if (this.isReadingMode()) {
        this.editorScrollEl = this.getReadingViewScrollEl() || activeLeaf.view.containerEl;
      } else {
        this.editorScrollEl = activeLeaf.view.containerEl.querySelector('.cm-scroller') || 
                             activeLeaf.view.containerEl.querySelector('.markdown-source-view') ||
                             activeLeaf.view.containerEl;
      }
    }
    
    this.scrollHandler = (e) => {
      if (this.isDragging) return;
      this.updateViewport();
      this.updatePinnedIndicatorsPosition();
    };
    
    document.addEventListener('scroll', this.scrollHandler, true);
    
    if (this.editorScrollEl) {
      this.editorScrollEl.addEventListener('scroll', this.scrollHandler);
    }
  }

  // Get current visible line range using CodeMirror API
  getVisibleLineRange() {
    if (this.isReadingMode()) {
      const scrollEl = this.getReadingViewScrollEl();
      if (!scrollEl) return null;
      const totalLines = this.getTotalLines();
      const scrollTop = scrollEl.scrollTop;
      const clientHeight = scrollEl.clientHeight;
      const scrollHeight = scrollEl.scrollHeight;
      const scrollRatio = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0;
      const viewportRatio = scrollHeight > 0 ? clientHeight / scrollHeight : 1;
      const startLine = Math.floor(scrollRatio * totalLines);
      const visibleLines = Math.max(1, Math.floor(viewportRatio * totalLines));
      const endLine = Math.min(totalLines - 1, startLine + visibleLines - 1);
      return {
        startLine: startLine,
        endLine: endLine,
        visibleLines: visibleLines,
        totalLines: totalLines,
        scrollTop: scrollTop,
        scrollHeight: scrollHeight,
        clientHeight: clientHeight
      };
    }

    const editor = this.getEditor();
    if (!editor || !editor.cm) return null;
    
    const cm = editor.cm;
    const scrollDOM = cm.scrollDOM;
    if (!scrollDOM) return null;
    
    const scrollTop = scrollDOM.scrollTop;
    const clientHeight = scrollDOM.clientHeight;
    
    // Get total line count
    const totalLines = cm.state.doc.lines;
    
    // Get the line at the top of the viewport
    const topLine = cm.lineBlockAtHeight(scrollTop);
    const startLine = topLine ? topLine.from : 0;
    
    // Get the line at the bottom of the viewport
    const bottomLine = cm.lineBlockAtHeight(scrollTop + clientHeight);
    const endLine = bottomLine ? bottomLine.from : cm.state.doc.length;
    
    // Convert positions to line numbers (0-indexed)
    const startLineNumber = cm.state.doc.lineAt(startLine).number - 1;
    const endLineNumber = cm.state.doc.lineAt(endLine).number - 1;
    
    // Calculate how many lines are visible
    const visibleLines = endLineNumber - startLineNumber + 1;
    
    return {
      startLine: startLineNumber,
      endLine: endLineNumber,
      visibleLines: visibleLines,
      totalLines: totalLines,
      scrollTop: scrollTop,
      scrollHeight: scrollDOM.scrollHeight,
      clientHeight: clientHeight
    };
  }

  hexToRgba(color, alpha) {
    if (color.startsWith('rgba')) {
      return color.replace(/rgba\(([^,]+),\s*([^,]+),\s*([^,]+),\s*[^)]+\)/, `rgba($1, $2, $3, ${alpha})`);
    }
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  _highlightKeywordsInElement(el, keywords, colors) {
    if (!el || !keywords || keywords.length === 0) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }
    for (const textNode of textNodes) {
      const text = textNode.textContent;
      if (!text) continue;
      let hasAnyMatch = false;
      for (const kw of keywords) {
        if (text.toLowerCase().includes(kw.toLowerCase())) {
          hasAnyMatch = true;
          break;
        }
      }
      if (!hasAnyMatch) continue;

      const fragment = document.createDocumentFragment();
      let remaining = text;
      while (remaining.length > 0) {
        let earliestIdx = remaining.length;
        let earliestKwIdx = -1;
        for (let ki = 0; ki < keywords.length; ki++) {
          const idx = remaining.toLowerCase().indexOf(keywords[ki].toLowerCase());
          if (idx !== -1 && idx < earliestIdx) {
            earliestIdx = idx;
            earliestKwIdx = ki;
          }
        }
        if (earliestKwIdx === -1) {
          fragment.appendChild(document.createTextNode(remaining));
          break;
        }
        if (earliestIdx > 0) {
          fragment.appendChild(document.createTextNode(remaining.slice(0, earliestIdx)));
        }
        const kw = keywords[earliestKwIdx];
        const color = colors[earliestKwIdx];
        const mark = document.createElement('mark');
        mark.textContent = remaining.slice(earliestIdx, earliestIdx + kw.length);
        mark.style.cssText = `background:${color}33;color:${color};padding:0 2px;border-radius:3px;font-weight:600;`;
        fragment.appendChild(mark);
        remaining = remaining.slice(earliestIdx + kw.length);
      }
      textNode.parentNode.replaceChild(fragment, textNode);
    }
  }

  // Get total line count
  getTotalLines() {
    if (this.isReadingMode()) {
      const content = this.minimapContent.textContent || '';
      return content.split('\n').length;
    }
    const editor = this.getEditor();
    if (!editor) return 0;
    
    const content = editor.getValue();
    return content.split('\n').length;
  }

  // Get current scroll position as line number (0-indexed)
  getCurrentTopLine() {
    if (this.isReadingMode()) {
      const scrollEl = this.getReadingViewScrollEl();
      if (!scrollEl) return 0;
      const totalLines = this.getTotalLines();
      if (totalLines <= 0) return 0;
      const scrollRatio = scrollEl.scrollTop / Math.max(1, scrollEl.scrollHeight - scrollEl.clientHeight);
      return Math.floor(scrollRatio * totalLines);
    }

    const editor = this.getEditor();
    if (!editor || !editor.cm) return 0;
    
    const cm = editor.cm;
    const scrollDOM = cm.scrollDOM;
    if (!scrollDOM) return 0;
    
    const scrollTop = scrollDOM.scrollTop;
    const topBlock = cm.lineBlockAtHeight(scrollTop);
    if (topBlock) {
      return cm.state.doc.lineAt(topBlock.from).number - 1;
    }
    return 0;
  }

  // Get how many lines are visible in the viewport
  getVisibleLineCount() {
    if (this.isReadingMode()) {
      const scrollEl = this.getReadingViewScrollEl();
      if (!scrollEl) return 1;
      const totalLines = this.getTotalLines();
      if (totalLines <= 0) return 1;
      const viewportRatio = scrollEl.clientHeight / Math.max(1, scrollEl.scrollHeight);
      return Math.max(1, Math.floor(viewportRatio * totalLines));
    }

    const editor = this.getEditor();
    if (!editor || !editor.cm) return 1;
    
    const cm = editor.cm;
    const scrollDOM = cm.scrollDOM;
    if (!scrollDOM) return 1;
    
    const scrollTop = scrollDOM.scrollTop;
    const clientHeight = scrollDOM.clientHeight;
    
    const topBlock = cm.lineBlockAtHeight(scrollTop);
    const bottomBlock = cm.lineBlockAtHeight(scrollTop + clientHeight);
    
    if (topBlock && bottomBlock) {
      const startLine = cm.state.doc.lineAt(topBlock.from).number;
      const endLine = cm.state.doc.lineAt(bottomBlock.from).number;
      return Math.max(1, endLine - startLine + 1);
    }
    return 1;
  }

  setupSliderEvents() {
    if (!this.slider || !this.minimapContainer) return;

    this.slider.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.isDragging = true;
      this.slider.classList.add('dragging');
      this.dragStartY = e.clientY;
      this.dragStartLine = this.getCurrentTopLine();
    });

    this.minimapContainer.addEventListener('mousedown', (e) => {
      if (e.target === this.slider) return;
      if (e.target.classList.contains('minimap-highlight')) return;
      if (e.button !== 0) return;
      this.jumpToPosition(e);
    });
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();

    if (!this.minimapContainer) return;
    const containerHeight = this.minimapContainer.clientHeight;
    const deltaY = e.clientY - this.dragStartY;

    const totalLines = this.getTotalLines();
    if (totalLines <= 0) return;

    const lineHeightInMinimap = 2;
    const naturalContentHeight = totalLines * lineHeightInMinimap;
    const contentHeight = Math.min(containerHeight, naturalContentHeight);

    const lineDelta = (deltaY / contentHeight) * totalLines;
    const newLine = this.dragStartLine + lineDelta;
    const clampedLine = Math.max(0, Math.min(newLine, totalLines - 1));

    this.scrollToLine(clampedLine);
  }

  scrollToLine(lineNumber) {
    if (this.isReadingMode()) {
      const scrollEl = this.getReadingViewScrollEl();
      if (!scrollEl) return;
      const file = this.app.workspace.activeLeaf?.view?.file;
      if (!file) return;
      this.app.vault.read(file).then(content => {
        const lines = content.split('\n');
        if (lineNumber < 0 || lineNumber >= lines.length) return;
        // Calculate approximate scroll position based on line ratio
        const ratio = lineNumber / Math.max(1, lines.length - 1);
        const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
        scrollEl.scrollTop = ratio * scrollHeight;
      }).catch(() => {});
      if (this.currentSelection) {
        setTimeout(() => this.highlightMatches(), 10);
      }
      return;
    }

    const editor = this.getEditor();
    if (!editor || !editor.cm) return;
    
    const cm = editor.cm;
    const doc = cm.state.doc;
    
    if (lineNumber < 0 || lineNumber >= doc.lines) return;
    
    const line = doc.line(lineNumber + 1);
    
    // Scroll the DOM directly without changing cursor
    if (cm.scrollDOM) {
      const lineBlock = cm.lineBlockAt(line.from);
      if (lineBlock) {
        cm.scrollDOM.scrollTop = lineBlock.top;
      }
    }
    
    // Re-apply highlights after scroll
    if (this.currentSelection) {
      setTimeout(() => this.highlightMatches(), 10);
    }
  }

  handleMouseUp(e) {
    if (this.isDragging) {
      this.isDragging = false;
      if (this.slider) {
        this.slider.classList.remove('dragging');
      }
      if (this.currentSelection) {
        setTimeout(() => this.highlightMatches(), 10);
      }
    } else if (!this.isJumping && !this.isInteractingWithList) {
      // Don't trigger handleSelection if mouseup is inside the match list (text selection)
      const isInsideMatchList = this.matchList && this.matchList.contains(e.target);
      const isInsideKeywordBtn = e.target.closest('.swift-match-keyword-btn-wrapper');
      if (!isInsideMatchList && !isInsideKeywordBtn) {
        this.handleSelection();
      }
      this.isJumping = false;
    }
    this.isInteractingWithList = false;
  }

  handleWheel(e) {
    e.preventDefault();
    
    // Alt + wheel: adjust opacity
    if (e.altKey) {
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      this.opacity = Math.max(0.1, Math.min(1, this.opacity + delta));
      if (this.minimapContainer) {
        this.minimapContainer.style.opacity = this.opacity;
      }
    } else {
      // Normal wheel: scroll document page by page
      if (this.isReadingMode()) {
        const scrollEl = this.getReadingViewScrollEl();
        if (!scrollEl) return;
        const clientHeight = scrollEl.clientHeight;
        const scrollAmount = clientHeight * 0.9;
        const direction = e.deltaY > 0 ? 1 : -1;
        scrollEl.scrollTop += direction * scrollAmount;
      } else {
    const editor = this.getEditor();

    if (!editor || !editor.cm) return;
        
        const cm = editor.cm;
        if (!cm.scrollDOM) return;
        
        const clientHeight = cm.scrollDOM.clientHeight;
        const scrollAmount = clientHeight * 0.9; // Scroll 90% of page height
        
        const direction = e.deltaY > 0 ? 1 : -1;
        cm.scrollDOM.scrollTop += direction * scrollAmount;
      }
    }
  }

  jumpToPosition(e) {
    const totalLines = this.getTotalLines();
    if (totalLines <= 0) return;

    const containerHeight = this.minimapContainer.clientHeight;
    const containerRect = this.minimapContainer.getBoundingClientRect();
    const clickY = e.clientY - containerRect.top;

    const lineHeightInMinimap = 2;
    const naturalContentHeight = totalLines * lineHeightInMinimap;
    const contentHeight = Math.min(containerHeight, naturalContentHeight);

    const ratio = clickY / contentHeight;
    const targetLine = Math.floor(ratio * totalLines);
    const clampedLine = Math.max(0, Math.min(targetLine, totalLines - 1));

    this.isJumping = true;
    
    if (this.isReadingMode()) {
      this.scrollToLine(clampedLine);
    } else {
      const editor = this.getEditor();
      if (editor && editor.cm) {
        try {
          this.jumpToMatch({ line: clampedLine, pos: 0 });
        } catch (err) {
          this.scrollToLine(clampedLine);
        }
      } else {
        this.scrollToLine(clampedLine);
      }
    }
  }

  jumpToMatch(targetMatch) {
    if (this.isReadingMode()) {
      const scrollEl = this.getReadingViewScrollEl();
      if (!scrollEl) return;
      const file = this.app.workspace.activeLeaf?.view?.file;
      if (!file) return;
      this.app.vault.read(file).then(content => {
        const lines = content.split('\n');
        const lineNumber = targetMatch.line;
        if (lineNumber < 0 || lineNumber >= lines.length) return;
        const ratio = lineNumber / Math.max(1, lines.length - 1);
        const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
        scrollEl.scrollTop = ratio * scrollHeight;
      }).catch(() => {});
      this.isJumping = true;
      setTimeout(() => {
        this.isJumping = false;
      }, 150);
      return;
    }

    const editor = this.getEditor();
    if (!editor) return;

    const cm = editor.cm;
    if (!cm) return;

    this.isJumping = true;

    const line = cm.state.doc.line(targetMatch.line + 1);
    const foundPos = line.from + targetMatch.pos;

    const originalSelection = this.currentSelection;
    const originalCursor = this.currentCursor;

    cm.dispatch({
      selection: { anchor: foundPos },
      scrollIntoView: { range: { from: foundPos, to: foundPos } }
    });

    setTimeout(() => {
      if (!this.isJumping) return;
      this.currentSelection = originalSelection;
      this.currentCursor = originalCursor;
      if (this.currentSelection) {
        this.highlightMatches();
      }
      this.isJumping = false;
    }, 150);
  }

  getEditor() {
    return this.app.workspace.activeLeaf?.view?.editor || null;
  }

  showPinIcon() {
    if (!this.settings.pinIconEnabled) return;
    if (!this.currentSelection) return;
    if (this._pinIcon) return;

    // Check if current selection is already pinned
    const exactPinned = this.savedMatchLists.find(m => m.selection === this.currentSelection && m.pinned);
    // Check if current selection contains any pinned texts
    const containedPinned = this.savedMatchLists.filter(m => m.pinned && this.currentSelection.includes(m.selection));

    // Save current pin icon position before hiding (in case it was dragged)
    if (this._pinIcon && this.settings.pinIconMode === 'fixed') {
      this.settings.pinIconFixedLeft = parseFloat(this._pinIcon.style.left);
      this.settings.pinIconFixedTop = parseFloat(this._pinIcon.style.top);
    }

    this.hidePinIcon();

    const icon = document.createElement('div');
    icon.className = 'minimap-pin-icon';
    icon.style.position = 'fixed';
    icon.style.zIndex = '9999';
    icon.style.cursor = 'pointer';
    icon.style.width = `${this.settings.pinIconSize}px`;
    icon.style.height = `${this.settings.pinIconSize}px`;
    icon.style.borderRadius = '50%';
    icon.style.fontSize = `${Math.round(this.settings.pinIconSize * 0.55)}px`;
    icon.style.fontWeight = '700';
    icon.style.display = 'flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    icon.style.opacity = this.settings.pinIconOpacity;
    icon.style.transition = 'opacity 0.15s, transform 0.15s';
    icon.style.userSelect = 'none';
    icon.style.lineHeight = '1';
    icon.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';

    if (exactPinned) {
      // Current selection is pinned - show unpin button (SVG unpin icon, theme accent color)
      icon.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><mask id="unpin-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="#fff"/><path d="M3 3L21 21" stroke="#000" stroke-width="5"/></mask><g mask="url(#unpin-cut)"><g transform="rotate(45 12 12)"><path d="M9 3h6l-.8 6.2L17 12v2H7v-2l2.8-2.8z"/><path d="M12 14v7"/></g></g><path d="M3 3L21 21"/></svg>';
      icon.title = t('unpin');
      icon.style.backgroundColor = 'transparent';
      icon.style.color = 'var(--interactive-accent)';
      icon.style.borderRadius = '0';
      icon.style.boxShadow = 'none';
    } else if (containedPinned.length > 0) {
      // Current selection contains pinned texts - show clear button (SVG unpin icon, theme accent color)
      icon.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><mask id="unpin-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="#fff"/><path d="M3 3L21 21" stroke="#000" stroke-width="5"/></mask><g mask="url(#unpin-cut)"><g transform="rotate(45 12 12)"><path d="M9 3h6l-.8 6.2L17 12v2H7v-2l2.8-2.8z"/><path d="M12 14v7"/></g></g><path d="M3 3L21 21"/></svg>';
      icon.title = t('clearPinned', containedPinned.length);
      icon.style.backgroundColor = 'transparent';
      icon.style.color = 'var(--interactive-accent)';
      icon.style.borderRadius = '0';
      icon.style.boxShadow = 'none';
    } else {
      // Not pinned - show pin button (SVG pin icon, theme accent color)
      icon.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(45 12 12)"><path d="M9 3h6l-.8 6.2L17 12v2H7v-2l2.8-2.8z"/><path d="M12 14v7"/></g></svg>';
      icon.title = t('pinMatch');
      icon.style.backgroundColor = 'transparent';
      icon.style.color = 'var(--interactive-accent)';
      icon.style.borderRadius = '0';
      icon.style.boxShadow = 'none';
    }

    if (this.settings.pinIconMode === 'follow') {
      const ox = this.settings.pinIconFollowOffsetX ?? 15;
      const oy = this.settings.pinIconFollowOffsetY ?? -10;
      icon.style.left = `${this._lastMouseX + ox}px`;
      icon.style.top = `${this._lastMouseY + oy}px`;
    } else {
      // Fixed position: use saved position or default to right side of editor
      if (this.settings.pinIconFixedLeft != null && this.settings.pinIconFixedTop != null) {
        icon.style.left = `${this.settings.pinIconFixedLeft}px`;
        icon.style.top = `${this.settings.pinIconFixedTop}px`;
      } else {
        const leaf = this.app.workspace.activeLeaf;
        if (leaf) {
          const rect = leaf.view.containerEl.getBoundingClientRect();
          icon.style.left = `${rect.right - 40}px`;
          icon.style.top = `${rect.top + 10}px`;
        } else {
          icon.style.left = `${window.innerWidth - 50}px`;
          icon.style.top = '100px';
        }
      }
    }

    icon.addEventListener('mouseenter', () => {
      icon.style.transform = 'scale(1.2)';
      icon.style.opacity = '1';
    });
    icon.addEventListener('mouseleave', () => {
      icon.style.transform = 'scale(1)';
      icon.style.opacity = this.settings.pinIconOpacity;
    });

    // Click to pin
    let clickDisabled = false;

    icon.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      this.isInteractingWithList = true;
    });

    icon.addEventListener('click', (e) => {
      if (clickDisabled) {
        clickDisabled = false;
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      if (exactPinned) {
        // Unpin the exact match
        this.removePinnedSelection(this.currentSelection);
      } else if (containedPinned.length > 0) {
        // Remove all contained pinned items
        for (const item of containedPinned) {
          const idx = this.savedMatchLists.findIndex(m => m.selection === item.selection && m.pinned);
          if (idx >= 0) {
            this.savedMatchLists.splice(idx, 1);
          }
        }
        this.saveListData();
        this.clearHighlights();
        this.showPinnedDecorations();
        if (this.currentSelection) {
          this.highlightMatches();
        }
      } else {
        // Pin current selection
        this.pinCurrentSelection();
      }
      this.hidePinIcon();
    });

    // Drag support for fixed mode
    if (this.settings.pinIconMode === 'fixed') {
      let isDraggingIcon = false;
      let hasDragged = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let dragOffsetX = 0;
      let dragOffsetY = 0;

      icon.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDraggingIcon = true;
        hasDragged = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragOffsetX = e.clientX - icon.getBoundingClientRect().left;
        dragOffsetY = e.clientY - icon.getBoundingClientRect().top;
        icon.style.transition = 'none';

        const onDragMove = (e) => {
          if (!isDraggingIcon) return;
          const dx = e.clientX - dragStartX;
          const dy = e.clientY - dragStartY;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            if (!hasDragged) {
              hasDragged = true;
              icon.style.cursor = 'grabbing';
            }
            const newLeft = e.clientX - dragOffsetX;
            const newTop = e.clientY - dragOffsetY;
            icon.style.left = `${newLeft}px`;
            icon.style.top = `${newTop}px`;
          }
        };

        const onDragEnd = (e) => {
          if (!isDraggingIcon) return;
          isDraggingIcon = false;
          icon.style.cursor = 'pointer';
          icon.style.transition = 'opacity 0.15s, transform 0.15s';
          if (hasDragged) {
            // Was a drag - save position and prevent click
            clickDisabled = true;
            this.settings.pinIconFixedLeft = parseFloat(icon.style.left);
            this.settings.pinIconFixedTop = parseFloat(icon.style.top);
            this.saveSettings();
          }
          document.removeEventListener('mousemove', onDragMove);
          document.removeEventListener('mouseup', onDragEnd);
        };

        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
      });
    }

    document.body.appendChild(icon);
    this._pinIcon = icon;

    // Follow mouse mode: show icon at current mouse position, then stay fixed
    if (this.settings.pinIconMode === 'follow') {
      const ox = this.settings.pinIconFollowOffsetX ?? 15;
      const oy = this.settings.pinIconFollowOffsetY ?? -10;
      icon.style.left = `${this._lastMouseX + ox}px`;
      icon.style.top = `${this._lastMouseY + oy}px`;
    }
  }

  hidePinIcon() {
    if (this._pinIcon) {
      this._pinIcon.remove();
      this._pinIcon = null;
    }
  }

  pinCurrentSelection() {
    if (!this.currentSelection) return;

    const multiKeywords = this.parseMultiKeywords(this.currentSelection);
    if (multiKeywords) {
      const keywordColors = this.getMultiKeywordColors(multiKeywords.length);
      const currentFile = this.app.workspace.activeLeaf?.view?.file;
      const currentFilePath = currentFile ? currentFile.path : '';
      const currentFileName = currentFile ? currentFile.basename : '';

      for (let ki = 0; ki < multiKeywords.length; ki++) {
        const kw = multiKeywords[ki];
        const color = keywordColors[ki];
        const existingIndex = this.savedMatchLists.findIndex(m => m.selection === kw);
        if (existingIndex >= 0) {
          this.savedMatchLists[existingIndex].pinned = true;
          this.savedMatchLists[existingIndex].borderColor = color;
          this.savedMatchLists[existingIndex].counterBgColor = color;
          this.savedMatchLists[existingIndex].counterColor = '#aba6a6';
          this.savedMatchLists[existingIndex]._multiKeywordParent = this.currentSelection;
          if (!this.savedMatchLists[existingIndex].filePath) {
            this.savedMatchLists[existingIndex].filePath = currentFilePath;
            this.savedMatchLists[existingIndex].fileName = currentFileName;
          }
        } else {
          this.savedMatchLists.unshift({
            selection: kw,
            pinned: true,
            colorIndex: 0,
            borderColor: color,
            counterBgColor: color,
            counterColor: '#aba6a6',
            matchCount: 0,
            filePath: currentFilePath,
            fileName: currentFileName,
            _multiKeywordParent: this.currentSelection
          });
        }
      }

      this.saveListData();
      this.clearHighlights();
      this.showPinnedDecorations();
      return;
    }

    // Calculate next color index
    const pinnedItems = this.savedMatchLists.filter(m => m.pinned);
    const nextColorIndex = pinnedItems.length % this.settings.pinColorSchemes.length;
    const colorScheme = this.settings.pinColorSchemes[nextColorIndex];

    const currentFile = this.app.workspace.activeLeaf?.view?.file;
    const currentFilePath = currentFile ? currentFile.path : '';

    const existingIndex = this.savedMatchLists.findIndex(m => m.selection === this.currentSelection);
    if (existingIndex >= 0) {
      this.savedMatchLists[existingIndex].pinned = true;
      this.savedMatchLists[existingIndex].colorIndex = nextColorIndex;
      this.savedMatchLists[existingIndex].borderColor = colorScheme.borderColor;
      this.savedMatchLists[existingIndex].counterBgColor = colorScheme.counterBgColor;
      this.savedMatchLists[existingIndex].counterColor = colorScheme.counterColor;
      if (!this.savedMatchLists[existingIndex].filePath) {
        this.savedMatchLists[existingIndex].filePath = currentFilePath;
        this.savedMatchLists[existingIndex].fileName = currentFile ? currentFile.basename : '';
      }
    } else {
      this.savedMatchLists.unshift({
        selection: this.currentSelection,
        pinned: true,
        colorIndex: nextColorIndex,
        borderColor: colorScheme.borderColor,
        counterBgColor: colorScheme.counterBgColor,
        counterColor: colorScheme.counterColor,
        matchCount: 0,
        filePath: currentFilePath,
        fileName: currentFile ? currentFile.basename : ''
      });
    }

    this.saveListData();
    // Re-apply highlights with pinned colors
    this.clearHighlights();
    this.showPinnedDecorations();
    // Also re-highlight current selection on top
    if (this.currentSelection) {
      this.highlightMatches();
    }
  }

  unpinSelection(selection) {
    const item = this.savedMatchLists.find(m => m.selection === selection && m.pinned);
    if (item) {
      item.pinned = false;
      delete item.colorIndex;
      delete item.borderColor;
      delete item.counterBgColor;
      delete item.counterColor;
      if (item._multiKeywordParent) {
        const parent = item._multiKeywordParent;
        this.savedMatchLists.forEach(m => {
          if (m._multiKeywordParent === parent && m.pinned) {
            m.pinned = false;
            delete m.colorIndex;
            delete m.borderColor;
            delete m.counterBgColor;
            delete m.counterColor;
          }
        });
      }
      this.saveListData();
    }
    this.clearHighlights();
    this.showPinnedDecorations();
    if (this.currentSelection) {
      this.highlightMatches();
    }
  }

  removePinnedSelection(selection) {
    const item = this.savedMatchLists.find(m => m.selection === selection);
    if (item && item._multiKeywordParent) {
      const parent = item._multiKeywordParent;
      this.savedMatchLists = this.savedMatchLists.filter(m => m._multiKeywordParent !== parent);
      this.saveListData();
    } else {
      const index = this.savedMatchLists.findIndex(m => m.selection === selection);
      if (index >= 0) {
        this.savedMatchLists.splice(index, 1);
        this.saveListData();
      }
    }
    this.clearHighlights();
    this.showPinnedDecorations();
    if (this.currentSelection) {
      this.highlightMatches();
    }
  }

  isReadingMode() {
    const leaf = this.app.workspace.activeLeaf;
    if (!leaf) return false;
    const viewState = leaf.getViewState();
    return viewState && viewState.state && viewState.state.mode === 'preview';
  }

  getReadingViewScrollEl() {
    const leaf = this.app.workspace.activeLeaf;
    if (!leaf) return null;
    const containerEl = leaf.view.containerEl;
    if (!containerEl) return null;

    // Try to find the actual scrolling container by checking which element has scrollable content
    const candidates = [
      containerEl.querySelector('.markdown-reading-view'),
      containerEl.querySelector('.markdown-preview-view'),
      containerEl.querySelector('.workspace-leaf-content'),
      containerEl.querySelector('.view-content'),
    ];

    for (const el of candidates) {
      if (el && el.scrollHeight > el.clientHeight + 1) {
        return el;
      }
    }

    // Fallback: find any scrollable ancestor of the reading view
    const readingView = containerEl.querySelector('.markdown-reading-view') ||
                        containerEl.querySelector('.markdown-preview-view');
    if (readingView) {
      let parent = readingView.parentElement;
      while (parent && parent !== containerEl) {
        if (parent.scrollHeight > parent.clientHeight + 1) {
          return parent;
        }
        parent = parent.parentElement;
      }
    }

    return readingView || containerEl;
  }

  getReadingViewContentEl() {
    const leaf = this.app.workspace.activeLeaf;
    if (!leaf) return null;
    const containerEl = leaf.view.containerEl;
    if (!containerEl) return null;
    return containerEl.querySelector('.markdown-reading-view') ||
           containerEl.querySelector('.markdown-preview-view');
  }

  async getFileContent() {
    const file = this.app.workspace.activeLeaf?.view?.file;
    if (!file) return '';
    try {
      return await this.app.vault.read(file);
    } catch (e) {
      return '';
    }
  }

  registerEvents() {
    // Track mouse position for pin icon follow mode
    document.addEventListener('mousemove', (e) => {
      this._lastMouseX = e.clientX;
      this._lastMouseY = e.clientY;
    });

    this.registerEvent(
      this.app.workspace.on('editor-change', () => {
        this.scheduleUpdate();
      })
    );

    this.registerEvent(
      this.app.workspace.on('active-leaf-change', (leaf) => {
        if (this.isPreviewOpen && this.previewSourceLeaf && leaf !== this.previewSourceLeaf) {
          this.closePreview();
          return;
        }
        // Clear count when document changes if clearCountOnClose is enabled
        if (this.settings.clearCountOnClose) {
          this.savedMatchLists = [];
          this.saveListData();
        }
        this.hidePinIcon();
        this.clearHighlights();
        this.hideAllMatchListIndicators();
        this.setupMinimap();
        this.updateMinimapContent();
        this.handleSelection();
        // Setup SwiftMatch export navigation
        this._setupSwiftMatchExportNav();
      })
    );

    // Listen for mode changes (source <-> reading)
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        if (this._isApplyingReadingHighlights) return;
        this.clearHighlights();
        this.hideAllMatchListIndicators();
        this.setupMinimap();
        this.updateMinimapContent();
        // Re-apply highlights after layout change if there's a current selection
        if (this.currentSelection) {
          setTimeout(() => this.handleSelection(), 150);
        }
      })
    );

    // Handle text selection in reading mode via mouseup
    this._readingModeMouseUpHandler = (e) => {
      if (this.isReadingMode()) {
        // Don't trigger if mouseup is inside the match list (text selection)
        const isInsideMatchList = this.matchList && this.matchList.contains(e.target);
        const isInsideKeywordBtn = e.target.closest('.swift-match-keyword-btn-wrapper');
        if (!isInsideMatchList && !isInsideKeywordBtn) {
          setTimeout(() => this.handleSelection(), 100);
        }
      }
    };
    document.addEventListener('mouseup', this._readingModeMouseUpHandler);

    // Handle keyup for keyboard-based selection in reading mode
    this._readingModeKeyUpHandler = (e) => {
      if (this.isReadingMode() && e.shiftKey) {
        setTimeout(() => this.handleSelection(), 100);
      }
    };
    document.addEventListener('keyup', this._readingModeKeyUpHandler);

    this.registerEvent(
      this.app.vault.on('modify', (file) => {
      })
    );

    this.registerEvent(
      this.app.vault.on('delete', (file) => {
      })
    );

    this.registerEvent(
      this.app.vault.on('rename', (file, oldPath) => {
      })
    );

    window.addEventListener('resize', () => {
      this.updateMinimapContent();
      this._olPeer?.applyGeo();
      this._searchPeer?.applyGeo();
    });

    this.registerInterval(
      window.setInterval(() => {
        this.updateViewport();
      }, 50)
    );
  }

  scheduleUpdate() {
    if (this.updateTimer) clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(() => {
      this.updateMinimapContent();
      this.handleSelection();
    }, 150);
  }

  handleSelection() {
    if (this.isJumping) return;
    if (this.isPreviewOpen) return;

    if (this.isReadingMode()) {
      const sel = window.getSelection();
      const selectionText = sel ? sel.toString().trim() : '';
      if (selectionText.length > 0) {
        if (this._chipSwitching && selectionText === this.currentSelection) return;
        this._chipSwitching = false;
        clearTimeout(this._chipSwitchTimer);
        if (this.currentSelection !== selectionText) this._listUserDismissed = false;
        this.currentSelection = selectionText;
        this.currentCursor = null;
        this.highlightMatches();
        this.showPinIcon();
      } else if (this._isApplyingReadingHighlights) {
        return;
      } else {
        if (this._chipSwitching) return;
        this.currentSelection = '';
        this.hidePinIcon();
        this.clearHighlights();
        this.hideNonPinnedIndicators();
        this.showPinnedDecorations();
      }
    } else {
      const editor = this.getEditor();
      if (!editor) return;

      const selection = editor.getSelection();
      if (selection && selection.trim().length > 0) {
        if (this._chipSwitching && selection.trim() === this.currentSelection) return;
        this._chipSwitching = false;
        clearTimeout(this._chipSwitchTimer);
        if (this.currentSelection !== selection.trim()) this._listUserDismissed = false;
        this.currentSelection = selection.trim();
        this.currentCursor = editor.getCursor();
        this.highlightMatches();
        this.showPinIcon();
      } else {
        if (this._chipSwitching) return;
        this.currentSelection = '';
        this.hidePinIcon();
        this.clearHighlights();
        this.hideNonPinnedIndicators();
        this.showPinnedDecorations();
      }
    }
  }

  highlightMatches() {
    if (!this.minimapContainer || !this.currentSelection || this.isDragging) return;

    this.clearHighlights();
    this.hideAllMatchListIndicators();

    const selection = this.currentSelection;

    if (selection.length < 1) return;

    if (selection.length === 1 && !/[a-zA-Z0-9\u4e00-\u9fa5]/.test(selection)) return;

    this.showAllPinnedIndicators();

    const isReading = this.isReadingMode();

    let content;
    if (isReading) {
      content = this.minimapContent.textContent || '';
    } else {
      const editor = this.getEditor();
      if (!editor || !editor.cm) return;
      content = editor.getValue();
    }

    const containerHeight = this.minimapContainer.clientHeight;
    const lineCount = content.split('\n').length;
    const currentLine = (!isReading && this.currentCursor) ? this.currentCursor.line : -1;

    const lineHeightInMinimap = 2;
    const naturalContentHeight = lineCount * lineHeightInMinimap;
    const contentHeight = Math.min(containerHeight, naturalContentHeight);

    const lines = content.split('\n');
    const matchLines = [];

    const searchLower = selection.toLowerCase();
    for (let i = 0; i < lines.length; i++) {
      const lineLower = lines[i].toLowerCase();
      let pos = 0;
      while ((pos = lineLower.indexOf(searchLower, pos)) !== -1) {
        if (!matchLines.some(m => m.line === i && m.pos === pos)) {
          matchLines.push({ line: i, pos: pos, index: matchLines.length + 1 });
        }
        pos += 1;
      }
    }
    const totalMatches = matchLines.length;

    const fragment = document.createDocumentFragment();

    const currentCursor = (!isReading && this.currentCursor) ? this.currentCursor.ch : 0;

    const currentColorScheme = this.getCurrentSelectionColorScheme();

    for (let idx = 0; idx < matchLines.length; idx++) {
      const match = matchLines[idx];
      const i = match.line;

      const highlight = document.createElement('div');
      highlight.dataset.matchIndex = match.index;

      const highlightHeight = Math.max(4, contentHeight / Math.max(1, lineCount));
      const topPercentage = i / Math.max(1, lineCount - 1);
      const top = topPercentage * contentHeight;

      if (i === currentLine) {
        highlight.className = 'minimap-highlight minimap-highlight-current';
        highlight.style.backgroundColor = currentColorScheme.borderColor;
      } else {
        highlight.className = 'minimap-highlight';
        highlight.style.backgroundColor = currentColorScheme.borderColor;
      }

      highlight.style.left = '0';
      highlight.style.top = `${top}px`;
      highlight.style.width = '100%';
      highlight.style.height = `${highlightHeight}px`;
      highlight.dataset.matchTotal = totalMatches;
      highlight.dataset.line = i;
      highlight.dataset.pos = match.pos;

      const targetMatch = match;
      const tooltip = this.tooltip;

      highlight.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.jumpToMatch(targetMatch);
      });

      highlight.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
      });

      highlight.addEventListener('mouseenter', (e) => {
        if (!tooltip) return;
        tooltip.textContent = `${highlight.dataset.matchIndex}/${highlight.dataset.matchTotal}`;
        tooltip.style.display = 'block';
      });

      highlight.addEventListener('mousemove', (e) => {
        if (!tooltip) return;
        let left = e.clientX + 15;
        let top = e.clientY - 30;
        if (left + 80 > window.innerWidth) left = window.innerWidth - 90;
        if (top < 10) top = 10;
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
      });

      highlight.addEventListener('mouseleave', () => {
        if (!tooltip) return;
        tooltip.style.display = 'none';
      });

      fragment.appendChild(highlight);
      this.highlights.push(highlight);
    }

    this.minimapContainer.appendChild(fragment);

    if (isReading) {
      this.showPinnedDecorations();
      const isCurrentPinned = this.currentSelection && this.savedMatchLists.some(m => m.selection === this.currentSelection && m.pinned);
      if (!isCurrentPinned) {
        this.addReadingViewHighlights(selection, totalMatches, this.getCurrentSelectionColorScheme());
      }
    } else {
      const editor = this.getEditor();
      if (editor && editor.cm) {
        this.addEditorDecorationsWithPinned(editor.cm, matchLines, totalMatches);
      }
    }

    if (totalMatches > 0) {
      this.saveCurrentMatchList(selection, totalMatches);
    } else {
      this.hideAllMatchListIndicators();
    }

    this.showMatchList(selection, matchLines.length);
  }

  addReadingViewHighlights(searchText, totalMatches, colorScheme = null) {
    const readingEl = this.getReadingViewContentEl();
    if (!readingEl) return;

    const savedItem = this.savedMatchLists.find(m => m.selection === searchText);
    const hideCounter = savedItem && savedItem.countHidden;

    this._isApplyingReadingHighlights = true;

    // Disconnect previous observer
    if (this._readingViewObserver) {
      this._readingViewObserver.disconnect();
      this._readingViewObserver = null;
    }
    if (this._readingHighlightRetryTimer) {
      clearTimeout(this._readingHighlightRetryTimer);
      this._readingHighlightRetryTimer = null;
    }

    const borderColor = colorScheme ? colorScheme.borderColor : this.getCurrentSelectionColorScheme().borderColor;

    const counterColor = colorScheme ? colorScheme.counterColor : this.getCurrentSelectionColorScheme().counterColor;
    const counterBgColor = colorScheme ? colorScheme.counterBgColor : this.getCurrentSelectionColorScheme().counterBgColor;
    const counterSize = this.settings.counterSize;
    const counterPadding = '0px 2px';
    const counterTopOffset = `${this.settings.counterTopOffset}px`;

    readingEl.style.setProperty('--minimap-match-color', borderColor);

    readingEl.style.setProperty('--minimap-counter-opacity', 1);
    readingEl.style.setProperty('--minimap-counter-color', counterColor);
    const preset = this.settings.counterStylePreset || 'glass';
    readingEl.style.setProperty('--minimap-counter-bgcolor', preset === 'outlined' ? counterBgColor : this.hexToRgba(counterBgColor, 1));
    readingEl.style.setProperty('--minimap-counter-size', `${counterSize}px`);
    readingEl.style.setProperty('--minimap-counter-padding', counterPadding);
    readingEl.style.setProperty('--minimap-counter-top-offset', counterTopOffset);

    this._readingViewHighlightNodes = [];

    const walker = document.createTreeWalker(readingEl, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    const searchLower = searchText.toLowerCase();
    let matchIndex = 0;

    for (const textNode of textNodes) {
      const text = textNode.textContent;
      const textLower = text.toLowerCase();
      let pos = 0;
      let matchPos;

      const fragments = [];
      let lastEnd = 0;

      while ((matchPos = textLower.indexOf(searchLower, pos)) !== -1) {
        if (matchPos > lastEnd) {
          fragments.push(document.createTextNode(text.substring(lastEnd, matchPos)));
        }

        const mark = document.createElement('mark');
        mark.className = `minimap-reading-match${this.getCounterPresetClass()}${hideCounter ? ' minimap-hide-counter' : ''}`;
        mark.textContent = text.substring(matchPos, matchPos + searchText.length);
        const matchOpacity = this.settings.matchOpacity ?? 0.6;
        const c = this.hexToRgba(borderColor, matchOpacity);
        mark.style.cssText = `margin:0 -0.2em;padding:0 0.2em;-webkit-box-decoration-break:clone;box-decoration-break:clone;background:radial-gradient(farthest-side,${c} 98%,#0000) bottom left,linear-gradient(${c} 0 0) bottom,radial-gradient(farthest-side,${c} 98%,#0000) bottom right;background-size:8px 8px,calc(100% - 8px) 8px;background-repeat:no-repeat;`;
        mark.dataset.matchIndex = ++matchIndex;
        mark.dataset.matchTotal = totalMatches;
        mark.dataset.match = `${matchIndex}/${totalMatches}`;
        fragments.push(mark);
        this._readingViewHighlightNodes.push(mark);

        lastEnd = matchPos + searchText.length;
        pos = lastEnd;
      }

      if (fragments.length > 0) {
        if (lastEnd < text.length) {
          fragments.push(document.createTextNode(text.substring(lastEnd)));
        }
        const parent = textNode.parentNode;
        if (parent) {
          const span = document.createElement('span');
          for (const f of fragments) {
            span.appendChild(f);
          }
          parent.replaceChild(span, textNode);
        }
      }
    }

    // Set up MutationObserver to re-apply highlights when DOM is re-rendered
    const self = this;
    this._readingViewObserver = new MutationObserver((mutations) => {
      // Check if our highlights were removed
      if (!self.currentSelection || self._isApplyingReadingHighlights) return;

      const existingMarks = readingEl.querySelectorAll('mark.minimap-reading-match');
      if (existingMarks.length === 0) {
        // Our highlights were removed, re-apply them
        self._isApplyingReadingHighlights = true;
        if (self._readingHighlightRetryTimer) clearTimeout(self._readingHighlightRetryTimer);
        self._readingHighlightRetryTimer = setTimeout(() => {
          if (self.currentSelection && self.isReadingMode()) {
            self.addReadingViewHighlights(self.currentSelection, self._lastTotalMatches || 0);
          }
        }, 100);
      }
    });

    this._readingViewObserver.observe(readingEl, {
      childList: true,
      subtree: true
    });

    this._lastTotalMatches = totalMatches;

    // Clear the flag after a short delay to allow DOM changes to settle
    setTimeout(() => {
      this._isApplyingReadingHighlights = false;
    }, 300);
  }

  clearReadingViewHighlights() {
    // Disconnect observer before clearing
    if (this._readingViewObserver) {
      this._readingViewObserver.disconnect();
      this._readingViewObserver = null;
    }
    if (this._readingHighlightRetryTimer) {
      clearTimeout(this._readingHighlightRetryTimer);
      this._readingHighlightRetryTimer = null;
    }

    const readingEl = this.getReadingViewContentEl();
    if (!readingEl) return;

    const marks = readingEl.querySelectorAll('mark.minimap-reading-match');
    for (const mark of marks) {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      }
    }

    // Clean up wrapper spans that we may have created
    const wrapperSpans = readingEl.querySelectorAll('span');
    for (const span of wrapperSpans) {
      if (span.className === '' && span.parentNode && !span.dataset.matchIndex) {
        const parent = span.parentNode;
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
        parent.normalize();
      }
    }

    this._readingViewHighlightNodes = [];
  }

  hideAllMatchListIndicators() {
    for (const indicator of this.matchListIndicators) {
      if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }
    this.matchListIndicators = [];
  }

  hideNonPinnedIndicators() {
    const toRemove = [];
    for (const indicator of this.matchListIndicators) {
      if (!indicator.classList.contains('pinned')) {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
        toRemove.push(indicator);
      } else {
        indicator.classList.remove('current');
      }
    }
    this.matchListIndicators = this.matchListIndicators.filter(ind => !toRemove.includes(ind));
  }

  showPinnedIndicators(selection) {
  }

  hidePinnedIndicators(selection) {
  }

  updatePinnedIndicatorsPosition() {
  }

  createMissingPinnedIndicators() {
  }

  async showAllPinnedIndicators() {
    this.createMissingPinnedIndicators();
  }

  async saveCurrentMatchList(selection, matchCount) {
    const file = this.app.workspace.activeLeaf?.view?.file;
    if (!file) return;

    const existingIndex = this.savedMatchLists.findIndex(m => m.selection === selection);
    
    if (existingIndex >= 0) {
      this.savedMatchLists[existingIndex].filePath = file.path;
      this.savedMatchLists[existingIndex].fileName = file.basename;
      this.savedMatchLists[existingIndex].matchCount = matchCount;

      if (!this.isReadingMode()) {
        const editor = this.getEditor();
        if (editor) {
          const cursor = editor.getCursor('from');
          if (cursor) {
            this.savedMatchLists[existingIndex].line = cursor.line;
            this.savedMatchLists[existingIndex].ch = cursor.ch;
          }
        }
      }

      this.saveListData();
    }
  }

  updateFloatingToggleBadge(docCount, matchCount) {
    if (!this.floatingToggle) return;
    const textEl = this.floatingToggleText;
    if (!textEl) return;
    const toggleText = this.settings.floatingToggleText || 'search';
    const isPinned = this.currentSelection && this.savedMatchLists.some(m => m.selection === this.currentSelection && m.pinned);
    if (!this.currentSelection) {
      textEl.textContent = toggleText;
    } else if (docCount > 0) {
      const docStr = docCount > 99 ? '99+' : docCount;
      const matchStr = matchCount > 0 ? (matchCount > 999 ? '999+' : matchCount) : '';
      textEl.textContent = matchStr ? `${docStr}|${matchStr}` : `${docStr}`;
      // Show pin indicator
      if (isPinned) {
        const pinColorScheme = this.savedMatchLists.find(m => m.selection === this.currentSelection && m.pinned);
        if (pinColorScheme && pinColorScheme.borderColor) {
          this.floatingToggle.style.boxShadow = `inset 0 0 0 2px ${pinColorScheme.borderColor}, 0 2px 10px rgba(0,0,0,0.05)`;
        }
      }
    } else {
      textEl.textContent = toggleText;
    }
    // Clear pin border if not pinned
    if (!isPinned && this.floatingToggle) {
      const activeStyle = this.getActiveFloatingStyle();
      const hasCustomStyle = activeStyle ? !!(activeStyle.styleClass || activeStyle.customStyle) : !!(this.settings.floatingToggleStyleClass || this.settings.floatingToggleCustomStyle);
      if (hasCustomStyle) {
        this.floatingToggle.style.boxShadow = '';
      } else {
        this.floatingToggle.style.boxShadow = 'inset 0 0 0 1px rgba(240, 120, 100, 0.4), 0 2px 10px rgba(0, 0, 0, 0.05)';
      }
    }
    // chip 上的匹配信息不再随开关附加删除线
  }

  async _performMatchListSearch(searchText, matchCount, cacheOnly = false) {
    const cacheKey = searchText;
    
    const savedData = this.savedMatchLists.find(m => m.selection === searchText);
    if (savedData && savedData.pinned && savedData.fileMapData) {
      const fileMap = await this.deserializeFileMap(savedData.fileMapData);
      if (fileMap && fileMap.size > 0) {
        this._cachedMatchList = fileMap;
        this._cachedMatchListKey = cacheKey;
        return;
      }
    }

    if (this._cachedMatchList && this._cachedMatchListKey === cacheKey) {
      return;
    }

    this._searchGeneration++;
    const gen = this._searchGeneration;
    this._searchInProgress = true;
    this.floatingToggle?.classList.add('busy');

    const allFiles = this.app.vault.getMarkdownFiles();
    const searchLower = searchText.toLowerCase();
    
    const fileMap = new Map();
    let totalAllDocMatches = 0;
    
    for (const file of allFiles) {
      if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
      if (file.name.toLowerCase().includes(searchLower)) {
        fileMap.set(file, [{ text: file.basename, level: 0, type: 'content' }]);
        totalAllDocMatches += file.name.toLowerCase().split(searchLower).length - 1;
      }
      if (fileMap.size >= 50) break;
    }

    const remainingFiles = allFiles.filter(f => !fileMap.has(f));
    
    for (const file of remainingFiles) {
        if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
        if (fileMap.size >= 50) break;
        
        try {
          const content = await this.app.vault.cachedRead(file);
          if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
          if (content && content.toLowerCase().includes(searchLower)) {
            const lines = content.split('\n');
            const snippets = [];
            for (let i = 0; i < lines.length && snippets.length < 30; i++) {
              const lineLower = lines[i].toLowerCase();
              const idx = lineLower.indexOf(searchLower);
              if (idx !== -1) {
                const trimmed = lines[i].trim();
                if (trimmed.length > 0) {
                  let snippet = trimmed;
                  let fullLine = trimmed;
                  let truncateStart = 0;
                  let truncateEnd = trimmed.length;
                  if (snippet.length > 120) {
                    const matchIdx = snippet.toLowerCase().indexOf(searchLower);
                    truncateStart = Math.max(0, matchIdx - 30);
                    truncateEnd = Math.min(snippet.length, matchIdx + searchLower.length + 70);
                    snippet = snippet.slice(truncateStart, truncateEnd);
                  }
                  snippets.push({ text: snippet, fullLine, truncateStart, truncateEnd });
                }
              }
            }
            if (snippets.length > 0) {
              fileMap.set(file, [{ text: file.basename, level: 0, type: 'content', snippets }]);
              totalAllDocMatches += content.toLowerCase().split(searchLower).length - 1;
            } else {
              fileMap.set(file, [{ text: file.basename, level: 0 }]);
            }
          }
        } catch (e) {
          continue;
        }
      }

    if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
    this._searchInProgress = false; this.floatingToggle?.classList.remove('busy');
    this._cachedMatchList = fileMap;
    this._cachedMatchListKey = cacheKey;
    this._pendingMatchCount = totalAllDocMatches;
    if (cacheKey && fileMap && fileMap.size > 0) {
      this._recentSearchCaches[cacheKey] = { fileMap, matchCount: totalAllDocMatches };
    }
  }

  showMatchListFromFloatingToggle() {
    this._listUserDismissed = false;
    this._listTriggerElement = null;
    const pendingTerm = this._pendingSearchText;
    let restoreTerm, restoreFileMap, restoreMatchCount;
    if (pendingTerm && pendingTerm !== this._lastListSearchTerm) {
      restoreTerm = pendingTerm;
      const memCached = this._recentSearchCaches[pendingTerm];
      if (memCached && memCached.fileMap && memCached.fileMap.size > 0) {
        restoreFileMap = memCached.fileMap;
        restoreMatchCount = memCached.matchCount || this._pendingMatchCount;
      } else if (this._cachedMatchListKey === pendingTerm && this._cachedMatchList) {
        restoreFileMap = this._cachedMatchList;
        restoreMatchCount = this._pendingMatchCount;
      } else {
        restoreFileMap = this._lastListFileMap || this._cachedMatchList;
        restoreMatchCount = this._lastListMatchCount || this._pendingMatchCount;
      }
    } else {
      restoreTerm = this._lastListSearchTerm || pendingTerm;
      restoreFileMap = this._lastListFileMap || this._cachedMatchList;
      restoreMatchCount = this._lastListMatchCount || this._pendingMatchCount;
    }

    if (!restoreFileMap || !restoreTerm) {
      // If search is in progress, show the list and wait for results
      if (this._searchInProgress && pendingTerm) {
        this._isListVisible = true;
        this._showMatchListLoading(pendingTerm);
      }
      return;
    }
    // 有缓存数据时标记为已完成，避免 renderMatchList 自动重新触发全库搜索
    this._exhaustiveSearchDone = true;
    this._pendingShowList = { searchText: restoreTerm, matchCount: restoreMatchCount };
    this._isListVisible = true;
    this.renderMatchList(restoreFileMap, restoreMatchCount, false);
    this._listShownFromHover = true;
  }

  _createSearchChip(term, options = {}) {
    const { isFavorite, isCurrentSearch, searchText } = options;
    const chip = document.createElement('span');
    chip.className = 'minimap-match-list-recent-chip';
    const baseBg = isCurrentSearch ? 'var(--interactive-accent)' : 'var(--background-secondary)';
    const baseColor = isCurrentSearch ? 'var(--text-on-accent)' : 'var(--text-muted)';
    const baseBorder = isCurrentSearch ? 'var(--interactive-accent)' : 'var(--background-modifier-border)';
    chip.style.cssText = `font-size:11px;padding:1px 6px;border-radius:8px;cursor:pointer;border:1px solid ${baseBorder};background:${baseBg};color:${baseColor};white-space:nowrap;transition:background 0.15s,color 0.15s;display:inline-flex;align-items:center;gap:3px;`;
    const chipLabel = document.createElement('span');
    chipLabel.className = 'minimap-match-list-recent-chip-label';
    chipLabel.textContent = term;
    chip.appendChild(chipLabel);

    const isFav = this._favoriteSearches.includes(term);

    const chipStar = document.createElement('span');
    chipStar.textContent = isFav ? '★' : '☆';
    chipStar.style.cssText = `font-size:10px;cursor:pointer;color:${isFav ? '#ff6600' : 'var(--text-faint)'};transition:color 0.15s;line-height:1;flex-shrink:0;`;
    chipStar.title = isFav ? t('removeFavorite') : t('addFavorite');
    chipStar.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.isInteractingWithList = true;
    });
    chipStar.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const favIdx = this._favoriteSearches.indexOf(term);
      if (favIdx >= 0) {
        this._favoriteSearches.splice(favIdx, 1);
        chipStar.textContent = '☆';
        chipStar.style.color = 'var(--text-faint)';
        chipStar.title = t('addFavorite');
      } else {
        this._favoriteSearches.push(term);
        chipStar.textContent = '★';
        chipStar.style.color = '#ff6600';
        chipStar.title = t('removeFavorite');
      }
      this.saveListData();
      const favSection = this.matchList?.querySelector('.swift-match-favorites-section');
      if (favSection) {
        const parent = favSection.parentNode;
        parent.removeChild(favSection);
        const newFavSection = this._createFavoritesSection(searchText);
        const recentSec = this.matchList?.querySelector('.minimap-match-list-recent');
        if (recentSec) {
          parent.insertBefore(newFavSection, recentSec);
        } else {
          parent.appendChild(newFavSection);
        }
      }
    });
    chip.insertBefore(chipStar, chip.firstChild);

    const chipPin = document.createElement('span');
    const isAlreadyFloating = this._floatingKeywordButtons.some(b => b.term === term);
    chipPin.textContent = '📌';
    chipPin.style.cssText = `font-size:9px;cursor:pointer;opacity:${isAlreadyFloating ? '1' : '0.3'};transition:opacity 0.15s;line-height:1;flex-shrink:0;`;
    chipPin.title = isAlreadyFloating ? t('removeFloat') : t('floatThisWord');
    chipPin.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.isInteractingWithList = true;
    });
    chipPin.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const isFloating = this._floatingKeywordButtons.some(b => b.term === term);
      if (isFloating) {
        this.removeFloatingKeywordButton(term);
        chipPin.style.opacity = '0.3';
        chipPin.title = t('floatThisWord');
      } else {
        const cached = this._recentSearchCaches[term];
        if (cached && cached.fileMap && cached.fileMap.size > 0) {
          this.createFloatingKeywordButton(term, cached.fileMap, cached.matchCount);
        } else {
          this.createFloatingKeywordButton(term, new Map(), 0);
        }
        chipPin.style.opacity = '1';
        chipPin.title = t('removeFloat');
      }
    });
    chip.appendChild(chipPin);

    chip.addEventListener('mousedown', (e) => {
      if (e.target === chipStar || e.target === chipPin) return;
      e.stopPropagation();
      this.isInteractingWithList = true;
      if (e.button === 1) {
        e.preventDefault();
        if (isFavorite) {
          const favIdx = this._favoriteSearches.indexOf(term);
          if (favIdx >= 0) this._favoriteSearches.splice(favIdx, 1);
          delete this._recentSearchCaches[term];
          this.deleteSearchCache(term);
          delete this._listScrollPositions[term];
        } else {
          const idx = this._recentSearches.indexOf(term);
          if (idx >= 0) this._recentSearches.splice(idx, 1);
          if (!this._favoriteSearches.includes(term)) {
            delete this._recentSearchCaches[term];
            this.deleteSearchCache(term);
            delete this._listScrollPositions[term];
          }
        }
        this.saveListData();
        chip.remove();
      }
    });
    chip.addEventListener('click', async (e) => {
      if (e.target === chipStar || e.target === chipPin) return;
      e.stopPropagation();
      this.isInteractingWithList = true;
      this._keepListVisible = true;
      this._chipSwitching = true;
      clearTimeout(this._chipSwitchTimer);
      this._chipSwitchTimer = setTimeout(() => { this._chipSwitching = false; }, 5000);
      this.currentSelection = term;
      this._listUserDismissed = false;
      this._exhaustiveSearchDone = false;
      this._pendingSearchText = term;
      if (this._searchInProgress) this._searchGeneration++;
      let cached = this._recentSearchCaches[term];
      if (!cached || !cached.fileMap || cached.fileMap.size === 0) {
        const diskCache = await this.loadSearchCache(term);
        if (diskCache && diskCache.fileMap && diskCache.fileMap.size > 0) {
          cached = diskCache;
          this._recentSearchCaches[term] = diskCache;
        }
      }
      if (cached && cached.fileMap && cached.fileMap.size > 0) {
        this._cachedMatchList = cached.fileMap;
        this._cachedMatchListKey = term;
        this._pendingMatchCount = cached.matchCount;
        this._pendingShowList = { searchText: term, matchCount: cached.matchCount };
        this._exhaustiveSearchDone = true;
        this.highlightMatches();
        if (this._isListVisible) {
          this.renderMatchList(cached.fileMap, cached.matchCount, false);
        }
        this.updateFloatingToggleBadge(cached.fileMap.size, cached.matchCount);
      } else {
        this._pendingShowList = { searchText: term, matchCount: 0 };
        this._cachedMatchList = null;
        this._cachedMatchListKey = null;
        this._pendingMatchCount = 0;
        if (this._isListVisible) {
          this.renderMatchList(new Map(), 0, false);
        }
        this.updateFloatingToggleBadge(0, 0);
        this.highlightMatches();
      }
      this._keepListVisible = false;
    });
    chip.addEventListener('mouseenter', () => {
      if (!isCurrentSearch) {
        chip.style.background = 'var(--background-modifier-hover)';
        chip.style.color = 'var(--text-normal)';
      }
    });
    chip.addEventListener('mouseleave', () => {
      if (!isCurrentSearch) {
        chip.style.background = 'var(--background-secondary)';
        chip.style.color = 'var(--text-muted)';
      }
    });
    return chip;
  }

  _createSearchTabsChips(searchText, activeTab = 'search') {
    const wrap = document.createElement('div');
    wrap.className = 'swift-match-tabs-wrap';
    const favTerms = this._favoriteSearches.slice();
    const recTerms = this._recentSearches.slice(0, 20);

    const tabsEl = document.createElement('div');
    tabsEl.className = 'swift-match-tabs';

    const searchPanel = document.createElement('div');
    searchPanel.className = 'swift-match-panel';
    const favPanel = document.createElement('div');
    favPanel.className = 'swift-match-panel';
    const recPanel = document.createElement('div');
    recPanel.className = 'swift-match-panel';
    const panels = { search: searchPanel, fav: favPanel, rec: recPanel };

    const renderChips = (kind) => {
      const terms = kind === 'fav' ? favTerms : recTerms;
      const panel = panels[kind];
      panel.innerHTML = '';
      if (terms.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'swift-match-panel-empty';
        empty.textContent = kind === 'fav' ? '暂无收藏' : '暂无最近搜索';
        panel.appendChild(empty);
        return;
      }
      const listEl = document.createElement('div');
      listEl.className = 'swift-match-list-vert';
      for (const term of terms) {
        const isCurrentSearch = term === searchText;
        const chip = this._createSearchChip(term, { isFavorite: kind === 'fav', isCurrentSearch, searchText });
        listEl.appendChild(chip);
      }
      panel.appendChild(listEl);
    };

    let tabTimer = null;
    const switchTab = (kind, immediate) => {
      const apply = () => {
        tabsEl.querySelectorAll('.swift-match-tab').forEach(tb => tb.classList.toggle('on', tb.dataset.kind === kind));
        Object.entries(panels).forEach(([k, p]) => { p.style.display = k === kind ? 'flex' : 'none'; });
        if (kind === 'fav' || kind === 'rec') renderChips(kind);
      };
      clearTimeout(tabTimer);
      if (immediate) apply(); else tabTimer = setTimeout(apply, 140);
    };

    const mkTab = (kind, label, count) => {
      const tab = document.createElement('span');
      tab.className = 'swift-match-tab';
      tab.dataset.kind = kind;
      tab.textContent = label;
      if (count != null && count > 0) {
        const cnt = document.createElement('span');
        cnt.className = 'swift-match-tab-count';
        cnt.textContent = String(count);
        tab.appendChild(cnt);
      }
      tab.addEventListener('mouseenter', () => switchTab(kind, false));
      tab.addEventListener('mouseleave', () => clearTimeout(tabTimer));
      tab.addEventListener('click', () => switchTab(kind, true));
      return tab;
    };

    tabsEl.appendChild(mkTab('search', '搜'));
    tabsEl.appendChild(mkTab('fav', '藏', favTerms.length));
    tabsEl.appendChild(mkTab('rec', '近', recTerms.length));

    wrap.appendChild(tabsEl);
    wrap.appendChild(searchPanel);
    wrap.appendChild(favPanel);
    wrap.appendChild(recPanel);

    wrap._panels = panels;
    wrap._switchTab = switchTab;

    switchTab(activeTab, true);
    return wrap;
  }

  _createFavoritesSection(searchText) {
    const section = document.createElement('div');
    section.className = 'swift-match-favorites-section';
    section.style.cssText = 'padding:4px 8px;border-bottom:1px solid var(--background-modifier-border);max-height:80px;overflow-y:auto;display:flex;flex-wrap:wrap;align-items:center;gap:4px;';

    const label = document.createElement('span');
    label.style.cssText = 'font-size:10px;color:var(--text-faint);flex-shrink:0;';
    label.textContent = t('favoriteSearch');
    section.appendChild(label);

    for (const term of this._favoriteSearches) {
      const isCurrentSearch = term === searchText;
      const chip = this._createSearchChip(term, { isFavorite: true, isCurrentSearch, searchText });
      section.appendChild(chip);
    }

    if (this._favoriteSearches.length === 0) {
      section.style.display = 'none';
    }
    if (this._favSectionScrollTop) {
      requestAnimationFrame(() => { section.scrollTop = this._favSectionScrollTop; });
    }
    return section;
  }

  showRecentSearchList() {
    if (!this.matchList) return;
    

    this._clearMatchListContent();
    
    const header = document.createElement('div');
    header.className = 'minimap-match-list-header';
    header.addEventListener('mousedown', (e) => {
      this.isInteractingWithList = true;
    });
    
    const headerText = document.createElement('span');
    headerText.className = 'minimap-match-list-header-text';
    headerText.textContent = t('recentSearch');
    header.appendChild(headerText);

    if (this.floatingSearchBox) {
      this.floatingSearchBox.placeholder = t('searchPlaceholder');
      this.floatingSearchBox.style.marginLeft = '8px';
      header.appendChild(this.floatingSearchBox);
    }


    // 搜/藏/近 三 tab 悬停切换
    const tabsWrap = this._createSearchTabsChips('');
    this.matchList.appendChild(tabsWrap);
    tabsWrap._panels.search.appendChild(header);

    // Add resize handles
    this._ensureMatchListResizeHandles();

    this.matchList.style.display = 'flex';
    this.matchList.style.opacity = this.listOpacity;
    this._isListVisible = true;
    this._listShownFromHover = true;

    if (this.floatingSearchBox) {
      setTimeout(() => { this.floatingSearchBox.focus(); }, 50);
    }
  }

  /**
   * Count words/characters for search limit checking.
   * - Pure CJK text (no spaces): count by characters (each CJK char = 1 unit)
   * - Mixed or Latin text: count by whitespace-separated words
   * This makes searchWordCountMin/Max work correctly for both Chinese and English.
   */
  countWords(text) {
    if (!text) return 0;
    const trimmed = text.trim();
    if (!trimmed) return 0;
    // If text contains CJK characters and no spaces, count CJK chars + non-CJK tokens
    const hasCJK = /[\u4e00-\u9fff\u3400-\u4dbf]/.test(trimmed);
    const hasWhitespace = /\s/.test(trimmed);
    if (hasCJK && !hasWhitespace) {
      // Pure CJK (or CJK + punctuation without spaces): count characters
      return trimmed.length;
    }
    if (hasCJK) {
      // Mixed CJK + Latin with spaces: count CJK chars individually + Latin words
      let count = 0;
      // Count CJK characters
      const cjkMatches = trimmed.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
      if (cjkMatches) count += cjkMatches.length;
      // Count Latin words (non-CJK, non-space sequences)
      const latinMatches = trimmed.match(/[^\s\u4e00-\u9fff\u3400-\u4dbf]+/g);
      if (latinMatches) count += latinMatches.length;
      return count;
    }
    // Pure Latin: count whitespace-separated words
    return trimmed.split(/\s+/).length;
  }

  async showMatchList(searchText, matchCount) {
    if (!this.matchList) return;
    if (!this.settings.enableSelectionMatch) return;

    // Check word count limits before proceeding with background search
    const wordLen = this.countWords(searchText);
    const minWords = this.settings.searchWordCountMin ?? 0;
    const maxWords = this.settings.searchWordCountMax ?? 0;
    if (minWords > 0 && wordLen < minWords) return;
    if (maxWords > 0 && wordLen > maxWords) return;

    // Reset exhaustive search flag when search text changes
    if (this._pendingSearchText !== searchText) {
      this._exhaustiveSearchDone = false;
    }

    // Always cache data and update badge, never auto-show the list
    this._pendingMatchCount = matchCount;
    this._pendingSearchText = searchText;

    // Record to recent searches (skip reorder when switching via chip)
    if (searchText && searchText.length > 0) {
      const idx = this._recentSearches.indexOf(searchText);
      if (idx >= 0) {
        if (!this._chipSwitching) {
          this._recentSearches.splice(idx, 1);
          this._recentSearches.unshift(searchText);
        }
      } else {
        this._recentSearches.unshift(searchText);
      }
      if (this._recentSearches.length > 20) {
        const removed = this._recentSearches.pop();
        if (!this._favoriteSearches.includes(removed)) {
          delete this._recentSearchCaches[removed];
          this.deleteSearchCache(removed);
          delete this._listScrollPositions[removed];
        }
      }
    }

    // When list is pinned to a specific search text
    if (this._listPinnedSearchText && this._listPinnedSearchText !== searchText) {
      this._pendingShowList = { searchText, matchCount };
      const mk = this.parseMultiKeywords(searchText);
      if (mk) {
        this._multiKeywordData = null;
        this._showMatchListLoading(searchText);
        this.performMultiKeywordSearch(searchText, mk);
      } else if (this.settings.exhaustiveMode) {
        this.performExhaustiveSearch(searchText, matchCount, null);
      } else {
        this._performMatchListSearch(searchText, matchCount, true).then(() => {
          const docCount = this._cachedMatchList ? this._cachedMatchList.size : 0;
          this.updateFloatingToggleBadge(docCount, matchCount);
        });
      }
      return;
    }

    // Multi-keyword search (pipe-separated)
    const multiKeywords = this.parseMultiKeywords(searchText);
    if (multiKeywords) {
      this._pendingShowList = { searchText, matchCount };
      this._multiKeywordData = null;
      if (!this._exhaustiveSearchDone) {
        this._exhaustiveSearchDone = true;
        this._showMatchListLoading(searchText);
        this.performMultiKeywordSearch(searchText, multiKeywords);
      } else if (this._cachedMatchList && this._cachedMatchListKey === searchText) {
        this.updateFloatingToggleBadge(this._cachedMatchList.size, this._pendingMatchCount || matchCount);
        if (this._isListVisible) {
          this.renderMatchList(this._cachedMatchList, this._pendingMatchCount || matchCount, false);
        }
      }
      return;
    }

    // In exhaustive mode, skip heading cache and use full-text search directly
    if (this.settings.exhaustiveMode) {
      this._pendingShowList = { searchText, matchCount };
      if (!this._exhaustiveSearchDone) {
        this._exhaustiveSearchDone = true;
        this._showMatchListLoading(searchText);
        this.performExhaustiveSearch(searchText, matchCount, null);
      }
      return;
    }

    // Perform search in background, update badge with doc count
    const cacheKey = searchText;

    const savedData = this.savedMatchLists.find(m => m.selection === searchText);
    if (savedData && savedData.pinned && savedData.fileMapData) {
      const fileMap = await this.deserializeFileMap(savedData.fileMapData);
      if (fileMap && fileMap.size > 0) {
        this._pendingShowList = { searchText, matchCount };
        this._cachedMatchList = fileMap;
        this._cachedMatchListKey = cacheKey;
        this._recentSearchCaches[searchText] = { fileMap, matchCount };
        this.updateFloatingToggleBadge(fileMap.size, matchCount);
      if (this._searchInProgress) this._searchGeneration++;
        if (this._isListVisible) {
          this.renderMatchList(fileMap, matchCount, false);
        }
        return;
      }
    }

    if (this._cachedMatchList && this._cachedMatchListKey === cacheKey) {
      this._pendingShowList = { searchText, matchCount };
      this.updateFloatingToggleBadge(this._cachedMatchList.size, matchCount);
      if (this._searchInProgress) this._searchGeneration++;
      if (this._isListVisible) {
        this.renderMatchList(this._cachedMatchList, matchCount, false);
      }
      return;
    }

    const memCached = this._recentSearchCaches[searchText];
    if (memCached && memCached.fileMap && memCached.fileMap.size > 0) {
      this._cachedMatchList = memCached.fileMap;
      this._cachedMatchListKey = cacheKey;
      this._pendingShowList = { searchText, matchCount };
      this.updateFloatingToggleBadge(memCached.fileMap.size, memCached.matchCount || matchCount);
      if (this._searchInProgress) this._searchGeneration++;
      if (this._isListVisible) {
        this.renderMatchList(memCached.fileMap, memCached.matchCount || matchCount, false);
      }
      return;
    }

    const diskCache = await this.loadSearchCache(searchText);
    if (diskCache && diskCache.fileMap && diskCache.fileMap.size > 0) {
      this._cachedMatchList = diskCache.fileMap;
      this._cachedMatchListKey = cacheKey;
      this._recentSearchCaches[searchText] = diskCache;
      this._pendingShowList = { searchText, matchCount };
      this.updateFloatingToggleBadge(diskCache.fileMap.size, diskCache.matchCount || matchCount);
      if (this._searchInProgress) this._searchGeneration++;
      if (this._isListVisible) {
        this.renderMatchList(diskCache.fileMap, diskCache.matchCount || matchCount, false);
      }
      return;
    }

    this._searchGeneration++;
    const gen = this._searchGeneration;
    this._searchInProgress = true;
    this.floatingToggle?.classList.add('busy');
    this._pendingShowList = { searchText, matchCount };
    this._showMatchListLoading(searchText);

    const allFiles = this.app.vault.getMarkdownFiles();
    const searchLower = searchText.toLowerCase();
    
    const fileMap = new Map();
    let totalAllDocMatches = 0;
    
    for (const file of allFiles) {
      if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
      if (file.name.toLowerCase().includes(searchLower)) {
        fileMap.set(file, [{ text: file.basename, level: 0, type: 'content' }]);
        totalAllDocMatches += file.name.toLowerCase().split(searchLower).length - 1;
      }
      if (fileMap.size >= 50) break;
    }

    if (fileMap.size > 0 && this._searchGeneration === gen) {
      this.updateFloatingToggleBadge(fileMap.size, totalAllDocMatches);
      if (this._isListVisible) {
        this.renderMatchList(fileMap, matchCount, false);
      }
    }

    const remainingFiles = allFiles.filter(f => !fileMap.has(f));
    
    for (const file of remainingFiles) {
        if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
        try {
          const content = await this.app.vault.read(file);
          if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
          if (content && content.toLowerCase().includes(searchLower)) {
            const lines = content.split('\n');
            const snippets = [];
            for (let i = 0; i < lines.length && snippets.length < 30; i++) {
              const lineLower = lines[i].toLowerCase();
              const idx = lineLower.indexOf(searchLower);
              if (idx !== -1) {
                const trimmed = lines[i].trim();
                if (trimmed.length > 0) {
                  let snippet = trimmed;
                  let fullLine = trimmed;
                  let truncateStart = 0;
                  let truncateEnd = trimmed.length;
                  if (snippet.length > 120) {
                    const matchIdx = snippet.toLowerCase().indexOf(searchLower);
                    truncateStart = Math.max(0, matchIdx - 30);
                    truncateEnd = Math.min(snippet.length, matchIdx + searchLower.length + 70);
                    snippet = snippet.slice(truncateStart, truncateEnd);
                  }
                  snippets.push({ text: snippet, fullLine, truncateStart, truncateEnd });
                }
              }
            }
            if (snippets.length > 0 && this._searchGeneration === gen) {
              fileMap.set(file, [{ text: file.basename, level: 0, type: 'content', snippets }]);
              totalAllDocMatches += content.toLowerCase().split(searchLower).length - 1;
              this.updateFloatingToggleBadge(fileMap.size, totalAllDocMatches);
              if (this._isListVisible) {
                const isFirstMatch = fileMap.size === 1;
                this.renderMatchList(fileMap, matchCount, !isFirstMatch);
              }
            }
          }
        } catch (e) {
          continue;
        }
        
        if (fileMap.size >= 50) break;
      }

    if (this._searchGeneration === gen) {
      this._cachedMatchList = fileMap;
      this._cachedMatchListKey = cacheKey;
      this._recentSearchCaches[searchText] = { fileMap, matchCount: totalAllDocMatches };
      this._pendingMatchCount = totalAllDocMatches;
      
      await this.saveMatchListData(searchText, fileMap, totalAllDocMatches);
      if (this._isListVisible) {
        this.renderMatchList(fileMap, totalAllDocMatches, false);
      }
    }

    this._searchInProgress = false; this.floatingToggle?.classList.remove('busy');
    this._pendingMatchCount = totalAllDocMatches;
    return fileMap;
  }

  async saveMatchListData(selection, fileMap, matchCount) {
    const fileMapData = await this.serializeFileMap(fileMap);
    
    const existingIndex = this.savedMatchLists.findIndex(m => m.selection === selection);
    
    const matchData = {
      selection: selection,
      matchCount: matchCount,
      fileMapData: fileMapData,
      timestamp: Date.now()
    };

    if (existingIndex >= 0) {
      this.savedMatchLists[existingIndex] = matchData;
    } else {
      this.savedMatchLists.unshift(matchData);
      if (this.savedMatchLists.length > 100) {
        this.savedMatchLists = this.savedMatchLists.slice(0, 100);
      }
    }

    this.saveListData();
  }

  async serializeFileMap(fileMap) {
    const data = [];
    for (const [file, headings] of fileMap) {
      data.push({
        path: file.path,
        basename: file.basename,
        headings: headings
      });
    }
    return data;
  }

  async deserializeFileMap(data) {
    const fileMap = new Map();
    const allFiles = this.app.vault.getMarkdownFiles();
    
    for (const item of data) {
      const file = allFiles.find(f => f.path === item.path);
      if (file) {
        fileMap.set(file, item.headings);
      }
    }
    
    return fileMap;
  }

  cancelSearch() {
    this._searchGeneration++;
  }

  async performExhaustiveSearch(searchText, matchCount, headerTextEl) {
    this._searchGeneration++;
    const gen = this._searchGeneration;
    this._searchInProgress = true;
    this.floatingToggle?.classList.add('busy');
    const fileMap = new Map();
    const searchLower = searchText.toLowerCase();
    let totalAllDocMatches = 0;

    const extractSnippets = (content, searchLower, maxSnippets = 30) => {
      const lines = content.split('\n');
      const snippets = [];
      for (let i = 0; i < lines.length && snippets.length < maxSnippets; i++) {
        const lineLower = lines[i].toLowerCase();
        const idx = lineLower.indexOf(searchLower);
        if (idx !== -1) {
          const trimmed = lines[i].trim();
          if (trimmed.length > 0) {
            let snippet = trimmed;
            let fullLine = trimmed;
            let truncateStart = 0;
            let truncateEnd = trimmed.length;
            if (snippet.length > 120) {
              const matchIdx = snippet.toLowerCase().indexOf(searchLower);
              truncateStart = Math.max(0, matchIdx - 30);
              truncateEnd = Math.min(snippet.length, matchIdx + searchLower.length + 70);
              snippet = snippet.slice(truncateStart, truncateEnd);
            }
            snippets.push({ text: snippet, fullLine, truncateStart, truncateEnd });
          }
        }
      }
      return snippets;
    };

    try {
      const searchPlugin = this.app.internalPlugins.plugins['search'];
      if (searchPlugin && searchPlugin.instance) {
        const rawResults = searchPlugin.instance.search(searchText);
        if (rawResults) {
          for (const result of rawResults) {
            const file = this.app.vault.getAbstractFileByPath(result.path);
            if (file && file.extension === 'md') {
              const items = [];
              if (result.matches) {
                for (const m of result.matches) {
                  const snippetText = m.match || searchText;
                  items.push({ text: snippetText, level: 0, type: 'content', snippet: snippetText });
                }
              }
              if (items.length === 0) {
                items.push({ text: file.basename, level: 0 });
              }
              totalAllDocMatches += result.matches ? result.matches.length : 1;
              fileMap.set(file, items);
            }
          }
        }
      }
    } catch (e) {
    }

    if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }

    if (fileMap.size === 0) {
      const allFiles = this.app.vault.getMarkdownFiles();
      for (const file of allFiles) {
        if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
        try {
          const nameMatch = file.name.toLowerCase().includes(searchLower);
          const content = await this.app.vault.cachedRead(file);
          if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
          const contentMatch = content && content.toLowerCase().includes(searchLower);
          if (nameMatch || contentMatch) {
            const snippets = contentMatch ? extractSnippets(content, searchLower) : [];
            const items = [{ text: file.basename, level: 0, type: 'content' }];
            if (snippets.length > 0) {
              items[0].snippets = snippets;
            }
            totalAllDocMatches += contentMatch ? (content.toLowerCase().split(searchLower).length - 1) : 1;
            fileMap.set(file, items);
          }
        } catch (e) {
          continue;
        }
        if (fileMap.size >= 200) break;
      }
    }

    if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }

    if (fileMap.size > 0) {
      for (const [file, items] of fileMap) {
        if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
        const hasContentSnippets = items.some(item => item.type === 'content' && (item.snippet || item.snippets));
        if (!hasContentSnippets) {
          try {
            const content = await this.app.vault.cachedRead(file);
            if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
            if (content) {
              const snippets = extractSnippets(content, searchLower);
              for (const item of items) {
                if (item.type === 'content' && !item.snippet && !item.snippets) {
                  item.snippets = snippets;
                  break;
                }
              }
            }
          } catch (e) {
          }
        }
      }
    }

    if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
    this._searchInProgress = false; this.floatingToggle?.classList.remove('busy');
    this._cachedMatchList = fileMap;
    this._cachedMatchListKey = searchText;
    this._pendingShowList = { searchText, matchCount };
    this._pendingMatchCount = totalAllDocMatches;
    this._recentSearchCaches[searchText] = { fileMap, matchCount: totalAllDocMatches };
    this.updateFloatingToggleBadge(fileMap.size, totalAllDocMatches);

    // If list is already visible, refresh it
    if (this._isListVisible) {
      this.renderMatchList(fileMap, totalAllDocMatches, false);
    }
  }

  _showMatchListLoading(searchText) {
    if (!this.matchList) return;
    if (!this._isListVisible) {
      // Don't auto-show the list; just prepare data in the background
      return;
    } else {
      const container = this.matchList.querySelector('.minimap-match-list-container');
      if (container) {
        container.innerHTML = '';
        const loading = document.createElement('div');
        loading.style.cssText = 'padding:16px;text-align:center;color:var(--text-muted);font-size:12px;';
        loading.textContent = t('building');
        container.appendChild(loading);
      }
    }
  }

  renderMatchList(fileMap, matchCount, append = false) {
    if (!this.matchList) return;
    const searchText = this._pendingShowList?.searchText || '';

    // Restore _multiKeywordData if it was cleared but searchText is multi-keyword
    if (!this._multiKeywordData && searchText) {
      const mk = this.parseMultiKeywords(searchText);
      if (mk) {
        const keywordColors = this.getMultiKeywordColors(mk.length);
        this._multiKeywordData = { keywords: mk, keywordColors };
      }
    }

    if (fileMap.size === 0) {
      if (!append && this._pendingShowList?.searchText) {

        this._clearMatchListContent();
        const header = document.createElement('div');
        header.className = 'minimap-match-list-header';
        header.addEventListener('mousedown', (e) => {
          this.isInteractingWithList = true;
        });
        const headerText = document.createElement('span');
        headerText.className = 'minimap-match-list-header-text';
        headerText.textContent = `⏳ ${this._pendingShowList.searchText}`;
        header.appendChild(headerText);
        if (this.floatingSearchBox) {
          this.floatingSearchBox.placeholder = t('searchPlaceholder');
          this.floatingSearchBox.style.marginLeft = '8px';
          header.appendChild(this.floatingSearchBox);
        }

        const tabsWrap0 = this._createSearchTabsChips(this._pendingShowList.searchText);
        this.matchList.appendChild(tabsWrap0);
        tabsWrap0._panels.search.appendChild(header);
        const emptyContainer = document.createElement('div');
        emptyContainer.className = 'minimap-match-list-container';
        emptyContainer.style.cssText = 'padding:12px;text-align:center;color:var(--text-faint);font-size:12px;';
        emptyContainer.textContent = '...';
        tabsWrap0._panels.search.appendChild(emptyContainer);
        if (this._isListVisible) {
          this.matchList.style.display = 'flex';

        }
      } else {
        this.matchList.style.display = 'none';

      }
      return;
    }

    if (!this._pendingShowList) {
      return;
    }

    if (!append) {
      // Preserve resize handle and scroll position when clearing
      const existingResizeHandle = this.matchList.querySelector('.minimap-match-list-resize-handle');
      const listContainer = this.matchList.querySelector('.minimap-match-list-container');
      // Only save current scrollTop if list is visible (display: none yields scrollTop=0)
      if (listContainer && this.matchList.style.display !== 'none') {
        this._savedListScrollTop = listContainer.scrollTop;
      }

      this._clearMatchListContent();
      
      const header = document.createElement('div');
      header.className = 'minimap-match-list-header';
      header.addEventListener('mousedown', (e) => {
        this.isInteractingWithList = true;
      });


      const headerText = document.createElement('span');
      headerText.className = 'minimap-match-list-header-text';
      const totalMatchCount = this._pendingMatchCount || matchCount;
      headerText.textContent = this.settings.exhaustiveMode
        ? t('exhaustiveMatch', fileMap.size, totalMatchCount)
        : t('libraryMatch', fileMap.size, totalMatchCount);
      header.appendChild(headerText);

      if (this.floatingSearchBox) {
        this.floatingSearchBox.placeholder = t('searchPlaceholder');
        this.floatingSearchBox.style.marginLeft = '8px';
        header.appendChild(this.floatingSearchBox);
      }

      // 刷新搜索按钮：手动重新搜索全库
      const refreshBtn = document.createElement('button');
      refreshBtn.className = 'minimap-match-list-refresh-btn';
      refreshBtn.title = t('refreshSearchHint');
      refreshBtn.style.cssText = 'flex-shrink:0;width:20px;height:20px;padding:0;border:none;background:transparent;cursor:pointer;color:var(--text-muted);display:inline-flex;align-items:center;justify-content:center;margin-left:auto;opacity:0.6;transition:opacity 0.15s;';
      refreshBtn.innerHTML = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 8a6 6 0 1 1-1.76-4.24"></path><path d="M14 2v4h-4"></path></svg>`;
      refreshBtn.addEventListener('mouseenter', () => { refreshBtn.style.opacity = '1'; });
      refreshBtn.addEventListener('mouseleave', () => { refreshBtn.style.opacity = '0.6'; });
      refreshBtn.addEventListener('mousedown', (e) => { e.stopPropagation(); e.preventDefault(); this.isInteractingWithList = true; });
      refreshBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const term = this._pendingShowList?.searchText;
        if (!term) return;
        this._exhaustiveSearchDone = false;
        delete this._recentSearchCaches[term];
        this._cachedMatchList = null;
        this._cachedMatchListKey = null;
        this._searchInProgress = false;
        refreshBtn.style.opacity = '1';
        refreshBtn.querySelector('svg').style.animation = 'spin 0.6s linear infinite';
        const mk = this.parseMultiKeywords(term);
        if (mk) {
          this._multiKeywordData = null;
          this._showMatchListLoading(term);
          this.performMultiKeywordSearch(term, mk);
        } else if (this.settings.exhaustiveMode) {
          this._pendingShowList = { searchText: term, matchCount: this._pendingMatchCount || 0 };
          this._showMatchListLoading(term);
          this.performExhaustiveSearch(term, this._pendingMatchCount || 0, null);
        } else {
          this._performMatchListSearch(term, this._pendingMatchCount || 0, false).then(() => {
            if (this._cachedMatchList && this._isListVisible) {
              this.renderMatchList(this._cachedMatchList, this._pendingMatchCount || 0, false);
            }
          });
        }
      });
      header.appendChild(refreshBtn);

      // 搜/藏/近 三 tab 悬停切换
      const tabsWrap = this._createSearchTabsChips(searchText);
      this.matchList.appendChild(tabsWrap);
      const searchPanel = tabsWrap._panels.search;
      searchPanel.appendChild(header);

      const newContainer = document.createElement('div');
      newContainer.className = 'minimap-match-list-container';
      // Save scroll position on every scroll event for robust restoration
      newContainer.addEventListener('scroll', () => {
        const currentTerm = this._pendingShowList?.searchText || this._pendingSearchText;
        if (currentTerm) {
          this._listScrollPositions[currentTerm] = newContainer.scrollTop;
        }
        this._matchListScrollTop = newContainer.scrollTop;
      });
      searchPanel.appendChild(newContainer);
    }

    const listContainer = this.matchList.querySelector('.minimap-match-list-container');
    if (!listContainer) return;

    const existingPaths = new Set();
    listContainer.querySelectorAll('.swift-match-group').forEach(el => {
      existingPaths.add(el.dataset.filePath);
    });

    // 文件颜色方案（不同文件用不同色相）
    const fileHues = [210, 30, 150, 340, 270, 60, 180, 90];
    let globalFileIndex = existingPaths.size;

    fileMap.forEach((items, file) => {
      if (existingPaths.has(file.path)) return;

      const fileHue = fileHues[globalFileIndex % fileHues.length];
      const fileNameBg = `hsl(${fileHue},50%,90%)`;
      const fileNameColor = `hsl(${fileHue},50%,35%)`;
      const dotColor = `hsl(${fileHue},50%,50%)`;

      // 文件分组容器
      const groupEl = document.createElement('div');
      groupEl.className = 'swift-match-group';
      groupEl.dataset.filePath = file.path;
      groupEl.style.cssText = globalFileIndex > existingPaths.size
        ? 'margin-top:8px;padding-top:8px;border-top:1px solid var(--background-modifier-border);'
        : '';

      // 分组标题栏：文件名 + 匹配数量
      const headerEl = document.createElement('div');
      headerEl.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap;cursor:pointer;position:sticky;top:0;background:var(--background-primary);padding:4px 0;z-index:2;';

      const fileNameEl = document.createElement('span');
      fileNameEl.textContent = file.path;
      fileNameEl.style.cssText = `font-size:12px;font-weight:600;color:var(--text-accent);padding:2px 8px;flex-shrink:0;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;`;

      let totalEntries = 0;
      items.forEach(item => {
        if (item.type === 'content' && (item.snippet || (item.snippets && item.snippets.length > 0))) {
          totalEntries += (item.snippets || (item.snippet ? [item.snippet] : [])).length;
        } else {
          totalEntries++;
        }
      });

      const countEl = document.createElement('span');
      countEl.textContent = `${totalEntries}`;
      countEl.style.cssText = `font-size:10px;color:var(--text-faint);background:var(--background-secondary);padding:1px 5px;border-radius:8px;flex-shrink:0;`;

      const expandIcon = document.createElement('span');
      const isExpanded = this._expandedGroups?.[file.path];
      expandIcon.textContent = isExpanded ? '▼' : '▶';
      expandIcon.style.cssText = 'font-size:8px;color:var(--text-faint);flex-shrink:0;transition:transform 0.15s;';

      headerEl.appendChild(expandIcon);
      headerEl.appendChild(fileNameEl);

      // Multi-keyword tags
      const mkData = this._multiKeywordData;
      if (mkData) {
        const matchedKeywords = new Set();
        items.forEach(item => {
          if (item.keyword) matchedKeywords.add(item.keywordIndex);
        });
        const tagContainer = document.createElement('span');
        tagContainer.style.cssText = 'display:flex;gap:3px;flex-wrap:wrap;flex-shrink:0;';
        for (let ki = 0; ki < mkData.keywords.length; ki++) {
          const tag = document.createElement('span');
          const isMatched = matchedKeywords.has(ki);
          tag.textContent = mkData.keywords[ki];
          tag.style.cssText = `font-size:9px;padding:1px 5px;border-radius:6px;white-space:nowrap;${isMatched ? `background:${mkData.keywordColors[ki]}22;color:${mkData.keywordColors[ki]};border:1px solid ${mkData.keywordColors[ki]}44;` : 'background:var(--background-secondary);color:var(--text-faint);border:1px solid var(--background-modifier-border);'}`;
          tagContainer.appendChild(tag);
        }
        headerEl.appendChild(tagContainer);
      }

      headerEl.appendChild(countEl);

      headerEl.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.isInteractingWithList = true;
      });
      headerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!this._expandedGroups) this._expandedGroups = {};
        this._expandedGroups[file.path] = !this._expandedGroups[file.path];
        expandIcon.textContent = this._expandedGroups[file.path] ? '▼' : '▶';
          const allItems = bodyEl.querySelectorAll('.swift-match-item:not(.swift-match-more-line):not(.swift-match-divider)');
        allItems.forEach((el, idx) => {
          if (idx >= 3) {
            el.style.display = this._expandedGroups[file.path] ? 'flex' : 'none';
          }
        });
        const allDividers = bodyEl.querySelectorAll('.swift-match-divider');
        allDividers.forEach((el, idx) => {
          if (idx >= 2) {
            el.style.display = this._expandedGroups[file.path] ? 'block' : 'none';
          }
        });
        const moreLine = bodyEl.querySelector('.swift-match-more-line');
        if (moreLine) moreLine.style.display = this._expandedGroups[file.path] ? 'none' : 'flex';
      });
      groupEl.appendChild(headerEl);

      // 分组内容区
      const bodyEl = document.createElement('div');
      bodyEl.className = 'swift-match-group-body';

      let globalEntryIdx = 0;
      items.forEach((item, i) => {
        // 将 content 类型的 snippets 拆分为独立条目
        let matchEntries = [];
        if (item.type === 'content' && (item.snippet || (item.snippets && item.snippets.length > 0))) {
          const contentSnippets = item.snippets || (item.snippet ? [item.snippet] : []);
          for (const snippetData of contentSnippets) {
            if (typeof snippetData === 'object' && snippetData.text !== undefined) {
              matchEntries.push({ text: snippetData.text, isMarkdown: true, type: 'content', snippetData });
            } else {
              matchEntries.push({ text: String(snippetData), isMarkdown: true, type: 'content', snippetData: null });
            }
          }
        } else if (item.type === 'tag') {
          matchEntries.push({ text: `#${item.text}`, isMarkdown: false, type: 'tag' });
        } else if (item.level > 0) {
          matchEntries.push({ text: item.text, isMarkdown: true, type: 'heading' });
        } else {
          matchEntries.push({ text: item.text || '', isMarkdown: true, type: 'other' });
        }

        matchEntries.forEach((entry, entryIdx) => {
          const entryIdxInGroup = globalEntryIdx++;

          if (entryIdxInGroup > 0) {
            const innerDivider = document.createElement('div');
            innerDivider.className = 'swift-match-item swift-match-divider';
            innerDivider.style.cssText = 'border-top:1px solid var(--background-modifier-border);margin:4px 0;';
            if (entryIdxInGroup >= 3 && !isExpanded) innerDivider.style.display = 'none';
            bodyEl.appendChild(innerDivider);
          }

          // 文本内容（浅色背景卡片，无圆点）
          const itemWrapper = document.createElement('div');
          itemWrapper.className = 'swift-match-item';
          itemWrapper.style.cssText = 'display:flex;align-items:flex-start;gap:6px;background:color-mix(in srgb,var(--interactive-accent) 7%,var(--background-primary));border-radius:6px;padding:4px 8px;margin:2px 0;';
          if (entryIdxInGroup >= 3 && !isExpanded) itemWrapper.style.display = 'none';

          const itemBox = document.createElement('div');
          itemBox.style.cssText = 'flex:1;min-width:0;overflow:hidden;position:relative;';

          const snippetInfo = entry.snippetData;
          const isTruncated = snippetInfo && typeof snippetInfo === 'object' && snippetInfo.fullLine && (snippetInfo.truncateStart > 0 || snippetInfo.truncateEnd < snippetInfo.fullLine.length);

          const expandBtnStyle = 'display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;border:1px solid var(--background-modifier-border);background:var(--background-primary);color:var(--text-muted);font-size:11px;cursor:pointer;vertical-align:middle;line-height:1;padding:0;margin:0 2px;flex-shrink:0;transition:all 0.15s;';

          // 文本内容
          const textEl = document.createElement('div');
          textEl.className = 'swift-match-card-text';
          textEl.style.cssText = 'font-size:12px;overflow:hidden;cursor:text;user-select:text;padding-right:20px;';

          if (isTruncated) {
            let currentStart = snippetInfo.truncateStart;
            let currentEnd = snippetInfo.truncateEnd;
            const snippetKey = `${file.path}:${item.text}:${entryIdx}`;
            if (this._expandedSnippets?.[snippetKey]) {
              currentStart = 0;
              currentEnd = snippetInfo.fullLine.length;
            }

            const renderSnippet = () => {
              textEl.innerHTML = '';
              if (currentStart > 0) {
                const leftBtn = document.createElement('button');
                leftBtn.textContent = '+';
                leftBtn.style.cssText = expandBtnStyle;
                leftBtn.title = t('expandBefore');
                leftBtn.addEventListener('click', (ce) => {
                  ce.preventDefault();
                  ce.stopPropagation();
                  currentStart = 0;
                  if (!this._expandedSnippets) this._expandedSnippets = {};
                  this._expandedSnippets[snippetKey] = true;
                  renderSnippet();
                });
                textEl.appendChild(leftBtn);
              }
              const snippetSpan = document.createElement('span');
              const snippetText = snippetInfo.fullLine.slice(currentStart, currentEnd);
              MarkdownRenderer.renderMarkdown(
                snippetText,
                snippetSpan,
                file.path,
                this
              ).then(() => {
                const renderedContent = snippetSpan.querySelector('p');
                if (renderedContent) {
                  snippetSpan.innerHTML = renderedContent.innerHTML;
                }
                // Re-apply highlights after markdown rendering completes
                const highlightData = this._multiKeywordData;
                if (highlightData) {
                  this._highlightKeywordsInElement(textEl, highlightData.keywords, highlightData.keywordColors);
                } else if (searchText) {
                  const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const regex = new RegExp(`(${escaped})`, 'gi');
                  this._highlightInElement(textEl, regex);
                }
              });
              textEl.appendChild(snippetSpan);
              if (currentEnd < snippetInfo.fullLine.length) {
                const rightBtn = document.createElement('button');
                rightBtn.textContent = '+';
                rightBtn.style.cssText = expandBtnStyle;
                rightBtn.title = t('expandAfter');
                rightBtn.addEventListener('click', (ce) => {
                  ce.preventDefault();
                  ce.stopPropagation();
                  currentEnd = snippetInfo.fullLine.length;
                  if (!this._expandedSnippets) this._expandedSnippets = {};
                  this._expandedSnippets[snippetKey] = true;
                  renderSnippet();
                });
                textEl.appendChild(rightBtn);
              }
            };
            renderSnippet();
          } else if (entry.isMarkdown && entry.text) {
            MarkdownRenderer.renderMarkdown(
              entry.text,
              textEl,
              file.path,
              this
            ).then(() => {
              const renderedContent = textEl.querySelector('p');
              if (renderedContent) {
                textEl.innerHTML = renderedContent.innerHTML;
              }
            });
          } else {
            textEl.textContent = entry.text;
          }

          // Multi-keyword highlight in rendered text
          if (mkData) {
            const applyMkHighlight = () => {
              this._highlightKeywordsInElement(textEl, mkData.keywords, mkData.keywordColors);
            };
            if (entry.isMarkdown || isTruncated) {
              setTimeout(applyMkHighlight, 50);
            } else {
              applyMkHighlight();
            }
          }

          itemBox.appendChild(textEl);

          const jumpBtn = document.createElement('button');
          jumpBtn.className = 'swift-match-jump-btn';
          jumpBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
          jumpBtn.title = t('openDoc');
          jumpBtn.addEventListener('click', async (ce) => {
            ce.preventDefault();
            ce.stopPropagation();
            const selectedText = textEl && window.getSelection() && textEl.contains(window.getSelection().anchorNode) ? window.getSelection().toString().trim() : '';
            this.closePreview();
            this.hideMatchList();
            const jumpSearchText = selectedText || searchText;

            if (item.level > 0 && item.text) {
              const leaf = await this.openFileInNewTabWithHeading(file, item.text, true);

              setTimeout(() => {

                this.app.workspace.setActiveLeaf(leaf, { focus: true });
                if (selectedText) this.jumpToSearchTextInEditor(selectedText);
              }, 1250);
            } else if (item.type === 'tag') {
              const leaf = await this.openFileInNewTab(file, true);

              setTimeout(() => {

                this.app.workspace.setActiveLeaf(leaf, { focus: true });
                this.jumpToTagInEditor(item.text);
                this._releaseRememberCursor(file);
              }, 1250);
            } else {
              const firstSentence = this.getFirstSentence(entry.text);
              const jumpText = selectedText || firstSentence || searchText;
              const leaf = await this.openFileInNewTab(file, true);

              setTimeout(() => {


                this.app.workspace.setActiveLeaf(leaf, { focus: true });
                if (jumpText) this.jumpToSearchTextInEditor(jumpText);
                this._releaseRememberCursor(file);
              }, 1250);
            }
          });
          jumpBtn.addEventListener('mousedown', (e) => { e.stopPropagation(); this.isInteractingWithList = true; });
          itemBox.appendChild(jumpBtn);
          itemWrapper.appendChild(itemBox);
          bodyEl.appendChild(itemWrapper);
        }); // end matchEntries.forEach
      }); // end items.forEach

      if (totalEntries > 3) {
        const moreLine = document.createElement('button');
        moreLine.className = 'swift-match-more-line';
        if (isExpanded) moreLine.style.display = 'none';
        moreLine.textContent = `还有 ${totalEntries - 3} 条匹配`;
        moreLine.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!this._expandedGroups) this._expandedGroups = {};
          this._expandedGroups[file.path] = true;
          expandIcon.textContent = '▼';
          const allItems = bodyEl.querySelectorAll('.swift-match-item:not(.swift-match-more-line):not(.swift-match-divider)');
          allItems.forEach((el) => {
            el.style.display = 'flex';
          });
          const allDividers = bodyEl.querySelectorAll('.swift-match-divider');
          allDividers.forEach((el) => {
            el.style.display = 'block';
          });
          moreLine.style.display = 'none';
        });
        bodyEl.appendChild(moreLine);
      }

      groupEl.appendChild(bodyEl);
      listContainer.appendChild(groupEl);
      globalFileIndex++;
    });

    if (this._isListVisible) {
      this.matchList.style.display = 'flex';
      this.matchList.style.opacity = this.listOpacity;

    }

    if (this.floatingSearchBox) {
      setTimeout(() => { this.floatingSearchBox.focus(); }, 50);
    }

    // Apply saved match list size
    const savedWidth = this.matchListSize.width || this.settings.matchListWidth;
    const savedHeight = this.matchListSize.height || this.settings.matchListHeight || 400;
    this.matchList.style.width = `${savedWidth}px`;
    this.matchList.style.maxWidth = `${savedWidth}px`;
    this.matchList.style.height = `${savedHeight}px`;
    
    // Update container max-height to fit within the list
    const sizeHeader = this.matchList.querySelector('.minimap-match-list-header');
    const sizeListContainer = this.matchList.querySelector('.minimap-match-list-container');
    if (sizeListContainer) {
      const headerHeight = sizeHeader ? sizeHeader.offsetHeight : 36;
      const recentSection = this.matchList.querySelector('.minimap-match-list-recent');
      const recentHeight = recentSection ? recentSection.offsetHeight : 0;
      const containerMaxHeight = savedHeight - headerHeight - recentHeight - 40;
      sizeListContainer.style.maxHeight = `${Math.max(50, containerMaxHeight)}px`;
      const termScrollPos = searchText ? (this._listScrollPositions[searchText] || 0) : 0;
      const scrollTopToRestore = this._savedListScrollTop || termScrollPos || this._matchListScrollTop;

      if (scrollTopToRestore) {
        this._restoreListScrollTop(sizeListContainer, scrollTopToRestore);
        this._savedListScrollTop = 0;
        this._matchListScrollTop = 0;
      }
    }

    this._ensureMatchListResizeHandles();

    // Auto-trigger exhaustive search if mode is on and not already exhaustive
    if (this.settings.exhaustiveMode && searchText && !this._exhaustiveSearchDone) {
      this._exhaustiveSearchDone = true;
      const headerTextEl = this.matchList.querySelector('.minimap-match-list-header-text');
      setTimeout(() => {
        this.performExhaustiveSearch(searchText, matchCount, headerTextEl);
      }, 0);
    }

    if (!append && !this.isPreviewOpen) {
      // 几何由 FloatingPeer 管理（applyGeo / resize）
      if (this._matchListPositionUpdater) {
        window.removeEventListener('resize', this._matchListPositionUpdater);
        this._matchListPositionUpdater = null;
      }
    } else if (this.isPreviewOpen) {
      if (this.listFixedPosition.left !== null && this.listFixedPosition.top !== null) {
        this.matchList.style.left = `${this.listFixedPosition.left}px`;
        this.matchList.style.top = `${this.listFixedPosition.top}px`;
      }
    }

    if (searchText) {
      setTimeout(() => { this._highlightSearchTermInList(searchText); }, 100);
    }
  }

  _highlightSearchTermInList(searchText) {
    if (!this.matchList || !searchText) return;
    const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const textEls = this.matchList.querySelectorAll('.swift-match-card-text');
    textEls.forEach(el => {
      this._highlightInElement(el, regex);
    });
  }

  _restoreListScrollTop(container, targetScrollTop, retries = 5) {
    if (!container || !container.isConnected) return;

    const tryRestore = (attempt) => {
      if (attempt <= 0) return;
      requestAnimationFrame(() => {
        if (!container.isConnected) return;
        container.scrollTop = targetScrollTop;

        // Verify scrollTop was actually set (may fail if content not yet rendered)
        if (Math.abs(container.scrollTop - targetScrollTop) > 5 && attempt > 1) {
          setTimeout(() => tryRestore(attempt - 1), 100);
        }
      });
    };
    tryRestore(retries);
  }

  _highlightInElement(el, regex) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (regex.test(node.textContent)) {
        textNodes.push(node);
      }
      regex.lastIndex = 0;
    }
    for (const textNode of textNodes) {
      const text = textNode.textContent;
      const parts = text.split(regex);
      if (parts.length <= 1) continue;
      const frag = document.createDocumentFragment();
      for (const part of parts) {
        if (regex.test(part)) {
          const mark = document.createElement('mark');
          mark.textContent = part;
          mark.style.cssText = 'background:#ff660044;color:inherit;border-radius:2px;padding:0 1px;';
          frag.appendChild(mark);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
        regex.lastIndex = 0;
      }
      textNode.parentNode.replaceChild(frag, textNode);
    }
  }

  _suppressRememberCursor(file) {
    const rcp = this.app.plugins.plugins['obsidian-remember-cursor-position'];
    if (rcp && rcp.loadingFile !== undefined) {
      rcp.loadingFile = true;
      if (file) rcp.lastLoadedFileName = file.path;
    }
  }

  _releaseRememberCursor(file) {
    const rcp = this.app.plugins.plugins['obsidian-remember-cursor-position'];
    if (rcp && rcp.loadingFile !== undefined) {
      if (file) {
        const st = rcp.db[file.path];
        if (st) rcp.lastEphemeralState = st;
      }
      rcp.loadingFile = false;
    }
  }

  async openFileInNewTabWithHeading(file, heading, setActive = true) {
    this._suppressRememberCursor(file);
    const currentLeaf = this.app.workspace.activeLeaf;
    const leaf = this.app.workspace.getLeaf('tab');
    await leaf.openFile(file, { setActive });
    
    setTimeout(() => {
      this.app.workspace.setActiveLeaf(leaf, { focus: true });
      this.jumpToHeadingInEditor(heading);
      this._releaseRememberCursor(file);
    }, 1250);
    
    if (!setActive && currentLeaf) {
      this.app.workspace.setActiveLeaf(currentLeaf, { focus: true });
    }
    return leaf;
  }

  async showPreviewWithHeading(file, heading) {
    if (!this.previewPanel) return;

    this.cancelSearch();

    const wasPreviewOpen = this.isPreviewOpen;
    
    this.isPreviewOpen = true;
    this.currentPreviewFile = file;
    this.currentPreviewHeading = heading;
    this.previewSourceLeaf = this.app.workspace.activeLeaf;
    
    if (!wasPreviewOpen) {
      if (this.previewListPosition.left !== null && this.previewListPosition.top !== null) {
        this.listFixedPosition.left = this.previewListPosition.left;
        this.listFixedPosition.top = this.previewListPosition.top;
        this.matchList.style.left = `${this.previewListPosition.left}px`;
        this.matchList.style.top = `${this.previewListPosition.top}px`;
      } else if (this.listFixedPosition.left !== null && this.listFixedPosition.top !== null) {
        this.matchList.style.left = `${this.listFixedPosition.left}px`;
        this.matchList.style.top = `${this.listFixedPosition.top}px`;
      }
    }
    
    if (this._matchListPositionUpdater) {
      window.removeEventListener('resize', this._matchListPositionUpdater);
      this._matchListPositionUpdater = null;
    }
    
    if (this._previewOutsideClickHandler) {
      document.removeEventListener('mousedown', this._previewOutsideClickHandler);
      this._previewOutsideClickHandler = null;
    }
    
    try {

      const content = await this.app.vault.read(file);

      this.previewPanel.innerHTML = '';
      
      const header = document.createElement('div');
      header.className = 'minimap-preview-header';
      header.innerHTML = `
        <span class="minimap-preview-title">${file.basename}</span>
      `;
      header.style.cursor = 'move';
      header.style.userSelect = 'none';
      
      let isDraggingPanel = false;
      let panelDragStartX, panelDragStartY, panelDragStartLeft, panelDragStartTop;
      
      const onPanelDragMouseDown = (e) => {
        if (e.target.closest('.minimap-preview-resize-handle')) return;
        isDraggingPanel = true;
        panelDragStartX = e.clientX;
        panelDragStartY = e.clientY;
        const panelRect = this.previewPanel.getBoundingClientRect();
        panelDragStartLeft = panelRect.left;
        panelDragStartTop = panelRect.top;
        document.addEventListener('mousemove', onPanelDragMouseMove);
        document.addEventListener('mouseup', onPanelDragMouseUp);
        e.preventDefault();
        e.stopPropagation();
      };
      
      const onPanelDragMouseMove = (e) => {
        if (!isDraggingPanel) return;
        const dx = e.clientX - panelDragStartX;
        const dy = e.clientY - panelDragStartY;
        let newLeft = panelDragStartLeft + dx;
        let newTop = panelDragStartTop + dy;
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 100));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - 50));
        this.previewPanel.style.left = `${newLeft}px`;
        this.previewPanel.style.top = `${newTop}px`;
      };
      
      const onPanelDragMouseUp = () => {
        isDraggingPanel = false;
        document.removeEventListener('mousemove', onPanelDragMouseMove);
        document.removeEventListener('mouseup', onPanelDragMouseUp);
      };
      
      header.addEventListener('mousedown', onPanelDragMouseDown);
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'minimap-preview-content markdown-preview-view';
      
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'minimap-preview-resize-handle';
      resizeHandle.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        width: 15px;
        height: 15px;
        cursor: nwse-resize;
        z-index: 10;
        background: linear-gradient(135deg, transparent 50%, var(--text-muted) 50%);
      `;
      
      let isResizing = false;
      let resizeStartX, resizeStartY, resizeStartWidth, resizeStartHeight;
      
      const onResizeMouseDown = (e) => {
        isResizing = true;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        resizeStartWidth = this.previewPanel.offsetWidth;
        resizeStartHeight = this.previewPanel.offsetHeight;
        document.addEventListener('mousemove', onResizeMouseMove);
        document.addEventListener('mouseup', onResizeMouseUp);
        e.preventDefault();
        e.stopPropagation();
      };
      
      const onResizeMouseMove = (e) => {
        if (!isResizing) return;
        const dx = e.clientX - resizeStartX;
        const dy = e.clientY - resizeStartY;
        const newWidth = Math.max(300, Math.min(resizeStartWidth + dx, window.innerWidth - 20));
        const newHeight = Math.max(200, Math.min(resizeStartHeight + dy, window.innerHeight - 20));
        this.previewPanel.style.width = `${newWidth}px`;
        this.previewPanel.style.height = `${newHeight}px`;
        this.previewSize.width = newWidth;
        this.previewSize.height = newHeight;
      };
      
      const onResizeMouseUp = () => {
        isResizing = false;
        document.removeEventListener('mousemove', onResizeMouseMove);
        document.removeEventListener('mouseup', onResizeMouseUp);
        this.saveListData();
      };
      
      resizeHandle.addEventListener('mousedown', onResizeMouseDown);
      
      this.previewPanel.appendChild(header);
      this.previewPanel.appendChild(contentDiv);
      this.previewPanel.appendChild(resizeHandle);
      this.previewPanel.style.display = 'flex';

      try {
        await MarkdownRenderer.render(this.app, content, contentDiv, file.path, this);
        if (!contentDiv.innerHTML || contentDiv.innerHTML.trim() === '') {
          contentDiv.innerHTML = `<pre style="white-space: pre-wrap; margin: 0;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
        }
      } catch (renderError) {
        console.error('MarkdownRenderer.render failed:', renderError);
        contentDiv.innerHTML = `<pre style="white-space: pre-wrap; margin: 0;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
      }

      this.positionPreviewPanel();
      this.highlightCurrentPreviewItem();

      this.setupPreviewOutsideClick();
      
      setTimeout(() => {

        this.scrollToHeadingInPreview(contentDiv, heading);

      }, 100);
      

    } catch (e) {
      console.error('Failed to read file:', e);
      this.closePreview();
    }
  }

  scrollToHeadingInPreview(contentDiv, heading) {
    if (!contentDiv) return;
    
    const headingText = heading.toLowerCase().trim();
    const elements = contentDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    for (const el of elements) {
      const elText = el.textContent.toLowerCase().trim();
      const cleanElText = elText.replace(/<[^>]*>/g, '').trim();
      if (cleanElText === headingText || cleanElText.includes(headingText)) {
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
        break;
      }
    }
  }

  jumpToHeadingInEditor(heading) {

    if (this.isReadingMode()) {
      const readingEl = this.getReadingViewContentEl();

      if (!readingEl) return;
      const headingText = heading.toLowerCase().trim();
      const elements = readingEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
      for (const el of elements) {
        const elText = el.textContent.toLowerCase().trim();
        if (elText === headingText || elText.includes(headingText)) {
          el.scrollIntoView({ behavior: 'auto', block: 'start' });
          break;
        }
      }
      return;
    }

    const editor = this.getEditor();
    if (!editor || !editor.cm) return;
    
    const cm = editor.cm;
    const content = editor.getValue();
    const lines = content.split('\n');
    const headingLower = heading.toLowerCase().trim();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const lineHeadingText = headingMatch[2].replace(/\s+#[\w\u4e00-\u9fa5]+\s*$/g, '').replace(/<[^>]*>/g, '').trim().toLowerCase();
        if (lineHeadingText === headingLower || lineHeadingText.includes(headingLower)) {
          const lineNum = i + 1;
          const lineObj = cm.state.doc.line(lineNum);
          
          cm.dispatch({
            selection: { anchor: lineObj.from },
            scrollIntoView: { range: { from: lineObj.from, to: lineObj.from } }
          });
          break;
        }
      }
    }
  }

  positionListNearIndicator() {
    if (!this.matchList || !this.lastIndicatorCoords) {
      this.positionListDefault();
      return;
    }
    
    const listWidth = this.matchListSize.width || this.settings.matchListWidth || 280;
    const listHeight = this.matchListSize.height || this.settings.matchListHeight || 400;
    
    const targetRect = this.lastIndicatorCoords.targetRect;
    const indicatorX = this.lastIndicatorCoords.screenX;
    const indicatorY = this.lastIndicatorCoords.screenY;
    
    const selectionRight = targetRect ? targetRect.right + 20 : indicatorX;
    const selectionLeft = targetRect ? targetRect.left - 20 : indicatorX;
    const selectionTop = targetRect ? targetRect.top : indicatorY;
    const selectionBottom = targetRect ? targetRect.bottom : indicatorY;
    const selectionCenter = (selectionTop + selectionBottom) / 2;
    
    const availableWidthRight = window.innerWidth - selectionRight - 10;
    const availableWidthLeft = selectionLeft - 10;
    
    let left, top;
    
    if (availableWidthRight >= listWidth) {
      left = selectionRight;
    } else if (availableWidthLeft >= listWidth) {
      left = selectionLeft - listWidth;
    } else if (availableWidthRight >= availableWidthLeft) {
      left = window.innerWidth - listWidth - 10;
    } else {
      left = 10;
    }

    let idealTop = selectionCenter - listHeight / 2;
    
    if (idealTop < 10) {
      idealTop = 10;
    } else if (idealTop + listHeight > window.innerHeight - 10) {
      idealTop = window.innerHeight - listHeight - 10;
    }
    
    top = idealTop;

    this.matchList.style.left = `${left}px`;
    this.matchList.style.top = `${top}px`;
  }

  updateListPositionNearSelection() {
    if (!this.matchList || this.matchList.style.display === 'none') return;
    if (this.isPreviewOpen) return;
    if (this.listFixedPosition.left !== null || this.listFixedPosition.top !== null) return;
    
    const listWidth = this.matchListSize.width || this.settings.matchListWidth || 280;
    const listHeight = this.matchListSize.height || this.settings.matchListHeight || 400;
    
    let selectionRight, selectionLeft, selectionTop, selectionBottom;
    
    if (this.isReadingMode()) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        this.positionListDefault();
        return;
      }
      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (!rect || rect.width === 0) {
          this.positionListDefault();
          return;
        }
        selectionRight = rect.right + 20;
        selectionLeft = rect.left - 20;
        selectionTop = rect.top;
        selectionBottom = rect.bottom;
      } catch (e) {
        this.positionListDefault();
        return;
      }
    } else {
      const editor = this.getEditor();
      if (!editor || !editor.cm) {
        this.positionListDefault();
        return;
      }

      const cm = editor.cm;
      const selection = editor.getSelection();
      if (!selection) {
        this.positionListDefault();
        return;
      }

      try {
        const from = editor.getCursor('from');
        const to = editor.getCursor('to');
        
        const lineFrom = cm.state.doc.line(from.line + 1);
        const lineTo = cm.state.doc.line(to.line + 1);
        const posFrom = lineFrom.from + from.ch;
        const posTo = lineTo.from + to.ch;
        
        const coordsFrom = cm.coordsAtPos(posFrom);
        const coordsTo = cm.coordsAtPos(posTo);
        
        if (!coordsFrom || !coordsTo) {
          this.positionListDefault();
          return;
        }
        
        selectionRight = Math.max(coordsFrom.left, coordsTo.left) + 20;
        selectionLeft = Math.min(coordsFrom.left, coordsTo.left) - 20;
        selectionTop = Math.min(coordsFrom.top, coordsTo.top);
        selectionBottom = Math.max(coordsFrom.bottom, coordsTo.bottom);
      } catch (e) {
        this.positionListDefault();
        return;
      }
    }
    
    const availableWidthRight = window.innerWidth - selectionRight - 10;
    const availableWidthLeft = selectionLeft - 10;
    
    let left, top;
    
    if (availableWidthRight >= listWidth) {
      left = selectionRight;
    } else if (availableWidthLeft >= listWidth) {
      left = selectionLeft - listWidth;
    } else if (availableWidthRight >= availableWidthLeft) {
      left = window.innerWidth - listWidth - 10;
    } else {
      left = 10;
    }
    
    const selectionCenter = (selectionTop + selectionBottom) / 2;
    let idealTop = selectionCenter - listHeight / 2;
    
    if (idealTop < 10) {
      idealTop = 10;
    } else if (idealTop + listHeight > window.innerHeight - 10) {
      idealTop = window.innerHeight - listHeight - 10;
    }
    
    top = idealTop;

    this.matchList.style.left = `${left}px`;
    this.matchList.style.top = `${top}px`;
  }

  positionListDefault() {
    if (!this.matchList || !this.minimapContainer) return;
    
    const rect = this.minimapContainer.getBoundingClientRect();
    const listWidth = this.matchListSize.width || this.settings.matchListWidth || 280;
    const listHeight = this.matchListSize.height || this.settings.matchListHeight || 400;
    
    let left = rect.left - listWidth - 10;
    let top = rect.top;
    
    if (left < 10) {
      left = rect.right + 10;
    }
    
    if (top + listHeight > window.innerHeight - 10) {
      top = Math.max(10, window.innerHeight - listHeight - 10);
    }
    
    this.matchList.style.left = `${left}px`;
    this.matchList.style.top = `${top}px`;
  }

  async openFile(file) {
    const leaf = this.app.workspace.getLeaf();
    await leaf.openFile(file);
  }

  async openFileInNewTab(file, setActive = true) {
    this._suppressRememberCursor(file);
    const leaf = this.app.workspace.getLeaf('tab');
    await leaf.openFile(file, { setActive });
    return leaf;
  }

  // 从文本中提取第一句话（支持中英文句号、感叹号、问号、换行）
  getFirstSentence(text) {
    if (!text) return '';
    // Remove leading "..." if present (from snippet truncation)
    let cleanText = text.replace(/^\.\.\.\s*/, '');
    const match = cleanText.match(/[^。！？\.\?\!]*[。！？\.\?\!\n]/);
    if (match) {
      return match[0].trim();
    }
    // 如果没有找到句末标点，返回整段文本
    return cleanText.trim();
  }

  // 清空跳转高亮
  clearJumpHighlight(cm) {
    if (!cm) return;
    cm.dispatch({
      effects: setJumpHighlight.of(Decoration.none)
    });
  }

  // 编辑模式：直接向 matchHighlightField 添加棉花糖装饰
  highlightJumpText(cm, from, to) {
    if (!cm) return;
    this._ensureEditorFields(cm);
    const existing = cm.state.field(matchHighlightField, false) || Decoration.none;
    const marshmallowDeco = Decoration.mark({
      class: 'minimap-editor-match hl-marshmallow',
      attributes: {
        'style': `background:#fff !important;color:#cc2e7a !important;border:2px solid #ff6eb4 !important;border-radius:10px !important;padding:0.1em 0.6em !important;box-shadow:2px 2px 0 #ffaad9 !important;margin:0 -0.2em;-webkit-box-decoration-break:clone;box-decoration-break:clone;`
      }
    });
    const newSet = existing.update({
      add: [{ from, to, value: marshmallowDeco }]
    });
    cm.dispatch({
      effects: setMatchHighlights.of(newSet)
    });
    this._jumpHighlightRange = { from, to };
    this._setupMarshmallowDismiss(cm);
  }

  _setupMarshmallowDismiss(cm) {
    if (this._marshmallowDismissHandler) {
      cm.dom.removeEventListener('mousedown', this._marshmallowDismissHandler);
    }
    this._marshmallowDismissHandler = () => {
      this._jumpHighlightRange = null;
      this._removeMarshmallowDeco(cm);
      cm.dom.removeEventListener('mousedown', this._marshmallowDismissHandler);
      this._marshmallowDismissHandler = null;
    };
    cm.dom.addEventListener('mousedown', this._marshmallowDismissHandler);
  }

  _removeMarshmallowDeco(cm) {
    if (!cm) return;
    const current = cm.state.field(matchHighlightField, false);
    if (current) {
      const filtered = current.update({
        filter: (f, t, v) => {
          const spec = v.spec;
          return !(spec && spec.class && spec.class.includes('hl-marshmallow'));
        }
      });
      cm.dispatch({
        effects: setMatchHighlights.of(filtered)
      });
    }
  }

  _ensureEditorFields(cm) {
    if (!cm) return;
    const matchField = cm.state.field(matchHighlightField, false);
    if (matchField === undefined) {
      cm.dispatch({
        effects: StateEffect.appendConfig.of([matchHighlightField])
      });
    }
    const jumpField = cm.state.field(jumpHighlightField, false);
    if (jumpField === undefined) {
      cm.dispatch({
        effects: StateEffect.appendConfig.of([jumpHighlightField])
      });
    }
  }

  // 阅读模式：用 span.hl-marshmallow 包裹跳转文本
  highlightJumpTextReading(container, textNode, offset, length) {
    const parent = textNode.parentNode;
    if (!parent || parent.closest('.hl-marshmallow')) return;

    const range = document.createRange();
    range.setStart(textNode, offset);
    range.setEnd(textNode, offset + length);

    const span = document.createElement('span');
    span.className = 'hl-marshmallow';
    span.style.cssText = 'background:#fff !important;color:#cc2e7a !important;border:2px solid #ff6eb4 !important;border-radius:10px !important;padding:0.1em 0.6em !important;box-shadow:2px 2px 0 #ffaad9 !important;';
    range.surroundContents(span);

    // 3秒后自动移除
    setTimeout(() => {
      const parentSpan = span.parentNode;
      if (parentSpan) {
        const text = span.textContent || '';
        const textNode2 = document.createTextNode(text);
        parentSpan.replaceChild(textNode2, span);
      }
    }, 3000);
  }

  jumpToSearchTextInEditor(searchText) {

    if (this.isReadingMode()) {
      const readingEl = this.getReadingViewContentEl();

      if (!readingEl) return;
      const searchLower = searchText.toLowerCase();
      const walker = document.createTreeWalker(readingEl, NodeFilter.SHOW_TEXT, null, false);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const idx = node.textContent.toLowerCase().indexOf(searchLower);
        if (idx !== -1) {
          const range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, idx + searchText.length);
          range.scrollIntoView({ behavior: 'auto', block: 'center' });

          // 临时高亮 hl-marshmallow
          this.highlightJumpTextReading(readingEl, node, idx, searchText.length);

          break;
        }
      }
      return;
    }

    const editor = this.getEditor();

    if (!editor || !editor.cm) return;

    const cm = editor.cm;
    const content = editor.getValue();
    const searchLower = searchText.toLowerCase();

    const fullIdx = content.toLowerCase().indexOf(searchLower);

    if (fullIdx !== -1) {
      const from = fullIdx;
      const to = fullIdx + searchText.length;

      cm.dispatch({
        selection: { anchor: from },
        scrollIntoView: { range: { from, to } }
      });

      setTimeout(() => {
        const coords = cm.coordsAtPos(from);
        const scrollEl = cm.scrollDOM;
        if (coords && scrollEl) {
          const visibleHeight = scrollEl.clientHeight;
          const targetY = coords.top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop - visibleHeight * 0.35;
          scrollEl.scrollTop = targetY;
        }
      }, 50);

      this.highlightJumpText(cm, from, to);
      return;
    }

    const fallbackText = this.currentSelection;
    if (fallbackText && fallbackText !== searchText) {
      const fallbackIdx = content.toLowerCase().indexOf(fallbackText.toLowerCase());

      if (fallbackIdx !== -1) {
        const from = fallbackIdx;
        const to = fallbackIdx + fallbackText.length;
        cm.dispatch({
          selection: { anchor: from },
          scrollIntoView: { range: { from, to } }
        });

        setTimeout(() => {
          const coords = cm.coordsAtPos(from);
          const scrollEl = cm.scrollDOM;
          if (coords && scrollEl) {
            const visibleHeight = scrollEl.clientHeight;
            const targetY = coords.top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop - visibleHeight * 0.35;
            scrollEl.scrollTop = targetY;
          }
        }, 50);

        this.highlightJumpText(cm, from, to);
      }
    }
  }

  jumpToTagInEditor(tag) {
    if (this.isReadingMode()) {
      const readingEl = this.getReadingViewContentEl();
      if (!readingEl) return;
      const tagSelector = `a.tag[href*="${tag}"], .tag[href*="${tag}"]`;
      const tagEl = readingEl.querySelector(tagSelector);
      if (tagEl) {
        tagEl.scrollIntoView({ behavior: 'auto', block: 'center' });
      } else {
        // Fallback: search text nodes for the tag
        const searchLower = `#${tag.toLowerCase()}`;
        const walker = document.createTreeWalker(readingEl, NodeFilter.SHOW_TEXT, null, false);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const idx = node.textContent.toLowerCase().indexOf(searchLower);
          if (idx !== -1) {
            const range = document.createRange();
            range.setStart(node, idx);
            range.setEnd(node, idx + searchLower.length);
            range.scrollIntoView({ behavior: 'auto', block: 'center' });
            break;
          }
        }
      }
      return;
    }

    const editor = this.getEditor();
    if (!editor || !editor.cm) return;

    const cm = editor.cm;
    const content = editor.getValue();
    const lines = content.split('\n');
    const tagPattern = new RegExp(`#${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[\\s,.;:!?'")\\]}>]|$)`, 'i');

    for (let i = 0; i < lines.length; i++) {
      const match = tagPattern.exec(lines[i]);
      if (match) {
        const lineNum = i + 1;
        const lineObj = cm.state.doc.line(lineNum);
        const from = lineObj.from + match.index;

        cm.dispatch({
          selection: { anchor: from },
          scrollIntoView: { range: { from, to: from } }
        });
        break;
      }
    }
  }

  async showPreview(file) {
    if (!this.previewPanel) return;

    this.cancelSearch();

    this.isPreviewOpen = true;
    this.currentPreviewFile = file;
    
    if (this.previewListPosition.left !== null && this.previewListPosition.top !== null) {
      this.listFixedPosition.left = this.previewListPosition.left;
      this.listFixedPosition.top = this.previewListPosition.top;
      this.matchList.style.left = `${this.previewListPosition.left}px`;
      this.matchList.style.top = `${this.previewListPosition.top}px`;
    }
    
    if (this._matchListPositionUpdater) {
      window.removeEventListener('resize', this._matchListPositionUpdater);
      this._matchListPositionUpdater = null;
    }
    
    try {

      const content = await this.app.vault.read(file);

      this.previewPanel.innerHTML = '';
      
      const header = document.createElement('div');
      header.className = 'minimap-preview-header';
      header.innerHTML = `
        <span class="minimap-preview-title">${file.basename}</span>
      `;
      header.style.cursor = 'move';
      header.style.userSelect = 'none';
      
      let isDraggingPanel = false;
      let panelDragStartX, panelDragStartY, panelDragStartLeft, panelDragStartTop;
      
      const onPanelDragMouseDown = (e) => {
        if (e.target.closest('.minimap-preview-resize-handle')) return;
        isDraggingPanel = true;
        panelDragStartX = e.clientX;
        panelDragStartY = e.clientY;
        const panelRect = this.previewPanel.getBoundingClientRect();
        panelDragStartLeft = panelRect.left;
        panelDragStartTop = panelRect.top;
        document.addEventListener('mousemove', onPanelDragMouseMove);
        document.addEventListener('mouseup', onPanelDragMouseUp);
        e.preventDefault();
        e.stopPropagation();
      };
      
      const onPanelDragMouseMove = (e) => {
        if (!isDraggingPanel) return;
        const dx = e.clientX - panelDragStartX;
        const dy = e.clientY - panelDragStartY;
        let newLeft = panelDragStartLeft + dx;
        let newTop = panelDragStartTop + dy;
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 100));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - 50));
        this.previewPanel.style.left = `${newLeft}px`;
        this.previewPanel.style.top = `${newTop}px`;
      };
      
      const onPanelDragMouseUp = () => {
        isDraggingPanel = false;
        document.removeEventListener('mousemove', onPanelDragMouseMove);
        document.removeEventListener('mouseup', onPanelDragMouseUp);
      };
      
      header.addEventListener('mousedown', onPanelDragMouseDown);
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'minimap-preview-content markdown-preview-view';
      
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'minimap-preview-resize-handle';
      resizeHandle.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        width: 15px;
        height: 15px;
        cursor: nwse-resize;
        z-index: 10;
        background: linear-gradient(135deg, transparent 50%, var(--text-muted) 50%);
      `;
      
      let isResizing = false;
      let resizeStartX, resizeStartY, resizeStartWidth, resizeStartHeight;
      
      const onResizeMouseDown = (e) => {
        isResizing = true;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        resizeStartWidth = this.previewPanel.offsetWidth;
        resizeStartHeight = this.previewPanel.offsetHeight;
        document.addEventListener('mousemove', onResizeMouseMove);
        document.addEventListener('mouseup', onResizeMouseUp);
        e.preventDefault();
        e.stopPropagation();
      };
      
      const onResizeMouseMove = (e) => {
        if (!isResizing) return;
        const dx = e.clientX - resizeStartX;
        const dy = e.clientY - resizeStartY;
        const newWidth = Math.max(300, Math.min(resizeStartWidth + dx, window.innerWidth - 20));
        const newHeight = Math.max(200, Math.min(resizeStartHeight + dy, window.innerHeight - 20));
        this.previewPanel.style.width = `${newWidth}px`;
        this.previewPanel.style.height = `${newHeight}px`;
        this.previewSize.width = newWidth;
        this.previewSize.height = newHeight;
      };
      
      const onResizeMouseUp = () => {
        isResizing = false;
        document.removeEventListener('mousemove', onResizeMouseMove);
        document.removeEventListener('mouseup', onResizeMouseUp);
        this.saveListData();
      };
      
      resizeHandle.addEventListener('mousedown', onResizeMouseDown);
      
      this.previewPanel.appendChild(header);
      this.previewPanel.appendChild(contentDiv);
      this.previewPanel.appendChild(resizeHandle);
      this.previewPanel.style.display = 'flex';

      try {
        await MarkdownRenderer.render(this.app, content, contentDiv, file.path, this);
        if (!contentDiv.innerHTML || contentDiv.innerHTML.trim() === '') {
          contentDiv.innerHTML = `<pre style="white-space: pre-wrap; margin: 0;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
        }
      } catch (renderError) {
        console.error('MarkdownRenderer.render failed:', renderError);
        contentDiv.innerHTML = `<pre style="white-space: pre-wrap; margin: 0;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
      }

      this.positionPreviewPanel();
      this.highlightCurrentPreviewItem();

      this.setupPreviewOutsideClick();
      

    } catch (e) {
      console.error('Failed to read file:', e);
      this.closePreview();
    }
  }

  setupPreviewOutsideClick() {
    if (this._previewOutsideClickHandler) {
      document.removeEventListener('mousedown', this._previewOutsideClickHandler);
    }
    
    this._previewOutsideClickHandler = (e) => {
      if (!this.previewPanel || this.previewPanel.style.display === 'none') return;
      
      const isInPreview = this.previewPanel.contains(e.target);
      const isInList = this.matchList && this.matchList.contains(e.target);
      
      if (!isInPreview && !isInList) {
        this.closePreview();
        e.stopPropagation();
      }
    };
    
    setTimeout(() => {
      document.addEventListener('mousedown', this._previewOutsideClickHandler);
    }, 10);
  }

  highlightCurrentPreviewItem() {
    if (!this.matchList || !this.currentPreviewFile) return;
    
    const groupItems = this.matchList.querySelectorAll('.swift-match-group');
    groupItems.forEach(item => {
      if (item.dataset.filePath === this.currentPreviewFile.path) {
        item.classList.add('previewing');
      } else {
        item.classList.remove('previewing');
      }
    });
  }

  async exportMatchList(fileMap, searchText, matchCount) {
    if (!fileMap || fileMap.size === 0) return;
    
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    const fileName = `Trace_${searchText}_${dateStr}.md`;
    
    const totalMatchCount = this._pendingMatchCount || matchCount;
    
    let md = `# Trace 搜索结果\n\n`;
    md += `- **搜索词**: \`${searchText}\`\n`;
    md += `- **匹配文档数**: ${fileMap.size}\n`;
    md += `- **总匹配数**: ${totalMatchCount} 项结果\n`;
    md += `- **导出时间**: ${now.toLocaleString()}\n\n`;
    md += `---\n\n`;
    
    fileMap.forEach((items, file) => {
      md += `## [[${file.basename}]]\n\n`;
      items.forEach(item => {
        if (item.type === 'tag') {
          md += `- #${item.text}\n`;
        } else if (item.type === 'heading') {
          md += `- **[[${file.basename}#${item.text}]]**\n`;
        } else if (item.type === 'content') {
          if (item.snippets && item.snippets.length > 0) {
            for (const s of item.snippets) {
              md += `  > ${s.replace(/\n/g, ' ')}\n`;
            }
          } else if (item.snippet) {
            md += `  > ${item.snippet.replace(/\n/g, ' ')}\n`;
          } else {
            md += `- ${item.text}\n`;
          }
        } else {
          md += `- ${item.text}\n`;
        }
      });
      md += `\n`;
    });
    
    try {
      const adapter = this.app.vault.adapter;
      await adapter.write(fileName, md);
      
      // Open the file in a new tab
      const file = this.app.vault.getAbstractFileByPath(fileName);
      if (file) {
        await this.app.workspace.getLeaf('tab').openFile(file);
      }
      new Notice(t('exported', fileName));
    } catch (e) {
      console.error('Failed to export match list:', e);
      new Notice(t('exportFailed', e.message));
    }
  }

  _setupSwiftMatchExportNav() {
    // Remove existing popup and listeners
    this._removeSwiftMatchExportNav();
    const file = this.app.workspace.activeLeaf?.view?.file;
    if (!file || !(file.basename.startsWith('Trace_') || file.basename.startsWith('SwiftMatch_'))) return;

    // Listen for text selection in this document
    this._swiftMatchMouseUpHandler = () => {
      setTimeout(() => this._handleSwiftMatchSelection(), 200);
    };
    this._swiftMatchMouseDownHandler = () => {
      this._hideSwiftMatchNavPopup();
    };
    document.addEventListener('mouseup', this._swiftMatchMouseUpHandler);
    document.addEventListener('mousedown', this._swiftMatchMouseDownHandler, true);
  }

  _removeSwiftMatchExportNav() {
    if (this._swiftMatchMouseUpHandler) {
      document.removeEventListener('mouseup', this._swiftMatchMouseUpHandler);
      this._swiftMatchMouseUpHandler = null;
    }
    if (this._swiftMatchMouseDownHandler) {
      document.removeEventListener('mousedown', this._swiftMatchMouseDownHandler, true);
      this._swiftMatchMouseDownHandler = null;
    }
    this._hideSwiftMatchNavPopup();
  }

  _handleSwiftMatchSelection() {
    const file = this.app.workspace.activeLeaf?.view?.file;
    if (!file || !(file.basename.startsWith('Trace_') || file.basename.startsWith('SwiftMatch_'))) {
      this._removeSwiftMatchExportNav();
      return;
    }

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.toString().trim().length === 0) {
      this._hideSwiftMatchNavPopup();
      return;
    }

    // Find the nearest heading/wiki-link above the selection
    const range = sel.getRangeAt(0);
    let node = range.startContainer;

    // Walk up to find the content block element
    let container = node instanceof Element ? node : node.parentElement;
    const contentEl = container?.closest('.markdown-reading-view, .markdown-preview-view, .markdown-source-view');
    if (!contentEl) return;

    // Find the closest heading or section with a wiki-link
    let sourceInfo = this._findSourceInfoForSelection(container, contentEl);

    if (!sourceInfo) {
      this._hideSwiftMatchNavPopup();
      return;
    }

    // Show the navigation popup
    const rect = range.getBoundingClientRect();
    this._showSwiftMatchNavPopup(rect, sourceInfo, sel.toString().trim());
  }

  _findSourceInfoForSelection(element, contentEl) {
    // Walk up from the selection element to find the nearest heading/section with a wiki-link
    let current = element;
    let foundHeading = null;
    let foundFile = null;

    while (current && current !== contentEl) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        // Check if this is a heading with a link
        if (current.tagName && current.tagName.match(/^H[1-6]$/)) {
          const link = current.querySelector('a.internal-link, .internal-link');
          if (link) {
            const href = link.getAttribute('data-href') || link.getAttribute('href') || link.textContent;
            if (href) {
              const parts = href.split('#');
              foundFile = parts[0];
              foundHeading = parts.length > 1 ? parts.slice(1).join('#') : null;
              return { fileName: foundFile, heading: foundHeading };
            }
          }
          // Also check for plain text wiki-link format in the heading
          const headingText = current.textContent;
          const wikiMatch = headingText.match(/\[\[([^\]]+)\]\]/);
          if (wikiMatch) {
            const parts = wikiMatch[1].split('#');
            foundFile = parts[0];
            foundHeading = parts.length > 1 ? parts.slice(1).join('#') : null;
            return { fileName: foundFile, heading: foundHeading };
          }
        }

        // Check if this element contains an internal link
        const links = current.querySelectorAll(':scope > a.internal-link, :scope > .internal-link');
        for (const link of links) {
          const href = link.getAttribute('data-href') || link.getAttribute('href') || link.textContent;
          if (href) {
            const parts = href.split('#');
            foundFile = parts[0];
            foundHeading = parts.length > 1 ? parts.slice(1).join('#') : null;
            return { fileName: foundFile, heading: foundHeading };
          }
        }
      }
      current = current.parentElement;
    }

    // Fallback: scan all headings in the document for the section containing the selection
    const allHeadings = contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const selRange = window.getSelection().getRangeAt(0);
    const selTop = selRange.getBoundingClientRect().top;

    let closestHeading = null;
    let closestTop = -Infinity;

    for (const h of allHeadings) {
      const hRect = h.getBoundingClientRect();
      if (hRect.top <= selTop && hRect.top > closestTop) {
        closestTop = hRect.top;
        closestHeading = h;
      }
    }

    if (closestHeading) {
      // Look for wiki-link in heading text (format: ## [[filename]] or ## [[filename#heading]])
      const headingText = closestHeading.textContent;
      const wikiMatch = headingText.match(/\[\[([^\]]+)\]\]/);
      if (wikiMatch) {
        const parts = wikiMatch[1].split('#');
        return { fileName: parts[0], heading: parts.length > 1 ? parts.slice(1).join('#') : null };
      }

      // Also check for rendered internal links
      const link = closestHeading.querySelector('a.internal-link, .internal-link');
      if (link) {
        const href = link.getAttribute('data-href') || link.getAttribute('href') || link.textContent;
        if (href) {
          const parts = href.split('#');
          return { fileName: parts[0], heading: parts.length > 1 ? parts.slice(1).join('#') : null };
        }
      }
    }

    return null;
  }

  _showSwiftMatchNavPopup(rect, sourceInfo, selectedText) {
    this._hideSwiftMatchNavPopup();

    const popup = document.createElement('div');
    popup.className = 'swift-match-nav-popup';
    popup.style.cssText = `
      position: fixed;
      z-index: 999999;
      background: var(--background-primary);
      border: 1px solid var(--interactive-accent);
      border-radius: 6px;
      padding: 4px 10px;
      cursor: pointer;
      font-size: 12px;
      color: var(--text-normal);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      white-space: nowrap;
      transition: background 0.15s, transform 0.15s;
      top: ${rect.top - 32}px;
      left: ${rect.left + rect.width / 2 - 60}px;
    `;

    const displayText = sourceInfo.heading 
      ? `→ ${sourceInfo.fileName}#${sourceInfo.heading}` 
      : `→ ${sourceInfo.fileName}`;
    popup.textContent = displayText;

    popup.addEventListener('mouseenter', () => {
      popup.style.background = 'var(--background-modifier-hover)';
      popup.style.transform = 'scale(1.05)';
    });
    popup.addEventListener('mouseleave', () => {
      popup.style.background = 'var(--background-primary)';
      popup.style.transform = 'scale(1)';
    });
    popup.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
    });
    popup.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this._navigateToSwiftMatchSource(sourceInfo, selectedText);
      this._hideSwiftMatchNavPopup();
    });

    document.body.appendChild(popup);
    this._swiftMatchNavPopup = popup;

    // Auto-hide after 5 seconds
    this._swiftMatchNavTimer = setTimeout(() => {
      this._hideSwiftMatchNavPopup();
    }, 5000);
  }

  _hideSwiftMatchNavPopup() {
    if (this._swiftMatchNavTimer) {
      clearTimeout(this._swiftMatchNavTimer);
      this._swiftMatchNavTimer = null;
    }
    if (this._swiftMatchNavPopup) {
      this._swiftMatchNavPopup.remove();
      this._swiftMatchNavPopup = null;
    }
  }

  async _navigateToSwiftMatchSource(sourceInfo, selectedText) {
    // Find the file by name
    const allFiles = this.app.vault.getMarkdownFiles();
    let targetFile = null;
    for (const f of allFiles) {
      if (f.basename === sourceInfo.fileName) {
        targetFile = f;
        break;
      }
    }
    if (!targetFile) {
      new Notice(t('sourceNotFound', sourceInfo.fileName));
      return;
    }

    // Open in new tab
    const leaf = this.app.workspace.getLeaf('tab');
    await leaf.openFile(targetFile);

    // Wait for the file to load, then navigate to the heading or search for the selected text
    setTimeout(() => {
      if (sourceInfo.heading) {
        // Navigate to heading
        this._jumpToHeadingInActiveDoc(sourceInfo.heading);
      }
      // Also try to find and select the specific text
      if (selectedText) {
        this._findAndSelectTextInActiveDoc(selectedText);
      }
    }, 500);
  }

  _jumpToHeadingInActiveDoc(headingText, headingIndex) {
    // Try to find the heading in the current view
    const view = this.app.workspace.activeLeaf?.view;
    if (!view) return;

    const file = view.file;
    const cache = file ? this.app.metadataCache.getFileCache(file) : null;
    const cachedHeadings = cache?.headings || [];

    // Source mode (editor): jump precisely by cached heading position
    if (headingIndex !== undefined && cachedHeadings[headingIndex] && this.getEditor()) {
      const line = cachedHeadings[headingIndex].position?.start?.line;
      if (typeof line === 'number') {
        const editor = this.getEditor();
        editor.setCursor({ line, ch: 0 });
        editor.scrollIntoView({ from: { line, ch: 0 }, to: { line, ch: 0 } }, true);
        return;
      }
    }

    // Reading mode: pick the heading at the same index in DOM order
    const readingView = view.containerEl?.querySelector('.markdown-reading-view, .markdown-preview-view');
    if (readingView && headingIndex !== undefined) {
      const domHeadings = readingView.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const h = domHeadings[headingIndex];
      if (h) {
        h.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight briefly
        h.style.backgroundColor = 'rgba(255, 200, 0, 0.3)';
        setTimeout(() => { h.style.backgroundColor = ''; }, 2000);
        return;
      }
    }

    // Fallback (no index): exact match first, then substring containment
    const isExact = (a, b) => a === b;
    const isMatch = (a, b) => isExact(a, b) || a.includes(b) || b.includes(a);

    if (readingView) {
      const headings = readingView.querySelectorAll('h1, h2, h3, h4, h5, h6');
      for (const h of headings) {
        const text = h.textContent.replace(/\[\[|\]\]/g, '').trim();
        if (isMatch(text, headingText)) {
          h.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight briefly
          h.style.backgroundColor = 'rgba(255, 200, 0, 0.3)';
          setTimeout(() => { h.style.backgroundColor = ''; }, 2000);
          return;
        }
      }
    }

    // For source mode, use editor search
    const editor = this.getEditor();
    if (editor) {
      const content = editor.getValue();
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const headingMatch = lines[i].match(/^#{1,6}\s+(.+?)(?:\s+#[\w\u4e00-\u9fa5\-\/]+)*\s*$/);
        if (headingMatch) {
          const hText = headingMatch[1].replace(/\s+#[\w\u4e00-\u9fa5\-\/]+\s*$/g, '').trim();
          if (isMatch(hText, headingText)) {
            editor.setCursor({ line: i, ch: 0 });
            editor.scrollIntoView({ from: { line: i, ch: 0 }, to: { line: i, ch: 0 } }, true);
            return;
          }
        }
      }
    }
  }

  _findAndSelectTextInActiveDoc(text) {
    const editor = this.getEditor();
    if (!editor) return;

    const content = editor.getValue();
    const searchLower = text.toLowerCase();
    const contentLower = content.toLowerCase();
    const pos = contentLower.indexOf(searchLower);
    if (pos >= 0) {
      // Convert character offset to line/ch
      const beforeText = content.substring(0, pos);
      const line = beforeText.split('\n').length - 1;
      const ch = pos - beforeText.lastIndexOf('\n') - 1;
      const endLine = line + text.split('\n').length - 1;
      const lastNewline = text.lastIndexOf('\n');
      const endCh = lastNewline >= 0 ? text.length - lastNewline - 1 : ch + text.length;

      editor.setSelection({ line, ch: Math.max(0, ch) }, { line: endLine, ch: endCh });
      editor.scrollIntoView({ from: { line, ch: 0 }, to: { line: endLine, ch: 0 } }, true);
    }
  }

  closePreview() {
    if (this._previewOutsideClickHandler) {
      document.removeEventListener('mousedown', this._previewOutsideClickHandler);
      this._previewOutsideClickHandler = null;
    }
    
    if (this.previewPanel) {
      this.previewPanel.style.display = 'none';
      this.previewPanel.innerHTML = '';
    }
    this.isPreviewOpen = false;
    this.currentPreviewFile = null;
    this.currentPreviewHeading = null;
    this.restoreListPosition();
    
    this._pendingListClose = true;
    
    this._listCloseHandler = (e) => {
      if (this._matchListPinned) return;
      if (this._pendingListClose && this.matchList && this.matchList.style.display !== 'none') {
        const clickedModal = e.target.closest('.modal-container, .modal-bg, .modal, [role="dialog"]');
        const clickedKeywordBtn = e.target.closest('.swift-match-keyword-btn-wrapper');
        if ((!this.matchList.contains(e.target) && !clickedKeywordBtn) || clickedModal) {
          this.hideMatchList();
          this._pendingListClose = false;
          document.removeEventListener('mousedown', this._listCloseHandler);
        }
      }
    };
    
    setTimeout(() => {
      document.addEventListener('mousedown', this._listCloseHandler);
    }, 10);
  }

  restoreListPosition() {
    if (this.matchList) {
      const savedWidth = this.matchListSize.width || this.settings.matchListWidth;
      const savedHeight = this.matchListSize.height || this.settings.matchListHeight;
      this.matchList.style.width = `${savedWidth}px`;
      this.matchList.style.maxWidth = `${savedWidth}px`;
      this.matchList.style.height = `${savedHeight}px`;
    }
  }

  positionPreviewPanel() {
    if (!this.previewPanel || !this.matchList) return;
    
    let panelWidth = Math.min(this.previewSize.width, window.innerWidth - 100);
    let panelHeight = Math.min(this.previewSize.height, window.innerHeight - 100);
    
    panelWidth = Math.max(300, panelWidth);
    panelHeight = Math.max(200, panelHeight);
    
    this.previewPanel.style.width = `${panelWidth}px`;
    this.previewPanel.style.height = `${panelHeight}px`;
    
    const listWidth = this.matchList.offsetWidth || 250;
    
    let listLeft, listTop, panelLeft, panelTop;
    
    if (this.listFixedPosition.left !== null && this.listFixedPosition.top !== null) {
      listLeft = this.listFixedPosition.left;
      listTop = this.listFixedPosition.top;
      
      listLeft = Math.max(0, Math.min(listLeft, window.innerWidth - listWidth));
      listTop = Math.max(0, Math.min(listTop, window.innerHeight - 100));
      
      panelLeft = listLeft + listWidth + 10;
      panelTop = listTop;
      
      if (panelLeft + panelWidth > window.innerWidth - 10) {
        panelLeft = Math.max(10, window.innerWidth - panelWidth - 10);
        listLeft = panelLeft - listWidth - 10;
        if (listLeft < 10) {
          listLeft = 10;
          panelWidth = Math.min(panelWidth, window.innerWidth - listWidth - 30);
          this.previewPanel.style.width = `${panelWidth}px`;
          panelLeft = listLeft + listWidth + 10;
        }
      }
    } else {
      panelLeft = window.innerWidth - panelWidth - 20;
      panelTop = 50;
      
      if (panelLeft < listWidth + 30) {
        panelLeft = listWidth + 30;
        panelWidth = Math.min(panelWidth, window.innerWidth - listWidth - 50);
        this.previewPanel.style.width = `${panelWidth}px`;
      }
      
      if (panelTop + panelHeight > window.innerHeight - 10) {
        panelTop = Math.max(10, window.innerHeight - panelHeight - 10);
      }
      
      listLeft = panelLeft - listWidth - 10;
      listTop = panelTop;
      
      if (listLeft < 10) {
        listLeft = 10;
        panelLeft = listLeft + listWidth + 10;
      }
    }
    
    this.matchList.style.left = `${listLeft}px`;
    this.matchList.style.top = `${listTop}px`;
    
    this.listFixedPosition.left = listLeft;
    this.listFixedPosition.top = listTop;
    this.previewListPosition.left = listLeft;
    this.previewListPosition.top = listTop;
    
    this.previewPanel.style.left = `${panelLeft}px`;
    this.previewPanel.style.top = `${panelTop}px`;
    
    this.previewPanel.style.opacity = this.previewOpacity;
  }


  hideMatchList() {
    // 只隐藏窗口，不动 peer 模式（pinned/detached 状态保留）；
    // × 孤儿问题由 hideNow 内部的 closeBtn 隐藏兜底
    if (this._searchPeer) this._searchPeer.hideNow();
    else if (this.matchList) this.matchList.style.display = 'none';
  }

  addEditorDecorations(cm, matchLines, totalMatches) {
    if (!cm || !cm.scrollDOM) return;

    const scheme = this.getCurrentSelectionColorScheme();
    const borderColor = scheme.borderColor;
    const matchOpacity = this.settings.matchOpacity ?? 0.6;
    const counterColor = scheme.counterColor;
    const counterBgColor = scheme.counterBgColor;
    const counterSize = this.settings.counterSize;
    const counterPadding = '0px 2px';
    const counterTopOffset = `${this.settings.counterTopOffset}px`;

    cm.scrollDOM.style.setProperty('--minimap-match-color', borderColor);

    cm.scrollDOM.style.setProperty('--minimap-counter-opacity', 1);
    cm.scrollDOM.style.setProperty('--minimap-counter-color', counterColor);
    cm.scrollDOM.style.setProperty('--minimap-counter-bgcolor', this.hexToRgba(counterBgColor, 1));
    cm.scrollDOM.style.setProperty('--minimap-counter-size', `${counterSize}px`);
    cm.scrollDOM.style.setProperty('--minimap-counter-padding', counterPadding);
    cm.scrollDOM.style.setProperty('--minimap-counter-top-offset', counterTopOffset);

    const decorations = [];
    for (let idx = 0; idx < matchLines.length; idx++) {
      const match = matchLines[idx];
      const line = cm.state.doc.line(match.line + 1);
      const from = line.from + match.pos;
      const to = from + this.currentSelection.length;
      const label = `${match.index}/${totalMatches}`;
      const currentItem = this.savedMatchLists.find(m => m.selection === this.currentSelection);
      const hideCounter = currentItem && currentItem.countHidden;

      decorations.push({
        from: from,
        to: to,
        value: Decoration.mark({
          class: `minimap-editor-match${this.getCounterPresetClass()}${hideCounter ? ' minimap-hide-counter' : ''}`,
          attributes: {
            'data-match': label,
            'style': `margin:0 -0.2em;padding:0 0.2em;-webkit-box-decoration-break:clone;box-decoration-break:clone;background:radial-gradient(farthest-side,${this.hexToRgba(borderColor, matchOpacity)} 98%,#0000) bottom left,linear-gradient(${this.hexToRgba(borderColor, matchOpacity)} 0 0) bottom,radial-gradient(farthest-side,${this.hexToRgba(borderColor, matchOpacity)} 98%,#0000) bottom right;background-size:8px 8px,calc(100% - 8px) 8px;background-repeat:no-repeat;`
          }
        })
      });
    }

    const decorationSet = Decoration.set(decorations.sort((a, b) => a.from - b.from));
    cm.dispatch({
      effects: setMatchHighlights.of(decorationSet)
    });
  }

  addEditorDecorationsWithPinned(cm, matchLines, totalMatches) {
    if (!cm || !cm.scrollDOM) return;

    const matchOpacity = this.settings.matchOpacity ?? 0.6;
    const counterSize = this.settings.counterSize;
    const counterPadding = '0px 2px';
    const counterTopOffset = `${this.settings.counterTopOffset}px`;

    cm.scrollDOM.style.setProperty('--minimap-counter-opacity', 1);
    cm.scrollDOM.style.setProperty('--minimap-counter-size', `${counterSize}px`);
    cm.scrollDOM.style.setProperty('--minimap-counter-padding', counterPadding);
    cm.scrollDOM.style.setProperty('--minimap-counter-top-offset', counterTopOffset);

    this.registerEditorField();

    const content = cm.state.doc.toString();
    const lines = content.split('\n');
    const allDecorations = [];

    const currentFile = this.app.workspace.activeLeaf?.view?.file;
    const currentFilePath = currentFile ? currentFile.path : null;
    const currentPreset = this.settings.counterStylePreset || 'glass';

    // Add pinned decorations first
    const pinnedItems = this.savedMatchLists.filter(item => item.pinned && (!currentFilePath || !item.filePath || item.filePath === currentFilePath));
    for (const pinnedItem of pinnedItems) {
      const colorScheme = this.getPinnedColorScheme(pinnedItem);
      const pBorderColor = colorScheme.borderColor;
      let pCounterBgColor = colorScheme.counterBgColor;
      let pCounterColor = colorScheme.counterColor;
      // 描边气泡样式下，计数边框和文字也跟随匹配透明度
      if (currentPreset === 'outlined') {
        pCounterBgColor = this.hexToRgba(pCounterBgColor, matchOpacity);
        pCounterColor = this.hexToRgba(pCounterColor, matchOpacity);
      }
      const searchLower = pinnedItem.selection.toLowerCase();

      // First pass: count total matches
      let totalPinnedMatches = 0;
      for (let i = 0; i < lines.length; i++) {
        const lineLower = lines[i].toLowerCase();
        let pos = 0;
        while ((pos = lineLower.indexOf(searchLower, pos)) !== -1) {
          totalPinnedMatches++;
          pos += 1;
        }
      }

      // Second pass: create decorations
      let matchIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        const lineLower = lines[i].toLowerCase();
        let pos = 0;
        while ((pos = lineLower.indexOf(searchLower, pos)) !== -1) {
          matchIndex++;
          try {
            const line = cm.state.doc.line(i + 1);
            const from = line.from + pos;
            const to = from + pinnedItem.selection.length;
            allDecorations.push({
              from: from,
              to: to,
              value: Decoration.mark({
                class: `minimap-editor-match pinned${this.getCounterPresetClass()}${pinnedItem.countHidden ? ' minimap-hide-counter' : ''}`,
                attributes: {
                  'data-selection': pinnedItem.selection,
                  'data-match': `${matchIndex}/${totalPinnedMatches}`,
                  'style': `margin:0 -0.2em;padding:0 0.2em;-webkit-box-decoration-break:clone;box-decoration-break:clone;background:radial-gradient(farthest-side,${this.hexToRgba(pBorderColor, matchOpacity)} 98%,#0000) bottom left,linear-gradient(${this.hexToRgba(pBorderColor, matchOpacity)} 0 0) bottom,radial-gradient(farthest-side,${this.hexToRgba(pBorderColor, matchOpacity)} 98%,#0000) bottom right;background-size:8px 8px,calc(100% - 8px) 8px;background-repeat:no-repeat;--minimap-counter-bgcolor: ${pCounterBgColor};--minimap-counter-color: ${pCounterColor};`
                }
              })
            });
          } catch (e) {}
          pos += 1;
        }
      }
    }

    // Add current selection decorations on top (using color scheme)
    // Skip if current selection is already pinned (pinned decoration already covers it)
    const isCurrentPinned = this.currentSelection && this.savedMatchLists.some(m => m.selection === this.currentSelection && m.pinned);

    if (!isCurrentPinned) {
      const currentColorScheme = this.getCurrentSelectionColorScheme();
      const currentBorderColor = currentColorScheme.borderColor;
      let currentCounterBgColor = currentColorScheme.counterBgColor;
      let currentCounterColor = currentColorScheme.counterColor;
      // 描边气泡样式下，计数边框和文字也跟随匹配透明度
      if (currentPreset === 'outlined') {
        currentCounterBgColor = this.hexToRgba(currentCounterBgColor, matchOpacity);
        currentCounterColor = this.hexToRgba(currentCounterColor, matchOpacity);
      }

      for (let idx = 0; idx < matchLines.length; idx++) {
        const match = matchLines[idx];
        try {
          const line = cm.state.doc.line(match.line + 1);
          const from = line.from + match.pos;
          const to = from + this.currentSelection.length;
          const label = `${match.index}/${totalMatches}`;

          const isJumpTarget = this._jumpHighlightRange && from === this._jumpHighlightRange.from && to === this._jumpHighlightRange.to;

          if (isJumpTarget) {
            allDecorations.push({
              from: from,
              to: to,
              value: Decoration.mark({
                class: 'minimap-editor-match hl-marshmallow',
                attributes: {
                  'data-match': label,
                  'style': `background:#fff !important;color:#cc2e7a !important;border:2px solid #ff6eb4 !important;border-radius:10px !important;padding:0.1em 0.6em !important;box-shadow:2px 2px 0 #ffaad9 !important;margin:0 -0.2em;-webkit-box-decoration-break:clone;box-decoration-break:clone;--minimap-counter-bgcolor:#ff6eb4;--minimap-counter-color:#fff;`
                }
              })
            });
          } else {
            allDecorations.push({
              from: from,
              to: to,
              value: Decoration.mark({
                class: `minimap-editor-match${this.getCounterPresetClass()}`,
                attributes: {
                  'data-match': label,
                  'style': `margin:0 -0.2em;padding:0 0.2em;-webkit-box-decoration-break:clone;box-decoration-break:clone;background:radial-gradient(farthest-side,${this.hexToRgba(currentBorderColor, matchOpacity)} 98%,#0000) bottom left,linear-gradient(${this.hexToRgba(currentBorderColor, matchOpacity)} 0 0) bottom,radial-gradient(farthest-side,${this.hexToRgba(currentBorderColor, matchOpacity)} 98%,#0000) bottom right;background-size:8px 8px,calc(100% - 8px) 8px;background-repeat:no-repeat;--minimap-counter-bgcolor: ${currentCounterBgColor};--minimap-counter-color: ${currentCounterColor};`
                }
              })
            });
          }
        } catch (e) {}
      }
    }

    if (this._jumpHighlightRange) {
      const jFrom = this._jumpHighlightRange.from;
      const jTo = this._jumpHighlightRange.to;
      allDecorations.push({
        from: jFrom,
        to: jTo,
        value: Decoration.mark({
          class: 'minimap-editor-match hl-marshmallow',
          attributes: {
            'style': `background:#fff !important;color:#cc2e7a !important;border:2px solid #ff6eb4 !important;border-radius:10px !important;padding:0.1em 0.6em !important;box-shadow:2px 2px 0 #ffaad9 !important;margin:0 -0.2em;-webkit-box-decoration-break:clone;box-decoration-break:clone;`
          }
        })
      });
    }

    if (allDecorations.length > 0) {
      const decorationSet = Decoration.set(allDecorations.sort((a, b) => a.from - b.from));
      cm.dispatch({
        effects: setMatchHighlights.of(decorationSet)
      });
    }
  }

  clearHighlights() {
    this.highlights.forEach((h) => {
      if (h.parentNode) h.parentNode.removeChild(h);
    });
    this.highlights = [];
    this.editorHighlights = [];

    if (this.isReadingMode()) {
      this.clearReadingViewHighlights();
    } else {
      const editor = this.getEditor();
      if (editor && editor.cm) {
        editor.cm.dispatch({
          effects: setMatchHighlights.of(Decoration.none)
        });
      }
    }

    // Pin only locks the word, not the list visibility - list can still be hidden
    // But if _keepListVisible flag is set (e.g. from recent search chip click), don't hide
    // pinned 窗口（拖出 × 的状态）不受选区清除影响，与大纲 pinned 行为一致；
    // 焦点在窗口内（如搜索框 focus 导致文档选区塌陷）时也不视为"点击外部"
    const focusInside = !!(this.matchList && this.matchList.style.display !== 'none'
      && this.matchList.contains(document.activeElement));
    if (!this._keepListVisible && this._searchPeer?.mode !== 'pinned' && !focusInside) {
      this.hideMatchList();
    }
    // Preserve _pendingMatchCount and _pendingSearchText so match list can be restored
    // when reopened. Only clear the badge display when there's truly no cached data.
    if (!this._cachedMatchList || this._cachedMatchList.size === 0) {
      this._pendingMatchCount = 0;
      this._pendingSearchText = null;
      this.updateFloatingToggleBadge(0, 0);
    }
  }

  showPinnedDecorations() {
    const currentFile = this.app.workspace.activeLeaf?.view?.file;
    const currentFilePath = currentFile ? currentFile.path : null;
    const pinnedItems = this.savedMatchLists.filter(item => item.pinned && (!currentFilePath || !item.filePath || item.filePath === currentFilePath));
    if (pinnedItems.length === 0) return;

    if (this.isReadingMode()) {
      for (const pinnedItem of pinnedItems) {
        const colorScheme = this.getPinnedColorScheme(pinnedItem);
        this.addReadingViewHighlights(pinnedItem.selection, pinnedItem.matchCount || 0, colorScheme);
      }
      return;
    }

    const editor = this.getEditor();
    if (!editor || !editor.cm) return;

    const cm = editor.cm;
    const content = editor.getValue();
    const lines = content.split('\n');

    this.registerEditorField();

    const matchOpacity = this.settings.matchOpacity ?? 0.6;

    const decorations = [];

    for (const pinnedItem of pinnedItems) {
      const colorScheme = this.getPinnedColorScheme(pinnedItem);
      const borderColor = colorScheme.borderColor;
      let counterBgColor = colorScheme.counterBgColor;
      let counterColor = colorScheme.counterColor;
      // 描边气泡样式下，计数边框和文字也跟随匹配透明度
      const preset = this.settings.counterStylePreset || 'glass';
      if (preset === 'outlined') {
        counterBgColor = this.hexToRgba(counterBgColor, matchOpacity);
        counterColor = this.hexToRgba(counterColor, matchOpacity);
      }

      const searchLower = pinnedItem.selection.toLowerCase();

      // First pass: count total matches
      let totalPinnedMatches = 0;
      for (let i = 0; i < lines.length; i++) {
        const lineLower = lines[i].toLowerCase();
        let pos = 0;
        while ((pos = lineLower.indexOf(searchLower, pos)) !== -1) {
          totalPinnedMatches++;
          pos += 1;
        }
      }

      // Second pass: create decorations
      let matchIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        const lineLower = lines[i].toLowerCase();
        let pos = 0;
        while ((pos = lineLower.indexOf(searchLower, pos)) !== -1) {
          matchIndex++;
          try {
            const line = cm.state.doc.line(i + 1);
            const from = line.from + pos;
            const to = from + pinnedItem.selection.length;

            decorations.push({
              from: from,
              to: to,
              value: Decoration.mark({
                class: `minimap-editor-match pinned${this.getCounterPresetClass()}${pinnedItem.countHidden ? ' minimap-hide-counter' : ''}`,
                attributes: {
                  'data-selection': pinnedItem.selection,
                  'data-match': `${matchIndex}/${totalPinnedMatches}`,
                  'style': `margin:0 -0.2em;padding:0 0.2em;-webkit-box-decoration-break:clone;box-decoration-break:clone;background:radial-gradient(farthest-side,${this.hexToRgba(borderColor, matchOpacity)} 98%,#0000) bottom left,linear-gradient(${this.hexToRgba(borderColor, matchOpacity)} 0 0) bottom,radial-gradient(farthest-side,${this.hexToRgba(borderColor, matchOpacity)} 98%,#0000) bottom right;background-size:8px 8px,calc(100% - 8px) 8px;background-repeat:no-repeat;--minimap-counter-bgcolor: ${counterBgColor};--minimap-counter-color: ${counterColor};`
                }
              })
            });
          } catch (e) {
            // Line may have been deleted
          }
          pos += 1;
        }
      }
    }

    if (decorations.length > 0) {
      const decorationSet = Decoration.set(decorations.sort((a, b) => a.from - b.from));
      cm.dispatch({
        effects: setMatchHighlights.of(decorationSet)
      });
    }
  }

  getCounterPresetClass() {
    const preset = this.settings.counterStylePreset || 'glass';
    return ` minimap-counter-${preset}`;
  }

  parseMultiKeywords(searchText) {
    if (!searchText || !searchText.includes('|')) return null;
    const keywords = searchText.split('|').map(k => k.trim()).filter(k => k.length > 0);
    return keywords.length >= 2 ? keywords : null;
  }

  getMultiKeywordColors(count) {
    const palettes = [
      '#ff6600', '#2196F3', '#4CAF50', '#9C27B0', '#FF9800',
      '#E91E63', '#00BCD4', '#8BC34A', '#FF5722', '#607D8B'
    ];
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(palettes[i % palettes.length]);
    }
    return colors;
  }

  async performMultiKeywordSearch(searchText, keywords) {
    this._searchGeneration++;
    const gen = this._searchGeneration;
    this._searchInProgress = true;
    this.floatingToggle?.classList.add('busy');

    const keywordColors = this.getMultiKeywordColors(keywords.length);
    const fileResults = new Map();

    const extractSnippetsForKeyword = (content, kwLower, maxSnippets = 30) => {
      const lines = content.split('\n');
      const snippets = [];
      for (let i = 0; i < lines.length && snippets.length < maxSnippets; i++) {
        const lineLower = lines[i].toLowerCase();
        const idx = lineLower.indexOf(kwLower);
        if (idx !== -1) {
          const trimmed = lines[i].trim();
          if (trimmed.length > 0) {
            let snippet = trimmed;
            let fullLine = trimmed;
            let truncateStart = 0;
            let truncateEnd = trimmed.length;
            if (snippet.length > 120) {
              const matchIdx = snippet.toLowerCase().indexOf(kwLower);
              truncateStart = Math.max(0, matchIdx - 30);
              truncateEnd = Math.min(snippet.length, matchIdx + kwLower.length + 70);
              snippet = snippet.slice(truncateStart, truncateEnd);
            }
            snippets.push({ text: snippet, fullLine, truncateStart, truncateEnd });
          }
        }
      }
      return snippets;
    };

    try {
      for (let ki = 0; ki < keywords.length; ki++) {
        if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
        const kw = keywords[ki];
        const kwLower = kw.toLowerCase();
        const allFiles = this.app.vault.getMarkdownFiles();

        for (const file of allFiles) {
          if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
          try {
            const nameMatch = file.name.toLowerCase().includes(kwLower);
            const content = await this.app.vault.cachedRead(file);
            if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }
            const contentMatch = content && content.toLowerCase().includes(kwLower);

            if (nameMatch || contentMatch) {
              if (!fileResults.has(file.path)) {
                fileResults.set(file.path, { file, keywordHits: [], totalMatches: 0 });
              }
              const entry = fileResults.get(file.path);
              const matchCount = contentMatch
                ? (content.toLowerCase().split(kwLower).length - 1)
                : 1;
              const snippets = contentMatch ? extractSnippetsForKeyword(content, kwLower) : [];
              entry.keywordHits.push({
                keyword: kw,
                keywordIndex: ki,
                color: keywordColors[ki],
                matchCount,
                snippets
              });
              entry.totalMatches += matchCount;
            }
          } catch (e) {
            continue;
          }
        }
      }
    } catch (e) {
      console.error('Multi-keyword search error:', e);
    }

    if (this._searchGeneration !== gen) { this._searchInProgress = false; this.floatingToggle?.classList.remove('busy'); return; }

    const sortedEntries = [...fileResults.values()].filter(entry => {
      if (this.settings.multiKeywordRequireAll !== false) {
        return entry.keywordHits.length === keywords.length;
      }
      return true;
    }).sort((a, b) => {
      if (b.keywordHits.length !== a.keywordHits.length) {
        return b.keywordHits.length - a.keywordHits.length;
      }
      return b.totalMatches - a.totalMatches;
    });

    const fileMap = new Map();
    let totalAllDocMatches = 0;
    for (const entry of sortedEntries.slice(0, 200)) {
      const items = [];
      for (const hit of entry.keywordHits) {
        if (hit.snippets.length > 0) {
          items.push({
            text: hit.snippets[0].text,
            level: 0,
            type: 'content',
            snippets: hit.snippets,
            keyword: hit.keyword,
            keywordIndex: hit.keywordIndex,
            keywordColor: hit.color
          });
        } else {
          items.push({
            text: entry.file.basename,
            level: 0,
            type: 'content',
            keyword: hit.keyword,
            keywordIndex: hit.keywordIndex,
            keywordColor: hit.color
          });
        }
      }
      totalAllDocMatches += entry.totalMatches;
      fileMap.set(entry.file, items);
    }

    this._searchInProgress = false; this.floatingToggle?.classList.remove('busy');
    this._cachedMatchList = fileMap;
    this._cachedMatchListKey = searchText;
    this._multiKeywordData = { keywords, keywordColors };
    this._pendingShowList = { searchText, matchCount: totalAllDocMatches };
    this._pendingMatchCount = totalAllDocMatches;
    this._recentSearchCaches[searchText] = { fileMap, matchCount: totalAllDocMatches };
    this.updateFloatingToggleBadge(fileMap.size, totalAllDocMatches);

    if (this._isListVisible || this._keepListVisible) {
      this.renderMatchList(fileMap, totalAllDocMatches, false);
    }
  }

  getPinnedColorScheme(pinnedItem) {
    const colorIndex = pinnedItem.colorIndex || 0;
    const schemes = this.settings.pinColorSchemes || DEFAULT_SETTINGS.pinColorSchemes;
    const scheme = { ...schemes[colorIndex % schemes.length] };
    const preset = this.settings.counterStylePreset || 'glass';
    if (preset === 'glass') {
      // 毛玻璃: 计数颜色固定，深浅自动切换
      const isDark = document.body.classList.contains('theme-dark');
      scheme.counterColor = isDark ? '#e0dcdc' : '#aba6a6';
    } else if (preset === 'outlined') {
      // 描边气泡: borderLinked 时 counterBgColor = borderColor
      if (scheme.borderLinked !== false) {
        scheme.counterBgColor = scheme.borderColor;
      }
      // counterLinked 时 counterColor = counterBgColor
      if (scheme.counterLinked !== false) {
        scheme.counterColor = scheme.counterBgColor;
      }
    }
    return scheme;
  }

  getCurrentSelectionColorScheme() {
    const pinnedItems = this.savedMatchLists.filter(m => m.pinned);
    const nextColorIndex = pinnedItems.length % this.settings.pinColorSchemes.length;
    const scheme = { ...this.settings.pinColorSchemes[nextColorIndex] };
    const preset = this.settings.counterStylePreset || 'glass';
    if (preset === 'glass') {
      const isDark = document.body.classList.contains('theme-dark');
      scheme.counterColor = isDark ? '#e0dcdc' : '#aba6a6';
    } else if (preset === 'outlined') {
      if (scheme.borderLinked !== false) {
        scheme.counterBgColor = scheme.borderColor;
      }
      if (scheme.counterLinked !== false) {
        scheme.counterColor = scheme.counterBgColor;
      }
    }
    return scheme;
  }

  updateMinimapContent() {
    if (!this.minimapContent) return;

    // Check if the minimap container's parent view is blacklisted
    if (this.minimapContainer && this.minimapContainer.parentNode) {
      const leafInfo = this._getViewInfoFromContainer(this.minimapContainer.parentNode);
      if (leafInfo && this._isViewInfoBlacklisted(leafInfo)) {
        this.minimapContainer.parentNode.removeChild(this.minimapContainer);
        this.minimapContainer = null;
        this.minimapContent = null;
        this.slider = null;
        return;
      }
    }

    if (this.isReadingMode()) {
      const file = this.app.workspace.activeLeaf?.view?.file;
      if (file) {
        this.app.vault.read(file).then(content => {
          this.minimapContent.textContent = content;
          setTimeout(() => {
            this.updateViewport();
          }, 50);
        }).catch(() => {
          // Retry after delay
          setTimeout(() => this.updateMinimapContent(), 200);
        });
      } else {
        setTimeout(() => this.updateMinimapContent(), 200);
      }
    } else {
      const editor = this.getEditor();
      if (!editor) {
        setTimeout(() => this.updateMinimapContent(), 200);
        return;
      }
      const content = editor.getValue();
      if (!content) {
        setTimeout(() => this.updateMinimapContent(), 200);
        return;
      }
      this.minimapContent.textContent = content;
      setTimeout(() => {
        this.updateViewport();
      }, 50);
    }
  }

  updateViewport() {
    if (!this.minimapContainer || !this.minimapContent) return;

    const containerHeight = this.minimapContainer.clientHeight;

    let lineCount = 0;

    if (this.isReadingMode()) {
      const content = this.minimapContent.textContent || '';
      lineCount = content.split('\n').length;
    } else {
      const editor = this.getEditor();
      if (!editor) return;
      const content = editor.getValue();
      lineCount = content.split('\n').length;
    }

    const lineHeightInMinimap = 2;
    const naturalContentHeight = lineCount * lineHeightInMinimap;
    const contentHeight = Math.min(containerHeight, naturalContentHeight);
    
    this.minimapContent.style.height = `${contentHeight}px`;
    this.minimapContent.style.fontSize = '2px';
    this.minimapContent.style.lineHeight = '1';

    if (!this.slider) return;

    let scrollTop, scrollHeight, clientHeight;

    if (this.isReadingMode()) {
      const scrollEl = this.getReadingViewScrollEl();
      if (!scrollEl) return;
      scrollTop = scrollEl.scrollTop;
      scrollHeight = scrollEl.scrollHeight;
      clientHeight = scrollEl.clientHeight;
    } else {
      const editor = this.getEditor();
      if (!editor || !editor.cm) return;
      const scrollDOM = editor.cm.scrollDOM;
      if (!scrollDOM) return;
      scrollTop = scrollDOM.scrollTop;
      scrollHeight = scrollDOM.scrollHeight;
      clientHeight = scrollDOM.clientHeight;
    }

    if (scrollHeight <= clientHeight) {
      this.slider.style.height = `${contentHeight}px`;
      this.slider.style.top = '0px';
      return;
    }

    const scrollRatio = scrollTop / (scrollHeight - clientHeight);
    const viewportRatio = clientHeight / scrollHeight;
    const sliderHeight = Math.max(20, viewportRatio * contentHeight);
    const sliderTop = scrollRatio * (contentHeight - sliderHeight);

    this.slider.style.height = `${sliderHeight}px`;
    this.slider.style.top = `${sliderTop}px`;
  }

  onunload() {
    if (this._themeObserver) this._themeObserver.disconnect();
    this.closeSettingsPanel();
    this.closeFloatingContextMenu();
    this.closeFloatingEditPanel();
    // Clean up custom style elements
    const customStyleEl = document.getElementById('swift-match-custom-style');
    if (customStyleEl) customStyleEl.remove();
    const previewStyleEl = document.getElementById('swift-match-preview-style');
    if (previewStyleEl) previewStyleEl.remove();
    // Clean up keyword button custom styles
    document.querySelectorAll('[id^="swift-match-keyword-custom-style-"],[id^="swift-match-keyword-preview-style-"]').forEach(el => el.remove());
    this.hidePinIcon();
    this.removeEditorPadding();
    const statusBar = document.querySelector('.status-bar');
    if (statusBar) {
      statusBar.classList.remove('minimap-hide-statusbar');
    }
    if (this.boundMouseMove) {
      document.removeEventListener('mousemove', this.boundMouseMove);
    }
    if (this.boundMouseUp) {
      document.removeEventListener('mouseup', this.boundMouseUp);
    }
    if (this.boundWheel && this.minimapContainer) {
      this.minimapContainer.removeEventListener('wheel', this.boundWheel);
    }
    if (this.boundContextMenu && this.minimapContainer) {
      this.minimapContainer.removeEventListener('contextmenu', this.boundContextMenu);
    }
    if (this.boundListWheel && this.matchList) {
      this.matchList.removeEventListener('wheel', this.boundListWheel);
    }
    if (this.boundListWheel && this.previewPanel) {
      this.previewPanel.removeEventListener('wheel', this.boundListWheel);
    }
    if (this.scrollHandler) {
      document.removeEventListener('scroll', this.scrollHandler, true);
      if (this.editorScrollEl) {
        this.editorScrollEl.removeEventListener('scroll', this.scrollHandler);
      }
    }
    if (this.minimapContainer && this.minimapContainer.parentNode) {
      this.minimapContainer.parentNode.removeChild(this.minimapContainer);
    }
    this._removeOutlineOnHover();
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
    if (this.matchList && this.matchList.parentNode) {
      this.matchList.parentNode.removeChild(this.matchList);
    }
    if (this.previewPanel && this.previewPanel.parentNode) {
      this.previewPanel.parentNode.removeChild(this.previewPanel);
    }
    if (this._previewOutsideClickHandler) {
      document.removeEventListener('mousedown', this._previewOutsideClickHandler);
    }
    if (this._listCloseHandler) {
      document.removeEventListener('mousedown', this._listCloseHandler);
    }
    if (this._matchListPositionUpdater) {
      window.removeEventListener('resize', this._matchListPositionUpdater);
    }
    if (this._readingModeMouseUpHandler) {
      document.removeEventListener('mouseup', this._readingModeMouseUpHandler);
    }
    if (this._readingModeKeyUpHandler) {
      document.removeEventListener('keyup', this._readingModeKeyUpHandler);
    }
    this._removeSwiftMatchExportNav();
    this.clearReadingViewHighlights();
    this.hideAllMatchListIndicators();
    // Clean up floating search chip / peer
    this.destroyFloatingToggle();
    // Clean up floating keyword buttons
    for (const btnData of this._floatingKeywordButtons) {
      if (btnData.wrapper && btnData.wrapper.parentNode) {
        btnData.wrapper.parentNode.removeChild(btnData.wrapper);
      }
    }
    this._floatingKeywordButtons = [];
    if (this.matchListIndicator && this.matchListIndicator.parentNode) {
      this.matchListIndicator.parentNode.removeChild(this.matchListIndicator);
    }
  }
}

module.exports = MinimapPlugin;
