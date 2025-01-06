"use client"

import { useEffect, useState } from "react";
import { VideoInfo } from "./types";
import { getVideos } from "./client";
import Link from "next/link";

const HeaderList = ({ videos }: { videos: VideoInfo[] }) => {
	return <div key="header-list" className="flex flex-row justify-left space-x-2 m-2 overflow-x-auto">
		<Link className="m-2 hover:underline" href='/'>home</Link>
		<Link className="m-2 hover:underline" href='/all'>all</Link>
		{videos.map((video) => {
			return <Link key={video.name} href={video.name} className="m-2 hover:underline hover:cursor-pointer">
				{video.name}
			</Link>
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