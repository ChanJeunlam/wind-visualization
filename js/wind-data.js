// 风场数据结构
const windData = {
  nx: 360, // 经度点数
  ny: 181, // 纬度点数
  max: 28.700000762939453, // 最大风速
  data: generateWindData(360, 181),
}

// 生成更复杂的风场数据
function generateWindData(nx, ny) {
  const data = []

  // 创建多个风场模式
  const patterns = [
    {
      // 主螺旋
      centerX: nx / 2,
      centerY: ny / 2,
      strength: 12,
      radius: nx / 4,
      rotationFactor: 25,
      weight: 1.0,
    },
    {
      // 次级涡流1
      centerX: nx / 2 - nx / 5,
      centerY: ny / 2 + ny / 6,
      strength: 6,
      radius: nx / 8,
      rotationFactor: 15,
      weight: 0.7,
    },
    {
      // 次级涡流2
      centerX: nx / 2 + nx / 4,
      centerY: ny / 2 - ny / 5,
      strength: 5,
      radius: nx / 10,
      rotationFactor: 20,
      weight: 0.6,
    },
  ]

  // 添加背景流动
  const backgroundFlow = {
    angle: Math.PI / 6, // 30度角的背景风向
    strength: 2,
  }

  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      let totalX = 0
      let totalY = 0

      // 添加背景风场
      totalX += Math.cos(backgroundFlow.angle) * backgroundFlow.strength
      totalY += Math.sin(backgroundFlow.angle) * backgroundFlow.strength

      // 添加各个风场模式的影响
      for (const pattern of patterns) {
        const dx = x - pattern.centerX
        const dy = y - pattern.centerY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // 计算风场强度衰减因子
        const falloff = Math.max(0, 1 - distance / pattern.radius)

        if (falloff > 0) {
          // 计算旋转角度
          const baseAngle = Math.atan2(dy, dx)
          const rotationAngle = baseAngle + distance / pattern.rotationFactor

          // 计算风向分量
          const windStrength = pattern.strength * falloff * falloff * pattern.weight
          const windX = Math.cos(rotationAngle) * windStrength
          const windY = Math.sin(rotationAngle) * windStrength

          totalX += windX
          totalY += windY
        }
      }

      // 添加一些随机扰动
      totalX += (Math.random() - 0.5) * 0.5
      totalY += (Math.random() - 0.5) * 0.5

      data.push([totalX, totalY])
    }
  }

  return data
}
