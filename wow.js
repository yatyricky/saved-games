const RunGame = require("./RunGame")

let command = process.argv.slice(2)[0]

let stage = -1

if (command === "pull") {
    stage = 1
} else if (command === "push") {
    stage = 2
}

RunGame({
    installationDir: "Games/World of Warcraft/_retail_",
    cloudSaveDir: "World_of_Warcraft/retail",
    localSaveDir: "Games/World of Warcraft/_retail_",
    executable: "Wow.exe",
    rules: {
        override: true,
        checkMTime: true,
        patterns: ["^(Interface\\/AddOns|WTF\\/Account).*(?<!\\.bak)(?<!SavedVariables\\/TradeSkillMaster\\.lua)(?<!TradeSkillMaster_AppHelper\\/AppData\\.lua)$"]
    },
    stage: stage,
    game: "wow",
}).catch(reason => {
    console.log(reason)
})
