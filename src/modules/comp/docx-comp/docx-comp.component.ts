import { Component } from '@angular/core';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType
} from 'docx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-docx-comp',
  standalone: true,
  imports: [],
  templateUrl: './docx-comp.component.html',
  styleUrls: ['./docx-comp.component.scss']
})
export class DocxCompComponent {
  generateReport() {
    const data = {
      title: "A股证券板块研究报告",
      date: new Date().toLocaleDateString(),
      industryOverview: "2024年A股证券板块整体呈现波动上行趋势，受政策利好及市场资金流入推动。",
      coreData: [
        { indicator: "平均市盈率", value: "15.3x" },
        { indicator: "总市值（万亿）", value: "12.6" },
        { indicator: "日均成交量（亿手）", value: "28.4" }
      ],
      trendAnalysis: "Q3季度券商股受益于并购重组政策，头部券商估值修复明显。"
    };

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // 标题页
            new Paragraph({
              children: [new TextRun({ text: data.title, bold: true, size: 40 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `发布日期：${data.date}`, bold: true })],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({ text: " " }),

            // 目录
            new Paragraph({
              text: "目录",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph("1. 行业概况"),
            new Paragraph("2. 核心数据"),
            new Paragraph("3. 趋势分析"),
            new Paragraph(" "),

            // 行业概况
            new Paragraph({
              children: [new TextRun({ text: "1. 行业概况", bold: true })],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph(data.industryOverview),

            // 核心数据表格
            new Paragraph({
              children: [new TextRun({ text: "2. 核心数据", bold: true })],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("指标")] }),
                    new TableCell({ children: [new Paragraph("数值")] })
                  ]
                }),
                ...data.coreData.map(item =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(item.indicator)] }),
                      new TableCell({ children: [new Paragraph(item.value)] })
                    ]
                  })
                )
              ]
            }),

            // 趋势分析
            new Paragraph({
              children: [new TextRun({ text: "3. 趋势分析", bold: true })],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph(data.trendAnalysis)
          ]
        }
      ]
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);
    });
  }
}
