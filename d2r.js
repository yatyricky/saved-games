const os = require("os")
const path = require("path")
const fs = require("fs")
const RunGame = require("./RunGame")

const options = {
    installationDir: "Games/Diablo II Resurrected",
    cloudSaveDir: "Diablo_II",
    localSaveDir: "Saved Games/Diablo II Resurrected",
    executable: "D2R.exe -mod lootfilter -txt",
    rules: {
        override: true,
        fileExts: [".d2s", ".d2i", ".d2x", ".dup"],
        directories: false,
        checkMTime: true,
    }
}

let home = os.homedir()
let DirD2RSaveLocal = path.join(home, options.localSaveDir)

let D2SDupper = path.join(DirD2RSaveLocal, "Dupper.d2s")
let DUPDupper = path.join(DirD2RSaveLocal, "Dupper.dup")

let D2SMigrate26 = path.join(DirD2RSaveLocal, "Bonec.d2s")
let DUPMigrate26 = path.join(DirD2RSaveLocal, "Bonec.dup")

async function main() {
    await RunGame(options)
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
