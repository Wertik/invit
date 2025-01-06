"use client"

import { useEffect, useState } from "react";
import { VideoInfo } from "./types";
import { getVideos } from "./client";

const HeaderList = ({ videos }: { videos: VideoInfo[] }) => {
	return <div key="header-list" className="flex flex-row justify-left space-x-2 m-2 overflow-x-auto">
		<a className="m-2 hover:underline" href='/'>home</a>
		{videos.map((video) => {
			return <a key={video.name} href={video.name} className="m-2 hover:underline hover:cursor-pointer">
				{video.name}
			</a>
		})}
	</div>
}

const Header = () => {
	const [videos, setVideos] = useState<VideoInfo[]>([]);

	const loadVideos = () => {
		getVideos().then(videos => setVideos(videos))
	}

	useEffect(() => {
		loadVideos();
	}, []);

	return (
		<HeaderList videos={videos} />
	)
}

export default Header;