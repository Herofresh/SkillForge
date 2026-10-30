import type { Dictionary } from '../t';

/**
 * The Settings tab and its panels, the data gate and root error screens, backups, the home-screen
 * widget, the notices and credits, and the user-facing error texts of the store and file access.
 */
export const SETTINGS_DE: Dictionary = {
  // app/(tabs)/settings.tsx
  'Equipment profiles': 'Ausrüstungsprofile',
  'Workouts only use the equipment of the place you pick on the Train tab.':
    'Trainings nutzen nur die Ausrüstung des Ortes, den du im Training-Tab wählst.',
  Hero: 'Held',
  'Hero name': 'Heldenname',
  'Save name': 'Namen speichern',
  'Rename profile': 'Profil umbenennen',
  Cancel: 'Abbrechen',
  Name: 'Name',
  Save: 'Speichern',

  // src/components/settings/AboutPanel.tsx
  'Opens the website': 'Öffnet die Website',
  About: 'Über',
  'SkillForge {version}. A calisthenics skill tree: the app suggests, you decide.':
    'SkillForge {version}. Ein Calisthenics-Skill-Baum: Die App schlägt vor, du entscheidest.',
  'The progressions are community-sourced from the sources below and not yet reviewed by a coach.':
    'Die Progressionen stammen aus den Community-Quellen unten und wurden noch nicht von einem Coach geprüft.',
  Sources: 'Quellen',
  Fonts: 'Schriften',

  // src/components/settings/BackupPanel.tsx
  'Something went wrong.': 'Etwas ist schiefgelaufen.',
  Backup: 'Backup',
  'Export a backup now and then, e.g. to your Drive.':
    'Exportiere ab und zu ein Backup, z. B. in dein Drive.',
  'Export backup': 'Backup exportieren',
  'Import backup': 'Backup importieren',
  'Undo last import': 'Letzten Import rückgängig machen',
  'Replace all data?': 'Alle Daten ersetzen?',
  'This replaces all your data: hero, goals, equipment, every logged session and your tree changes.':
    'Das ersetzt alle deine Daten: Held, Ziele, Ausrüstung, jede geloggte Session und deine Änderungen am Baum.',
  'The session in progress is discarded too.': 'Die laufende Session wird ebenfalls verworfen.',
  'A safety copy of your current data is saved first, so you can undo the import.':
    'Vorher wird eine Sicherheitskopie deiner aktuellen Daten gespeichert, damit du den Import rückgängig machen kannst.',
  'Choose file and replace': 'Datei wählen und ersetzen',
  'Undo the import?': 'Import rückgängig machen?',
  'Your data goes back to how it was before the last import. The imported data is replaced (a safety copy of it is saved too).':
    'Deine Daten werden auf den Stand vor dem letzten Import zurückgesetzt. Die importierten Daten werden ersetzt (auch davon wird eine Sicherheitskopie gespeichert).',
  'Undo import': 'Import rückgängig machen',
  'Backup handed to the share sheet.': 'Backup an das Teilen-Menü übergeben.',
  'Backup imported. Your previous data was saved as {fileName}.':
    'Backup importiert. Deine bisherigen Daten wurden als {fileName} gespeichert.',
  'Import undone: your previous data is back.':
    'Import rückgängig gemacht: Deine bisherigen Daten sind zurück.',
  'No file chosen. Nothing changed.': 'Keine Datei gewählt. Nichts geändert.',
  'This file can’t be imported': 'Diese Datei kann nicht importiert werden',
  'Nothing was changed. What is wrong with it:': 'Nichts wurde geändert. Was damit nicht stimmt:',
  '… and 1 more': '… und 1 weitere',
  '… and {n} more': '… und {n} weitere',

  // src/components/settings/DeleteDataPanel.tsx
  'This deletes everything SkillForge stored on this phone: your hero and name, every logged session and Trial, goals, equipment profiles, your tree changes, classes, challenges, the companion and all settings, the session in progress, the safety copies from earlier imports, exported files the app kept and the widget’s data.':
    'Das löscht alles, was SkillForge auf diesem Handy gespeichert hat: deinen Helden und Namen, jede geloggte Session und Prüfung, Ziele, Ausrüstungsprofile, deine Änderungen am Baum, Klassen, Herausforderungen, den Begleiter und alle Einstellungen, die laufende Session, die Sicherheitskopien früherer Importe, exportierte Dateien, die die App behalten hat, und die Daten des Widgets.',
  'The app then starts fresh with the Home and Park profiles, like a new install, and opens the intro. Android’s own device backup may keep an older copy until it next backs up the app.':
    'Die App startet danach neu mit den Profilen Zuhause und Park, wie nach einer Neuinstallation, und öffnet das Intro. Das Geräte-Backup von Android kann eine ältere Kopie behalten, bis es die App das nächste Mal sichert.',
  'Export failed.': 'Export fehlgeschlagen.',
  'Your data is deleted, but these files could not be: {files}.':
    'Deine Daten sind gelöscht, aber diese Dateien konnten nicht gelöscht werden: {files}.',
  '{message} Your data was not deleted.': '{message} Deine Daten wurden nicht gelöscht.',
  'Something went wrong. Your data was not deleted.':
    'Etwas ist schiefgelaufen. Deine Daten wurden nicht gelöscht.',
  'Delete data': 'Daten löschen',
  'Erase everything SkillForge stored on this phone and start fresh.':
    'Lösche alles, was SkillForge auf diesem Handy gespeichert hat, und fang neu an.',
  'Delete all my data': 'Alle meine Daten löschen',
  'Delete all your data?': 'Alle deine Daten löschen?',
  'Export backup first': 'Erst ein Backup exportieren',
  'This can’t be undone': 'Das lässt sich nicht rückgängig machen',
  'Without a backup file, nothing of your hero can be brought back.':
    'Ohne Backup-Datei kann nichts von deinem Helden zurückgeholt werden.',
  'Delete everything': 'Alles löschen',

  // src/components/settings/GuidePanel.tsx
  'How SkillForge works': 'So funktioniert SkillForge',
  'XP, levels, ranks, classes, the companion and the rest, explained. Look for the “i” next to each of them in the app too.':
    'XP, Level, Ränge, Klassen, der Begleiter und der Rest, erklärt. Achte in der App auch auf das „i“ daneben.',
  'Open the guide': 'Leitfaden öffnen',
  'Home-screen widgets': 'Startbildschirm-Widgets',

  // src/components/settings/HealthConnectPanel.tsx
  'Adds every workout you finish to Health Connect as a calisthenics session, with a note of what you did (“Pull-up: 5, 5, 4 reps”). SkillForge reads nothing from it.':
    'Fügt jedes abgeschlossene Training als Calisthenics-Einheit zu Health Connect hinzu, mit einer Notiz, was du gemacht hast („Klimmzug: 5, 5, 4 Wdh.“). SkillForge liest nichts daraus.',
  'Health Connect isn’t on this phone yet. Install it from Google Play, then come back.':
    'Health Connect ist noch nicht auf diesem Handy. Installiere es aus Google Play und komm dann zurück.',
  'Health Connect needs an update from Google Play first.':
    'Health Connect braucht erst ein Update aus Google Play.',
  'Health Connect isn’t available in this version of the app.':
    'Health Connect ist in dieser Version der App nicht verfügbar.',
  'SkillForge wasn’t allowed to write exercise. Turn it on again to choose, or allow it in Health Connect.':
    'SkillForge durfte keine Trainings schreiben. Schalte es noch einmal ein, um zu wählen, oder erlaube es in Health Connect.',
  'Health Connect didn’t respond. Try again.':
    'Health Connect hat nicht geantwortet. Versuch es noch einmal.',
  'On: finished workouts are added to Health Connect.':
    'An: Abgeschlossene Trainings werden zu Health Connect hinzugefügt.',
  'Update Health Connect': 'Health Connect aktualisieren',
  'Get Health Connect': 'Health Connect holen',
  'Open Health Connect': 'Health Connect öffnen',
  'Permissions and the workouts SkillForge added':
    'Berechtigungen und die Trainings, die SkillForge hinzugefügt hat',
  'Stop adding workouts': 'Keine Trainings mehr hinzufügen',
  'Add workouts to Health Connect': 'Trainings zu Health Connect hinzufügen',
  'Asks Android for permission to write exercise':
    'Fragt Android um die Berechtigung, Trainings zu schreiben',

  // src/components/settings/ProgressionsPanel.tsx
  Progressions: 'Progressionen',
  'You use the built-in tree. Edit a skill from its page, or add your own.':
    'Du nutzt den eingebauten Baum. Bearbeite einen Skill auf seiner Seite oder füge eigene hinzu.',
  'You changed 1 skill of the tree.': 'Du hast 1 Skill des Baums geändert.',
  'You changed {n} skills of the tree.': 'Du hast {n} Skills des Baums geändert.',
  'My progressions': 'Meine Progressionen',
  'Your changes to the tree, sharing and importing':
    'Deine Änderungen am Baum, Teilen und Importieren',

  // src/components/settings/ReplayOnboardingPanel.tsx
  Intro: 'Intro',
  'Walk through the first-run steps again: hero, equipment, goals and the optional Trials.':
    'Geh die Schritte des ersten Starts noch einmal durch: Held, Ausrüstung, Ziele und die optionalen Prüfungen.',
  'Replay onboarding': 'Intro wiederholen',
  'Replay the intro?': 'Intro wiederholen?',
  'Your data stays. Only the intro runs again, starting from your current hero name, equipment and goals. A Trial you log there is saved like any other session.':
    'Deine Daten bleiben. Nur das Intro läuft noch einmal, ausgehend von deinem aktuellen Heldennamen, deiner Ausrüstung und deinen Zielen. Eine Prüfung, die du dort loggst, wird wie jede andere Session gespeichert.',
  'Replay intro': 'Intro starten',

  // src/components/settings/TrainingViewPanel.tsx
  Classic: 'Klassisch',
  'One exercise at a time with a stepper; its sets are monsters that take the hits.':
    'Eine Übung nach der anderen mit Zähler; ihre Sätze sind Monster, die die Treffer einstecken.',
  Battle: 'Kampf',
  'Every exercise at once, each set a monster: tap to beat it, tap again for one rep fewer, long press for an exact number.':
    'Alle Übungen auf einmal, jeder Satz ein Monster: Tippen besiegt es, nochmal tippen zieht eine Wiederholung ab, lange drücken für eine genaue Zahl.',
  'Training view': 'Trainingsansicht',
  '{label} training view': 'Trainingsansicht {label}',

  // src/components/DataGate.tsx
  'Could not open your data': 'Deine Daten konnten nicht geöffnet werden',
  'Nothing was deleted. Restart the app to try again.':
    'Nichts wurde gelöscht. Starte die App neu, um es noch einmal zu versuchen.',

  // src/components/RootErrorScreen.tsx
  'Something went wrong': 'Etwas ist schiefgelaufen',
  'This screen hit an error. Your data is safe on this device.':
    'Auf diesem Bildschirm ist ein Fehler aufgetreten. Deine Daten sind auf diesem Gerät sicher.',
  'Try again': 'Noch einmal versuchen',

  // src/domain/backup.ts
  'The file is not valid JSON ({error}).': 'Die Datei ist kein gültiges JSON ({error}).',
  'The file is not a SkillForge backup (no JSON object).':
    'Die Datei ist kein SkillForge-Backup (kein JSON-Objekt).',
  'The file is a progression overlay, not a backup. Import it in the node editor instead.':
    'Die Datei ist ein Progressions-Overlay, kein Backup. Importiere sie stattdessen im Skill-Editor.',
  "The file is not a SkillForge backup ('format' is not '{format}').":
    "Die Datei ist kein SkillForge-Backup ('format' ist nicht '{format}').",
  'The backup was made by a newer SkillForge (backup version {version}; this app reads up to {supported}). Update the app, then import it again. Nothing was changed.':
    'Das Backup stammt aus einem neueren SkillForge (Backup-Version {version}; diese App liest bis {supported}). Aktualisiere die App und importiere es dann noch einmal. Nichts wurde geändert.',

  // src/domain/widget.ts
  'Trained today': 'Heute trainiert',
  'Not yet today': 'Heute noch nicht',

  // src/widget/widgetLayout.ts
  Streak: 'Serie',
  Level: 'Level',
  'No stats yet': 'Noch keine Werte',
  'Open the app to begin': 'In der App loslegen',

  // src/data/notices.ts
  'Train safe': 'Trainiere sicher',
  'SkillForge gives general training suggestions, not medical advice. Check with a doctor before you start a new exercise programme, especially with an injury or a health condition. Stop if you feel pain. You train at your own risk.':
    'SkillForge gibt allgemeine Trainingsvorschläge, keinen medizinischen Rat. Sprich mit einem Arzt, bevor du ein neues Trainingsprogramm beginnst, besonders bei einer Verletzung oder einer Erkrankung. Hör auf, wenn du Schmerzen spürst. Du trainierst auf eigene Gefahr.',
  'Your data is stored on this phone. SkillForge has no account and sends nothing anywhere; Android’s own device backup may include it.':
    'Deine Daten sind auf diesem Handy gespeichert. SkillForge hat kein Konto und sendet nichts irgendwohin; das Geräte-Backup von Android kann sie enthalten.',
  'Switching between the GitHub and the Play Store version needs a reinstall: export a backup first, then import it in the new install.':
    'Der Wechsel zwischen der GitHub- und der Play-Store-Version braucht eine Neuinstallation: Exportiere erst ein Backup und importiere es dann in der neuen Installation.',

  // src/data/credits.ts
  'Tier levels (OG2 charts), progressions and tendon safety guidance.':
    'Stufen (OG2-Tabellen), Progressionen und Hinweise zum Schutz der Sehnen.',
  'The Recommended Routine and its progression charts.':
    'Die Recommended Routine und ihre Progressionstabellen.',
  'Handstand and skill progressions.': 'Handstand- und Skill-Progressionen.',
  'Beginner routines and steady-state skill training.':
    'Einsteiger-Routinen und Steady-State-Skilltraining.',
  'SkillForge is an independent project, not affiliated with or endorsed by the sources listed.':
    'SkillForge ist ein unabhängiges Projekt und steht in keiner Verbindung zu den genannten Quellen; sie unterstützen es nicht.',
  'Privacy policy': 'Datenschutzerklärung',
  'What SkillForge stores (everything on this phone) and what it never sends.':
    'Was SkillForge speichert (alles auf diesem Handy) und was es nie sendet.',
  'The licence of all three fonts.': 'Die Lizenz aller drei Schriften.',

  // src/store/appStore.ts
  'Share your SkillForge progressions': 'Teile deine SkillForge-Progressionen',

  // src/store/backupFiles.ts
  'Sharing files is not available on this device':
    'Dateien teilen ist auf diesem Gerät nicht verfügbar',
  'Save your SkillForge backup': 'Speichere dein SkillForge-Backup',

  // src/lib/importFile.ts
  'This file is too large to import ({size} MB; the limit is {limit} MB). Choose a SkillForge backup or progressions file.':
    'Diese Datei ist zu groß zum Importieren ({size} MB; das Limit sind {limit} MB). Wähle eine SkillForge-Backup- oder Progressions-Datei.',
};
