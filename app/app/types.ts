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