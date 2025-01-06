# InViT

Create and view transcriptions alongside the original video.

## Create transcriptions

**Install**

`pip install -r requirements.txt`

**Run**

`py transcribe.py video.mp4 ./ --json` \
*creates transcription video.json*

Available formats: `json`, `srt`

## WebUI

Requirements:
- js runtime (node / bun)

**Install**

`bun install`

**Run**

`bun run start`

Videos and transcriptions will be loaded from the `/public/videos` folder. Transcriptions (`.json`) and videos (`.mp4`) are expected to have the same name.
