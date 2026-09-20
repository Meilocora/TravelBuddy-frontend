import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../test-utils/render';
import { createJourney, updateJourney } from '../../../utils/http';
import JourneyForm from './JourneyForm';

const mockCreateJourney = jest.fn() as jest.MockedFunction<
  typeof createJourney
>;
const mockUpdateJourney = jest.fn() as jest.MockedFunction<
  typeof updateJourney
>;

jest.mock('../../../utils/http', () => ({
  createJourney: (...args: Parameters<typeof createJourney>) =>
    mockCreateJourney(...args),
  updateJourney: (...args: Parameters<typeof updateJourney>) =>
    mockUpdateJourney(...args),
}));

jest.mock('../../../utils', () => {
  const {
    formatAmount,
    formatDate,
    parseDate,
  } = require('../../../utils/formatting');

  return {
    formatAmount,
    formatDate,
    parseDate,
  };
});

jest.mock('../../UI/Button', () => {
  return function MockButton({ children, onPress, disabled }: any) {
    const { Pressable, Text } = require('react-native');

    return (
      <Pressable disabled={disabled} onPress={onPress}>
        <Text>{children}</Text>
      </Pressable>
    );
  };
});

jest.mock('../../UI/form/Input', () => {
  return function MockInput({
    label,
    mandatory,
    textInputConfig,
    errors,
  }: any) {
    const { Text, TextInput, View } = require('react-native');

    return (
      <View>
        <Text>{`${label}${mandatory ? ' *' : ''}`}</Text>
        <TextInput
          accessibilityLabel={label}
          value={textInputConfig?.value ?? ''}
          onChangeText={textInputConfig?.onChangeText}
          placeholder={textInputConfig?.placeholder}
          readOnly={textInputConfig?.readOnly}
        />
        {errors?.map((error: string) => (
          <Text key={error}>{error}</Text>
        ))}
      </View>
    );
  };
});

jest.mock('../../UI/form/ExpoDatePicker', () => {
  return function MockDatePicker({
    handleChange,
    inputIdentifier,
    label,
  }: any) {
    const { Pressable, Text } = require('react-native');

    return (
      <Pressable
        onPress={() => handleChange(inputIdentifier, new Date(2026, 8, 20))}
      >
        <Text>{label}</Text>
      </Pressable>
    );
  };
});

jest.mock('./CountriesSelectionForm', () => {
  return function MockCountriesSelectionForm() {
    const { Text } = require('react-native');

    return <Text>Countries selection</Text>;
  };
});

jest.mock('../../UI/Modal', () => {
  return function MockModal() {
    return null;
  };
});

describe('JourneyForm', () => {
  it('shows the calculated end date when start date and duration are entered', async () => {
    const onCancel = jest.fn();
    const onSubmit = jest.fn();

    const { getByLabelText, getByText, queryByText } = renderWithProviders(
      <JourneyForm
        onCancel={onCancel}
        onSubmit={onSubmit}
        submitButtonLabel='Create'
      />,
    );

    fireEvent.changeText(getByLabelText('Duration'), '3');
    fireEvent.press(getByText('Starts on'));

    await waitFor(() => {
      expect(queryByText('Ends on 22.09.2026')).toBeTruthy();
    });
  });

  it('submits the current journey values through createJourney', async () => {
    const onCancel = jest.fn();
    const onSubmit = jest.fn();

    mockCreateJourney.mockResolvedValueOnce({
      journey: {
        id: 1,
        name: 'Berlin Trip',
        description: 'City break',
        scheduled_start_time: '20.09.2026',
        scheduled_end_time: '22.09.2026',
        duration_days: 3,
        costs: {} as never,
        countries: [],
      },
      status: 201,
    });

    const { getByLabelText, getByText } = renderWithProviders(
      <JourneyForm
        onCancel={onCancel}
        onSubmit={onSubmit}
        submitButtonLabel='Create'
      />,
    );

    fireEvent.changeText(getByLabelText('Name'), 'Berlin Trip');
    fireEvent.changeText(getByLabelText('Duration'), '3');
    fireEvent.press(getByText('Starts on'));
    fireEvent.press(getByText('Create'));

    await waitFor(() => {
      expect(mockCreateJourney).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.objectContaining({ value: 'Berlin Trip' }),
          duration_days: expect.objectContaining({ value: '3' }),
          scheduled_start_time: expect.objectContaining({
            value: '20.09.2026',
          }),
        }),
      );
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 201,
          journey: expect.objectContaining({ name: 'Berlin Trip' }),
        }),
      );
    });
  });
});
