/* A small curated Czech corpus. Words/phrases are filtered at lesson-build time
 * to only those typeable with the keys learned so far. Lowercase; the engine
 * adds capitals only in capital-specific lessons.
 * NOTE: this is a starter corpus — expand for production. */

export const WORDS: string[] = [
  // very short / home-row-ish
  "ano", "lak", "had", "sad", "dal", "kal", "lad", "jak", "kde", "lak",
  "den", "led", "les", "sen", "ret", "set", "ten", "rek", "kel",
  "auto", "ruka", "noha", "voda", "doma", "máma", "táta", "kniha", "škola",
  "ahoj", "dobré", "ráno", "ahoj", "děti", "pták", "kočka", "pes", "myš",
  "stůl", "židle", "okno", "dveře", "klíč", "kolo", "město", "vesnice",
  "slunce", "obloha", "tráva", "strom", "list", "květ", "řeka", "hora",
  "ryba", "moře", "písek", "vítr", "déšť", "sníh", "mráz", "teplo",
  "chléb", "máslo", "sýr", "mléko", "voda", "čaj", "káva", "med",
  "ráno", "poledne", "večer", "noc", "týden", "měsíc", "rok", "čas",
  "ruka", "prst", "dlaň", "kniha", "pero", "papír", "sešit", "tužka",
  "slovo", "věta", "písmeno", "jazyk", "text", "kniha", "čtení", "psaní",
  "radost", "klid", "pohoda", "úsměv", "přítel", "rodina", "domov",
  "barva", "modrá", "zelená", "žlutá", "bílá", "černá", "hnědá",
  "jeden", "dva", "tři", "čtyři", "pět", "šest", "sedm", "osm", "devět", "deset",
  "krásný", "tichý", "malý", "velký", "rychlý", "pomalý", "nový", "starý",
  "učit", "psát", "číst", "myslet", "vědět", "umět", "znát", "chtít",
];

export const PHRASES: string[] = [
  "krok za krokem",
  "klid a pohoda",
  "učím se psát",
  "den za dnem",
  "ruce na klávesnici",
  "malé kroky vedou daleko",
  "každý den o kousek lépe",
  "dýchej a piš dál",
  "chyba je jen pokus znovu",
  "tvé tempo je správné tempo",
];

export const SENTENCES: string[] = [
  "Ráno svítí slunce nad tichou řekou.",
  "Učím se psát všemi deseti prsty.",
  "Každý den udělám malý krok dopředu.",
  "Kočka spí na teplém okně u zahrady.",
  "Klidně dýchej a piš svým vlastním tempem.",
  "Děti čtou knihu o velké modré velrybě.",
  "V lese voní tráva, listí a čerstvý déšť.",
  "Dobrá nálada se rodí z malých radostí.",
];

/** Words/phrases typeable using only the given character set (plus space). */
export function filterByChars(
  source: string[],
  allowed: Set<string>,
): string[] {
  return source.filter((w) =>
    [...w.toLowerCase()].every((c) => c === " " || allowed.has(c)),
  );
}
