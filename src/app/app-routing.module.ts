import { AuthGuardService } from './services/auth-guard.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{ path: '', redirectTo: 'inside', pathMatch: 'full' },
	{ 
    	path: 'login', 
    	loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule) 
  	},
	{
		path: 'inside',
		loadChildren: () => import('./pages/inside/inside.module').then( m => m.InsidePageModule)
	},
	{
		path: 'profile',
		loadChildren: () => import('./pages/profile/profile.module').then( m => m.profilePageModule),
		canActivate: [AuthGuardService]
	},
	{
		path: 'settings',
		loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}