import {Component, Input, OnInit, ViewChild, ElementRef, AfterViewChecked} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss']
})
export class Chat implements OnInit, AfterViewChecked
{
  @Input() showAvatar: boolean = true; // 是否显示头像，默认不显示
  @Input() headerText: string = '在线客服'; // 顶部标题文本

  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('messageContainer') private messageContainerRef!: ElementRef;

  newMessage: string = ''; // 新消息输入
  messages: any[] = []; // 消息数组
  autoScrollEnabled: boolean = true; // 自动滚动是否启用

  ngOnInit()
  {
    // 初始化模拟数据
    this.messages = [
      {
        id: 1,
        content: '您好，有什么可以帮您？',
        isMe: false,
        time: new Date(Date.now() - 1000 * 60 * 5),
        avatar: ''
      },
      {
        id: 2,
        content: '我想咨询订单状态，订单号是1234567890。这是我购买的商品详细信息，希望您能帮我查看一下物流状态。',
        isMe: true,
        time: new Date(Date.now() - 1000 * 60 * 3),
        avatar: 'U'
      },
      {
        id: 3,
        content: '请提供订单号和联系电话，我会为您查询物流信息并尽快回复。我们的客服时间是工作日9:00-18:00。',
        isMe: false,
        time: new Date(Date.now() - 1000 * 60 * 2),
        avatar: ''
      }
    ];
  }

  ngAfterViewChecked()
  {
    // 视图更新后检查是否需要自动滚动[1,4](@ref)
    if (this.autoScrollEnabled)
    {
      this.scrollToBottom();
    }
  }

  // 处理滚动事件
  onMessagesScroll()
  {
    const element = this.messageContainerRef.nativeElement;
    const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight <= 1;

    // 如果用户滚动到底部，重新启用自动滚动[4](@ref)
    if (atBottom)
    {
      this.autoScrollEnabled = true;
    } else
    {
      // 用户手动向上滚动时禁用自动滚动
      this.autoScrollEnabled = false;
    }
  }

  // 滚动到底部
  scrollToBottom(): void
  {
    try
    {
      const element = this.messageContainerRef.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err)
    {
      console.error('滚动到底部失败:', err);
    }
  }

  // 处理Enter键事件
  handleEnter(event: any)
  {
    if (event.key === 'Enter')
    {
      if (event.shiftKey)
      {
        // Shift+Enter 换行
        this.newMessage += '\n';
        // 调整textarea高度
        setTimeout(() =>
        {
          this.adjustTextAreaHeight();
        });
      } else
      {
        // 仅Enter键，发送消息
        event.preventDefault();
        this.sendMessage();
      }
    }
  }

  // 调整textarea高度
  adjustTextAreaHeight()
  {
    const textarea = this.messageInput.nativeElement;
    textarea.style.height = 'auto';
    const maxHeight = 120;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = newHeight + 'px';
    textarea.style.overflowY = newHeight === maxHeight ? 'auto' : 'hidden';
  }

  // 重置输入框高度到初始状态
  resetTextAreaHeight()
  {
    const textarea = this.messageInput.nativeElement;
    textarea.style.height = '48px'; // 恢复到初始高度
    textarea.style.overflowY = 'hidden'; // 重置滚动条
  }

  // 发送新消息
  sendMessage()
  {
    if (!this.newMessage.trim()) return;

    const newMsg = {
      id: this.messages.length + 1,
      content: this.newMessage,
      isMe: true,
      time: new Date(),
      avatar: 'U'
    };

    this.messages.push(newMsg);
    this.newMessage = '';

    // 发送消息后启用自动滚动[4](@ref)
    this.autoScrollEnabled = true;

    // 重置textarea高度到初始状态
    this.resetTextAreaHeight();

    // 模拟自动回复
    setTimeout(() =>
    {
      this.messages.push({
        id: this.messages.length + 1,
        content: '已收到您的信息，我们将尽快回复您的问题。有任何其他需要可以随时告诉我们。',
        isMe: false,
        time: new Date(),
        avatar: ''
      });
    }, 1000);
  }

  // 格式化时间为 HH:mm
  formatTime(date: Date): string
  {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
}
