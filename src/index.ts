import { readFileSync } from "fs";
import { lastIndexOf } from "./util/string/lastIndexOf";
import { ReadRiffHeader } from "./util/spec/riffHeader";
import { ReadWaveFormatChunk } from "./util/spec/wave/waveFormatChunk";
import assert from "assert";
import { ReadWaveSamplerChunk } from "./util/spec/wave/waveSamplerChunk";
import { ReadWaveCueChunk } from "./util/spec/wave/waveCueChunk";

const commandLineArguments = process.argv.slice(2);
const audioToProcess = commandLineArguments[0];
const outputPath = commandLineArguments[1]
	? commandLineArguments[1]
	: audioToProcess.substring(
			0,
			lastIndexOf(audioToProcess, ".") || audioToProcess.length
	  ) + " (looped).wav";

const fileBuffer = readFileSync(audioToProcess);
const riffHeader = ReadRiffHeader(fileBuffer);

const fmtChunk = riffHeader.chunks.get("fmt");
assert(fmtChunk, `no fmt chunk`);

const smplChunk = riffHeader.chunks.get("smpl");
assert(smplChunk, `no smpl chunk`);

const cueChunk = riffHeader.chunks.get("cue");
assert(cueChunk, `no cue chunk`);

console.log("Got headers:", riffHeader);
console.log("Format chunk:", ReadWaveFormatChunk(fileBuffer, fmtChunk));
console.log("Sampler chunk:", ReadWaveSamplerChunk(fileBuffer, smplChunk));
console.log("Cue chunk:", ReadWaveCueChunk(fileBuffer, cueChunk));
console.log(`Output to: ${outputPath}`);

// keep process open for npm run dev
process.stdin.resume();
