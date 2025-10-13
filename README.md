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

## �️ Tech Stack

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

Contributions welcome! Feel free to open issues or submit PRs.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

> ⚠️ **Beta Preview**: This project is AI-assisted and may contain bugs. Use at your own discretion.bash
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

Contributions welcome! Feel free to open issues or submit PRs.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

> ⚠️ **Beta Preview**: This project is AI-assisted and may contain bugs. Use at your own discretion.

```

After adding these lines, restart your terminal or run:
```bash
source ~/.zshrc
```

### For Bash Users

Add these lines to your `~/.bashrc` or `~/.bash_profile`:

```bash
# Enable history with timestamps
export HISTFILE=~/.bash_history
export HISTSIZE=10000
export HISTFILESIZE=20000
export HISTTIMEFORMAT="%Y-%m-%d %H:%M:%S "
export HISTCONTROL=ignoredups:erasedups
```

### For Fish Users

Fish automatically saves timestamps, but you can increase the history size:

```bash
# Add to ~/.config/fish/config.fish
set -g fish_history_max_size 10000
```

**Note**: Without proper shell configuration with timestamps and sufficient history size, Termlytic will not be able to provide accurate analytics.


## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YELineee/ViscmdTE.git
cd ViscmdTE

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

### Build

```bash
# Build for your current platform
npm run build

# Platform-specific builds
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 🏗️ Project Structure

```
src/
├── main/                    # Electron main process
│   ├── modules/            # Core modules
│   ├── services/           # Business services
│   └── parsers/           # Shell format parsers
├── renderer/               # Vue.js frontend
│   └── src/
│       ├── components/     # Vue components
│       ├── composables/    # Vue composables
│       └── services/       # Frontend services
└── preload/               # Electron preload scripts
```

## 🛠️ Technology Stack

- **Frontend**: Vue 3, Tailwind CSS, ECharts
- **Backend**: Electron, Node.js
- **Build Tool**: Vite, Electron Builder
- **Code Quality**: ESLint, Prettier

## 🔧 Supported Shells

- **Zsh** (.zsh_history) - **Requires EXTENDED_HISTORY configuration**
- **Bash** (.bash_history) - **Requires HISTTIMEFORMAT configuration** 
- **Fish** (fish_history) - **Timestamps enabled by default**

**Note**: Only properly configured shells with timestamp support will work with Termlytic.

## 📝 Usage

### Initial Setup
1. **Configure your shell** (see requirements above) - This is mandatory!
2. Use your terminal normally for a few days to build up history
3. Launch Termlytic

### Using the Application

**Dashboard Page:**
- View your overall terminal usage statistics
- See your most frequently used commands
- Check daily, weekly, and monthly activity trends
- Monitor shell distribution across different environments

**Heatmap Page:**
- Explore your command usage in a GitHub-style calendar view
- Click on any date to see detailed command history for that day
- Filter by different shell types (Zsh, Bash, Fish)
- Switch between different years to see historical patterns

**Ticket Board Page:**
- Browse your command data in an organized card layout
- Get insights into your development workflow patterns
- Review command categories and usage frequencies

**Settings Page:**
- Configure application preferences
- Run diagnostic tools to troubleshoot issues
- View system information and shell detection status

### Troubleshooting
If you see "No data" or empty charts:
1. Verify your shell configuration includes timestamps
2. Check that `HISTSIZE` and `SAVEHIST` are set to at least 1000
3. Ensure you have recent command history (use terminal for a while)
4. Use the diagnostic tools in the Settings page

## 🐛 Troubleshooting

**Common Issues:**

1. **No data displayed**: 
   - Check shell configuration (timestamps must be enabled)
   - Verify history file exists and has content
   - Ensure history size limits are adequate

2. **Incomplete analytics**:
   - Increase `HISTSIZE` and `SAVEHIST` values
   - Make sure `EXTENDED_HISTORY` is enabled for Zsh

3. **Application won't start**:
   - Check Node.js version (requires v16+)
   - Verify all dependencies are installed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
