import { RiffChunk } from "../riff";

export interface CuePoint {
	identifier: number;
	position: number;
	fccChunk: string;
	chunkStart: number;
	blockStart: number;
	sampleOffset: number;
}

export interface WaveCueChunk extends RiffChunk {
	cuePoints: number;
	points: CuePoint[];
}

export function ReadWaveCueChunk(chunk: RiffChunk): WaveCueChunk {
	const view = new DataView(chunk.buffer.buffer);

	const cueChunk: WaveCueChunk = Object.assign(
		{
			cuePoints: view.getUint32(0, true),
			points: [],
		},
		chunk
	);

	for (let index = 0; index < cueChunk.cuePoints; index++) {
		const offset = 4 + index * 24;

		const cuePoint: CuePoint = {
			identifier: view.getUint32(offset + 0, true),
			position: view.getUint32(offset + 4, true),
			fccChunk: String.fromCharCode(
				...new Uint8Array(
					chunk.buffer.subarray(offset + 8, offset + 12)
				)
			),
			chunkStart: view.getUint32(offset + 12, true),
			blockStart: view.getUint32(offset + 16, true),
			sampleOffset: view.getUint32(offset + 20, true),
		};

		cueChunk.points.push(cuePoint);
	}

	return cueChunk;
}
