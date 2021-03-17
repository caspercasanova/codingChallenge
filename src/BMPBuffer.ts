import { promises as fs } from 'fs';
import * as path from 'path';
// https://betterprogramming.pub/how-to-write-an-async-class-constructor-in-typescript-javascript-7d7e8325c35e
// https://stackoverflow.com/questions/35743426/async-constructor-functions-in-typescript
type mutatorFunction = () => void; // https://www.typescriptlang.org/docs/handbook/2/functions.html

class BMPBuffer {
  // type definitions
  // TODO add function types
  imagePath: string | null;
  ogImageBuffer: Buffer;
  negativeBuffer: null | Buffer;
  bitsPerPixel: number;
  fileName: string | null;
  offset: number;
  errors: string[];
  compressionMethod: null | 0;

  constructor(bufferSamp: Buffer) {
    this.imagePath = null;
    this.fileName = null;
    this.ogImageBuffer = bufferSamp;
    this.negativeBuffer = null;
    this.bitsPerPixel = 24;
    this.offset = 0;
    this.compressionMethod = null;
    this.errors = [];
  }

  init() {}

  setImagePath(pathToPic: string): void {
    try {
      this.imagePath = path.join(path.dirname(__dirname), `${pathToPic}`);
      this.fileName = path.basename(this.imagePath);
    } catch (err) {
      console.error('Please Provide A Correct Path To The File');
      this.errors.push('Incorrect Path To Image');
    }
  }

  async getBMPBuffer(imagePath: string) {
    console.log('Reading File');
    try {
      const data = await fs.readFile(imagePath);
      const buffer = Buffer.from(data);
      return buffer;
    } catch (err) {
      console.error('Reading the file failed');
      this.errors.push('File Reading Failed');
    }
  }

  copyBMPHeader(ogBuffer: Buffer, negativeBuffer: Buffer) {
    console.log('Copying ogBMP Header');
    for (let i = 0; i < 54; i++) {
      negativeBuffer[i] = ogBuffer[i];
    }
    console.log('Copying Complete', negativeBuffer);
  }

  mutateNegativeBufferColors() {
    let start = this.offset;
    console.log('Mutating the Colors');

    // traverse and inverse colors
    try {
      for (let i = start; i < this.negativeBuffer!.length; i += 3) {
        let r = this.ogImageBuffer.readUInt8(i);
        let g = this.ogImageBuffer.readUInt8(i + 1);
        let b = this.ogImageBuffer.readUInt8(i + 2);

        const { newR, newG, newB } = this.invertRGB(r, g, b);

        this.negativeBuffer!.writeUInt8(newR, i);
        this.negativeBuffer!.writeUInt8(newG, i + 1);
        this.negativeBuffer!.writeUInt8(newB, i + 2);
      }
    } catch (err) {
      console.error('Something Went Wrong When Writing The New Colors');
      this.errors.push('Failed Writing Negative Colors');
    }
  }

  async createNegativeBMP(): Promise<void> {
    // allocate a buffer with equiv space as the ogBuffer
    this.negativeBuffer = Buffer.alloc(this.ogImageBuffer!.length);
    // copy the header values from the ogBuffer to the new buffer
    this.copyBMPHeader(this.ogImageBuffer!, this.negativeBuffer);
    // Might need more checks here

    this.mutateNegativeBufferColors();

    // write bmp file utilizing negative buffer
    try {
      await this.writeImage(this.negativeBuffer);
      console.log('The Creation has completed!');
    } catch (err) {
      console.error('Creation had an error!', String(err));
      this.errors.push('Writing The Negative File To Disk Failed');
    }
  }

  writeImage(buffer: Buffer, fileName: string = 'sick') {
    // write the image to the negatives folder
    return fs.writeFile(
      `${path.dirname(__dirname)}/negatives/${fileName}-negative.bmp`,
      buffer
    );
  }

  invertRGB(r: number, g: number, b: number) {
    let newR: number = 255 - r;
    let newG: number = 255 - g;
    let newB: number = 255 - b;

    return { newR, newG, newB };
  }

  analyzeBMP(buffer: Buffer) {
    console.log('Analyzing Header...');
    const {
      format,
      bitsPerPixel,
      offset,
      compressionMethod,
    } = this.readingBMPHeader(buffer);
    if (format != 'BM') {
      console.error('The File Must be a BMP format');
    } else {
      console.log('The File Format Is Correct!');
    }

    if (bitsPerPixel !== this.bitsPerPixel) {
      console.error('The Image must be in 24 BPP format');
    } else {
      console.log('The Bytes Per Pixel Is Correct!');
    }

    if (compressionMethod != 0) {
      console.error(
        `The Image Must Have No Compression Used\n The Image Currently has the ${compressionMethod} Compression Method`
      );
    } else {
      console.log('Hooray No Compression Was Used!');
    }

    this.offset = offset;
  }

  // Extracts the header from the BMP Image
  // Some values are more important than others
  // Most importantly we need the OFFSET and the BytesPerPixel
  readingBMPHeader(buffer: Buffer) {
    const format = buffer.toString('utf-8', 0, 2);
    let pos = 2;
    const fileSize = buffer.readUInt32LE(pos); // (54 bytes header + 16 bytes data)
    pos += 4;
    const reserved = buffer.readUInt32LE(pos);
    pos += 4;
    const offset = buffer.readUInt32LE(pos);
    pos += 4;
    const headerSize = buffer.readUInt32LE(pos); // number of bytes in the db header from this point
    pos += 4;
    const width = buffer.readUInt32LE(pos);
    pos += 4;
    const height = buffer.readInt32LE(pos);
    pos += 4;
    const planes = buffer.readUInt16LE(pos);
    pos += 2;
    const bitsPerPixel = buffer.readUInt16LE(pos); // 24 bits
    pos += 2;
    const compressionMethod = buffer.readUInt32LE(pos);
    pos += 4;
    const rawSize = buffer.readUInt32LE(pos); // Size of the raw bitmap data (including padding) filesize - offset
    pos += 4;
    const hr = buffer.readUInt32LE(pos); // Horizontal Rez
    pos += 4;
    const vr = buffer.readUInt32LE(pos); // Vertical Rez
    pos += 4;
    const colors = buffer.readUInt32LE(pos);
    pos += 4;
    const importantColors = buffer.readUInt32LE(pos); //32h  zero important colors means all colors are important
    console.log({
      format,
      fileSize,
      reserved,
      offset,
      headerSize,
      width,
      height,
      planes,
      bitsPerPixel,
      compressionMethod,
      rawSize,
      hr,
      vr,
      colors,
      importantColors,
    });
    return {
      format,
      fileSize,
      reserved,
      offset,
      headerSize,
      width,
      height,
      planes,
      bitsPerPixel,
      compressionMethod,
      rawSize,
      hr,
      vr,
      colors,
      importantColors,
    };
  }
}

export default BMPBuffer;
