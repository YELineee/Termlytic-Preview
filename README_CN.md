# Termlytic

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Electron](https://img.shields.io/badge/Electron-20+-blue.svg)](https://www.electronjs.org/) [![Vue.js](https://img.shields.io/badge/Vue.js-3.0+-green.svg)](https://vuejs.org/)

> 🚀 **将终端历史转化为精美洞察**  
> 一款现代桌面应用，分析你的 Shell 命令并通过令人惊叹的可视化揭示生产力模式。

![Dashboard](resources/dashboard.png)

---

**[🇺🇸 English](README.md)** | **🇨🇳 中文**

---

## ✨ 核心亮点

🎯 **智能分析** - 追踪命令模式、执行频率和生产力趋势，支持多种 Shell（Zsh、Bash、Fish）

� **交互式可视化** - GitHub 风格热力图、实时图表和直观仪表板，由 ECharts 驱动

⚡ **实时更新** - 智能缓存和增量解析，即时获取洞察

🎨 **精美界面** - 现代深色主题，流畅动画和响应式设计

🔍 **深度洞察** - 24 小时活动分析、命令分类和生产力高峰检测

## 📸 界面预览

### 仪表板概览
![仪表板](resources/dashboard.png)

### 交互式热力图
![热力图](resources/heatmap.png)

### 票据板视图
![票据板](resources/ticket.png)

## 🚀 快速开始

### 环境要求
- Node.js 16+
- 配置好时间戳的 Shell（见下方配置）

### 安装

```bash
git clone https://github.com/YELineee/Termlytic-Preview.git
cd Termlytic-Preview
npm install
npm run dev
```

### 构建

```bash
npm run build          # 当前平台
npm run build:mac      # macOS
npm run build:win      # Windows
npm run build:linux    # Linux
```

## ⚙️ Shell 配置（必需）

**Termlytic 需要带时间戳的 Shell 历史记录。使用前请先配置：**

### Zsh
在 `~/.zshrc` 中添加：
```bash
setopt EXTENDED_HISTORY SHARE_HISTORY INC_APPEND_HISTORY
export HISTFILE=~/.zsh_history HISTSIZE=10000 SAVEHIST=10000
```

### Bash
在 `~/.bashrc` 中添加：
```bash
export HISTTIMEFORMAT="%Y-%m-%d %H:%M:%S "
export HISTSIZE=10000 HISTFILESIZE=20000
```

### Fish
默认启用时间戳。可选增加历史大小（`~/.config/fish/config.fish`）：
```bash
set -g fish_history_max_size 10000
```

应用配置：`source ~/.zshrc`（或重启终端）

## �️ 技术栈

- **前端**: Vue 3 + Tailwind CSS + ECharts
- **后端**: Electron + Node.js
- **构建**: Vite + Electron Builder

## 📝 功能特性

- 📈 **全面分析**：日/周/月命令统计
- 🔥 **活动热力图**：GitHub 风格贡献日历
- ⏰ **时间分析**：24 小时生产力模式
- 🏷️ **智能分类**：按类型自动分类命令
- 🔄 **多 Shell 支持**：Zsh、Bash、Fish 自动检测
- 💾 **智能缓存**：快速增量更新

## 🤝 参与贡献

欢迎贡献！随时提交 Issue 或 PR。

## 📄 开源许可

MIT License - 详见 [LICENSE](LICENSE)

---

> ⚠️ **测试预览版**：此项目由 AI 辅助开发，可能存在 Bug。请谨慎使用。
应用配置：`source ~/.zshrc`（或重启终端）

## 🛠️ 技术栈

- **前端**: Vue 3 + Tailwind CSS + ECharts
- **后端**: Electron + Node.js
- **构建**: Vite + Electron Builder

## � 功能特性

- 📈 **全面分析**：日/周/月命令统计
- 🔥 **活动热力图**：GitHub 风格贡献日历
- ⏰ **时间分析**：24 小时生产力模式
- 🏷️ **智能分类**：按类型自动分类命令
- 🔄 **多 Shell 支持**：Zsh、Bash、Fish 自动检测
- 💾 **智能缓存**：快速增量更新

## 🤝 参与贡献

欢迎贡献！随时提交 Issue 或 PR。

## � 开源许可

MIT License - 详见 [LICENSE](LICENSE)

---

> ⚠️ **测试预览版**：此项目由 AI 辅助开发，可能存在 Bug。请谨慎使用.
