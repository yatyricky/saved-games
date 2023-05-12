const fs = require("fs");
const path = require("path");
const child_process = require("child_process")

/**
 * @param {string} str
 * @returns {any?}
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
                deleteItem(path.join(fpath, file))
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

function checkDir(dp) {
    if (fs.existsSync(dp)) {
        if (fs.statSync(dp).isDirectory()) {
            return
        } else {
            throw new Error(`CheckDir: Path is already a file: ${dp}`)
        }
    }

    let stack = []
    let flag
    do {
        stack.push(dp)
        dp = path.dirname(dp)
        if (fs.existsSync(dp)) {
            if (fs.statSync(dp).isFile()) {
                throw new Error(`CheckDir: Path is already a file: ${dp}`)
            }
            flag = false
        } else {
            flag = true
        }
    } while (flag);

    while (stack.length > 0) {
        fs.mkdirSync(stack.pop())
    }
}

/**
 * Copies a file or a directory into target directory.
 * @param {fs.PathLike} source file or directory
 * @param {fs.PathLike} target directory
 * @param {{override: boolean, fileExts: string[]}} [options] options
 */
function copyItemIntoDirectory(source, target, options) {
    let opts = {
        override: false,
        fileExts: [],
        ...options,
    }
    checkDir(target)

    const targetPath = path.join(target, path.basename(source));
    if (fs.statSync(source).isDirectory()) {
        checkDir(targetPath)
        fs.readdirSync(source).forEach((file) => {
            copyItemIntoDirectory(path.join(source, file), targetPath, opts);
        });
    } else {
        if (fs.existsSync(targetPath)) {
            if (opts.override) {
                deleteItem(targetPath);
            } else {
                return
            }
        }
        if (opts.fileExts.length > 0) {
            let ext = path.parse(targetPath).ext
            if (opts.fileExts.indexOf(ext) > 0) {
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
    let opts = {
        override: false,
        fileExts: [],
        ...options,
    }
    if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) {
        console.log(source + " is not a directory.");
        return;
    }
    fs.readdirSync(source).forEach((file) => {
        copyItemIntoDirectory(path.join(source, file), target, opts);
    });
}

async function shell(command, options) {
    console.log(`shell: ${command}`)
    return new Promise((resolve, reject) => {
        child_process.exec(command, options, (error, stdout, stderr) => {
            if (error !== null) {
                reject(error.code, stderr)
            } else {
                resolve(stdout)
            }
        })
    })
}

module.exports = {
    safeParseObj,
    deleteItem,
    deleteDirectoryItems,
    copyItemIntoDirectory,
    copyDirectoryItemsIntoDirectory,
    checkDir,
    shell,
};
