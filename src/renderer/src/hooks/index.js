import { useState } from 'react'

export const useDrawCanvas = (videoRef) => {
  if (!videoRef.current) {
    return
  }
  const [dataURL, setDataURL] = useState('')
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = videoRef.current.videoWidth
  canvas.height = videoRef.current.videoHeight
  ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
  setDataURL(canvas.toDataURL('image/png'))
  return dataURL
}
