/**
 * Mock Data Generator
 * 生成真实感的 Shell 命令历史记录用于测试
 */

class MockDataGenerator {
  constructor() {
    // 命令模板库 - 分类组织
    this.commandTemplates = {
      // 文件系统操作
      filesystem: [
        'ls -la',
        'ls -lh {{dir}}',
        'cd {{dir}}',
        'pwd',
        'mkdir -p {{dir}}',
        'rm -rf {{file}}',
        'cp {{file1}} {{file2}}',
        'mv {{file1}} {{file2}}',
        'touch {{file}}',
        'cat {{file}}',
        'less {{file}}',
        'head -n 20 {{file}}',
        'tail -f {{file}}',
        'chmod 755 {{file}}',
        'chown {{user}} {{file}}',
        'find . -name "{{pattern}}"',
        'du -sh {{dir}}',
        'df -h'
      ],

      // Git 操作
      git: [
        'git status',
        'git add .',
        'git add {{file}}',
        'git commit -m "{{commit_message}}"',
        'git push',
        'git push origin {{branch}}',
        'git pull',
        'git pull origin {{branch}}',
        'git checkout {{branch}}',
        'git checkout -b {{branch}}',
        'git branch',
        'git branch -d {{branch}}',
        'git log --oneline',
        'git log -p {{file}}',
        'git diff',
        'git diff {{file}}',
        'git stash',
        'git stash pop',
        'git merge {{branch}}',
        'git rebase {{branch}}',
        'git tag {{tag}}',
        'git clone {{repo}}'
      ],

      // 文本处理
      text: [
        'grep "{{pattern}}" {{file}}',
        'grep -r "{{pattern}}" .',
        'sed -i "s/{{old}}/{{new}}/g" {{file}}',
        'awk \'{print $1}\' {{file}}',
        'sort {{file}}',
        'uniq {{file}}',
        'wc -l {{file}}',
        'diff {{file1}} {{file2}}'
      ],

      // 网络操作
      network: [
        'ping {{host}}',
        'curl {{url}}',
        'curl -X POST {{url}} -d \'{{data}}\'',
        'wget {{url}}',
        'ssh {{user}}@{{host}}',
        'scp {{file}} {{user}}@{{host}}:{{path}}',
        'netstat -an',
        'ifconfig',
        'nslookup {{domain}}',
        'telnet {{host}} {{port}}'
      ],

      // 进程管理
      process: [
        'ps aux',
        'ps aux | grep {{process}}',
        'top',
        'htop',
        'kill {{pid}}',
        'kill -9 {{pid}}',
        'killall {{process}}',
        'nohup {{command}} &',
        'jobs',
        'fg',
        'bg'
      ],

      // 包管理
      package: [
        'npm install',
        'npm install {{package}}',
        'npm install -g {{package}}',
        'npm uninstall {{package}}',
        'npm update',
        'npm run {{script}}',
        'npm test',
        'npm start',
        'yarn install',
        'yarn add {{package}}',
        'pip install {{package}}',
        'pip install -r requirements.txt',
        'apt-get update',
        'apt-get install {{package}}',
        'brew install {{package}}',
        'brew update'
      ],

      // Docker 操作
      docker: [
        'docker ps',
        'docker ps -a',
        'docker images',
        'docker build -t {{image}} .',
        'docker run -d -p {{port}}:{{port}} {{image}}',
        'docker exec -it {{container}} bash',
        'docker logs {{container}}',
        'docker stop {{container}}',
        'docker rm {{container}}',
        'docker rmi {{image}}',
        'docker-compose up -d',
        'docker-compose down',
        'docker-compose logs -f'
      ],

      // Kubernetes 操作
      kubernetes: [
        'kubectl get pods',
        'kubectl get services',
        'kubectl get deployments',
        'kubectl describe pod {{pod}}',
        'kubectl logs {{pod}}',
        'kubectl exec -it {{pod}} -- bash',
        'kubectl apply -f {{file}}',
        'kubectl delete -f {{file}}',
        'kubectl scale deployment {{deployment}} --replicas={{count}}'
      ],

      // 编辑器
      editor: [
        'vim {{file}}',
        'nano {{file}}',
        'code {{file}}',
        'code .'
      ],

      // 系统信息
      system: [
        'uname -a',
        'uptime',
        'free -h',
        'date',
        'whoami',
        'hostname',
        'history',
        'clear',
        'exit'
      ]
    }

    // 变量替换数据
    this.variables = {
      dir: ['src', 'dist', 'node_modules', 'config', 'logs', '/var/log', '/etc', '/tmp', 'project', 'app'],
      file: ['index.js', 'app.js', 'config.json', 'package.json', 'README.md', 'docker-compose.yml', '.env', 'server.log'],
      file1: ['old.txt', 'temp.js', 'backup.sql'],
      file2: ['new.txt', 'main.js', 'restore.sql'],
      pattern: ['error', 'TODO', '*.js', '*.log', 'function', 'import'],
      commit_message: ['fix bug', 'add feature', 'update docs', 'refactor code', 'optimize performance', 'fix typo'],
      branch: ['main', 'develop', 'feature/new-ui', 'hotfix/critical-bug', 'release/v1.0'],
      tag: ['v1.0.0', 'v1.1.0', 'release-2024'],
      repo: ['https://github.com/user/repo.git', 'git@github.com:user/project.git'],
      user: ['root', 'admin', 'developer', 'www-data'],
      host: ['localhost', '192.168.1.100', 'server.example.com', 'api.example.com'],
      url: ['http://localhost:3000', 'https://api.example.com/data', 'https://github.com'],
      data: ['{"key": "value"}', 'username=test&password=secret'],
      domain: ['example.com', 'api.example.com', 'google.com'],
      port: ['80', '443', '3000', '8080', '5432', '27017'],
      pid: ['1234', '5678', '9012'],
      process: ['node', 'nginx', 'postgres', 'redis'],
      command: ['npm start', 'python app.py', './script.sh'],
      package: ['express', 'react', 'lodash', 'axios', 'jest', 'eslint'],
      script: ['start', 'test', 'build', 'dev'],
      image: ['nginx:latest', 'node:18', 'postgres:14', 'myapp:v1'],
      container: ['web-1', 'db-1', 'redis-1', 'app-container'],
      pod: ['nginx-7d8b49557c-abcde', 'backend-5f6g7h8i9-fghij'],
      deployment: ['web-deployment', 'api-deployment'],
      count: ['3', '5', '10'],
      old: ['oldText', 'foo'],
      new: ['newText', 'bar'],
      path: ['/home/user', '/var/www', '/opt/app']
    }
  }

  /**
   * 生成随机的 Shell 历史记录
   */
  generateHistory(options = {}) {
    const {
      count = 500, // 生成的命令数量
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
      endDate = new Date(), // 现在
      shellType = 'bash' // bash, zsh, fish
    } = options

    const commands = []
    const timeRange = endDate.getTime() - startDate.getTime()

    for (let i = 0; i < count; i++) {
      // 生成时间戳 - 工作时间权重更高
      const timestamp = this.generateTimestamp(startDate.getTime(), timeRange)
      
      // 随机选择命令类别（某些类别出现频率更高）
      const category = this.selectCategory()
      
      // 生成命令
      const command = this.generateCommand(category)

      commands.push({
        command,
        timestamp,
        category,
        shellType
      })
    }

    // 按时间戳排序
    commands.sort((a, b) => a.timestamp - b.timestamp)

    // 转换为对应 shell 格式
    return this.formatForShell(commands, shellType)
  }

  /**
   * 生成时间戳 - 工作时间权重更高
   */
  generateTimestamp(start, range) {
    const timestamp = start + Math.random() * range
    const date = new Date(timestamp)
    const hour = date.getHours()

    // 工作时间 (9-18) 权重更高
    if (hour >= 9 && hour <= 18) {
      // 70% 的命令在工作时间
      if (Math.random() < 0.7) {
        return timestamp
      }
    }

    // 重新生成
    return this.generateTimestamp(start, range)
  }

  /**
   * 选择命令类别（带权重）
   */
  selectCategory() {
    const weights = {
      filesystem: 25,
      git: 20,
      text: 10,
      network: 5,
      process: 10,
      package: 15,
      docker: 8,
      kubernetes: 2,
      editor: 3,
      system: 2
    }

    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0)
    let random = Math.random() * totalWeight

    for (const [category, weight] of Object.entries(weights)) {
      random -= weight
      if (random <= 0) {
        return category
      }
    }

    return 'filesystem' // 默认
  }

  /**
   * 生成单个命令
   */
  generateCommand(category) {
    const templates = this.commandTemplates[category] || this.commandTemplates.filesystem
    const template = templates[Math.floor(Math.random() * templates.length)]

    // 替换变量
    return this.replaceVariables(template)
  }

  /**
   * 替换命令模板中的变量
   */
  replaceVariables(template) {
    let command = template

    // 查找所有 {{variable}} 并替换
    const matches = command.match(/\{\{(\w+)\}\}/g)
    if (matches) {
      matches.forEach((match) => {
        const varName = match.replace(/\{\{|\}\}/g, '')
        if (this.variables[varName]) {
          const values = this.variables[varName]
          const value = values[Math.floor(Math.random() * values.length)]
          command = command.replace(match, value)
        }
      })
    }

    return command
  }

  /**
   * 格式化为对应 shell 的历史格式
   */
  formatForShell(commands, shellType) {
    switch (shellType) {
      case 'bash':
        return this.formatBash(commands)
      case 'zsh':
        return this.formatZsh(commands)
      case 'fish':
        return this.formatFish(commands)
      default:
        return this.formatBash(commands)
    }
  }

  /**
   * Bash 格式：每行一个命令
   */
  formatBash(commands) {
    return commands.map((cmd) => cmd.command).join('\n')
  }

  /**
   * Zsh 格式：: timestamp:0;command
   */
  formatZsh(commands) {
    return commands
      .map((cmd) => {
        const timestamp = Math.floor(cmd.timestamp / 1000)
        return `: ${timestamp}:0;${cmd.command}`
      })
      .join('\n')
  }

  /**
   * Fish 格式：YAML-like
   */
  formatFish(commands) {
    return commands
      .map((cmd) => {
        const timestamp = Math.floor(cmd.timestamp / 1000)
        return `- cmd: ${cmd.command}\n  when: ${timestamp}`
      })
      .join('\n')
  }

  /**
   * 生成命令统计数据（用于 UI 显示）
   */
  generateStats(commands) {
    const stats = {
      total: commands.length,
      categories: {},
      topCommands: {},
      timeDistribution: {}
    }

    commands.forEach((cmd) => {
      // 分类统计
      stats.categories[cmd.category] = (stats.categories[cmd.category] || 0) + 1

      // 命令频率
      const baseCmd = cmd.command.split(' ')[0]
      stats.topCommands[baseCmd] = (stats.topCommands[baseCmd] || 0) + 1

      // 时间分布
      const hour = new Date(cmd.timestamp).getHours()
      stats.timeDistribution[hour] = (stats.timeDistribution[hour] || 0) + 1
    })

    return stats
  }
}

// 导出单例
let instance = null

export function getMockDataGenerator() {
  if (!instance) {
    instance = new MockDataGenerator()
  }
  return instance
}

export default MockDataGenerator
