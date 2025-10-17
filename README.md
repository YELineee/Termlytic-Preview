# Termlytic

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Electron](https://img.shields.io/badge/Electron-20+-blue.svg)](https://www.electronjs.org/) [![Vue.js](https://img.shields.io/badge/Vue.js-3.0+-green.svg)](https://vuejs.org/)

> 🚀 **Transform your terminal history into beautiful insights**
> A modern desktop app that analyzes your shell commands and reveals productivity patterns through stunning visualizations.

![Dashboard](resources/dashboard.png)

---

**🇺🇸 English** | **[🇨🇳 中文](README_CN.md)**

---

## ✨ Highlights

🎯 **Smart Analytics** - Track command patterns, execution frequency, and productivity trends across multiple shells (Zsh, Bash, Fish)

📊 **Interactive Visualizations** - GitHub-style heatmaps, real-time charts, and intuitive dashboards powered by ECharts

⚡ **Real-time Updates** - Intelligent caching and incremental parsing for instant insights

🎨 **Beautiful UI** - Modern dark theme with smooth animations and responsive design

🔍 **Deep Insights** - 24-hour activity analysis, command categorization, and peak productivity detection

## 📸 Screenshots

### Dashboard Overview
![Dashboard](resources/dashboard.png)

### Interactive Heatmap
![Heatmap](resources/heatmap.png)

### Ticket Board View
![Ticket Board](resources/ticket.png)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Configured shell with timestamp support (see below)

### Installation

```bash
git clone https://github.com/YELineee/Termlytic-Preview.git
cd Termlytic-Preview
npm install
npm run dev
```

### Build

```bash
npm run build          # Current platform
npm run build:mac      # macOS
npm run build:win      # Windows
npm run build:linux    # Linux
```

## ⚙️ Shell Configuration (Required)

**Termlytic requires shell history with timestamps. Configure your shell before using:**

### Zsh
Add to `~/.zshrc`:
```bash
setopt EXTENDED_HISTORY SHARE_HISTORY INC_APPEND_HISTORY
export HISTFILE=~/.zsh_history HISTSIZE=10000 SAVEHIST=10000
```

### Bash
Add to `~/.bashrc`:
```bash
export HISTTIMEFORMAT="%Y-%m-%d %H:%M:%S "
export HISTSIZE=10000 HISTFILESIZE=20000
```

### Fish
Timestamps enabled by default. Optionally increase history size in `~/.config/fish/config.fish`:
```bash
set -g fish_history_max_size 10000
```

Apply changes: `source ~/.zshrc` (or restart terminal)

## 🛠️ Tech Stack

- **Frontend**: Vue 3 + Tailwind CSS + ECharts
- **Backend**: Electron + Node.js
- **Build**: Vite + Electron Builder

## 📝 Features

- 📈 **Comprehensive Analytics**: Daily/weekly/monthly command statistics
- 🔥 **Activity Heatmap**: GitHub-style contribution calendar
- ⏰ **Time Analysis**: 24-hour productivity patterns
- 🏷️ **Smart Categorization**: Auto-classify commands by type
- 🔄 **Multi-shell Support**: Zsh, Bash, Fish with auto-detection
- 💾 **Intelligent Caching**: Fast incremental updates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

> ⚠️ **Beta Preview**: This project is AI-assisted and may contain bugs. Use at your own discretion.
