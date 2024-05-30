import { desktopCapturer, dialog } from 'electron'

/**
 * @description: 用户运行的进程检查
 * @author: YoungYa
 * @adte 2024/5/24
 */
export function checkOtherProcessInfo() {
  desktopCapturer
    .getSources({
      types: ['window', 'screen']
    })
    .then((sources) => {
      console.log(sources)
      const banArray = ['qq', '微信', 'edge', 'chrome', 'poe', 'chat', 'gpt']
      const banInfo = sources
        .map((source) => source.name) //['..qq..','..dev','..wx..','cpp..','..edge..']
        .filter(
          (item) =>
            banArray.filter((ban) => item.toLowerCase().includes(ban.toLowerCase())).length > 0
        )
      if (!banInfo.length) {
        return
      }
      dialog
        .showMessageBox({
          type: 'question',
          title: '禁用应用检查结果',
          message: `请检查以下程序是否在运行中，\n如果未及时关闭将影响你的成绩：\n${banInfo.join('\n')}`,
          buttons: ['这就去关闭']
        })
        .then((r) => console.log(r))
    })
}
