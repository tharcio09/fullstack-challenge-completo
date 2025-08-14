<template>
  <table class="data-table">
    <thead>
      <tr>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Participation (%)</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="participant in participants" :key="participant.id">
        <td>{{ participant.firstName }}</td>
        <td>{{ participant.lastName }}</td>
        <td>{{ participant.participation }}%</td>
        <td>
          <button 
            @click="deleteParticipant(participant.id, participant.firstName, participant.lastName)"
            class="delete-btn"
            :disabled="loading"
            title="Excluir participante"
          >
            🗑️
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: "ParticipantsTable",
  props: {
    participants: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['delete'],
  setup(_, { emit }) {
    const deleteParticipant = (id, firstName, lastName) => {
      if (confirm(`Tem certeza que deseja excluir ${firstName} ${lastName}?`)) {
        emit('delete', id);
      }
    };

    return { deleteParticipant };
  }
};
</script>

<style scoped>
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 35px;
  border: 1px solid #ccc;
}

.data-table th,
.data-table td {
  border: 1px solid #ccc;
  padding: 10px 14px;
  text-align: center;
  font-size: 1rem;
  color: #444;
}

.data-table th {
  background-color: #2bcdff;
  color: white;
  font-weight: 600;
}

.data-table tr:last-child td {
  border-bottom: 1px solid #ccc;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background-color: #ffebee;
  transform: scale(1.1);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.delete-btn:disabled:hover {
  background-color: transparent;
  transform: none;
}
</style>




