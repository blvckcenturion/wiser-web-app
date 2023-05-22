import type { NextApiRequest, NextApiResponse } from 'next';
import { Storage } from '@google-cloud/storage';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
  ) {
    try {
    // Get credentials from environment variables
    const credentials = await JSON.parse(process.env.NEXT_PUBLIC_GCP_CREDENTIALS!);
    // Create a new storage instance with credentials
    const storage = new Storage({ credentials });
    // Get bucket name from environment variables
    const bucketName = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_BUCKET || "";

    // Get file name from request body
    const fileName = req.body.fileName;
    // Get bucket
    const bucket = storage.bucket(bucketName);
    // Get file
    const file = bucket.file(fileName);
    // Check if file exists
    const [fileExists] = await file.exists();
  
    // Throw error if file does not exist
    if (!fileExists) {
      throw new Error(`File, ${fileName}, does not exist.`);
    }
    // Create read stream
    const readStream = file.createReadStream();
    // Create data variable for storing file content
    let data = '';
    // Read file content
    readStream.on('data', (chunk) => {
        data += chunk;
    });
    // Send file content as response when file is read
    readStream.on('end', () => {
        res.status(200).json({ content: data});
        res.end();
    });

    // Send error response when there is an error reading the file
    readStream.on('error', (error) => {
        res.status(500).json({ error: 'There was an error reading the file.' });
        res.end();
    });
      
  
    } catch (error: any) {
      console.log(error)
      res.status(500).json({ error: "Error while loading files." });
      res.end();
    }
  }