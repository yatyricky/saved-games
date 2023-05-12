let funcs = require("./funcs")

funcs.copyDirectoryItemsIntoDirectory("./test/New", "./test/target", { fileExts: { [".txt"]: true } })