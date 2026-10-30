import type { Dictionary } from '../t';

/** The editor area: "My progressions", the import, the node editor and its wording (see the file comments). */
export const EDITOR_DE: Dictionary = {
  // app/progressions/import.tsx
  'The file could not be read.': 'Die Datei konnte nicht gelesen werden.',
  'Import progressions': 'Progressionen importieren',
  'Shared progressions are merged into yours: their exercises and changes replace yours for the same skill, everything else of yours stays.':
    'Geteilte Progressionen werden mit deinen zusammengeführt: Ihre Übungen und Änderungen ersetzen deine beim selben Skill, alles andere von dir bleibt.',
  'Paste the YAML': 'YAML einfügen',
  Preview: 'Vorschau',
  'Choose file': 'Datei wählen',
  "This can't be read": 'Das lässt sich nicht lesen',
  'What changes': 'Was sich ändert',
  'Nothing: the file has no changes.': 'Nichts: Die Datei enthält keine Änderungen.',
  "It doesn't fit your tree": 'Das passt nicht zu deinem Baum',
  Import: 'Importieren',
  'Not imported': 'Nicht importiert',

  // app/progressions/index.tsx
  'My progressions': 'Meine Progressionen',
  "Your saved changes couldn't be read":
    'Deine gespeicherten Änderungen konnten nicht gelesen werden',
  'The built-in tree is used. The saved changes stay on this device, but your next change to the tree or an import replaces them.':
    'Der eingebaute Baum wird verwendet. Die gespeicherten Änderungen bleiben auf diesem Gerät, aber deine nächste Änderung am Baum oder ein Import ersetzt sie.',
  "Your changes don't fit this version": 'Deine Änderungen passen nicht zu dieser Version',
  'The built-in tree is used until you fix or reset them. Your changes are kept.':
    'Der eingebaute Baum wird verwendet, bis du sie korrigierst oder zurücksetzt. Deine Änderungen bleiben erhalten.',
  'Your changes': 'Deine Änderungen',
  'No changes yet': 'Noch keine Änderungen',
  'Open a skill and choose Edit progression, or add your own exercise from the tree.':
    'Öffne einen Skill und wähle „Progression bearbeiten“, oder füge im Baum eine eigene Übung hinzu.',
  Show: 'Anzeigen',
  Delete: 'Löschen',
  Reset: 'Zurücksetzen',
  'Not changed: the tree would break': 'Nicht geändert: Der Baum würde kaputtgehen',
  'Delete {name}?': '{name} löschen?',
  'Reset to default?': 'Auf Standard zurücksetzen?',
  'Keep it': 'Behalten',
  'Your exercise leaves the tree. Its logged sets stay in your history but no longer count.':
    'Deine Übung verschwindet aus dem Baum. Ihre geloggten Sätze bleiben in deinem Verlauf, zählen aber nicht mehr.',
  '{name} goes back to the built-in version.': '{name} geht zurück auf die eingebaute Version.',

  // app/progressions/new.tsx
  'New exercise': 'Neue Übung',
  'Add to the tree': 'Zum Baum hinzufügen',

  // app/node/[nodeId]/edit.tsx
  Edit: 'Bearbeiten',
  'Unknown skill': 'Unbekannter Skill',
  "No skill '{nodeId}' here.": "Hier gibt es keinen Skill '{nodeId}'.",
  'Edit {name}': '{name} bearbeiten',
  'Save changes': 'Änderungen speichern',

  // src/components/editor/CustomBadge.tsx
  'Custom: your own exercise': 'Angepasst: deine eigene Übung',
  'Custom: changed by you': 'Angepasst: von dir geändert',
  Custom: 'Angepasst',

  // src/components/editor/IssueNotes.tsx
  'Worth a look (you can still save)': 'Einen Blick wert (speichern geht trotzdem)',
  'Fix this to save': 'Zum Speichern beheben',

  // src/components/editor/NodeEditorBody.tsx
  'Your own exercise. It is checked like the built-in tree: no loops, every prerequisite must exist.':
    'Deine eigene Übung. Sie wird wie der eingebaute Baum geprüft: keine Schleifen, jede Voraussetzung muss existieren.',
  'Your changes are kept on top of the built-in tree; "Reset to default" on the skill brings it back.':
    'Deine Änderungen liegen über dem eingebauten Baum; „Auf Standard zurücksetzen“ beim Skill bringt ihn zurück.',
  '1 problem to fix before saving.': '1 Problem vor dem Speichern beheben.',
  '{n} problems to fix before saving.': '{n} Probleme vor dem Speichern beheben.',
  'The tree stays valid with these changes.': 'Der Baum bleibt mit diesen Änderungen gültig.',
  'No changes yet.': 'Noch keine Änderungen.',
  Cancel: 'Abbrechen',
  'Discard changes?': 'Änderungen verwerfen?',
  'Keep editing': 'Weiter bearbeiten',
  'Your changes to this exercise are not saved. Leave and throw them away?':
    'Deine Änderungen an dieser Übung sind nicht gespeichert. Verlassen und verwerfen?',
  'Discard changes': 'Änderungen verwerfen',

  // src/components/editor/NodeEditorForm.tsx
  Exercise: 'Übung',
  Name: 'Name',
  'e.g. Towel hang': 'z. B. Handtuchhang',
  'Measured in': 'Gemessen in',
  'Comes after': 'Kommt nach',
  'Top of the branch': 'Anfang des Zweigs',
  'Change position': 'Position ändern',
  Tier: 'Stufe',
  'Tier on the Overcoming Gravity scale; it sets the band (Beginner to Elite) and the XP. It shouldn’t be below the exercise above it.':
    'Stufe auf der Overcoming-Gravity-Skala; sie bestimmt das Band (Anfänger bis Elite) und die XP. Sie sollte nicht unter der Übung darüber liegen.',
  'Straight-arm (tendon safeguards)': 'Gestreckte Arme (Sehnen-Schutzregeln)',
  Description: 'Beschreibung',
  'What the exercise is and what it looks like, in 1–3 sentences. The cues go below.':
    'Was die Übung ist und wie sie aussieht, in 1–3 Sätzen. Die Hinweise kommen unten hin.',
  'e.g. Hanging from a towel thrown over the bar, arms straight.':
    'z. B. Hängen an einem über die Stange gelegten Handtuch, Arme gestreckt.',
  Standards: 'Standards',
  'Working range {range}. Pass the Trial to become proficient.':
    'Arbeitsbereich {range}. Besteh die Prüfung, um die Übung zu beherrschen.',
  'Range min': 'Bereich min',
  'Range max': 'Bereich max',
  'Trial sets': 'Prüfungssätze',
  'Trial target': 'Prüfungsziel',
  Lowerings: 'Ablass-Wdh.',
  'Reps per set': 'Wdh. pro Satz',
  Prerequisites: 'Voraussetzungen',
  'None: it is open from the start.': 'Keine: Sie ist von Anfang an offen.',
  'Required (locks until met)': 'Erforderlich (gesperrt, bis erfüllt)',
  Level: 'Level',
  Remove: 'Entfernen',
  'Remove prerequisite {name}': 'Voraussetzung {name} entfernen',
  'Add prerequisite': 'Voraussetzung hinzufügen',
  Equipment: 'Ausrüstung',
  'Each option is one way to do it; it needs all the tags of that option.':
    'Jede Option ist eine Art, sie auszuführen; sie braucht alle Tags dieser Option.',
  'Option {n}': 'Option {n}',
  'Remove option': 'Option entfernen',
  'Add option': 'Option hinzufügen',
  Trains: 'Trainiert',
  'The attributes it builds on your character sheet.':
    'Die Attribute, die sie auf deinem Charakterbogen aufbaut.',
  Auto: 'Auto',
  'Auto: from the movement pattern': 'Auto: aus dem Bewegungsmuster',
  'What must be learned first. Search, or pick from this branch.':
    'Was zuerst gelernt werden muss. Suche, oder wähle aus diesem Zweig.',
  'No exercise matches.': 'Keine Übung passt.',
  Cues: 'Hinweise',
  'Remove cue {cue}': 'Hinweis {cue} entfernen',
  'New cue': 'Neuer Hinweis',
  'e.g. Shoulders down and back': 'z. B. Schultern runter und zurück',
  'Add cue': 'Hinweis hinzufügen',

  // src/components/editor/OverlayEntryRow.tsx
  'Replaces yours': 'Ersetzt deine',
  'Opens the skill': 'Öffnet den Skill',
  '{action} {name}': '{name} {action}',

  // src/components/editor/PositionSheet.tsx
  'Pick the exercise it follows in the column. Its tier is kept between its neighbours.':
    'Wähle die Übung, auf die sie in der Spalte folgt. Ihre Stufe bleibt zwischen ihren Nachbarn.',
  'At the top of the branch': 'Am Anfang des Zweigs',

  // src/components/editor/SharePanel.tsx
  'Something went wrong.': 'Etwas ist schiefgelaufen.',
  Share: 'Teilen',
  'Your changes as one YAML file, in the same format as the app’s own progressions. A friend can import it, or you can keep it as a copy.':
    'Deine Änderungen als eine YAML-Datei, im selben Format wie die Progressionen der App. Ein Freund kann sie importieren, oder du behältst sie als Kopie.',
  'Share my progressions': 'Meine Progressionen teilen',
  'Handed to the share sheet.': 'An das Teilen-Menü übergeben.',
  'Suggest to project': 'Dem Projekt vorschlagen',
  'Found a better standard or a missing exercise? SkillForge’s progressions are open. Share your YAML, then paste it into a GitHub issue or pull request. The contributor guide explains the fields and asks for a source for every standard.':
    'Einen besseren Standard oder eine fehlende Übung gefunden? Die Progressionen von SkillForge sind offen. Teile dein YAML und füge es dann in ein GitHub-Issue oder einen Pull Request ein. Der Beitragsleitfaden erklärt die Felder und verlangt für jeden Standard eine Quelle.',
  'Open the contributor guide': 'Beitragsleitfaden öffnen',
  'Opens content/progressions/README.md on GitHub in the browser':
    'Öffnet content/progressions/README.md auf GitHub im Browser',

  // src/domain/nodeEditor.ts
  'description is missing: say in 1–3 sentences what the exercise is and what it looks like':
    'Beschreibung fehlt: Sag in 1–3 Sätzen, was die Übung ist und wie sie aussieht',

  // src/domain/overlayEdit.ts
  name: 'Name',
  description: 'Beschreibung',
  branch: 'Zweig',
  position: 'Position',
  tier: 'Stufe',
  metric: 'Messgröße',
  'working range': 'Arbeitsbereich',
  Trial: 'Prüfung',
  prerequisites: 'Voraussetzungen',
  'straight-arm flag': 'Streckarm-Markierung',
  'skill flag': 'Skill-Markierung',
  patterns: 'Bewegungsmuster',
  'trained attributes': 'trainierte Attribute',
  equipment: 'Ausrüstung',
  alternatives: 'Alternativen',
  regression: 'Regression',
  'legendary flag': 'Legendär-Markierung',
  cues: 'Hinweise',
  sources: 'Quellen',
  'verify note': 'Prüfvermerk',
  review: 'Review',
  'Your own exercise': 'Deine eigene Übung',
  'Changed: {fields}': 'Geändert: {fields}',
  'Hidden from the tree': 'Im Baum ausgeblendet',
};
