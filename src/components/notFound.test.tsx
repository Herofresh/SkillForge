import { Text } from 'react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import NotFound from '../../app/+not-found';

describe('unknown routes (PLAN 7.0a)', () => {
  it('redirect to the start instead of showing "Unmatched Route"', async () => {
    await renderRouter(
      {
        index: () => <Text>start</Text>,
        '+not-found': NotFound,
      },
      { initialUrl: '/does-not-exist' },
    );
    expect(await screen.findByText('start')).toBeOnTheScreen();
    expect(screen.queryByText(/Unmatched Route/)).toBeNull();
  });
});
