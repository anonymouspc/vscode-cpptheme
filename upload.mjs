import fs from "fs";
import child_process from "child_process"
import util from "util"
child_process.exec = util.promisify(child_process.exec)

// Git pull
await child_process.exec("git pull")

// Update icon/codicon.ttf
try {
    await child_process.exec("git clone https://github.com/microsoft/vscode .tmp --depth 1")
    await fs.promises.copyFile(".tmp/src/vs/base/browser/ui/codicons/codicon/codicon.ttf", "icon/codicon.ttf")
} catch (_) {
    console.warn("warning: failed to update icon/codicon.ttf")
} finally {
   await fs.promises.rm(".tmp", {recursive: true, force: true})
}

// Update locale/cpp-zh-cn.json
try {
    await child_process.exec("git clone https://github.com/microsoft/vscode-loc .tmp --depth 1")
    let json = JSON.parse((await fs.promises.readFile(".tmp/i18n/vscode-language-pack-zh-hans/translations/main.i18n.json")).toString())
    json["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.goToDecl.label"] = "haha!"
    await fs.promises.writeFile("locale/cpp-zh-cn.json", JSON.stringify(json))
} catch (_) {
    console.warn("warning: failed to update locale/cpp-zh-cn.json")
} finally {
    await fs.promises.rm(".tmp", {recursive: true, force: true})
}

// Git commit
try {
    await child_process.exec("git add .")
    await child_process.exec("git commit -m update")
} catch (_) { }

// Vscode upload
try {
    await fs.promises.access("vsce-token.txt")
} catch (_) {
    throw new Error("failed to upload vscode extension because vsce-token.txt is not found")
}
await child_process.exec(`vsce publish patch --pat ${await fs.promises.readFile("vsce-token.txt")}`)

// Git push
await child_process.exec("git push")