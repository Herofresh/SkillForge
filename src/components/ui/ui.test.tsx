import { render, screen, userEvent } from '@testing-library/react-native';

import { animationFor } from '@/data/animations';

import { Colors, TierColors } from '../theme';

import { EmptyState } from './EmptyState';
import { LevelBadge } from './LevelBadge';
import { LevelUpBurst } from './LevelUpBurst';
import { PixelAnimation } from './PixelAnimation';
import { PixelButton } from './PixelButton';
import { PixelFrame } from './PixelFrame';
import { PixelIcon } from './PixelIcon';
import { PixelModal } from './PixelModal';
import { PixelText } from './PixelText';
import { StatBar } from './StatBar';
import { TierChip } from './TierChip';
import { WarningBanner } from './WarningBanner';
import { XPBar } from './XPBar';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe('PixelText', () => {
  it('renders its text in the variant font with the default tone', async () => {
    await render(<PixelText variant="title">Skill Tree</PixelText>);
    expect(screen.getByText('Skill Tree')).toHaveStyle({
      fontFamily: 'Jersey15_400Regular',
      fontSize: 28,
      color: Colors.gold,
    });
  });

  it('takes a tone', async () => {
    await render(<PixelText tone="textMuted">muted</PixelText>);
    expect(screen.getByText('muted')).toHaveStyle({ color: Colors.textMuted });
  });
});

describe('PixelFrame', () => {
  it('renders its children', async () => {
    await render(
      <PixelFrame testID="frame">
        <PixelText>inside</PixelText>
      </PixelFrame>,
    );
    expect(screen.getByTestId('frame')).toContainElement(screen.getByText('inside'));
  });
});

describe('PixelButton', () => {
  it('is an accessible button that calls onPress', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<PixelButton label="Start Trial" onPress={onPress} />);
    await user.press(screen.getByRole('button', { name: 'Start Trial' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled and says so', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<PixelButton label="Locked" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Locked' });
    expect(button).toBeDisabled();
    await user.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('XPBar', () => {
  it('lights segments for the fraction and exposes a progress value', async () => {
    await render(<XPBar fraction={0.62} valueText="124 / 200 XP" testID="xp" />);
    expect(screen.getAllByTestId('segment-lit')).toHaveLength(6);
    expect(screen.getAllByTestId('segment-dark')).toHaveLength(4);
    expect(screen.getByRole('progressbar', { name: 'XP' })).toHaveAccessibilityValue({
      now: 62,
      text: '124 / 200 XP',
    });
    expect(screen.getByText('124 / 200 XP')).toBeOnTheScreen();
  });
});

describe('StatBar', () => {
  it('shows the label and value, scaled to max', async () => {
    await render(<StatBar label="push" value={21} max={42} color={Colors.ember} segments={8} />);
    expect(screen.getByText('push')).toBeOnTheScreen();
    expect(screen.getByText('21')).toBeOnTheScreen();
    expect(screen.getAllByTestId('segment-lit')).toHaveLength(4);
  });

  it('is empty when max is 0', async () => {
    await render(<StatBar label="legs" value={0} max={0} color={Colors.success} />);
    expect(screen.queryAllByTestId('segment-lit')).toHaveLength(0);
  });
});

describe('LevelBadge', () => {
  it('shows the level and reads it out', async () => {
    await render(<LevelBadge level={7} />);
    expect(screen.getByText('7')).toBeOnTheScreen();
    expect(screen.getByLabelText('Level 7')).toBeOnTheScreen();
  });
});

describe('TierChip', () => {
  it('names the tier in its tier color', async () => {
    await render(<TierChip tier="advanced" />);
    expect(screen.getByText('Advanced')).toHaveStyle({ color: TierColors.advanced });
    expect(screen.getByLabelText('Advanced tier')).toBeOnTheScreen();
  });
});

describe('PixelIcon', () => {
  it('is hidden from screen readers without a label', async () => {
    await render(<PixelIcon name="sword" testID="icon" />);
    expect(screen.getByTestId('icon', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.queryByRole('image')).toBeNull();
  });

  it('is an image with a label', async () => {
    await render(<PixelIcon name="heart" label="Health" />);
    expect(screen.getByRole('image', { name: 'Health' })).toBeOnTheScreen();
  });
});

describe('WarningBanner', () => {
  it('asks for an acknowledgement and reports it', async () => {
    const onAcknowledge = jest.fn();
    const user = userEvent.setup();
    await render(
      <WarningBanner
        severity="warning"
        message="Rest 48 h between straight-arm sessions."
        acknowledged={false}
        onAcknowledge={onAcknowledge}
      />,
    );
    expect(screen.getByText('Take care')).toBeOnTheScreen();
    expect(screen.getByText('Rest 48 h between straight-arm sessions.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'I understand' }));
    expect(onAcknowledge).toHaveBeenCalledTimes(1);
  });

  it('shows the acknowledged state instead of the button', async () => {
    await render(
      <WarningBanner severity="info" message="m" acknowledged onAcknowledge={jest.fn()} />,
    );
    expect(screen.getByText('Acknowledged')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'I understand' })).toBeNull();
  });
});

describe('EmptyState', () => {
  it('renders title, message, note and action', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(
      <EmptyState
        icon="scroll"
        title="No sessions yet"
        message="Train to fill the log."
        note="COMING SOON"
        action={{ label: 'Train now', onPress }}
      />,
    );
    expect(screen.getByRole('header', { name: 'No sessions yet' })).toBeOnTheScreen();
    expect(screen.getByText('COMING SOON')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Train now' }));
    expect(onPress).toHaveBeenCalled();
  });
});

describe('PixelModal', () => {
  it('renders its content when visible and closes', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    await render(
      <PixelModal visible title="Choose" onClose={onClose}>
        <PixelText>body</PixelText>
      </PixelModal>,
    );
    expect(screen.getByText('body')).toBeOnTheScreen();
    await user.press(screen.getAllByRole('button', { name: 'Close' })[1]);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders nothing when hidden', async () => {
    await render(
      <PixelModal visible={false} title="Choose" onClose={jest.fn()}>
        <PixelText>body</PixelText>
      </PixelModal>,
    );
    expect(screen.queryByText('body')).toBeNull();
  });
});

describe('LevelUpBurst', () => {
  it('announces the title and subtitle', async () => {
    await render(<LevelUpBurst subtitle="Tuck planche" />);
    expect(screen.getByText('LEVEL UP!')).toBeOnTheScreen();
    expect(screen.getByRole('alert', { name: 'LEVEL UP! Tuck planche' })).toBeOnTheScreen();
  });
});

describe('PixelAnimation (PLAN 6.4)', () => {
  it('draws the animation as one decorative SVG of role paths', async () => {
    await render(
      <PixelAnimation
        animation={animationFor({ id: 'pull_up', patterns: ['vertical_pull'] })}
        size={96}
        testID="anim"
      />,
    );
    const svg = screen.getByTestId('anim', { includeHiddenElements: true });
    expect(svg).toHaveProp('width', 96);
    expect(svg).toHaveProp('importantForAccessibility', 'no-hide-descendants');
  });
});
