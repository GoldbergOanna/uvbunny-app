import { Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { BunnyDetailsComponent } from './pages/bunny-details/bunny-details.component';
import { ConfigurationComponent } from './pages/configuration/configuration.component';

export const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
    title: 'Dashboard - UVbunny'
  },
  {
    path: 'configuration',
    component: ConfigurationComponent,
    title: 'Configuration - UVbunny'
  },
  {
    path: 'bunny/:id',
    component: BunnyDetailsComponent,
    title: 'Bunny Details - UVbunny'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
] as const satisfies Routes;
