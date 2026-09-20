import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import Input from './Input';

describe('Input', () => {
  it('renders label, value and validation errors', () => {
    const { getByText, getByDisplayValue } = render(
      <Input
        label='Name'
        maxLength={20}
        textInputConfig={{ value: 'Berlin' }}
        errors={['Required']}
      />,
    );

    expect(getByText('Name')).toBeTruthy();
    expect(getByDisplayValue('Berlin')).toBeTruthy();
    expect(getByText('Required')).toBeTruthy();
  });
});
