import { promises as fs } from 'fs';
import * as path from 'path';

// convert to class and return errors
const imageLocation = path.join(
  path.dirname(__dirname),
  // '/images/sample_1280x853.bmp'
  '/images/testPic001.bmp'
);
const getImageBuffer = async () => {
  const data = await fs.readFile(imageLocation);
  const buffer = Buffer.from(data);
  console.log(buffer);
  return buffer;
};

const copyBufferHeader = (ogBuffer: Buffer, newBuffer: Buffer) => {
  for (let i = 0; i < 54; i++) {
    newBuffer[i] = ogBuffer[i];
  }
};

const readBufferHeader = (buffer: Buffer) => {
  let pos = 2;
  let fileSize = buffer.readUInt32LE(pos); // (54 bytes header + 16 bytes data)
  pos += 4;
  let reserved = buffer.readUInt32LE(pos);
  pos += 4;
  let offset = buffer.readUInt32LE(pos);
  pos += 4;
  let headerSize = buffer.readUInt32LE(pos); // number of bytes in the db header from this point
  pos += 4;
  let width = buffer.readUInt32LE(pos);
  pos += 4;
  let height = buffer.readInt32LE(pos);
  pos += 4;
  let planes = buffer.readUInt16LE(pos);
  pos += 2;
  let bitsPerPixel = buffer.readUInt16LE(pos); // 24 bits
  pos += 2;
  let compress = buffer.readUInt32LE(pos);
  pos += 4;
  let rawSize = buffer.readUInt32LE(pos); // Size of the raw bitmap data (including padding) filesize - offset
  pos += 4;
  let hr = buffer.readUInt32LE(pos); // Horizontal Rez
  pos += 4;
  let vr = buffer.readUInt32LE(pos); // Vertical Rez
  pos += 4;
  let colors = buffer.readUInt32LE(pos);
  pos += 4;
  let importantColors = buffer.readUInt32LE(pos); //32h  zero important colors means all colors are important
  // pos += 4; // Start of pixel array (bitmap data)
  // let redPixel = buffer.readUInt2

  // console.log(pos, buffer.readUInt8(pos)); // 33
  // console.log(pos, buffer.readUInt8(pos++)); // 34
  // console.log(pos, buffer.readUInt8(pos++)); // 35
  // console.log(pos, buffer.readUInt8(pos++)); // 36
  // console.log(pos, buffer.readUInt8(pos++)); // 37
  // console.log(pos, buffer.readUInt8(pos++)); // 38
  // console.log(pos, buffer.readUInt8(pos++)); // 39
  // console.log(pos, buffer.readUInt8(pos++)); // 40
  return {
    fileSize,
    reserved,
    offset,
    headerSize,
    width,
    height,
    planes,
    bitsPerPixel,
    compress,
    rawSize,
    hr,
    vr,
    colors,
    importantColors,
  };
};

const manipulateBuffer = (buffer: Buffer) => {
  const start = 54;
  const finish = 1077;
  var num = 1;
  for (let i = start; i <= finish; i++) {
    if (num % 4 !== 0) buffer[i] = 255 - buffer[i];
    num++;
  }
};

const traverseBuffer = (buffer: Buffer) => {
  let start = 54;
  for (let i = start; i < buffer.length; i += 3) {
    let r = buffer.readUInt8(i);
    let g = buffer.readUInt8(i + 1);
    let b = buffer.readUInt8(i + 2);
    const { newR, newG, newB } = invertRGB(r, g, b);
    buffer[i] = newR;
    buffer[i + 1] = newG;
    buffer[i + 2] = newB;
  }
};

const invertRGB = (r: number, g: number, b: number) => {
  let newR: number = 255 - r;
  let newG: number = 255 - g;
  let newB: number = 255 - b;

  return { newR, newG, newB };
};

const createImage = async (buffer: Buffer) => {
  await fs.writeFile('negativeImage.bmp', buffer);
};

const convertImage = async () => {
  let originalImageBuffer = await getImageBuffer();

  if (originalImageBuffer.toString('utf-8', 0, 2) != 'BM') {
    throw new Error('The File Format Must Be in a .BMP');
    return null;
  }

  //  const bufferHeader = readBufferHeader(originalImageBuffer);

  let bufferCopy: Buffer = Buffer.alloc(originalImageBuffer.length);

  copyBufferHeader(originalImageBuffer, bufferCopy);

  console.log(
    bufferCopy,
    originalImageBuffer[originalImageBuffer.length - 1],
    bufferCopy[bufferCopy.length - 1]
  );
  // manipulateBuffer(bufferCopy);
  // createImage(bufferCopy);
};

convertImage();

const toBase64 = (arr: any[]) => {
  //arr = new Uint8Array(arr) if it's an ArrayBuffer
  return arr.reduce(
    (data, byte) => data + String.fromCharCode(byte),
    ''
  );
};
