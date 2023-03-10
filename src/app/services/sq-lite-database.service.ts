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
        // await this.createDatabase();
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
        console.log('Database created');
      return this.db as SQLiteDBConnection;
    }
 }


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
