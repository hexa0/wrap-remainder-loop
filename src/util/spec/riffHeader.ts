import assert from "assert";

export interface RiffChunk {
	riffLabel: string;
	riffRegionStart: number;
	riffRegionEnd: number;
}

export interface RiffHeader {
	watermark: string;
	dataSize: number;
	type: string;
	chunks: Map<string, RiffChunk>;
}

export function ReadRiffHeader(buffer: Buffer): RiffHeader {
	const view = new DataView(buffer.buffer);

	const riff: any = {};

	riff.watermark = String.fromCharCode(
		...new Uint8Array(buffer.subarray(0, 4))
	);

	assert(
		riff.watermark === "RIFF",
		`RIFF header is invalid, watermark is incorrect, expected RIFF got ${riff.watermark}`
	);

	riff.dataSize = view.getUint32(4, true);
	riff.type = String.fromCharCode(...new Uint8Array(buffer.subarray(8, 12)));

	riff.chunks = new Map<string, RiffChunk>();

	let chunkSearchOffset = 12;

	while (true) {
		if (chunkSearchOffset >= buffer.length - 8) {
			break;
		}

		const label = String.fromCharCode(
			...new Uint8Array(
				buffer.subarray(chunkSearchOffset, chunkSearchOffset + 4)
			)
		);

		const chunk: RiffChunk = {
			riffLabel: label,
			riffRegionStart: chunkSearchOffset + 8,
			riffRegionEnd:
				chunkSearchOffset +
				view.getUint32(chunkSearchOffset + 4, true) +
				8,
		};

		chunkSearchOffset = chunk.riffRegionEnd;

		riff.chunks.set(chunk.riffLabel.replaceAll(" ", ""), chunk);
	}

	return riff;
}
