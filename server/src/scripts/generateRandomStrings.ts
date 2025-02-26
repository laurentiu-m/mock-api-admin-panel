import fs from "fs";

const args = process.argv;

if (args.length < 3) {
  console.error("Please enter the length of the sring");
  process.exit(1);
}

const num = Number(args[2]);

if (!num) {
  console.error("Please enter a number");
  process.exit(1);
}

const generateRandomString = (length: number) => {
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charLength = char.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charLength);
    result += char[randomIndex];
  }

  return result;
};

const updateEnvExampleFile = (randomString: string) => {
  const envFile = fs.readFileSync(".env.example", "utf-8");

  const updateEnvFile = envFile
    .split("\n")
    .map((key) => {
      if (key.startsWith("JWT_SECRET_KEY=")) {
        return `JWT_SECRET_KEY=${randomString}`;
      }
      return key;
    })
    .join("\n");

  fs.writeFileSync(".env.example", updateEnvFile, "utf-8");
};

const randomString = generateRandomString(num);
updateEnvExampleFile(randomString);
