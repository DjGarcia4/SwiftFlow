// Builds the "numbers" mode text on the fly: `count` space-separated number
// groups for practicing the number row / numpad. Most are plain integers;
// some take everyday formats (decimals, thousands, percentages, times) that
// exercise the symbols around numbers too. Those symbols are stripped when
// punctuation is off (see formatReferenceText), leaving only the digits.

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const pad2 = (n) => String(n).padStart(2, "0");

const FORMATS = [
  { weight: 55, build: () => String(randomInt(0, 10 ** randomInt(1, 4) - 1)) },
  { weight: 15, build: () => `${randomInt(0, 999)}.${randomInt(0, 99)}` },
  {
    weight: 10,
    build: () => `${randomInt(1, 99)},${String(randomInt(0, 999)).padStart(3, "0")}`,
  },
  { weight: 10, build: () => `${randomInt(1, 100)}%` },
  { weight: 10, build: () => `${randomInt(0, 23)}:${pad2(randomInt(0, 59))}` },
];

const TOTAL_WEIGHT = FORMATS.reduce((sum, f) => sum + f.weight, 0);

const randomNumberGroup = () => {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const format of FORMATS) {
    roll -= format.weight;
    if (roll < 0) return format.build();
  }
  return FORMATS[0].build();
};

export const generateRandomNumbers = (count) => {
  const result = [];
  let last = null;

  for (let i = 0; i < count; i++) {
    let group;
    do {
      group = randomNumberGroup();
    } while (group === last);

    result.push(group);
    last = group;
  }

  return result.join(" ");
};
