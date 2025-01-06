# Use a pipeline as a high-level helper
# Code for transformers/whisper taken from huggingface.
from transformers import pipeline
import argparse
import orjson
import ffmpeg
from typing import NamedTuple
import os
import regex as re
import shutil
import glob

class Chunk(NamedTuple):
	text: str
	timestamp: tuple[float, float]

class ProcessedChunk:
	def __init__(self):
		self.id: int = None
		self.text: str = None
		self.timestamp: tuple[float, float] = None

	def __repr__(self):
		return self.__str__()

	def __str__(self):
		return f'ProcessedChunk[id={self.id},timestamp={str(self.timestamp)},text={self.text}]'

correct_timestamps = False

# fix timestamps (from slices to real time)
# chunks are in 30-second slices, fix timestamps according to their slices
# assign ids to chunks
def parse_chunks(chunks: list[Chunk], duration: float) -> list[ProcessedChunk]:
	id = 0

	p_chunks: list[ProcessedChunk] = []

	last_high = -1
	real_time = 0

	for chunk in chunks:
		timestamp = chunk['timestamp']

		p_chunk = ProcessedChunk()
		p_chunk.id = id
		p_chunk.text = chunk['text'].strip()

		high_time = timestamp[1] if timestamp[1] is not None else duration

		if correct_timestamps == True:
			# if the low time is lower than the last high, we're in a new time slice
			if timestamp[0] < last_high:
				last_high = -1
				real_time += 30

			p_chunk.timestamp = (real_time + timestamp[0], real_time + high_time)
		else:
			p_chunk.timestamp = (timestamp[0], high_time)

		p_chunks.append(p_chunk)
		id = id + 1

	return p_chunks

hallucination_keywords = [
	'Titulky vytvořil',
	'JohnnyX'
]

# filter out most common hallucinations
def filter_hallucinations(chunks: list[ProcessedChunk]):
	c = 0
	for i in range(len(chunks)):
		if i >= len(chunks):
			break

		chunk = chunks[i]
		for keyword in hallucination_keywords:
			if keyword in chunk.text:

				# now, this could be embedded in a multi-sentence translation
				# so remove only the one sentence that contains it

				ids = [m.start(0) for m in re.finditer(r'[!?.]', chunk.text)]
				sentences = []
				last = 0
				for id in ids:
					sentence = chunk.text[last:id + 1]
					last = id + 1
					sentences.append(sentence.strip())

				if last != len(chunk.text):
					sentences.append(chunk.text[last:].strip())

				if len(sentences) == 1:
					print(f'Removed whole chunk \'{chunk.text}\'')
					c = c + 1
					del chunks[i]
					i = i - 1
					break

				removed = []

				for j in range(len(sentences)):
					if j >= len(sentences):
						break
					sentence = sentences[j]

					if keyword in sentence:
						removed.append(sentence)
						del sentences[j]
						j = j - 1
				
				result = ' '.join(sentences)
				c = c + 1

				print(f'Removed hallucinations \'{removed}\' from \'{chunk.text}\' resulting in \'{result}\'')
				chunk.text = result
				break
	return c


# convert timestamp of [seconds, seconds] to srt format
# HH:mm:ss.SS --> HH:mm:ss.SS
def timestamp_to_srt(time: float):

	hours = int(time / 3600)
	time = time - hours * 3600.0
	minutes = int(time / 60)
	seconds = time - minutes * 60.0

	# srt requires a comma for decimals
	return f'{int(hours):0>2}:{int(minutes):0>2}:{seconds:06.3f}'.replace('.', ',')

# dump srt to a file from chunks
def dump_to_srt(chunks: list[ProcessedChunk], filename):
	with open(filename, mode="w+", encoding='utf-8') as fp:
		for chunk in chunks:
			fp.write(str(chunk.id))
			fp.write('\n')
			fp.write(f'{timestamp_to_srt(chunk.timestamp[0])} --> {timestamp_to_srt(chunk.timestamp[1])}')
			fp.write('\n')
			fp.write(chunk.text)
			fp.write('\n\n')
	print(f'{filename} done')

def default(obj):
	if isinstance(obj, ProcessedChunk):
		return obj.__dict__
	raise TypeError

def dump_to_json(chunks: list[ProcessedChunk], filename):
	with open(filename, mode="w+", encoding='utf-8') as fp:
		fp.write(orjson.dumps(chunks, default=default).decode('utf-8'))
	print(f'{filename} done')

# produce an mp3 at the same location using ffmpeg
def mp4_to_mp3(input, output):
	mp4 = ffmpeg.input(input)
	out = ffmpeg.output(mp4, output)
	out = out.global_args('-hwaccel', 'cuda')
	out = out.overwrite_output()
	out.run()

def transcribe_whisper(file: str):
	pipe = pipeline(
		"automatic-speech-recognition",
		model="openai/whisper-large-v3-turbo"
	)

	result = pipe(
		file,
		generate_kwargs={"language": "czech"},
		chunk_length_s=30,
		batch_size=2,
		return_timestamps=True
	)

	return result['chunks']

def main():
	parser = argparse.ArgumentParser(
		prog='transcribe',
		description='Create .srt transcriptions of .mp4 files.'
	)
	parser.add_argument('input', help='.mp4/.mp3 input file. can be a glob pattern.')
	parser.add_argument('output', help='output dir')
	parser.add_argument('-m', '--move-input', help='move src file to out folder along with output', action='store_true', default=False)
	parser.add_argument('--json', help='output a json file', default=False, action='store_true')
	parser.add_argument('--srt', help='output a srt file', default=False, action='store_true')

	args = parser.parse_args()

	out_dir = args.output

	if os.path.isdir(out_dir) == False:
		print('Creating out dir ' + out_dir)
		os.makedirs(out_dir)

	files = glob.glob(args.input)

	print(files)

	for input_file in files:

		print('Processing ' + input_file)

		if input_file.endswith('.mp3'):
			mp3_path = input_file
		else:
			mp3_path = input_file.replace('.mp4', '.mp3')

		if os.path.isfile(mp3_path) == False:
			mp4_to_mp3(input_file, mp3_path)
		else:
			print(f'{mp3_path} file already exists, using it')

		chunks = transcribe_whisper(mp3_path)

		duration = float(ffmpeg.probe(mp3_path)['format']['duration'])

		p_chunks = parse_chunks(chunks, duration)

		count = filter_hallucinations(p_chunks)
		print(f'Removed {count} hallucination(s)...')

		basename = os.path.splitext(os.path.basename(input_file))[0]

		path = os.path.join(out_dir, basename)
		if args.json == True:
			dump_to_json(p_chunks, f'{path}.json')
		if args.srt == True:
			dump_to_srt(p_chunks, f'{path}.srt')

		if args.move_input == True:
			shutil.copy(input_file, out_dir)
			print('Copied input to out folder ' + out_dir)

	print('Done')

if __name__ == '__main__':
	main()
