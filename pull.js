const funcs = require("./funcs");
const fs = require("fs");
const path = require("path");
const child = require("child_process");

child.execSync("git pull");

const fpConfig = path.join("config.json");
let config = {};
let writeConfig = false;

/**
 * @returns {boolean}
 */
function wowAddOns() {
    const dpAddOns = path.join(config.wow_root, "_classic_", "Interface", "AddOns");
    const dpAddOnsCloud = path.join(__dirname, "World of Warcraft", "classic", "AddOns");
    funcs.deleteFolderFilesRecursiveSync(dpAddOns);
    if (fs.existsSync(dpAddOns) && fs.statSync(dpAddOns).isDirectory()) {
        funcs.copyFolderFilesRecursiveSync(dpAddOnsCloud, dpAddOns);
        console.log("[success] pull wow addons");
        return true;
    } else {
        console.warn(dpAddOns + " is not directory");
        return false;
    }
}

/**
 * @returns {boolean}
 */
function wowAccLua() {
    const dpAccLua = path.join(config.wow_root, "_classic_", "WTF", "Account", "YATYRICKY", "SavedVariables");
    const dpAccLuaCloud = path.join(__dirname, "World of Warcraft", "classic", "YATYRICKY", "SavedVariables");
    funcs.deleteFolderFilesRecursiveSync(dpAccLua);
    if (fs.existsSync(dpAccLua) && fs.statSync(dpAccLua).isDirectory()) {
        const files = fs.readdirSync(dpAccLuaCloud);
        for (const file of files) {
            if (file.endsWith(".lua")) {
                fs.copyFileSync(path.join(dpAccLuaCloud, file), path.join(dpAccLua, file));
            }
        }
        console.log("[success] pull wow account lua");
        return true;
    } else {
        console.warn(dpAccLua + " is not directory");
        return false;
    }
}

/**
 * @returns {boolean}
 */
function wowCharLua() {
    const dpCharLua = path.join(config.wow_root, "_classic_", "WTF", "Account", "YATYRICKY", "木喉要塞", "洛科林丶雷酒", "SavedVariables");
    const dpCharLuaCloud = path.join(__dirname, "World of Warcraft", "classic", "YATYRICKY", "木喉要塞", "洛科林丶雷酒", "SavedVariables");
    funcs.deleteFolderFilesRecursiveSync(dpCharLua);
    if (fs.existsSync(dpCharLua) && fs.statSync(dpCharLua).isDirectory()) {
        const files = fs.readdirSync(dpCharLuaCloud);
        for (const file of files) {
            if (file.endsWith(".lua")) {
                fs.copyFileSync(path.join(dpCharLuaCloud, file), path.join(dpCharLua, file));
            }
        }
        console.log("[success] pull wow character lua");
        return true;
    } else {
        console.warn(dpCharLua + " is not directory");
        return false;
    }
}

if (fs.existsSync(fpConfig)) {
    const configOnDisk = funcs.safeParseObj(fs.readFileSync(fpConfig).toString());
    if (configOnDisk !== null) {
        if (typeof configOnDisk.wow_root === "string" && configOnDisk.wow_root.length > 0) {
            config.wow_root = configOnDisk.wow_root;
            if (!wowAddOns() || !wowAccLua() || !wowCharLua()) {
                config.wow_root = "";
                writeConfig = true;
            }
        } else {
            config.wow_root = "";
            writeConfig = true;
        }
        if (typeof configOnDisk.d2_save === "string" && configOnDisk.d2_save.length > 0) {
            config.d2_save = configOnDisk.d2_save;
        } else {
            config.d2_save = "";
            writeConfig = true;
        }
    } else {
        config.wow_root = "";
        config.d2_save = "";
        writeConfig = true;
    }
} else {
    config.wow_root = "";
    config.d2_save = "";
    writeConfig = true;
}

if (writeConfig) {
    console.warn("config has problems");
    fs.writeFileSync(fpConfig, JSON.stringify(config, null, 2));
}
