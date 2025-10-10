/**
 * Shell history record parser module
 * Responsible for parsing different Shell history record formats
 *
 * Supported Shell:
 * - ZSH: Supports extended history format (: timestamp:duration;command)
 * - Fish: Supports timestamped format (- cmd: command \n  when: timestamp)
 * - Bash: Basic format (commands only, no timestamps)
 */

/**
 * Parse ZSH extended history format
 * Format: : 1691715472:0;git status
 * @param {string} line - Single line history record
 * @returns {Object|null} Parse result contains timestamp, duration, command
 */
export function parseZshEntry(line) {
  // Match extended history format: : timestamp:duration;command
  const extendedMatch = line.match(/^: (\d+):(\d+);(.*)$/)

  if (extendedMatch) {
    const timestamp = parseInt(extendedMatch[1])
    const date = new Date(timestamp * 1000) // Convert Unix timestamp to Date

    return {
      timestamp: date,
      duration: parseInt(extendedMatch[2]), // Command execution duration (seconds)
      command: extendedMatch[3].trim()
    }
  }

  // Normal format, no timestamp
  return {
    timestamp: null,
    duration: 0,
    command: line.trim()
  }
}

/**
 * Parse Fish history format
 * Fish format is usually:
 * - cmd: git status
 *   when: 1691715472
 * @param {string} line - Current line
 * @returns {Object|null} Parse result, return null if not a command line
 */
export function parseFishEntry(line) {
  if (line.startsWith('- cmd: ')) {
    return {
      command: line.substring(7).trim(), // Remove "- cmd: " prefix
      timestamp: null // Timestamp needs to be read from the next line
    }
  }
  return null
}

/**
 * Parse Bash history format
 * Bash by default only stores commands, no timestamps
 * @param {string} line - Single line history record
 * @returns {Object} Object containing command information
 */
export function parseBashEntry(line) {
  return {
    timestamp: null,
    duration: 0,
    command: line.trim()
  }
}

/**
 * Extract main command information
 * Break down command into main command, sub-command, and arguments
 * @param {string} command - Complete command string
 * @returns {Object|null} Command information object
 */
export function extractCommandInfo(command) {
  const parts = command.split(/\s+/).filter(Boolean)

  if (parts.length === 0) return null

  const mainCommand = parts[0] // Main command (e.g. git, npm, ls)
  const subCommand = parts[1] || '' // Sub-command (e.g. commit, install)

  return {
    main: mainCommand, // Main command
    sub: subCommand, // Sub-command
    full: command, // Complete command
    args: parts.slice(1) // All arguments
  }
}

/**
 * Parse history entries according to Shell type
 * @param {string} shell - Shell type ('zsh', 'fish', 'bash')
 * @param {string} line - History line
 * @param {Array} lines - All lines (used for Fish format timestamp reading)
 * @param {number} index - Current line index
 * @returns {Object} Object containing parse result and next index
 */
export function parseShellEntry(shell, line, lines = [], index = 0) {
  let entry = null
  let nextIndex = index

  switch (shell) {
    case 'zsh':
      entry = parseZshEntry(line)
      break

    case 'fish':
      entry = parseFishEntry(line)
      // Fish format needs to check next line for timestamp
      if (entry && index + 1 < lines.length && lines[index + 1].startsWith('  when: ')) {
        entry.timestamp = new Date(parseInt(lines[index + 1].substring(8)) * 1000)
        nextIndex = index + 1 // Skip timestamp line
      }
      break

    case 'bash':
    default:
      entry = parseBashEntry(line)
      break
  }

  // Extract command information
  if (entry && entry.command) {
    const commandInfo = extractCommandInfo(entry.command)
    if (commandInfo) {
      entry.commandInfo = commandInfo
      entry.shell = shell
    }
  }

  return {
    entry,
    nextIndex
  }
}
