const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

// 需要压缩的图片列表（超过一定大小的图片）
const imagesToCompress = [
  { name: 'app-logo.png', resize: 0.4 }, // 153KB -> 大幅压缩
  { name: 'loading-bg.png', resize: 0.6 },
  { name: 'mine-bg.png', resize: 0.6 },
  { name: 'bg.png', resize: 0.7 },
  { name: 'Frame 1000005681.png', resize: 0.7 },
  { name: 'Frame 1000005680.png', resize: 0.7 },
  { name: 'Frame 1000005679.png', resize: 0.7 },
  { name: 'Frame 1000005679-1.png', resize: 0.7 },
  { name: 'ziran.png', resize: 0.7 },
  { name: 'Frame 1000005681-1.png', resize: 0.7 },
  { name: 'Frame 1000005678.png', resize: 0.7 },
  { name: 'a.png', resize: 0.7 },
  { name: 'loading-icon.png', resize: 0.7 },
  { name: 'Frame 1000005680-1.png', resize: 0.7 }
]

const imgDir = path.join(__dirname, '../src/pkg/assets/img')

async function compressImages() {
  for (const imageConfig of imagesToCompress) {
    const imageName = imageConfig.name
    const resizeRatio = imageConfig.resize
    const imagePath = path.join(imgDir, imageName)

    if (!fs.existsSync(imagePath)) {
      console.log(`跳过不存在的文件: ${imageName}`)
      continue
    }

    try {
      const originalStats = fs.statSync(imagePath)
      const originalSizeKB = (originalStats.size / 1024).toFixed(2)
      console.log(`\n处理: ${imageName}`)
      console.log(`原始文件大小: ${originalSizeKB} KB`)

      const image = sharp(imagePath)
      const metadata = await image.metadata()
      console.log(`图片尺寸: ${metadata.width}x${metadata.height}`)

      // 根据配置的比例缩小尺寸
      const resizeWidth = Math.round(metadata.width * resizeRatio)
      const resizeHeight = Math.round(metadata.height * resizeRatio)

      await image
        .resize(resizeWidth, resizeHeight, {
          fit: 'cover'
        })
        .png({
          compressionLevel: 9,
          quality: 75,
          palette: true,
          colors: 128
        })
        .toFile(imagePath + '.tmp')

      fs.unlinkSync(imagePath)
      fs.renameSync(imagePath + '.tmp', imagePath)

      const compressedStats = fs.statSync(imagePath)
      const compressedSizeKB = (compressedStats.size / 1024).toFixed(2)
      const compressionRate = (
        (1 - compressedStats.size / originalStats.size) *
        100
      ).toFixed(2)

      console.log(`压缩后文件大小: ${compressedSizeKB} KB`)
      console.log(`新尺寸: ${resizeWidth}x${resizeHeight}`)
      console.log(`压缩率: ${compressionRate}%`)
    } catch (error) {
      console.error(`压缩 ${imageName} 失败:`, error.message)
    }
  }

  console.log('\n所有图片压缩完成!')
}

compressImages()
