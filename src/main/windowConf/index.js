import { join } from 'path'

export const MainWindowConf = {
  width: 300,
  height: 100,
  show: false,
  resizable: false,
  autoHideMenuBar: true,
  alwaysOnTop: true,
  ...(process.platform === 'win32' ? { icon: 'resources/favicon.png' } : {}),
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
    sandbox: false
  }
}

export const FaceWindowConf = {
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
}

export const ExamWindowConf = {
  width: 900,
  height: 670,
  show: false,
  autoHideMenuBar: true,
  ...(process.platform === 'win32' ? { icon: 'resources/favicon.png' } : {}),
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
    sandbox: false
  }
}
