export type Timestamp = {
	start: number
	end: number
}

export type TranscriptLine = {
	id: number
	text: string
	timestamp: Timestamp
}

export class VideoInfo {
	public name: string;
	constructor(name: string) {
		this.name = name;
	}

	public video() {
		return "/videos/" + this.name + ".mp4";
	}

	public transcript() {
		return "/videos/" + this.name + ".json";
	}
}