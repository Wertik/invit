import { TranscriptLine, VideoInfo } from "./types"

export const getVideos = async () => {
	const response = await fetch('/api/videos')

	if (response.status != 200) {
		return []
	}

	return (await response.json() as string[]).map((data) => {
		return new VideoInfo(data)
	})
}

export const getTranscript = async (name: string): Promise<TranscriptLine[]> => {
	const response = await fetch(`/videos/${name}.json`);

	if (response.status !== 200) {
		console.log('failed to load transcript of ' + name);
		return [];
	}

	const json = await response.json();

	const imported = (json as ({
		id: number;
		text: string;
		timestamp: number[];
	}[]));

	return imported.map((v) => {
		return {
			text: v.text,
			id: v.id,
			timestamp: {
				start: v.timestamp[0],
				end: v.timestamp[1]
			}
		} as TranscriptLine;
	});
}
