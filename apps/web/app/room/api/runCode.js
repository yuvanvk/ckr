import { exec } from "child_process";
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests are allowed" });
  }

  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ message: "Language and code are required" });
  }

  const dir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const fileExtension = {
    python: ".py",
    c: ".c",
    cpp: ".cpp",
    java: ".java",
    typescript: ".ts",
    go: ".go",
    ruby: ".rb",
    php: ".php",
    rust: ".rs",
    kotlin: ".kt",
    swift: ".swift",
    csharp: ".cs",
  }[language];

  if (!fileExtension) {
    return res.status(400).json({ message: "Unsupported language" });
  }

  const fileName = `code${fileExtension}`;
  const filePath = path.join(dir, fileName);
  const executablePath = path.join(dir, "code");

  fs.writeFileSync(filePath, code);

  const commands = {
    python: `python3 ${filePath}`,
    c: `gcc ${filePath} -o ${executablePath} && ${executablePath}`,
    cpp: `g++ ${filePath} -o ${executablePath} && ${executablePath}`,
    java: `javac ${filePath} && java -cp ${dir} Main`,
    typescript: `ts-node ${filePath}`,
    go: `go run ${filePath}`,
    ruby: `ruby ${filePath}`,
    php: `php ${filePath}`,
    rust: `rustc ${filePath} -o ${executablePath} && ${executablePath}`,
    kotlin: `kotlinc ${filePath} -include-runtime -d ${executablePath}.jar && java -jar ${executablePath}.jar`,
    swift: `swiftc ${filePath} -o ${executablePath} && ${executablePath}`,
    csharp: `mcs ${filePath} -out:${executablePath}.exe && mono ${executablePath}.exe`,
  };

  const command = commands[language];

  if (!command) {
    return res.status(400).json({ message: "Invalid language selected" });
  }

  exec(command, (error, stdout, stderr) => {
    fs.unlinkSync(filePath); // Clean up the written file
    if (fs.existsSync(executablePath)) {
      fs.unlinkSync(executablePath);
    }
    if (fs.existsSync(`${executablePath}.jar`)) {
      fs.unlinkSync(`${executablePath}.jar`);
    }
     if (fs.existsSync(`${executablePath}.exe`)) {
      fs.unlinkSync(`${executablePath}.exe`);
    }

    if (error) {
      return res.status(500).json({ error: error.message, stderr });
    }
    res.status(200).json({ output: stdout });
  });
}