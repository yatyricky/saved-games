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
 * 
 * @param {string} fullPath 
 * @param {string} prefix 
 */
function trimPath(fullPath, prefix) {
    let fullPathSanitized = fullPath.replace(/\\/g, "/")
    let prefixSanitized = prefix.replace(/\\/g, "/")
    if (!prefixSanitized.endsWith("/")) {
        prefixSanitized += "/"
    }
    if (fullPathSanitized.startsWith(prefixSanitized)) {
        return fullPathSanitized.replace(prefixSanitized, "")
    } else {
        throw new Error(`${fullPath} does not start with ${prefix}`)
    }
}

/**
 * Copies a file or a directory into target directory.
 * @param {fs.PathLike} source file or directory
 * @param {fs.PathLike} target directory
 * @param {{override: boolean, patterns: string[]}} [options] options
 */
function copyItemIntoDirectoryRecursive(source, target, options) {
    let opts = {
        override: false,
        checkMTime: false,
        patterns: [],
        ...options,
    }

    const targetPath = path.join(target, path.basename(source));
    let sourceStat = fs.statSync(source)
    if (sourceStat.isDirectory()) {
        fs.readdirSync(source).forEach((file) => {
            copyItemIntoDirectoryRecursive(path.join(source, file), targetPath, opts);
        });
    } else {
        let flag = false
        for (const pattern of options.patterns) {
            let regex = new RegExp(pattern, "g")
            let checkSource = trimPath(source, options._sourceDir)
            flag = flag || regex.test(checkSource)
            if (flag) {
                break
            }
        }

        if (!flag) {
            return
        }

        if (fs.existsSync(targetPath)) {
            let targetStat = fs.statSync(targetPath)
            if (targetStat.isDirectory()) {
                throw new Error(`Target is already a directory: ${targetPath}`)
            }

            if (opts.checkMTime && targetStat.mtimeMs > sourceStat.mtimeMs) {
                console.log(`[WARN] ${targetPath} is newer than ${source}, skip...`)
                return
            }

            if (opts.override) {
                deleteItem(targetPath);
            } else {
                return
            }
        }

        checkDir(target)
        fs.copyFileSync(source, targetPath);
    }
}

/**
 * Copies a file or a directory into target directory.
 * @param {fs.PathLike} source file or directory
 * @param {fs.PathLike} target directory
 * @param {{override: boolean, patterns: string[]}} [options] options
 */
function copyItemIntoDirectory(source, target, options) {
    if (options._sourceDir === undefined) {
        options._sourceDir = path.dirname(source)
    }

    if (options._targetDir === undefined) {
        options._targetDir = target
    }

    copyItemIntoDirectoryRecursive(source, target, options)
}

/**
 * Copies all items in directory into target directory.
 * @param {fs.PathLike} source directory
 * @param {fs.PathLike} target directory
 * @param {{override: boolean, patterns: string[]}} [options] options
 */
function copyDirectoryItemsIntoDirectory(source, target, options) {
    if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) {
        console.log(source + " is not a directory.");
        return;
    }
    options._sourceDir = source
    options._targetDir = target
    fs.readdirSync(source).forEach((file) => {
        copyItemIntoDirectory(path.join(source, file), target, options);
    });
}

async function shell(command, options) {
    console.log(`shell: ${command}`)
    return new Promise((resolve, reject) => {
        child_process.exec(command, options, (error, stdout, stderr) => {
            if (error !== null) {
                reject(`${error.code}, ${stdout} ${stderr}`)
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
