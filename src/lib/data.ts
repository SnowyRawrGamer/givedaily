export const QUOTES = [
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking and don't settle. Trust that the dots will connect down the road.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. Every setback is a setup for a greater comeback in the long journey ahead.",
  "In the middle of every difficulty lies opportunity. The pessimist sees difficulty in every opportunity; the optimist sees opportunity in every difficulty of life.",
  "The future belongs to those who believe in the beauty of their dreams. Do not wait for the perfect moment; take the moment and make it perfect through action.",
  "Life is what happens when you're busy making other plans. Cherish the small unexpected moments because they often become the memories you treasure the most later.",
  "Do not go where the path may lead, go instead where there is no path and leave a trail. Every trail begins with a single deliberate step forward into the unknown.",
  "The best way to predict the future is to create it. Ideas without execution are hallucinations; roll up your sleeves and turn the abstract into something tangible.",
];

export function randomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

export function randomMathProblem() {
  const a = 5 + Math.floor(Math.random() * 20);
  const b = 2 + Math.floor(Math.random() * 10);
  const c = 1 + Math.floor(Math.random() * 15);
  const d = 1 + Math.floor(Math.random() * 10);
  const expr = `(${a} * ${b}) + ${c} - ${d}`;
  // eslint-disable-next-line no-eval
  const answer = a * b + c - d;
  return { expr, answer };
}

export const COUNTRIES: { code: string; name: string; minAge: number }[] = [
  { code: "CA", name: "Canada", minAge: 18 },
  { code: "US", name: "United States", minAge: 18 },
  { code: "UK", name: "United Kingdom", minAge: 18 },
  { code: "AU", name: "Australia", minAge: 18 },
  { code: "OTHER", name: "Other", minAge: 18 },
];

export const REGIONS: Record<string, string[]> = {
  CA: ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK", "NT", "NU", "YT"],
  US: [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
  ],
  UK: ["England", "Scotland", "Wales", "Northern Ireland"],
  AU: ["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"],
  OTHER: ["N/A"],
};