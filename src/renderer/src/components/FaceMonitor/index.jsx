import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import css from './index.module.css'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import Loading from '../Loading'

/**
 * @description: 摄像头监控
 * @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<{}> & React.RefAttributes<unknown>>}
 * @author: YoungYa
 * @adte 2024/5/29
 */
// eslint-disable-next-line react/display-name
const FaceMonitor = forwardRef((props, ref) => {
  const videoRef = useRef(null)
  const [loading, setLoading] = useState(false)
  let isKeyDown = false

  const [isKiock, setIsKiock] = useState(false)

  useImperativeHandle(ref, () => ({
    drawCanvas: drawCanvas
  }))
  /**
   * @description: 绘制canvas获取截图
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
    window.electron.ipcRenderer.send('save-canvas-as-portrait-image', dataURL)
  }

  /**
   * @description: 获取摄像头
   * @author: YoungYa
   * @adte 2024/5/29
   */
  const videoInit = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: 500,
          height: 500
        },
        audio: false
      })
      .then((stream) => {
        setLoading(false)
        if (!videoRef.current) {
          return
        }
        videoRef.current.srcObject = stream
        videoRef.current.play()
        // videoRef.current.onplay = () => {
        //   const canvas = faceapi.createCanvasFromMedia(videoRef.current)
        //   document.querySelector('.face-content').append(canvas)
        //   setCanvas(canvas)
        //   const displaySize = { width: videoRef.current.width, height: videoRef.current.height }
        //   faceapi.matchDimensions(canvas, displaySize)
        //   console.log(canvas)
        //   setInterval(async () => {
        //     const detections = await faceapi
        //       .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        //       .withFaceLandmarks()
        //       .withFaceExpressions()
        //     const resizedDetections = faceapi.resizeResults(detections, displaySize)
        //     canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        //     faceapi.draw.drawDetections(canvas, resizedDetections)
        //     faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        //     faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        //     console.log('1')
        //   }, 100)
        // }
      })
      .catch((err) => {
        console.error('Error accessing media devices.', err)
      })
  }

  const handleMouseDown = (e) => {
    isKeyDown = true
    const dinatesX = e.clientX
    const dinatesY = e.clientY
    if (isKiock) {
      return
    }
    document.onmousemove = (ev) => {
      if (isKeyDown) {
        const x = ev.screenX - dinatesX
        const y = ev.screenY - dinatesY
        window.electron.ipcRenderer.send('move-face', { x, y })
      }
    }
    document.onmouseup = () => {
      isKeyDown = false
      document.onmousemove = null
    }
  }

  useEffect(() => {
    setLoading(true)
    // Promise.all([
    //   faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    //   faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    //   faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    //   faceapi.nets.faceExpressionNet.loadFromUri('./models')
    // ]).then(videoInit())
    videoInit()
  }, [])

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className={css['face-content']}>
          <Button
            icon={isKiock ? <UnlockOutlined /> : <LockOutlined />}
            type={'text'}
            color={'lightskyblue'}
            className={css.lock}
            onClick={() => setIsKiock(!isKiock)}
          ></Button>
          <video ref={videoRef} className={css.faceMonitor} onMouseDown={handleMouseDown}></video>
        </div>
      )}
    </div>
  )
})
export default FaceMonitor
