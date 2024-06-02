import { desktopCapturer, dialog } from 'electron'

/**
 * @description: 用户运行的进程检查，传入弹窗的父窗口
 * @param win 父窗口
 * @author: YoungYa
 * @adte 2024/5/24
 * @return {Promise<unknown>}
 */
export function checkOtherProcessInfo(win) {
  return new Promise((resolve, reject) => {
    desktopCapturer
      .getSources({
        types: ['window', 'screen']
      })
      .then((sources) => {
        const banArray = ['qq', '微信', 'edge', 'chrome', 'poe', 'chat', 'gpt']
        const banInfo = sources
          .map((source) => source.name) //['..qq..','..dev','..wx..','cpp..','..edge..']
          .filter(
            (item) =>
              banArray.filter((ban) => item.toLowerCase().includes(ban.toLowerCase())).length > 0
          )
        console.log(banInfo.length)
        if (banInfo.length) {
          console.log('True')
          resolve(
            dialog.showMessageBox(win, {
              type: 'question',
              title: '禁用应用检查结果',
              message: `请检查以下程序是否在运行中，\n如果未及时关闭将影响你的成绩：\n${banInfo.join('\n')}`,
              buttons: ['这就去关闭']
            })
          )
        } else {
          console.log(false)
          reject()
        }
      })
  })
}
