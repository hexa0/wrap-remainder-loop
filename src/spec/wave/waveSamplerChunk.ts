import { RiffChunk } from "../riff";

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

export function ReadWaveSamplerChunk(chunk: RiffChunk): WaveSamplerChunk {
	const view = new DataView(chunk.buffer.buffer);

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

		samplerChunk.loops.push(sampleLoop);
	}

	return samplerChunk;
}

export function WriteWaveSamplerChunk(chunk: WaveSamplerChunk): Buffer {
	const buffer = Buffer.alloc(36 + chunk.loops.length * 24);
	const view = new DataView(chunk.buffer.buffer);

	chunk.sampleLoops = chunk.loops.length;

	view.setUint32(0, chunk.manufacturer, true);
	view.setUint32(4, chunk.product, true);
	view.setUint32(8, chunk.samplePeriod, true);
	view.setUint32(12, chunk.midiUnityNote, true);
	view.setUint32(16, chunk.midiPitchFraction, true);
	view.setUint32(20, chunk.smpteFormat, true);
	view.setUint32(24, chunk.smpteOffset, true);
	view.setUint32(28, chunk.sampleLoops, true);
	view.setUint32(32, chunk.samplerData, true);

	for (let index = 0; index < chunk.sampleLoops; index++) {
		const offset = 36 + index * 24;
		const loop = chunk.loops[index];

		view.setUint32(offset + 0, loop.identifier, true);
		view.setUint32(offset + 4, loop.type, true);
		view.setUint32(offset + 8, loop.start, true);
		view.setUint32(offset + 12, loop.end, true);
		view.setUint32(offset + 16, loop.fraction, true);
		view.setUint32(offset + 20, loop.playCount, true);
	}

	return buffer
}
