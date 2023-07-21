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

    let changedFiles = await funcs.shell("git status --porcelain")
    let changedFilesList = changedFiles.split("\n").filter(e => e.trim().length > 0)
    if (changedFilesList.length > 0) {
        console.log("Uploading data")
        await funcs.shell("git add -A")
        await funcs.shell(`git commit --allow-empty -m "auto commit"`)
        await funcs.shell("git push")
        console.log("Uploaded data")
    } else {
        console.log("Nothing to upload")
    }
}

module.exports = RunGame
