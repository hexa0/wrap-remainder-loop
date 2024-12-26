import assert from "assert";
import { GetSampleCount, ReadSample, ReadWaveHeaders, WriteSample } from "../spec/wave";
import { ReadWaveCueChunk } from "../spec/wave/waveCueChunk";
import { ReadWaveSamplerChunk } from "../spec/wave/waveSamplerChunk";
import { RiffInterfaceToBuffer } from "../spec/riff";
import { writeFileSync } from "fs";

export function RenderNewWave(file: Buffer, outputPath: string) {
	const waveFile = ReadWaveHeaders(file);

	const smplChunk = waveFile.riff.chunks.get("smpl");
	assert(smplChunk, `No smpl chunk found, Make sure you're using the correct export settings in the readme`);
	
	const cueChunk = waveFile.riff.chunks.get("cue");
	assert(cueChunk, `No cue chunk found, Make sure you're using the correct export settings in the readme`);

	const loopMarker = ReadWaveCueChunk(cueChunk).points[0]
	assert(loopMarker, `No loopMarker found, Make sure you're using the correct export settings in the readme`)

	const loopRegion = ReadWaveSamplerChunk(smplChunk).loops[0]
	assert(loopRegion, `No loopRegion found, Make sure you're using the correct export settings in the readme`)

	const remainderStart = loopRegion.end
	const remainderSize = GetSampleCount(waveFile) - remainderStart
	const loopStart = loopMarker.position

	for (let index = 0; index < remainderSize; index++) {
		const readRemainder = ReadSample(waveFile, remainderStart + index)
		const readLoopWrap = ReadSample(waveFile, loopStart + index)

		const write = [];
		for (let index = 0; index < waveFile.fmt.channels; index++) {
			write[index] = readRemainder[index] + readLoopWrap[index]
		}

		WriteSample(waveFile, remainderStart + index, write)
	}

	waveFile.riff.chunks.set("data", waveFile.data)

	// console.log(remainderStart, remainderSize, loopStart)

	const newFileBuffer = RiffInterfaceToBuffer(waveFile.riff)

	writeFileSync(outputPath, newFileBuffer)
}