import { useEffect, useRef, useState } from 'react'
import css from './index.module.css'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import Loading from '../Loading'
import { MOVE_FACE, SAVE_CANVAS_AS_PORTRAIT_IMAGE } from '../../../../utils/StaticMessage'
import * as faceapi from 'face-api.js'

/**
 * @description: 摄像头监控
 * @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<{}> & React.RefAttributes<unknown>>}
 * @author: YoungYa
 * @adte 2024/5/29
 */
const FaceMonitor = () => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [loading, setLoading] = useState(false)
  let isKeyDown = false

  const [isKiock, setIsKiock] = useState(false)

  let timeout = null
  let options = null
  let modalLoaded = false
  /**初始化模型加载 */
  async function fnLoadModel() {
    if (!modalLoaded) {
      modalLoaded = true
      return
    }
    // 模型文件访问路径
    const modelsPath = `/models`
    // 面部轮廓模型
    await faceapi.nets.faceLandmark68Net.loadFromUri(modelsPath)
    // 面部表情模型
    await faceapi.nets.faceExpressionNet.loadFromUri(modelsPath)
    // 年龄性别模型
    await faceapi.nets.ageGenderNet.loadFromUri(modelsPath)
    // 模型参数-tinyFaceDetector
    await faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath)
    options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 416, // 160 224 320 416 512 608
      scoreThreshold: 0.5 // 0 ~ 1
    })

    // 输出库版本
    console.log(
      `FaceAPI Version: ${faceapi?.version || '(not loaded)'} \nTensorFlow/JS Version: ${
        faceapi.tf?.version_core || '(not loaded)'
      } \nBackend: ${
        faceapi.tf?.getBackend() || '(not loaded)'
      } \nModels loaded: ${faceapi.tf.engine().state.numTensors} tensors`
    )
  }
  /**根据模型参数识别绘制 */
  async function fnRedraw() {
    if (!videoRef.current || !canvasRef.current) return

    // 暂停视频时清除定时
    if (videoRef.current.paused) {
      clearTimeout(timeout)
      timeout = 0
      return
    }

    // 识别绘制人脸信息
    if (!videoRef.current) {
      console.log('video is null')
      return
    }
    const detect = await faceapi
      .detectAllFaces(videoRef.current, options)
      // 需引入面部轮廓模型
      .withFaceLandmarks()
      // 需引入面部表情模型
      .withFaceExpressions()
      // 需引入年龄性别模型
      .withAgeAndGender()

    // 无识别数据时，清除定时重新再次识别
    if (!detect) {
      clearTimeout(timeout)
      timeout = 0
      fnRedraw()
      return
    }

    // 匹配元素大小
    const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true)
    const result = faceapi.resizeResults(detect, dims)

    // 面框分值
    faceapi.draw.drawDetections(canvasRef.current, result)
    // 面部轮廓
    // 需引入面部轮廓模型
    faceapi.draw.drawFaceLandmarks(canvasRef.current, result)
    // 面部表情
    // 需引入面部表情模型
    faceapi.draw.drawFaceExpressions(canvasRef.current, result, 0.05)
    // 年龄性别
    // 需引入年龄性别模型模型
    const drawItem = (item) => {
      const { age, gender, genderProbability } = item
      new faceapi.draw.DrawTextField(
        [`${Math.round(age)} Age`, `${gender} (${Math.round(genderProbability)})`],
        item.detection.box.topRight
      ).draw(canvasRef.current)
    }
    // 多结果
    if (Array.isArray(result)) {
      result.forEach((item) => drawItem(item))
    } else {
      drawItem(result)
    }

    // 定时器句柄
    timeout = setTimeout(() => fnRedraw(), 0)
  }
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
    window.electron.ipcRenderer.send(SAVE_CANVAS_AS_PORTRAIT_IMAGE, dataURL)
  }

  /**
   * @description: 获取摄像头
   * @author: YoungYa
   * @adte 2024/5/29
   */
  const videoInit = () => {
    console.log('videoInit')
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
        // handleTimeInterval()
        setTimeout(() => fnRedraw(), 300)
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
        window.electron.ipcRenderer.send(MOVE_FACE, { x, y })
      }
    }
    document.onmouseup = () => {
      isKeyDown = false
      document.onmousemove = null
    }
  }

  // eslint-disable-next-line no-unused-vars
  const handleTimeInterval = () => {
    setInterval(() => {
      drawCanvas()
    }, 2000)
  }

  useEffect(() => {
    setLoading(true)
    fnLoadModel().then(() => videoInit())

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div onMouseDown={handleMouseDown}>
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
          <video ref={videoRef} className={css.faceMonitor}></video>
          <canvas className={css.faceMonitor} ref={canvasRef}></canvas>
        </div>
      )}
    </div>
  )
}
export default FaceMonitor
