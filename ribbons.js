class RibbonEffect {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      count: 5,
      colors: ['#FC8EAC', '#FFD1DC', '#FFB6C1', '#FF69B4', '#DB7093'],
      maxAge: 1000,
      speed: 0.5,
      ...options
    };
    
    this.ribbons = [];
    this.mouse = { x: 0, y: 0 };
    this.resizeTimeout = null;
    
    this.init();
  }
  
  init() {
    // Create container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'ribbon-container';
      document.body.appendChild(this.container);
    } else {
      this.container.classList.add('ribbon-container');
    }
    
    // Create ribbons
    for (let i = 0; i < this.options.count; i++) {
      this.createRibbon(i);
    }
    
    // Set up event listeners
    this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Start animation
    this.animate();
  }
  
  createRibbon(index) {
    const ribbon = document.createElement('div');
    ribbon.className = 'ribbon';
    
    // Random position and size
    const size = 100 + Math.random() * 100;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const rotation = Math.random() * 360;
    
    // Random color from options
    const color = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
    
    // Set initial styles
    Object.assign(ribbon.style, {
      width: `${size}px`,
      height: `${size}px`,
      left: `${x}%`,
      top: `${y}%`,
      transform: `rotate(${rotation}deg) scale(1)`,
      background: `linear-gradient(45deg, ${color}, ${this.lightenColor(color, 20)})`,
      opacity: 0.1 + Math.random() * 0.3,
      filter: `blur(${15 + Math.random() * 20}px)`
    });
    
    // Add to container
    this.container.appendChild(ribbon);
    
    // Store ribbon data
    this.ribbons.push({
      element: ribbon,
      x: x,
      y: y,
      rotation: rotation,
      targetX: x,
      targetY: y,
      targetRotation: rotation,
      vx: 0,
      vy: 0,
      vr: 0,
      size: size,
      color: color,
      age: 0,
      maxAge: this.options.maxAge * (0.5 + Math.random() * 0.5)
    });
  }
  
  handleMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 100;
    this.mouse.y = ((e.clientY - rect.top) / rect.height) * 100;
  }
  
  handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      this.mouse.y = ((e.touches[0].clientY - rect.top) / rect.height) * 100;
    }
  }
  
  handleResize() {
    // Debounce resize
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.ribbons.forEach(ribbon => {
        this.updateRibbonPosition(ribbon);
      });
    }, 100);
  }
  
  updateRibbonPosition(ribbon) {
    // Random movement with some mouse influence
    const mouseInfluence = 0.1 + (Math.random() * 0.2);
    const randomInfluence = 0.05;
    
    // Update target position with some randomness and mouse influence
    ribbon.targetX += (Math.random() - 0.5) * randomInfluence * 100;
    ribbon.targetY += (Math.random() - 0.5) * randomInfluence * 100;
    
    // Add mouse influence
    ribbon.targetX += (this.mouse.x - ribbon.targetX) * mouseInfluence;
    ribbon.targetY += (this.mouse.y - ribbon.targetY) * mouseInfluence;
    
    // Keep within bounds
    ribbon.targetX = Math.max(0, Math.min(100, ribbon.targetX));
    ribbon.targetY = Math.max(0, Math.min(100, ribbon.targetY));
    
    // Random rotation
    ribbon.targetRotation += (Math.random() - 0.5) * 2;
  }
  
  animate() {
    const now = Date.now();
    const deltaTime = Math.min(1000 / 60, now - (this.lastTime || now));
    this.lastTime = now;
    
    this.ribbons.forEach((ribbon, index) => {
      // Age the ribbon
      ribbon.age += deltaTime;
      
      // Reset ribbon if it's too old
      if (ribbon.age > ribbon.maxAge) {
        this.resetRibbon(ribbon);
        return;
      }
      
      // Update target position occasionally
      if (Math.random() < 0.02) {
        this.updateRibbonPosition(ribbon);
      }
      
      // Smooth movement using velocity
      const spring = 0.05;
      const friction = 0.9;
      
      // Update velocity
      ribbon.vx += (ribbon.targetX - ribbon.x) * spring;
      ribbon.vy += (ribbon.targetY - ribbon.y) * spring;
      ribbon.vr += (ribbon.targetRotation - ribbon.rotation) * spring * 0.1;
      
      // Apply friction
      ribbon.vx *= friction;
      ribbon.vy *= friction;
      ribbon.vr *= friction * 0.9;
      
      // Update position
      ribbon.x += ribbon.vx * this.options.speed;
      ribbon.y += ribbon.vy * this.options.speed;
      ribbon.rotation += ribbon.vr * this.options.speed;
      
      // Apply easing to size based on age
      const ageProgress = ribbon.age / ribbon.maxAge;
      const sizeScale = 0.5 + 0.5 * Math.sin(ageProgress * Math.PI);
      
      // Update element styles
      Object.assign(ribbon.element.style, {
        left: `calc(${ribbon.x}% - ${ribbon.size * sizeScale * 0.5}px)`,
        top: `calc(${ribbon.y}% - ${ribbon.size * sizeScale * 0.5}px)`,
        transform: `rotate(${ribbon.rotation}deg) scale(${sizeScale})`,
        opacity: 0.1 + (0.3 * Math.sin(ageProgress * Math.PI))
      });
    });
    
    requestAnimationFrame(this.animate.bind(this));
  }
  
  resetRibbon(ribbon) {
    // Reset to random position
    ribbon.x = Math.random() * 100;
    ribbon.y = Math.random() * 100;
    ribbon.rotation = Math.random() * 360;
    ribbon.targetX = ribbon.x;
    ribbon.targetY = ribbon.y;
    ribbon.targetRotation = ribbon.rotation;
    ribbon.vx = 0;
    ribbon.vy = 0;
    ribbon.vr = 0;
    ribbon.age = 0;
    
    // Randomize color
    ribbon.color = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
    ribbon.element.style.background = `linear-gradient(45deg, ${ribbon.color}, ${this.lightenColor(ribbon.color, 20)})`;
  }
  
  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)}`;
  }
  
  destroy() {
    // Clean up event listeners
    this.container.removeEventListener('mousemove', this.handleMouseMove);
    this.container.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('resize', this.handleResize);
    
    // Remove all ribbons
    this.ribbons.forEach(ribbon => {
      if (ribbon.element.parentNode) {
        ribbon.element.parentNode.removeChild(ribbon.element);
      }
    });
    
    this.ribbons = [];
  }
}

// Initialize the effect when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.ribbonEffect = new RibbonEffect(document.querySelector('.ribbon-container'), {
    count: 8,
    colors: ['#FC8EAC', '#FFD1DC', '#FFB6C1', '#FF69B4', '#DB7093'],
    maxAge: 10000,
    speed: 0.8
  });
});
