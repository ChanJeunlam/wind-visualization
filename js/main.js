import * as THREE from "three"

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("wind-canvas")

  // Setup
  const scene = new THREE.Scene()
  const width = window.innerWidth
  const height = window.innerHeight

  // Camera setup - orthographic for 2D visualization
  const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1000, 1000)

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // Create particles
  const geometry = new THREE.BufferGeometry()
  const positionVertices = []
  const colorData = []
  const particleCount = 15000 // 增加粒子数量

  for (let i = 0; i < particleCount; i++) {
    const x = THREE.MathUtils.randFloatSpread(width)
    const y = THREE.MathUtils.randFloatSpread(height)
    const z = 0
    positionVertices.push(x, y, z)
    colorData.push(1, 1, 1) // 默认白色
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positionVertices, 3))
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colorData, 3))

  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 1.5,
    transparent: true,
    opacity: 0.8,
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)

  // 创建两个渲染目标用于交替渲染
  const renderTargetA = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  })

  const renderTargetB = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  })

  let currentRenderTarget = renderTargetA
  let previousRenderTarget = renderTargetB

  // 创建全屏四边形用于轨迹效果
  const trailMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      opacity: { value: 0.97 }, // 调整轨迹持续时间
      fadeEdges: { value: 0.05 }, // 边缘淡出效果
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float opacity;
      uniform float fadeEdges;
      varying vec2 vUv;
      
      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        
        // 边缘淡出效果
        float distFromCenter = length(vUv - 0.5) * 2.0;
        float edgeFade = smoothstep(1.0 - fadeEdges, 1.0, distFromCenter);
        
        gl_FragColor = vec4(texel.rgb, texel.a * opacity * (1.0 - edgeFade));
      }
    `,
    transparent: true,
  })

  const trailQuad = new THREE.Mesh(new THREE.PlaneGeometry(width, height), trailMaterial)
  trailQuad.position.z = -1 // 放在粒子后面
  scene.add(trailQuad)

  // 初始清除两个渲染目标
  renderer.setRenderTarget(renderTargetA)
  renderer.clear()
  renderer.setRenderTarget(renderTargetB)
  renderer.clear()
  renderer.setRenderTarget(null)

  // 颜色映射函数 - 根据风速生成颜色
  function getColorForSpeed(speed) {
    // 定义颜色梯度点
    const colorStops = [
      { speed: 0.0, color: [0.2, 0.2, 0.5] }, // 深蓝色 - 最低速度
      { speed: 0.2, color: [0.5, 0.5, 1.0] }, // 蓝色
      { speed: 0.4, color: [1.0, 1.0, 1.0] }, // 白色
      { speed: 0.6, color: [1.0, 0.8, 0.2] }, // 黄色
      { speed: 0.8, color: [1.0, 0.4, 0.0] }, // 橙色
      { speed: 1.0, color: [1.0, 0.0, 0.0] }, // 红色 - 最高速度
    ]

    // 找到速度所在的区间
    let lowerIndex = 0
    for (let i = 0; i < colorStops.length - 1; i++) {
      if (speed >= colorStops[i].speed && speed <= colorStops[i + 1].speed) {
        lowerIndex = i
        break
      }
    }

    // 如果速度超出范围，使用最高或最低颜色
    if (speed >= colorStops[colorStops.length - 1].speed) {
      return colorStops[colorStops.length - 1].color
    }
    if (speed <= colorStops[0].speed) {
      return colorStops[0].color
    }

    // 计算两个颜色点之间的插值
    const lower = colorStops[lowerIndex]
    const upper = colorStops[lowerIndex + 1]
    const t = (speed - lower.speed) / (upper.speed - lower.speed)

    return [
      lower.color[0] + t * (upper.color[0] - lower.color[0]),
      lower.color[1] + t * (upper.color[1] - lower.color[1]),
      lower.color[2] + t * (upper.color[2] - lower.color[2]),
    ]
  }

  // 模拟风场数据
  const windData = {
    nx: 64,
    ny: 32,
    data: [],
    max: 20,
  }

  // 初始化风场数据
  for (let j = 0; j < windData.ny; j++) {
    for (let i = 0; i < windData.nx; i++) {
      const u = Math.sin((i / windData.nx) * 2 * Math.PI)
      const v = Math.cos((j / windData.ny) * 2 * Math.PI)
      windData.data.push([u * 10, v * 10])
    }
  }

  // 动画函数
  function animate() {
    requestAnimationFrame(animate)

    const positions = points.geometry.attributes.position.array
    const colors = points.geometry.attributes.color.array

    for (let i = 0; i < positions.length; i += 3) {
      // 随机重置一些粒子以避免聚集
      if (Math.random() < 0.005) {
        // 降低重置率以保持更连续的轨迹
        const x = THREE.MathUtils.randFloatSpread(width)
        const y = THREE.MathUtils.randFloatSpread(height)
        positions[i] = x
        positions[i + 1] = y
        continue
      }

      // 将屏幕位置映射到风场数据网格
      const xratio = windData.nx / width
      const yratio = windData.ny / height
      const x = Math.floor((positions[i] + width / 2) * xratio)
      const y = Math.floor((positions[i + 1] + height / 2) * yratio)

      // 确保x和y在边界内
      if (x >= 0 && x < windData.nx && y >= 0 && y < windData.ny) {
        // 获取该位置的风场数据
        const index = y * windData.nx + x
        if (windData.data[index]) {
          // 应用风速到粒子位置
          const deltax = windData.data[index][0] / windData.max
          const deltay = windData.data[index][1] / windData.max

          // 应用风速，使用自适应速度因子
          const speedFactor = 2.5
          positions[i] += deltax * speedFactor
          positions[i + 1] += deltay * speedFactor

          // 如果粒子移出屏幕，将其重置到另一侧（循环边界）
          if (positions[i] > width / 2) positions[i] = -width / 2
          if (positions[i] < -width / 2) positions[i] = width / 2
          if (positions[i + 1] > height / 2) positions[i + 1] = -height / 2
          if (positions[i + 1] < -height / 2) positions[i + 1] = height / 2

          // 基于风速计算颜色
          const speed = Math.sqrt(deltax * deltax + deltay * deltay) * 2.5 // 放大速度值
          const normalizedSpeed = Math.min(1.0, speed) // 限制在0-1范围内
          const [r, g, b] = getColorForSpeed(normalizedSpeed)

          colors[i] = r
          colors[i + 1] = g
          colors[i + 2] = b
        }
      }
    }

    // 更新几何体
    points.geometry.attributes.position.needsUpdate = true
    points.geometry.attributes.color.needsUpdate = true

    // 交换渲染目标
    const temp = currentRenderTarget
    currentRenderTarget = previousRenderTarget
    previousRenderTarget = temp

    // 更新轨迹纹理
    trailMaterial.uniforms.tDiffuse.value = previousRenderTarget.texture

    // 渲染到当前渲染目标
    renderer.setRenderTarget(currentRenderTarget)
    renderer.render(scene, camera)

    // 渲染到屏幕
    renderer.setRenderTarget(null)
    renderer.render(scene, camera)
  }

  // 开始动画
  animate()

  // 处理窗口大小变化
  function handleResize() {
    const width = window.innerWidth
    const height = window.innerHeight

    // 更新相机
    camera.left = -width / 2
    camera.right = width / 2
    camera.top = height / 2
    camera.bottom = -height / 2
    camera.updateProjectionMatrix()

    // 更新渲染器和渲染目标
    renderer.setSize(width, height)
    renderTargetA.setSize(width, height)
    renderTargetB.setSize(width, height)

    // 更新轨迹四边形
    trailQuad.scale.set(width, height, 1)
  }

  window.addEventListener("resize", handleResize)
})
