# 风场可视化 | Wind Visualization

使用 Next.js 和 Three.js 实现的风场流动效果可视化。

## 预览

在线预览: [https://你的用户名.github.io/wind-visualization/](https://你的用户名.github.io/wind-visualization/)

## 特性

- 使用 Three.js 实现的粒子系统
- 基于风速的颜色渐变映射
- 粒子轨迹效果
- 多个风场模式组合
- 响应式设计，适配不同屏幕尺寸
- 使用 Next.js 构建

## 本地开发

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
\`\`\`

然后在浏览器中访问 `http://localhost:3000`。

## 构建

\`\`\`bash
# 构建静态网站
npm run build
\`\`\`

构建后的文件将位于 `out` 目录中。

## 部署到 GitHub Pages

本项目已配置 GitHub Actions 工作流，可以自动部署到 GitHub Pages。

1. 创建一个新的 GitHub 仓库
2. 将所有文件上传到仓库
3. 在仓库设置中启用 GitHub Pages，选择 GitHub Actions 作为源

## 自定义

- 修改 `lib/wind-data.ts` 中的风场数据生成逻辑
- 调整 `components/wind-visualization.tsx` 中的粒子数量和颜色映射
- 修改 `app/globals.css` 自定义界面样式

## 许可

MIT
