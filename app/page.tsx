import WindVisualization from "@/components/wind-visualization"

export default function Home() {
  return (
    <main>
      <WindVisualization />
      <div className="info">
        <h1>风场可视化</h1>
        <p>使用 Three.js 实现的风场流动效果</p>
      </div>
    </main>
  )
}
