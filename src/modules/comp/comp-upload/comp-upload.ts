// 导入必要的 Angular 模块和装饰器
import {Component, HostListener} from '@angular/core';
import {CommonModule} from '@angular/common';

/**
 * 定义上传状态类型：
 * - pending: 等待上传
 * - uploading: 上传中
 * - paused: 已暂停
 * - success: 上传成功
 * - failed: 上传失败
 * - canceled: 已取消
 */
type UploadStatus = 'pending' | 'uploading' | 'paused' | 'success' | 'failed' | 'canceled';

/**
 * 定义一个上传文件对象接口，用于管理每个文件的状态和进度
 */
interface UploadFile
{
    file: File;            // 原始文件对象
    progress: number;      // 当前上传进度百分比（0-100）
    status: UploadStatus;  // 当前上传状态
    intervalId?: any;      // 存储 setInterval 返回值，用于控制模拟上传的计时器
    retryCount: number;    // 记录重试次数
    maxRetries: number;    // 最大允许重试次数
}

/**
 * Angular 组件定义：app-comp-upload
 */
@Component({
               selector: 'app-comp-upload',           // 使用 <app-comp-upload> 标签调用组件
               standalone: true,                      // 表示这是一个独立组件（不需要 NgModule）
               imports: [CommonModule],              // 引入常用指令模块（如 *ngIf、*ngFor）
               templateUrl: './comp-upload.html',     // HTML 模板路径
               styleUrls: ['./comp-upload.scss']      // SCSS 样式路径
           })
export class CompUpload
{
    currentView: 'list' | 'grid' = 'list';

    setView(view: 'list' | 'grid')
    {
        this.currentView = view;
    }

    /**
     * 所有文件列表，包含所有已添加的文件对象
     */
    files: UploadFile[] = [];

    /**
     * 正在上传的队列（可以是一个引用，也可以是过滤后的数组）
     */
    uploadingQueue: UploadFile[] = [];

    /**
     * 同时上传的最大并发数（最多同时上传3个文件）
     */
    MAX_CONCURRENT_UPLOADS = 3;

    /**
     * 单个文件最大限制为5MB（单位是字节）
     */
    MAX_FILE_SIZE = 5 * 1024 * 1024;

    /**
     * 是否正在拖拽文件到上传区域
     */
    isDragging = false;

    /**
     * 监听 dragover 事件：当用户拖动文件进入组件区域时触发
     */
    @HostListener('dragover', ['$event']) onDragOver(event: DragEvent)
    {
        event.preventDefault();         // 阻止默认行为，允许 drop
        this.isDragging = true;         // 设置为“正在拖拽”状态
    }

    /**
     * 监听 dragleave 事件：当用户将文件拖出组件区域时触发
     */
    @HostListener('dragleave', ['$event']) onDragLeave(event: DragEvent)
    {
        event.preventDefault();         // 阻止默认行为
        this.isDragging = false;        // 设置为“非拖拽”状态
    }

    /**
     * 监听 drop 事件：当用户释放鼠标完成 drop 操作时触发
     */
    @HostListener('drop', ['$event']) onDrop(event: DragEvent)
    {
        event.preventDefault();         // 阻止默认行为
        this.isDragging = false;        // 结束拖拽状态

        const files = event.dataTransfer?.files;  // 获取拖放的文件列表
        if (files && files.length > 0) {
            this.handleFiles(files);                // 处理文件并加入上传列表
        }
    }

    /**
     * 文件选择事件处理函数：当用户通过文件选择框选择文件时触发
     */
    onFileSelected(event: Event): void
    {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.handleFiles(input.files);  // 调用统一处理函数处理选中的文件
        }
    }

    /**
     * 处理传入的文件列表（来自拖拽或文件选择），进行大小检查后加入上传列表
     */
    handleFiles(files: FileList): void
    {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size <= this.MAX_FILE_SIZE) {
                this.files.push({
                                    file,
                                    progress: 0,
                                    status: 'pending',
                                    retryCount: 0,
                                    maxRetries: 3
                                });
            } else {
                alert(`文件 "${file.name}" 超过最大限制 5MB，已被忽略`);
            }
        }
        this.startNextBatch();  // 尝试启动下一批上传任务
    }

    /**
     * 启动下一批次上传任务
     * 控制并发数量，并自动开始上传符合条件的文件
     */
    startNextBatch(): void
    {
        const pendingFiles = this.files.filter(f => f.status === 'pending');  // 获取所有等待上传的文件
        const availableSlots = Math.min(                                    // 取剩余可用上传槽位
                                                                            this.MAX_CONCURRENT_UPLOADS - this.uploadingCount(),             // 当前正在上传的数量
                                                                            pendingFiles.length                                              // 等待上传的文件数量
        );

        for (let i = 0; i < availableSlots; i++) {
            const nextFile = pendingFiles[i];
            if (nextFile) {
                nextFile.status = 'uploading';       // 更新状态为“上传中”
                this.uploadSingle(nextFile);         // 开始上传该文件
            }
        }
    }

    /**
     * 返回当前正在上传的文件数量
     */
    uploadingCount(): number
    {
        return this.files.filter(f => f.status === 'uploading').length;
    }

    /**
     * 模拟上传过程：使用 setInterval 来逐步增加进度条数值
     * 实际开发中应替换为真实的 HTTP 请求上传逻辑
     */
    uploadSingle(fileObj: UploadFile): void
    {
        let progress = fileObj.progress;
        const interval = setInterval(() =>
                                     {
                                         if (fileObj.status !== 'uploading') {
                                             clearInterval(interval);     // 如果状态改变，则停止上传
                                             return;
                                         }

                                         progress += Math.floor(Math.random() * 5) + 5;  // 模拟随机递增进度
                                         if (progress >= 100) {
                                             clearInterval(interval);

                                             // 模拟上传是否成功（90% 成功率）
                                             if (Math.random() > 0.1) {
                                                 fileObj.progress = 100;
                                                 fileObj.status = 'success';
                                             } else {
                                                 fileObj.retryCount++;                     // 上传失败，增加重试次数
                                                 if (fileObj.retryCount < fileObj.maxRetries) {
                                                     setTimeout(() =>
                                                                {
                                                                    fileObj.status = 'pending';            // 回到等待状态
                                                                    this.startNextBatch();                 // 再次尝试上传
                                                                }, 1000);
                                                 } else {
                                                     fileObj.status = 'failed';               // 达到最大重试次数，标记为失败
                                                 }
                                             }
                                             this.startNextBatch();                       // 尝试继续上传下一个文件
                                         } else {
                                             fileObj.progress = progress;                 // 更新当前进度
                                         }
                                     }, 200);
        fileObj.intervalId = interval;                   // 保存计时器 ID，以便后续清除
    }

    /**
     * 暂停指定索引的文件上传
     */
    pauseUpload(index: number): void
    {
        const file = this.files[index];
        if (file.status === 'uploading' && file.intervalId) {
            clearInterval(file.intervalId);  // 清除计时器
            file.status = 'paused';          // 更改状态为“已暂停”
        }
    }

    /**
     * 继续指定索引的文件上传
     */
    resumeUpload(index: number): void
    {
        const file = this.files[index];
        if (file.status === 'paused') {
            file.status = 'uploading';       // 更改为“上传中”状态
            this.uploadSingle(file);         // 重新开始上传
        }
    }

    /**
     * 取消指定索引的文件上传
     */
    cancelUpload(index: number): void
    {
        const file = this.files[index];
        if (file.status === 'uploading' && file.intervalId) {
            clearInterval(file.intervalId);  // 清除计时器
            file.status = 'canceled';        // 更改为“已取消”状态
            file.progress = 0;               // 进度归零
        }
    }

    /**
     * 删除指定索引的文件（从文件列表中移除）
     */
    deleteFile(index: number): void
    {
        this.files.splice(index, 1);       // 从数组中删除该元素
    }

    /**
     * 取消全部上传任务
     */
    cancelAll(): void
    {
        this.files.forEach(file =>
                           {
                               if (file.status === 'uploading' && file.intervalId) {
                                   clearInterval(file.intervalId);  // 清除所有上传中的计时器
                               }
                               file.status = 'canceled';          // 标记为“已取消”
                               file.progress = 0;                 // 重置进度
                           });
        this.files = this.files.filter(f => f.status !== 'canceled');  // 过滤掉已取消的文件
    }

    /**
     * 判断是否所有文件都上传成功
     */
    allUploaded(): boolean
    {
        return this.files.every(f => f.status === 'success');
    }

    /**
     * 判断是否有文件正在上传
     */
    noneUploading(): boolean
    {
        return !this.files.some(f => f.status === 'uploading');
    }

    /**
     * 根据文件上传状态返回对应的文本描述
     */
    getFileStatusText(status: string): string
    {
        switch (status) {
            case 'pending':
                return '等待上传';
            case 'uploading':
                return '上传中...';
            case 'paused':
                return '已暂停';
            case 'success':
                return '上传成功';
            case 'failed':
                return '上传失败';
            case 'canceled':
                return '已取消';
            default:
                return '';
        }
    }

    /**
     * 获取文件预览地址（仅限图片）
     */
    getFilePreview(file: File): string | null
    {
        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file);  // 创建临时本地 URL 用于预览图片
        }
        return null;
    }
}
