import {Component} from '@angular/core';
import {CompModol} from '../../comp/comp-modol/comp-modol';
import {DropDownToggle} from '../../comp/drop-down-toggle/drop-down-toggle';
import {Popover} from '../../comp/popover/popover';
import {CardItem, Waterfall} from '../../comp/waterfall/waterfall';
import {Videogular} from 'fmode-video';

@Component({
  selector: 'app-home',
  imports: [
    CompModol,
    DropDownToggle,
    Popover,
    Waterfall,
    Videogular,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home
{

  cards: CardItem[] = [
    {
      id: '1',
      title: '卡片标题 1',
      content: '这是一张占据1列的卡片，展示基础内容布局。卡片高度自适应内容。',
      image: 'https://picsum.photos/400/300?random=1',
      columns: 1,
      height: 320
    },
    {
      id: '2',
      title: '卡片标题 2',
      content: '这是一张占据2列的卡片，展示更宽的内容区域。可以包含更多文字描述或图片。',
      image: 'https://picsum.photos/800/300?random=2',
      columns: 2,
      height: 280
    },
    {
      id: '3',
      title: '卡片标题 3',
      content: '这是一张占据1列的卡片，内容较为简短。',
      image: 'https://picsum.photos/400/200?random=3',
      columns: 1,
      height: 240
    },
    {
      id: '4',
      title: '卡片标题 4',
      content: '这是一张占据3列的卡片，展示最宽的内容区域。适合展示大图或详细说明。',
      image: 'https://picsum.photos/1200/400?random=4',
      columns: 3,
      height: 360
    },
    {
      id: '5',
      title: '卡片标题 5',
      content: '这是一张占据1列的卡片，包含中等长度的内容描述。',
      image: 'https://picsum.photos/400/250?random=5',
      columns: 1,
      height: 300
    },
    {
      id: '6',
      title: '卡片标题 6',
      content: '这是一张占据2列的卡片，内容适中。适合展示产品特性或功能说明。',
      image: 'https://picsum.photos/800/350?random=6',
      columns: 2,
      height: 380
    },
    {
      id: '7',
      title: '卡片标题 7',
      content: '这是一张占据1列的卡片，内容简洁明了。',
      image: 'https://picsum.photos/400/300?random=7',
      columns: 1,
      height: 320
    },
    {
      id: '8',
      title: '卡片标题 8',
      content: '这是一张占据1列的卡片，展示基础内容布局。',
      image: 'https://picsum.photos/400/280?random=8',
      columns: 1,
      height: 300
    },
    {
      id: '9',
      title: '卡片标题 9',
      content: '这是一张占据3列的卡片，适合展示宽幅内容或横幅信息。',
      image: 'https://picsum.photos/1200/350?random=9',
      columns: 3,
      height: 400
    },
    {
      id: '10',
      title: '卡片标题 10',
      content: '这是一张占据1列的卡片，内容较为简短。',
      image: 'https://picsum.photos/400/200?random=10',
      columns: 1,
      height: 240
    }
  ];


  /**
   * 控制模态框显示状态的布尔值
   */
  showModal = false;

  yourDataArray = [
    {
      label: '选项1',
      id: 1
    },
    {
      label: '选项2',
      id: 2
    },
    {
      label: '选项3',
      id: 3
    },
    {
      label: '选项4',
      id: 4
    },
    {
      label: '选项5',
      id: 5
    },
    {
      label: '选项6',
      id: 6
    },
    {
      label: '选项7',
      id: 7
    },
    {
      label: '选项8',
      id: 8
    },
    {
      label: '选项9',
      id: 9
    },
    {
      label: '选项10',
      id: 10
    },
    {
      label: '选项11',
      id: 11
    },
    {
      label: '选项12',
      id: 12
    },
    {
      label: '选项13',
      id: 13
    },
    {
      label: '选项14',
      id: 14
    },
    {
      label: '选项15',
      id: 15
    },
    {
      label: '选项16',
      id: 16
    },
    {
      label: '选项17',
      id: 17
    },
    {
      label: '选项18',
      id: 18
    },
    {
      label: '选项19',
      id: 19
    },
    {
      label: '选项20',
      id: 20
    },
    {
      label: '选项21',
      id: 21
    },
    {
      label: '选项22',
      id: 22
    },
    {
      label: '选项23',
      id: 23
    },
    {
      label: '选项24',
      id: 24
    },
    {
      label: '选项25',
      id: 25
    },
    {
      label: '选项26',
      id: 26
    },
    {
      label: '选项27',
      id: 27
    },
    {
      label: '选项28',
      id: 28
    },
    {
      label: '选项29',
      id: 29
    },
    {
      label: '选项30',
      id: 30
    },
    {
      label: '选项31',
      id: 31
    },
    {
      label: '选项32',
      id: 32
    },
    {
      label: '选项33',
      id: 33
    },
    {
      label: '选项34',
      id: 34
    },
    {
      label: '选项35',
      id: 35
    },
    {
      label: '选项36',
      id: 36
    },
    {
      label: '选项37',
      id: 37
    },
    {
      label: '选项38',
      id: 38
    },
    {
      label: '选项39',
      id: 39
    },
    {
      label: '选项40',
      id: 40
    },
    {
      label: '选项41',
      id: 41
    },
    {
      label: '选项42',
      id: 42
    },
    {
      label: '选项43',
      id: 43
    },
    {
      label: '选项44',
      id: 44
    },
    {
      label: '选项45',
      id: 45
    },
    {
      label: '选项46',
      id: 46
    },
    {
      label: '选项47',
      id: 47
    },
    {
      label: '选项48',
      id: 48
    },
    {
      label: '选项49',
      id: 49
    },
    {
      label: '选项50',
      id: 50
    },
    {
      label: '选项51',
      id: 51
    },
    {
      label: '选项52',
      id: 52
    },
    {
      label: '选项53',
      id: 53
    },
    {
      label: '选项54',
      id: 54
    },
    {
      label: '选项55',
      id: 55
    },
    {
      label: '选项56',
      id: 56
    },
    {
      label: '选项57',
      id: 57
    },
    {
      label: '选项58',
      id: 58
    },
    {
      label: '选项59',
      id: 59
    },
    {
      label: '选项60',
      id: 60
    },
    {
      label: '选项61',
      id: 61
    },
    {
      label: '选项62',
      id: 62
    },
    {
      label: '选项63',
      id: 63
    },
    {
      label: '选项64',
      id: 64
    },
    {
      label: '选项65',
      id: 65
    },
    {
      label: '选项66',
      id: 66
    },
    {
      label: '选项67',
      id: 67
    },
    {
      label: '选项68',
      id: 68
    },
    {
      label: '选项69',
      id: 69
    },
    {
      label: '选项70',
      id: 70
    },
    {
      label: '选项71',
      id: 71
    },
    {
      label: '选项72',
      id: 72
    },
    {
      label: '选项73',
      id: 73
    },
    {
      label: '选项74',
      id: 74
    },
    {
      label: '选项75',
      id: 75
    },
    {
      label: '选项76',
      id: 76
    },
    {
      label: '选项77',
      id: 77
    },
    {
      label: '选项78',
      id: 78
    },
    {
      label: '选项79',
      id: 79
    },
    {
      label: '选项80',
      id: 80
    },
    {
      label: '选项81',
      id: 81
    },
    {
      label: '选项82',
      id: 82
    },
    {
      label: '选项83',
      id: 83
    },
    {
      label: '选项84',
      id: 84
    },
    {
      label: '选项85',
      id: 85
    },
    {
      label: '选项86',
      id: 86
    },
    {
      label: '选项87',
      id: 87
    },
    {
      label: '选项88',
      id: 88
    },
    {
      label: '选项89',
      id: 89
    },
    {
      label: '选项90',
      id: 90
    },
    {
      label: '选项91',
      id: 91
    },
    {
      label: '选项92',
      id: 92
    },
    {
      label: '选项93',
      id: 93
    },
    {
      label: '选项94',
      id: 94
    },
    {
      label: '选项95',
      id: 95
    },
    {
      label: '选项96',
      id: 96
    },
    {
      label: '选项97',
      id: 97
    },
    {
      label: '选项98',
      id: 98
    },
    {
      label: '选项99',
      id: 99
    },
    {
      label: '选项100',
      id: 100
    }
  ];


  handleSelectionChange(selectedItem: any)
  {
    console.log('选中项:', selectedItem);
    // 处理选中逻辑
  }


  /**
   * 处理模态框内操作的示例方法
   */
  handleAction(): void
  {
    console.log('模态框内按钮被点击');
    // 这里添加实际业务逻辑，例如：
    // this.submitForm();
    // 或关闭模态框：
    // this.showModal = false;

    alert('操作已执行！');
  }

  /**
   * 打开模态框的方法
   */
  openModal(): void
  {
    this.showModal = true;
  }

  protected readonly onselectionchange = onselectionchange;
}
