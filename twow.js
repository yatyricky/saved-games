const RunGame = require("./RunGame")

RunGame({
    installationDir: "Games/turtle-wow",
    cloudSaveDir: "Turtle_WoW",
    localSaveDir: "Games/turtle-wow",
    executable: "WoW.exe",
    rules: {
        override: true,
        checkMTime: true,
        fileExts: ["Interface/AddOns", "WTF/Account"]
    }
}).catch(reason => {
    console.log(reason)
})
