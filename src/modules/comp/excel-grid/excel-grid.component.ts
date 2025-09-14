import {Component, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AgGridAngular, AgGridModule} from 'ag-grid-angular';
import {
  ColDef,
  GridReadyEvent,
  CellValueChangedEvent,
  GetContextMenuItemsParams,
  GridApi,
  MenuItemDef
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {CommonModule} from '@angular/common';

// 定义表格数据接口
export interface ExcelData
{
  id: string;

  [key: string]: any;
}

@Component({
  selector: 'app-excel-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridModule],
  templateUrl: './excel-grid.component.html',
  styleUrls: ['./excel-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ExcelGridComponent implements OnInit
{
  // 表格引用
  @ViewChild('agGrid') agGrid!: AgGridAngular;

  // 表格API
  private gridApi!: GridApi;

  // 列定义
  public columnDefs: ColDef[] = [];

  // 行数据
  public rowData: ExcelData[] = [];

  // 表格配置
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    editable: true,
    flex: 1,
    minWidth: 100,
  };

  // 主题
  public gridOptions = {
    rowHeight: 35,
    headerHeight: 40,
    contextMenu: true,
    pagination: true,
    paginationPageSize: 50,
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: 20,
    enableRangeSelection: true,
    suppressDragLeaveHidesColumns: true,
  };

  // 当前选中的单元格
  public selectedCells: any[] = [];

  // 导出文件类型
  public exportFileType: 'csv' | 'excel' = 'excel';

  // 导出文件名
  public exportFileName = 'exported-data';

  // 表头行高
  public headerHeight = 40;

  // 冻结列数
  public pinnedColumnsCount = 0;

  constructor()
  {
  }

  ngOnInit()
  {
    // 初始化示例数据
    this.initializeSampleData();
  }

  // 初始化示例数据
  private initializeSampleData()
  {
    // 创建列定义（A到J列）
    this.columnDefs = Array.from({length: 10}, (_, i) => ({
      field: String.fromCharCode(65 + i), // A, B, C, ...
      headerName: String.fromCharCode(65 + i),
    }));

    // 创建行数据（100行）
    this.rowData = Array.from({length: 100}, (_, rowIndex) =>
    {
      const row: ExcelData = {id: `row-${rowIndex + 1}`};
      this.columnDefs.forEach(col =>
      {
        row[col.field!] = `${col.field}${rowIndex + 1}`;
      });
      return row;
    });
  }

  // 网格准备就绪回调
  onGridReady(params: GridReadyEvent)
  {
    this.gridApi = params.api;
    // 选择模式在gridOptions中配置，我们已经在组件初始化时设置了
  }

  // 单元格值变化回调
  onCellValueChanged(event: CellValueChangedEvent)
  {
    console.log('单元格值已更改:', event);
    // 可以在这里添加数据更新的逻辑
  }

  // 添加新行
  addRow()
  {
    const newRow: ExcelData = {id: `row-${Date.now()}`};
    this.columnDefs.forEach(col =>
    {
      newRow[col.field!] = '';
    });
    this.gridApi.applyTransaction({add: [newRow]});
  }

  // 删除选中行
  deleteSelectedRows()
  {
    const selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length > 0)
    {
      this.gridApi.applyTransaction({remove: selectedRows});
    }
  }

  // 清空表格
  clearGrid()
  {
    const currentData = [...this.rowData]; // 先保存当前数据
    this.rowData = [];
    this.gridApi.applyTransaction({remove: currentData});
  }

  // 导入Excel/CSV文件
  importFile(event: Event)
  {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0])
    {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e) =>
      {
        try
        {
          const content = e.target?.result as string;
          if (file.name.endsWith('.csv'))
          {
            this.parseCsv(content);
          } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))
          {
            alert('Excel文件导入功能需要额外的库支持，如SheetJS');
            // 实际项目中可以集成SheetJS等库来处理Excel文件
          }
        } catch (error)
        {
          console.error('导入文件错误:', error);
          alert('文件导入失败，请检查文件格式');
        }
      };

      if (file.name.endsWith('.csv'))
      {
        reader.readAsText(file);
      } else
      {
        reader.readAsArrayBuffer(file);
      }
    }
    // 清空input，允许重复选择同一文件
    if (input)
    {
      input.value = '';
    }
  }

  // 解析CSV文件
  private parseCsv(csvContent: string)
  {
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return;

    // 解析表头
    const headers = lines[0].split(',').map(header => header.trim());

    // 创建列定义
    this.columnDefs = headers.map(header => ({
      field: header,
      headerName: header,
    }));

    // 解析数据行
    this.rowData = lines.slice(1).map((line, index) =>
    {
      const values = line.split(',');
      const row: ExcelData = {id: `row-${index}`};
      headers.forEach((header, i) =>
      {
        row[header] = values[i]?.trim() || '';
      });
      return row;
    });

    // 表格会通过Angular的变更检测自动更新
    // 我们可以使用applyTransaction来确保数据正确更新
    this.gridApi.applyTransaction({remove: this.rowData, add: this.rowData});
  }

  // 导出数据
  exportData()
  {
    if (this.exportFileType === 'csv')
    {
      this.gridApi.exportDataAsCsv({
        fileName: `${this.exportFileName}.csv`,
      });
    } else
    {
      // 对于Excel导出，使用AG Grid的Excel导出功能
      // 需要引入 ag-grid-community/dist/xlsx.full.min.js
      this.gridApi.exportDataAsExcel({
        fileName: `${this.exportFileName}.xlsx`,
      });
    }
  }

  // 添加新列
  addColumn()
  {
    const lastColIndex = this.columnDefs.length;
    const newColName = String.fromCharCode(65 + lastColIndex); // A, B, C, ...

    this.columnDefs = [...this.columnDefs, {
      field: newColName,
      headerName: newColName,
    }];

    // 更新所有行数据，为新列添加空值
    this.rowData = this.rowData.map(row => ({
      ...row,
      [newColName]: '',
    }));

    // 表格会通过Angular的变更检测自动更新
    // 我们可以使用applyTransaction来确保数据正确更新
    this.gridApi.applyTransaction({remove: this.rowData, add: this.rowData});
  }

  // 删除选中列
  deleteSelectedColumn()
  {
    // 注意：在AG Grid新版本中，我们需要重新实现这个功能
    // 由于移除了gridColumnApi，我们无法直接获取选中的列
    // 这里提供一个简化版本，实际上需要根据具体需求重新设计
    console.warn('删除选中列功能在AG Grid新版本中需要重新实现');
  }

  // 添加辅助方法用于HTML模板中使用String.fromCharCode
  fromCharCode(code: number): string
  {
    return String.fromCharCode(code);
  }

  // 冻结列
  pinColumns()
  {
    if (this.pinnedColumnsCount > 0 && this.gridApi)
    {
      // 在AG Grid新版本中，我们通过更新列定义来实现冻结功能
      // 先取消所有冻结
      this.columnDefs = this.columnDefs.map(col => ({
        ...col,
        pinned: null
      }));

      // 冻结指定数量的列
      if (this.pinnedColumnsCount <= this.columnDefs.length)
      {
        this.columnDefs = this.columnDefs.map((col, index) => ({
          ...col,
          pinned: index < this.pinnedColumnsCount ? 'left' : null
        }));
      }

      // 强制更新以应用新的列定义
      // 在新版本中，列定义的更新应该通过Angular的变更检测自动完成
    }
  }

  // 重置冻结
  resetPin()
  {
    if (this.gridApi)
    {
      // 取消所有冻结
      this.columnDefs = this.columnDefs.map(col => ({
        ...col,
        pinned: null
      }));

      // 强制更新以应用新的列定义
      // 在新版本中，列定义的更新应该通过Angular的变更检测自动完成
    }
    this.pinnedColumnsCount = 0;
  }

  // 自定义上下文菜单
  getContextMenuItems(params: GetContextMenuItemsParams)
  {
    const defaultItems = params.defaultItems || [];

    // 创建自定义菜单项数组
    const customItems: MenuItemDef[] = [
      {
        name: '添加新行',
        action: () => this.addRow(),
        icon: '<i class="fas fa-plus"></i>',
      },
      {
        name: '删除选中行',
        action: () => this.deleteSelectedRows(),
        icon: '<i class="fas fa-trash"></i>',
      },
    ];

    // 合并默认菜单项和自定义菜单项
    return [...defaultItems, ...customItems];
  }

  // 调整表头高度
  updateHeaderHeight()
  {
    // 在新版本的AG Grid中，需要重新创建列定义并更新表格
    this.defaultColDef = {
      ...this.defaultColDef,
      // 更新列定义中与高度相关的配置
    };
    // 强制表格重新渲染
    this.agGrid.api.refreshHeader();
  }

  // 全选
  selectAll()
  {
    this.gridApi.selectAll();
  }

  // 取消选择
  deselectAll()
  {
    this.gridApi.deselectAll();
  }

  // 显示选中单元格的范围
  showSelectedRange()
  {
    if (this.selectedCells.length > 0)
    {
      const range = this.selectedCells[0];
      alert(`选中范围: ${range.startRow.rowIndex + 1},${String.fromCharCode(65 + range.startColumn.colId.charCodeAt(0) - 65)} 到 ${range.endRow.rowIndex + 1},${String.fromCharCode(65 + range.endColumn.colId.charCodeAt(0) - 65)}`);
    }
  }
}
