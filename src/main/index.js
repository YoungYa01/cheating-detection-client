import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { saveImage } from '../utils/download'
import { join } from 'path'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'win32' ? { icon: 'resources/favicon.png' } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  Menu.setApplicationMenu(null)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const createFaceMonitor = () => {
  const listWindow = new BrowserWindow({
    width: 220,
    height: 300,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    resizable: false,
    alwaysOnTop: true,
    transparent: true,
    ...(process.platform === 'win32' ? { icon: 'resources/favicon.png' } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  listWindow.on('ready-to-show', () => {
    listWindow.show()
    listWindow.setPosition(100, 100)
  })
  ipcMain.on('move-face', (event, data) => {
    const { x, y } = data
    listWindow.setPosition(x, y)
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    listWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#/faceMonitor')
  } else {
    listWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => {
    console.log('pong')
    // checkOtherProcessInfo()
  })

  /**
   * 保存屏幕截图
   * @param {*} event
   */
  ipcMain.on('save-canvas-as-screen-image', (event, dataURL) => {
    const base64Data = dataURL?.replace(/^data:image\/png;base64,/, '')
    const dataBuffer = Buffer.from(base64Data, 'base64')
    const filePath = `${__dirname}/../../screenshot/screen/${Date.now()}.png`
    saveImage(dataBuffer, filePath)
  })
  /**
   * 保存摄像头截图
   * @param {*} event
   */
  ipcMain.on('save-canvas-as-portrait-image', (event, dataURL) => {
    const base64Data = dataURL?.replace(/^data:image\/png;base64,/, '')
    const dataBuffer = Buffer.from(base64Data, 'base64')
    const filePath = `${__dirname}/../../screenshot/portrait/${Date.now()}.png`
    saveImage(dataBuffer, filePath)
  })
  /**
   * 创建窗口
   */
  createWindow()
  /**
   * 创建人脸监控窗口
   */
  createFaceMonitor()

  app.on('activate', function () {
    // On macOS, it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
