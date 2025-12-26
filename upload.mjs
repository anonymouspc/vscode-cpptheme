import fs from "fs";
import child_process from "child_process"
import util from "util"
child_process.promises = new Object()
child_process.promises.exec = util.promisify(child_process.exec)

// Git pull
await child_process.promises.exec("git pull")

// Update icon/codicon.ttf
try {
    await child_process.promises.exec("git clone https://github.com/microsoft/vscode .tmp --depth 1")
    await fs.promises.copyFile(".tmp/src/vs/base/browser/ui/codicons/codicon/codicon.ttf", "icon/codicon.ttf")
} catch (_) {
    console.warn("warning: failed to update icon/codicon.ttf")
} finally {
   await fs.promises.rm(".tmp", {recursive: true, force: true})
}

// Update locale/cpp-zh-cn.json
try {
    await child_process.promises.exec("git clone https://github.com/microsoft/vscode-loc .tmp --depth 1")
    let json = JSON.parse((await fs.promises.readFile(".tmp/i18n/vscode-language-pack-zh-hans/translations/main.i18n.json")).toString())
    json["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.goToDecl.label"]               = "转到实现 (implement)"
    json["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.goToDeclaration.label"]        = "转到声明 (declare)"
    json["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.goToTypeDefinition.label"]     = "转到类型 (class)"
    json["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.goToImplementation.label"]     = "转到虚实现 (virtual)"
    json["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["goToReferences.label"]                 = "转到调用 (caller)"
    json["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["peek.submenu"]                         = "查看"
    json["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.previewDecl.label"]            = "查看实现 (implement)"
    json["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.peekDecl.label"]               = "查看实现 (implement)"
    json["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.peekTypeDefinition.label"]     = "查看类型 (class)"
    json["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.peekImplementation.label"]     = "查看虚实现 (virtual)"
    json["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchy.contribution"]["title"]            = "函数层次结构"
    json["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchy.contribution"]["title.incoming"]   = "显示被调用 (called)"
    json["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchy.contribution"]["title.outgoing"]   = "显示调用 (call)"
    json["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek"]["callFrom"]                  = "被调用 (called)"
    json["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek"]["callTo"]                    = "调用 (call)"
    json["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek"]["empt.callsFrom"]            = "没有被其他函数调用"
    json["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek"]["empt.callsTo"]              = "没有调用其他函数"
    json["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchyTree"]["tree.aria"]                 = "函数层次结构"
    json["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchyTree"]["from"]                      = "被调用 (called)"
    json["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchyTree"]["to"]                        = "调用 (call)"
    await fs.promises.writeFile("locale/cpp-zh-cn.json", JSON.stringify(json, null, 4))
} catch (_) {
    console.warn("warning: failed to update locale/cpp-zh-cn.json")
} finally {
    await fs.promises.rm(".tmp", {recursive: true, force: true})
}

// Git commit
try {
    await child_process.promises.exec("git add .")
    await child_process.promises.exec("git commit -m update")
} catch (_) { }

// Vsce upload
try {
    await fs.promises.access("vsce-token.txt")
} catch (_) {
    throw new Error("failed to upload vscode extension because vsce-token.txt is not found")
}
await child_process.promises.exec(`vsce publish patch --pat ${await fs.promises.readFile("vsce-token.txt")}`)

// Git push
await child_process.promises.exec("git push")