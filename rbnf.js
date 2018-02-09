format = (n, locale, ruleSetName, rulesetGrouping) => {  
    let globalize = Globalize(locale);
    let rsg;
    if (locale === "root"){
        rsg = globalize.cldr.get("rbnf/root/rbnf/" + rulesetGrouping);
    } else {
        rsg = globalize.cldr.get("rbnf/{bundle}/rbnf/" + rulesetGrouping);
    }
    return innerFormat(n, ruleSetName, globalize, rsg);
}

innerFormat = (n, ruleSetName, globalize, rulesetGrouping) => {
    let ruleSet = new Map(rulesetGrouping[ruleSetName].map(s => {
        arr = s.replace(/;$/, "").replace(/:\s*'?/, ":").split(":")
        result = arr.splice(0,1);
        result.push(arr.join(":"));
        return result;
    }));
    let output = "";
    let ruleDes;
    if (isNaN(n)) { 
        ruleDes = "NaN";
    } else if (n === Infinity) {
        ruleDes = "Inf";
    } else if (n < 0) {
        ruleDes = "-x";
    } else if (!Number.isInteger(n)) {
        ruleDes = n < 1 ? "0.x" : "x.x";
    } 
    let rule = ruleSet.get(ruleDes);
    if (ruleDes === "0.x" && !rule) {rule = ruleSet.get("x.x")}
    if (rule) {
        output = rule;
        if (ruleDes === "-x") {
            absOutput = innerFormat(Math.abs(n), ruleSetName, globalize, rulesetGrouping);
            output = output.replace(/>>/g, absOutput);
        } else if (ruleDes === "x.x" || ruleDes === "0.x") {
            output = (n < 1) ? output.replace(/\[.*?\]/g, "") : output.replace(/[\[\]]/g, "");
            let [i, d] = n.toString().split(".");
            output = output.replace(/<(.*?)</g, (_, p1) => (
                innerFormat(parseInt(i), p1 || ruleSetName, globalize, rulesetGrouping)
            ));   
            output = output.replace(/>>?>/, m => (
                d.split("").map(n => innerFormat(parseInt(n), ruleSetName, globalize, rulesetGrouping)).join((m === ">>>") ? "" : " ")
            ));
        }
    } else {
        let bv, rad, rule;
        let ruleNum = -1;
        for ([name, currRule] of ruleSet) {
            let s = name.split("/");
            if (Number(s[0]) > n) {
                break;
            } else {
                rule = currRule;
                bv = Number(s[0]);
                rad = Number(s[1]) || 10;
                ruleNum++;
            }
        }
        output = rule;
        let divisor = rad;
        while ((divisor * rad) <= bv) {
            divisor *= rad;
        }
        let q = ~~(n/divisor);
        let r = n % divisor;
        output = (r === 0) ? output.replace(/\[.*?\]/g, "") : output.replace(/[\[\]]/g, "");
        // TODO: fix this!
        // while (/>>>/.test(output)) { 
        //     let prevRule = Array.from(ruleSet.entries())[ruleNum - 1][1]
        //     output = output.replace(/>>>/g, prevRule);
        //     ruleNum--;
        // }
        output = output.replace(/<(.*?)</g, (_, p1) => (
            innerFormat(q, p1 || ruleSetName, globalize, rulesetGrouping)
        ));
        output = output.replace(/>(.*?)>/g, (_, p1) => (
            innerFormat(r, p1 || ruleSetName, globalize, rulesetGrouping)
        ));
        output = output.replace(/\$\(((?:ca|o)rdinal),(.+?)\)\$/g, (_, type, pRules) => {
            let pMap = new Map(pRules.match(/.+?\{.+?\}/g).map(r => r.match(/(.+)\{(.+)\}/).slice(1,3)));
            let plural = globalize.plural(q, {type});
            return pMap.get(plural) || pMap.get("other");
        })
    }
    output = output.replace(/=(.*?)=/g, (_, p1) => {
        if (p1.startsWith("#") || p1.startsWith("0")) {
            return globalize.formatNumber(n, {raw: p1});
        } else {
            return innerFormat(n, p1 || ruleSetName, globalize, rulesetGrouping);
        }
    });
    return output;
}
