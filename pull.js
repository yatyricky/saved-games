const funcs = require("./funcs");
const core = require("./core");
const fs = require("fs");
const path = require("path");
const child = require("child_process");

child.execSync("git pull");

const fpConfig = path.join("config.json");
let config = {};
let writeConfig = false;

if (fs.existsSync(fpConfig)) {
    const configOnDisk = funcs.safeParseObj(fs.readFileSync(fpConfig).toString());
    if (configOnDisk !== null) {
        if (typeof configOnDisk.wow_root === "string" && configOnDisk.wow_root.length > 0) {
            config.wow_root = configOnDisk.wow_root;
            const dpAddOns = path.join(config.wow_root, "_classic_", "Interface", "AddOns");
            const dpAddOnsCloud = path.join(__dirname, "World of Warcraft", "classic", "AddOns");
            const dpAccLua = path.join(config.wow_root, "_classic_", "WTF", "Account", "YATYRICKY");
            const dpAccLuaCloud = path.join(__dirname, "World of Warcraft", "classic", "YATYRICKY");
            if (!core.copyFilesClean(dpAddOnsCloud, dpAddOns) || !core.copyFilesClean(dpAccLuaCloud, dpAccLua, [".lua"])) {
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
