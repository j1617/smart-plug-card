# Home Assistant 智能插座卡片

HA插件交流QQ群： 754364399

关注公众号【工具箱达人】，里面有详细的使用教程

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://hacs.xyz/)
[![version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/j1617/smart-plug-card)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

一个优雅的 Home Assistant Lovelace 自定义卡片，显示智能插座的开关状态、功率、电压、电流及用电量。

**当前版本: v1.2.0**

## 预览效果

### 纵向模式（默认）

```
┌─────────────────────────────────────────────┐
│  🔌 智能插座                    2 个插座    │
│                                             │
│  🟢 开启 1    ⚪ 关闭 1                     │
│                                             │
│  ┌─────────────────────────────────────┐     │
│  │  🟢 已开启                      │     │
│  │  客厅空调插座                    │     │
│  │  指示灯亮                     │     │
│  ├────────────┬────────────┬─────────┤     │
│  │ ⚡ 1200W  │ 🔌 220V  │ 📊 5.5A│     │
│  │ 功率      │ 电压     │ 电流    │     │
│  ├────────────┴────────────┴─────────┤     │
│  │ 今日用电  2.5kWh   本月用电  35kWh │     │
│  └─────────────────────────────────────┘     │
│                                             │
│  🟢 实时更新                              │
└─────────────────────────────────────────────┘
```

### 横向模式（多列显示）

```
┌─────────────────────────────────────────────┐
│  🔌 智能插座                    4 个插座    │
│                                             │
│  🟢 开启 3    ⚪ 关闭 1                     │
│                                             │
│  ┌─────────────────┬─────────────────┐      │
│  │ 🟢 已开启      │ 🟢 已开启        │      │
│  │ 客厅空调     │ 卧室风扇         │      │
│  │ 💡 80%       │                 │      │
│  ├──────┬────┬───┼──────┬────┬────┤      │
│  │1200W │220V│5.5A│  0W │  0 │   0│      │
│  ├──────┴────┴───┼──────┴────┴────┤      │
│  │今日2.5│本月35│   │今日0 │本月0 │      │
│  └───────────────┴─────────────────┘      │
└─────────────────────────────────────────────┘
```

## 功能特性

- ✅ **开关状态** - 实时显示开启/关闭状态
- 💡 **指示灯状态** - binary_sensor（亮/灭）+ sensor（亮度数值）
- ⚡ **功率/电压/电流** - 实时显示三相参数
- 📊 **用电量** - 日用电量、月用电量
- 📱 **多模式显示** - 纵向列表 / 横向Grid布局
- 🎨 **紫色主题** - 优雅的紫色主题设计
- 🔄 **可选字段** - 未配置的字段显示 "--"

## 安装方法

### 方法一：HACS 安装（推荐）

1. 打开 HACS → 前端
2. 点击右下角 "+" 按钮
3. 选择 "自定义仓库"
4. 输入仓库地址: `https://github.com/j1617/smart-plug-card`
5. 选择类别为 "Lovelace"
6. 点击安装

### 方法二：手动安装

1. 将 `smart-plug-card.js` 下载到 Home Assistant 配置目录：
   ```
   /config/www/smart-plug-card.js
   ```

2. 在 Home Assistant 中，进入 **设置 → 仪表板 → 资源**
   或编辑 `configuration.yaml`：
   ```yaml
   lovelace:
     resources:
       - url: /local/smart-plug-card.js
         type: module
   ```

3. 重启 Home Assistant

## 使用方法

### 添加卡片

1. 进入仪表板编辑模式
2. 点击 "添加卡片"
3. 选择 "智能插座卡片"
4. 保存即可

### YAML 配置示例

#### 单个插座配置

```yaml
type: custom:smart-plug-card
title: 客厅插座
switch_entity: switch.living_room_plug
power_entity: sensor.living_room_plug_power
voltage_entity: sensor.living_room_plug_voltage
current_entity: sensor.living_room_plug_current
daily_energy_entity: sensor.plug_daily_energy
monthly_energy_entity: sensor.plug_monthly_energy
indicator_entity: binary_sensor.plug_indicator     # 指示灯亮/灭
indicator_light_entity: sensor.plug_led_brightness  # 指示灯亮度
```

> **注意**：所有传感器实体都是可选的，未配置时该字段显示 "--"

#### 多个插座配置（纵向）

```yaml
type: custom:smart-plug-card
title: 全家插座
entities:
  - name: 客厅空调
    switch_entity: switch.living_room_ac
    power_entity: sensor.living_room_ac_power
    voltage_entity: sensor.living_room_ac_voltage
    current_entity: sensor.living_room_ac_current
    daily_energy_entity: sensor.living_room_ac_daily
    monthly_energy_entity: sensor.living_room_ac_monthly
  - name: 卧室风扇
    switch_entity: switch.bedroom_fan
    power_entity: sensor.bedroom_fan_power
  - name: 厨房电器
    switch_entity: switch.kitchen_plug
    power_entity: sensor.kitchen_plug_power
```

#### 多个插座配置（横向）

```yaml
type: custom:smart-plug-card
title: 全家插座
display_mode: horizontal     # 横向布局
columns: 2                  # 2列显示
entities:
  - name: 客厅空调
    switch_entity: switch.living_room_ac
    power_entity: sensor.living_room_ac_power
    indicator_light_entity: sensor.living_room_ac_led
  - name: 卧室风扇
    switch_entity: switch.bedroom_fan
    power_entity: sensor.bedroom_fan_power
  - name: 厨房电器
    switch_entity: switch.kitchen_plug
    power_entity: sensor.kitchen_plug_power
  - name: 阳台插座
    switch_entity: switch.balcony_plug
    power_entity: sensor.balcony_plug_power
```

#### 简化配置

```yaml
type: custom:smart-plug-card
title: 全家插座
entities:
  - switch.living_room_ac
  - switch.bedroom_fan
  - switch.kitchen_plug
```

## 配置选项

### 基础配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | string | 智能插座 | 卡片标题 |
| `display_mode` | string | vertical | 显示模式：vertical（纵向）/ horizontal（横向）|
| `columns` | number | 2 | 横向模式下的列数 |
| `entities` | list | [] | 插座实体列表 |

### 插座配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `switch_entity` | switch | required | 开关实体（必需） |
| `power_entity` | sensor | null | 功率传感器（W） |
| `voltage_entity` | sensor | null | 电压传感器（V） |
| `current_entity` | sensor | null | 电流传感器（A） |
| `daily_energy_entity` | sensor | null | 日用电量传感器（kWh） |
| `monthly_energy_entity` | sensor | null | 月用电量传感器（kWh） |
| `indicator_entity` | binary_sensor | null | 指示灯状态（亮/灭）|
| `indicator_light_entity` | sensor | null | 指示灯亮度/其他状态 |

### 样式配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `background_color` | string | #ffffff | 卡片背景色 |
| `text_color` | string | #1e293b | 主文字颜色 |
| `secondary_color` | string | #64748b | 次要文字颜色 |

## 故障排除

### 卡片显示"未配置插座实体"

1. 确认已配置 `switch_entity` 或 `entities`
2. 检查实体 ID 是否正确

### 功率/电压等显示"--"

1. 对应的传感器实体未配置，或
2. 实体状态为 "unavailable"

### 横向模式显示异常

1. 确认 `display_mode: horizontal` 已设置
2. 检查 `columns` 值是否适合屏幕宽度
3. 尝试减少列数：`columns: 1` 或 `columns: 2`

### 样式问题

```yaml
# 深色主题
background_color: '#1a1f2e'
text_color: '#f1f5f9'
secondary_color: '#94a3b8'
```

## 更新日志

- **v1.2.0**：新增横向显示模式、列数配置、indicator_light_entity
- **v1.1.0**：修复传感器数值读取问题
- **v1.0.0**：首次发布

## 项目信息

- **GitHub**: https://github.com/j1617/smart-plug-card
- **版本**: v1.2.0
- **许可证**: MIT

## 许可证

MIT License