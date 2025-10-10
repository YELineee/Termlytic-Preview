/**
 * Window management module for Electron application
 */

import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

/**
 * Window manager class
 */
export class WindowManager {
  constructor() {
    this.mainWindow = null
    this.windowConfig = this.getDefaultWindowConfig()
    console.log('WindowManager initialized')
  }

  /**
   * Get default window configuration
   */
  getDefaultWindowConfig() {
    return {
      width: 1400,
      height: 900,
      minWidth: 1024,
      minHeight: 700,
      show: false,
      autoHideMenuBar: true,
      transparent: false,
      titleBarStyle: 'hiddenInset',
      vibrancy: 'dark',
      visualEffectState: 'active',
      resizable: true,
      minimizable: true,
      maximizable: true,
      closable: true,
      icon: this.getPlatformIcon(),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        webSecurity: true,
        devTools: true
      }
    }
  }

  /**
   * Get platform-specific icon path
   */
  getPlatformIcon() {
    try {
      if (process.platform === 'linux') {
        const iconPath = '../../resources/icon.png'
        return iconPath
      }
      return undefined
    } catch (err) {
      console.warn('Failed to load application icon:', err)
      return undefined
    }
  }

  /**
   * Create main window
   */
  createMainWindow() {
    console.log('Creating main window...')

    this.mainWindow = new BrowserWindow(this.windowConfig)
    this.setupWindowEventHandlers()
    this.loadWindowContent()

    console.log('Main window created successfully')
    return this.mainWindow
  }

  /**
   * Setup window event handlers
   */
  setupWindowEventHandlers() {
    if (!this.mainWindow) return

    this.mainWindow.on('ready-to-show', () => {
      console.log('Window ready to show')
      this.mainWindow.show()

      if (is.dev) {
        this.mainWindow.webContents.openDevTools()
      }
    })

    this.mainWindow.on('closed', () => {
      console.log('Main window closed')
      this.mainWindow = null
    })

    this.mainWindow.on('minimize', () => {
      console.log('Window minimized')
    })

    this.mainWindow.on('restore', () => {
      console.log('Window restored')
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      console.log(`Opening external URL: ${details.url}`)
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('Page loaded successfully')
    })

    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error(`Page load failed: ${errorCode} - ${errorDescription}`)
    })

    this.mainWindow.webContents.on('render-process-gone', (event, details) => {
      console.error('Render process gone:', details)
    })

    this.mainWindow.webContents.on('unresponsive', () => {
      console.warn('Window became unresponsive')
    })

    this.mainWindow.webContents.on('responsive', () => {
      console.log('Window became responsive again')
    })
  }

  /**
   * Load window content
   */
  loadWindowContent() {
    if (!this.mainWindow) return

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      console.log(`Loading development URL: ${process.env['ELECTRON_RENDERER_URL']}`)
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      const indexPath = join(__dirname, '../renderer/index.html')
      console.log(`Loading production file: ${indexPath}`)
      this.mainWindow.loadFile(indexPath)
    }
  }

  getMainWindow() {
    return this.mainWindow
  }

  hasMainWindow() {
    return this.mainWindow !== null && !this.mainWindow.isDestroyed()
  }

  focusMainWindow() {
    if (this.hasMainWindow()) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore()
      }
      this.mainWindow.focus()
      console.log('Main window focused')
    }
  }

  minimizeMainWindow() {
    if (this.hasMainWindow()) {
      this.mainWindow.minimize()
      console.log('Main window minimized')
    }
  }

  toggleMaximizeMainWindow() {
    if (this.hasMainWindow()) {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.unmaximize()
        console.log('Main window unmaximized')
      } else {
        this.mainWindow.maximize()
        console.log('Main window maximized')
      }
    }
  }

  closeMainWindow() {
    if (this.hasMainWindow()) {
      this.mainWindow.close()
      console.log('Main window close requested')
    }
  }

  reloadMainWindow() {
    if (this.hasMainWindow()) {
      this.mainWindow.reload()
      console.log('Main window reloaded')
    }
  }

  openDevTools() {
    if (this.hasMainWindow()) {
      this.mainWindow.webContents.openDevTools()
      console.log('Developer tools opened')
    }
  }

  closeDevTools() {
    if (this.hasMainWindow()) {
      this.mainWindow.webContents.closeDevTools()
      console.log('Developer tools closed')
    }
  }

  updateWindowConfig(newConfig) {
    this.windowConfig = {
      ...this.windowConfig,
      ...newConfig
    }
    console.log('Window configuration updated')
  }

  getWindowState() {
    if (!this.hasMainWindow()) {
      return null
    }

    const bounds = this.mainWindow.getBounds()

    return {
      bounds,
      isMaximized: this.mainWindow.isMaximized(),
      isMinimized: this.mainWindow.isMinimized(),
      isFullScreen: this.mainWindow.isFullScreen(),
      isFocused: this.mainWindow.isFocused(),
      isVisible: this.mainWindow.isVisible(),
      isDestroyed: this.mainWindow.isDestroyed()
    }
  }

  cleanup() {
    if (this.hasMainWindow()) {
      this.mainWindow.removeAllListeners()
      this.mainWindow = null
    }
    console.log('WindowManager cleanup completed')
  }
}
