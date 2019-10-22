const fs = require("fs");
const funcs = require("./funcs");

/**
 * @param {fs.PathLike} from
 * @param {fs.PathLike} to
 * @param {string[]} [exts]
 * @returns {boolean}
 */
function copyFiles(from, to, exts) {
    exts = exts || [];
    funcs.deleteDirectoryItems(to);
    if (fs.existsSync(from) && fs.statSync(from).isDirectory()) {
        funcs.copyDirectoryItemsIntoDirectory(from, to, { fileExts: exts });
        console.log("[success] " + from + " => " + to);
        return true;
    } else {
        console.warn(from + " is not directory");
        return false;
    }
}

module.exports = {
    copyFiles,
};
