/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 启用静态导出
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // GitHub Pages 不支持 Next.js 的图像优化
  },
  basePath: process.env.NODE_ENV === 'production' ? '/wind-visualization' : '', // 设置基础路径为仓库名
  assetPrefix: process.env.NODE_ENV === 'production' ? '/wind-visualization/' : '', // 资源前缀
  trailingSlash: true, // 添加尾部斜杠，有助于 GitHub Pages 路由
};

export default nextConfig;
