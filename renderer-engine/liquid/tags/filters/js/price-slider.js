/**
 * Manejador del slider de precios con formateo de moneda
 */
export class PriceSlider {
  constructor(container, cssClass) {
    this.container = container;
    this.cssClass = cssClass;
    this.slider = null;
    this.leftHandle = null;
    this.rightHandle = null;
    this.progress = null;
    this.minInput = null;
    this.maxInput = null;
    this.minDisplay = null;
    this.maxDisplay = null;
    this.isDragging = false;
    this.activeHandle = null;
    this.minValue = 0;
    this.maxValue = 1000;
    this.currentMin = 0;
    this.currentMax = 1000;
  }

  /**
   * Inicializa el slider de precios
   */
  init() {
    this.findElements();
    if (!this.slider) return;

    this.setupEventListeners();
    this.updateDisplay();
    this.updateProgress();
    this.updatePlaceholders();
  }

  /**
   * Encuentra los elementos del slider
   */
  findElements() {
    this.slider = this.container.querySelector(`.${this.cssClass}__price-range-slider`);
    if (!this.slider) return;

    this.leftHandle = this.slider.querySelector(`.${this.cssClass}__price-range-handle--left`);
    this.rightHandle = this.slider.querySelector(`.${this.cssClass}__price-range-handle--right`);
    this.progress = this.slider.querySelector(`.${this.cssClass}__price-range-progress`);
    this.minInput = this.container.querySelector('[data-filter="price-min"]');
    this.maxInput = this.container.querySelector('[data-filter="price-max"]');
    this.minDisplay = this.container.querySelector('[data-price-display="min"]');
    this.maxDisplay = this.container.querySelector('[data-price-display="max"]');

    // Obtener valores iniciales
    if (this.slider.dataset.min) {
      this.minValue = parseInt(this.slider.dataset.min);
      this.currentMin = this.minValue;
    }
    if (this.slider.dataset.max) {
      this.maxValue = parseInt(this.slider.dataset.max);
      this.currentMax = this.maxValue;
    }
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    if (!this.leftHandle || !this.rightHandle) return;

    // Event listeners para los handles
    this.leftHandle.addEventListener('mousedown', (e) => this.startDragging(e, 'left'));
    this.rightHandle.addEventListener('mousedown', (e) => this.startDragging(e, 'right'));

    // Event listeners para los inputs
    if (this.minInput) {
      this.minInput.addEventListener('input', (e) => this.handleInputChange(e, 'min'));
      this.minInput.addEventListener('change', (e) => this.handleInputChange(e, 'min'));
    }
    if (this.maxInput) {
      this.maxInput.addEventListener('input', (e) => this.handleInputChange(e, 'max'));
      this.maxInput.addEventListener('change', (e) => this.handleInputChange(e, 'max'));
    }

    // Event listeners globales
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mouseup', () => this.stopDragging());
  }

  /**
   * Inicia el arrastre de un handle
   */
  startDragging(e, handle) {
    e.preventDefault();
    this.isDragging = true;
    this.activeHandle = handle;
    this.leftHandle.style.cursor = 'grabbing';
    this.rightHandle.style.cursor = 'grabbing';
  }

  /**
   * Maneja el movimiento del mouse durante el arrastre
   */
  handleMouseMove(e) {
    if (!this.isDragging || !this.activeHandle) return;

    const rect = this.slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const value = Math.round((percentage / 100) * (this.maxValue - this.minValue) + this.minValue);

    // Solo actualizar visualmente durante el arrastre, no disparar eventos
    if (this.activeHandle === 'left') {
      this.updateHandlePosition('left', Math.min(value, this.currentMax - 10));
      this.updateProgress();
    } else {
      this.updateHandlePosition('right', Math.max(value, this.currentMin + 10));
      this.updateProgress();
    }
  }

  /**
   * Detiene el arrastre
   */
  stopDragging() {
    if (!this.isDragging) return;

    // Aplicar el valor final cuando se suelta el handle
    if (this.activeHandle === 'left') {
      const finalValue = Math.min(parseInt(this.leftHandle.dataset.value) || this.currentMin, this.currentMax - 10);
      this.setMinValue(finalValue);
    } else if (this.activeHandle === 'right') {
      const finalValue = Math.max(parseInt(this.rightHandle.dataset.value) || this.currentMax, this.currentMin + 10);
      this.setMaxValue(finalValue);
    }

    this.isDragging = false;
    this.activeHandle = null;
    this.leftHandle.style.cursor = 'grab';
    this.rightHandle.style.cursor = 'grab';

    // Disparar evento solo al final del arrastre
    this.updateDisplay();
    this.triggerChangeEvent();
  }

  /**
   * Maneja cambios en los inputs
   */
  handleInputChange(e, type) {
    // Convertir el valor formateado de vuelta a número
    let value = e.target.value;

    // Remover caracteres de formato (símbolos de moneda, comas, puntos)
    value = value.replace(/[^\d]/g, '');
    value = parseInt(value) || 0;

    if (type === 'min') {
      this.setMinValue(Math.min(value, this.currentMax - 10));
    } else {
      this.setMaxValue(Math.max(value, this.currentMin + 10));
    }

    this.updateProgress();
    this.updateDisplay();
    this.triggerChangeEvent();
  }

  /**
   * Establece el valor mínimo
   */
  setMinValue(value) {
    this.currentMin = Math.max(this.minValue, Math.min(value, this.currentMax - 10));
    if (this.minInput) {
      this.minInput.value = this.formatMoney(this.currentMin);
    }
    this.updateHandlePosition('left', this.currentMin);
  }

  /**
   * Establece el valor máximo
   */
  setMaxValue(value) {
    this.currentMax = Math.min(this.maxValue, Math.max(value, this.currentMin + 10));
    if (this.maxInput) {
      this.maxInput.value = this.formatMoney(this.currentMax);
    }
    this.updateHandlePosition('right', this.currentMax);
  }

  /**
   * Actualiza la posición de un handle
   */
  updateHandlePosition(handle, value) {
    const percentage = ((value - this.minValue) / (this.maxValue - this.minValue)) * 100;
    const handleElement = handle === 'left' ? this.leftHandle : this.rightHandle;

    if (handleElement) {
      handleElement.style.left = `${percentage}%`;
      handleElement.dataset.value = value;
    }
  }

  /**
   * Actualiza la barra de progreso
   */
  updateProgress() {
    if (!this.progress) return;

    const minPercentage = ((this.currentMin - this.minValue) / (this.maxValue - this.minValue)) * 100;
    const maxPercentage = ((this.currentMax - this.minValue) / (this.maxValue - this.minValue)) * 100;

    this.progress.style.left = `${minPercentage}%`;
    this.progress.style.width = `${maxPercentage - minPercentage}%`;
  }

  /**
   * Actualiza las displays de precio
   */
  updateDisplay() {
    if (this.minDisplay) {
      this.minDisplay.textContent = this.formatMoney(this.currentMin);
    }
    if (this.maxDisplay) {
      this.maxDisplay.textContent = this.formatMoney(this.currentMax);
    }

    // También actualizar los inputs con valores formateados
    if (this.minInput) {
      this.minInput.value = this.formatMoney(this.currentMin);
    }
    if (this.maxInput) {
      this.maxInput.value = this.formatMoney(this.currentMax);
    }
  }

  /**
   * Formatea el precio usando la función global
   */
  formatMoney(amount) {
    if (!amount) return '';
    return window.formatMoney ? window.formatMoney(amount) : amount.toString();
  }

  /**
   * Actualiza los placeholders formateados
   */
  updatePlaceholders() {
    if (this.minInput && this.minInput.dataset.placeholderFormatted) {
      const rawValue = this.minInput.dataset.placeholderFormatted;
      this.minInput.placeholder = this.formatMoney(parseInt(rawValue));
    }
    if (this.maxInput && this.maxInput.dataset.placeholderFormatted) {
      const rawValue = this.maxInput.dataset.placeholderFormatted;
      this.maxInput.placeholder = this.formatMoney(parseInt(rawValue));
    }
  }

  /**
   * Dispara el evento de cambio
   */
  triggerChangeEvent() {
    const event = new CustomEvent('priceRange:changed', {
      detail: {
        min: this.currentMin,
        max: this.currentMax,
      },
    });
    this.container.dispatchEvent(event);
  }

  /**
   * Obtiene los valores actuales
   */
  getValues() {
    return {
      min: this.currentMin,
      max: this.currentMax,
    };
  }

  /**
   * Establece los valores
   */
  setValues(min, max) {
    this.setMinValue(min);
    this.setMaxValue(max);
    this.updateProgress();
    this.updateDisplay();
  }
}
