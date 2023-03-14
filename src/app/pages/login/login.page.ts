/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';



@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
	credentialsForm: FormGroup;

	constructor(private formBuilder: FormBuilder, private authService: AuthService, private loadingController: LoadingController,  private alertController: AlertController, private router: Router) { 
		this.credentialsForm = this.formBuilder.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(6)]]
		});
	}

	async ngOnInit(){
		if (this.authService.isAuthenticated.getValue()) {
			const alert = await this.alertController.create({
			  header: 'Already authenticated',
			  message: 'Είστε συνδεδεμένος!',
			  buttons: [{
				text: 'OK',
				handler: () => {
				  this.router.navigateByUrl('/inside', { replaceUrl: true });
				}
			  }]
			});
			await alert.present();
		  }
	  }
	  

	onSubmit() {
		this.authService.login(this.credentialsForm.value).subscribe();
	}

	async login() {
		const loading = await this.loadingController.create();
		await loading.present();
	
		this.authService.login({ credentials: this.credentialsForm.value }).subscribe({
		  next : async _ => {
			await loading.dismiss();
			this.router.navigateByUrl('/inside', { replaceUrl: true });
		  },
		  error : async (res) => {
			await loading.dismiss();
			const alert = await this.alertController.create({
			  header: 'Login failed',
			  message: res.error.msg,
			  buttons: ['OK'],
			});
			await alert.present();
		  } 
		});
		
	  }

	async signUp() {
		const loading = await this.loadingController.create();
		await loading.present();
	
		this.authService.signUp(this.credentialsForm.value).subscribe({
		  next :
		  async (_: any) => {
			await loading.dismiss();
			this.login();
		  },
		  error :
		  async (res: { error: { msg: any; }; }) => {
			await loading.dismiss();
			const alert = await this.alertController.create({
			  header: 'Signup failed',
			  message: res.error.msg,
			  buttons: ['OK'],
			});
			await alert.present();
		  }
		}
		);
	  } 
}
