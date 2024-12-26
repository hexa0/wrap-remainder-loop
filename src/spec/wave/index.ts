import assert from "assert";
import { ReadRiffHeader, RiffChunk, RiffHeader } from "../riff";
import {
	ReadWaveFormatChunk,
	WaveFormatChunk,
	WaveFormatChunkAudioFormat,
} from "./waveFormatChunk";
import { channel } from "diagnostics_channel";
import { Clamp } from "../../util/math/clamp";

export interface WaveFile {
	buffer: Buffer;
	riff: RiffHeader;
	fmt: WaveFormatChunk;
	data: RiffChunk;
}

export function ReadWaveHeaders(buffer: Buffer): WaveFile {
	const riffHeader = ReadRiffHeader(buffer);
	assert(riffHeader.type === 1163280727, `Invalid type in RIFF header, expected 1163280727 got ${riffHeader.type}`);

	const fmtChunk = riffHeader.chunks.get("fmt");
	assert(fmtChunk, `No fmt chunk found, WAVE is corrupted`);

	const dataChunk = riffHeader.chunks.get("data");
	assert(dataChunk, `No data chunk found, WAVE is corrupted`);

	return {
		buffer: buffer,
		riff: riffHeader,
		fmt: ReadWaveFormatChunk(fmtChunk),
		data: dataChunk,
	};
}

export function ReadSample(waveFile: WaveFile, sample: number) {
	const bytesPerSample = waveFile.fmt.bitsPerSample / 8;

	const view = new DataView(waveFile.data.buffer.buffer);

	let read: keyof DataView = "getInt8";

	switch (waveFile.fmt.bitsPerSample) {
		case 8:
			read = "getInt8";
			break;
		case 16:
			read = "getInt16";
			break;
		case 24:
			throw "DataViews cannot read 24bit integers natively, use 32bit Float or 16bit PCM";
			break;
		case 32:
			if (waveFile.fmt.audioFormat === WaveFormatChunkAudioFormat.pcm) {
				read = "getInt32";
			} else if (
				waveFile.fmt.audioFormat === WaveFormatChunkAudioFormat.float
			) {
				read = "getFloat32";
			}

			break;

		default:
			throw "Unimplemented audioFormat/bitsPerSample.";
			break;
	}

	const channels = [];

	for (let index = 0; index < waveFile.fmt.channels; index++) {
		channels[index] = view[read](
			(sample * waveFile.fmt.channels + index) * bytesPerSample,
			true
		);
	}

	return channels;
}

export function WriteSample(
	waveFile: WaveFile,
	sample: number,
	channels: number[]
) {
	const bytesPerSample = waveFile.fmt.bitsPerSample / 8;

	const view = new DataView(waveFile.data.buffer.buffer);

	let write: keyof DataView = "setInt8";

	switch (waveFile.fmt.bitsPerSample) {
		case 8:
			write = "setInt8";
			break;
		case 16:
			write = "setInt16";
			break;
		case 24:
			throw "DataViews cannot write 24bit integers natively, use 32bit Float or 16bit PCM";
			break;
		case 32:
			if (waveFile.fmt.audioFormat === WaveFormatChunkAudioFormat.pcm) {
				write = "setInt32";
			} else if (
				waveFile.fmt.audioFormat === WaveFormatChunkAudioFormat.float
			) {
				write = "setFloat32";
			}

			break;

		default:
			throw "Unimplemented audioFormat/bitsPerSample.";
			break;
	}

	assert(
		channels.length === waveFile.fmt.channels,
		"Attempted to write sample with incorrect amount of channels"
	);

	const limit = ((2 ** waveFile.fmt.bitsPerSample) / 2) - 1

	for (let index = 0; index < waveFile.fmt.channels; index++) {
		view[write](
			(sample * waveFile.fmt.channels + index) * bytesPerSample,
			Clamp(channels[index], -limit, limit),
			true
		);
	}
}

export function GetSampleCount(waveFile: WaveFile): number {
	const bytesPerSample = waveFile.fmt.bitsPerSample / 8;

	return (
		(waveFile.data.riffChunkEnd - waveFile.data.riffChunkStart) /
		bytesPerSample /
		waveFile.fmt.channels
	);
}
