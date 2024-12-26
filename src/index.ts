import { readFileSync } from "fs";
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

const fileBuffer = readFileSync(audioToProcess);
RenderNewWave(fileBuffer, outputPath);

// keep process open for npm run dev
process.stdin.resume();
