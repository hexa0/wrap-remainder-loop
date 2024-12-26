import { assert } from "../../util/logic/assert";

export interface RiffChunk {
	buffer: Buffer;
	riffLabel: number;
	riffChunkStart: number;
	riffChunkEnd: number;
}

export interface RiffHeader {
	watermark: number;
	dataSize: number;
	type: number;
	chunks: Map<string, RiffChunk>;
}

const DUMMY_BUFFER = Buffer.alloc(0);

export function ReadRiffHeader(buffer: Buffer): RiffHeader {
	const view = new DataView(buffer.buffer);

	const riff: any = {};

	riff.watermark = view.getUint32(0, true);

	assert(
		riff.watermark === 1179011410,
		`RIFF header is invalid, watermark is incorrect, expected 1179011410 got ${riff.watermark}`
	);

	riff.dataSize = view.getUint32(4, true);
	riff.type = view.getUint32(8, true);

	riff.chunks = new Map<string, RiffChunk>();

	let chunkSearchOffset = 12;

	while (true) {
		if (chunkSearchOffset >= riff.dataSize - 4) {
			break;
		}

		const label = String.fromCharCode(
			...new Uint8Array(
				buffer.subarray(chunkSearchOffset, chunkSearchOffset + 4)
			)
		).replaceAll(" ", "");

		const chunk: RiffChunk = {
			buffer: DUMMY_BUFFER,
			riffLabel: view.getUint32(chunkSearchOffset, true),
			riffChunkStart: chunkSearchOffset + 8,
			riffChunkEnd:
				chunkSearchOffset +
				view.getUint32(chunkSearchOffset + 4, true) +
				8,
		};

		chunk.buffer = Buffer.alloc(chunk.riffChunkEnd - chunk.riffChunkStart);
		chunk.buffer.set(buffer.subarray(chunk.riffChunkStart, chunk.riffChunkEnd));

		if (!riff.chunks.get(label)) {
			riff.chunks.set(label, chunk);
		} else {
			riff.chunks.set(label + chunkSearchOffset, chunk);
		}

		chunkSearchOffset = chunk.riffChunkEnd;
	}

	return riff;
}

export function RiffInterfaceToBuffer(riff: RiffHeader) {
	let dataSize = 0;

	riff.chunks.forEach((chunk) => {
		dataSize += chunk.buffer.length + 8;
	});

	const buffer = Buffer.alloc(dataSize + 12);

	const view = new DataView(buffer.buffer);
	view.setUint32(0, 1179011410, true);
	view.setUint32(4, dataSize + 4, true);
	view.setUint32(8, riff.type, true);

	let chunkOffset = 12;

	riff.chunks.forEach((chunk) => {
		// console.log(chunkOffset)
		// console.log(chunk.buffer.length)
		view.setUint32(chunkOffset, chunk.riffLabel, true);
		view.setUint32(chunkOffset + 4, chunk.buffer.length, true);
		buffer.set(chunk.buffer, chunkOffset + 8);
		chunkOffset += chunk.buffer.length + 8;
	});

	return buffer;
}
