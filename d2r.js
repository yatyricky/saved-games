let os = require("os")
let path = require("path")
let fs = require("fs")
let funcs = require("./funcs")

let home = os.homedir()
let DirD2R = path.join(home, "Games/Diablo II Resurrected")
let DirD2RSaveCloud = path.resolve("Diablo_II")
let DirD2RSaveLocal = path.join(home, "Saved Games/Diablo II Resurrected")

let D2SDupper = path.join(DirD2RSaveLocal, "Dupper.d2s")
let DUPDupper = path.join(DirD2RSaveLocal, "Dupper.dup")

let D2SMigrate26 = path.join(DirD2RSaveLocal, "Bonec.d2s")
let DUPMigrate26 = path.join(DirD2RSaveLocal, "Bonec.dup")

console.log(DirD2RSaveCloud);
console.log(DirD2RSaveLocal);

let DiskOptions = {
    override: true,
    fileExts: [".d2s", ".d2i", ".d2x", ".dup"],
    directories: false,
    checkMTime: true,
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

async function makeDup() {
    fs.copyFileSync(D2SDupper, DUPDupper)
}

async function doDup() {
    fs.copyFileSync(DUPDupper, D2SDupper)
}

/**
 * 安装有4个版本的GoMule
 * +------------------------------------+----------------+---------------------+
 * | GoMule                             | Diablo II      | Nothing left        |
 * +------------------------------------+----------------+---------------------+
 * | GoMuleR4.4.14-BETA_Resurrected_1.0 | before D2R 2.6 | Still using v62.d2x |
 * +------------------------------------+----------------+---------------------+
 * | GoMuleR4.4.17-BETA_Resurrected_2.6 | D2R 2.6/2.7    | All active saves    |
 * | GoMuleR4.4.18-BETA_Resurrected_2.7 |                |                     |
 * +------------------------------------+----------------+---------------------+
 * 
 * 1. cp Bonec.dup Bonec.d2s
 * 2. gomule_old stash_old to Bonec.d2s
 * 3. launch Bonec.d2s
 * 4. gomule_new Bonec.d2s stash_new
 */
async function migrate26() {
    console.log("1. cp Bonec.dup Bonec.d2s");
    fs.copyFileSync(DUPMigrate26, D2SMigrate26)
    console.log("2. gomule_1.0 v62.d2x -> Bonec.d2s");
    console.log("3. launch Bonec.d2s, transfer stuff to shared stash");
}

let command = process.argv.slice(2)[0]
let routine

if (command === "make_dup") {
    routine = makeDup
} else if (command === "do_dup") {
    routine = doDup
} else if (command === "migrate26") {
    routine = migrate26
} else {
    routine = main
}

routine().catch(reason => {
    console.log(reason)
})
