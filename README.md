# Trace

> Quickly match and mark selected text across your vault with visual highlights.

划词即搜，全库高亮。在编辑器中选中任意文本，Trace 自动在整个仓库中搜索匹配项并高亮标注，结果以悬浮列表呈现。

> Select any text in the editor — Trace instantly searches your entire vault for matches and highlights them, with results in a floating list.

## 核心功能

> ## Features

- **划词即搜** — 选中编辑器文本即后台全库搜索，匹配项实时高亮

  > **Search on selection** — Selecting text in the editor triggers a background vault-wide search; matches are highlighted in real time.

- **悬浮结果列表** — 功能区按钮 + 悬浮球，鼠标悬停展开搜索结果，支持文件数 / 匹配数统计

  > **Floating result list** — Ribbon icon + floating toggle; hover to expand results with file/match counts.

- **全库穷尽搜索** — 搜索所有文件内容中的匹配项，不限于已打开的文件

  > **Exhaustive search** — Searches match content across all files in the vault, not just open ones.

- **搜索缓存** — 内存 + 磁盘双层缓存；有缓存时悬停展开不自动重搜，点击刷新按钮手动触发

  > **Search cache** — Two-tier memory + disk cache; hovering with cached results won't re-search. Click the refresh button to re-search manually.

- **搜索词管理** — 最近 / 收藏 / 置顶，快速切换关键词

  > **Search term management** — Recent / favorite / pinned searches for quick keyword switching.

- **多关键词搜索** — 支持多关键词组合搜索

  > **Multi-keyword search** — Combine multiple keywords in a single search.

## 安装

> ## Installation

从 GitHub Release 下载 `main.js`、`manifest.json`、`styles.css`，放入 `.obsidian/plugins/trace/` 目录，然后在 Obsidian 设置中启用插件。

> Download `main.js`, `manifest.json`, `styles.css` from the GitHub Release, place them in `.obsidian/plugins/trace/`, then enable the plugin in Obsidian settings.

## 许可

MIT

> ## License
>
> MIT