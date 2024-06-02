import { BrowserWindow } from 'electron'

/**
 * 关闭所有窗口，除了mainWindow
 * @param mainWindow
 */
export const closeAllWindows = (mainWindow) => {
  const allWindows = BrowserWindow.getAllWindows()

  // 遍历所有窗口并关闭它们
  allWindows.forEach((window) => {
    if (window !== mainWindow) {
      window.close()
    }
  })
}
