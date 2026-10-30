import type { Dictionary } from '../t';

/**
 * The tree area: the Tree tab (columns and map), the node detail and its Trial, onboarding, the
 * shared node row and branch tabs, the equipment editor, and the branch / attribute / equipment
 * / tile-state labels. Keys in the order of the files; one comment per file.
 */
export const TREE_DE: Dictionary = {
  // app/(tabs)/tree.tsx
  'Skill Tree': 'Skill-Baum',
  '{open} of {total} open · {proficient} proficient':
    '{open} von {total} offen · {proficient} beherrscht',
  '1 goal': '1 Ziel',
  '{n} goals': '{n} Ziele',
  Legend: 'Legende',
  'Add exercise': 'Übung hinzufügen',
  'Adds your own exercise to this branch': 'Fügt diesem Zweig deine eigene Übung hinzu',

  // app/node/[nodeId]/index.tsx
  'Community-sourced progression; not yet reviewed by a coach.':
    'Progression aus der Community; noch nicht von einem Coach geprüft.',
  'Reviewed by a coach.': 'Von einem Coach geprüft.',
  Skill: 'Skill',
  'Unknown skill': 'Unbekannter Skill',
  "No skill '{id}' here.": "Hier gibt es keinen Skill '{id}'.",
  About: 'Über',
  Actions: 'Aktionen',
  'Remove goal': 'Ziel entfernen',
  'Set as goal': 'Als Ziel setzen',
  'Workouts stop leading here': 'Trainings führen nicht mehr hierher',
  'Workouts lead you towards this skill': 'Trainings führen dich zu diesem Skill',
  '{max} goals is the limit. Remove one to pick another.':
    '{max} Ziele sind das Limit. Entferne eins, um ein anderes zu wählen.',
  'Trial passed on {date}.': 'Prüfung bestanden am {date}.',
  'Attempt Trial': 'Prüfung antreten',
  'Log a Trial: pass it to become proficient':
    'Logge eine Prüfung: Bestehst du sie, beherrschst du den Skill',
  'Unlock anyway': 'Trotzdem freischalten',
  'Opens it for training although its prerequisites are not met':
    'Öffnet den Skill fürs Training, obwohl seine Voraussetzungen nicht erfüllt sind',
  Prerequisites: 'Voraussetzungen',
  'Recommended ones never lock a skill; they are good preparation.':
    'Empfohlene sperren einen Skill nie; sie sind gute Vorbereitung.',
  Trains: 'Trainiert',
  Standards: 'Standards',
  'Working range': 'Arbeitsbereich',
  'Trial standard': 'Prüfungsstandard',
  Cues: 'Hinweise',
  History: 'Verlauf',
  Review: 'Coach-Review',
  'Coach notes: {notes}': 'Coach-Notizen: {notes}',
  'Your own skill (from your changes to the tree).':
    'Dein eigener Skill (aus deinen Änderungen am Baum).',

  // app/node/[nodeId]/trial.tsx
  'The Trial': 'Die Prüfung',
  'Back to the skill': 'Zurück zum Skill',
  'Enter what you did today. The standard is {standard}.':
    'Trag ein, was du heute geschafft hast. Der Standard ist {standard}.',
  'Log Trial': 'Prüfung loggen',

  // app/onboarding/assessment.tsx
  'Tested out': 'Freigetestet',
  'I can do this': 'Das kann ich',
  'Opens the Trial for this skill': 'Öffnet die Prüfung für diesen Skill',
  'Prove your might': 'Zeig, was du kannst',
  'Optional. Already strong? Log a Trial for what you can do today and start further up the tree.':
    'Optional. Schon stark? Logge eine Prüfung für das, was du heute kannst, und starte weiter oben im Baum.',
  Continue: 'Weiter',
  'On your path': 'Auf deinem Weg',
  'Pick goals to see milestones here, or search for any skill below.':
    'Wähle Ziele, um hier Meilensteine zu sehen, oder suche unten nach einem Skill.',
  'Search any skill': 'Skill suchen',
  'e.g. planche, pistol': 'z. B. Planche, Pistol',
  'No skill matches “{query}”.': 'Kein Skill passt zu „{query}“.',

  // app/onboarding/equipment.tsx
  'Your armory': 'Deine Rüstkammer',
  'Where do you train? Workouts only use the equipment of the place you pick.':
    'Wo trainierst du? Trainings nutzen nur die Ausrüstung des Orts, den du wählst.',
  Next: 'Weiter',

  // app/onboarding/goals.tsx
  'Choose your quests': 'Wähle deine Quests',
  'Pick {min} to {max} skills to work towards. Workouts lead you there.':
    'Wähle {min} bis {max} Skills, auf die du hinarbeitest. Trainings führen dich dorthin.',
  Later: 'Später',
  'Goals {n} / {max}': 'Ziele {n} / {max}',
  'No goals yet. Tap a skill below to pick it.':
    'Noch keine Ziele. Tippe unten auf einen Skill, um ihn zu wählen.',
  Goal: 'Ziel',
  'Removes this goal': 'Entfernt dieses Ziel',
  'Picks this skill as a goal': 'Wählt diesen Skill als Ziel',

  // app/onboarding/index.tsx
  'Welcome to SkillForge': 'Willkommen bei SkillForge',
  'Every rep forges your hero. Unlock skills, level up, become a legend.':
    'Jede Wiederholung schmiedet deinen Helden. Schalte Skills frei, steig im Level auf, werde zur Legende.',
  'The quest': 'Die Quest',
  'Your training is a skill tree of bodyweight progressions. Train to earn XP, pass Trials to unlock harder skills, and let the forge suggest each workout. You decide what to follow.':
    'Dein Training ist ein Skill-Baum aus Bodyweight-Progressionen. Trainiere für XP, besteh Prüfungen, um schwerere Skills freizuschalten, und lass die Schmiede jedes Training vorschlagen. Du entscheidest, was du davon machst.',
  'Name your hero': 'Nenn deinen Helden',
  'e.g. Aria Stormhand': 'z. B. Aria Sturmhand',

  // app/onboarding/summary.tsx
  Hero: 'Held',
  'Your journey begins': 'Deine Reise beginnt',
  'The forge is lit. Your first workout waits on the Train tab.':
    'Die Schmiede brennt. Dein erstes Training wartet im Tab Training.',
  Begin: "Los geht's",
  'Hero XP': 'Helden-XP',
  Quests: 'Quests',
  'No goals yet. Pick some from the tree any time.':
    'Noch keine Ziele. Wähle jederzeit welche im Baum.',
  'Nothing tested out. Every skill starts fresh.':
    'Nichts freigetestet. Jeder Skill beginnt bei null.',
  'Training grounds': 'Trainingsorte',
  'No equipment profiles.': 'Keine Ausrüstungsprofile.',

  // app/onboarding/trial/[nodeId].tsx
  'Trial passed': 'Prüfung bestanden',
  'Trial logged': 'Prüfung geloggt',
  Done: 'Fertig',
  'Enter what you can do today. The standard is {standard}.':
    'Trag ein, was du heute kannst. Der Standard ist {standard}.',

  // src/components/onboarding/OnboardingScaffold.tsx
  Setup: 'Einrichtung',
  'Step {n} of {total}': 'Schritt {n} von {total}',
  'Step {n} / {total}': 'Schritt {n} / {total}',
  'Back to the app': 'Zurück zur App',
  'Leaves the intro. What you already saved on its steps stays.':
    'Verlässt die Einführung. Was du in ihren Schritten schon gespeichert hast, bleibt.',
  Back: 'Zurück',

  // src/components/trial/TrialParts.tsx
  'Your result': 'Dein Ergebnis',
  'Set {n}': 'Satz {n}',
  '{name} is now proficient (level {level}). Its successors are open to train.':
    '{name} ist jetzt beherrscht (Level {level}). Die Skills danach sind offen zum Trainieren.',
  'Not quite the standard yet ({standard}). Your sets count as training, so the XP is yours. Try the Trial again after a few sessions.':
    'Noch nicht ganz der Standard ({standard}). Deine Sätze zählen als Training, die XP gehören dir. Versuch die Prüfung nach ein paar Sessions noch mal.',
  Unlocked: 'Freigeschaltet',
  'Read and acknowledge the notes above to log the Trial. It is your call.':
    'Lies und bestätige die Hinweise oben, um die Prüfung zu loggen. Du entscheidest.',

  // src/components/NodeRow.tsx
  'straight-arm': 'gestreckte Arme',
  'Straight-arm': 'Streckarm',

  // src/components/tree/NodeTile.tsx
  'Opens the skill': 'Öffnet den Skill',
  Custom: 'Angepasst',
  'LV {level} · {state}': 'LV {level} · {state}',

  // src/components/tree/PrereqChip.tsx
  proficient: 'beherrscht',
  'level {n}': 'Level {n}',
  'Needs {name} {requirement}': 'Braucht {name} {requirement}',
  'from {branch}': 'aus {branch}',
  met: 'erfüllt',
  'not met': 'nicht erfüllt',

  // src/components/tree/TreeLegend.tsx
  'A chain joins a skill to the one it builds on: gold once that one is proficient. Chips under a tile are prerequisites from elsewhere.':
    'Eine Kette verbindet einen Skill mit dem, auf dem er aufbaut: gold, sobald dieser beherrscht ist. Chips unter einer Kachel sind Voraussetzungen von anderswo.',
  'What an exercise is and its cues: tap the i on a tile, or long-press a skill (also on the map).':
    'Was eine Übung ist und ihre Hinweise: Tippe auf das i einer Kachel oder halte einen Skill gedrückt (auch auf der Karte).',

  // src/components/tree/TreeModeTabs.tsx
  Columns: 'Spalten',
  'Columns, one branch as a list': 'Spalten, ein Zweig als Liste',
  Map: 'Karte',
  'Map of the whole tree': 'Karte des ganzen Baums',

  // src/components/tree/tileLook.ts
  Legendary: 'Legendär',
  'A legendary skill far ahead: something to dream of.':
    'Ein legendärer Skill in weiter Ferne: etwas zum Träumen.',
  Locked: 'Gesperrt',
  'Its prerequisites are not met yet. You can still unlock it yourself.':
    'Seine Voraussetzungen sind noch nicht erfüllt. Du kannst ihn trotzdem selbst freischalten.',
  Ready: 'Verfügbar',
  'Open to train: the next step on the path.':
    'Offen zum Trainieren: der nächste Schritt auf dem Weg.',
  Training: 'Im Training',
  'You are training it: sets earn XP up to level 5 until the Trial.':
    'Du trainierst ihn: Sätze bringen XP bis Level 5, bis zur Prüfung.',
  Proficient: 'Beherrscht',
  'Trial passed: it opens the skills that build on it.':
    'Prüfung bestanden: Er öffnet die Skills, die auf ihm aufbauen.',
  Mastered: 'Gemeistert',
  'Level 10: fully mastered.': 'Level 10: voll gemeistert.',
  'trial needed to level further': 'Prüfung nötig, um weiter aufzusteigen',
  goal: 'Ziel',
  custom: 'angepasst',
  'unlocked by you': 'von dir freigeschaltet',
  'Ready · Unlocked by you': 'Verfügbar · Von dir freigeschaltet',

  // src/components/tree/map/MapNode.tsx
  'LV {level} · Trial': 'LV {level} · Prüfung',
  'Opens the skill. Long press shows what the exercise is.':
    'Öffnet den Skill. Lange drücken zeigt, was die Übung ist.',

  // src/components/tree/map/TreeMap.tsx
  'Skill tree map. Use Switch to list for the branch columns.':
    'Karte des Skill-Baums. Mit „Zur Liste wechseln“ kommst du zu den Zweig-Spalten.',
  List: 'Liste',
  'Switch to list': 'Zur Liste wechseln',
  'Shows the tree as branch columns': 'Zeigt den Baum als Zweig-Spalten',
  'Zoom out': 'Herauszoomen',
  'Zoom in': 'Hineinzoomen',
  Goals: 'Ziele',
  Focus: 'Fokus',
  'Focus goals': 'Ziele fokussieren',
  'Focus on what you can train': 'Auf das fokussieren, was du trainieren kannst',

  // src/components/node/AttributeChips.tsx
  'Skill work: it builds no attribute on its own.':
    'Skill-Arbeit: Sie baut für sich kein Attribut auf.',
  'Trains {attributes}': 'Trainiert {attributes}',

  // src/components/node/CustomizeSection.tsx
  'Your own exercise. Change it, add one after it, or delete it.':
    'Deine eigene Übung. Ändere sie, füge eine danach hinzu oder lösche sie.',
  'You changed this exercise. Reset it to go back to the built-in standards.':
    'Du hast diese Übung geändert. Setze sie zurück, um zu den eingebauten Standards zurückzukehren.',
  'Make it fit your training: standards, prerequisites, equipment, cues. Or add your own exercise after it.':
    'Pass sie an dein Training an: Standards, Voraussetzungen, Ausrüstung, Hinweise. Oder füge danach deine eigene Übung hinzu.',
  'Your tree': 'Dein Baum',
  'Edit progression': 'Progression bearbeiten',
  'Add exercise after this': 'Übung danach hinzufügen',
  'Reset to default': 'Auf Standard zurücksetzen',
  'Delete exercise': 'Übung löschen',
  'Hide exercise': 'Übung ausblenden',
  'Not changed: the tree would break': 'Nicht geändert: Der Baum würde kaputtgehen',
  'Reset to default?': 'Auf Standard zurücksetzen?',
  'Keep my changes': 'Meine Änderungen behalten',
  '{name} goes back to the built-in standards, prerequisites, equipment and cues.':
    '{name} geht zurück zu den eingebauten Standards, Voraussetzungen, Ausrüstung und Hinweisen.',
  Reset: 'Zurücksetzen',
  'Hide {name}?': '{name} ausblenden?',
  'Keep it': 'Behalten',
  'It leaves the tree and your workouts. Skills that need it then need what it needed. Its logged sets stay in your history and count again if you show it (My progressions in Settings).':
    'Sie verlässt den Baum und deine Trainings. Skills, die sie brauchen, brauchen dann das, was sie brauchte. Ihre geloggten Sätze bleiben in deinem Verlauf und zählen wieder, wenn du sie einblendest (Meine Progressionen in den Einstellungen).',
  Hide: 'Ausblenden',
  'Delete {name}?': '{name} löschen?',
  'Your exercise leaves the tree. Its logged sets stay in your history but no longer count.':
    'Deine Übung verschwindet aus dem Baum. Ihre geloggten Sätze bleiben in deinem Verlauf, zählen aber nicht mehr.',
  Delete: 'Löschen',

  // src/components/node/ExerciseInfoSheet.tsx
  'Open skill': 'Skill öffnen',
  "Shows the skill's level, Trial and history": 'Zeigt Level, Prüfung und Verlauf des Skills',

  // src/components/node/InfoButton.tsx
  'Shows what the exercise is and its cues': 'Zeigt, was die Übung ist, und ihre Hinweise',
  'About {name}': 'Über {name}',

  // src/components/node/NodeHeader.tsx
  'You unlocked this yourself. Its prerequisites are still listed below.':
    'Du hast ihn selbst freigeschaltet. Seine Voraussetzungen stehen weiter unten.',
  'Node XP': 'Skill-XP',
  'Level {level} is the cap until you pass the Trial.':
    'Level {level} ist die Grenze, bis du die Prüfung bestehst.',
  '{xp} XP is banked and counts once you pass it.':
    '{xp} XP sind gespart und zählen, sobald du sie bestehst.',

  // src/components/node/NodeHistoryList.tsx
  'No sets logged yet. Train it or attempt its Trial to start the story.':
    'Noch keine Sätze geloggt. Trainiere ihn oder tritt seine Prüfung an, um die Geschichte zu beginnen.',
  '{date}, Trial: {sets}': '{date}, Prüfung: {sets}',
  '{date}: {sets}': '{date}: {sets}',
  'Opens the session summary': 'Öffnet die Zusammenfassung der Session',
  Trial: 'Prüfung',

  // src/components/node/PrerequisiteList.tsx
  'None. This is where the path starts.': 'Keine. Hier beginnt der Weg.',
  '{requirement} (recommended)': '{requirement} (empfohlen)',
  'Also met by {names}': 'Auch erfüllt durch {names}',
  'Met through {name}': 'Erfüllt durch {name}',
  '{name}, {requirement}, met': '{name}, {requirement}, erfüllt',
  '{name}, {requirement}, not met': '{name}, {requirement}, nicht erfüllt',
  'Met · {requirement}': 'Erfüllt · {requirement}',
  'Not met · {requirement}': 'Nicht erfüllt · {requirement}',

  // src/components/node/UnlockSheet.tsx
  'Unlock anyway?': 'Trotzdem freischalten?',
  'Not now': 'Jetzt nicht',
  '{name} opens for training now. Its prerequisites stay listed, and you can build up to them whenever you like.':
    '{name} ist ab jetzt offen fürs Training. Die Voraussetzungen bleiben aufgelistet, und du kannst sie nachholen, wann du willst.',
  'Acknowledge the note above first': 'Bestätige zuerst den Hinweis oben',

  // src/components/attributeLabels.ts
  Push: 'Drücken',
  Pull: 'Ziehen',
  Core: 'Rumpf',
  Legs: 'Beine',
  Balance: 'Balance',
  Mobility: 'Mobilität',

  // src/domain/equipment.ts
  Floor: 'Boden',
  Wall: 'Wand',
  'Pull-up bar': 'Klimmzugstange',
  'Dip bars': 'Dip-Barren',
  Parallettes: 'Parallettes',
  Bands: 'Bänder',
  Rings: 'Ringe',
  Pole: 'Stange',
  'Box or bench': 'Box oder Bank',

  // src/data/skills/branches.ts
  'Horizontal push': 'Horizontales Drücken',
  'Vertical push': 'Vertikales Drücken',
  'Vertical pull': 'Vertikales Ziehen',
  'Horizontal pull': 'Horizontales Ziehen',
  'Front lever': 'Front Lever',
  'Back lever and rings strength': 'Back Lever und Ringkraft',
  Planche: 'Planche',
  'Handstand and balance': 'Handstand und Balance',
  'Core and compression': 'Rumpf und Kompression',
  'Dynamic skills and hybrids': 'Dynamische Skills und Hybride',
  Flexibility: 'Beweglichkeit',
  Acrobatics: 'Akrobatik',

  // src/components/equipment/EquipmentProfileEditor.tsx
  Rename: 'Umbenennen',
  'Rename {name}': '{name} umbenennen',
  Remove: 'Entfernen',
  'Remove {name}': '{name} entfernen',
  'Add a place': 'Ort hinzufügen',
  'e.g. Gym, Office': 'z. B. Gym, Büro',
  'Add profile': 'Profil hinzufügen',
  'Remove {name}?': '{name} entfernen?',
  'The profile and its equipment list are removed. Sessions you logged with it stay in your history.':
    'Das Profil und seine Ausrüstungsliste werden entfernt. Sessions, die du damit geloggt hast, bleiben in deinem Verlauf.',
  // app/(tabs)/tree.tsx: the search (FB-17)
  'Search the whole tree by skill name': 'Den ganzen Baum nach Skill-Namen durchsuchen',
  'Skill name, e.g. dip': 'Skill-Name, z. B. Dip',
  'No skill matches {query}.': 'Kein Skill passt zu {query}.',
  '1 skill matches, from every branch': '1 Skill passt, aus allen Zweigen',
  '{n} skills match, from every branch': '{n} Skills passen, aus allen Zweigen',
};
