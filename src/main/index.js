/**
 * Electron main process entry file
 * 
 * Handles application lifecycle, window management, and module initialization
 */

import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { WindowManager } from './modules/windowManager.js'
import { initializeIPCHandlers, cleanupIPCHandlers } from './modules/ipcHandlers.js'

/**
 * Main application class managing the entire application lifecycle
 */
class TermlyticApp {
  constructor() {
    this.windowManager = null
    this.ipcHandlers = null
    this.isReady = false

    console.log('Termlytic Application initializing...')
    this.setupAppEventHandlers()
  }

  /**
   * Setup application event handlers
   */
  setupAppEventHandlers() {
    // App ready event
    app.whenReady().then(() => {
      this.onAppReady()
    })

    // App activation event (macOS)
    app.on('activate', () => {
      this.onAppActivate()
    })

    // All windows closed event
    app.on('window-all-closed', () => {
      this.onAllWindowsClosed()
    })

    // App before quit event
    app.on('before-quit', (event) => {
      this.onBeforeQuit(event)
    })

    // App will quit event
    app.on('will-quit', (event) => {
      this.onWillQuit(event)
    })
  }

  /**
   * Handle app ready event
   */
  async onAppReady() {
    try {
      console.log('Application ready, initializing components...')

      // Set app user model ID (Windows)
      electronApp.setAppUserModelId('com.termlytic.app')

      // Setup development tools and shortcuts
      this.setupDevelopmentFeatures()

      // Initialize IPC handlers
      this.ipcHandlers = initializeIPCHandlers()

      // Initialize window manager
      this.windowManager = new WindowManager()

      // Create main window
      this.windowManager.createMainWindow()

      this.isReady = true
      console.log('Application initialization completed')
    } catch (err) {
      console.error('Failed to initialize application:', err)
      app.quit()
    }
  }

  /**
   * Setup development environment features
   */
  setupDevelopmentFeatures() {
    // Watch window shortcuts for development tools
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    console.log('Development features initialized')
  }

  /**
   * Handle app activation (macOS specific)
   */
  onAppActivate() {
    console.log('Application activated')

    // On macOS, recreate window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      if (this.windowManager) {
        this.windowManager.createMainWindow()
      }
    } else if (this.windowManager && this.windowManager.hasMainWindow()) {
      this.windowManager.focusMainWindow()
    }
  }

  /**
   * Handle all windows closed event
   */
  onAllWindowsClosed() {
    console.log('All windows closed')

    // Quit app on non-macOS platforms when all windows are closed
    if (process.platform !== 'darwin') {
      console.log('Quitting application (non-macOS platform)')
      app.quit()
    }
  }

  /**
   * Handle before quit event
   */
  /**
   * Handle before quit event
   */
  onBeforeQuit(event) {
    console.log('Application preparing to quit...')
    this.cleanup()
  }

  /**
   * Handle will quit event
   */
  onWillQuit(event) {
    console.log('Application will quit')
  }

  /**
   * Clean up application resources
   */
  cleanup() {
    console.log('Cleaning up application resources...')

    try {
      // Clean up IPC handlers
      if (this.ipcHandlers) {
        cleanupIPCHandlers()
        this.ipcHandlers = null
      }

      // Clean up window manager
      if (this.windowManager) {
        this.windowManager.cleanup()
        this.windowManager = null
      }

      console.log('Application cleanup completed')
    } catch (err) {
      console.error('Error during application cleanup:', err)
    }
  }

  /**
   * Get application state information
   */
  getAppState() {
    return {
      isReady: this.isReady,
      hasWindowManager: !!this.windowManager,
      hasIPCHandlers: !!this.ipcHandlers,
      windowCount: BrowserWindow.getAllWindows().length,
      platform: process.platform,
      version: app.getVersion()
    }
  }
}

// Create application instance
const termlyticApp = new TermlyticApp()

// Export application instance
export default termlyticApp

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  app.quit()
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  app.quit()
})

console.log('Main process started, waiting for app ready event...')
