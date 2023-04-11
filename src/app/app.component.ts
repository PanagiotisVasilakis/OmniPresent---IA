import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { AuthService } from './services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';




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
		  title: 'Account',
		  url: '/profile',
		  icon: 'person'
		},
		{
		  title: 'Settings',
		  url: '/settings',
		  icon: 'settings'
		},
		{
		  title: 'Login',
		  url: '/login',
		  icon: 'log-in'
		},
		{
		  title: 'Logout',
		  icon: 'log-out'
		}
	  ];

	constructor(
		private platform: Platform,
		private splashScreen: SplashScreen,
		private statusBar: StatusBar,
		private authService: AuthService,
		private router: Router,
		private route: ActivatedRoute,
		private toastr: ToastrService,
	) {
		this.initializeApp();
	}

	logout(){
		this.authService.logout();
	}

	ngOnInit() {
		this.route.url.pipe(
		  map(url => url[0].path)
		).subscribe(path => {
		  if (path === '/profile') {
			this.authService.isAuthenticated.subscribe(state => {
			  if (state) {
				this.router.navigate(['profile']);
			  } else {
				this.router.navigate(['login']);
				this.toastr.warning('Please login to access your account');
			  }
			});
		  }
		});

	  }
	  

	initializeApp() {
		
		this.platform.ready().then( () => {
			this.statusBar.styleDefault();
			this.splashScreen.hide();		
		 });
		}
}