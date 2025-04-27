import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Enable production mode for better performance in production builds
if (environment.production) {
  enableProdMode();
}

// Bootstrap the Angular application with the root module (AppModule)
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
