"use client"

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { TranscriptLine } from "./types";
import classNames from "classnames";

const Transcript = ({ scrollable, lines, currentTime, changeTime, onClick }: { scrollable?: boolean; lines: TranscriptLine[]; currentTime?: number; changeTime?: (val: number) => void; onClick?: (line: TranscriptLine) => void }) => {
	const router = useRouter()
	const pathname = usePathname();

	useEffect(() => {
		if (currentTime == undefined) return;

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
		<section id="transcript" className={classNames("m-2", { "overflow-y-auto max-h-[calc(100vh-8vh)]": scrollable })}>
			{lines.map((line: TranscriptLine) =>
				<span id={line.id.toString()} key={line.id} className={
					classNames("hover:cursor-pointer hover:text-lime-100",
						{
							"text-gray-400": currentTime !== undefined && currentTime >= line.timestamp.start && currentTime < line.timestamp.end
						})} onClick={() => {
							if (!onClick) {
								if (changeTime) {
									changeTime(line.timestamp.start)
								}
								router.push(pathname + '?t=' + line.timestamp.start)
							} else {
								onClick(line)
							}
						}}>
					{line.text}{" "}
				</span>)}
		</section>
	)
}

export default Transcript;
