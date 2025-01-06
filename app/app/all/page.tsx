"use client"

import { useEffect, useState } from "react";
import { getTranscript, getVideos } from "../client";
import { TranscriptLine, VideoInfo } from "../types";
import Transcript from "../Transcript";
import { useRouter } from "next/navigation";
import Header from "../Header";

export type VideoWithTranscript = VideoInfo & {
	lines: TranscriptLine[]
}

export default function Home() {
	const [videos, setVideos] = useState<VideoWithTranscript[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	const router = useRouter();

	const load = async () => {
		const loaded = await getVideos();
		setLoading(true);

		const videos = await Promise.all(loaded.map(async (video) => {
			const lines = await getTranscript(video.name)

			return {
				name: video.name,
				lines
			} as VideoWithTranscript
		}))

		setVideos(videos);
		setLoading(false);
	}

	useEffect(() => {
		load();
	}, [])

	return <main>
		<Header />
		{loading ? <span className="flex justify-center">loading...</span> :
			videos.map((video) => {
				return <Transcript
					key={video.name}
					lines={video.lines}
					onClick={(line) => {
						router.push('/' + video.name + '?t=' + line.timestamp.start)
					}}
				/>
			})
		}
	</main>
}