let cldrFiles = [
    "cldr/cldr-core/supplemental/likelySubtags.json",
    "cldr/cldr-core/supplemental/numberingSystems.json",
    "cldr/cldr-core/supplemental/plurals.json",
    "cldr/cldr-core/supplemental/ordinals.json",
    "cldr/cldr-rbnf/rbnf/root.json",
];

cldrFiles.forEach(f => {
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

show = (n, locale) => {
    let output = format(Number(n), locale, "%spellout-numbering-year", "SpelloutRules");
    document.getElementById("output").innerHTML = output;
}

let loadedLocales = new Set();
parseNum = n => {
    let locale = document.getElementById("locale").value;
    if (!loadedLocales.has(locale)) {
        rbnf = fetch("cldr/cldr-rbnf/rbnf/" + locale + ".json").then(f => f.json()).then(j => Globalize.load(j))
        num = fetch("cldr/cldr-numbers-full/main/" + locale + "/numbers.json").then(f => f.json()).then(j => Globalize.load(j))
        Promise.all([rbnf.num]).then(() => {
            show(n, locale);
            loadedLocales.add(locale);    
        })
    } else {
        show(n, locale);
    }
    
}