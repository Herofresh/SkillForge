import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';

import { NODE_BY_ID } from '@/data/skills';
import type { ExerciseNode } from '@/domain/types';

import { NodeRow } from './NodeRow';
import { OnboardingScaffold } from './onboarding/OnboardingScaffold';
import { NumberStepper, PixelChip, PixelText, PixelTextInput } from './ui';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const node = (id: string): ExerciseNode => NODE_BY_ID.get(id) as ExerciseNode;

describe('PixelChip', () => {
  it('announces and toggles its checked state', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<PixelChip label="Rings" selected={false} onPress={onPress} />);
    const chip = screen.getByRole('checkbox', { name: 'Rings' });
    expect(chip).not.toBeChecked();
    await user.press(chip);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('can act as a selected tab', async () => {
    await render(<PixelChip label="Planche" role="tab" selected onPress={jest.fn()} />);
    expect(screen.getByRole('tab', { name: 'Planche' })).toBeSelected();
  });
});

describe('NumberStepper', () => {
  it('steps up and down and can disable the minus', async () => {
    const onIncrement = jest.fn();
    const onDecrement = jest.fn();
    const user = userEvent.setup();
    await render(
      <NumberStepper
        label="Set 1"
        valueText="30 s"
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        decrementDisabled
      />,
    );
    expect(screen.getByText('30 s')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'More for Set 1' }));
    expect(onIncrement).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Less for Set 1' })).toBeDisabled();
  });
});

describe('PixelTextInput', () => {
  it('is labelled and reports typing', async () => {
    const onChangeText = jest.fn();
    await render(<PixelTextInput label="Name your hero" value="" onChangeText={onChangeText} />);
    await fireEvent.changeText(screen.getByLabelText('Name your hero'), 'Aria');
    expect(onChangeText).toHaveBeenLastCalledWith('Aria');
  });
});

describe('NodeRow', () => {
  it('shows name, tier and OG level, and reads them out', async () => {
    await render(<NodeRow node={node('tuck_planche')} status="Goal" />);
    expect(screen.getByText('Tuck planche')).toBeOnTheScreen();
    expect(screen.getByText('Beginner')).toBeOnTheScreen();
    expect(screen.getByText('OG 5')).toBeOnTheScreen();
    expect(screen.getByText('Straight-arm')).toBeOnTheScreen();
    expect(screen.getByLabelText('Tuck planche, OG level 5, straight-arm, Goal')).toBeOnTheScreen();
  });

  it('is a checkbox when it picks a node', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<NodeRow node={node('pull_up')} role="checkbox" selected onPress={onPress} />);
    const row = screen.getByRole('checkbox', { name: 'Pull-up, OG level 2' });
    expect(row).toBeChecked();
    await user.press(row);
    expect(onPress).toHaveBeenCalled();
  });
});

describe('OnboardingScaffold', () => {
  it('shows the step, the title and the footer actions', async () => {
    const onBack = jest.fn();
    const onNext = jest.fn();
    const user = userEvent.setup();
    await render(
      <OnboardingScaffold
        step="goals"
        icon="star"
        title="Choose your quests"
        subtitle="Pick skills."
        onBack={onBack}
        skip={{ label: 'Later', onPress: jest.fn() }}
        next={{ label: 'Next', onPress: onNext, disabled: true }}>
        <PixelText>content</PixelText>
      </OnboardingScaffold>,
    );
    expect(screen.getByText('Step 3 / 5')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Choose your quests' })).toBeOnTheScreen();
    expect(screen.getByText('content')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    await user.press(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Later' })).toBeOnTheScreen();
  });
});
