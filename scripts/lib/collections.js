// scripts/lib/collections.js
export const COLLECTIONS = {
  "2025": [
    { slug: "dnd.funko", name: "Dungeons & Dragons" },
    { slug: "fools.funko", name: "April Fools" },
    { slug: "ttgo.funko", name: "Teen Titans Go!" },
    { slug: "alegnd.funko", name: "A Legend" },
    { slug: "tstory.funko", name: "Toy Story" },
    { slug: "love.funko", name: "Love" },
    { slug: "atime.funko", name: "Adventure Time" },
  ],
  "2024": [
    { slug: "fest.funko", name: "Funko Fest" },
    { slug: "sunny.funko", name: "It's Always Sunny" },
    { slug: "batman.funko", name: "Batman" },
    { slug: "beetle.funko", name: "Beetlejuice" },
    { slug: "spooky.funko", name: "Spooky" },
    { slug: "strngr.funko", name: "Stranger Things" },
    { slug: "gijoe.funko", name: "G.I. Joe" },
    { slug: "alien.funko", name: "Alien" },
    { slug: "cn.funko", name: "Cartoon Network" },
    { slug: "tmnt.funko", name: "TMNT" },
    { slug: "ram.funko", name: "Rick and Morty" },
    { slug: "umnstr.funko", name: "Universal Monsters" },
    { slug: "daria.funko", name: "Daria" },
    { slug: "tda.funko", name: "TDA" },
    { slug: "scooby.funko", name: "Scooby-Doo" },
    { slug: "funime.funko", name: "Funime" },
    { slug: "wbh.funko", name: "WB Horror" },
    { slug: "mlpony.funko", name: "My Little Pony" },
    { slug: "strwrs.funko", name: "Star Wars" },
    { slug: "tng.funko", name: "Star Trek TNG" },
    { slug: "tformr.funko", name: "Transformers" },
    { slug: "sjam.funko", name: "Space Jam" },
    { slug: "plastk.funko", name: "Plastik" },
    { slug: "potter.funko", name: "Harry Potter" },
    { slug: "squid.funko", name: "Squid Game" },
  ],
  "2023": [
    { slug: "mickey.funko", name: "Mickey Mouse" },
    { slug: "ppg.funko", name: "Powerpuff Girls" },
    { slug: "bttf.funko", name: "Back to the Future" },
    { slug: "wb1oo.funko", name: "WB 100" },
    { slug: "jpark.funko", name: "Jurassic Park" },
    { slug: "steven.funko", name: "Steven Universe" },
    { slug: "pr.funko", name: "Power Rangers" },
    { slug: "it.funko", name: "IT" },
    { slug: "knight.funko", name: "Knight" },
    { slug: "flint.funko", name: "Flintstones" },
    { slug: "hb.funko", name: "Hanna-Barbera" },
    { slug: "hotd.funko", name: "House of the Dragon" },
    { slug: "ntoons.funko", name: "Nicktoons" },
    { slug: "krofft.funko", name: "Krofft" },
  ],
  "2022": [
    { slug: "rtoys.funko", name: "Retro Toys" },
    { slug: "elf.funko", name: "Elf" },
    { slug: "matrix.funko", name: "The Matrix" },
    { slug: "freddy.funko", name: "Freddy Funko" },
    { slug: "got.funko", name: "Game of Thrones" },
    { slug: "looney.funko", name: "Looney Tunes" },
    { slug: "dc.funko", name: "DC Comics" },
    { slug: "jasb.funko", name: "Jay and Silent Bob" },
    { slug: "kllggs.funko", name: "Kellogg's" },
    { slug: "rcomic.funko", name: "Retro Comics" },
  ],
  "2021": [
    { slug: "bobrss.funko", name: "Bob Ross" },
    { slug: "sttrek.funko", name: "Star Trek" },
    { slug: "maiden.funko", name: "Iron Maiden" },
    { slug: "bigboy.funko", name: "Big Boy" },
  ],
  "other": [
    { slug: "fright.funko", name: "Fright Night" },
    { slug: "funday.funko", name: "Funday" },
    { slug: "sdance.funko", name: "School Dance" },
    { slug: "bonus.funko", name: "Bonus" },
    { slug: "social.funko", name: "Social" },
    { slug: "funko", name: "Funko" },
  ],
  "dpk": [
    { slug: "hallos1.dpk", name: "DPK Halloween S1" },
    { slug: "besbol1.dpk", name: "DPK Baseball S1" },
    { slug: "promotn.dpk", name: "DPK Promotions" },
  ],
};

export const ALL_COLLECTIONS = Object.values(COLLECTIONS).flat();

// Build slug -> year lookup
export const SLUG_TO_YEAR = {};
for (const [year, cols] of Object.entries(COLLECTIONS)) {
  for (const col of cols) SLUG_TO_YEAR[col.slug] = year;
}

export function getCollectionsByYear(year) {
  return COLLECTIONS[year] || [];
}

export function getCollectionBySlug(slug) {
  return ALL_COLLECTIONS.find(c => c.slug === slug);
}
