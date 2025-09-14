import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgxEchartsModule, NGX_ECHARTS_CONFIG} from 'ngx-echarts';

@Component({
  selector: 'app-comp-input',
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  templateUrl: './comp-input.html',
  styleUrl: './comp-input.scss',
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: {echarts: () => import('echarts')}
    }
  ]
})
export class CompInput {
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() prefixIcon: string | null = null;
  @Input() suffixIcon: string | null = null;
  @Input() showClear: boolean = true;
  @Input() showChart: boolean = false;
// 在组件类中添加：
  // 图表数据格式
  chartData: any = null;

  value: string = '';


  // 输出事件
  @Output() inputChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  // 当用户输入时触发
  onInput(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.value = newValue;
    this.inputChange.emit(newValue);
  }

  // 回车键搜索
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.search.emit(this.value);
      this.updateChart(); // 更新图表
    }
  }

  // 清空输入
  clearInput() {
    this.value = '';
    this.clear.emit();
    this.chartData = null;
  }

  // 示例方法：根据输入值生成模拟图表数据
  updateChart() {
    if (!this.showChart || !this.value) return;

    const words = this.value.split(/\s+/);
    const data = words.map(word => ({
      name: word,
      value: Math.floor(Math.random() * 100),
    }));

    if (words.length > 1) {
      // 柱状图
      this.chartData = {
        tooltip: {},
        xAxis: {data: words},
        yAxis: {},
        series: [{data: data.map(d => d.value), type: 'bar'}],
      };
    } else {
      // 饼图
      this.chartData = {
        tooltip: {},
        legend: {data: words},
        series: [
          {
            type: 'pie',
            data: data,
          },
        ],
      };
    }
  }
}
