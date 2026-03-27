// scripts/lib/collections.js
// Years reflect latest drop/series, matching community convention
// Collections with multiple series are split into separate entries
// schema: filters API calls to only that schema's templates/assets

export const COLLECTIONS = {
  "2025": [
    { slug: "tcats.funko", name: "Thundercats" },
    { slug: "wca.funko", name: "WC Avengers" },
    { slug: "dnd.funko", name: "Dungeons & Dragons S2", schema: "series2.drop", baseSlug: "dnd.funko" },
    { slug: "fools.funko", name: "April Fools S3", schema: "series3.drop", baseSlug: "fools.funko" },
    { slug: "ttgo.funko", name: "Teen Titans Go! S2", schema: "series2.drop", baseSlug: "ttgo.funko" },
    { slug: "alegnd.funko", name: "Avatar Legends S2", schema: "series2.drop", baseSlug: "alegnd.funko" },
    { slug: "tstory.funko", name: "Toy Story" },
    { slug: "love.funko", name: "Love" },
    { slug: "atime.funko", name: "Adventure Time S2", schema: "series2.drop", baseSlug: "atime.funko" },
  ],
  "2024": [
    { slug: "fest.funko", name: "Festival of Fun" },
    { slug: "sunny.funko", name: "It's Always Sunny" },
    { slug: "batman.funko", name: "Batman 85th" },
    { slug: "beetle.funko", name: "Beetlejuice" },
    { slug: "spooky.funko", name: "Funkoween S2", schema: "series2.drop", baseSlug: "spooky.funko" },
    { slug: "strngr.funko", name: "Stranger Things S2", schema: "series2.drop", baseSlug: "strngr.funko" },
    { slug: "gijoe.funko", name: "G.I. Joe" },
    { slug: "alien.funko", name: "Alien" },
    { slug: "cn.funko", name: "Cartoon Network" },
    { slug: "tmnt.funko", name: "TMNT S2", schema: "series2.drop", baseSlug: "tmnt.funko" },
    { slug: "ram.funko", name: "Rick and Morty" },
    { slug: "umnstr.funko", name: "Universal Monsters" },
    { slug: "daria.funko", name: "Daria" },
    { slug: "tda.funko", name: "Disney Afternoon" },
    { slug: "scooby.funko", name: "Scooby-Doo S2", schema: "series2.drop", baseSlug: "scooby.funko" },
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
    { slug: "dc.funko", name: "DC Comics S2", schema: "series2.drop", baseSlug: "dc.funko" },
    { slug: "fools.funko", name: "April Fools S2", schema: "series2.drop", baseSlug: "fools.funko" },
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
    { slug: "spooky.funko", name: "Funkoween S1", schema: "series1.drop", baseSlug: "spooky.funko" },
    { slug: "strngr.funko", name: "Stranger Things S1", schema: "series1.drop", baseSlug: "strngr.funko" },
    { slug: "dnd.funko", name: "Dungeons & Dragons S1", schema: "series1.drop", baseSlug: "dnd.funko" },
    { slug: "fools.funko", name: "April Fools S1", schema: "series1.drop", baseSlug: "fools.funko" },
    { slug: "ttgo.funko", name: "Teen Titans Go! S1", schema: "series1.drop", baseSlug: "ttgo.funko" },
    { slug: "atime.funko", name: "Adventure Time S1", schema: "series1.drop", baseSlug: "atime.funko" },
    { slug: "dc.funko", name: "DC Comics Comic Drop", schema: "comic.drop", baseSlug: "dc.funko" },
  ],
  "2022": [
    { slug: "rtoys.funko", name: "Retro Toys" },
    { slug: "elf.funko", name: "Elf" },
    { slug: "matrix.funko", name: "The Matrix" },
    { slug: "freddy.funko", name: "Funko Halloween" },
    { slug: "got.funko", name: "Game of Thrones" },
    { slug: "looney.funko", name: "Looney Tunes" },
    { slug: "dc.funko", name: "DC Comics S1", schema: "series1.drop", baseSlug: "dc.funko" },
    { slug: "jasb.funko", name: "Jay and Silent Bob" },
    { slug: "kllggs.funko", name: "Kellogg's" },
    { slug: "rcomic.funko", name: "Retro Comics" },
    { slug: "invday.funko", name: "Investor Day" },
    { slug: "scooby.funko", name: "Scooby-Doo S1", schema: "series1.drop", baseSlug: "scooby.funko" },
    { slug: "alegnd.funko", name: "Avatar Legends S1", schema: "series1.drop", baseSlug: "alegnd.funko" },
  ],
  "2021": [
    { slug: "bobrss.funko", name: "Bob Ross" },
    { slug: "sttrek.funko", name: "Star Trek" },
    { slug: "maiden.funko", name: "Iron Maiden" },
    { slug: "bigboy.funko", name: "Big Boy" },
    { slug: "tmnt.funko", name: "TMNT S1", schema: "series1.drop", baseSlug: "tmnt.funko" },
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

// Build a unique key for each entry (slug + schema for splits)
export function collectionKey(col) {
  return col.schema ? `${col.slug}--${col.schema}` : col.slug;
}

// Build slug -> year lookup (uses key for splits)
export const SLUG_TO_YEAR = {};
for (const [year, cols] of Object.entries(COLLECTIONS)) {
  for (const col of cols) SLUG_TO_YEAR[collectionKey(col)] = year;
}

export function getCollectionsByYear(year) {
  return COLLECTIONS[year] || [];
}

export function getCollectionBySlug(slug) {
  return ALL_COLLECTIONS.find(c => c.slug === slug && !c.schema);
}
