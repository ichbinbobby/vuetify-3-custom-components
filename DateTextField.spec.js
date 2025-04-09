import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import DateTextField from '@/components/Shared/Date/DateTextField.vue'
import ResizeObserver from 'resize-observer-polyfill'

const vuetify = createVuetify({
  components,
  directives,
})

// Assign ResizeObserver globally
globalThis.ResizeObserver = ResizeObserver

test('updates dateText in German format when a date is selected from the date picker', async () => {
  const wrapper = mount(DateTextField, {
    global: {
      plugins: [vuetify],
    },
  });

  // Open the v-menu to render the VDatePicker
  wrapper.vm.dateMenu = true; // Directly set the reactive variable

  // Wait for the DOM to update
  await wrapper.vm.$nextTick();

  // Find the VDatePicker component
  const datePicker = wrapper.findComponent({ name: 'VDatePicker' });

  // Ensure the date picker is found
  expect(datePicker.exists()).toBe(true);

  // Simulate selecting a date by directly updating the dateModel
  wrapper.vm.dateModel = new Date('2023-10-31'); // October 31, 2023

  // Wait for the DOM to update
  await wrapper.vm.$nextTick();

  // Assert that dateText is updated in German date format (dd.mm.yyyy)
  const germanFormattedDate = '31.10.2023';
  expect(wrapper.vm.dateText).toBe(germanFormattedDate);
});

test('updates dateModel when a German format is typed in the text field', async () => {
  const wrapper = mount(DateTextField, {
    global: {
      plugins: [vuetify],
    },
  });

  // Find the VTextField component
  const textField = wrapper.findComponent({ name: 'VTextField' });

  // Simulate typing a German-formatted date into the text field
  const germanDate = '24.12.2024'; // December 24, 2024
  await textField.setValue(germanDate);

  // Simulate the blur event to trigger parsing
  await textField.trigger('blur');

  // Assert that the dateModel is updated with the correct Date object
  const expectedDate = new Date('2024-12-24'); // December 24, 2024
  expect(wrapper.vm.dateModel).toEqual(expectedDate);
});

test('sets dateModel to null when an invalid date is typed in the text field', async () => {
  const wrapper = mount(DateTextField, {
    global: {
      plugins: [vuetify],
    },
  });

  // Find the VTextField component
  const textField = wrapper.findComponent({ name: 'VTextField' });

  // Simulate typing an invalid date into the text field
  const invalidDate = 'invalid-date';
  await textField.setValue(invalidDate);

  // Simulate the blur event to trigger parsing
  await textField.trigger('blur');

  // Assert that the dateModel is set to null
  expect(wrapper.vm.dateModel).toBeNull();
});

test('sets dateModel to null when the text field is cleared', async () => {
  const wrapper = mount(DateTextField, {
    global: {
      plugins: [vuetify],
    },
  });

  // Find the VTextField component
  const textField = wrapper.findComponent({ name: 'VTextField' });

  // Simulate clearing the text field
  await textField.setValue('');

  // Simulate the blur event to trigger parsing
  await textField.trigger('blur');

  // Assert that the dateModel is set to null
  expect(wrapper.vm.dateModel).toBeNull();
});

test('clears dateModel and dateText when the clear icon is clicked', async () => {
  const wrapper = mount(DateTextField, {
    global: {
      plugins: [vuetify],
    },
  });

  // Find the VTextField component
  const textField = wrapper.findComponent({ name: 'VTextField' });

  // Set an initial date in the text field and dateModel
  wrapper.vm.dateModel = new Date('2025-03-17'); // March 17, 2025

  // Wait for the DOM to update
  await wrapper.vm.$nextTick();

  // Assert that dateText is updated to the new German date format
  expect(wrapper.vm.dateText).toBe('17.03.2025');

  // Simulate clicking the clear icon
  await textField.vm.$emit('click:clear');

  // Assert that dateModel is set to null
  expect(wrapper.vm.dateModel).toBeNull();

  // Assert that dateText is cleared
  expect(wrapper.vm.dateText).toBe('');
});

test('does not allow a date outside the allowed range', async () => {
  const wrapper = mount(DateTextField, {
    props: {
      min: '2023-01-01',
      max: '2023-12-31',
    },
    global: {
      plugins: [vuetify],
    },
  });

  // Find the VTextField component
  const textField = wrapper.findComponent({ name: 'VTextField' });

  // Simulate typing a date outside the allowed range
  const outOfRangeDate = '01.01.2024'; // January 1, 2024
  await textField.setValue(outOfRangeDate);

  // Simulate the blur event to trigger parsing
  await textField.trigger('blur');

  // Assert that the dateModel is not updated
  expect(wrapper.vm.dateModel).toBeNull();
});
