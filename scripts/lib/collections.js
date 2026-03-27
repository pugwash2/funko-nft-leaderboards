// scripts/lib/collections.js
// Years reflect latest drop/series, matching community convention (not creation date)
export const COLLECTIONS = {
  "2025": [
    { slug: "tcats.funko", name: "Thundercats" },
    { slug: "wca.funko", name: "WC Avengers" },
    { slug: "dnd.funko", name: "Dungeons & Dragons" },
    { slug: "fools.funko", name: "April Fools" },
    { slug: "ttgo.funko", name: "Teen Titans Go!" },
    { slug: "alegnd.funko", name: "Avatar Legends" },
    { slug: "tstory.funko", name: "Toy Story" },
    { slug: "love.funko", name: "Love" },
    { slug: "atime.funko", name: "Adventure Time" },
  ],
  "2024": [
    { slug: "fest.funko", name: "Festival of Fun" },
    { slug: "sunny.funko", name: "It's Always Sunny" },
    { slug: "batman.funko", name: "Batman 85th" },
    { slug: "beetle.funko", name: "Beetlejuice" },
    { slug: "spooky.funko", name: "Funkoween" },
    { slug: "strngr.funko", name: "Stranger Things" },
    { slug: "gijoe.funko", name: "G.I. Joe" },
    { slug: "alien.funko", name: "Alien" },
    { slug: "cn.funko", name: "Cartoon Network" },
    { slug: "tmnt.funko", name: "TMNT" },
    { slug: "ram.funko", name: "Rick and Morty" },
    { slug: "umnstr.funko", name: "Universal Monsters" },
    { slug: "daria.funko", name: "Daria" },
    { slug: "tda.funko", name: "Disney Afternoon" },
    { slug: "scooby.funko", name: "Scooby-Doo" },
    { slug: "funime.funko", name: "Funime & Cosplay" },
    { slug: "wbh.funko", name: "WB Horror" },
    { slug: "mlpony.funko", name: "My Little Pony" },
    { slug: "strwrs.funko", name: "Star Wars" },
    { slug: "tng.funko", name: "Star Trek TNG" },
    { slug: "tformr.funko", name: "Transformers" },
    { slug: "sjam.funko", name: "Space Jam" },
    { slug: "plastk.funko", name: "Fantastik Plastik" },
    { slug: "potter.funko", name: "Harry Potter" },
    { slug: "squid.funko", name: "Squid Game" },
  ],
  "2023": [
    { slug: "mickey.funko", name: "Mickey & Friends" },
    { slug: "ppg.funko", name: "Powerpuff Girls" },
    { slug: "bttf.funko", name: "Back to the Future" },
    { slug: "wb1oo.funko", name: "WB 100th Anniversary" },
    { slug: "jpark.funko", name: "Jurassic Park" },
    { slug: "steven.funko", name: "Steven Universe" },
    { slug: "pr.funko", name: "Power Rangers" },
    { slug: "it.funko", name: "IT" },
    { slug: "knight.funko", name: "Dark Knight Trilogy" },
    { slug: "flint.funko", name: "Flintstones" },
    { slug: "hb.funko", name: "Hanna-Barbera" },
    { slug: "hotd.funko", name: "House of the Dragon" },
    { slug: "ntoons.funko", name: "Nicktoons" },
    { slug: "krofft.funko", name: "Krofft Pictures" },
    { slug: "fan.funko", name: "Fan Rewards" },
  ],
  "2022": [
    { slug: "rtoys.funko", name: "Retro Toys" },
    { slug: "elf.funko", name: "Elf" },
    { slug: "matrix.funko", name: "The Matrix" },
    { slug: "freddy.funko", name: "Funko Halloween" },
    { slug: "got.funko", name: "Game of Thrones" },
    { slug: "looney.funko", name: "Looney Tunes" },
    { slug: "dc.funko", name: "DC Comics" },
    { slug: "jasb.funko", name: "Jay and Silent Bob" },
    { slug: "kllggs.funko", name: "Kellogg's" },
    { slug: "rcomic.funko", name: "Retro Comics" },
    { slug: "invday.funko", name: "Investor Day" },
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
    { slug: "sdance.funko", name: "Space Dancer" },
    { slug: "bonus.funko", name: "Bonus" },
    { slug: "social.funko", name: "Social Media Freddy" },
    { slug: "funko", name: "Digital Pop Promo" },
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
