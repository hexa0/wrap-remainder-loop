console.log(`Init, Bun version: ${Bun.version}`);

import { lastIndexOf } from "./util/string/lastIndexOf";
import { RenderNewWave } from "./renderer";
import {
	commandLineFlags,
	inputFile,
} from "./util/process/commandLineArguments";

const audioToProcess = inputFile;
const outputPath =
	commandLineFlags.get("--output-file") ||
	audioToProcess.substring(
		0,
		lastIndexOf(audioToProcess, ".") || audioToProcess.length
	) + " (looped).wav";

const fileBuffer = Buffer.from(await Bun.file(audioToProcess).bytes());
console.log("Processing");
RenderNewWave(fileBuffer, outputPath).catch((err) => {
	console.error("Failed:")
	console.error(err)
	process.stdin.resume();
});
