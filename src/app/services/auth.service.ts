import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController } from '@ionic/angular';



const ACCESS_TOKEN_KEY = 'my-access-token';
const REFRESH_TOKEN_KEY = 'my-refresh-token';
interface SetOptions {
  key: string;
  value: string;
  expiration?: string | number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Init with null to filter out the first value in a guard!
  isAuthenticated: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);
  currentAccessToken: string | null = null;
  url = environment.url;

  

  constructor(private http: HttpClient, private alertController: AlertController, private router: Router) {
    this.loadToken();
  }

  // Load accessToken on startup
  async loadToken() {
    const token = await Preferences.get({ key: ACCESS_TOKEN_KEY });
    if (token && token.value) {
      this.currentAccessToken = token.value;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }


  // Create new user
  signUp(credentials: {email: any, password: any}): Observable<any> {
    return this.http.post(`${this.url}/register`, credentials);
  }
  
  // Sign in a user and store access and refres token
  login({ credentials }: { credentials: { email: any; password: any; }; }, stayLoggedIn: boolean): Observable<any> {
    return this.http.post<{accessToken: any, refreshToken: any}>(`${this.url}/login`, credentials).pipe(
      switchMap((tokens: {accessToken: string, refreshToken: any }) => {
        this.currentAccessToken = tokens.accessToken;
        const options = { key: ACCESS_TOKEN_KEY, value: tokens.accessToken, expiration: stayLoggedIn ? -1 : 3600 } as SetOptions; 
        const storeAccess = Preferences.set(options);
        const storeRefresh = Preferences.set({key: REFRESH_TOKEN_KEY, value: tokens.refreshToken});
        return from(Promise.all([storeAccess, storeRefresh]));
      }),
      tap(_ => {
        this.isAuthenticated.next(true);
      })
    )
  }

  // Potentially perform a logout operation inside your API
// or simply remove all local tokens and navigate to login
logout() {
  return this.http.post(`${this.url}/auth/logout`, {}).pipe(
    switchMap(_ => {
      this.currentAccessToken = null as any;
      // Remove all stored tokens
      const deleteAccess = Preferences.remove({ key: ACCESS_TOKEN_KEY });
      const deleteRefresh = Preferences.remove({ key: REFRESH_TOKEN_KEY });
      return from(Promise.all([deleteAccess, deleteRefresh]));
    }),
    tap(_ => {
      this.isAuthenticated.next(false);
      this.router.navigateByUrl('/inside', { replaceUrl: true });
    })
  ).subscribe();
}

// Load the refresh token from Preferences 
// then attach it as the header for one specific API call
getNewAccessToken() {
  const refreshToken = from(Preferences.get({ key: REFRESH_TOKEN_KEY }));
  return refreshToken.pipe(
    switchMap(token => {
      if (token && token.value) {
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`
          })
        }
        return this.http.get(`${this.url}/auth/refresh`, httpOptions);
      } else {
        // No stored refresh token
        return of(null);
      }
    })
  );
}

showAlert(msg: string) {
	let alert = this.alertController.create({
		message: msg,
		header: 'Error',
		buttons: ['OK']
	});
	alert.then((alert) => alert.present());
}

// Store a new access token
storeAccessToken(accessToken: null) {
  this.currentAccessToken = accessToken as any;
  return from((Preferences.set as any)({ key: ACCESS_TOKEN_KEY, value: accessToken }));
}
}




