import { app, shell, BrowserWindow, ipcMain, Menu, screen } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { saveImage } from '../utils/download'
import { join } from 'path'
import { closeAllWindows } from './utils'
import { ExamWindowConf, FaceWindowConf, MainWindowConf } from './windowConf'
import { checkOtherProcessInfo } from '../utils/processCheck'
import {
  ENTER_EXAM,
  ENV_CHECK,
  MOVE_FACE,
  REFRESH_EXAM,
  SAVE_CANVAS_AS_PORTRAIT_IMAGE,
  SAVE_CANVAS_AS_SCREEN_IMAGE
} from '../utils/StaticMessage'

let faceWindow = null

let examWindow = null

/**
 * @description: 创建主窗口->监控窗口
 * @author: YoungYa
 * @adte 2024/6/2
 */
function createWindow(conf = {}) {
  // 窗口配置
  const winConf = {
    ...MainWindowConf,
    ...conf
  }
  // 创建主窗口
  const mainWindow = new BrowserWindow(winConf)
  // 关闭默认菜单
  Menu.setApplicationMenu(null)
  // 显示窗体
  mainWindow.on('ready-to-show', () => {
    const { width } = screen.getPrimaryDisplay().workAreaSize
    mainWindow.setPosition(width / 2 - winConf.width / 2, 0)
    mainWindow.show()
  })
  // 加载监控页面
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  // 主窗体关闭时关闭其他窗口
  mainWindow.on('closed', () => {
    closeAllWindows(mainWindow)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  let envCheckState = false

  function checkEnv() {
    if (envCheckState) {
      return
    }
    envCheckState = true
    checkOtherProcessInfo(examWindow)
      .then(() => {
        envCheckState = false
        checkEnv()
      })
      .catch(() => {
        envCheckState = false
      })
  }

  ipcMain.on(ENV_CHECK, () => {
    checkEnv()
  })
  // 重新唤醒进入考试
  ipcMain.on(ENTER_EXAM, (_, examURL) => {
    if (examWindow === null) {
      examWindow = createExamWindow("http://222.196.35.228:8081/patest/html/login.html")
      examWindow.loadURL("http://222.196.35.228:8081/patest/html/login.html")
    }
    checkEnv()
  })
  ipcMain.on(REFRESH_EXAM, () => {
    examWindow?.webContents.reload()
  })
}

/**
 * @description: 创建监控窗口
 * @author: YoungYa
 * @adte 2024/6/2
 */
const createFaceMonitorWindow = (conf = {}) => {
  const winConf = {
    ...FaceWindowConf,
    ...conf
  }
  faceWindow = new BrowserWindow(winConf)
  faceWindow.on('ready-to-show', () => {
    const { width } = screen.getPrimaryDisplay().workAreaSize
    faceWindow.show()
    faceWindow.setPosition(width - winConf.width - 100, 100)
  })
  ipcMain.on(MOVE_FACE, (event, data) => {
    const { x, y } = data
    faceWindow.setPosition(x, y)
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    faceWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#/faceMonitor')
  } else {
    faceWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
/**
 * @description: 创建考试窗口
 * @author: YoungYa
 * @adte 2024/6/2
 */
const createExamWindow = () => {
  examWindow = new BrowserWindow(ExamWindowConf)
  examWindow.on('ready-to-show', () => {
    examWindow.show()
  })
  examWindow.on('close', () => {
    examWindow = null
  })
  return examWindow
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  /**
   * 保存屏幕截图
   * @param {*} event
   */
  ipcMain.on(SAVE_CANVAS_AS_SCREEN_IMAGE, (event, dataURL) => {
    const base64Data = dataURL?.replace(/^data:image\/png;base64,/, '')
    const dataBuffer = Buffer.from(base64Data, 'base64')
    const filePath = `${__dirname}/../../screenshot/screen/${Date.now()}.png`
    saveImage(dataBuffer, filePath)
  })
  /**
   * 保存摄像头截图
   * @param {*} event
   */
  ipcMain.on(SAVE_CANVAS_AS_PORTRAIT_IMAGE, (event, dataURL) => {
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
  createFaceMonitorWindow()

  app.on('activate', function () {
    // On macOS, it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
