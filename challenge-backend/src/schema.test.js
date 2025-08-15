require('dotenv').config();
const { graphql } = require('graphql');
const schema = require('./schema');
const Participant = require('./models/Participant');
const mongoose = require('mongoose');

describe('GraphQL Schema', () => {
  beforeAll(async () => {
    if (!process.env.MONGO_URI_TEST) {
      throw new Error('MONGO_URI_TEST não está configurada');
    }
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 15000
    });
  }, 20000);

  afterAll(async () => {
    try {
      await Participant.deleteMany({});
    } catch (error) {
      console.log('Erro ao limpar participantes:', error.message);
    }
    await mongoose.connection.close();
  }, 15000);

  beforeEach(async () => {
    await Participant.deleteMany({});
  });

  describe('Queries', () => {
    test('deve retornar lista vazia de participantes', async () => {
      const query = `
        query {
          participants {
            id
            firstName
            lastName
            participation
          }
        }
      `;

      const result = await graphql(schema, query);
      
      expect(result.errors).toBeUndefined();
      expect(result.data.participants).toEqual([]);
    });

    test('deve retornar participantes existentes', async () => {
      const participant1 = await Participant.create({
        firstName: 'João',
        lastName: 'Silva',
        participation: 30
      });

      const participant2 = await Participant.create({
        firstName: 'Maria',
        lastName: 'Santos',
        participation: 70
      });

      const query = `
        query {
          participants {
            id
            firstName
            lastName
            participation
          }
        }
      `;

      const result = await graphql(schema, query);
      
      expect(result.errors).toBeUndefined();
      expect(result.data.participants).toHaveLength(2);
      expect(result.data.participants[0].firstName).toBe('João');
      expect(result.data.participants[1].firstName).toBe('Maria');
    });

    test('deve encontrar participante por ID', async () => {
      const participant = await Participant.create({
        firstName: 'João',
        lastName: 'Silva',
        participation: 30
      });

      const query = `
        query {
          participant(id: "${participant._id}") {
            id
            firstName
            lastName
            participation
          }
        }
      `;

      const result = await graphql(schema, query);
      
      expect(result.errors).toBeUndefined();
      expect(result.data.participant.firstName).toBe('João');
      expect(result.data.participant.lastName).toBe('Silva');
      expect(result.data.participant.participation).toBe(30);
    });
  });

  describe('Mutations', () => {
    test('deve adicionar participante válido', async () => {
      const mutation = `
        mutation {
          addParticipant(
            firstName: "João"
            lastName: "Silva"
            participation: 30.5
          ) {
            id
            firstName
            lastName
            participation
          }
        }
      `;

      const result = await graphql(schema, mutation);
      
      expect(result.errors).toBeUndefined();
      expect(result.data.addParticipant.firstName).toBe('João');
      expect(result.data.addParticipant.lastName).toBe('Silva');
      expect(result.data.addParticipant.participation).toBe(30.5);
    });

    test('deve falhar ao adicionar participante sem firstName', async () => {
      const mutation = `
        mutation {
          addParticipant(
            firstName: ""
            lastName: "Silva"
            participation: 30
          ) {
            id
            firstName
            lastName
            participation
          }
        }
      `;

      const result = await graphql(schema, mutation);
      
      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toContain('Nome e sobrenome são obrigatórios');
    });

    test('deve falhar ao adicionar participante com participation inválida', async () => {
      const mutation = `
        mutation {
          addParticipant(
            firstName: "João"
            lastName: "Silva"
            participation: 150
          ) {
            id
            firstName
            lastName
            participation
          }
        }
      `;

      const result = await graphql(schema, mutation);
      
      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toContain('A participação deve estar entre 0 e 100');
    });

    test('deve falhar ao adicionar participante que excede 100%', async () => {
      // Primeiro, adicionar um participante com 80%
      await Participant.create({
        firstName: 'João',
        lastName: 'Silva',
        participation: 80
      });

      // Tentar adicionar outro com 30% (total seria 110%)
      const mutation = `
        mutation {
          addParticipant(
            firstName: "Maria"
            lastName: "Santos"
            participation: 30
          ) {
            id
            firstName
            lastName
            participation
          }
        }
      `;

      const result = await graphql(schema, mutation);
      
      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toContain('A soma das participações não pode exceder 100%');
    });

    test('deve deletar participante existente', async () => {
      const participant = await Participant.create({
        firstName: 'João',
        lastName: 'Silva',
        participation: 30
      });

      const mutation = `
        mutation {
          deleteParticipant(id: "${participant._id}")
        }
      `;

      const result = await graphql(schema, mutation);
      
      expect(result.errors).toBeUndefined();
      expect(result.data.deleteParticipant).toContain('João Silva');
      expect(result.data.deleteParticipant).toContain('removido com sucesso');

      // Verificar se foi realmente deletado
      const remainingParticipants = await Participant.find();
      expect(remainingParticipants).toHaveLength(0);
    });

    test('deve falhar ao deletar participante inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const mutation = `
        mutation {
          deleteParticipant(id: "${fakeId}")
        }
      `;

      const result = await graphql(schema, mutation);
      
      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toContain('Participante não encontrado');
    });
  });
});
