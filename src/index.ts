console.log(`Init, Bun version: ${Bun.version}`)

import { lastIndexOf } from "./util/string/lastIndexOf";
import { RenderNewWave } from "./renderer";

const commandLineArguments = process.argv.slice(2);
const audioToProcess = commandLineArguments[0];
const outputPath = commandLineArguments[1]
	? commandLineArguments[1]
	: audioToProcess.substring(
			0,
			lastIndexOf(audioToProcess, ".") || audioToProcess.length
	  ) + " (looped).wav";

const fileBuffer = Buffer.from(await Bun.file(audioToProcess).bytes());
console.log("Processing")
RenderNewWave(fileBuffer, outputPath);