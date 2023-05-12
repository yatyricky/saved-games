let child_process = require("child_process")
let os = require("os")
let path = require("path")
let funcs = require("./funcs")

let home = os.homedir()
let DirD2R = path.join(home, "Games/Diablo II Resurrected")
let DirD2RSaveCloud = path.resolve("Diablo_II")
let DirD2RSaveLocal = path.join(home, "Saved Games/Diablo II Resurrected")

console.log(DirD2RSaveCloud);
console.log(DirD2RSaveLocal);

let DiskOptions = {
    override: true,
    fileExts: [".d2s", ".d2x", ".dup"],
    directories: false,
}

async function main() {
    console.log("Downloading data")
    await funcs.shell("git pull")

    console.log("Copy from cloud to local")
    funcs.copyDirectoryItemsIntoDirectory(DirD2RSaveCloud, DirD2RSaveLocal, DiskOptions)

    console.log("Start game")
    await funcs.shell(`D2R.exe -mod lootfilter -txt`, {
        cwd: DirD2R
    })

    console.log("Copy from local to cloud")
    funcs.copyDirectoryItemsIntoDirectory(DirD2RSaveLocal, DirD2RSaveCloud, DiskOptions)

    console.log("Upload data")
    let changedFiles = await funcs.shell("git diff --name-only")
    await funcs.shell("git add -A");
    await funcs.shell(`git commit --allow-empty -m "auto commit ${changedFiles.split("\n").filter(e => e.trim().length > 0).join(", ")}"`);
    await funcs.shell("git push");
}

main().catch(reason => {
    console.log(reason)
})
