import { type SQLiteDatabase } from 'expo-sqlite';

export async function initializeDataBase(dataBase: SQLiteDatabase) {
  await dataBase.execAsync(`
  CREATE TABLE IF NOT EXISTS login (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL
  );
  
    );
  `);
}
