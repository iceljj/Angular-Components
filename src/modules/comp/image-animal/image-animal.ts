import {Component, ElementRef, OnDestroy, AfterViewInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {FXAAShader} from 'three/addons/shaders/FXAAShader.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';

@Component({
  selector: 'app-image-animal',
  imports: [CommonModule],
  templateUrl: './image-animal.html',
  styleUrls: ['./image-animal.scss']
})
export class ImageAnimal implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer') private canvasContainer!: ElementRef<HTMLDivElement>;

  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private loader: GLTFLoader = new GLTFLoader();
  private animationId!: number;
  private composer!: EffectComposer;

  ngAfterViewInit(): void {
    this.initScene();
    this.loadModel();
    this.animate();
    window.addEventListener('resize', this.onWindowResize);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
    this.composer?.dispose();
    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          object.material?.dispose();
        }
      }
    });
  }

  private initScene(): void {
    // 获取设备像素比（限制最大值保护性能）
    const pixelRatioD: any = Math.min(window.devicePixelRatio, 3);

    // 初始化渲染器（关键参数优化）
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
      precision: "highp",
      logarithmicDepthBuffer: true // 启用对数深度缓冲解决远距离精度问题[1](@ref)
    });

    // 精确设置渲染尺寸
    const width = this.canvasContainer.nativeElement.clientWidth;
    const height = this.canvasContainer.nativeElement.clientHeight;
    this.renderer.setPixelRatio(pixelRatioD);
    this.renderer.setSize(300, 300, false);

    // 颜色空间优化
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.canvasContainer.nativeElement.appendChild(this.renderer.domElement);
    console.log(this.renderer.domElement)

    // 设置相机位置（临时位置，模型加载后会重新设置）
    this.camera.position.set(0, 1, 10);
    this.scene.add(this.camera);

    // 光源优化
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(2, 3, 1);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // 添加轨道控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // 初始化后处理链
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = this.renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.set(
      1 / (width * pixelRatio),
      1 / (height * pixelRatio)
    );
    this.composer.addPass(fxaaPass);
  }

  private loadModel(): void {
    this.loader.load('assets/scene.gltf',
      (gltf: any) => {
        const model = gltf.scene;
        this.scene.add(model);

        // 1. 计算模型边界框和中心点
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3(0, 0, 0);
        box.getCenter(center); // 获取模型几何中心[6](@ref)
        // 2. 计算模型尺寸并确定缩放比例
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1 / maxDim; // 按比例缩放模型
        model.scale.set(scale, scale, scale);

        // 3. 移动模型到世界原点 (0,0,0)
        model.position.sub(center.multiplyScalar(scale));

        // 4. 设置相机位置（关键修改：视角上移）
        const cameraDistance = maxDim * scale * 0.3; // 动态计算距离
        // 相机位置设置：X=0（水平居中），Y=1.5（向上偏移1.5单位），Z=cameraDistance（保持距离）
        this.camera.position.set(0, 0.4, cameraDistance);

        // 5. 更新轨道控制器目标点
        this.controls.target.set(0, this.camera.position.y, 0);
        this.controls.update(); // 强制刷新控制器状态[8](@ref)

        // 6. 材质优化与精度提升
        model.traverse((child: any) => {
          if (child.isMesh) {
            // 材质物理属性优化
            child.material.metalness = 0;
            child.material.roughness = 0;

            // 精度提升设置
            if (child.material.map) {
              // 启用各向异性过滤（提升纹理精度）
              child.material.map.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
              // 设置高质量纹理过滤
              child.material.map.minFilter = THREE.LinearMipMapLinearFilter; // 三线性过滤提升远距离质量
              child.material.map.magFilter = THREE.LinearFilter; // 线性过滤提升近距离质量
              // 生成mipmap链（提升远距离渲染精度）
              child.material.map.generateMipmaps = true;
            }

            // 启用高精度渲染模式
            child.material.precision = "highp"; // 使用高精度着色器[4](@ref)

            // 增加几何体细节（提升模型精度）
            if (child.geometry) {
              child.geometry.computeVertexNormals(); // 重新计算法线
              child.geometry.normalizeNormals(); // 规范化法线向量
            }
          }
        });

        // 7. 添加轮廓增强（提升视觉清晰度）
        const edgesGeometry = new THREE.EdgesGeometry(model.geometry, 15); // 增加角度阈值保留更多细节
        const edgesMaterial = new THREE.LineBasicMaterial({
          color: 0x000000,
          linewidth: 1
        });
        const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        model.add(wireframe);
      },
      undefined,
      (error: any) => console.error('GLTF加载失败:', error)
    );
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.composer.render();
  };

  private onWindowResize = (): void => {
    const width = this.canvasContainer.nativeElement.clientWidth;
    const height = this.canvasContainer.nativeElement.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, 4);
    const fxaaPass = this.composer.passes[1] as ShaderPass;

    // 相机和渲染器同步更新
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);

    // 更新后处理器
    this.composer.setSize(width * pixelRatio, height * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.set(
      1 / (width * pixelRatio),
      1 / (height * pixelRatio)
    );
  };
}
