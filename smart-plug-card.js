/**
 * Smart Plug Card - Home Assistant Lovelace Custom Card
 * Version: 1.4.0
 * Description: Display smart plug status (power, voltage, current, energy usage)
 * Compatible with HA 2024.x+ grid layout and visibility features
 */

console.info(
  '%c SMART-PLUG-CARD %c v1.4.0 ',
  'color: #7c3aed; font-weight: bold; background: #f5f3ff; padding: 2px 6px; border-radius: 3px 0 0 3px;',
  'color: white; background: #7c3aed; padding: 2px 6px; border-radius: 0 3px 3px 0;'
);

class SmartPlugCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getStubConfig() {
    return {
      title: '智能插座',
      display_mode: 'vertical',
      columns: 2,
      entities: []
    };
  }

  setConfig(config) {
    if (!config.switch_entity && (!config.entities || config.entities.length === 0)) {
      throw new Error('需要配置 switch_entity 或 entities');
    }

    this.config = {
      title: '智能插座',
      display_mode: 'vertical',
      columns: 2,
      entities: config.entities || [],
      switch_entity: config.switch_entity || null,
      power_entity: config.power_entity || null,
      voltage_entity: config.voltage_entity || null,
      current_entity: config.current_entity || null,
      daily_energy_entity: config.daily_energy_entity || null,
      monthly_energy_entity: config.monthly_energy_entity || null,
      indicator_entity: config.indicator_entity || null,
      indicator_light_entity: config.indicator_light_entity || null,
      background_color: 'var(--ha-card-background, #ffffff)',
      text_color: 'var(--primary-text-color, #1e293b)',
      secondary_color: 'var(--secondary-text-color, #64748b)',
      ...config
    };

    this._entityCount = this._getEntityCount();
    this._updateCard();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._dataChanged()) {
      this._updateCard();
    }
  }

  _dataChanged() {
    if (!this._hass || !this.config) return true;
    const entities = this._getPlugEntities();
    const newHash = JSON.stringify(entities.map(e => ({
      on: e.is_on, power: e.power, daily: e.daily, monthly: e.monthly
    })));
    if (newHash === this._lastDataHash) return false;
    this._lastDataHash = newHash;
    return true;
  }

  connectedCallback() {
    this._updateCard();
  }

  _getEntityCount() {
    if (this.config.entities && this.config.entities.length > 0) {
      return this.config.entities.length;
    }
    return this.config.switch_entity ? 1 : 0;
  }

  getCardSize() {
    const count = this._entityCount || 1;
    if (this.config.display_mode === 'horizontal') {
      const cols = this.config.columns || 2;
      const rows = Math.ceil(count / cols);
      return Math.max(rows * 3, 3);
    }
    return Math.min(count * 3, 6);
  }

  getGridOptions() {
    const count = this._entityCount || 1;
    return {
      columns: this.config.display_mode === 'horizontal' ? 12 : 6,
      rows: Math.min(Math.ceil(count / (this.config.display_mode === 'horizontal' ? (this.config.columns || 2) : 1)) * 2, 4)
    };
  }

  getLayoutOptions() {
    return {
      grid_columns: this.config.display_mode === 'horizontal' ? 12 : 6,
      grid_rows: this.getCardSize()
    };
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
      power = this._getState(entityConfig.power_entity)?.state || null;
      voltage = this._getState(entityConfig.voltage_entity)?.state || null;
      current = this._getState(entityConfig.current_entity)?.state || null;
      daily = this._getState(entityConfig.daily_energy_entity)?.state || null;
      monthly = this._getState(entityConfig.monthly_energy_entity)?.state || null;
      
      if (entityConfig.indicator_entity) {
        indicator_on = this._getState(entityConfig.indicator_entity)?.state === 'on';
      }
      if (entityConfig.indicator_light_entity) {
        indicator_light = this._getState(entityConfig.indicator_light_entity)?.state || null;
      }
    } else {
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
      power, voltage, current, daily, monthly,
      indicator_on,
      indicator_light
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
      if (item) entities.push(item);
    }

    return entities;
  }

  _getTotalPower(entities) {
    let total = 0;
    for (const entity of entities) {
      if (entity.power !== null && !isNaN(parseFloat(entity.power))) {
        total += parseFloat(entity.power);
      }
    }
    return total > 0 ? total : null;
  }

  _createPlugItem(entity) {
    const { is_on, name, power, voltage, current, daily, monthly, indicator_on, indicator_light } = entity;
    const icon = is_on ? '🟢' : '⚪';

    const powerDisplay = power !== null ? `${this._formatNumber(power, 0)} W` : '--';
    const voltageDisplay = voltage !== null ? `${this._formatNumber(voltage, 1)} V` : '--';
    const currentDisplay = current !== null ? `${this._formatNumber(current, 2)} A` : '--';
    const dailyDisplay = daily !== null ? `${this._formatEnergy(daily)} kWh` : '--';
    const monthlyDisplay = monthly !== null ? `${this._formatEnergy(monthly)} kWh` : '--';

    let indicatorHtml = '';
    if (indicator_on !== undefined) {
      const indColor = indicator_on ? '#22c55e' : '#ef4444';
      const indText = indicator_on ? '亮' : '灭';
      indicatorHtml = `<div class="plug-indicator"><span class="indicator-dot" style="background:${indColor};"></span><span class="indicator-text" style="color:${indColor};">指示灯${indText}</span></div>`;
    }

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
          <div class="metric-item"><span class="metric-icon">🔊</span><span class="metric-value">${currentDisplay}</span><span class="metric-label">电流</span></div>
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

    const totalPower = this._getTotalPower(entities);
    const totalPowerDisplay = totalPower !== null ? `${totalPower} W` : '';

    let bodyHtml = entities.length > 0 
      ? entities.map(e => this._createPlugItem(e)).join('')
      : '<div class="empty-state">未配置插座实体</div>';

    let statsHtml = '';
    if (totalPlugs > 0) {
      statsHtml = `
        <div class="stats-bar">
          ${totalPowerDisplay ? `
            <div class="stat-item stat-power">
              <span class="stat-icon">⚡</span>
              <span class="stat-label">总功率</span>
              <span class="stat-value stat-power-value">${totalPowerDisplay}</span>
            </div>
          ` : ''}
          <div class="stat-item stat-on"><span class="stat-dot"></span><span class="stat-label">开启</span><span class="stat-value">${onCount}</span></div>
          <div class="stat-item stat-off"><span class="stat-dot"></span><span class="stat-label">关闭</span><span class="stat-value">${offCount}</span></div>
        </div>
      `;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
        }
        
        ha-card {
          background: ${background_color};
          border-radius: var(--ha-card-border-radius, 16px);
          box-shadow: var(--ha-card-box-shadow, 0 2px 12px rgba(0,0,0,0.08));
          overflow: visible;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .card-content {
          padding: 0;
          font-family: var(--paper-font-common-base_-_font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
          color: ${text_color};
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .card-header {
          padding: 18px 20px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .card-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 700;
        }
        
        .title-icon { font-size: 22px; }
        .plug-count {
          background: var(--chip-background-color, #f1f5f9);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: ${secondary_color};
        }

        .stats-bar {
          display: flex;
          gap: 12px;
          padding: 12px 20px;
          margin: 14px 20px;
          background: var(--secondary-background-color, #f8fafc);
          border-radius: 12px;
          flex-wrap: wrap;
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 60px;
          font-size: 12px;
        }
        
        .stat-icon { font-size: 14px; }
        
        .stat-dot { width: 8px; height: 8px; border-radius: 50%; }
        .stat-on .stat-dot { background: var(--success-color, #22c55e); }
        .stat-off .stat-dot { background: var(--error-color, #ef4444); }
        .stat-label { color: ${secondary_color}; }
        .stat-value { font-weight: 700; margin-left: 2px; }

        .stat-power {
          background: var(--primary-color, #7c3aed);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          flex: 1.5;
        }
        .stat-power .stat-label { color: rgba(255,255,255,0.9); }
        .stat-power .stat-value { color: white; }
        .stat-power .stat-icon { font-size: 14px; }

        .plug-container {
          padding: 0 12px 12px;
          overflow: visible;
          flex: 1;
          ${display_mode === 'horizontal' ? `display: grid; grid-template-columns: repeat(${columns || 2}, 1fr); gap: 12px;` : ''}
        }

        @media (max-width: 600px) {
          .plug-container { grid-template-columns: 1fr !important; }
        }

        .plug-item {
          background: var(--secondary-background-color, #f8fafc);
          border-radius: 14px;
          padding: 16px;
          transition: all 0.2s ease;
          overflow: visible;
          min-width: 0;
        }
        
        .plug-header {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 14px;
        }
        
        .plug-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .plug-status.on { background: var(--success-color-light, #dcfce7); color: var(--success-color, #16a34a); }
        .plug-status.off { background: var(--error-color-light, #fee2e2); color: var(--error-color, #dc2626); }
        .status-icon { font-size: 10px; }
        .plug-name {
          font-size: 15px;
          font-weight: 600;
          flex: 1;
          min-width: 60px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .plug-indicator { display: flex; align-items: center; gap: 5px; margin-left: auto; }
        .indicator-dot { width: 7px; height: 7px; border-radius: 50%; }
        .indicator-text { font-size: 11px; font-weight: 500; }
        .plug-indicator-light { display: flex; align-items: center; gap: 4px; margin-left: 8px; }
        .indicator-light-icon { font-size: 14px; }
        .indicator-light-value { font-size: 12px; font-weight: 600; color: #f59e0b; }

        .plug-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
        .metric-item {
          background: var(--card-background-color, #fff);
          border-radius: 10px;
          padding: 12px 8px;
          text-align: center;
          box-shadow: var(--ha-card-box-shadow, 0 1px 3px rgba(0,0,0,0.05));
          min-width: 0;
        }
        .metric-icon { font-size: 16px; display: block; margin-bottom: 4px; }
        .metric-value { font-size: 15px; font-weight: 700; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .metric-label { font-size: 10px; color: ${secondary_color}; display: block; margin-top: 2px; }

        .plug-energy { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .energy-item {
          background: var(--card-background-color, #fff);
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--ha-card-box-shadow, 0 1px 3px rgba(0,0,0,0.05));
          min-width: 0;
        }
        .energy-label { font-size: 12px; color: ${secondary_color}; }
        .energy-value { font-size: 14px; font-weight: 700; color: var(--primary-color, #7c3aed); }

        .empty-state { padding: 40px 20px; text-align: center; color: ${secondary_color}; font-size: 14px; }

        .card-footer { padding: 12px 20px 18px; border-top: 1px solid var(--divider-color, #f1f5f9); margin-top: auto; }
        .update-info { display: flex; align-items: center; gap: 6px; font-size: 11px; color: ${secondary_color}; }
        .update-dot { width: 6px; height: 6px; background: var(--primary-color, #7c3aed); border-radius: 50%; }
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