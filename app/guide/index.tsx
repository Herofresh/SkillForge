import { Stack, useRouter } from 'expo-router';

import { GuideRow } from '@/components/guide/GuidePage';
import { stackHeaderOptions } from '@/components/stackHeader';
import { PixelFrame, PixelText, Screen } from '@/components/ui';
import { GUIDE } from '@/domain/guide';

/**
 * "How SkillForge works" (PLAN 6.10c, ADR-060), from Settings: every guide entry with its short
 * summary; tapping one opens its page. Optional reading, never opened by the app on its own.
 */
export default function GuideScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={stackHeaderOptions('How it works')} />
      <Screen testID="guide-screen">
        <PixelFrame variant="parchment">
          <PixelText tone="textOnParchment">
            How the game behind your training works: XP, levels, ranks, classes and the rest.
            Everything here is optional reading. The app suggests, you decide.
          </PixelText>
        </PixelFrame>
        {GUIDE.map((entry) => (
          <GuideRow
            key={entry.id}
            entry={entry}
            onPress={() => router.push({ pathname: '/guide/[topic]', params: { topic: entry.id } })}
          />
        ))}
      </Screen>
    </>
  );
}
