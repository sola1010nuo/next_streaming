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
  

  if (method === "POST") {
    return uploadVideoStream(req, res);
  }

  return res.status(405).json({ error: `Method ${method} is not allowed` });
}


