const fs = require("fs");
const path = require("path");

/**
 * @param {string} str
 */
function safeParseObj(str) {
    var ret = null;
    try {
        ret = JSON.parse(str);
    } catch (error) {
        console.warn("JSON.parse failed", str);
    }
    return ret;
}

function deleteFolderRecursiveSync(fpath) {
    if (fs.existsSync(fpath)) {
        if (fs.statSync(fpath).isDirectory()) {
            fs.readdirSync(fpath).forEach((file, index) => {
                const curPath = path.join(fpath, file);
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursiveSync(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(fpath);
        } else {
            fs.unlinkSync(fpath);
        }
    }
};

function deleteFolderFilesRecursiveSync(fpath) {
    if (fs.existsSync(fpath)) {
        if (fs.statSync(fpath).isDirectory()) {
            fs.readdirSync(fpath).forEach((file) => {
                const curPath = path.join(fpath, file);
                if (fs.statSync(curPath).isDirectory()) {
                    deleteFolderRecursiveSync(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
        } else {
            console.log(fpath + " is not a dir");
        }
    } else {
        console.log(fpath + " does not exist");
    }
};

function copyFileSync(source, target) {
    let targetFile = target;
    // if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.statSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }
    fs.writeFileSync(targetFile, fs.readFileSync(source));
};

function copyFileToFolder(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target);
    } else if (!fs.statSync(target).isDirectory()) {
        fs.unlinkSync(target);
        fs.mkdirSync(target);
    }
    let targetFile = path.join(target, path.basename(source));
    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
    let files = [];
    // check if folder needs to be created or integrated
    const targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }
    // copy
    if (fs.statSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach((file) => {
            const curSource = path.join(source, file);
            if (fs.statSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
};

function copyFolderFilesRecursiveSync(source, target) {
    let files = [];
    // check if folder needs to be created or integrated
    const targetFolder = path.join(target);
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }
    // copy
    if (fs.statSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach((file) => {
            const curSource = path.join(source, file);
            if (fs.statSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
};

module.exports = {
    deleteFolderRecursiveSync,
    deleteFolderFilesRecursiveSync,
    copyFileSync,
    copyFileToFolder,
    copyFolderRecursiveSync,
    copyFolderFilesRecursiveSync,
    safeParseObj,
};
