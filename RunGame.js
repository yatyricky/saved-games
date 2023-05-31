const os = require("os")
const path = require("path")
const funcs = require("./funcs")

async function RunGame(options) {
    const homeDir = os.homedir()
    const installationDir = path.join(homeDir, options.installationDir)
    const cloudSaveDir = path.resolve(options.cloudSaveDir)
    const localSaveDir = path.join(homeDir, options.localSaveDir)

    console.log(`Cloud Save Dir: ${cloudSaveDir}`)
    console.log(`Local Save Dir: ${localSaveDir}`)

    console.log("Downloading data")
    await funcs.shell("git pull")

    console.log("Copy from cloud to local")
    funcs.copyDirectoryItemsIntoDirectory(cloudSaveDir, localSaveDir, options.rules)

    console.log("Start game")
    await funcs.shell(options.executable, {
        cwd: installationDir
    })

    console.log("Copy from local to cloud")
    funcs.copyDirectoryItemsIntoDirectory(localSaveDir, cloudSaveDir, options.rules)

    console.log("Upload data")
    let changedFiles = await funcs.shell("git diff --name-only")
    await funcs.shell("git add -A");
    await funcs.shell(`git commit --allow-empty -m "auto commit ${changedFiles.split("\n").filter(e => e.trim().length > 0).join(", ")}"`);
    await funcs.shell("git push");
}

module.exports = RunGame
