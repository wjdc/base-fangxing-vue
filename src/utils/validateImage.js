import { constant } from '@riophae/vue-treeselect/src/utils'

const JPEG_SOI = [0xFF, 0xD8]
const JPEG_EOI = [0xFF, 0xD9]

// png的文件头就是png图片的前8个字节，其值为[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
const PNG_HEADER = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]

// GIF files start with a fixed-length header ("GIF87a" or "GIF89a") giving the version
const GIF89A_HEADER = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]
const GIF87A_HEADER = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]

// png的文件头前两个字节固定，表示BM
const BMP_HEADER = [0x42, 0x4D]

// 是否小端序
const isLittleEndian = (function() {
  var buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(0, 256, true)
  return new Int16Array(buffer)[0] === 256
})

// byte数组元素是否相等
function isArrayEqual(a, b){
  for(let i=0; i<a.length; i++){
    if(a[i] !== b[i]){
      return false
    }
  }
  return true
}

export function getImageTypeByHeadContent(file){
  // file 实际上是一个 Blob 对象
  // 读取 Blob 对象的前8个字节
  const fileHeader = file.slice(0, 8)
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = function(e){
      const data = e.target.result
      const header = new DataView(data)
      let bytesArr = []
      for(let i=0; i<header.byteLength; i++){
        bytesArr.push(header.getUint8(i, isLittleEndian))
      }
      if(isArrayEqual(JPEG_SOI, bytesArr.slice(0,2))){
        resolve('jpg')
      }else if(isArrayEqual(PNG_HEADER, bytesArr)){
        resolve('png')
      }else if(isArrayEqual(GIF89A_HEADER, bytesArr.slice(0,6)) ||
        isArrayEqual(GIF87A_HEADER, bytesArr.slice(0,6))
      ){
        resolve('gif')
      }else if(isArrayEqual(BMP_HEADER, bytesArr.slice(0,2))){
        resolve('png')
      }else{
        reject()
      }
    }
    reader.readAsArrayBuffer(fileHeader)
  })
}
