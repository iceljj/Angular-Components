const fs = require('fs').promises;
const path = require('path');
const {execSync} = require('child_process');

async function main() {
  // 1. 获取命令行参数
  const packageName = process.argv[2]; // 模块名（如algorithm）
  const componentName = process.argv[3]; // 组件名（如home）

  console.log('📦 创建组件:', packageName, componentName)

  // 参数验证
  if (!packageName || !componentName) {
    console.error('Usage: node generate-component.js <packageName> <componentName>');
    process.exit(1);
  }

  // 2. 定义基础路径常量
  const MODULES_BASE = 'src/modules'; // 核心路径定义
  // 生成相对路径（如 'algorithm/home'）
  const componentRelativePath = path.posix.join(componentName, componentName);
  const component = path.posix.join(packageName, componentName);
  // 组件完整路径（用于文件操作）
  const componentDir = path.join(MODULES_BASE, component);
  // 路由文件路径
  const routingFilePath = path.join(MODULES_BASE, packageName, `${packageName}-routing-module.ts`);

  // 3. 创建组件（关键修正部分）
  try {
    console.log(`🛠️ 正在创建组件: ${componentDir}`);

    // 使用相对路径生成组件，从 src/modules 目录执行
    execSync(
      `ng generate component ${component} --standalone=true --style=scss --skip-import --force`,
      {cwd: MODULES_BASE, stdio: 'inherit'}
    );

  } catch (error) {
    console.error('❌ 组件创建失败:', error.message);
    process.exit(1);
  }

  // 4. 更新路由配置（保持原有逻辑不变）
  try {
    let routingContent = await fs.readFile(routingFilePath, 'utf-8');
    const componentClassName = `${componentName.charAt(0).toUpperCase()}${componentName.slice(1)}`;

    // 相对导入路径
    const relativeImportPath = `./${componentRelativePath}`;

    const newRoute = `{
  path: '${componentName.toLowerCase()}',
  loadComponent: () => import('${relativeImportPath}').then(m => m.${componentClassName})
}`;

    // 处理路由配置的两种情况
    // 情况1：空路由配置
    if (/const routes:\s*Routes\s*=\s*\[\s*\];/.test(routingContent)) {
      routingContent = routingContent.replace(
        /const routes:\s*Routes\s*=\s*\[\s*\];/,
        `const routes: Routes = [${newRoute}];`
      );
    }
    // 情况2：已有路由配置
    else {
      const routeStart = routingContent.indexOf('const routes: Routes = [');
      if (routeStart === -1) throw new Error('未找到路由数组声明');

      const routeEnd = routingContent.indexOf('];', routeStart);
      if (routeEnd === -1) throw new Error('未找到路由数组结束标记');

      const existingRoutes = routingContent.substring(routeStart + 24, routeEnd).trim();
      const separator = existingRoutes ? ',\n  ' : '';

      routingContent = [
        routingContent.substring(0, routeStart),
        `const routes: Routes = [${existingRoutes}${separator}${newRoute}];`,
        routingContent.substring(routeEnd + 2)
      ].join('');
    }

    await fs.writeFile(routingFilePath, routingContent);
    console.log(`\n✅ 路由文件已更新: ${routingFilePath}`);
    console.log('生成的路由配置:');
    console.log(newRoute);
  } catch (error) {
    console.error('\n❌ 路由更新失败:', error.message);
    console.log('💡 请检查以下文件是否存在:');
    console.log(`- 组件目录: ${path.join(process.cwd(), componentDir)}`);
    console.log(`- 路由文件: ${path.join(process.cwd(), routingFilePath)}`);
    process.exit(1);
  }

  console.log('\n🎉 组件创建和路由配置完成！');
}

// 执行主函数
main();
