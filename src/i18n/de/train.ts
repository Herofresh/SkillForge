import type { Dictionary } from '../t';

/** The train area: the Train tab, plan preview, live session, summary, past sessions and their domain texts. */
export const TRAIN_DE: Dictionary = {
  // app/(tabs)/train.tsx
  'Training Grounds': 'Trainingsplatz',
  'Session in progress': 'Session läuft',
  'Train now': 'Jetzt trainieren',
  'Your sets are saved as you go. Pick up where you left off.':
    'Deine Sätze werden laufend gespeichert. Mach weiter, wo du aufgehört hast.',
  'Pick your equipment and time; the grimoire suggests a session for your goals.':
    'Wähle Ausrüstung und Zeit; das Grimoire schlägt dir eine Session für deine Ziele vor.',
  '{logged} of {planned} sets logged': '{logged} von {planned} Sätzen geloggt',
  'Resume session': 'Session fortsetzen',
  Standard: 'Standard',
  'Skills, strength and core for your goals, with a short cool-down.':
    'Skills, Kraft und Rumpf für deine Ziele, mit kurzem Cool-down.',
  Recovery: 'Erholung',
  'Mobility, a cool-down and light skill practice. No hard strength, no straight-arm work.':
    'Mobilität, ein Cool-down und leichte Skill-Übung. Keine harte Kraftarbeit, keine Arbeit mit gestreckten Armen.',
  Challenging: 'Fordernd',
  'More sets, the harder end of each range, and a Trial if one is due.':
    'Mehr Sätze, das obere Ende jedes Bereichs und eine Prüfung, wenn eine ansteht.',
  Equipment: 'Ausrüstung',
  'No equipment profile yet: add one in Settings.':
    'Noch kein Ausrüstungsprofil: leg eins in den Einstellungen an.',
  Time: 'Zeit',
  '{n} min': '{n} min',
  'Training type': 'Trainingsart',
  'Plan my session': 'Session planen',
  'Suggests a session you can change before starting':
    'Schlägt eine Session vor, die du vor dem Start ändern kannst',

  // app/train/preview.tsx
  'Your plan': 'Dein Plan',
  'No plan': 'Kein Plan',
  'Plan a session on the Train tab.': 'Plane eine Session im Tab Training.',
  '{profile} · {minutes} min': '{profile} · {minutes} min',
  "Today's quest": 'Heutige Quest',
  '1 exercise · about {minutes} min': '1 Übung · etwa {minutes} min',
  '{n} exercises · about {minutes} min': '{n} Übungen · etwa {minutes} min',
  Notes: 'Anmerkungen',
  Swap: 'Tauschen',
  'Swap {name}': '{name} tauschen',
  Remove: 'Entfernen',
  'Remove {name}': '{name} entfernen',
  'Empty plan': 'Leerer Plan',
  'Add an exercise to start.': 'Füge eine Übung hinzu, um zu starten.',
  'Add exercise': 'Übung hinzufügen',
  'Read and acknowledge the notes above to start. It is your call.':
    'Lies und bestätige die Hinweise oben, um zu starten. Du entscheidest.',
  'Start session': 'Session starten',
  'Swap exercise': 'Übung tauschen',
  'Exercises of the same movement as {name} that your equipment allows.':
    'Übungen mit derselben Bewegung wie {name}, die deine Ausrüstung erlaubt.',
  'No other exercise of this movement fits your equipment yet.':
    'Noch keine andere Übung dieser Bewegung passt zu deiner Ausrüstung.',
  'Suggestions from your open skills, or search any skill by name.':
    'Vorschläge aus deinen offenen Skills, oder such jeden Skill nach Namen.',
  'Nothing found that your equipment allows.': 'Nichts gefunden, das deine Ausrüstung erlaubt.',

  // app/train/session.tsx
  'Read and acknowledge the notes above to log. It is your call.':
    'Lies und bestätige die Hinweise oben, um zu loggen. Du entscheidest.',
  Session: 'Session',
  'No session': 'Keine Session',
  'Start one on the Train tab.': 'Starte eine im Tab Training.',
  Sets: 'Sätze',
  '{done} of {total} exercises done': '{done} von {total} Übungen erledigt',
  'Skip exercise': 'Übung überspringen',
  'Every exercise is done or skipped. Finish the session to claim your XP, or add one more.':
    'Jede Übung ist erledigt oder übersprungen. Beende die Session, um deine XP zu holen, oder füge noch eine hinzu.',
  'This session': 'Diese Session',
  Done: 'Fertig',
  Reorder: 'Sortieren',
  'Done reordering': 'Sortieren beenden',
  'Reorder exercises': 'Übungen sortieren',
  'Finish session': 'Session beenden',
  Abandon: 'Aufgeben',
  'Finish session?': 'Session beenden?',
  'Keep training': 'Weiter trainieren',
  'Nothing is logged yet, so finishing ends the session without saving it.':
    'Noch nichts geloggt: Beenden schließt die Session, ohne sie zu speichern.',
  '{logged} of {planned} sets are logged. Missing sets of exercises you started count as skipped; exercises you never started are left out.':
    '{logged} von {planned} Sätzen sind geloggt. Fehlende Sätze begonnener Übungen zählen als übersprungen; nie begonnene Übungen bleiben weg.',
  Finish: 'Beenden',
  'Abandon session?': 'Session aufgeben?',
  'Your logged sets are thrown away and earn no XP.':
    'Deine geloggten Sätze werden verworfen und bringen keine XP.',
  Skipped: 'Übersprungen',
  '{block} · pair': '{block} · Paar',
  Up: 'Hoch',
  'Move {name} up': '{name} nach oben',
  Down: 'Runter',
  'Move {name} down': '{name} nach unten',
  '{name}, {block}, {status}': '{name}, {block}, {status}',

  // app/train/summary.tsx
  Victory: 'Sieg',
  'No summary': 'Keine Zusammenfassung',
  'Finish a session to see one.': 'Beende eine Session, um eine zu sehen.',
  'Session logged': 'Session geloggt',
  Safeguards: 'Schutzregeln',
  'Read and acknowledge the notes above to close the summary.':
    'Lies und bestätige die Hinweise oben, um die Zusammenfassung zu schließen.',
  'Adding the workout to Health Connect…': 'Training wird zu Health Connect hinzugefügt…',
  'Added to Health Connect.': 'Zu Health Connect hinzugefügt.',
  'Not added to Health Connect: SkillForge may no longer write exercise. Turn it on again in Settings → Health Connect.':
    'Nicht zu Health Connect hinzugefügt: SkillForge darf keine Trainings mehr schreiben. Schalte es unter Einstellungen → Health Connect wieder ein.',
  'Couldn’t add the workout to Health Connect. Your session is saved here.':
    'Das Training konnte nicht zu Health Connect hinzugefügt werden. Deine Session ist hier gespeichert.',

  // app/session/[sessionId].tsx
  'Session not found': 'Session nicht gefunden',
  'It is not in your log.': 'Sie ist nicht in deinem Protokoll.',
  'Session of {date}': 'Session vom {date}',
  'Safeguard notes': 'Schutzregel-Hinweise',

  // src/components/train/BattleBoard.tsx
  'Tap a monster to beat its set at the target; tap it again for one rep fewer. Long press to enter an exact number or edit a set. Holds: tap to start the timer, tap again to stop.':
    'Tipp auf ein Monster, um seinen Satz am Ziel zu schlagen; tipp noch einmal für eine Wiederholung weniger. Lang drücken, um eine genaue Zahl einzugeben oder einen Satz zu bearbeiten. Halten: Tippen startet den Timer, noch einmal Tippen stoppt ihn.',

  // src/components/train/EditSetSheet.tsx
  'Set {n}': 'Satz {n}',
  'Edit set {n}': 'Satz {n} bearbeiten',
  Cancel: 'Abbrechen',
  'Logged: {logged} · Target: {target}': 'Geloggt: {logged} · Ziel: {target}',
  'Delete {set}? Its result is removed from the session and the later sets move up.':
    '{set} löschen? Sein Ergebnis wird aus der Session entfernt und die späteren Sätze rücken auf.',
  'Delete set': 'Satz löschen',
  'Keep set': 'Satz behalten',
  Did: 'Gemacht',
  Save: 'Speichern',
  'Saves the set as entered': 'Speichert den Satz wie eingegeben',
  Partial: 'Teilweise',
  'Saves the set as short of the target': 'Speichert den Satz als unter dem Ziel',
  Failed: 'Fehlgeschlagen',
  'Saves the set as not done': 'Speichert den Satz als nicht geschafft',
  'Asks before removing the set': 'Fragt nach, bevor der Satz entfernt wird',

  // src/components/train/ExerciseCard.tsx
  'Swapped from {name}': 'Getauscht von {name}',
  "Replaces {name} (needs equipment you don't have)":
    'Ersetzt {name} (braucht Ausrüstung, die du nicht hast)',
  'Pair: alternate sets with {name}': 'Paar: Sätze im Wechsel mit {name}',
  Trial: 'Prüfung',
  'Straight-arm': 'Streckarm',

  // src/components/train/FoeRow.tsx
  'Starts or stops the hold; long press to enter the result':
    'Startet oder stoppt das Halten; lang drücken, um das Ergebnis einzugeben',
  'Logs the target; long press to enter the result':
    'Loggt das Ziel; lang drücken, um das Ergebnis einzugeben',
  'Edits the set': 'Bearbeitet den Satz',
  'One rep fewer, below zero it is removed; long press to edit':
    'Eine Wiederholung weniger, unter null wird er entfernt; lang drücken zum Bearbeiten',
  'Extra set of {name}': 'Extrasatz von {name}',

  // src/components/train/LogSetSheet.tsx
  '{name} · Target: {target}': '{name} · Ziel: {target}',
  'Log set': 'Satz loggen',
  'Logs the set as entered': 'Loggt den Satz wie eingegeben',

  // src/components/train/NodeOptionSheet.tsx
  Search: 'Suche',
  'e.g. dip': 'z. B. Dip',

  // src/components/train/RestPanel.tsx
  'Rest: {n} seconds left': 'Pause: noch {n} Sekunden',
  Rest: 'Pause',
  Skip: 'Überspringen',
  'Skip rest': 'Pause überspringen',

  // src/components/train/SessionClock.tsx
  'Session time {time}': 'Sessionzeit {time}',

  // src/components/train/SessionResultPanels.tsx
  '{exercises} from exercises · +{completion} completion · +{streak} streak · +{challenge} challenge':
    '{exercises} aus Übungen · +{completion} Abschluss · +{streak} Serie · +{challenge} Herausforderung',
  '{exercises} from exercises · +{completion} completion · +{streak} streak':
    '{exercises} aus Übungen · +{completion} Abschluss · +{streak} Serie',
  'Streak: 1 session': 'Serie: 1 Session',
  'Streak: {n} sessions': 'Serie: {n} Sessions',
  'Level ups': 'Level-Aufstiege',
  '{name}: LV {from} → {to}': '{name}: LV {from} → {to}',
  Unlocked: 'Freigeschaltet',
  'Open {name}': '{name} öffnen',
  '{name}: {note} Opens the skill.': '{name}: {note} Öffnet den Skill.',
  Exercises: 'Übungen',
  '{name}: {outcome}, {xp} XP': '{name}: {outcome}, {xp} XP',
  ', time {time}': ', Zeit {time}',
  'Trial passed': 'Prüfung bestanden',
  'Trial not passed yet': 'Prüfung noch nicht bestanden',

  // src/components/train/SetLogger.tsx
  success: 'geschafft',
  partial: 'teilweise',
  failed: 'fehlgeschlagen',
  'Extra set {n}': 'Extrasatz {n}',
  'Set {n} of {total}': 'Satz {n} von {total}',
  'Set {n}: {result}': 'Satz {n}: {result}',
  '{set}, {outcome}': '{set}, {outcome}',
  'Edit or delete this set': 'Diesen Satz bearbeiten oder löschen',
  'Target: {target}': 'Ziel: {target}',
  'Logs the set as short of the target': 'Loggt den Satz als unter dem Ziel',
  'Logs the set as not done': 'Loggt den Satz als nicht geschafft',

  // src/components/timer/SetTimerPanel.tsx
  'Start hold': 'Halten starten',
  'Start set': 'Satz starten',
  'Counts down from {n} seconds after a short get-ready':
    'Zählt nach einem kurzen Countdown von {n} Sekunden herunter',
  'Starts a stopwatch for this set': 'Startet eine Stoppuhr für diesen Satz',
  Stop: 'Stopp',
  Resume: 'Weiter',
  'Runs the timer on from where it was paused':
    'Lässt den Timer dort weiterlaufen, wo er pausiert wurde',
  Pause: 'Pause',
  'Stops the clock until you resume; the pause is not counted':
    'Hält die Uhr an, bis du weitermachst; die Pause zählt nicht',
  'Puts the seconds held into the result': 'Übernimmt die gehaltenen Sekunden ins Ergebnis',
  'Keeps the time for this set': 'Behält die Zeit für diesen Satz',
  'Throws this timer away': 'Verwirft diesen Timer',
  'Reset timer': 'Timer zurücksetzen',
  'Clears the measured time; the set is logged without it':
    'Löscht die gemessene Zeit; der Satz wird ohne sie geloggt',

  // src/domain/trainView.ts
  'Warm-up': 'Aufwärmen',
  Skill: 'Skill',
  Strength: 'Kraft',
  Core: 'Rumpf',
  'Cool-down': 'Cool-down',
  'Added by you': 'Von dir hinzugefügt',
  Success: 'Geschafft',

  // src/domain/battleView.ts
  'not fought yet': 'noch nicht bekämpft',
  fighting: 'im Kampf',
  overkill: 'Overkill',
  defeated: 'besiegt',
  wounded: 'verwundet',
  escaped: 'entkommen',
  '{set}, {monster}, {state}, {result}': '{set}, {monster}, {state}, {result}',
  '{set}, {monster}, {state}, target {target}': '{set}, {monster}, {state}, Ziel {target}',

  // src/domain/format.ts
  '{n} rep': '{n} Wdh.',
  '{n} reps': '{n} Wdh.',
  '{n} s': '{n} s',
  '{reps} × {n} s lowering': '{reps} × {n} s Ablassen',
  '{reps} × {n} s lowerings': '{reps} × {n} s Ablassen',
  '{reps} rep at {load}× BW': '{reps} Wdh. mit {load}× BW',
  '{reps} reps at {load}× BW': '{reps} Wdh. mit {load}× BW',
  '1 set of {perSet}': '1 Satz à {perSet}',
  '{sets} sets of {perSet}': '{sets} Sätze à {perSet}',
  reps: 'Wdh.',
  Reps: 'Wdh.',
  Hold: 'Halten',
  'Slow lowering': 'Langsames Ablassen',
  Weighted: 'Mit Zusatzgewicht',
  Foundation: 'Grundlage',
  'Tier {n}': 'Stufe {n}',
  foundation: 'Grundlage',
  'tier {n}': 'Stufe {n}',
  '{n} s lowerings': '{n} s Ablassen',
  '{n}× BW': '{n}× BW',
  Jan: 'Jan',
  Feb: 'Feb',
  Mar: 'Mär',
  Apr: 'Apr',
  May: 'Mai',
  Jun: 'Jun',
  Jul: 'Jul',
  Aug: 'Aug',
  Sep: 'Sep',
  Oct: 'Okt',
  Nov: 'Nov',
  Dec: 'Dez',
  '{list} and {last}': '{list} und {last}',
  'It also counts for {list}: it is proficient now.':
    'Sie zählt auch für {list}: er ist jetzt beherrscht.',
  'It also counts for {list}: they are proficient now.':
    'Sie zählt auch für {list}: sie sind jetzt beherrscht.',
  'Trial needed': 'Prüfung nötig',
  'Level 5 reached: pass the Trial to keep levelling. {banked} XP banked.':
    'Level 5 erreicht: besteh die Prüfung, um weiter aufzusteigen. {banked} XP gespart.',
  'Level 5 reached: pass the Trial to keep levelling.':
    'Level 5 erreicht: besteh die Prüfung, um weiter aufzusteigen.',
  'Its Trial is planned once every set reaches {rangeTop}, or right away in a Challenging session.':
    'Seine Prüfung wird geplant, sobald jeder Satz {rangeTop} erreicht, oder sofort in einer fordernden Session.',
  'Warm-up: half XP': 'Aufwärmen: halbe XP',
  'Cool-down: half XP': 'Cool-down: halbe XP',
  'Trial ready': 'Prüfung bereit',
  Max: 'Max',
  '{xp} / {total} XP': '{xp} / {total} XP',
  '{n} min rest': '{n} min Pause',
  '{n} s rest': '{n} s Pause',
  'No description yet. Edit this exercise to add one.':
    'Noch keine Beschreibung. Bearbeite diese Übung, um eine hinzuzufügen.',

  // src/domain/generator.ts
  'Recovery session: mobility, a cool-down and light skill practice. No hard strength and no straight-arm work today.':
    'Erholungssession: Mobilität, ein Cool-down und leichte Skill-Übung. Heute keine harte Kraftarbeit und keine Arbeit mit gestreckten Armen.',
  'Challenging session: more sets and the harder end of each range, and a Trial if one is due. End a set when your form breaks.':
    'Fordernde Session: mehr Sätze und das obere Ende jedes Bereichs, dazu eine Prüfung, wenn eine ansteht. Beende einen Satz, wenn deine Form bricht.',
  'horizontal push': 'horizontales Drücken',
  'vertical push': 'vertikales Drücken',
  'vertical pull': 'vertikales Ziehen',
  'horizontal pull': 'horizontales Ziehen',
  'straight arm push': 'Streckarm-Drücken',
  'straight arm pull': 'Streckarm-Ziehen',
  squat: 'Kniebeuge',
  hinge: 'Hüftbeugen',
  core: 'Rumpf',
  balance: 'Balance',
  mobility: 'Mobilität',
  explosive: 'Explosivkraft',
  '{name}: top of the range reached. Its Trial is recommended in {days} days ({weeks} weeks of straight-arm training first).':
    '{name}: oberes Ende des Bereichs erreicht. Seine Prüfung wird in {days} Tagen empfohlen (erst {weeks} Wochen Training mit gestreckten Armen).',
  '{name}: its Trial is recommended after {weeks} weeks of training.':
    '{name}: seine Prüfung wird nach {weeks} Wochen Training empfohlen.',
  '{name} has not improved in {sessions} sessions, so it gets priority today.':
    '{name} hat sich seit {sessions} Sessions nicht verbessert, deshalb hat es heute Vorrang.',
  "{name}'s Trial doesn't fit today's time, so it gets working sets instead. Give the session more minutes to attempt it.":
    'Die Prüfung von {name} passt nicht in die heutige Zeit, deshalb gibt es stattdessen Arbeitssätze. Gib der Session mehr Minuten, um sie zu versuchen.',
  'Planned at your pace: in your last sessions you rested about {percent}% of the suggested rest, so the time estimate counts that.':
    'Nach deinem Tempo geplant: in deinen letzten Sessions hast du etwa {percent}% der vorgeschlagenen Pause gemacht, das rechnet die Zeitschätzung ein.',
  "Goal '{goal}' is not in your skill tree and was skipped.":
    "Ziel '{goal}' ist nicht in deinem Skill-Baum und wurde übersprungen.",
  "{name} is on the way to your goal but needs equipment this profile doesn't have, and no alternative fits.":
    '{name} liegt auf dem Weg zu deinem Ziel, braucht aber Ausrüstung, die dieses Profil nicht hat, und keine Alternative passt.',
  "{to} replaces {from}, which needs equipment this profile doesn't have.":
    '{to} ersetzt {from}, das Ausrüstung braucht, die dieses Profil nicht hat.',
  'Resting {list}: trained less than {hours} h ago.':
    'Pause für {list}: vor weniger als {hours} h trainiert.',
  "Trial day: {name}'s Trial is today's only straight-arm work. Its sets don't count against the ~{budget} s straight-arm budget; extra straight-arm work on top of it is not recommended.":
    'Prüfungstag: die Prüfung von {name} ist heute die einzige Arbeit mit gestreckten Armen. Ihre Sätze zählen nicht gegen das Streckarm-Budget von ~{budget} s; zusätzliche Streckarm-Arbeit obendrauf wird nicht empfohlen.',
  'No straight-arm work today: your last straight-arm session was less than {hours} h ago.':
    'Heute keine Arbeit mit gestreckten Armen: deine letzte Streckarm-Session war vor weniger als {hours} h.',
  'Your push and pull levels are far apart, so push work gets priority.':
    'Deine Level in Drücken und Ziehen liegen weit auseinander, deshalb hat Drück-Arbeit Vorrang.',
  'Your push and pull levels are far apart, so pull work gets priority.':
    'Deine Level in Drücken und Ziehen liegen weit auseinander, deshalb hat Zieh-Arbeit Vorrang.',
  'This plan fills about {minutes} of your {available} min: that is all your tree, equipment and rest days suggest today. Add exercises if you want more.':
    'Dieser Plan füllt etwa {minutes} deiner {available} min: mehr schlagen dein Baum, deine Ausrüstung und deine Ruhetage heute nicht vor. Füge Übungen hinzu, wenn du mehr willst.',
  'Much of your strength work is resting today: a Recovery session may suit it better.':
    'Ein großer Teil deiner Kraftarbeit pausiert heute: eine Erholungssession passt vielleicht besser.',

  // src/domain/setTimer.ts
  '+{n} s': '+{n} s',
  Held: 'Gehalten',
  Paused: 'Pausiert',
  'Get ready': 'Bereit machen',
  'Target reached': 'Ziel erreicht',
  '1 second': '1 Sekunde',
  '{n} seconds': '{n} Sekunden',
  '{caption}: {time}': '{caption}: {time}',
  'Paused, {reading}': 'Pausiert, {reading}',
  'Get ready: {time}': 'Bereit machen: {time}',
  'Hold: {time} left': 'Halten: noch {time}',
  'Target reached: {time} over': 'Ziel erreicht: {time} drüber',
  'Time: {time}': 'Zeit: {time}',

  // src/domain/safeguards.ts
  '{name} is straight-arm work: a Trial is recommended after {weeks} weeks of training it, so your tendons can catch up with your muscles.':
    '{name} ist Arbeit mit gestreckten Armen: eine Prüfung wird nach {weeks} Wochen Training empfohlen, damit deine Sehnen mit deinen Muskeln mithalten können.',
  '{name} is straight-arm work you have not trained here yet: a Trial is recommended after {weeks} weeks of training it. Only test out if you already train it.':
    '{name} ist Arbeit mit gestreckten Armen, die du hier noch nicht trainiert hast: eine Prüfung wird nach {weeks} Wochen Training empfohlen. Teste dich nur frei, wenn du sie schon trainierst.',
  'This session has about {used} s of straight-arm work besides the Trial; about {budget} s per session is recommended for tendon health.':
    'Diese Session hat neben der Prüfung etwa {used} s Arbeit mit gestreckten Armen; etwa {budget} s pro Session werden für gesunde Sehnen empfohlen.',
  'This session has about {used} s of straight-arm work; about {budget} s per session is recommended for tendon health.':
    'Diese Session hat etwa {used} s Arbeit mit gestreckten Armen; etwa {budget} s pro Session werden für gesunde Sehnen empfohlen.',
  'Your last straight-arm session was less than {hours} h ago; {hours} h of rest between straight-arm sessions is recommended.':
    'Deine letzte Streckarm-Session war vor weniger als {hours} h; {hours} h Pause zwischen Streckarm-Sessions werden empfohlen.',
  '{name} L{level}': '{name} LV {level}',
  '{name} usually comes after {list}. You chose to go ahead; build up if it feels too hard.':
    '{name} kommt normalerweise nach {list}. Du hast dich entschieden weiterzumachen; bau dich auf, wenn es sich zu schwer anfühlt.',

  // src/domain/healthWorkout.ts
  'SkillForge workout': 'SkillForge-Training',
  '{list} reps': '{list} Wdh.',
  '{list} s': '{list} s',
  '{name} (Trial): {sets}': '{name} (Prüfung): {sets}',
  '{name}: {sets}': '{name}: {sets}',
  '1 exercise': '1 Übung',
  '{n} exercises': '{n} Übungen',
  '1 set': '1 Satz',
  '{n} sets': '{n} Sätze',
};
