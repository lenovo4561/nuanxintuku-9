const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

// 需要压缩的logo文件
const logoConfigs = [
  { path: path.join(__dirname, '../src/pkg/assets/img/logo.png') },
  { path: path.join(__dirname, '../src/pkg/assets/img/logo-1.png') },
  { path: path.join(__dirname, '../src/assets/images/logo.png') } // 这个是base包里的
]

async function compressLogos() {
  for (const logoConfig of logoConfigs) {
    const logoPath = logoConfig.path

    if (!fs.existsSync(logoPath)) {
      console.log(`跳过不存在的文件: ${logoPath}`)
      continue
    }

    try {
      const logoFile = path.basename(logoPath)
      const outputPath = logoPath
      const backupPath = logoPath.replace('.png', '_backup.png')

      // 获取原始文件大小
      const originalStats = fs.statSync(logoPath)
      console.log(`\n处理: ${logoPath}`)
      console.log(`原始文件大小: ${(originalStats.size / 1024).toFixed(2)} KB`)

      // 备份原始文件（如果备份不存在）
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(logoPath, backupPath)
        console.log('已备份原始文件')
      }

      // 读取原始备份文件
      const image = sharp(backupPath)
      const metadata = await image.metadata()

      console.log(`图片尺寸: ${metadata.width}x${metadata.height}`)

      // 快应用图标推荐尺寸为 192x192
      const targetSize = 192

      await sharp(backupPath)
        .resize(targetSize, targetSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({
          compressionLevel: 9,
          quality: 80,
          palette: true,
          colors: 128
        })
        .toFile(outputPath + '.tmp')

      // 替换原文件
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath)
      }
      fs.renameSync(outputPath + '.tmp', outputPath)

      // 获取压缩后文件大小
      const compressedStats = fs.statSync(outputPath)
      console.log(
        `压缩后文件大小: ${(compressedStats.size / 1024).toFixed(2)} KB`
      )
      console.log(`新尺寸: ${targetSize}x${targetSize}`)
      console.log(
        `压缩率: ${(
          (1 - compressedStats.size / originalStats.size) *
          100
        ).toFixed(2)}%`
      )
    } catch (error) {
      console.error(`压缩 ${logoFile} 失败:`, error.message)
    }
  }

  console.log('\nLogo压缩完成!')
}

compressLogos()
