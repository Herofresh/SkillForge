/**
 * The app's Health Connect access (PLAN 7.10, ADR-072) over react-native-health-connect: the
 * status, the one write permission (exercise sessions), writing a workout and opening Health
 * Connect. Only I/O lives here; what is written comes from `src/domain/healthWorkout.ts`, the flow
 * from the store (`enableHealthConnect`, `finishTraining`). Nothing is ever read.
 *
 * The native module only exists in a native build on Android: in Expo Go, on the web and in tests
 * the library isn't loaded at all (it throws on import without its module) and the status is
 * `unsupported`.
 */
import { Platform, TurboModuleRegistry } from 'react-native';

import type { HealthWorkout } from '@/domain/healthWorkout';
import type { HealthConnectAccess, HealthConnectStatus } from '@/store/appStore';

type Library = typeof import('react-native-health-connect');

let library: Library | null | undefined;

function load(): Library | null {
  if (library === undefined) {
    library =
      Platform.OS === 'android' && TurboModuleRegistry.get('HealthConnect') !== null
        ? // Loaded only when the native module exists (see above).
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          (require('react-native-health-connect') as Library)
        : null;
  }
  return library;
}

const WRITE_EXERCISE = { accessType: 'write', recordType: 'ExerciseSession' } as const;

async function ready(): Promise<Library> {
  const hc = load();
  if (!hc) throw new Error('Health Connect is not available in this build');
  if (!(await hc.initialize())) throw new Error('Health Connect could not start');
  return hc;
}

async function status(): Promise<HealthConnectStatus> {
  const hc = load();
  if (!hc) return 'unsupported';
  const sdk = await hc.getSdkStatus();
  if (sdk === hc.SdkAvailabilityStatus.SDK_AVAILABLE) return 'available';
  if (sdk === hc.SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
    return 'needs_update';
  }
  return 'not_installed';
}

const grantsWrite = (granted: readonly { accessType: string; recordType?: string }[]): boolean =>
  granted.some(
    (permission) =>
      permission.accessType === WRITE_EXERCISE.accessType &&
      permission.recordType === WRITE_EXERCISE.recordType,
  );

async function requestWrite(): Promise<boolean> {
  const hc = await ready();
  return grantsWrite(await hc.requestPermission([WRITE_EXERCISE]));
}

async function hasWrite(): Promise<boolean> {
  const hc = await ready();
  return grantsWrite(await hc.getGrantedPermissions());
}

async function writeWorkout(workout: HealthWorkout): Promise<void> {
  const hc = await ready();
  await hc.insertRecords([
    {
      recordType: 'ExerciseSession',
      exerciseType: hc.ExerciseType.CALISTHENICS,
      title: workout.title,
      notes: workout.notes,
      startTime: new Date(workout.startMs).toISOString(),
      endTime: new Date(workout.endMs).toISOString(),
      metadata: {
        clientRecordId: workout.clientId,
        clientRecordVersion: 1,
        recordingMethod: hc.RecordingMethod.RECORDING_METHOD_ACTIVELY_RECORDED,
      },
    },
  ]);
}

function openSettings(): void {
  load()?.openHealthConnectSettings();
}

export const deviceHealthConnect: HealthConnectAccess = {
  status,
  requestWrite,
  hasWrite,
  writeWorkout,
  openSettings,
};
