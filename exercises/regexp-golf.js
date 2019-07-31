"use strict";

function carOrCat(str) {
  return /ca[rt]/.test(str);
}

function popOrProp(str) {
  return /pr?op/.test(str);
}

function ferretFerryOrFerrari(str) {
  return /ferr(et|y|ari)/.test(str);
}

function endsInIous(str) {
  return /\w+ious/.test(str);
}

function whitespaceThenPunctuation(str) {
  return /\s[.,:;]/.test(str);
}

function longerThanSixLetters(str) {
  return /\w{6}\w+/.test(str);
}

function withoutE(str) {
  return /\b([A-D]|[F-d]|[f-z])+\b/.test(str);
}

function test() {
  let testCases = [
    {
      test: carOrCat,
      matches: ["car", "cat"],
      mismatches: ["cop", "cantrip", "call"]
    },
    {
      test: popOrProp,
      matches: ["pop", "prop"],
      mismatches: ["plop", "pod", "Prop"]
    },
    {
      test: ferretFerryOrFerrari,
      matches: ["ferret", "ferry", "ferrari"],
      mismatches: ["ferrous", "ferocious"]
    },
    {
      test: endsInIous,
      matches: ["luxurious", "religious", "rebellious", "furious"],
      mismatches: ["double", "wrong", "excitable", "ious"]
    },
    {
      test: whitespaceThenPunctuation,
      matches: ["\n.", "\n,", "\n:", "\n;", " ."],
      mismatches: ["a.", "e,", ":", ";"]
    },
    {
      test: longerThanSixLetters,
      matches: ["alphabet", "robbery", "clementine", "quixotic"],
      mismatches: ["cat", "dog", "pilots", "chimed"]
    },
    {
      test: withoutE,
      matches: ["anthrax", "Patriotic", "playful", "turn"],
      mismatches: ["excitable", "laughed", "Entropy", "Enthalpy"]
    }
  ];

  let results = {passes: [], fails: []};

  testCases.forEach(t => {
    t.matches.forEach(m => {
      if (t.test(m)) results.passes.push(`${t.test.name} matched ${m}`);
      else results.fails.push(`${t.test.name} did not match ${m}`);
    });
    t.mismatches.forEach(m => {
      if (t.test(m)) results.fails.push(`${t.test.name} matched ${m}`);
      else results.passes.push(`${t.test.name} did not match ${m}`);
    });
  });

  results.passes.forEach(p => console.log(`PASSED: ${p}`));
  results.fails.forEach(p => console.log(`FAILED: ${p}`));
}

test();
