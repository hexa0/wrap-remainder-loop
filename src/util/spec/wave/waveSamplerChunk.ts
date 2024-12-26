import { RiffChunk } from "../riffHeader";

export interface SampleLoop {
	identifier: number;
	type: number;
	start: number;
	end: number;
	fraction: number;
	playCount: number;
}

export interface WaveSamplerChunk extends RiffChunk {
	manufacturer: number;
	product: number;
	samplePeriod: number;
	midiUnityNote: number;
	midiPitchFraction: number;
	smpteFormat: number;
	smpteOffset: number;
	sampleLoops: number;
	samplerData: number;
	loops: SampleLoop[];
}

export function ReadWaveSamplerChunk(
	buffer: Buffer,
	chunk: RiffChunk
): WaveSamplerChunk {
	const view = new DataView(
		buffer.buffer,
		chunk.riffRegionStart,
		chunk.riffRegionEnd - chunk.riffRegionStart
	);

	const samplerChunk: WaveSamplerChunk = Object.assign(
		{
			manufacturer: view.getUint32(0, true),
			product: view.getUint32(4, true),
			samplePeriod: view.getUint32(8, true),
			midiUnityNote: view.getUint32(12, true),
			midiPitchFraction: view.getUint32(16, true),
			smpteFormat: view.getUint32(20, true),
			smpteOffset: view.getUint32(24, true),
			sampleLoops: view.getUint32(28, true),
			samplerData: view.getUint32(32, true),
			loops: [],
		},
		chunk
	);

	for (let index = 0; index < samplerChunk.sampleLoops; index++) {
		const offset = 36 + index * 24;

		const sampleLoop: SampleLoop = {
			identifier: view.getUint32(offset + 0, true),
			type: view.getUint32(offset + 4, true),
			start: view.getUint32(offset + 8, true),
			end: view.getUint32(offset + 12, true),
			fraction: view.getUint32(offset + 16, true),
			playCount: view.getUint32(offset + 20, true),
		};

		samplerChunk.loops.push(sampleLoop)
	}

	return samplerChunk;
}
