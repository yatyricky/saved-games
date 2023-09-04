const RunGame = require("./RunGame")

RunGame({
    installationDir: "Games/World of Warcraft/_retail_",
    cloudSaveDir: "World_of_Warcraft/retail",
    localSaveDir: "Games/World of Warcraft/_retail_",
    executable: "Wow.exe",
    rules: {
        override: true,
        checkMTime: true,
        patterns: ["^(Interface\\/AddOns|WTF\\/Account).*(?<!\\.bak)$"]
    }
}).catch(reason => {
    console.log(reason)
})
