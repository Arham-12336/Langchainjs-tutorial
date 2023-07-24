import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

//process.argv returns an array containing command line arguments
// exampleName is the file path of the example we want to `run`
const [exampleName, ...args] = process.argv.slice(2);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(exampleName, ...args);

let runExample;


try {
  ({ run: runExample } = require(path.join(__dirname, exampleName)));
} catch (e) {
  console.log("error",e);
  throw new Error(`Could not load example ${path.join(__dirname, exampleName)}`);
}

runExample();
