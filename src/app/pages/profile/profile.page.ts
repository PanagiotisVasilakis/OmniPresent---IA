/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import {Device, DeviceInfo} from "@capacitor/device";
import { SqLiteDatabaseService } from 'src/app/services/sq-lite-database.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  isEmergencyContactAdd: boolean = false;
  isEmergencyContactChange: boolean = false;
  iosOrAndroid: boolean;
  emergencyContactName: string;
  emergencyContactNumber: string;
  showEmail = false;
  showPassword = false;
  savedContacts: any[] = [];
  displayContacts = true;
  

  constructor(private authService: AuthService, private sqLiteDatabaseService: SqLiteDatabaseService, private alertController: AlertController, private router: Router) {  }

  async saveEmergencyContact(){
        //SAVE CONTACTS BY CLICK                      
          await this.sqLiteDatabaseService.run(
            `INSERT INTO contacts (name, phonenumber)
            VALUES (?, ?);`, 
            [this.emergencyContactName, this.emergencyContactNumber]
          );
          console.log('we did it');
  }

  async LoadSavedContacts() {
    const result = await this.sqLiteDatabaseService.execute(
      `SELECT * FROM contacts;`
    );
    this.savedContacts = result.values;
  }

  async deleteDatabaseContacts(id: number) {
    await this.sqLiteDatabaseService.execute(
      `DELETE FROM contacts WHERE id = ?;`,
      [id]
    );
    this.savedContacts = this.savedContacts.filter((contact: { id: number; }) => contact.id !== id);
  }

  async updateDatabaseContacts(id: number) {
    await this.sqLiteDatabaseService.run(
      `UPDATE FROM contacts WHERE id = ?;`,
      [id]
    );
    this.savedContacts = this.savedContacts.filter((contact: { id: number; }) => contact.id !== id);
  }

  async ngOnInit() {
    const info: DeviceInfo = await Device.getInfo();
    this.iosOrAndroid = (info.platform === "android" || info.platform === "ios");

    if (!this.authService.isAuthenticated.getValue()) {
			const alert = await this.alertController.create({
			  header: 'Αποσυνδεδεμένος λογαριασμός',
			  message: 'Πρέπει να συνδεθείτε στον λογαριασμό σας!',
			  buttons: [{
				text: 'OK',
				handler: () => {
				  this.router.navigateByUrl('/login', { replaceUrl: true });
				}
			  }]
			});
			await alert.present();
		  }
  }

}
