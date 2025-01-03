import {
	GetSampleCount,
	ReadSample,
	ReadWaveHeaders,
	WriteSample,
} from "../spec/wave";
import { ReadWaveCueChunk } from "../spec/wave/waveCueChunk";
import {
	ReadWaveSamplerChunk,
	WriteWaveSamplerChunk,
} from "../spec/wave/waveSamplerChunk";
import { RiffInterfaceToBuffer } from "../spec/riff";
import { assert } from "../util/logic/assert";
import { commandLineFlags } from "../util/process/commandLineArguments";

export async function RenderNewWave(file: Buffer, outputPath: string) {
	const waveFile = ReadWaveHeaders(file);

	const smpl = waveFile.riff.chunks.get("smpl");
	assert(
		smpl,
		`No smpl chunk found, Make sure you're using the correct export settings in the readme`
	);

	const cue = waveFile.riff.chunks.get("cue");
	assert(
		cue,
		`No cue chunk found, Make sure you're using the correct export settings in the readme`
	);

	const cueData = ReadWaveCueChunk(cue);
	assert(
		cueData.points[0],
		`No loopMarker found, Make sure you're using the correct export settings in the readme`
	);

	const samplerData = ReadWaveSamplerChunk(smpl);
	assert(
		samplerData.loops[0],
		`No loopRegion found, Make sure you're using the correct export settings in the readme`
	);

	const sampleCount = GetSampleCount(waveFile);
	const remainderStart = samplerData.loops[0].end;
	const remainderSize = sampleCount - remainderStart;
	const loopStart = cueData.points[0].position;

	for (let index = 0; index < remainderSize; index++) {
		const readRemainder = ReadSample(waveFile, remainderStart + index);
		const readLoopWrap = ReadSample(waveFile, loopStart + index);

		const write = [];
		for (let index = 0; index < waveFile.fmt.channels; index++) {
			write[index] = readRemainder[index] + readLoopWrap[index];
		}

		WriteSample(waveFile, remainderStart + index, write);
	}

	waveFile.riff.chunks.set("data", waveFile.data);

	samplerData.loops[0].start = loopStart + remainderSize;
	samplerData.loops[0].end = sampleCount;

	samplerData.buffer = WriteWaveSamplerChunk(samplerData);

	const newFileBuffer = RiffInterfaceToBuffer(waveFile.riff);

	console.log(`Writing`)

	await Bun.write(outputPath, newFileBuffer.buffer)

	console.log(`File written to "${outputPath}"`)
	console.log(`Sample rate is ${waveFile.fmt.sampleRate}`)
	console.log(`Loop start is ${samplerData.loops[0].start}`)
	console.log(`Loop end is ${samplerData.loops[0].end}`)

	if (commandLineFlags.get("write-info") === "yes") {
		console.log(`Writing info`)
		await Bun.write(outputPath.substring(0, outputPath.lastIndexOf(".")) + ".json", JSON.stringify({
			sampleRate: waveFile.fmt.sampleRate,
			loopStart: samplerData.loops[0].start,
			loopEnd: samplerData.loops[0].end,
		}))
	}

	console.log(`Done`)
}
