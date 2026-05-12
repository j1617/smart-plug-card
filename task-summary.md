# 智能插座卡片创建任务

## 目标
在 V:\smart-plug-card\ 创建 Home Assistant 智能插座状态卡片插件

## 输出文件

| 文件 | 说明 |
|------|------|
| smart-plug-card.js | 主卡片代码，支持开关状态、功率、电压、电流、用电量显示 |
| hacs.json | HACS 配置文件 |
| README.md | 完整使用文档 |
| CHANGELOG.md | 更新日志 |
| VERSION | 版本号 v1.0.0 |

## 功能特性

- 🔌 开关状态显示（开启/关闭）
- 💡 指示灯状态（可选）
- ⚡ 功率/电压/电流三列显示
- 📊 日用电量/月用电量
- 🎨 紫色主题风格
- 🔄 所有字段可选，未配置显示 "--"

## 配置方式

单个插座：
```yaml
type: custom:smart-plug-card
title: 智能插座
switch_entity: switch.my_plug
power_entity: sensor.plug_power
voltage_entity: sensor.plug_voltage
current_entity: sensor.plug_current
daily_energy_entity: sensor.plug_daily
monthly_energy_entity: sensor.plug_monthly
```

多个插座：
```yaml
type: custom:smart-plug-card
entities:
  - name: 客厅空调
    switch_entity: switch.living_room_ac
    power_entity: sensor.living_room_ac_power
  - name: 卧室风扇
    switch_entity: switch.bedroom_fan
```