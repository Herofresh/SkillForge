import { render, screen, userEvent } from '@testing-library/react-native';

import { ErrorBoundary } from '../../app/_layout';

import { RootErrorScreen } from './RootErrorScreen';

describe('RootErrorScreen (PLAN 7.0a)', () => {
  it('says what happened and retries on "Try again"', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();
    await render(<RootErrorScreen onRetry={onRetry} />);
    expect(screen.getByRole('header', { name: 'Something went wrong' })).toBeOnTheScreen();
    expect(screen.getByText(/Your data is safe on this device/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("is the root layout's error boundary and calls expo-router's retry", async () => {
    const retry = jest.fn(async () => undefined);
    const user = userEvent.setup();
    await render(<ErrorBoundary error={new Error('boom')} retry={retry} />);
    await user.press(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
