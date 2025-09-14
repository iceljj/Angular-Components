import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';
import * as marked from 'marked';
import mermaid from 'mermaid';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { CustomReuseStrategy } from './CustomReuseStrategy';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { provideNzI18n, zh_CN } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import zh from '@angular/common/locales/zh';

// AG Grid 模块注册
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';

// Highlight.js
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

registerLocaleData(zh);

// 执行模块注册（必须在应用启动前）
ModuleRegistry.registerModules([AllCommunityModule]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    provideIonicAngular({ mode: 'ios' }),
    provideRouter(routes),
    provideNzI18n(zh_CN),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideMarkdown(),
  ],
};