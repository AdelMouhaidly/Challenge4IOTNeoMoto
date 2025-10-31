const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const getCommitHash = () => {
  try {
    const hash = execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
    }).trim();
    return hash;
  } catch (error) {
    console.error("Erro ao obter hash do commit:", error.message);
    return "unknown";
  }
};

const updateAppJson = () => {
  const appJsonPath = path.join(__dirname, "..", "app.json");

  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
    const commitHash = getCommitHash();

    if (!appJson.expo.extra) {
      appJson.expo.extra = {};
    }

    appJson.expo.extra.commitHash = commitHash;

    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + "\n");

    console.log(`Commit hash atualizado: ${commitHash}`);
  } catch (error) {
    console.error("Erro ao atualizar app.json:", error.message);
    process.exit(1);
  }
};

updateAppJson();
