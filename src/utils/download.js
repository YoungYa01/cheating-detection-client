import fs from 'fs'
export function saveImage(dataBuffer, filePath) {
  fs.writeFile(filePath, dataBuffer, 'binary', (err) => {
    if (err) {
      console.error('Error saving file:', err)
    } else {
      console.log('File saved successfully')
    }
  })
}
