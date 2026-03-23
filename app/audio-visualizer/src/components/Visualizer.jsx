/**
 * Visualizer.jsx - WebGL 粒子爆炸视觉层
 *
 * 使用原生 WebGL 实现高性能粒子系统
 * 粒子响应音频能量，从中心爆炸扩散
 */

import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

// 顶点着色器
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute float a_size;
  attribute vec3 a_color;
  attribute float a_alpha;

  varying vec3 v_color;
  varying float v_alpha;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    gl_PointSize = a_size;
    v_color = a_color;
    v_alpha = a_alpha;
  }
`;

// 片段着色器 - 渲染圆形粒子
const fragmentShaderSource = `
  precision mediump float;

  varying vec3 v_color;
  varying float v_alpha;

  void main() {
    // 计算到中心的距离（0.5 是点的一半）
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    // 裁剪成圆形，边缘柔化
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    alpha *= v_alpha;

    gl_FragColor = vec4(v_color, alpha);
  }
`;

// 粒子类
class Particle {
  constructor(x, y, vx, vy, life, size, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.color = color;
  }

  update(gravityX, gravityY, dt) {
    this.vx += gravityX * dt;
    this.vy += gravityY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    return this.life > 0;
  }
}

// 使用 forwardRef 暴露 canvas ref
export const Visualizer = forwardRef(({ analyser }, ref) => {
  const internalCanvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 暴露 canvas 给父组件（用于截图）
  useImperativeHandle(ref, () => internalCanvasRef.current);

  // 鼠标移动事件
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 使用 ref 来存储鼠标位置，避免在 WebGL effect 依赖中包含 state
  const mousePosRef = useRef(mousePos);
  useEffect(() => {
    mousePosRef.current = mousePos;
  }, [mousePos]);

  useEffect(() => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;

    // 初始化 WebGL
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      console.error('[Visualizer] WebGL not supported');
      return;
    }

    // 编译着色器
    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('[Visualizer] Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    // 创建程序
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[Visualizer] Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // 获取属性位置
    const positionLoc = gl.getAttribLocation(program, 'a_position');
    const sizeLoc = gl.getAttribLocation(program, 'a_size');
    const colorLoc = gl.getAttribLocation(program, 'a_color');
    const alphaLoc = gl.getAttribLocation(program, 'a_alpha');

    // 创建缓冲区
    const positionBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    const alphaBuffer = gl.createBuffer();

    // 粒子系统配置
    const MAX_PARTICLES = 2000;
    const particles = [];
    const floatArray = new Float32Array(MAX_PARTICLES * 2);  // x, y
    const sizeArray = new Float32Array(MAX_PARTICLES);
    const colorArray = new Float32Array(MAX_PARTICLES * 3);  // r, g, b
    const alphaArray = new Float32Array(MAX_PARTICLES);

    // 引力中心（默认在屏幕中心）
    let gravityX = 0;
    let gravityY = 0;

    // 音频能量计算
    let energy = 0;
    let targetEnergy = 0;

    // 设置 canvas 尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 生成随机数
    const random = (min, max) => Math.random() * (max - min) + min;

    // 生成粒子颜色（基于能量）
    const getParticleColor = (lifeRatio, energy) => {
      // 生命初期：亮白
      // 生命中期：彩色（基于能量变化）
      // 生命末期：暗淡
      if (lifeRatio > 0.8) {
        // 亮白
        return [1, 1, 1];
      } else if (lifeRatio > 0.4) {
        // 彩色 - 能量越高越偏暖色
        const hue = 0.6 - energy * 0.4; // 0.6(蓝) -> 0.2(橙红)
        return hslToRgb(hue, 0.8, 0.6 + energy * 0.2);
      } else {
        // 渐暗
        const brightness = lifeRatio * 1.5;
        return [brightness * 0.5, brightness * 0.3, brightness * 0.8];
      }
    };

    // HSL 转 RGB
    const hslToRgb = (h, s, l) => {
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return [r, g, b];
    };

    // 生成新粒子
    const spawnParticles = (count, energy) => {
      for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
        // 从中心向外爆炸
        const angle = random(0, Math.PI * 2);
        const speed = random(0.3, 0.8) * (1 + energy * 2);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const life = random(0.5, 1.5);
        const size = random(3, 8) * (1 + energy);
        const color = [1, 1, 1]; // 初始白色

        particles.push(new Particle(0, 0, vx, vy, life, size, color));
      }
    };

    // 主渲染循环
    let lastTime = performance.now();
    let spawnTimer = 0;

    const render = (currentTime) => {
      requestAnimationFrame(render);

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1); // 限制最大 dt
      lastTime = currentTime;

      // 读取音频能量
      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // 计算低频能量（0-10 段）
        let bassSum = 0;
        const bassBins = Math.min(10, bufferLength);
        for (let i = 0; i < bassBins; i++) {
          bassSum += dataArray[i];
        }
        targetEnergy = (bassSum / bassBins / 255) * 3; // 放大能量值
      } else {
        targetEnergy = 0.1; // 待机状态下的基础能量
      }

      // 能量平滑过渡
      energy += (targetEnergy - energy) * 0.1;

      // 更新引力中心（跟随鼠标，带平滑）
      const currentMousePos = mousePosRef.current;
      const targetGravityX = currentMousePos.x * 0.5;
      const targetGravityY = currentMousePos.y * 0.5;
      gravityX += (targetGravityX - gravityX) * 0.05;
      gravityY += (targetGravityY - gravityY) * 0.05;

      // 生成新粒子（基于能量）
      spawnTimer += dt;
      const spawnRate = 0.02 / (1 + energy * 2); // 能量越高生成越快
      while (spawnTimer > spawnRate && particles.length < MAX_PARTICLES) {
        spawnParticles(Math.ceil(1 + energy * 3), energy);
        spawnTimer -= spawnRate;
      }

      // 更新粒子
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p.update(gravityX, gravityY, dt * 60)) {
          particles.splice(i, 1);
        }
      }

      // 更新缓冲区数据
      let particleIndex = 0;
      for (const p of particles) {
        const lifeRatio = p.life / p.maxLife;
        const color = getParticleColor(lifeRatio, energy);
        const alpha = Math.min(lifeRatio * 1.5, 1);

        floatArray[particleIndex * 2] = p.x;
        floatArray[particleIndex * 2 + 1] = p.y;
        sizeArray[particleIndex] = p.size * (0.5 + lifeRatio * 0.5);
        colorArray[particleIndex * 3] = color[0];
        colorArray[particleIndex * 3 + 1] = color[1];
        colorArray[particleIndex * 3 + 2] = color[2];
        alphaArray[particleIndex] = alpha;

        particleIndex++;
      }

      // 清空画布
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // 启用混合（半透明效果）
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      if (particleIndex > 0) {
        // 更新位置缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, floatArray.subarray(0, particleIndex * 2), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        // 更新大小缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeArray.subarray(0, particleIndex), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(sizeLoc);
        gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, 0, 0);

        // 更新颜色缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colorArray.subarray(0, particleIndex * 3), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);

        // 更新透明度缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, alphaArray.subarray(0, particleIndex), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(alphaLoc);
        gl.vertexAttribPointer(alphaLoc, 1, gl.FLOAT, false, 0, 0);

        // 绘制粒子
        gl.drawArrays(gl.POINTS, 0, particleIndex);
      }
    };

    render(performance.now());

    // 清理
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(sizeBuffer);
      gl.deleteBuffer(colorBuffer);
      gl.deleteBuffer(alphaBuffer);
    };
  }, [analyser]);

  return (
    <canvas
      ref={internalCanvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: -1 }}
    />
  );
});

Visualizer.displayName = 'Visualizer';
