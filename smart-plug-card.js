/**
 * Smart Plug Card - Home Assistant Lovelace Custom Card
 * Version: 1.2.0
 * Description: Display smart plug status (power, voltage, current, energy usage)
 */

console.info(
  '%c SMART-PLUG-CARD %c v1.2.0 ',
  'color: #7c3aed; font-weight: bold; background: #f5f3ff; padding: 2px 6px; border-radius: 3px 0 0 3px;',
  'color: white; background: #7c3aed; padding: 2px 6px; border-radius: 0 3px 3px 0;'
);

class SmartPlugCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this.config = {
      // 默认配置
      title: '智能插座',
      display_mode: 'vertical',  // vertical | horizontal
      columns: 2,               // horizontal 模式下的列数
      // 实体配置
      entities: config.entities || [],
      // 单个插座配置（兼容）
      switch_entity: config.switch_entity || null,
      power_entity: config.power_entity || null,
      voltage_entity: config.voltage_entity || null,
      current_entity: config.current_entity || null,
      daily_energy_entity: config.daily_energy_entity || null,
      monthly_energy_entity: config.monthly_energy_entity || null,
      // 指示灯状态（binary_sensor，on/off）
      indicator_entity: config.indicator_entity || null,
      // 指示灯亮度/状态（sensor，显示亮度或其他状态）
      indicator_light_entity: config.indicator_light_entity || null,
      // 样式配置
      background_color: '#ffffff',
      text_color: '#1e293b',
      secondary_color: '#64748b',
      ...config
    };
    this._updateCard();
  }

  set hass(hass) {
    this._hass = hass;
    this._updateCard();
  }

  connectedCallback() {
    this._updateCard();
  }

  _getState(entityId) {
    if (!entityId || !this._hass) return null;
    return this._hass.states[entityId] || null;
  }

  _formatNumber(value, decimals = 1) {
    if (value === null || value === undefined) return '--';
    const num = parseFloat(value);
    if (isNaN(num)) return '--';
    return decimals > 0 ? num.toFixed(decimals) : num.toString();
  }

  _formatEnergy(value) {
    if (value === null || value === undefined) return '--';
    const num = parseFloat(value);
    if (isNaN(num)) return '--';
    return num.toFixed(2);
  }

  _buildPlugItem(entityConfig) {
    let switchEntity, name;
    if (typeof entityConfig === 'string') {
      switchEntity = entityConfig;
      name = null;
    } else if (typeof entityConfig === 'object') {
      switchEntity = entityConfig.switch_entity || entityConfig.entity;
      name = entityConfig.name || null;
    } else {
      return null;
    }

    const switchState = this._getState(switchEntity);
    if (!switchState) return null;

    const isOn = switchState.state === 'on';
    const friendlyName = name ||
                       switchState.attributes.friendly_name ||
                       switchEntity.replace('switch.', '').replace(/_/g, ' ');

    let power = null, voltage = null, current = null, daily = null, monthly = null;
    let indicator_on = undefined, indicator_light = null;

    if (typeof entityConfig === 'object') {
      // 从对象配置读取
      power = this._getState(entityConfig.power_entity)?.state || null;
      voltage = this._getState(entityConfig.voltage_entity)?.state || null;
      current = this._getState(entityConfig.current_entity)?.state || null;
      daily = this._getState(entityConfig.daily_energy_entity)?.state || null;
      monthly = this._getState(entityConfig.monthly_energy_entity)?.state || null;
      
      // 指示灯状态（binary_sensor on/off）
      if (entityConfig.indicator_entity) {
        indicator_on = this._getState(entityConfig.indicator_entity)?.state === 'on';
      }
      // 指示灯亮度（sensor 数值）
      if (entityConfig.indicator_light_entity) {
        indicator_light = this._getState(entityConfig.indicator_light_entity)?.state || null;
      }
    } else {
      // 从根配置读取（单个插座）
      power = this._getState(this.config.power_entity)?.state || null;
      voltage = this._getState(this.config.voltage_entity)?.state || null;
      current = this._getState(this.config.current_entity)?.state || null;
      daily = this._getState(this.config.daily_energy_entity)?.state || null;
      monthly = this._getState(this.config.monthly_energy_entity)?.state || null;
      
      if (this.config.indicator_entity) {
        indicator_on = this._getState(this.config.indicator_entity)?.state === 'on';
      }
      if (this.config.indicator_light_entity) {
        indicator_light = this._getState(this.config.indicator_light_entity)?.state || null;
      }
    }

    return {
      switch_entity: switchEntity,
      name: friendlyName,
      is_on: isOn,
      power: power,
      voltage: voltage,
      current: current,
      daily: daily,
      monthly: monthly,
      indicator_on: indicator_on,
      indicator_light: indicator_light
    };
  }

  _getPlugEntities() {
    if (!this._hass) return [];

    const entities = [];
    const seen = new Set();

    if (this.config.entities && Array.isArray(this.config.entities) && this.config.entities.length > 0) {
      for (const entityConfig of this.config.entities) {
        const item = this._buildPlugItem(entityConfig);
        if (item && !seen.has(item.switch_entity)) {
          entities.push(item);
          seen.add(item.switch_entity);
        }
      }
      return entities;
    }

    if (this.config.switch_entity) {
      const item = this._buildPlugItem({
        switch_entity: this.config.switch_entity,
        power_entity: this.config.power_entity,
        voltage_entity: this.config.voltage_entity,
        current_entity: this.config.current_entity,
        daily_energy_entity: this.config.daily_energy_entity,
        monthly_energy_entity: this.config.monthly_energy_entity,
        indicator_entity: this.config.indicator_entity,
        indicator_light_entity: this.config.indicator_light_entity
      });
      if (item) {
        entities.push(item);
      }
    }

    return entities;
  }

  _createPlugItem(entity) {
    const { is_on, name, power, voltage, current, daily, monthly, indicator_on, indicator_light } = entity;
    const icon = is_on ? '🟢' : '⚪';

    const powerDisplay = power !== null ? `${this._formatNumber(power, 0)} W` : '--';
    const voltageDisplay = voltage !== null ? `${this._formatNumber(voltage, 1)} V` : '--';
    const currentDisplay = current !== null ? `${this._formatNumber(current, 2)} A` : '--';
    const dailyDisplay = daily !== null ? `${this._formatEnergy(daily)} kWh` : '--';
    const monthlyDisplay = monthly !== null ? `${this._formatEnergy(monthly)} kWh` : '--';

    // 指示灯状态 (binary_sensor)
    let indicatorHtml = '';
    if (indicator_on !== undefined) {
      const indColor = indicator_on ? '#22c55e' : '#ef4444';
      const indText = indicator_on ? '亮' : '灭';
      indicatorHtml = `<div class="plug-indicator"><span class="indicator-dot" style="background:${indColor};"></span><span class="indicator-text" style="color:${indColor};">指示灯${indText}</span></div>`;
    }

    // 指示灯亮度 (sensor)
    let indicatorLightHtml = '';
    if (indicator_light !== null && indicator_light !== undefined) {
      indicatorLightHtml = `<div class="plug-indicator-light"><span class="indicator-light-icon">💡</span><span class="indicator-light-value">${indicator_light}</span></div>`;
    }

    return `
      <div class="plug-item">
        <div class="plug-header">
          <div class="plug-status ${is_on ? 'on' : 'off'}">
            <span class="status-icon">${icon}</span>
            <span class="status-text">${is_on ? '已开启' : '已关闭'}</span>
          </div>
          <div class="plug-name">${name}</div>
          ${indicatorHtml}
          ${indicatorLightHtml}
        </div>
        <div class="plug-metrics">
          <div class="metric-item"><span class="metric-icon">⚡</span><span class="metric-value">${powerDisplay}</span><span class="metric-label">功率</span></div>
          <div class="metric-item"><span class="metric-icon">🔌</span><span class="metric-value">${voltageDisplay}</span><span class="metric-label">电压</span></div>
          <div class="metric-item"><span class="metric-icon">📊</span><span class="metric-value">${currentDisplay}</span><span class="metric-label">电流</span></div>
        </div>
        <div class="plug-energy">
          <div class="energy-item"><span class="energy-label">今日用电</span><span class="energy-value">${dailyDisplay}</span></div>
          <div class="energy-item"><span class="energy-label">本月用电</span><span class="energy-value">${monthlyDisplay}</span></div>
        </div>
      </div>
    `;
  }

  _updateCard() {
    if (!this.config) return;

    const entities = this._getPlugEntities();
    const { background_color, text_color, secondary_color, title, display_mode, columns } = this.config;

    const totalPlugs = entities.length;
    const onCount = entities.filter(e => e.is_on).length;
    const offCount = totalPlugs - onCount;

    let bodyHtml = '';
    if (entities.length > 0) {
      bodyHtml = entities.map(e => this._createPlugItem(e)).join('');
    } else {
      bodyHtml = '<div class="empty-state">未配置插座实体</div>';
    }

    const statsHtml = totalPlugs > 0 ? `
      <div class="stats-bar">
        <div class="stat-item stat-on"><span class="stat-dot"></span><span class="stat-label">开启</span><span class="stat-value">${onCount}</span></div>
        <div class="stat-item stat-off"><span class="stat-dot"></span><span class="stat-label">关闭</span><span class="stat-value">${offCount}</span></div>
      </div>
    ` : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { background: ${background_color}; border-radius: var(--ha-card-border-radius, 16px); box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: visible; }
        .card-content { padding: 0; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; color: ${text_color}; overflow: visible; }
        .card-header { padding: 18px 20px 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .card-title { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; }
        .title-icon { font-size: 22px; }
        .plug-count { background: #f1f5f9; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; color: ${secondary_color}; }

        /* 统计栏 */
        .stats-bar { display: flex; gap: 12px; padding: 12px 20px; margin: 14px 20px; background: #f8fafc; border-radius: 12px; flex-wrap: wrap; }
        .stat-item { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 60px; font-size: 12px; }
        .stat-dot { width: 8px; height: 8px; border-radius: 50%; }
        .stat-on .stat-dot { background: #22c55e; }
        .stat-off .stat-dot { background: #ef4444; }
        .stat-label { color: ${secondary_color}; }
        .stat-value { font-weight: 700; margin-left: 2px; }

        /* 布局容器 */
        .plug-container { padding: 0 12px 12px; overflow: visible; }
        ${display_mode === 'horizontal' ? `.plug-container { display: grid; grid-template-columns: repeat(${columns || 2}, 1fr); gap: 12px; padding: 0 12px 12px; }` : ''}

        /* 响应式 */
        @media (max-width: 600px) {
          .plug-container { grid-template-columns: 1fr !important; }
        }

        /* 插座项 */
        .plug-item { background: #f8fafc; border-radius: 14px; padding: 16px; transition: all 0.2s ease; overflow: visible; min-width: 0; }
        .plug-header { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; }
        .plug-status { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .plug-status.on { background: #dcfce7; color: #16a34a; }
        .plug-status.off { background: #fee2e2; color: #dc2626; }
        .status-icon { font-size: 10px; }
        .plug-name { font-size: 15px; font-weight: 600; flex: 1; min-width: 60px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* 指示灯 */
        .plug-indicator { display: flex; align-items: center; gap: 5px; margin-left: auto; }
        .indicator-dot { width: 7px; height: 7px; border-radius: 50%; }
        .indicator-text { font-size: 11px; font-weight: 500; }
        .plug-indicator-light { display: flex; align-items: center; gap: 4px; margin-left: 8px; }
        .indicator-light-icon { font-size: 14px; }
        .indicator-light-value { font-size: 12px; font-weight: 600; color: #f59e0b; }

        /* 指标网格 */
        .plug-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
        .metric-item { background: #fff; border-radius: 10px; padding: 12px 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); min-width: 0; }
        .metric-icon { font-size: 16px; display: block; margin-bottom: 4px; }
        .metric-value { font-size: 15px; font-weight: 700; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .metric-label { font-size: 10px; color: ${secondary_color}; display: block; margin-top: 2px; }

        /* 用电量 */
        .plug-energy { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .energy-item { background: #fff; border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.05); min-width: 0; }
        .energy-label { font-size: 12px; color: ${secondary_color}; }
        .energy-value { font-size: 14px; font-weight: 700; color: #7c3aed; }

        /* 空状态 */
        .empty-state { padding: 40px 20px; text-align: center; color: ${secondary_color}; font-size: 14px; }

        /* 底部 */
        .card-footer { padding: 12px 20px 18px; border-top: 1px solid #f1f5f9; margin-top: 4px; }
        .update-info { display: flex; align-items: center; gap: 6px; font-size: 11px; color: ${secondary_color}; }
        .update-dot { width: 6px; height: 6px; background: #7c3aed; border-radius: 50%; }
      </style>

      <ha-card>
        <div class="card-content">
          <div class="card-header">
            <div class="card-title"><span class="title-icon">🔌</span><span>${title}</span></div>
            <span class="plug-count">${totalPlugs} 个插座</span>
          </div>
          ${statsHtml}
          <div class="plug-container">${bodyHtml}</div>
          <div class="card-footer">
            <div class="update-info"><span class="update-dot"></span><span>实时更新</span></div>
          </div>
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    const count = this.config?.entities?.length || 1;
    return display_mode === 'horizontal' ? Math.ceil(count / (this.config?.columns || 2)) * 3 : Math.min(count * 3, 6);
  }

  static getStubConfig() {
    return {
      title: '智能插座',
      display_mode: 'vertical',
      columns: 2
    };
  }
}

if (!customElements.get('smart-plug-card')) {
  customElements.define('smart-plug-card', SmartPlugCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'smart-plug-card',
  name: '智能插座卡片',
  description: '显示智能插座的开关状态、功率、电压、电流及用电量',
  documentationURL: 'https://github.com/j1617/smart-plug-card',
});