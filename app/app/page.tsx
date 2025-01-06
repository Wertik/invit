"use client"

import { useEffect, useState } from "react";
import Header from "./Header";
import { VideoInfo } from "./types";
import { getVideos } from "./client";

export default function Home() {
  const [videos, setVideos] = useState<VideoInfo[]>([]);

	const loadVideos = () => {
		getVideos().then((videos) => setVideos(videos))
	}

  useEffect(() => {
    loadVideos();
  }, []);
  
  return (
    <main>
      <Header />
      <section key="list" className="m-2">
        <h1 className="underline text-lg">Available transcripts:</h1>
        <div className="flex flex-col m-2">
          {videos.length == 0 ? "None." : videos.map((video) => {
            return <a key={video.name} className="hover:cursor-pointer hover:underline" href={video.name}>{video.name}</a>
          })}
        </div>
      </section>
    </main>
  );
}