# 更新日志

## [1.3.0] - 2026-05-12

### 新增
- 🎯 **HA Grid 布局兼容** - 支持 Home Assistant 2024.x+ 新布局系统
  - `getCardSize()` 返回准确尺寸，适配响应式Grid
  - `getGridOptions()` 支持响应式Grid配置
  - `getLayoutOptions()` 支持可见性和布局选项
- 🎨 **HA 主题变量** - 使用 HA CSS 变量，自动适配深色/浅色主题
  - `--ha-card-background`
  - `--primary-text-color`
  - `--secondary-text-color`
  - `--success-color`
  - `--error-color`
  - 等等
- ✅ **配置验证** - 添加 `setConfig` 验证，必须配置实体
- 📐 **弹性布局** - 卡片高度自适应，flex布局

### 改进
- 所有颜色默认值改为 HA 变量，主题切换自动适配
- 卡片容器使用 flex 布局，内容自动填充

## [1.2.0] - 2026-05-12

### 新增
- 💡 新增 `indicator_light_entity` 指示灯传感器配置
- 📱 新增 `display_mode` 显示模式配置
- 🔢 新增 `columns` 列数配置
- 🎨 优化 CSS 样式

## [1.1.0] - 2026-05-12

### 修复
- 🐛 修复传感器数值读取逻辑错误

## [1.0.0] - 2026-05-12

### 新增
- 🎉 首次发布