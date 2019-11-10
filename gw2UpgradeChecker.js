// alert("It works!")


// gw2api.authenticate('F8F1CE4C-FCE8-C64D-AD5B-EC5DAAD6420CEB195D1A-7771-468B-BD76-57B88CD4EA37')
gw2api.authenticate("D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253")
// gw2api.items().ids().then((items) => {
//     console.log(items)
// })
// gw2api.account().blob().then((info) => {
//     console.log(info)
// }) 


gw2api.account().bank().get().then((bank) => {
    // console.log(bank);

    let itemsToCheckRarity = new Set();
    let equipUpgrades = {};
    const ectoItemId = 19721;

    let itemIDtoDetailsDictionary = {};

    let itemsToCheckTP = [];

    itemsToCheckTP.push(ectoItemId);

    bank.forEach(item => {
        if (itemIsTradableWithUpgrades(item)) {
            itemsToCheckRarity.add(item.id);
            itemsToCheckRarity.add(item.upgrades[0]);
        };
    });

    gw2api.items().many(Array.from(itemsToCheckRarity)).then((itemDetails) => {
        // console.log(itemDetails);

        itemDetails.forEach(item => {
            if (!itemIsUpgradeComponent(item) && itemIsExotic(item)) {
                itemsToCheckTP.push(item.id);
                itemsToCheckTP.push(item.details.suffix_item_id);
                equipUpgrades[item.id] = item.details.suffix_item_id;
            };

            itemIDtoDetailsDictionary[item.id] = item;
        });

        return gw2api.commerce().prices().many(itemsToCheckTP)
            .then((priceInfo) => {
                return {
                    priceInfo,
                    itemIDtoDetailsDictionary,
                };
            });

    }).then(({ priceInfo, itemIDtoDetailsDictionary }) => {

        // console.log(priceInfo);  

        let priceInfoDictionary = {};

        priceInfo.forEach(priceInfoItem => {
            priceInfoDictionary[priceInfoItem.id] = priceInfoItem;
        });

        let priceCompareData = [];

        Object.keys(equipUpgrades).forEach(equipId => {
            let upgradeId = equipUpgrades[equipId];
            let newCompareData = {
                equip: itemIDtoDetailsDictionary[equipId],

                upgrade: itemIDtoDetailsDictionary[upgradeId],

                sellToTP: {
                    buyPrice: priceInfoDictionary[equipId].buys.unit_price,
                    sellPrice: priceInfoDictionary[equipId].sells.unit_price,
                },

                extractUpgradeThenSalvage: {
                    buyPrice: priceInfoDictionary[upgradeId].buys.unit_price + (priceInfoDictionary[ectoItemId].buys.unit_price * 1.2),
                    sellPrice: priceInfoDictionary[upgradeId].sells.unit_price + (priceInfoDictionary[ectoItemId].sells.unit_price * 1.2),
                },

                blackLionSalvage: {
                    buyPrice: priceInfoDictionary[upgradeId].buys.unit_price + (priceInfoDictionary[ectoItemId].buys.unit_price * 1.66),
                    sellPrice: priceInfoDictionary[upgradeId].sells.unit_price + (priceInfoDictionary[ectoItemId].sells.unit_price * 1.66),
                },
            };

            priceCompareData.push(newCompareData);
            console.log(newCompareData);
        });
        displayResultsToTable(priceCompareData)
    });

});



// itemsToCheck.add(item.upgrades[0]);


function itemIsTradableWithUpgrades(item) {
    return (item && !item.binding && item.upgrades);
}

function itemIsExotic(item) {
    return (item.rarity === "Exotic");
}

function itemIsUpgradeComponent(item) {
    return (item.type === "UpgradeComponent");
}










function displayResultsToTable(priceCompareData) {
    //     $("#resultsTbody").append($("<tr>", {html: "hello"}))
    //     $("<tr>", {html: "hello"})

    priceCompareData.forEach((resultRow) => {
        let newRow = $("<tr>");

        newRow.append($("<td>", { html: `<img src="${resultRow.equip.icon}"/> ${resultRow.equip.name} <br/> <img src="${resultRow.upgrade.icon}"/> ${resultRow.upgrade.name}` }))
        newRow.append($("<td>", { html: resultRow.sellToTP.buyPrice}))
        newRow.append($("<td>", { html: resultRow.extractUpgradeThenSalvage.buyPrice}))
        newRow.append($("<td>", { html: resultRow.blackLionSalvage.buyPrice}))

        $("#resultsTbody").append(newRow);
    });
};