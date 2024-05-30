import { Notification } from 'electron'

export const notice = (title, body) =>
  new Promise((ok, fail) => {
    if (!Notification.isSupported()) fail('当前系统不支持通知')
    let ps = typeof title == 'object' ? title : { title, body }
    let n = new Notification(ps)
    n.on('click', ok)
    n.show()
  })
