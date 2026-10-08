# BY PRESS 视频制作与团队协作培训手册

北海艺术设计学院记者团内部培训资料。主题：从记录现场，到完成表达。

## 本地开发

要求 Node.js 22.12 或更新的受支持版本、npm、Git。

```sh
npm ci
npm run dev
```

打开终端显示的 `/by-press-handbook/` 地址。

```sh
npm run typecheck
npm run lint
npm run build
npm run preview
```

## 内容与维护

- `src/content/chapters/`：八章独立教学正文。
- `src/content.ts`：流程、12 个素材案例、12 道测试题、检查表和命名练习。
- `src/Interactions.tsx`：相机参数、矢量场景、镜头景别、素材筛选、时间线和文件练习。
- `src/App.tsx`：首页、哈希路由、搜索、持久化、教学投影、报告及打印视图。
- `src/main.tsx`：React 应用入口。
- `src/style.css`：视觉系统、响应式、减少动态效果和 A4 打印。
- `.github/workflows/deploy.yml`：检查、构建并部署 GitHub Pages。

所有插画为项目内矢量示意，无真实人物或外部图片请求。相机画面不是实际曝光或 Log 色彩测试，时间线不是媒体编辑器。

学习数据保存在当前浏览器 localStorage（`by-press-handbook-v1`），无账号和数据库。报告可打印，选择系统打印对话框“保存为 PDF”。可以导出 JSON 学习记录作为个人备份；目前没有自动跨设备同步或记录导入功能。

## 部署

独立仓库：`kangjunshu/by-press-handbook`。

目标站点：https://kangjunshu.github.io/by-press-handbook/

Vite 基路径固定为 `/by-press-handbook/`。课程使用 `#/chapter/1` 至 `#/chapter/8`，刷新不需要服务端回退。

仓库 Settings → Pages → Build and deployment 选择 GitHub Actions。推送 `main` 后，工作流自动运行类型检查、ESLint、构建与部署。构建仅有读取仓库权限，部署任务仅有 Pages 写入和 OIDC 权限。

```sh
git add .
git commit -m "更新培训内容"
git push origin main
```

只在本项目仓库执行上述命令。原有 `kangjunshu/kangjunshu.github.io` Hexo 博客是独立项目，本项目不得修改它的内容、分支或 Pages 设置。

## 课程校核

设备按型号和固件核实，技术 LUT 按输入曲线、色域选择。剪映与百度网盘界面、账号权益可能变化；手册不固定菜单位置，不以国际版 CapCut 代替国内剪映。团队应在培训前用实际设备试拍，核实学校审核与发布流程。

官方参考链接位于首页及 `src/content.ts`。工作基准为团队约定，不代表各设备官方统一规范。
