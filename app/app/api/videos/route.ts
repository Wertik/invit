import { NextResponse } from "next/server";
import fs from "fs/promises"
import path from "path"

export async function GET() {
	const files = (await fs.readdir('public/videos')).filter((file) => {
		return file.endsWith(".mp4") || file.endsWith(".json");
	})

	return NextResponse.json(files.map((file) => path.parse(file).name)
		.filter((file, index, array) => {
			return array.indexOf(file) == index;
		}))
}
