const RunGame = require("./RunGame")

RunGame({
    installationDir: "Games/turtle-wow",
    cloudSaveDir: "World_of_Warcraft/turtle",
    localSaveDir: "Games/turtle-wow",
    executable: "WoW.exe",
    rules: {
        override: true,
        checkMTime: true,
        patterns: ["^(Interface\\/AddOns|WTF\\/Account).*(?<!\\.bak)$"]
    }
}).catch(reason => {
    console.log(reason)
})
