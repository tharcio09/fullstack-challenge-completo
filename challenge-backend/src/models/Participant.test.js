require('dotenv').config();
const mongoose = require('mongoose');
const Participant = require('./Participant');

// Mock do MongoDB para testes
const mockParticipant = {
  firstName: 'João',
  lastName: 'Silva',
  participation: 25.5
};

describe('Participant Model', () => {
  beforeAll(async () => {
    // Conectar ao banco de teste com timeout maior
    if (!process.env.MONGO_URI_TEST) {
      throw new Error('MONGO_URI_TEST não está configurada');
    }
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 15000
    });
  }, 20000);

  afterAll(async () => {
    // Limpar e desconectar
    try {
      await Participant.deleteMany({});
    } catch (error) {
      console.log('Erro ao limpar participantes:', error.message);
    }
    await mongoose.connection.close();
  }, 15000);

  beforeEach(async () => {
    // Limpar a coleção antes de cada teste
    await Participant.deleteMany({});
  });

  describe('Validação de Campos', () => {
    test('deve criar um participante válido', async () => {
      const participant = new Participant(mockParticipant);
      const savedParticipant = await participant.save();
      
      expect(savedParticipant.firstName).toBe(mockParticipant.firstName);
      expect(savedParticipant.lastName).toBe(mockParticipant.lastName);
      expect(savedParticipant.participation).toBe(mockParticipant.participation);
      expect(savedParticipant._id).toBeDefined();
    });

    test('deve falhar sem firstName', async () => {
      const participantWithoutFirstName = { ...mockParticipant };
      delete participantWithoutFirstName.firstName;
      
      const participant = new Participant(participantWithoutFirstName);
      let err;
      
      try {
        await participant.save();
      } catch (error) {
        err = error;
      }
      
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.firstName).toBeDefined();
    });

    test('deve falhar sem lastName', async () => {
      const participantWithoutLastName = { ...mockParticipant };
      delete participantWithoutLastName.lastName;
      
      const participant = new Participant(participantWithoutLastName);
      let err;
      
      try {
        await participant.save();
      } catch (error) {
        err = error;
      }
      
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.lastName).toBeDefined();
    });

    test('deve falhar sem participation', async () => {
      const participantWithoutParticipation = { ...mockParticipant };
      delete participantWithoutParticipation.participation;
      
      const participant = new Participant(participantWithoutParticipation);
      let err;
      
      try {
        await participant.save();
      } catch (error) {
        err = error;
      }
      
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.participation).toBeDefined();
    });

    test('deve falhar com participation menor que 0', async () => {
      const participantWithInvalidParticipation = { ...mockParticipant, participation: -5 };
      
      const participant = new Participant(participantWithInvalidParticipation);
      let err;
      
      try {
        await participant.save();
      } catch (error) {
        err = error;
      }
      
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.participation).toBeDefined();
    });

    test('deve falhar com participation maior que 100', async () => {
      const participantWithInvalidParticipation = { ...mockParticipant, participation: 150 };
      
      const participant = new Participant(participantWithInvalidParticipation);
      let err;
      
      try {
        await participant.save();
      } catch (error) {
        err = error;
      }
      
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.participation).toBeDefined();
    });

    test('deve aceitar participation igual a 0', async () => {
      const participantWithZeroParticipation = { ...mockParticipant, participation: 0 };
      
      const participant = new Participant(participantWithZeroParticipation);
      const savedParticipant = await participant.save();
      
      expect(savedParticipant.participation).toBe(0);
    });

    test('deve aceitar participation igual a 100', async () => {
      const participantWithHundredParticipation = { ...mockParticipant, participation: 100 };
      
      const participant = new Participant(participantWithHundredParticipation);
      const savedParticipant = await participant.save();
      
      expect(savedParticipant.participation).toBe(100);
    });
  });

  describe('Operações CRUD', () => {
    test('deve encontrar todos os participantes', async () => {
      await Participant.create(mockParticipant);
      await Participant.create({ ...mockParticipant, firstName: 'Maria', lastName: 'Santos' });
      
      const participants = await Participant.find();
      expect(participants).toHaveLength(2);
    });

    test('deve encontrar participante por ID', async () => {
      const savedParticipant = await Participant.create(mockParticipant);
      const foundParticipant = await Participant.findById(savedParticipant._id);
      
      expect(foundParticipant.firstName).toBe(mockParticipant.firstName);
    });

    test('deve deletar participante por ID', async () => {
      const savedParticipant = await Participant.create(mockParticipant);
      await Participant.findByIdAndDelete(savedParticipant._id);
      
      const participants = await Participant.find();
      expect(participants).toHaveLength(0);
    });
  });
});
