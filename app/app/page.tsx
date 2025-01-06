"use client"

import { useEffect, useState } from "react";
import Header from "./Header";
import { VideoInfo } from "./types";
import { getVideos } from "./client";
import Link from "next/link";

export default function Home() {
  const [videos, setVideos] = useState<VideoInfo[]>([]);

  const loadVideos = () => {
    getVideos().then((videos) => setVideos(videos))
  }

  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <main className="min-h-screen max-h-screen flex flex-col">
      <Header />
      <section key="list" className="m-2 flex flex-1 flex-col">
        <h1 className="underline text-lg">Available transcripts:</h1>
        <div className="flex flex-col m-2">
          {videos.length == 0 ? "None." : videos.map((video) =>
            <div key={video.name}>
              <Link key={video.name} className="hover:cursor-pointer hover:underline" href={video.name}>{video.name}</Link>
            </div>
          )}
        </div>
      </section>
      <section className="m-2 flex justify-center">
        <span className="text-gray-400">Access to uploaded content is restricted to BUT FIT students. If you're not one of them, you're hereby asked to leave.</span>
      </section>
    </main>
  );
}