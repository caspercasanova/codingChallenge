import { promises as fs } from 'fs';
import * as path from 'path';

// convert to class and return errors

type mutatorFunction = () => void; // https://www.typescriptlang.org/docs/handbook/2/functions.html
class BMPBuffer {
  imagePath: string | null;
  ogImageBuffer: Buffer;
  negativeBuffer: null | Buffer;
  bitsPerPixel: number;
  fileName: string | null;
  offset: number;

  constructor(bufferSamp: Buffer) {
    this.imagePath = null;
    this.fileName = null;
    this.ogImageBuffer = bufferSamp;
    this.negativeBuffer = null;
    this.bitsPerPixel = 24;
    this.offset = 0;
  }

  setImagePath(pathToPic: string) {
    try {
      this.imagePath = path.join(path.dirname(__dirname), `${pathToPic}`);
      this.fileName = path.basename(this.imagePath);
    } catch (err) {
      console.error(String(err));
      let errMsg = new Error('Please Provide A Correct Path To The File');
      return { err, errMsg };
    }
  }

  async getBMPBuffer(imagePath: string) {
    console.log('Reading File');
    try {
      const data = await fs.readFile(imagePath);
      const buffer = Buffer.from(data);
      return buffer;
    } catch (err) {
      throw new Error('The URL Is Incorrect or File Reading Failed');
      return null;
    }
  }

  copyBMPHeader(ogBuffer: Buffer, negativeBuffer: Buffer) {
    console.log('Copying ogBMP Header');
    for (let i = 0; i < 54; i++) {
      negativeBuffer[i] = ogBuffer[i];
    }
    console.log('Copying Complete', negativeBuffer);
  }

  async createNegativeBMP(): Promise<any> {
    this.negativeBuffer = Buffer.alloc(this.ogImageBuffer!.length);

    this.copyBMPHeader(this.ogImageBuffer!, this.negativeBuffer);

    // traverse and inverse colors
    let start = this.offset;
    for (let i = start; i < this.negativeBuffer.length; i += 3) {
      let r = this.ogImageBuffer.readUInt8(i);
      let g = this.ogImageBuffer.readUInt8(i + 1);
      let b = this.ogImageBuffer.readUInt8(i + 2);
      const { newR, newG, newB } = this.invertRGB(r, g, b); // need to convert to base 64 i believe

      this.negativeBuffer.writeUInt8(newR, i);
      this.negativeBuffer.writeUInt8(newG, i + 1);
      this.negativeBuffer.writeUInt8(newB, i + 2);
    }

    // write bmp file utilizing negative buffer
    let img = await this.writeImage(this.negativeBuffer);

    return img;
    // cleanup?
  }

  writeImage = (buffer: Buffer, fileName: string = 'sick') => {
    return fs.writeFile(`${fileName}-negative.bmp`, buffer);
  };

  invertRGB(r: number, g: number, b: number) {
    let newR: number = 255 - r;
    let newG: number = 255 - g;
    let newB: number = 255 - b;

    return { newR, newG, newB };
  }

  imageIsBMP(buffer: Buffer) {
    console.log(
      'Buffer Image is BMP FORMAT',
      buffer.toString('utf-8', 0, 2) == 'BM'
    );
    return buffer.toString('utf-8', 0, 2) == 'BM';
  }

  analyzeBMP(buffer: Buffer) {
    console.log('Analyzing...');
    if (!this.imageIsBMP(buffer)) {
      throw Error('File is not a BMP format');
      return null;
    }

    let headerData = this.extractBMPHeader(buffer);
    console.log('Header Data', headerData);
    this.offset = headerData.offset;

    try {
      console.log('Confirming BMP Image is 24 BitsPerPixel');
      if (headerData.bitsPerPixel !== 24) {
        throw new Error('The Image must be in 24 BPP format');
      }
      console.log('Confirmed');
    } catch (err) {
      console.log('Uh Oh...', err);
      return null;
    }
  }

  extractBMPHeader(buffer: Buffer) {
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

    // Check to make sure the Bits Per Pixel is 24

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
  }
}

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

const readAndCreateNegative = async () => {
  let imagePath = path.join(
    path.dirname(__dirname),
    `${'/images/sample_1280x853.bmp'}`
  );

  console.log(imagePath);

  let buffer = await getBMPBuffer(imagePath);

  let bmp;

  if (buffer) {
    bmp = new BMPBuffer(buffer);
  }
  bmp?.analyzeBMP(bmp.ogImageBuffer);
  let negative = await bmp?.createNegativeBMP();
  console.log(negative);
};
readAndCreateNegative();
