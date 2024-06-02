import { useEffect, useRef } from 'react'
import { getExamURL } from '../../api'
import { Button } from 'antd'

const Home = () => {
  const videoRef = useRef(document.createElement('video'))

  let url = ''
  const handleEnv = () => {
    window.electron.ipcRenderer.send('env-check', url)
  }

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
        handleEnterExam()
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

  const handleGetExamInfo = () => {
    getExamURL().then((response) => {
      url = response.data
      streamInit()
    })
  }

  const handleEnterExam = () => {
    if (!url) {
      return getExamURL().then((response) => {
        window.electron.ipcRenderer.send('enter-exam', response.data)
      })
    }
    window.electron.ipcRenderer.send('enter-exam', url)
  }

  const handleRefresh = () => window.electron.ipcRenderer.send('refresh-exam', url)

  const timerShot = () => {
    return setInterval(() => {
      drawCanvas()
    }, 3000)
  }

  useEffect(() => {
    handleGetExamInfo()
    const timer = timerShot()
    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <>
      <header className="header">
        <h3 style={{ color: 'red', textAlign: 'center' }}>考试监控中·····</h3>
        <Button onClick={handleEnterExam}>进入考试</Button>
        <Button onClick={handleRefresh}>刷新考试</Button>
      </header>
      <video ref={videoRef} style={{ width: '0', height: 0, visibility: 'hidden' }}></video>
    </>
  )
}

export default Home
