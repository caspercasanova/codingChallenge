import { promises as fs } from 'fs';
import * as path from 'path';
import BMPBuffer from './BMPBuffer';
// https://betterprogramming.pub/how-to-write-an-async-class-constructor-in-typescript-javascript-7d7e8325c35e

const getBMPBuffer = async (imagePath: string) => {
  console.log('Reading File');
  try {
    const data = await fs.readFile(imagePath);
    const buffer = Buffer.from(data);
    return buffer;
  } catch (err) {
    throw new Error('The URL Is Incorrect or File Reading Failed');
    return null;
  }
};

// '/images/sample_1280x853.bmp'
// '/images/testPic001.bmp'
// '/images/sick-negative.bmp'

const readAndCreateNegative = async () => {
  let imagePath = path.join(
    path.dirname(__dirname),
    `${'/images/testPic001.bmp'}`
  );

  console.log(imagePath);

  let buffer = await getBMPBuffer(imagePath);

  let bmp;

  if (buffer) {
    bmp = new BMPBuffer(buffer);
  }
  bmp?.analyzeBMP(bmp.ogImageBuffer);
  await bmp?.createNegativeBMP();
};
readAndCreateNegative();
