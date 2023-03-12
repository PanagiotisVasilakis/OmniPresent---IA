/* eslint-disable @angular-eslint/contextual-lifecycle */
import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';


@Injectable({
  providedIn: 'root'
})
export class SqLiteDatabaseService {
  private db: SQLiteDBConnection | any;

  constructor() { }  

  async createDatabase(): Promise<SQLiteDBConnection> {
    if (this.db) {
      console.log('Returning existing database');
      return this.db;
    } 
    else {
        // Initialize the database
        // Get the connection object
        this.db = await CapacitorSQLite.createConnection({ database: 'RoutesSaved' });

        await this.db.execute(`
          CREATE TABLE IF NOT EXISTS places (
              id INTEGER PRIMARY KEY,
              name TEXT,
              latitudeFirst REAL,
              longitudeFirst REAL,
              latitudeSecond REAL,
              longitudeSecond REAL
          );`
        );

        await this.db.execute(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY,
            name TEXT,
            phonenumber INT
        );`
      );

        console.log('Database created');
      return this.db;
    }
 }



  /* 
  In your code, you have defined two methods: run and execute. They both use the same SQLite interface: CapacitorSQLite. The only difference is that run uses prepared statements, while execute does not. Prepared statements are a way of optimizing SQL queries by pre-compiling them and reusing them with different parameters. They can improve performance and security by avoiding SQL injection attacks.
  So, in your code, run is better for inserting and updating if you want to use prepared statements, and execute is better for selecting and deleting if you don’t need prepared statements. However, this is not a general rule for SQLite, but rather a design choice you made in your code. You could also use prepared statements for selecting and deleting, or not use them for inserting and updating. It depends on your needs and preferences.
  */

  //for inserting and updating with prepared statements
  async run(sql: string, values: any[]) {
    if (!this.db) {
      await this.createDatabase();
    }

    if (values === undefined) {
      return this.db.run(sql);
    } else {
      return this.db.run(sql, values as any);
    }
  }


  //for selecting and deleting 
  async execute(sql: string, values?: any[]) {
    if (!this.db) {
      await this.createDatabase();
    }

    if (values === undefined) {
      return this.db.execute(sql);
    } else {
      return this.db.execute(sql, values as any);
    }
  }
}
