const { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList, GraphQLSchema, GraphQLNonNull, GraphQLID } = require('graphql');
const Participant = require('./models/Participant');

// Tipo GraphQL para participante
const ParticipantType = new GraphQLObjectType({
  name: 'Participant',
  fields: {
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    participation: { type: GraphQLFloat },
  }
});

// Query raiz
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    participants: {
      type: new GraphQLList(ParticipantType),
      resolve() {
        // Retorna ordenado pelo nome para consistência
        return Participant.find().sort({ firstName: 1 });
      }
    },
    participant: {
      type: ParticipantType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve(_, args) {
        return Participant.findById(args.id);
      }
    }
  }
});

// Mutations
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addParticipant: {
      type: ParticipantType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        participation: { type: new GraphQLNonNull(GraphQLFloat) }
      },
      async resolve(_, args) {
        try {
          // Validação básica
          if (!args.firstName.trim() || !args.lastName.trim()) {
            throw new Error('Nome e sobrenome são obrigatórios');
          }

          if (args.participation < 0 || args.participation > 100) {
            throw new Error('A participação deve estar entre 0 e 100');
          }

          // Verificar se a soma das participações não excede 100%
          const existingParticipants = await Participant.find();
          const currentTotal = existingParticipants.reduce((sum, p) => sum + p.participation, 0);
          
          if (currentTotal + args.participation > 100) {
            throw new Error(`A soma das participações não pode exceder 100%. Atual: ${currentTotal.toFixed(2)}%, máximo permitido: ${(100 - currentTotal).toFixed(2)}%`);
          }

          const participant = new Participant({
            firstName: args.firstName.trim(),
            lastName: args.lastName.trim(),
            participation: args.participation
          });
          
          return await participant.save();
        } catch (error) {
          if (error.name === 'ValidationError') {
            throw new Error('Dados inválidos fornecidos');
          }
          throw error;
        }
      }
    },
    deleteParticipant: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve(_, args) {
        try {
          console.log('Tentando deletar participante com ID:', args.id);
          
          const participant = await Participant.findByIdAndDelete(args.id);
          
          if (!participant) {
            console.log('Participante não encontrado com ID:', args.id);
            throw new Error('Participante não encontrado');
          }
          
          console.log('Participante deletado com sucesso:', participant.firstName, participant.lastName);
          return `Participante ${participant.firstName} ${participant.lastName} removido com sucesso`;
        } catch (error) {
          console.error('Erro ao deletar participante:', error);
          throw new Error(`Erro ao deletar participante: ${error.message}`);
        }
      }
    }
  }
});

// Exporta o schema
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
