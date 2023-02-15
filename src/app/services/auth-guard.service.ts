import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { filter, map, take } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
	providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
	constructor(public auth: AuthService, private router: Router) {}

	canActivate(): Observable<boolean> {
		//return this.auth.isAuthenticated();
		return this.auth.isAuthenticated.pipe(
			filter(val => val !== null), // Filter out initial Behaviour subject value
			take(1), // Otherwise the Observable doesn't complete!
			map(isAuthenticated => {
			  if (isAuthenticated) {
				return true;
			  } else {
				this.router.navigateByUrl('/')
				return false;
			  }
			})
		  );
	}
}