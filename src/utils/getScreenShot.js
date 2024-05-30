export function getScreens() {
  getInitStream()
}

async function getInitStream() {
  // 获取指定窗口的媒体流
  console.log(navigator)
  if (!navigator) {
    return
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  })
  const video = document.querySelector('#preview')
  video.srcObject = stream
}

// function getSdkStream(stream) {
//   this.shareStream = TRTC.createStream({
//     audioSource: stream.getAudioTracks()[0],
//     videoSource: stream.getVideoTracks()[0]
//   })
// }
