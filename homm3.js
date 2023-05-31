const RunGame = require("./RunGame")

RunGame({
    installationDir: "Games/HoMM 3 Complete",
    cloudSaveDir: "Heroes_of_Might_and_Magic_3",
    localSaveDir: "Games/HoMM 3 Complete/Games",
    executable: "HD_Launcher.exe",
    rules: {
        override: true,
        fileExts: [".gm1", ".cgm"],
        directories: false,
        checkMTime: true,
    }
}).catch(reason => {
    console.log(reason)
})
