<template>
  <v-text-field
    v-model="dateText"
    clearable
    density="compact"
    hide-details="auto"
    :label="label"
    :rules="[rules.germanDateFormat, rules.dateInRange]"
    :width="width"
    :variant="variant"
    @blur="onBlur"
    @keydown.enter="onEnter"
    @click:clear="clearDate"
  >
    <template #prepend>
      <v-menu
        v-model="dateMenu"
        :close-on-content-click="false"
      >
        <template #activator="{ props: menu }">
          <v-icon
            v-bind="menu"
            icon="mdi-calendar"
          />
        </template>

        <v-date-picker
          v-model="dateModel"
          :allowed-dates="allowedDates"
          :max="max"
          :min="min"
        />
      </v-menu>
    </template>
  </v-text-field>
</template>

<script setup>
import { ref, watch } from 'vue';

// Define props
const props = defineProps({
  allowedDates: {
    type: Array,
    default: undefined,
  },

  density: {
    type: String,
    default: 'compact',
  },

  label: {
    type: String,
    default: '',
  },

  max: {
    type: String,
    default: undefined,
  },

  min: {
    type: String,
    default: undefined,
  },

  width: {
    type: [String, Number],
    default: undefined,
  },

  variant: {
    type: String,
    default: 'filled',
  },
});

// Destructure min and max props
const { min, max } = props;

// Define emits for v-model bindings
const emit = defineEmits(['update:dateModel', 'update:dateText']);

// Reactive variables
const dateText = ref('');
const dateMenu = ref(false);
const dateModel = ref(null);

const rules = {
  germanDateFormat: value => {
    if (!value) return true; // Allow empty values (handled by `required` rule)
    const regex = /^\d{1,2}[./]\d{1,2}[./]\d{4}$/; // Matches dd.mm.yyyy or dd/mm/yyyy
    return regex.test(value) || 'Invalid date format (use dd.mm.yyyy)';
  },

  dateInRange: value => {
    if (!value) return true; // Allow empty values
    const [day, month, year] = value.split(/[./]/); // Split by . or /
    if (day && month && year) {
      const parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      if (!isNaN(parsedDate.getTime()) && isDateInRange(parsedDate)) {
        return true; // Date is valid and in range
      }
    }
    return `Date must be in allowed range`;
  },
};

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

// Helper function to validate date range
function isDateInRange(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }

  const minDate = min ? new Date(min) : null;
  const maxDate = max ? new Date(max) : null;

  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;

  return true;
}

// Parse the dateText into dateModel when the input loses focus
function onBlur() {
  parseDateText();
}

// Parse the dateText into dateModel when Enter is pressed
function onEnter() {
  parseDateText();
}

// Parse the dateText into dateModel when the input loses focus
function parseDateText() {
  if (!dateText.value) {
    dateModel.value = null; // Clear the date if the text is empty
    emit('update:dateText', ''); // Emit empty string to the parent
    return;
  }

  // Parse the German date format (dd.mm.yyyy)
  const [day, month, year] = dateText.value.split(/[./]/); // Split by . or /

  if (day && month && year) {
    const parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);

    if (!isNaN(parsedDate.getTime()) && isDateInRange(parsedDate)) {
      dateModel.value = parsedDate; // Update the model if the date is valid and in range
      emit('update:dateModel', parsedDate); // Emit the updated dateModel to the parent
    } else {
      dateModel.value = null; // Set to null if the date is out of range
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
</script>
