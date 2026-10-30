import type { Dictionary } from '../t';

/**
 * The guide ("How SkillForge works") and the UI kit: every guide title, summary and detail line
 * (the numbers come in as placeholders, built per locale in `src/domain/guide.ts`), the guide
 * screens and sheets, and the UI kit's own words (modal, stepper, warning banner, bursts, tiers).
 */
export const GUIDE_DE: Dictionary = {
  // src/domain/guide.ts
  Push: 'Drücken',
  Pull: 'Ziehen',
  Core: 'Rumpf',
  Legs: 'Beine',
  Balance: 'Balance',
  Mobility: 'Mobilität',
  Novice: 'Novize',
  Apprentice: 'Lehrling',
  Adept: 'Adept',
  Master: 'Meister',
  Legend: 'Legende',
  balance: 'Balance',
  mobility: 'Mobilität',
  '{init} and {last}': '{init} und {last}',
  'Training sword': 'Übungsschwert',
  '{base} + {perLevel} × its tier': '{base} + {perLevel} × seine Stufe',
  'XP and levels': 'XP und Level',
  'Every set you log earns XP. Reps, hold time and slow lowerings all count, and harder skills pay more for the same work. All your XP adds up to your character level (up to level {max}).':
    'Jeder Satz, den du loggst, bringt XP. Wiederholungen, Haltezeit und langsames Ablassen zählen alle, und schwerere Skills zahlen mehr für dieselbe Arbeit. Alle deine XP zusammen ergeben dein Charakter-Level (bis Level {max}).',
  'One unit of work is one rep, {holdS} s of hold or {eccentricS} s of slow lowering. Each unit pays XP by the skill’s tier: {difficulty}.':
    'Eine Einheit Arbeit ist eine Wiederholung, {holdS} s Halten oder {eccentricS} s langsames Ablassen. Jede Einheit zahlt XP nach der Stufe des Skills: {difficulty}.',
  'An exercise where every set met its target pays in full. Reaching at least {partialMin} % of the target pays {partial} %, less than that still pays {failed} %. A hard day is never wasted.':
    'Eine Übung, bei der jeder Satz sein Ziel erreicht hat, zahlt voll. Mindestens {partialMin} % des Ziels zahlen {partial} %, weniger zahlt immer noch {failed} %. Ein harter Tag ist nie umsonst.',
  'A session where you skip no set adds +{bonus} %, and your streak adds its bonus on top (see Streak). The XP goes to the skills you trained and to your character.':
    'Eine Session, in der du keinen Satz auslässt, bringt +{bonus} %, und deine Serie legt ihren Bonus obendrauf (siehe Serie). Die XP gehen an die Skills, die du trainiert hast, und an deinen Charakter.',
  'Warm-up sets (a single set of a skill) and mobility work next to your main work (the cool-down) pay {share} % of their XP, so they don’t outgrow what you actually train. A session that is mostly mobility, like Recovery, pays in full.':
    'Aufwärmsätze (ein einzelner Satz eines Skills) und Mobilitätsarbeit neben deiner Hauptarbeit (das Cool-down) zahlen {share} % ihrer XP, damit sie nicht über das hinauswachsen, was du wirklich trainierst. Eine Session, die vor allem aus Mobilität besteht, wie Erholung, zahlt voll.',
  'Your first character level-up takes {xp} XP; each one after that takes {growth} % more.':
    'Dein erster Charakter-Level-Aufstieg braucht {xp} XP; jeder weitere braucht {growth} % mehr.',
  'Skill levels and Trials': 'Skill-Level und Prüfungen',
  'Each skill has {max} levels and its own XP. At level {proficient} it waits for its Trial: meet the Trial standard to become proficient and open the skills that build on it.':
    'Jeder Skill hat {max} Level und eigene XP. Auf Level {proficient} wartet er auf seine Prüfung: Erreiche den Prüfungsstandard, um ihn zu beherrschen und die Skills zu öffnen, die darauf aufbauen.',
  'XP you earn past level {proficient} before the Trial is banked, not lost: it counts the moment you pass.':
    'XP, die du vor der Prüfung über Level {proficient} hinaus verdienst, werden gespart, nicht verloren: Sie zählen in dem Moment, in dem du bestehst.',
  'Test-out: you can attempt any skill’s Trial at any time, even a locked one. Passing makes the skill proficient at once (at least level {proficient}), so you can skip what you already master.':
    'Freitesten: Du kannst die Prüfung jedes Skills jederzeit versuchen, auch eines gesperrten. Bestehst du, ist der Skill sofort beherrscht (mindestens Level {proficient}), du kannst also überspringen, was du schon kannst.',
  'A passed Trial also counts for the skills it builds on: every earlier skill it needs becomes proficient too, as if you had passed its Trial.':
    'Eine bestandene Prüfung zählt auch für die Skills, auf denen sie aufbaut: Jeder frühere Skill, den sie braucht, gilt ebenfalls als beherrscht, als hättest du seine Prüfung bestanden.',
  'Unlock anyway: a locked skill can be opened by hand from its page. The app lists what it would normally need, you acknowledge it, and the choice is yours.':
    'Trotzdem freischalten: Einen gesperrten Skill kannst du auf seiner Seite von Hand öffnen. Die App zeigt, was er normalerweise bräuchte, du bestätigst es, und die Wahl liegt bei dir.',
  'A skill unlocks on its own when the skills it builds on (or one of their alternatives) reach the level it asks for. Recommended prerequisites never lock anything; they are good preparation.':
    'Ein Skill schaltet sich von selbst frei, wenn die Skills, auf denen er aufbaut (oder eine ihrer Alternativen), das verlangte Level erreichen. Empfohlene Voraussetzungen sperren nie etwas; sie sind gute Vorbereitung.',
  'Level {max} with the Trial passed is Mastered.':
    'Level {max} mit bestandener Prüfung heißt Gemeistert.',
  'Straight-arm safeguards': 'Streckarm-Schutzregeln',
  'Straight-arm skills (planche, levers, cross) load tendons, and tendons adapt far slower than muscle. The app recommends limits for them and warns you when you go past one, but it never stops you.':
    'Skills mit gestreckten Armen (Planche, Lever, Cross) belasten die Sehnen, und Sehnen passen sich viel langsamer an als Muskeln. Die App empfiehlt Grenzen dafür und warnt dich, wenn du eine überschreitest, hält dich aber nie auf.',
  'A straight-arm Trial is recommended after {weeks} weeks of training that skill.':
    'Eine Streckarm-Prüfung wird nach {weeks} Wochen Training dieses Skills empfohlen.',
  'A session holds at most {budget} s of straight-arm work. The sets of one straight-arm Trial don’t count against it (Trial day).':
    'Eine Session enthält höchstens {budget} s Streckarm-Arbeit. Die Sätze einer Streckarm-Prüfung zählen nicht dagegen (Prüfungstag).',
  'Straight-arm sessions are at least {hours} h apart.':
    'Zwischen Streckarm-Sessions liegen mindestens {hours} h.',
  'A warning asks you to acknowledge it. That only confirms you read it; the decision stays with you. The workouts the app suggests always keep to these limits.':
    'Eine Warnung bittet dich, sie zu bestätigen. Das bestätigt nur, dass du sie gelesen hast; die Entscheidung bleibt bei dir. Die Trainings, die die App vorschlägt, halten diese Grenzen immer ein.',
  Attributes: 'Attribute',
  '{count} attributes ({names}) show what your training builds. Every skill you train adds to the attributes it works, more for harder skills and higher levels. The radar shows their balance.':
    '{count} Attribute ({names}) zeigen, was dein Training aufbaut. Jeder Skill, den du trainierst, zahlt auf die Attribute ein, die er beansprucht, mehr bei schwereren Skills und höheren Leveln. Das Radar zeigt ihr Gleichgewicht.',
  'A skill adds ({difficulty}) times its level, from level {minLevel} on: a skill touched once in a warm-up or cool-down adds nothing yet. Until its Trial is passed, its level counts at most {proficient}.':
    'Ein Skill zählt ({difficulty}) mal sein Level, ab Level {minLevel}: Ein Skill, den du einmal beim Aufwärmen oder im Cool-down angefasst hast, zählt noch nichts. Bis seine Prüfung bestanden ist, zählt sein Level höchstens {proficient}.',
  'Straight-arm skills also train the core: planche counts as push and core, front lever as pull and core.':
    'Streckarm-Skills trainieren auch den Rumpf: Planche zählt als Drücken und Rumpf, Front Lever als Ziehen und Rumpf.',
  'The radar is scaled to your strongest attribute, so it shows the shape of your training rather than the size.':
    'Das Radar ist auf dein stärkstes Attribut skaliert, es zeigt also die Form deines Trainings, nicht die Größe.',
  'A note appears when your best push and pull skills are more than {gap} tiers apart. It is a hint for balance, nothing more.':
    'Ein Hinweis erscheint, wenn deine besten Drück- und Zieh-Skills mehr als {gap} Stufen auseinanderliegen. Er ist ein Tipp für die Balance, mehr nicht.',
  Ranks: 'Ränge',
  'Your rank shows how far you have come across the whole tree: the median of your best proficient skill in each of the {count} rank branches. {branches} don’t count towards it.':
    'Dein Rang zeigt, wie weit du im ganzen Baum gekommen bist: der Median deines besten beherrschten Skills in jedem der {count} Rang-Zweige. {branches} zählen nicht dazu.',
  'The ranks by branch median tier: {ranks}.': 'Die Ränge nach Median-Stufe der Zweige: {ranks}.',
  'A rank is certain once {needed} of the {count} branches reach its level (more than half). A high middle branch can sometimes make up for one less.':
    'Ein Rang ist sicher, sobald {needed} der {count} Zweige sein Level erreichen (mehr als die Hälfte). Ein hoher mittlerer Zweig kann manchmal einen fehlenden ausgleichen.',
  '{branches} are optional side paths, so leaving them out never holds your rank back. They still grow your attributes.':
    '{branches} sind optionale Nebenpfade, sie auszulassen hält deinen Rang also nie zurück. Deine Attribute wachsen trotzdem damit.',
  'Tap the rank crest on the Character tab to see every rank and what the next one needs.':
    'Tippe auf das Rang-Wappen im Charakter-Tab, um jeden Rang zu sehen und was der nächste braucht.',
  Streak: 'Serie',
  'Your streak counts sessions in a row that are at most {hours} h apart, so rest days don’t break it. Each session in a row after the first adds +{perSession} % to a session’s XP, up to +{max} %.':
    'Deine Serie zählt Sessions in Folge, die höchstens {hours} h auseinanderliegen, Ruhetage brechen sie also nicht. Jede weitere Session in Folge bringt +{perSession} % auf die XP einer Session, bis zu +{max} %.',
  'A longer break only starts a new streak with your next session; nothing else is lost.':
    'Eine längere Pause startet mit deiner nächsten Session nur eine neue Serie; sonst geht nichts verloren.',
  'Your best streak earns companion auras at {counts} sessions, and they stay earned.':
    'Deine beste Serie verdient Begleiter-Auren bei {counts} Sessions, und sie bleiben verdient.',
  'Classes and tiers': 'Klassen und Stufen',
  'Classes are titles your training unlocks: {count} of them, most with {tiers} tiers. Wear any class you have unlocked; it is cosmetic and never changes XP, workouts or the safeguards.':
    'Klassen sind Titel, die dein Training freischaltet: {count} Stück, die meisten mit {tiers} Stufen. Trage jede Klasse, die du freigeschaltet hast; sie ist kosmetisch und ändert nie XP, Trainings oder die Schutzregeln.',
  'Every hero starts as a {startingClass}. The other classes need flat thresholds, mostly attribute points, e.g. {name}: {attribute} {points}.':
    'Jeder Held beginnt als {startingClass}. Die anderen Klassen brauchen feste Schwellen, meist Attributpunkte, etwa {name}: {attribute} {points}.',
  'The numbers only grow with training, so specialising never locks a class away, and a reached tier stays yours forever.':
    'Die Zahlen wachsen mit dem Training nur, Spezialisieren sperrt also nie eine Klasse aus, und eine erreichte Stufe bleibt für immer deine.',
  'Tap the class banner on the Character tab to see every class, what each tier needs, and to choose the one you wear.':
    'Tippe auf das Klassen-Banner im Charakter-Tab, um jede Klasse zu sehen, was jede Stufe braucht, und die zu wählen, die du trägst.',
  'Weekly challenge': 'Wochen-Challenge',
  'The class you wear offers one optional goal per week, Monday to Sunday. Completing it pays +{xp} XP once that week and earns a badge; missing it costs nothing.':
    'Die Klasse, die du trägst, bietet ein optionales Ziel pro Woche, Montag bis Sonntag. Es zu schaffen zahlt in dieser Woche einmal +{xp} XP und bringt ein Abzeichen; es zu verpassen kostet nichts.',
  'The first session of a week fixes that week’s challenge to the class you wear then. Switching classes changes it from next Monday.':
    'Die erste Session einer Woche legt die Challenge dieser Woche auf die Klasse fest, die du dann trägst. Ein Klassenwechsel ändert sie ab dem nächsten Montag.',
  'Straight-arm sets never count, so a challenge never adds tendon load.':
    'Streckarm-Sätze zählen nie, eine Challenge erhöht also nie die Sehnenbelastung.',
  'Higher class tiers ask a little more, but never more than a normal training week.':
    'Höhere Klassenstufen verlangen etwas mehr, aber nie mehr als eine normale Trainingswoche.',
  Companion: 'Begleiter',
  'Your hero as a small pixel companion. It is {happy} on a training day, {content} for {contentDays} days after, {waiting} up to day {waitingDays}, and then it misses you; one session cheers it up. It never gets sick and never loses anything.':
    'Dein Held als kleiner Pixel-Begleiter. An einem Trainingstag ist er {happy}, {contentDays} Tage danach {content}, bis Tag {waitingDays} {waiting}, und dann vermisst er dich; eine Session muntert ihn auf. Er wird nie krank und verliert nie etwas.',
  'It can earn {count} accessories: rank gear, gear at character levels {levels}, milestones and class tiers. Earned ones are kept forever.':
    'Er kann {count} Accessoires verdienen: Rang-Ausstattung, Ausstattung auf den Charakter-Leveln {levels}, Meilensteine und Klassenstufen. Verdiente bleiben für immer.',
  'Choose what it wears, its body (man or woman), hair style and its skin, hair and outfit colours with Customize.':
    'Wähle mit Anpassen, was er trägt, seinen Körper (Mann oder Frau), die Frisur und die Farben von Haut, Haar und Outfit.',
  'It carries the weapon of the class you wear, upgraded from tier {tier}. A {className} carries a {weapon}.':
    'Er trägt die Waffe der Klasse, die du trägst, ab Stufe {tier} verbessert. Die Waffe zum Start als {className}: {weapon}.',
  'Workout generator': 'Trainingsgenerator',
  'Train builds a session for the place and time you pick ({min} to {max} min). It is a suggestion: swap, remove or add anything before you start.':
    'Training baut eine Session für den Ort und die Zeit, die du wählst ({min} bis {max} min). Sie ist ein Vorschlag: Tausche, entferne oder ergänze vor dem Start, was du willst.',
  'It leads towards your goals first (up to {max}), then favours movements you haven’t trained lately and the weaker side of push and pull.':
    'Er führt zuerst zu deinen Zielen (bis zu {max}), dann bevorzugt er Bewegungen, die du länger nicht trainiert hast, und die schwächere Seite von Drücken und Ziehen.',
  'Movements trained in the last {hours} h get a rest; {patterns} work is always fine.':
    'Bewegungen, die du in den letzten {hours} h trainiert hast, bekommen Pause; Arbeit an {patterns} geht immer.',
  'Double progression: hit every set and the next target goes up; reach the top of the range and it suggests the Trial.':
    'Doppelte Progression: Schaffst du jeden Satz, steigt das nächste Ziel; erreichst du das obere Ende des Bereichs, schlägt er die Prüfung vor.',
  'It only uses the equipment of the profile you picked; when a skill needs something else, a skill of the same movement stands in.':
    'Er nutzt nur die Ausrüstung des Profils, das du gewählt hast; braucht ein Skill etwas anderes, springt ein Skill derselben Bewegung ein.',
  'It plans at your pace: if your last {n} sessions show you rest less (or more) than suggested, the time estimate counts that. The suggested rest stays.':
    'Er plant in deinem Tempo: Zeigen deine letzten {n} Sessions, dass du weniger (oder mehr) pausierst als vorgeschlagen, rechnet die Zeitschätzung das ein. Die vorgeschlagene Pause bleibt.',
  'More time buys a cool-down, then more sets (up to {max} per exercise), then extra exercises.':
    'Mehr Zeit bringt ein Cool-down, dann mehr Sätze (bis zu {max} pro Übung), dann zusätzliche Übungen.',
  'Its suggestions always keep to the straight-arm safeguards.':
    'Seine Vorschläge halten sich immer an die Streckarm-Schutzregeln.',
  'Pick the kind of session: Standard, Recovery (mobility and light practice, no hard strength) or Challenging (more sets, harder targets, a due Trial). Every kind keeps the safeguards and the {hours} h rest.':
    'Wähle die Art der Session: Standard, Erholung (Mobilität und leichte Übung, keine harte Kraftarbeit) oder Fordernd (mehr Sätze, härtere Ziele, eine fällige Prüfung). Jede Art hält die Schutzregeln und die {hours} h Pause ein.',
  'In the session every set is a monster of the exercise’s branch; logging the set beats it. Settings → Training view picks Classic (one exercise at a time) or Battle (every exercise at once: tap a monster to log the target, tap again for one rep fewer, long press for an exact number).':
    'In der Session ist jeder Satz ein Monster aus dem Zweig der Übung; den Satz zu loggen besiegt es. Einstellungen → Trainingsansicht wählt Klassisch (eine Übung nach der anderen) oder Kampf (alle Übungen auf einmal: Tippe auf ein Monster, um das Ziel zu loggen, tippe noch einmal für eine Wiederholung weniger, halte gedrückt für eine genaue Zahl).',
  'Home-screen widgets': 'Startbildschirm-Widgets',
  'Two Android widgets: a small one with whether you trained today, your streak and level and, as space allows, your rank and up to {n} top attributes, and a large one with your companion. Tapping either opens Train.':
    'Zwei Android-Widgets: Ein kleines zeigt, ob du heute trainiert hast, deine Serie und dein Level und, wenn Platz ist, deinen Rang und bis zu {n} Top-Attribute; ein großes zeigt deinen Begleiter. Ein Tipp auf eines öffnet Training.',
  'Add them from your home screen: long-press an empty spot, choose Widgets and look for SkillForge.':
    'Füge sie vom Startbildschirm aus hinzu: Halte eine freie Stelle gedrückt, wähle Widgets und suche SkillForge.',
  'Resize them as you like: the text and the companion grow with the widget, and a bigger small widget shows more.':
    'Ändere ihre Größe, wie du willst: Text und Begleiter wachsen mit dem Widget, und ein größeres kleines Widget zeigt mehr.',
  'They show what the app last saved on this phone. They update after every session and refresh on their own regularly, so shortly after midnight “trained today” is about the new day.':
    'Sie zeigen, was die App zuletzt auf diesem Handy gespeichert hat. Sie aktualisieren sich nach jeder Session und regelmäßig von selbst, kurz nach Mitternacht meint „heute trainiert“ also den neuen Tag.',
  'Backups and your data': 'Backups und deine Daten',
  '{note} Export a backup in Settings and keep it somewhere safe; importing one replaces all your data.':
    '{note} Exportiere in den Einstellungen ein Backup und bewahre es sicher auf; ein Import ersetzt alle deine Daten.',
  'No ads and no analytics.': 'Keine Werbung, kein Tracking.',
  'Before an import replaces anything, the app checks the whole file and keeps a copy of your current data, so you can undo the last import.':
    'Bevor ein Import etwas ersetzt, prüft die App die ganze Datei und behält eine Kopie deiner aktuellen Daten, damit du den letzten Import rückgängig machen kannst.',
  'Levels, ranks, classes and accessories are worked out again from your logged sessions, so a backup restores all of them.':
    'Level, Ränge, Klassen und Accessoires werden aus deinen geloggten Sessions neu berechnet, ein Backup stellt also alles davon wieder her.',
  'Uninstalling the app removes its data from the phone. Android may bring it back from its device backup when you reinstall, but don’t count on it: export a backup first.':
    'Die App zu deinstallieren entfernt ihre Daten vom Handy. Android bringt sie beim Neuinstallieren vielleicht aus seinem Geräte-Backup zurück, aber verlass dich nicht darauf: Exportiere vorher ein Backup.',
  'Settings → Delete all my data erases everything SkillForge stored on this phone and starts the app fresh.':
    'Einstellungen → Alle meine Daten löschen entfernt alles, was SkillForge auf diesem Handy gespeichert hat, und startet die App neu.',
  'Settings → Health Connect (optional) adds every finished workout to Health Connect on this phone, with a note of what you did. SkillForge reads nothing from it; workouts it added stay there until you delete them in Health Connect.':
    'Einstellungen → Health Connect (optional) trägt jedes beendete Training in Health Connect auf diesem Handy ein, mit einer Notiz, was du gemacht hast. SkillForge liest nichts daraus; Trainings, die es eingetragen hat, bleiben dort, bis du sie in Health Connect löschst.',

  // src/components/guide/GuideButton.tsx
  'Explains how it works': 'Erklärt, wie es funktioniert',

  // src/components/guide/GuidePage.tsx
  'Opens this topic': 'Öffnet dieses Thema',
  'In detail': 'Im Detail',

  // src/components/guide/GuideSheet.tsx
  'More in the guide': 'Mehr im Leitfaden',
  'Opens this topic in How SkillForge works': 'Öffnet dieses Thema in „So funktioniert SkillForge“',

  // src/components/guide/SafeguardGuideNote.tsx
  'Why these warnings?': 'Warum diese Warnungen?',

  // app/guide/index.tsx
  'How it works': 'So funktioniert es',
  'How the game behind your training works: XP, levels, ranks, classes and the rest. Everything here is optional reading. The app suggests, you decide.':
    'So funktioniert das Spiel hinter deinem Training: XP, Level, Ränge, Klassen und der Rest. Alles hier ist optionale Lektüre. Die App schlägt vor, du entscheidest.',

  // app/guide/[topic].tsx
  'Unknown topic': 'Unbekanntes Thema',
  "No topic '{topic}' here.": 'Hier gibt es kein Thema „{topic}“.',
  'Next: {title}': 'Weiter: {title}',

  // src/components/ui/PixelModal.tsx
  Close: 'Schließen',

  // src/components/ui/NumberStepper.tsx
  'Less for {label}': 'Weniger für {label}',
  'More for {label}': 'Mehr für {label}',

  // src/components/ui/WarningBanner.tsx
  'Take care': 'Vorsicht',
  'Good to know': 'Gut zu wissen',
  'I understand': 'Verstanden',
  Acknowledged: 'Bestätigt',

  // src/components/ui/LevelUpBurst.tsx
  'LEVEL UP!': 'LEVEL-AUFSTIEG!',
  'UNLOCKED!': 'FREIGESCHALTET!',
  'TESTED OUT!': 'FREIGETESTET!',
  'QUEST COMPLETE': 'QUEST ERFÜLLT',
  'CLASS UNLOCKED!': 'KLASSE FREIGESCHALTET!',
  'TIER UP!': 'STUFENAUFSTIEG!',
  'CHALLENGE COMPLETE!': 'CHALLENGE GESCHAFFT!',
  'NEW TRINKET!': 'NEUES ACCESSOIRE!',
  'GOAL REACHED!': 'ZIEL ERREICHT!',

  // src/components/ui/TierChip.tsx
  Beginner: 'Anfänger',
  Intermediate: 'Fortgeschritten',
  Advanced: 'Weit fortgeschritten',
  Elite: 'Elite',
  '{tier} tier': 'Stufe {tier}',

  // src/components/ui/LevelBadge.tsx
  'Level {level}': 'Level {level}',
};
