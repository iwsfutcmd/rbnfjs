let cldr_files = [
    "cldr/cldr-core/supplemental/likelySubtags.json",
    "cldr/cldr-numbers-full/main/en/numbers.json",
    "cldr/cldr-numbers-full/main/ar/numbers.json",
    "cldr/cldr-numbers-full/main/fr/numbers.json",
    "cldr/cldr-numbers-full/main/ak/numbers.json",
    "cldr/cldr-numbers-full/main/ar-MA/numbers.json",
    "cldr/cldr-numbers-full/main/ru/numbers.json",
    "cldr/cldr-numbers-full/main/th/numbers.json",
    "cldr/cldr-core/supplemental/numberingSystems.json",
    "cldr/cldr-core/supplemental/plurals.json",
    "cldr/cldr-core/supplemental/ordinals.json",
    "cldr/cldr-rbnf/rbnf/en.json",
    "cldr/cldr-rbnf/rbnf/ar.json",
    "cldr/cldr-rbnf/rbnf/fr.json",
    "cldr/cldr-rbnf/rbnf/ak.json",
    "cldr/cldr-rbnf/rbnf/ru.json",
    "cldr/cldr-rbnf/rbnf/root.json",
]

cldr_files.forEach(f => {
    fetch(f).then(r => r.json()).then(r => Globalize.load(r))
})

let p = fetch("cldr/cldr-core/supplemental/numberingSystems.json").then(r => (
    r.json().then(r => numSys = r)
))

let digits;
p.then(() => {
    digits = numSys.supplemental.numberingSystems.cham._digits;
    for (i = 1; i < 10; i++) {
        e = document.getElementById('c' + i);
        e.textContent = [...digits][i];
    }
        
})
