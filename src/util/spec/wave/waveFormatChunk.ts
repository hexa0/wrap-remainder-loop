import { RiffChunk } from "../riffHeader";

export const enum WaveFormatChunkAudioFormat {
	pcm = 1,
	float = 3
}

export interface WaveFormatChunk extends RiffChunk {
	audioFormat: WaveFormatChunkAudioFormat;
	channels: number;
	sampleRate: number;
	bytesPerSecond: number;
	bytesPerBlock: number;
	bitsPerSample: number;
}

export function ReadWaveFormatChunk(
	buffer: Buffer,
	chunk: RiffChunk
): WaveFormatChunk {
	const view = new DataView(
		buffer.buffer,
		chunk.riffRegionStart,
		chunk.riffRegionEnd - chunk.riffRegionStart
	);

	return Object.assign(
		{
			audioFormat: view.getUint16(0, true),
			channels: view.getUint16(2, true),
			sampleRate: view.getUint32(4, true),
			bytesPerSecond: view.getUint32(8, true),
			bytesPerBlock: view.getUint16(12, true),
			bitsPerSample: view.getUint16(14, true),
		},
		chunk
	);
}