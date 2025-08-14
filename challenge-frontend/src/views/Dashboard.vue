<template>
  <div class="dashboard">
    <!-- Faixa azul com inputs -->
    <div id="input-header">
      <ParticipantForm @add="addParticipant" :loading="loading" />
    </div>

    <!-- Título + frase -->
    <div class="title-section">
      <h1>DATA</h1>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>

    <!-- Conteúdo principal -->
    <div v-if="error" class="error-message">
      <p>Erro ao carregar dados: {{ error }}</p>
      <button @click="retryLoad" class="retry-button">Tentar novamente</button>
    </div>

    <div class="content-row" v-else-if="participants.length">
      <div class="table-container">
        <ParticipantsTable 
          :participants="participants" 
          :loading="loading"
          @delete="deleteParticipant" 
        />
      </div>

      <div class="chart-container">
        <PieChart :data="chartData" />
      </div>
    </div>

    <p v-else-if="!loading" class="empty-message">Nenhum participante cadastrado ainda.</p>
    
    <div v-else class="loading-message">
      <p>Carregando participantes...</p>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import PieChart from "../components/PieChart.vue";
import ParticipantForm from "../components/ParticipantForm.vue";
import ParticipantsTable from "../components/ParticipantsTable.vue";
import { GET_PARTICIPANTS } from "../graphql/queries";
import { ADD_PARTICIPANT, DELETE_PARTICIPANT } from "../graphql/mutations";

export default {
  name: "Dashboard",
  components: { PieChart, ParticipantForm, ParticipantsTable },
  setup() {
    const participants = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const { result, loading: queryLoading, error: queryError, refetch } = useQuery(GET_PARTICIPANTS);
    
    const { mutate: addParticipantMutation } = useMutation(ADD_PARTICIPANT, {
      update(cache, { data: { addParticipant } }) {
        try {
          const existingData = cache.readQuery({ query: GET_PARTICIPANTS });
          cache.writeQuery({
            query: GET_PARTICIPANTS,
            data: {
              participants: [...(existingData?.participants || []), addParticipant],
            },
          });
        } catch (err) {
          console.error('Erro ao atualizar cache:', err);
        }
      },
    });

    const { mutate: deleteParticipantMutation } = useMutation(DELETE_PARTICIPANT, {
      update(cache, { data }, { variables }) {
        try {
          const existingData = cache.readQuery({ query: GET_PARTICIPANTS });
          if (existingData?.participants) {
            cache.writeQuery({
              query: GET_PARTICIPANTS,
              data: {
                participants: existingData.participants.filter(p => p.id !== variables.id),
              },
            });
          }
        } catch (err) {
          console.error('Erro ao atualizar cache:', err);
        }
      },
      onError(error) {
        console.error('Erro na mutation de exclusão:', error);
      }
    });

    watch(result, (newResult) => {
      if (newResult?.participants) {
        participants.value = newResult.participants;
        error.value = null;
      }
    });

    watch(queryError, (newError) => {
      if (newError) {
        error.value = newError.message || 'Erro desconhecido';
      }
    });

    const addParticipant = async (formData) => {
      loading.value = true;
      error.value = null;
      
      try {
        await addParticipantMutation(formData);
      } catch (e) {
        console.error("Erro ao adicionar participante:", e);
        error.value = e.message || 'Erro ao adicionar participante';
      } finally {
        loading.value = false;
      }
    };

    const deleteParticipant = async (id) => {
      loading.value = true;
      error.value = null;
      
      try {
        console.log('Tentando deletar participante com ID:', id);
        
        // Verificar se o ID é válido
        if (!id) {
          throw new Error('ID do participante é inválido');
        }
        
        const result = await deleteParticipantMutation({ 
          id: id.toString() 
        });
        
        console.log('Resultado da exclusão:', result);
        
        // Se chegou aqui, a exclusão foi bem-sucedida
        // O cache já foi atualizado automaticamente
        
      } catch (e) {
        console.error("Erro ao deletar participante:", e);
        
        // Tratamento específico de erros
        if (e.networkError) {
          error.value = 'Erro de conexão. Verifique se o servidor está rodando.';
        } else if (e.graphQLErrors && e.graphQLErrors.length > 0) {
          error.value = e.graphQLErrors[0].message;
        } else {
          error.value = e.message || 'Erro ao deletar participante';
        }
      } finally {
        loading.value = false;
      }
    };

    const retryLoad = async () => {
      error.value = null;
      try {
        await refetch();
      } catch (err) {
        error.value = err.message || 'Erro ao recarregar dados';
      }
    };

    const chartData = computed(() => ({
      labels: participants.value.map((p) => `${p.firstName} ${p.lastName}`),
      datasets: [
        {
          label: "Participação",
          backgroundColor: [
            "#36A2EB", // Azul
            "#00CED1", // Verde-água
            "#9C27B0", // Roxo
            "#E0E0E0", // Cinza claro
            "#FF6384", // Vermelho
            "#FFCE56", // Amarelo
            "#4CAF50", // Verde
          ],
          data: participants.value.map((p) => p.participation),
        },
      ],
    }));

    return { 
      participants, 
      addParticipant, 
      deleteParticipant,
      chartData, 
      loading: computed(() => loading.value || queryLoading.value),
      error,
      retryLoad
    };
  },
};
</script>

<style scoped>
#input-header {
  background-color: #2bcdff;
  padding: 30px 20px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.dashboard {
  margin: 0 auto;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fff;
}

.title-section {
  text-align: center;
  margin: 20px 0;
}

.title-section h1 {
  font-size: 2rem;
  margin-bottom: 5px;
  color: #333;
}

.title-section p {
  font-size: 1rem;
  color: #666;
}

.content-row {
  display: flex;
  flex-wrap: wrap;
  gap: 200px;
  padding: 20px;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
}

.table-container {
  flex: 0 1 500px;
  min-width: 450px;
  max-width: 550px;
}

.chart-container {
  flex: 0 1 500px;
  min-width: 400px;
  max-width: 550px;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  position: relative;
}

.empty-message {
  text-align: center;
  color: #777;
  font-size: 1rem;
  margin-top: 20px;
}

.error-message {
  text-align: center;
  color: #d32f2f;
  font-size: 1rem;
  margin: 20px;
  padding: 20px;
  background-color: #ffebee;
  border-radius: 8px;
  border: 1px solid #ffcdd2;
}

.retry-button {
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 0.9rem;
}

.retry-button:hover {
  background-color: #b71c1c;
}

.loading-message {
  text-align: center;
  color: #666;
  font-size: 1rem;
  margin-top: 20px;
}

/* Responsividade melhorada */
@media (max-width: 1200px) {
  .content-row {
    max-width: 1100px;
    gap: 50px;
    padding: 15px;
  }
  
  .table-container,
  .chart-container {
    flex: 0 1 480px;
  }
}

@media (max-width: 1024px) {
  .content-row {
    flex-direction: column;
    align-items: center;
    gap: 40px;
    max-width: 800px;
  }
  
  .table-container {
    width: 100%;
    max-width: 700px;
    min-width: auto;
    flex: none;
  }
  
  .chart-container {
    width: 100%;
    max-width: 600px;
    height: 400px;
    min-width: auto;
    flex: none;
  }
}

@media (max-width: 768px) {
  .content-row {
    padding: 10px;
    gap: 35px;
  }
  
  .chart-container {
    height: 320px;
  }
  
  .title-section h1 {
    font-size: 1.5rem;
  }
  
  .title-section p {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .content-row {
    padding: 5px;
    gap: 30px;
  }
  
  .chart-container {
    height: 280px;
    min-width: 280px;
  }
  
  .table-container {
    min-width: 280px;
  }
}
</style>
