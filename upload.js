let child_process = require("child_process")

try {
    child_process.execSync("git add .")
    child_process.execSync("git commit -m update")
}
catch (error) { 
    // pass
}

token = readFile("../token/vsce.personal-access.token")
child_process.execSync(`vsce publish -p ${token} patch`)
child_process.execSync("git push")