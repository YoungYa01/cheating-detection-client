import { useEffect, useRef } from 'react'
import { Button } from 'antd'

const Home = () => {
  const ipcHandle = () => {
    window.electron.ipcRenderer.send('ping')
  }

  const videoRef = useRef(document.createElement('video'))

  /**
   * @description: 获取屏幕截图
   * @author: YoungYa
   * @adte 2024/5/29
   */
  const streamInit = () => {
    navigator.mediaDevices
      .getUserMedia({
        //
        // audio: {
        //   mandatory: {
        //     chromeMediaSource: 'desktop'
        //   }
        // },
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop'
          }
        }
      })
      .then((stream) => {
        if (!videoRef.current) {
          return
        }
        videoRef.current.srcObject = stream
        videoRef.current.play()
      })
      .catch((err) => {
        console.error('Error accessing media devices.', err)
      })
  }
  /**
   * @description: 截图
   * @author: YoungYa
   * @adte 2024/5/29
   */
  const drawCanvas = () => {
    if (!videoRef.current) {
      return
    }
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    const dataURL = canvas.toDataURL('image/png')
    window.electron.ipcRenderer.send('save-canvas-as-screen-image', dataURL)
  }

  const handleClick = () => drawCanvas()

  const handleFaceShot = () => {
    console.log(window.electron)
  }

  useEffect(() => streamInit(), [])

  return (
    <main>
      <header className="header">
        <h1>考试监控中·····</h1>
      </header>
      <video ref={videoRef} style={{ width: '100%' }}></video>
      <div className="actions">
        <Button onClick={ipcHandle}>Ping</Button>
        <Button onClick={handleClick}>Screen IPC</Button>
        <Button onClick={handleFaceShot}>Face IPC</Button>
      </div>
      {/*<FaceMonitor ref={faceMonitorRef} />*/}
    </main>
  )
}

export default Home
