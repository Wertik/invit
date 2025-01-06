import { NextResponse } from "next/server";
import fs from "fs/promises"
import path from "path"

export async function GET() {
	const files = await fs.readdir('public/videos')

	return NextResponse.json(files.map((file) => path.parse(file).name)
		.filter((file, index, array) => {
			return array.indexOf(file) == index;
		}))
}
