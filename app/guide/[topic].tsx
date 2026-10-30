import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { GuideArticle } from '@/components/guide/GuidePage';
import { stackHeaderOptions } from '@/components/stackHeader';
import { EmptyState, PixelButton, Screen } from '@/components/ui';
import { GUIDE_TOPICS, guideEntries, guideEntry, isGuideTopic } from '@/domain/guide';
import { t } from '@/i18n';

/**
 * One page of "How SkillForge works" (PLAN 6.10c): the entry's summary and its details, and a
 * button on to the next topic. Opened from the guide list or a sheet's "More in the guide".
 */
export default function GuideTopicScreen() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const router = useRouter();
  if (!isGuideTopic(topic)) {
    return (
      <Screen centered>
        <Stack.Screen options={stackHeaderOptions(t('How it works'))} />
        <EmptyState
          icon="scroll"
          title={t('Unknown topic')}
          message={t("No topic '{topic}' here.", { topic })}
        />
      </Screen>
    );
  }
  const entry = guideEntry(topic);
  const next = guideEntries()[GUIDE_TOPICS.indexOf(topic) + 1];
  return (
    <>
      <Stack.Screen options={stackHeaderOptions(entry.title)} />
      <Screen testID={`guide-page-${topic}`}>
        <GuideArticle entry={entry} />
        {next && (
          <PixelButton
            label={t('Next: {title}', { title: next.title })}
            variant="secondary"
            onPress={() =>
              router.replace({ pathname: '/guide/[topic]', params: { topic: next.id } })
            }
            testID="guide-page-next"
          />
        )}
      </Screen>
    </>
  );
}
