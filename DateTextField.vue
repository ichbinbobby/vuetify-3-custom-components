<template>
  <v-text-field
    v-model="dateText"
    clearable
    density="compact"
    hide-details="auto"
    :label="label"
    @blur="onBlur"
    @keydown.enter="onEnter"
    @click:clear="clearDate"
  >
    <template #prepend>
      <v-menu
        v-model="dateMenu"
        :close-on-content-click="true"
      >
        <template #activator="{ props: menu }">
          <v-icon
            v-bind="menu"
            icon="mdi-calendar"
          />
        </template>

        <v-date-picker
          v-model="dateModel"
          @update:model-value="onDatePickerUpdate"
        />
      </v-menu>
    </template>
  </v-text-field>
</template>

<script setup>
import { ref, watch, defineEmits, defineProps } from 'vue';

// Define props
defineProps({
  density: {
    type: String,
    default: 'compact',
  },
  label: {
    type: String,
    default: '',
  },
});

// Define emits for v-model bindings
const emit = defineEmits(['update:dateModel', 'update:dateText']);

// Reactive variables
const dateText = ref('');
const dateMenu = ref(false);
const dateModel = ref(null);

// Watch for changes to dateModel and update dateText accordingly
watch(dateModel, (newDate) => {
  if (newDate instanceof Date && !isNaN(newDate.getTime())) {
    // Format the date as dd.mm.yyyy for display
    dateText.value = new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(newDate);

    // Emit the updated dateModel to the parent
    emit('update:dateModel', newDate);
  } else {
    dateText.value = ''; // Clear the text if the date is invalid or null
    emit('update:dateModel', null); // Emit null to the parent
  }
});

// Parse the dateText into dateModel when the input loses focus
function onBlur() {
  parseDateText();
}

// Parse the dateText into dateModel when Enter is pressed
function onEnter() {
  parseDateText();
}

// Common function to parse dateText into dateModel
function parseDateText() {
  if (!dateText.value) {
    dateModel.value = null; // Clear the date if the text is empty
    emit('update:dateText', ''); // Emit empty string to the parent
    return;
  }

  // Parse the German date format (dd.mm.yyyy)
  const [day, month, year] = dateText.value.split('.');
  if (day && month && year) {
    const parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!isNaN(parsedDate.getTime())) {
      dateModel.value = parsedDate; // Update the model if the date is valid
      emit('update:dateModel', parsedDate); // Emit the updated dateModel to the parent
    }
  }

  // Emit the updated dateText to the parent
  emit('update:dateText', dateText.value);
}

// Clear the date when the clear button is clicked
function clearDate() {
  dateText.value = '';
  dateModel.value = null;
  emit('update:dateText', '');
  emit('update:dateModel', null);
}

// Handle updates from the date picker
function onDatePickerUpdate(value) {
  dateModel.value = value; // Update the dateModel
}
</script>