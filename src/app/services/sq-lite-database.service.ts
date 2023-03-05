/* eslint-disable @angular-eslint/contextual-lifecycle */
import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';


@Injectable({
  providedIn: 'root'
})
export class SqLiteDatabaseService {
  public db: SQLiteDBConnection | any;

  constructor() { }

  async createDatabase(): Promise<SQLiteDBConnection> {
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
    return this.db;
    // await db.execute(
    //   `INSERT INTO places (name, latitude, longitude)
    //   VALUES (?, ?, ?);`, 
    //   [placeName, placeLatitudeFirst, placeLongitudeFirst, placeLatitudeSecond, placeLongitudeSecond]
    // );

    // const result = await db.query(
    //   `SELECT id, name, latitudeFirst, longitudeFirst, latitudeSecond, longitudeSecond
    //   FROM places;`
    // );

    // const places = result.values;
  }
  async execute(sql: string, values?: any[]): Promise<any> {
    if (!this.db) {
      await this.createDatabase();
    }

    return this.db.execute(sql, values as any);
  }


}
