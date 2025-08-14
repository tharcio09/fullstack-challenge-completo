<template>
  <form @submit.prevent="handleSubmit" class="form">
    <input 
      v-model="form.firstName" 
      type="text" 
      placeholder="First Name" 
      required 
      :disabled="loading"
    />
    <input 
      v-model="form.lastName" 
      type="text" 
      placeholder="Last Name" 
      required 
      :disabled="loading"
    />
    <input 
      v-model.number="form.participation" 
      type="number" 
      min="0" 
      max="100" 
      step="0.01"
      placeholder="Participation (%)" 
      required 
      :disabled="loading"
    />
    <button type="submit" :disabled="loading || !isFormValid">
      {{ loading ? "Enviando..." : "SEND" }}
    </button>
  </form>
</template>

<script>
import { reactive, computed } from "vue";

export default {
  name: "ParticipantForm",
  props: {
    loading: { type: Boolean, default: false }
  },
  emits: ["add"],
  setup(_, { emit }) {
    const form = reactive({
      firstName: "",
      lastName: "",
      participation: null
    });

    const isFormValid = computed(() => {
      return form.firstName.trim() && 
             form.lastName.trim() && 
             form.participation !== null && 
             form.participation >= 0 && 
             form.participation <= 100;
    });

    const handleSubmit = async () => {
      if (!isFormValid.value) return;
      
      await emit("add", { 
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        participation: parseFloat(form.participation)
      });
      
      // Reset form
      form.firstName = "";
      form.lastName = "";
      form.participation = null;
    };

    return { form, isFormValid, handleSubmit };
  }
};
</script>

<style scoped>

.form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  max-width: 800px;
  width: 100%;
  justify-content: center;
}

.form input {
  flex: 1;
  padding: 15px 15px;
  border: 1.8px solid #d3d3d3;
  border-radius: 3px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form input:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 5px #0078d4;
}

.form button {
  background-color: #2bcdff;
  border: 1px solid #fff;
  color: #fff;
  padding: 11px 22px;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.form button:hover {
  background-color: #00a200;
}
@media (max-width: 1200px) {
  .form {
    flex-direction: column;
    gap: 10px;
    max-width: 90%;
    margin: 0 auto;
  }

  .form input,
  .form button {
    width: 80%;
    font-size: 0.9rem;
    padding: 12px;
  }

  .form button {
    font-size: 1rem;
  }
}

/* Para tablets e telas médias */
@media (max-width: 768px) {
  .form {
    flex-direction: column;
    gap: 10px;
    max-width: 90%;
    margin: 0 auto;
  }

  .form input,
  .form button {
    display: block;
    width: 80%;
    font-size: 0.85rem;
    padding: 14px;
  }

  .form button {
    width: 50%;
  }
}

/* Para celulares pequenos */
@media (max-width: 480px) {
  .form {
    flex-direction: column;
    gap: 8px;
    max-width: 95%;
    margin: 0 auto;
  }

  .form input,
  .form button {
    width: 100%;
    font-size: 0.8rem;
    padding: 12px;
  }

  .form button {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  input, select, button {
    width: 100%;
  }
}


</style>
