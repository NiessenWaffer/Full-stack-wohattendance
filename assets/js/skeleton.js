/**
 * Skeleton Loader Utilities
 * Better loading states for improved UX
 */

const SkeletonLoader = {
  /**
   * Show skeleton loader in a container
   * @param {string|HTMLElement} container - Container selector or element
   * @param {string} type - Type of skeleton (card, text, table, chart)
   * @param {number} count - Number of skeleton items
   */
  show(container, type = 'card', count = 1) {
    const element = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!element) return;
    
    const skeletons = {
      card: this.createCardSkeleton,
      text: this.createTextSkeleton,
      table: this.createTableSkeleton,
      chart: this.createChartSkeleton,
      kpi: this.createKpiSkeleton
    };
    
    const createFn = skeletons[type] || skeletons.card;
    const html = Array(count).fill(0).map(() => createFn()).join('');
    
    element.innerHTML = html;
  },
  
  /**
   * Hide skeleton and show content
   * @param {string|HTMLElement} container - Container selector or element
   * @param {string} content - HTML content to display
   */
  hide(container, content = '') {
    const element = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!element) return;
    
    element.innerHTML = content;
  },
  
  createCardSkeleton() {
    return `
      <div class="skeleton skeleton-card"></div>
    `;
  },
  
  createTextSkeleton() {
    return `
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
    `;
  },
  
  createTableSkeleton() {
    return `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${Array(5).fill(0).map(() => `
          <div style="display: flex; gap: 12px;">
            <div class="skeleton skeleton-text" style="flex: 2;"></div>
            <div class="skeleton skeleton-text" style="flex: 1;"></div>
            <div class="skeleton skeleton-text" style="flex: 1;"></div>
          </div>
        `).join('')}
      </div>
    `;
  },
  
  createChartSkeleton() {
    return `
      <div style="display: flex; align-items: flex-end; gap: 8px; height: 200px; padding: 20px;">
        ${Array(7).fill(0).map((_, i) => {
          const height = 40 + Math.random() * 60;
          return `<div class="skeleton" style="flex: 1; height: ${height}%;"></div>`;
        }).join('')}
      </div>
    `;
  },
  
  createKpiSkeleton() {
    return `
      <div style="padding: 20px;">
        <div class="skeleton skeleton-text" style="width: 60%; margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-text" style="width: 40%; height: 32px; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-text" style="width: 80%;"></div>
      </div>
    `;
  },
  
  /**
   * Wrap async function with skeleton loader
   * @param {Function} asyncFn - Async function to execute
   * @param {string|HTMLElement} container - Container for skeleton
   * @param {string} type - Skeleton type
   */
  async wrap(asyncFn, container, type = 'card') {
    this.show(container, type);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      // Content will be set by the async function
    }
  }
};

// Make globally available
window.SkeletonLoader = SkeletonLoader;
