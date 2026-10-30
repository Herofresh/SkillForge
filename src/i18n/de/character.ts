import type { Dictionary } from '../t';

/**
 * The Character tab and everything it opens: the companion, the hero classes and their weekly
 * challenges, the rank ladder, the goals, and the data they show (class names and titles,
 * accessories, weapons, looks, moods). Entries in the order of the files; keys shared by several
 * files sit where they first appear.
 */
export const CHARACTER_DE: Dictionary = {
  // src/data/classes.ts
  Recruit: 'Rekrut',
  'Every legend starts with a first rep.': 'Jede Legende beginnt mit einer ersten Wiederholung.',
  Warrior: 'Krieger',
  'Push the world away: dips, push-ups, presses.':
    'Drück die Welt weg: Dips, Liegestütze, Pressen.',
  Veteran: 'Veteran',
  Warlord: 'Kriegsherr',
  Ranger: 'Waldläufer',
  'A climber of cliffs and trees: pull-ups, rows, levers.':
    'Klettert auf Klippen und Bäume: Klimmzüge, Rudern, Lever.',
  Pathfinder: 'Pfadfinder',
  Warden: 'Hüter',
  Monk: 'Mönch',
  'A centre of stone: hollow holds, L-sits, compression.':
    'Eine Mitte aus Stein: Hollow Body Holds, L-Sits, Kompression.',
  Ascetic: 'Asket',
  Grandmaster: 'Großmeister',
  Barbarian: 'Barbar',
  'Legs like tree trunks: squats, lunges, jumps.':
    'Beine wie Baumstämme: Kniebeugen, Ausfallschritte, Sprünge.',
  Marauder: 'Marodeur',
  Chieftain: 'Häuptling',
  Rogue: 'Schurke',
  'Light on hands and feet: handstands, balance, tumbling.':
    'Leicht auf Händen und Füßen: Handstände, Balance, Akrobatik.',
  Shadow: 'Schatten',
  Nightblade: 'Nachtklinge',
  Druid: 'Druide',
  'Bends like a willow: mobility drills and deep ranges.':
    'Biegsam wie eine Weide: Mobilitätsübungen und tiefe Bewegungsbereiche.',
  Shaman: 'Schamane',
  Archdruid: 'Erzdruide',
  Paladin: 'Paladin',
  'Push and pull in balance, shoulders built to last.':
    'Drücken und Ziehen im Gleichgewicht, Schultern, die halten.',
  Crusader: 'Kreuzritter',
  Lightbringer: 'Lichtbringer',
  Samurai: 'Samurai',
  'Straight arms and a steel core: the lever path.':
    'Gestreckte Arme und ein Rumpf aus Stahl: der Lever-Pfad.',
  Kensei: 'Kensei',
  Shogun: 'Shogun',
  Templar: 'Templer',
  'Locked arms that hold the body level: the planche path.':
    'Durchgestreckte Arme, die den Körper waagrecht halten: der Planche-Pfad.',
  Inquisitor: 'Inquisitor',
  'Grand Templar': 'Großtempler',
  Bard: 'Barde',
  'Flow and grace: cartwheels, rolls and poised holds.':
    'Fluss und Anmut: Räder, Rollen und gehaltene Posen.',
  Skald: 'Skalde',
  Virtuoso: 'Virtuose',
  Cleric: 'Kleriker',
  'Calm breath, a strong centre and a supple body.':
    'Ruhiger Atem, eine starke Mitte und ein geschmeidiger Körper.',
  Priest: 'Priester',
  'High Priest': 'Hohepriester',
  Knight: 'Ritter',
  'Trained in every art: all six attributes.': 'In jeder Kunst geübt: alle sechs Attribute.',
  'Knight Commander': 'Ritterkommandant',
  'High Lord': 'Hochlord',
  Berserker: 'Berserker',
  'Shows up, again and again: sessions logged.': 'Taucht auf, immer wieder: geloggte Sessions.',
  Bloodrager: 'Blutwüter',
  Warchief: 'Kriegshäuptling',
  Sorcerer: 'Zauberer',
  'Mastery across the tree, measured by your rank.':
    'Meisterschaft im ganzen Baum, gemessen an deinem Rang.',
  Archmage: 'Erzmagier',
  Ascendant: 'Erhabener',

  // src/data/companion/accessories.ts
  'Rope headband': 'Seil-Stirnband',
  'Keeps the sweat out of a novice’s eyes.': 'Hält einem Novizen den Schweiß aus den Augen.',
  'Wool cap': 'Wollmütze',
  'Five sessions in: a cap for the walk to the bar.':
    'Fünf Sessions geschafft: eine Mütze für den Weg zur Stange.',
  'Iron circlet': 'Eisenreif',
  'A plain band with one rune-stone: the mark of an adept.':
    'Ein schlichter Reif mit einem Runenstein: das Zeichen eines Adepten.',
  'Laurel wreath': 'Lorbeerkranz',
  'Five Trials passed: the old sign of a champion.':
    'Fünf Prüfungen bestanden: das alte Zeichen eines Champions.',
  'Iron helm': 'Eisenhelm',
  'Dented, honest steel for a Warrior.': 'Verbeulter, ehrlicher Stahl für einen Krieger.',
  'Green hood': 'Grüne Kapuze',
  'A Ranger’s hood, the colour of the canopy.':
    'Die Kapuze eines Waldläufers, in der Farbe des Blätterdachs.',
  'Shadow mask': 'Schattenmaske',
  'Nobody saw who did that handstand.': 'Niemand hat gesehen, wer diesen Handstand gemacht hat.',
  'Antler wreath': 'Geweihkranz',
  'Shed antlers bound with ivy: a Druid’s crown.':
    'Abgeworfenes Geweih, mit Efeu gebunden: die Krone eines Druiden.',
  Hachimaki: 'Hachimaki',
  'A headband tied tight before the hardest hold.':
    'Ein Stirnband, fest gebunden vor dem härtesten Halten.',
  'Feathered cap': 'Federhut',
  'A Bard’s cap with a plume worth a ballad.':
    'Der Hut eines Barden mit einer Feder, die eine Ballade wert ist.',
  'Crested helm': 'Helm mit Helmbusch',
  'A closed helm with a plume in your colours.':
    'Ein geschlossener Helm mit einem Busch in deinen Farben.',
  'Pointed hat': 'Spitzhut',
  'Every Sorcerer needs one. The stars are optional.':
    'Jeder Zauberer braucht einen. Die Sterne sind optional.',
  'Star circlet': 'Sternenreif',
  'An iron band with one golden star for level 30.':
    'Ein Eisenreif mit einem goldenen Stern für Level 30.',
  'Horned warlord helm': 'Gehörnter Kriegsherrenhelm',
  'Blackened steel and two great horns: the helm of a Warlord.':
    'Geschwärzter Stahl und zwei mächtige Hörner: der Helm eines Kriegsherrn.',
  'Bone crown': 'Knochenkrone',
  'Fangs of the beasts a Chieftain outlasted.':
    'Fänge der Bestien, die ein Häuptling überdauert hat.',
  'Nightblade cowl': 'Nachtklingen-Kapuze',
  'Only the glint of one eye gives a Nightblade away.':
    'Nur das Funkeln eines Auges verrät eine Nachtklinge.',
  'Living crown of leaves': 'Lebende Blätterkrone',
  'It still grows, and blooms after every session.':
    'Sie wächst noch und blüht nach jeder Session.',
  'Kabuto helm': 'Kabuto-Helm',
  'Lacquered red with a golden crest, fit for a Shogun.':
    'Rot lackiert mit goldenem Zierkamm, wie es einem Shogun gebührt.',
  Mitre: 'Mitra',
  'The tall hat of a High Priest, stitched with gold.':
    'Der hohe Hut eines Hohepriesters, mit Gold bestickt.',
  'Golden crown': 'Goldene Krone',
  'Three points, two runes and a ruby. Only a Legend wears it.':
    'Drei Zacken, zwei Runen und ein Rubin. Nur eine Legende trägt sie.',
  'Travel scarf': 'Reiseschal',
  'Ten sessions: a red scarf against the morning wind.':
    'Zehn Sessions: ein roter Schal gegen den Morgenwind.',
  'Hooded cloak': 'Kapuzenumhang',
  'Wool against the wind on the road to the bar.': 'Wolle gegen den Wind auf dem Weg zur Stange.',
  'Fur pelt': 'Fellumhang',
  'A Barbarian’s pelt, warm and a little smelly.':
    'Das Fell eines Barbaren, warm und ein bisschen müffelnd.',
  'Storm cloak': 'Sturmumhang',
  'Two weeks without a miss: the night-blue cloak of a storm chaser.':
    'Zwei Wochen ohne Aussetzer: der nachtblaue Umhang eines Sturmjägers.',
  'Veteran’s scarf': 'Veteranenschal',
  'Fifty sessions in, it flies behind you like a flag.':
    'Nach fünfzig Sessions weht er hinter dir wie eine Fahne.',
  'Knight’s mantle': 'Rittermantel',
  'Gold-hemmed and fastened with a golden collar: a Master’s mantle.':
    'Mit Goldsaum und goldenem Kragen geschlossen: der Mantel eines Meisters.',
  'Leaf-woven warden cloak': 'Blattgewebter Hüterumhang',
  'Woven from living leaves; a Warden vanishes into any wood.':
    'Aus lebenden Blättern gewebt; ein Hüter verschwindet in jedem Wald.',
  'Grand templar cape': 'Großtempler-Cape',
  'White wool and a red cross, carried by a Grand Templar.':
    'Weiße Wolle und ein rotes Kreuz, getragen von einem Großtempler.',
  'High lord cape': 'Hochlord-Cape',
  'Long, heavy and trimmed with ermine: a High Lord’s cape.':
    'Lang, schwer und mit Hermelin besetzt: das Cape eines Hochlords.',
  'Champion’s cape': 'Champion-Cape',
  'Two hundred sessions: orchid silk with a golden hem.':
    'Zweihundert Sessions: Orchideenseide mit goldenem Saum.',
  'Phoenix cloak': 'Phönixumhang',
  'Its hem burns and never burns out.': 'Sein Saum brennt und erlischt nie.',
  'Traveler’s tunic': 'Reisetunika',
  'Sturdy cloth and a belt with a brass buckle.':
    'Robuster Stoff und ein Gürtel mit Messingschnalle.',
  'Iron pendant': 'Eisenanhänger',
  'A plain iron disc on a cord, one notch per Trial.':
    'Eine schlichte Eisenscheibe an einer Schnur, eine Kerbe pro Prüfung.',
  'Prayer beads': 'Gebetskette',
  'One bead per breath in a long hollow hold.':
    'Eine Perle pro Atemzug in einem langen Hollow Body Hold.',
  'Holy symbol': 'Heiliges Symbol',
  'A golden sun on a chain, warm to the touch.':
    'Eine goldene Sonne an einer Kette, warm in der Hand.',
  'Templar tabard': 'Templer-Wappenrock',
  'The red cross of the Templars over a white tabard.':
    'Das rote Kreuz der Templer auf weißem Wappenrock.',
  'Studded belt': 'Nietengürtel',
  'Iron studs on a wide belt for level 15.': 'Eisennieten auf einem breiten Gürtel für Level 15.',
  'Chainmail vest': 'Kettenweste',
  'Ten thousand rings, each one a rep.': 'Zehntausend Ringe, jeder eine Wiederholung.',
  'Fur-lined vest': 'Fellgefütterte Weste',
  'Thirty sessions: warm enough for a winter park.':
    'Dreißig Sessions: warm genug für den Park im Winter.',
  'Grandmaster robe': 'Großmeisterrobe',
  'Saffron robes of a Grandmaster of the hollow body.':
    'Safranfarbene Roben eines Großmeisters des Hollow Body.',
  'Dragonscale armour': 'Drachenschuppenrüstung',
  'Green scales and a golden belt. Nobody asks where it came from.':
    'Grüne Schuppen und ein goldener Gürtel. Niemand fragt, woher sie stammt.',
  'Chalked hands': 'Gekreidete Hände',
  'Three sessions in a row: time to chalk up.': 'Drei Sessions in Folge: Zeit für Kreide.',
  'Leather bracers': 'Lederschienen',
  'Laced forearm guards for an apprentice’s first holds.':
    'Geschnürte Unterarmschützer für die ersten Haltungen eines Lehrlings.',
  'Paladin shield': 'Paladinschild',
  'A heater shield with the Paladin’s golden sun.':
    'Ein Dreieckschild mit der goldenen Sonne des Paladins.',
  'Iron bracers': 'Eisenschienen',
  'Twenty-five sessions: forearm guards of plain iron.':
    'Fünfundzwanzig Sessions: Unterarmschützer aus schlichtem Eisen.',
  'Runed gauntlets': 'Runenhandschuhe',
  'Iron gauntlets with runes that glow under load.':
    'Eisenhandschuhe mit Runen, die unter Last glühen.',
  'Golden gauntlets': 'Goldene Panzerhandschuhe',
  'Ten Trials passed: gauntlets that catch the light.':
    'Zehn Prüfungen bestanden: Handschuhe, die das Licht einfangen.',
  'Skull pauldrons': 'Schädel-Schulterpanzer',
  'Shoulder guards that grin. A Warchief’s trophy.':
    'Schulterschützer, die grinsen. Die Trophäe eines Kriegshäuptlings.',
  'Trial medallion': 'Prüfungsmedaille',
  'Struck for your first passed Trial.': 'Geprägt für deine erste bestandene Prüfung.',
  'Spark aura': 'Funkenaura',
  'Fifteen sessions: the first sparks fly.': 'Fünfzehn Sessions: die ersten Funken fliegen.',
  'War paint': 'Kriegsbemalung',
  'Red stripes for a Berserker who never skips a session.':
    'Rote Streifen für einen Berserker, der nie eine Session auslässt.',
  'Ember aura': 'Glutaura',
  'A seven-session streak leaves you smouldering.':
    'Eine Serie von sieben Sessions lässt dich glimmen.',
  Lute: 'Laute',
  'A Virtuoso carries the song of every session on their back.':
    'Ein Virtuose trägt das Lied jeder Session auf dem Rücken.',
  'War banner': 'Kriegsbanner',
  'A hundred sessions: raise your banner.': 'Hundert Sessions: hiss dein Banner.',
  'Lightbringer halo': 'Lichtbringer-Heiligenschein',
  'A Lightbringer shines a little brighter than the rest.':
    'Ein Lichtbringer strahlt ein wenig heller als die anderen.',
  'Arcane aura': 'Arkane Aura',
  'Violet sparks that answer to an Ascendant.': 'Violette Funken, die einem Erhabenen gehorchen.',
  'Flame aura': 'Flammenaura',
  'Thirty sessions in a row: you are on fire.': 'Dreißig Sessions in Folge: du brennst.',
  'Blaze aura': 'Feuersbrunst-Aura',
  'Sixty sessions in a row. You are the fire now.':
    'Sechzig Sessions in Folge. Du bist jetzt das Feuer.',
  'Star-forged halo': 'Sternengeschmiedeter Heiligenschein',
  'Forged when you passed the Trial of a legendary skill.':
    'Geschmiedet, als du die Prüfung eines legendären Skills bestanden hast.',
  'Golden aura': 'Goldene Aura',
  'The light of a Legend.': 'Das Licht einer Legende.',

  // src/data/companion/weapons.ts
  'Wooden training sword': 'Hölzernes Übungsschwert',
  Longsword: 'Langschwert',
  Runeblade: 'Runenklinge',
  Longbow: 'Langbogen',
  'Leafsong bow': 'Blattgesang-Bogen',
  Quarterstaff: 'Kampfstab',
  'Ember-tipped staff': 'Glutspitzen-Stab',
  Greataxe: 'Großaxt',
  'Bone greataxe': 'Knochen-Großaxt',
  'Twin daggers': 'Zwillingsdolche',
  'Shadowfang daggers': 'Schattenzahn-Dolche',
  'Gnarled staff': 'Knorriger Stab',
  'Blossoming staff': 'Blühender Stab',
  Warhammer: 'Kriegshammer',
  'Sunforged hammer': 'Sonnengeschmiedeter Hammer',
  Katana: 'Katana',
  'Moonlit katana': 'Mondlicht-Katana',
  Mace: 'Streitkolben',
  'Golden mace': 'Goldener Streitkolben',
  'Gilded lute': 'Vergoldete Laute',
  'Holy mace': 'Heiliger Streitkolben',
  'Radiant mace': 'Strahlender Streitkolben',
  'Sword and shield': 'Schwert und Schild',
  'Gilded sword and shield': 'Vergoldetes Schwert und Schild',
  'Twin axes': 'Zwillingsäxte',
  'Blood axes': 'Blutäxte',
  Wand: 'Zauberstab',
  'Starlit wand': 'Sternenlicht-Zauberstab',

  // src/data/companion/looks.ts
  Fair: 'Hell',
  Porcelain: 'Porzellan',
  Tan: 'Gebräunt',
  Olive: 'Oliv',
  Brown: 'Braun',
  Deep: 'Dunkel',
  Black: 'Schwarz',
  Blond: 'Blond',
  Red: 'Rot',
  Chestnut: 'Kastanie',
  Silver: 'Silber',
  Azure: 'Azur',
  Crimson: 'Karmesin',
  Forest: 'Waldgrün',
  Royal: 'Königspurpur',
  Ember: 'Glut',
  Ash: 'Asche',

  // src/data/companion/body.ts
  Spiky: 'Stachelig',
  Long: 'Lang',
  Ponytail: 'Pferdeschwanz',
  Man: 'Mann',
  Woman: 'Frau',

  // src/domain/monsters.ts
  Imp: 'Teufelchen',
  Bat: 'Fledermaus',
  Skeleton: 'Skelett',
  Golem: 'Golem',
  Slime: 'Schleim',
  Goblin: 'Goblin',
  Wisp: 'Irrlicht',

  // src/domain/companion.ts
  'Fired up': 'Voller Energie',
  Rested: 'Ausgeruht',
  Restless: 'Unruhig',
  'Missing you': 'Vermisst dich',
  'Fired up after today’s training!': 'Voller Energie nach dem Training heute!',
  'Resting well. Rest days are part of training.':
    'Ruht sich gut aus. Ruhetage gehören zum Training.',
  'Ready for our first quest together.': 'Bereit für unsere erste gemeinsame Quest.',
  'Getting restless. Up for a session?': 'Wird unruhig. Lust auf eine Session?',
  'Misses training with you. One session cheers it up.':
    'Vermisst das Training mit dir. Eine Session muntert ihn auf.',

  // src/domain/rankLadder.ts
  Novice: 'Novize',
  Apprentice: 'Lehrling',
  Adept: 'Adept',
  Master: 'Meister',
  Legend: 'Legende',
  'Where every hero starts': 'Wo jeder Held anfängt',
  'Branch median {level}': 'Zweig-Median {level}',
  '{atLevel} of {total} branches at {level} or higher · {toGo} to go':
    '{atLevel} von {total} Zweigen auf {level} oder höher · noch {toGo}',

  // src/domain/characterView.ts
  push: 'Drücken',
  pull: 'Ziehen',
  core: 'Rumpf',
  legs: 'Beine',
  balance: 'Balance',
  mobility: 'Mobilität',
  'Branch median {median} · {rank} at {level}': 'Zweig-Median {median} · {rank} ab {level}',
  'Branch median {median} · the highest rank': 'Zweig-Median {median} · der höchste Rang',
  'Your best {stronger} skill ({strongerLevel}) is well ahead of your best {weaker} skill ({weakerLevel}). Unbalanced shoulders get hurt more often: give {weaker} work some extra attention. Workouts already favour it.':
    'Dein bester Skill im Bereich {stronger} ({strongerLevel}) ist deinem besten Skill im Bereich {weaker} ({weakerLevel}) weit voraus. Unausgeglichene Schultern verletzen sich öfter: gib {weaker} etwas mehr Aufmerksamkeit. Die Trainings bevorzugen es bereits.',
  'Trial: {name}': 'Prüfung: {name}',
  '{names} + {n} more': '{names} + {n} weitere',
  'Empty session': 'Leere Session',

  // src/components/character/challengeText.ts
  '{a} and {b}': '{a} und {b}',
  'Train in 1 session': 'In 1 Session trainieren',
  'Train in {n} sessions': 'In {n} Sessions trainieren',
  'Finish 1 session without skipping a set': '1 Session ohne ausgelassenen Satz abschließen',
  'Finish {n} sessions without skipping a set': '{n} Sessions ohne ausgelassenen Satz abschließen',
  '{attributes} work in 1 session': '{attributes} in 1 Session trainieren',
  '{attributes} work in {n} sessions': '{attributes} in {n} Sessions trainieren',
  '1 {attribute} exercise': '1 Übung für {attribute}',
  '{n} {attribute} exercises': '{n} Übungen für {attribute}',
  'Attempt 1 Trial': '1 Prüfung versuchen',
  'Attempt {n} Trials': '{n} Prüfungen versuchen',
  '{n} / 1 session': '{n} / 1 Session',
  '{n} / {target} sessions': '{n} / {target} Sessions',
  '{n} / 1 exercise': '{n} / 1 Übung',
  '{n} / {target} exercises': '{n} / {target} Übungen',
  '{n} / 1 Trial': '{n} / 1 Prüfung',
  '{n} / {target} Trials': '{n} / {target} Prüfungen',
  'Optional: missing it costs nothing. Straight-arm skill work (planche, levers) never counts.':
    'Optional: Verpassen kostet nichts. Streckarm-Skill-Arbeit (Planche, Lever) zählt nie.',

  // src/components/character/classText.ts
  'Every hero starts here': 'Hier beginnt jeder Held',
  '{n} sessions logged': '{n} Sessions geloggt',
  'Rank {rank}': 'Rang {rank}',
  '{current} / {target} sessions': '{current} / {target} Sessions',
  'You are {currentRank} · branch median {median} · {rank} at {level}':
    'Du bist {currentRank} · Zweig-Median {median} · {rank} ab {level}',

  // src/components/character/companionText.ts
  Head: 'Kopf',
  'Cloak & back': 'Umhang & Rücken',
  Body: 'Körper',
  'Hands & arms': 'Hände & Arme',
  'Aura & emblem': 'Aura & Emblem',
  'Character level {level}': 'Charakter-Level {level}',
  '{name} class, tier {tier}': 'Klasse {name}, Stufe {tier}',
  'A streak of {n} sessions': 'Eine Serie von {n} Sessions',
  'Pass your first Trial': 'Besteh deine erste Prüfung',
  'Pass {n} Trials': '{n} Prüfungen bestehen',
  'Pass the Trial of an elite (legendary) skill':
    'Die Prüfung eines Elite-Skills (legendär) bestehen',
  'Level {current} / {target}': 'Level {current} / {target}',
  '{rank} now': 'Jetzt {rank}',
  'Not unlocked yet': 'Noch nicht freigeschaltet',
  'Tier {tier} now': 'Jetzt Stufe {tier}',
  'Best streak {current} / {target}': 'Beste Serie {current} / {target}',
  '{current} / {target} Trials': '{current} / {target} Prüfungen',
  'Not yet': 'Noch nicht',

  // app/(tabs)/character.tsx
  MAX: 'MAX',
  '{into} / {total} XP': '{into} / {total} XP',
  Hero: 'Held',
  'Nameless hero': 'Namenloser Held',
  'Level {n}': 'Level {n}',
  'To level {n}': 'Bis Level {n}',
  '{xp} XP earned in total': 'Insgesamt {xp} XP verdient',
  Attributes: 'Attribute',
  'Train or pass a Trial to grow your attributes. The radar shows their balance.':
    'Trainiere oder besteh eine Prüfung, damit deine Attribute wachsen. Das Radar zeigt ihr Gleichgewicht.',
  'Push and pull out of balance': 'Drücken und Ziehen im Ungleichgewicht',
  Streak: 'Serie',
  Sessions: 'Sessions',
  Sets: 'Sätze',
  Trials: 'Prüfungen',
  Goals: 'Ziele',
  'No goals yet': 'Noch keine Ziele',
  'Pick up to five in the Tree.': 'Wähle bis zu fünf im Baum.',
  'Open the Tree': 'Baum öffnen',
  'Recent sessions': 'Letzte Sessions',
  'No sessions yet': 'Noch keine Sessions',
  'Your quest log starts with the first one.': 'Dein Questlog beginnt mit der ersten.',
  'Train now': 'Jetzt trainieren',

  // src/components/character/AttributeRadar.tsx
  'Attribute radar: {summary}': 'Attribut-Radar: {summary}',

  // src/components/character/ChallengeCard.tsx
  'Complete: +{xp} XP earned': 'Geschafft: +{xp} XP verdient',
  '+{xp} XP when done': '+{xp} XP bei Abschluss',
  'Weekly challenge of the {title}: {goal} this week':
    'Wochen-Challenge für {title}: diese Woche {goal}',
  '{n} completed in total': 'Insgesamt {n} geschafft',
  'Weekly challenge · {title}': 'Wochen-Challenge · {title}',
  '{goal} this week': 'Diese Woche: {goal}',
  COMPLETE: 'GESCHAFFT',
  'Challenge badges: {n}': 'Challenge-Abzeichen: {n}',
  'Fixed for this week. The {name} challenge starts on Monday.':
    'Für diese Woche festgelegt. Die Challenge der Klasse {name} beginnt am Montag.',
  'Your first session this week fixes the challenge for the week.':
    'Deine erste Session diese Woche legt die Challenge für die Woche fest.',

  // src/components/character/ChallengeProgressPanel.tsx
  'Complete! +{xp} XP': 'Geschafft! +{xp} XP',
  'Already complete this week': 'Diese Woche schon geschafft',
  '+{n} this session': '+{n} in dieser Session',
  'This session added nothing to it': 'Diese Session hat nichts dazu beigetragen',

  // src/components/character/ClassBanner.tsx
  'Starting class': 'Startklasse',
  '{name} · tier {tier} of {count}': '{name} · Stufe {tier} von {count}',
  NEW: 'NEU',
  'Class: {title}': 'Klasse: {title}',
  '1 new class tier': '1 neue Klassenstufe',
  '{n} new class tiers': '{n} neue Klassenstufen',
  'Shows every class, what each needs, and lets you pick the one to wear':
    'Zeigt jede Klasse, was sie braucht, und lässt dich die wählen, die du trägst',
  Class: 'Klasse',
  'See all classes': 'Alle Klassen ansehen',
  '{n} NEW': '{n} NEU',

  // src/components/character/ClassSheet.tsx
  Wearing: 'Getragen',
  Unlocked: 'Freigeschaltet',
  Locked: 'Gesperrt',
  'Highest tier reached': 'Höchste Stufe erreicht',
  'Unlock: {requirement}': 'Freischalten: {requirement}',
  'Next: {title} (tier {tier}) · {requirement}':
    'Als Nächstes: {title} (Stufe {tier}) · {requirement}',
  'Weekly challenge: {goal}': 'Wochen-Challenge: {goal}',
  '{n} tiers': '{n} Stufen',
  'Tier {tier} of {count}': 'Stufe {tier} von {count}',
  '{name} class': 'Klasse {name}',
  New: 'Neu',
  'Next tier, {title}: {requirement}': 'Nächste Stufe, {title}: {requirement}',
  'Wear {title}': '{title} tragen',
  Classes: 'Klassen',
  'Classes are titles your training earns. Each needs a fixed amount of attribute points (or sessions, or a rank) and grows over three tiers. They change only how your hero looks, and a class you have earned stays yours. Pick one to wear: it also offers an optional weekly challenge.':
    'Klassen sind Titel, die dein Training verdient. Jede braucht eine feste Zahl an Attributpunkten (oder Sessions oder einen Rang) und wächst über drei Stufen. Sie ändern nur, wie dein Held aussieht, und eine verdiente Klasse bleibt deine. Wähle eine, die du trägst: sie bietet auch eine optionale Wochen-Challenge.',

  // src/components/character/ClassUnlockPanel.tsx
  'Classes unlocked': 'Klassen freigeschaltet',
  'Class tiers reached': 'Klassenstufen erreicht',
  '{title}: {name} tier {tier}': '{title}: {name} Stufe {tier}',
  '{name} class unlocked': 'Klasse {name} freigeschaltet',
  '{name} · tier {tier}': '{name} · Stufe {tier}',

  // src/components/character/CompanionCard.tsx
  Companion: 'Begleiter',
  'Your companion, {mood}. {line}': 'Dein Begleiter, {mood}. {line}',
  'Your companion waves at you': 'Dein Begleiter winkt dir zu',
  Customize: 'Anpassen',

  // src/components/character/CompanionSheet.tsx
  Weapon: 'Waffe',
  'Comes with the class you wear. Wear another class to change it.':
    'Gehört zur Klasse, die du trägst. Trag eine andere Klasse, um sie zu wechseln.',
  'Training earns gear for your companion. What you earn stays yours.':
    'Training verdient Ausrüstung für deinen Begleiter. Was du verdienst, bleibt deins.',
  'Hair style': 'Frisur',
  Skin: 'Haut',
  Hair: 'Haare',
  Outfit: 'Outfit',

  // src/components/character/CompanionVictory.tsx
  'Victory!': 'Sieg!',
  'Your companion cheers for this session.': 'Dein Begleiter jubelt über diese Session.',

  // src/components/character/GoalProgressCard.tsx
  '{done} of {total} path skills proficient': '{done} von {total} Pfad-Skills beherrscht',
  'Goal {name}: {steps}': 'Ziel {name}: {steps}',
  '{name} path': 'Pfad zu {name}',
  'Next step: {name}': 'Nächster Schritt: {name}',
  'Next: {name}': 'Als Nächstes: {name}',
  'Goal reached': 'Ziel erreicht',
  'Pick the next goal': 'Nächstes Ziel wählen',

  // src/components/character/GoalReachedPanel.tsx
  'Your goals stay as they are. You can pick a new one in the Tree any time.':
    'Deine Ziele bleiben, wie sie sind. Du kannst jederzeit im Baum ein neues wählen.',
  'Goal reached: {name}': 'Ziel erreicht: {name}',
  '{name} is yours: its Trial is passed and its whole path is proficient.':
    '{name} gehört dir: die Prüfung ist bestanden und der ganze Pfad beherrscht.',
  'Next goal: {name}': 'Nächstes Ziel: {name}',

  // src/components/character/NextGoalPicker.tsx
  'That was the end of this path. Pick a new goal in the Tree whenever you like.':
    'Das war das Ende dieses Pfads. Wähle im Baum ein neues Ziel, wann immer du willst.',
  'Still needs {list}': 'Braucht noch {list}',
  OK: 'OK',
  'Jump to the next goal?': 'Zum nächsten Ziel springen?',
  'Jump to one of the next goals?': 'Zu einem der nächsten Ziele springen?',
  'Builds on {goal}. {needs}.': 'Baut auf {goal} auf. {needs}.',
  'Builds on {goal}. Open to train now.': 'Baut auf {goal} auf. Jetzt verfügbar zum Trainieren.',
  'Make it my goal': 'Zu meinem Ziel machen',
  'Keep my goals': 'Meine Ziele behalten',

  // src/components/character/NextGoalSheet.tsx
  'After {name}': 'Nach {name}',

  // src/components/character/RankCrest.tsx
  'Rank: {rank}': 'Rang: {rank}',
  Rank: 'Rang',
  'See all ranks': 'Alle Ränge ansehen',
  'Shows every rank and what the next ones need': 'Zeigt jeden Rang und was die nächsten brauchen',

  // src/components/character/RankLadderSheet.tsx
  Reached: 'Erreicht',
  'Your rank': 'Dein Rang',
  'Next rank': 'Nächster Rang',
  'Still below: {list}': 'Noch darunter: {list}',
  'Still below {level}, closest first': 'Noch unter {level}, die nächsten zuerst',
  'Rank ladder': 'Rangleiter',
  "Your rank is the median of your best Trial's tier in each of the {count} main branches (now {median}). {excluded} don't count. Reaching a rank's level in {n} branches always earns it.":
    'Dein Rang ist der Median der Stufe deiner besten Prüfung in jedem der {count} Hauptzweige (jetzt {median}). {excluded} zählen nicht. Erreichst du das Level eines Rangs in {n} Zweigen, hast du ihn sicher.',

  // src/components/character/SessionHistoryRow.tsx
  '1 set': '1 Satz',
  '{n} sets': '{n} Sätze',
  '1 Trial passed': '1 Prüfung bestanden',
  '{n} Trials passed': '{n} Prüfungen bestanden',
  '{date}: {title}, {sets}, {xp} XP': '{date}: {title}, {sets}, {xp} XP',
  'Opens the session summary': 'Öffnet die Zusammenfassung der Session',

  // src/components/character/TrinketUnlockPanel.tsx
  'Trinkets earned': 'Schmuckstücke verdient',
  'See it on your companion in the Character tab.': 'Sieh es an deinem Begleiter im Charakter-Tab.',

  // src/components/character/WardrobeSlot.tsx
  None: 'Nichts',
  '{slot}: nothing': '{slot}: nichts',
  '{slot}: {name}, new': '{slot}: {name}, neu',
  '{slot}: {n} locked': '{slot}: {n} gesperrt',
  'Hides them': 'Blendet sie aus',
  'Shows what earns them': 'Zeigt, womit du sie verdienst',
  'Locked ({n})': 'Gesperrt ({n})',
  Hide: 'Ausblenden',
  Show: 'Anzeigen',
  '{name}, locked. {rule}. {progress}': '{name}, gesperrt. {rule}. {progress}',
};
