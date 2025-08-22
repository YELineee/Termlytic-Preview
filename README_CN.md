# Termlytic

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Electron](https://img.shields.io/badge/Electron-20+-blue.svg)](https://www.electronjs.org/) [![Vue.js](https://img.shields.io/badge/Vue.js-3.0+-green.svg)](https://vuejs.org/) [![Node.js](https://img.shields.io/badge/Node.js-16+-brightgreen.svg)](https://nodejs.org/)

🚀 **强大而美观的终端命令分析应用**，将你的Shell历史记录转化为有意义的洞察和令人惊叹的可视化。

Termlytic分析你的命令行使用模式，通过优雅现代的界面提供全面的分析。无论你是想优化工作流程的开发者，还是单纯对自己的终端习惯感到好奇，Termlytic都能为你提供所需的数据驱动洞察。

---

**[🇺🇸 English](README.md)** | **🇨🇳 中文**

---

> ⚠️ **测试预览版警告**  
> 该项目目前处于 **测试/预览** 版本。大部分代码是在AI辅助下生成的，可能包含错误或不完整的功能。请谨慎使用，欢迎反馈问题！

## 💡 为什么创建这个项目

我一直热爱数据可视化，喜欢将原始信息转化为美观、有意义的洞察。这个项目受到了 [cmd-wrapped](https://github.com/YiNNx/cmd-wrapped) 的启发，这是一个用Rust编写的出色终端使用分析工具。

我想创建一个类似但功能更强的工具：
- **实时分析** 而不仅仅是年度总结
- **交互式可视化** 可以深入探索和钻取
- **跨平台桌面应用** 具有现代响应式界面
- **多Shell支持** 智能解析和缓存

目标是构建一个不仅显示你使用*什么*命令，还显示*何时*、*多频繁*以及*以什么模式*使用的工具 - 帮助开发者理解和优化他们的工作流习惯。

## ✨ 功能特性

- **📊 全面分析**：详细的Shell命令历史统计分析，包括：
  - 日、周、月、年命令计数
  - 最常用命令和执行模式
  - Shell类型分布（Zsh、Bash、Fish）
  - 命令执行时间趋势

- **🎯 命令洞察**：发现你的生产力模式：
  - 按频率和最近使用排序的热门命令
  - 命令分类（文件操作、开发工具、系统管理）
  - 每小时活动分布，识别生产力高峰时间
  - 命令复杂度分析

- **📈 可视化仪表板**：基于ECharts的美观交互式图表：
  - 响应式设计的实时统计
  - 周和月活动可视化
  - 命令分布饼图
  - 基于时间线的活动追踪

- **⏰ 时间分析**：交互式热力图日历视图：
  - GitHub风格的日常命令使用贡献热力图
  - 点击任意日期查看详细命令历史
  - 多年视图和Shell类型过滤
  - 带时间戳的每日命令分解

- **🔍 多Shell支持**：与流行Shell的无缝集成：
  - 支持扩展历史格式的Zsh
  - 支持时间戳格式的Bash
  - 原生时间戳支持的Fish
  - 自动Shell检测和解析

- **⚡ 实时更新**：智能缓存和增量分析：
  - 监控Shell历史文件变化
  - 大型历史文件的增量解析
  - 快速加载的高效数据缓存
  - 后台分析不阻塞UI

- **🎨 现代界面**：简洁响应式界面：
  - 为开发者优化的深色主题
  - 不同屏幕尺寸的响应式设计
  - 流畅的动画和过渡效果
  - 快速导航的键盘快捷键

## 📸 界面截图

### 仪表板概览
![仪表板](resources/dashboard.png)
*主仪表板提供终端使用概览，包含关键统计信息、最近命令和活动趋势。一目了然地查看最常用命令、日/周/月统计信息和Shell分布。*

### 热力图分析  
![热力图](resources/heatmap.png)
*交互式热力图可视化显示你的命令使用模式随时间的变化。点击任意日期查看该特定日期的详细命令历史和统计信息。支持多年视图和Shell类型过滤。*

### 票据板视图
![票据板](resources/ticket.png)
*独特的票据风格界面，以有组织的卡片布局展示你的命令数据。非常适合回顾命令模式和深入了解开发工作流程。*

## ⚠️ 重要要求

**使用Termlytic之前，必须配置你的Shell以保存带时间戳的命令历史：**

### Zsh用户（必需）

将这些行添加到你的 `~/.zshrc` 文件：

```bash
# 启用带时间戳的扩展历史格式
export HISTFILE=~/.zsh_history
export HISTSIZE=10000
export SAVEHIST=10000
setopt EXTENDED_HISTORY
setopt SHARE_HISTORY
setopt HIST_VERIFY
setopt INC_APPEND_HISTORY
```

添加这些行后，重启终端或运行：
```bash
source ~/.zshrc
```

### Bash用户

将这些行添加到你的 `~/.bashrc` 或 `~/.bash_profile`：

```bash
# 启用带时间戳的历史
export HISTFILE=~/.bash_history
export HISTSIZE=10000
export HISTFILESIZE=20000
export HISTTIMEFORMAT="%Y-%m-%d %H:%M:%S "
export HISTCONTROL=ignoredups:erasedups
```

### Fish用户

Fish自动保存时间戳，但你可以增加历史大小：

```bash
# 添加到 ~/.config/fish/config.fish
set -g fish_history_max_size 10000
```

**注意**：如果没有正确配置Shell的时间戳和足够的历史大小，Termlytic将无法提供准确的分析。

## 🚀 快速开始

### 前置要求

- Node.js (v16或更高版本)
- npm或yarn

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/ViscmdTE.git
cd ViscmdTE

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev
```

### 构建

```bash
# 为当前平台构建
npm run build

# 特定平台构建
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 🏗️ 项目结构

```
src/
├── main/                    # Electron主进程
│   ├── modules/            # 核心模块
│   ├── services/           # 业务服务
│   └── parsers/           # Shell格式解析器
├── renderer/               # Vue.js前端
│   └── src/
│       ├── components/     # Vue组件
│       ├── composables/    # Vue组合式函数
│       └── services/       # 前端服务
└── preload/               # Electron预加载脚本
```

## 🛠️ 技术栈

- **前端**：Vue 3, Tailwind CSS, ECharts
- **后端**：Electron, Node.js
- **构建工具**：Vite, Electron Builder
- **代码质量**：ESLint, Prettier

## 🔧 支持的Shell

- **Zsh** (.zsh_history) - **需要EXTENDED_HISTORY配置**
- **Bash** (.bash_history) - **需要HISTTIMEFORMAT配置** 
- **Fish** (fish_history) - **默认启用时间戳**

**注意**：只有正确配置时间戳支持的Shell才能与Termlytic配合使用。

## 📝 使用方法

### 初始设置
1. **配置你的Shell**（见上述要求）- 这是必需的！
2. 正常使用终端几天以建立历史记录
3. 启动Termlytic

### 使用应用

**仪表板页面：**
- 查看整体终端使用统计
- 查看最常用的命令
- 检查日、周、月活动趋势
- 监控不同环境中的Shell分布

**热力图页面：**
- 在GitHub风格的日历视图中探索命令使用情况
- 点击任意日期查看当天的详细命令历史
- 按不同Shell类型过滤（Zsh、Bash、Fish）
- 切换不同年份查看历史模式

**票据板页面：**
- 以有组织的卡片布局浏览命令数据
- 深入了解开发工作流程模式
- 查看命令类别和使用频率

**设置页面：**
- 配置应用首选项
- 运行诊断工具排查问题
- 查看系统信息和Shell检测状态

### 问题排查
如果看到"无数据"或空图表：
1. 验证Shell配置包含时间戳
2. 检查 `HISTSIZE` 和 `SAVEHIST` 至少设置为1000
3. 确保有最近的命令历史（使用终端一段时间）
4. 在设置页面使用诊断工具

## 🐛 故障排除

**常见问题：**

1. **未显示数据**：
   - 检查Shell配置（必须启用时间戳）
   - 验证历史文件存在且有内容
   - 确保历史大小限制足够

2. **分析不完整**：
   - 增加 `HISTSIZE` 和 `SAVEHIST` 值
   - 确保为Zsh启用了 `EXTENDED_HISTORY`

3. **应用无法启动**：
   - 检查Node.js版本（需要v16+）
   - 验证所有依赖已安装

## 🤝 贡献

欢迎贡献！请随时提交Pull Request。

## 📄 许可证

该项目采用MIT许可证。
