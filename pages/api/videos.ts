// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import busboy from "busboy";
import fs from "fs";
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

function uploadVideoStream(req: NextApiRequest, res: NextApiResponse) {
  const bb = busboy({ headers: req.headers });

  bb.on("file", (_, file, info) => {
    // auth-api.mp4
    const fileName = info.filename;
    const filePath = `./videos/${fileName}`;

    const stream = fs.createWriteStream(filePath);

    file.pipe(stream);
  });

  bb.on("close", () => {
    res.writeHead(200, { Connection: "close" });
    res.end(`That's the end`);
  });

  req.pipe(bb);
  return;
}

const CHUNK_SIZE_IN_BYTES = 1000000; // 1 mb

function getVideoStream(req: NextApiRequest, res: NextApiResponse) {
  const range = req.headers.range;

  if (!range) {
    return res.status(400).send("Rang must be provided");
  }

  const videoId = req.query.videoId;

  const videoPath = `./videos/${videoId}.mp4`;

  const videoSizeInBytes = fs.statSync(videoPath).size;

  const chunkStart = Number(range.replace(/\D/g, ""));

  const chunkEnd = Math.min(
    chunkStart + CHUNK_SIZE_IN_BYTES,
    videoSizeInBytes - 1
  );

  const contentLength = chunkEnd - chunkStart + 1;

  const headers = {
    "Content-Range": `bytes ${chunkStart}-${chunkEnd}/${videoSizeInBytes}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, {
    start: chunkStart,
    end: chunkEnd,
  });

  videoStream.pipe(res);
}

function getVideoFiles(req: NextApiRequest, res: NextApiResponse) {
  const videosFolderPath = path.join(process.cwd(), 'videos');

  try {
    const files = fs.readdirSync(videosFolderPath);
    const videoFiles = files.map((file, index) => ({
      id: index.toString(),
      title: file,
      url: `/videos/${file}`,
    }));
    res.status(200).json(videoFiles);
    console.log('videoFiles:' , videoFiles);
  } catch (err) {
    console.error('Error reading videos folder:', err);
    res.status(500).json({ error: 'Error reading videos folder' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  if (method === "GET" && req.url === '/api/videos') {
    return getVideoFiles(req, res);
  }
  
  if (method === "GET") {
    return getVideoStream(req, res);
  }

  if (method === "POST") {
    return uploadVideoStream(req, res);
  }

  return res.status(405).json({ error: `Method ${method} is not allowed` });
}


