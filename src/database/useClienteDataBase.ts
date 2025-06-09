// src/database/useClienteDataBase.ts
import { useSQLiteContext } from 'expo-sqlite';

export type ClienteDataBase = {
  id: number;
  nome: string;
  email: string;
  senha: string;
};

export function useClienteDataBase() {
  const dataBase = useSQLiteContext();

  // Cria a tabela, se não existir
  async function criarTabela() {
    await dataBase.execAsync(`
      CREATE TABLE IF NOT EXISTS login (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL
      );
    `);
  }

  // Inserir novo cliente
  async function create(data: Omit<ClienteDataBase, 'id'>) {
    await criarTabela(); // Garante que a tabela existe antes de inserir

    const statement = await dataBase.prepareAsync(
      'INSERT INTO login (email, nome, senha) VALUES ($email, $nome, $senha)'
    );

    try {
      const result = await statement.executeAsync({
        $email: data.email,
        $nome: data.nome,
        $senha: data.senha,
      });

      const insertedRowId = result.lastInsertRowId.toString();
      return { insertedRowId };
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  // Buscar cliente por e-mail
  async function getByEmail(email: string): Promise<ClienteDataBase | null> {
    const result = await dataBase.getAllAsync<ClienteDataBase>(
      'SELECT * FROM login WHERE email = ?',
      [email]
    );
    return result.length > 0 ? result[0] : null;
  }

  // Autenticação de login
  async function findByEmailAndSenha(email: string, senha: string): Promise<ClienteDataBase | null> {
    const result = await dataBase.getAllAsync<ClienteDataBase>(
      'SELECT * FROM login WHERE email = ? AND senha = ?',
      [email, senha]
    );
    return result.length > 0 ? result[0] : null;
  }
  
  
  

  

  return {
    create,
    getByEmail,
    findByEmailAndSenha,
    criarTabela,
  };
}
