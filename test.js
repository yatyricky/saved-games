let funcs = require("./funcs")

async function main() {
    console.log("Upload data")
    let changedFiles = await funcs.shell("git diff --name-only")
    await funcs.shell("git add -A");
    await funcs.shell(`git commit -am "auto commit ${changedFiles.split("\n").filter(e => e.trim().length > 0).join(", ")}"`);
}

main().catch(reason => {
    console.log(reason)
})