'use client'

import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import Header from '../Header';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';

type Timestamp = {
	start: number
	end: number
}

type TranscriptLine = {
	id: number
	text: string
	timestamp: Timestamp
}

const Transcript = ({ lines, currentTime, changeTime }: { lines: TranscriptLine[]; currentTime: number; changeTime: (val: number) => void }) => {
	const router = useRouter()
	const pathname = usePathname();

	useEffect(() => {
		const line = lines.find((line) => currentTime >= line.timestamp.start && currentTime < line.timestamp.end)
		if (!line) return;
		const span = document.getElementById(line.id.toString());
		if (!span) return;
		const transcript = document.getElementById("transcript")
		if (!transcript) return;
		transcript.scrollTo({
			behavior: "smooth",
			top: span.offsetTop - transcript.clientHeight / 2
		})
	}, [currentTime, lines]);

	return (
		<section id="transcript" className="m-2 overflow-y-auto max-h-[calc(100vh-8vh)]">
			{lines.map((line: TranscriptLine) =>
				<span id={line.id.toString()} key={line.id} className={
					classNames("hover:cursor-pointer hover:text-lime-100",
						{
							"text-gray-400": currentTime >= line.timestamp.start && currentTime < line.timestamp.end
						})} onClick={() => {
							changeTime(line.timestamp.start)
							router.push(pathname + '?t=' + line.timestamp.start)
						}}>
					{line.text}{" "}
				</span>)}
		</section>
	)
}

const Player = ({ basename }: { basename: string; }) => {
	return (
		<section key="player" className="m-2">
			<video id="player" playsInline controls preload="metadata">
				<source src={`/videos/${basename}.mp4`} type="video/mp4" />
			</video>
		</section>
	);
}

const Home = () => {
	const [lines, setLines] = useState<TranscriptLine[]>([]);

	const params = useParams<{ basename: string }>();

	useEffect(() => {
		fetch(`/videos/${params.basename}.json`).then(async (response) => {
			if (response.status !== 200) return;

			const json = await response.json();

			const imported = (json as ({
				id: number;
				text: string;
				timestamp: number[];
			}[]));

			console.log('loaded lines')
			setLines(imported.map((v) => {
				return {
					text: v.text,
					id: v.id,
					timestamp: {
						start: v.timestamp[0],
						end: v.timestamp[1]
					}
				} as TranscriptLine;
			}));
		});
	}, [params.basename]);

	const [videoPlayer, setVideoPlayer] = useState<HTMLVideoElement | null>(null);

	const changeTime = (time: number) => {
		if (!videoPlayer) return
		videoPlayer.currentTime = time
	}

	const searchParams = useSearchParams()

	const time = searchParams.has('t') ? Number(searchParams.get('t')) : 0;

	const [currentTime, setCurrentTime] = useState<number>(time);

	useEffect(() => {
		const player = document.getElementById("player")
		if (player) {
			const videoPlayer: HTMLVideoElement = player as HTMLVideoElement;

			// todo: uncomment
			videoPlayer.muted = true;
			videoPlayer.currentTime = currentTime;

			setVideoPlayer(videoPlayer);
			videoPlayer.addEventListener('timeupdate', () => {
				setCurrentTime(videoPlayer.currentTime);
			})
		}
	}, [currentTime]);

	return (
		<main>
			<Header />
			<div className="grid grid-cols-10">
				<div className="col-span-6">
					<Player basename={params.basename} />
				</div>
				<div className="col-span-4">
					<Transcript lines={lines} currentTime={currentTime} changeTime={changeTime} />
				</div>
			</div>
		</main>
	);
}

export default Home;
