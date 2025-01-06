'use client'

import React, { useEffect, useState } from 'react';
import Header from '../Header';
import { useParams, useSearchParams } from 'next/navigation';
import { TranscriptLine } from '../types';
import { getTranscript } from '../client';
import Transcript from '../Transcript';

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
		getTranscript(params.basename).then((lines) => {
			setLines(lines)
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

			videoPlayer.currentTime = time;

			setVideoPlayer(videoPlayer);
			videoPlayer.addEventListener('timeupdate', () => {
				setCurrentTime(videoPlayer.currentTime);
			})
		}
	}, [time]);

	return (
		<main>
			<Header />
			<div className="flex flex-col">
				<section className="grid grid-cols-10">
					<div className="col-span-6">
						<Player basename={params.basename} />
					</div>
					<div className="col-span-4">
						<i className="text-gray-400">click on lines of the transcript to time travel</i>
						<Transcript
							scrollable
							lines={lines}
							currentTime={currentTime}
							changeTime={changeTime}
						/>
					</div>
				</section>
				<section className="m-2 flex justify-center">
					<span className="text-gray-400">Access to uploaded content is restricted to BUT FIT students. If you&apos;re not one of them, you&apos;re hereby asked to leave.</span>
				</section>
			</div>
		</main>
	);
}

export default Home;
