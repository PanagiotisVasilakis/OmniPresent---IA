import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { AuthService } from './services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit{
	currentRoute: string;
	activeIndex = 0;

	Pages = [
		{
		  title: 'Navigation',
		  url: '/inside',
		  icon: 'compass'
		},
		{
		  title: 'Connect',
		  url: '/profile',
		  icon: 'person'
		},
		{
		  title: 'Settings',
		  url: '/settings',
		  icon: 'settings'
		}
	  ];

	constructor(
		private platform: Platform,
		private splashScreen: SplashScreen,
		private statusBar: StatusBar,
		private authService: AuthService,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.initializeApp();
	}

	ngOnInit() {
		this.route.url.pipe(map(url => url[0].path)).subscribe(path => {
		  this.currentRoute = path;
		});
	  }

	initializeApp() {
		
		this.platform.ready().then(() => {
			this.statusBar.styleDefault();
			this.splashScreen.hide();

			this.authService.isAuthenticated.subscribe((state) => {
				if (state) {
					this.router.navigate(['inside']);
				} else {
					this.router.navigate(['login']);
				}
			});
		});
	}
}