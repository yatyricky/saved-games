const fs = require("fs");
const path = require("path");

/**
 * @param {string} str
 * @returns {any} nullable
 */
function safeParseObj(str) {
    let ret = null;
    try {
        ret = JSON.parse(str);
    } catch (error) {
        console.warn("JSON.parse failed", str);
    }
    return ret;
}

/**
 * Deletes a file or a directory.
 * @param {fs.PathLike} fpath
 */
function deleteItem(fpath) {
    if (fs.existsSync(fpath)) {
        if (fs.statSync(fpath).isDirectory()) {
            fs.readdirSync(fpath).forEach((file) => {
                const curPath = path.join(fpath, file);
                if (fs.statSync(curPath).isDirectory()) {
                    deleteItem(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(fpath);
        } else {
            fs.unlinkSync(fpath);
        }
    }
};

/**
 * Deletes all items in directory.
 * @param {fs.PathLike} fpath
 */
function deleteDirectoryItems(fpath) {
    if (fs.existsSync(fpath)) {
        if (fs.statSync(fpath).isDirectory()) {
            fs.readdirSync(fpath).forEach((file) => {
                deleteItem(path.join(fpath, file));
            });
        }
    }
};

/**
 * Copies a file or a directory into target directory.
 * @param {fs.PathLike} source file or directory
 * @param {fs.PathLike} target directory
 * @param {{override: boolean, fileExts: string[]}} [options] options
 */
function copyItemIntoDirectory(source, target, options) {
    options = options || { override: true, fileExts: [] };
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target);
    } else if (!fs.statSync(target).isDirectory()) {
        deleteItem(target);
        fs.mkdirSync(target);
    }
    const targetPath = path.join(target, path.basename(source));
    if (fs.statSync(source).isDirectory()) {
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath);
        }
        fs.readdirSync(source).forEach((file) => {
            copyItemIntoDirectory(path.join(source, file), targetPath);
        });
    } else {
        if (fs.existsSync(targetPath)) {
            deleteItem(targetPath);
        }
        if (options.fileExts.length > 0) {
            const fn = path.basename(source);
            if (options.fileExts.some((ext) => fn.endsWith(ext))) {
                fs.copyFileSync(source, targetPath);
            }
        } else {
            fs.copyFileSync(source, targetPath);
        }

    }
}

/**
 * Copies all items in directory into target directory.
 * @param {fs.PathLike} source directory
 * @param {fs.PathLike} target directory
 * @param {{override: boolean, fileExts: string[]}} [options] options
 */
function copyDirectoryItemsIntoDirectory(source, target, options) {
    options = options || { override: true, fileExts: [] };
    if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) {
        console.log(source + " is not a directory.");
        return;
    }
    fs.readdirSync(source).forEach((file) => {
        copyItemIntoDirectory(path.join(source, file), target, options);
    });
}

module.exports = {
    safeParseObj,
    deleteItem,
    deleteDirectoryItems,
    copyItemIntoDirectory,
    copyDirectoryItemsIntoDirectory,
};
