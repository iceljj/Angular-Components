# 自定义全局提示组件

这个组件是基于ng-zorro-antd的message组件进行封装的，提供了两种使用方式：

1. 普通模式：直接显示文本消息
2. 模板模式：使用自定义模板显示消息

## 使用方法

### 1. 导入组件

```typescript
import { CustomMessageComponent } from './path/to/custom-message.component';
```

### 2. 在模板中使用

```html
<app-custom-message></app-custom-message>
```

### 3. 普通模式

```typescript
// 显示普通消息
showMessage('info', '这是一条普通消息');

// 显示成功消息
showMessage('success', '这是一条成功消息');

// 显示警告消息
showMessage('warning', '这是一条警告消息');

// 显示错误消息
showMessage('error', '这是一条错误消息');
```

### 4. 模板模式

```typescript
// 显示自定义模板消息
showTemplateMessage('Angular');

// 显示不同类型的自定义模板消息
showTemplateMessageByType('success', 'Angular成功');
showTemplateMessageByType('warning', 'Angular警告');
showTemplateMessageByType('error', 'Angular错误');
```

## API

### 方法

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| `showMessage(type, content)` | 显示普通文本消息 | `type`: 消息类型 ('info', 'success', 'warning', 'error')<br>`content`: 消息内容 | void |
| `showTemplateMessage(data)` | 显示自定义模板消息 | `data`: 传递给模板的数据 | void |
| `showTemplateMessageByType(type, data)` | 显示指定类型的自定义模板消息 | `type`: 消息类型 ('info', 'success', 'warning', 'error')<br>`data`: 传递给模板的数据 | void |

## 常见问题和解决方案

### 1. TypeScript类型错误

**问题**: 在使用自定义模板时出现类型错误
**解决方案**: 确保正确导入`NzMessageComponent`并在模板引用类型定义中使用它：

```typescript
import { NzMessageService, NzMessageComponent } from 'ng-zorro-antd/message';

@ViewChild('customTemplate', { static: true }) customTemplate!: TemplateRef<{ 
  $implicit: NzMessageComponent; 
  data: string; 
}>;
```

## 测试

组件包含一个测试文件`custom-message.component.spec.ts`，用于验证所有消息类型的显示功能。可以使用以下命令运行测试：

```bash
ng test
```