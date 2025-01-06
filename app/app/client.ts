import { VideoInfo } from "./types"

export const getVideos = async () => {
	const response = await fetch('/api/videos')

	if (response.status != 200) {
		return []
	}

	return (await response.json() as string[]).map((data) => {
		return new VideoInfo(data)
	})
}