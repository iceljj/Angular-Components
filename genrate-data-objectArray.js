// genrate-data-objectArray.js

import clipboardy from 'clipboardy';

// 获取命令行参数
const args = process.argv.slice(2);

if (args.length !== 5) {
  console.log('用法：node genrate-data-objectArray.js 对象数组名 变量名1 变量名2 中文内容 数组数量');
  console.log('示例：node genrate-data-objectArray.js yourDataArray label value 选项 6');
  process.exit(1);
}

const [arrayVarName, key1, key2, prefix, countStr] = args;
const count = parseInt(countStr, 10);

if (isNaN(count) || count <= 0) {
  console.error('数组数量必须是一个正整数');
  process.exit(1);
}

// 构建 JS 代码字符串
let code = `const ${arrayVarName} = [\n`;

for (let i = 1; i <= count; i++) {
  const label = `${prefix}${i}`;
  code += `  { ${key1}: '${label}', ${key2}: ${i} }`;
  if (i !== count) {
    code += ',\n';
  }
}

code += `\n];\n\nconsole.log(${arrayVarName});`;

// 输出生成的 JS 代码
console.log('// 生成的 JS 对象数组代码：\n');
console.log(code);

// 异步复制到剪贴板
try {
  await clipboardy.write(code);
  console.log('\n✅ 已复制到剪贴板，你可以直接粘贴使用！');
} catch (err) {
  console.error('\n❌ 剪贴板复制失败:', err.message);
}

