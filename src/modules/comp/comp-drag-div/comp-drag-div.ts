import {Component, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

interface Position
{
  x: number;
  y: number;
}

interface Node
{
  title: string;
  content: string;
  position: Position;
}

interface Connection
{
  sourceIndex: number;
  sourcePosition: Position;
  targetIndex: number;
  targetPosition: Position;
  sourceEndpoint: string;
  targetEndpoint: string;
}

@Component({
  selector: 'app-comp-drag-div',
  imports: [FormsModule, CommonModule],
  templateUrl: './comp-drag-div.html',
  styleUrl: './comp-drag-div.scss'
})
export class CompDragDiv implements AfterViewInit
{
  @ViewChild('editorContainer') editorContainer!: ElementRef;
  @ViewChild('zoomContainer') zoomContainer!: ElementRef;

  // 节点相关
  nodes: Node[] = [];
  selectedNode: number | null = null;

  // 连接相关
  connections: Connection[] = [];
  isDrawingConnection = false;
  tempConnectionStart: Position = {x: 0, y: 0};
  tempConnectionEnd: Position = {x: 0, y: 0};
  draggingEndpoint: { nodeIndex: number, endpoint: string } | null = null;

  // 缩放和平移相关
  zoomLevel = 1;
  minZoom = 0.5;
  maxZoom = 2;
  panOffset = {x: 0, y: 0};

  // 拖拽相关
  draggingNodeIndex: number | null = null;
  dragStart = {x: 0, y: 0, offsetX: 0, offsetY: 0};

  constructor()
  {
  }

  ngAfterViewInit()
  {
    this.addNode(); // 添加初始节点
  }

  addNode()
  {
    const newNode: Node = <Node>{
      title: `Node ${this.nodes.length + 1}`,
      position: {
        x: 100 + this.nodes.length * 30,
        y: 100 + this.nodes.length * 30
      }
    };
    this.nodes.push(newNode);
    this.selectedNode = this.nodes.length - 1;
  }

  // 节点选择和拖拽
  onNodeMouseDown(event: MouseEvent,
                  nodeIndex: number)
  {
    event.preventDefault();

    if (event.shiftKey || event.ctrlKey)
    {
      // 多选或切换选择
      if (this.selectedNode === nodeIndex)
      {
        this.selectedNode = null;
      } else
      {
        this.selectedNode = nodeIndex;
      }
      return;
    }

    // 单选
    this.selectedNode = nodeIndex;

    // 开始拖拽
    this.draggingNodeIndex = nodeIndex;

    // 获取当前鼠标位置
    const containerRect = this.zoomContainer.nativeElement.getBoundingClientRect();
    const nodeElement = document.getElementById(`node-${nodeIndex}`);
    const nodeRect = nodeElement?.getBoundingClientRect() || {left: 0, top: 0};

    // 计算偏移量（鼠标点击位置相对于节点左上角）
    this.dragStart.offsetX = (event.clientX - containerRect.left - this.panOffset.x) / this.zoomLevel - this.nodes[nodeIndex].position.x;
    this.dragStart.offsetY = (event.clientY - containerRect.top - this.panOffset.y) / this.zoomLevel - this.nodes[nodeIndex].position.y;

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  // 鼠标移动处理（节点拖拽）
  onMouseMove = (event: MouseEvent) =>
  {
    if (this.draggingNodeIndex === null) return;

    event.preventDefault();

    // 获取容器位置信息
    const containerRect = this.zoomContainer.nativeElement.getBoundingClientRect();

    // 计算新位置（考虑缩放）
    const newX = (event.clientX - containerRect.left - this.panOffset.x) / this.zoomLevel - this.dragStart.offsetX;
    const newY = (event.clientY - containerRect.top - this.panOffset.y) / this.zoomLevel - this.dragStart.offsetY;

    // 更新节点位置
    this.nodes[this.draggingNodeIndex].position = {x: newX, y: newY};
  }

  // 鼠标释放处理（节点拖拽）
  onMouseUp = (event: MouseEvent) =>
  {
    this.draggingNodeIndex = null;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  // 端点连接
  onEndpointMouseDown(event: MouseEvent,
                      nodeIndex: number,
                      endpoint: string)
  {
    event.preventDefault();

    // 获取端点位置
    const targetElement = event.target as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    this.isDrawingConnection = true;
    this.draggingEndpoint = {nodeIndex, endpoint};
    this.tempConnectionStart = {x: centerX, y: centerY};
    this.tempConnectionEnd = {x: centerX, y: centerY};

    document.addEventListener('mousemove', this.onConnectionMouseMove);
    document.addEventListener('mouseup', this.onConnectionMouseUp);
  }

  // 连线鼠标移动处理
  onConnectionMouseMove = (event: MouseEvent) =>
  {
    if (!this.draggingEndpoint) return;

    // 更新临时连接终点位置
    this.tempConnectionEnd = {
      x: event.clientX,
      y: event.clientY
    };

    // 自动检测是否接近其他端点
    this.checkEndpointProximity(event.clientX, event.clientY);
  }

  // 连线鼠标释放处理
  onConnectionMouseUp(event: MouseEvent)
  {
    if (!this.draggingEndpoint || !this.isDrawingConnection) return;

    // 尝试找到目标端点
    const target = this.findConnectedEndpoint(event.clientX, event.clientY);

    // 如果找到了有效的目标端点，则创建连接
    if (target && target.nodeIndex !== this.draggingEndpoint.nodeIndex)
    {
      // 获取两个端点的实际位置
      const sourcePos = this.getEndpointAbsolutePosition(this.draggingEndpoint.nodeIndex, this.draggingEndpoint.endpoint);
      const targetPos = this.getEndpointAbsolutePosition(target.nodeIndex, <string>target.endpoint);

      this.connections.push(<Connection>{
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        sourceEndpoint: this.draggingEndpoint.endpoint,
        targetEndpoint: target.endpoint
      });

      console.log('当前连接列表:', this.connections); // 验证是否真的添加了
    }

    this.isDrawingConnection = false;
    this.draggingEndpoint = null;
    document.removeEventListener('mousemove', this.onConnectionMouseMove);
    document.removeEventListener('mouseup', this.onConnectionMouseUp);
  }

  // 检查端点接近度
  checkEndpointProximity(mouseX: number,
                         mouseY: number): boolean
  {
    const elements: any = document.querySelectorAll('.endpoint');

    for (const element of elements)
    {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
      );

      if (distance < 20)
      { // 如果距离小于20像素
        return true;
      }
    }

    return false;
  }

  // 查找连接端点
  findConnectedEndpoint(mouseX: number,
                        mouseY: number): { nodeIndex: number; endpoint: string | null } | null
  {
    const elements: any = document.querySelectorAll('.endpoint');

    for (const element of elements)
    {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
      );

      if (distance < 20)
      { // 如果距离小于20像素
        const nodeId = element.parentElement?.parentElement?.id;
        if (nodeId)
        {
          const nodeIndex = parseInt(nodeId.replace('node-', ''), 10);
          const endpoint = element.classList.item(1); // 获取第二个类名（方向）
          return {nodeIndex, endpoint};
        }
      }
    }

    return null;
  }

  // 获取端点绝对位置（考虑缩放和位移）
  getEndpointAbsolutePosition(nodeIndex: number,
                              endpoint: string): Position
  {
    const nodeElement = document.getElementById(`node-${nodeIndex}`);
    if (!nodeElement) return {x: 0, y: 0};

    const rect = nodeElement.getBoundingClientRect();

    switch (endpoint)
    {
      case 'top':
        return {
          x: rect.left + rect.width / 2,
          y: rect.top
        };
      case 'right':
        return {
          x: rect.right,
          y: rect.top + rect.height / 2
        };
      case 'bottom':
        return {
          x: rect.left + rect.width / 2,
          y: rect.bottom
        };
      case 'left':
        return {
          x: rect.left,
          y: rect.top + rect.height / 2
        };
      default:
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
    }
  }

  // 获取连接线长度
  getConnectionLength(connection: Connection): number
  {
    const dx = connection.targetPosition.x - connection.sourcePosition.x;
    const dy = connection.targetPosition.y - connection.sourcePosition.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // 获取连接线变换
  getConnectionTransform(connection: Connection): string
  {
    const dx = connection.targetPosition.x - connection.sourcePosition.x;
    const dy = connection.targetPosition.y - connection.sourcePosition.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return `rotate(${angle}deg)`;
  }

  // 获取连接线左侧位置
  getConnectionLeft(connection: Connection): number
  {
    return Math.min(connection.sourcePosition.x, connection.targetPosition.x) +
      Math.abs((connection.targetPosition.x - connection.sourcePosition.x) / 2);
  }

  // 获取连接线顶部位置
  getConnectionTop(connection: Connection): number
  {
    return Math.min(connection.sourcePosition.y, connection.targetPosition.y) +
      Math.abs((connection.targetPosition.y - connection.sourcePosition.y) / 2) - 2;
  }

  // 获取临时连接线长度
  getTempConnectionLength(): number
  {
    const dx = this.tempConnectionEnd.x - this.tempConnectionStart.x;
    const dy = this.tempConnectionEnd.y - this.tempConnectionStart.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // 获取临时连接线变换
  getTempConnectionTransform(): string
  {
    const dx = this.tempConnectionEnd.x - this.tempConnectionStart.x;
    const dy = this.tempConnectionEnd.y - this.tempConnectionStart.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return `rotate(${angle}deg)`;
  }

  // 缩放和平移
  onWheel(event: WheelEvent)
  {
    if (event.ctrlKey)
    { // Ctrl + 滚轮 = 缩放
      event.preventDefault();

      const delta = event.deltaY;
      const zoomFactor = delta > 0 ? 0.95 : 1.05; // 减小缩放步长
      const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel * zoomFactor));

      // 计算缩放中心（鼠标位置）
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // 获取容器位置信息
      const containerRect = this.zoomContainer.nativeElement.getBoundingClientRect();

      // 计算新的平移偏移量，使缩放中心保持不变
      const relX = mouseX - containerRect.left;
      const relY = mouseY - containerRect.top;

      const oldScale = this.zoomLevel;
      const newScale = newZoom;

      const deltaX = relX - (relX - this.panOffset.x) * (newScale / oldScale);
      const deltaY = relY - (relY - this.panOffset.y) * (newScale / oldScale);

      this.zoomLevel = newScale;
      this.panOffset = {
        x: deltaX,
        y: deltaY
      };
    } else
    { // 普通滚轮 = 平移（减小移动幅度）
      event.preventDefault();

      const scrollSpeed = 5; // 减小滚动速度
      this.panOffset = {
        x: this.panOffset.x - event.deltaX * scrollSpeed,
        y: this.panOffset.y - event.deltaY * scrollSpeed
      };
    }
  }

  // 编辑器区域点击事件
  onEditorMouseDown(event: MouseEvent)
  {
    // 如果点击在空白处且没有按住Ctrl/Shift，则取消选择
    if (!event.ctrlKey && !event.shiftKey && this.selectedNode !== null)
    {
      this.selectedNode = null;
    }

    // 如果点击并拖动，开始平移
    if (event.button === 1 || (event.button === 0 && event.ctrlKey))
    { // 中键或Ctrl+左键
      this.dragStart = {
        x: event.clientX,
        y: event.clientY,
        offsetX: this.panOffset.x,
        offsetY: this.panOffset.y
      };

      document.addEventListener('mousemove', this.onPanMouseMove);
      document.addEventListener('mouseup', this.onPanMouseUp);
    }
  }

  // 平移鼠标移动处理
  onPanMouseMove = (event: MouseEvent) =>
  {
    if ((event.button === 1 || (event.button === 0 && event.ctrlKey)) &&
      (Math.abs(event.movementX) > 2 || Math.abs(event.movementY) > 2))
    {

      const dx = event.clientX - this.dragStart.x;
      const dy = event.clientY - this.dragStart.y;

      this.panOffset = {
        x: this.dragStart.offsetX + dx,
        y: this.dragStart.offsetY + dy
      };
    }
  }

  // 平移鼠标释放处理
  onPanMouseUp = (event: MouseEvent) =>
  {
    document.removeEventListener('mousemove', this.onPanMouseMove);
    document.removeEventListener('mouseup', this.onPanMouseUp);
  }
  protected readonly Math = Math;
}
