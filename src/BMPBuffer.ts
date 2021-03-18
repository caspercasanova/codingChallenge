import { promises as fs } from 'fs';
import * as path from 'path';
type mutatorFunction = () => void; // https://www.typescriptlang.org/docs/handbook/2/functions.html

class BMPBuffer {
  // type definitions
  imagePath: string | null;
  buffer: undefined | Buffer;
  bufferTemp: undefined | Buffer;
  bitsPerPixel: number;
  fileName: string | null;
  offset: number;
  errors: string[];
  compressionMethod: null | 0;

  constructor(pathToPic: string) {
    this.imagePath = null;
    this.fileName = null;
    this.buffer = undefined;
    this.bufferTemp = undefined;
    this.bitsPerPixel = 24;
    this.offset = 0;
    this.compressionMethod = null;
    this.errors = [];
    this.setImagePath(pathToPic);
  }

  async init() {
    this.buffer = await this.getBMPBuffer(this.imagePath!);

    // Checks the Header and assures certain values are correct
    this.analyzeBMP(this.buffer!);
  }

  setImagePath(pathToPic: string): void {
    try {
      this.imagePath = path.join(path.dirname(__dirname), `${pathToPic}`);
      let fName = path.basename(this.imagePath);
      this.fileName = fName.split('.')[0];
      console.log('✅ File has Been Found');
    } catch (err) {
      console.error(
        '❌ The File Couldnt Be Found \n Please Provide A Correct Path To The File'
      );
      this.errors.push('Incorrect Path To Image');
    }
  }

  async getBMPBuffer(imagePath: string) {
    try {
      const data = await fs.readFile(imagePath);
      const buffer = Buffer.from(data);
      console.log('✅ Buffer Data has Been read');
      return buffer;
    } catch (err) {
      console.error('❌ Reading the file failed');
      this.errors.push('File Reading Failed');
    }
  }

  copyBMPHeader(ogBuffer: Buffer, bufferTemp: Buffer): void {
    for (let i = 0; i < 54; i++) {
      bufferTemp[i] = ogBuffer[i];
    }
    console.log('✅ Copying Complete');
  }

  async createNegativeBMP(): Promise<void> {
    if (this.errors.length) {
      console.log('There were errors when creating the image');
      return;
    }
    // allocate a buffer with equiv space as the buffer
    this.bufferTemp = Buffer.alloc(this.buffer!.length);
    // copy the header values from the ogBuffer to the new buffer
    this.copyBMPHeader(this.buffer!, this.bufferTemp);
    // Might need more checks here

    this.mutatebufferTempColors();

    // write bmp file utilizing negative buffer
    try {
      await this.writeImage(this.bufferTemp, this.fileName!);
      console.log('✅ The Creation has completed!');
    } catch (err) {
      console.error('❌ The Creation of the Image had an error!', String(err));
      this.errors.push('Writing The Negative File To Disk Failed');
    }
  }

  writeImage(buffer: Buffer, fileName: string = 'tempPic'): Promise<any> {
    // write the image to the negatives folder
    return fs.writeFile(
      `${path.dirname(__dirname)}/negatives/${fileName}-negative.bmp`,
      buffer
    );
  }

  mutatebufferTempColors(): void {
    let start = this.offset;

    // traverse and inverse colors
    try {
      for (let i = start; i < this.bufferTemp!.length; i += 3) {
        let r = this.buffer!.readUInt8(i);
        let g = this.buffer!.readUInt8(i + 1);
        let b = this.buffer!.readUInt8(i + 2);

        const { newR, newG, newB } = this.invertRGB(r, g, b);

        this.bufferTemp!.writeUInt8(newR, i);
        this.bufferTemp!.writeUInt8(newG, i + 1);
        this.bufferTemp!.writeUInt8(newB, i + 2);
      }
      console.log('✅ Mutating the Colors Complete');
    } catch (err) {
      console.error('❌ Something Went Wrong When Writing The New Colors');
      this.errors.push('Failed Writing Negative Colors');
    }
  }

  invertRGB(r: number, g: number, b: number) {
    let newR: number = 255 - r;
    let newG: number = 255 - g;
    let newB: number = 255 - b;
    return { newR, newG, newB };
  }

  analyzeBMP(buffer: Buffer): void {
    console.log('Analyzing Header...');
    const {
      format,
      bitsPerPixel,
      offset,
      compressionMethod,
    } = this.readBMPHeader(buffer);
    if (format != 'BM') {
      console.error(
        '❌ File Format Incorrect \n(The File Must be a BMP format)'
      );
      this.errors.push('Incorrect Fileformat');
    } else {
      console.log('✅ The File Format Is Correct!');
    }

    if (bitsPerPixel !== this.bitsPerPixel) {
      console.error(
        '❌ The Bytes Per Pixel Is Incorrect \nThe Image must be in 24 BPP format'
      );
      this.errors.push('Incorrect Bytes Per Pixel');
    } else {
      console.log('✅ The Bytes Per Pixel Is Correct!');
    }

    if (compressionMethod != 0) {
      console.error(
        `❌ The Image Compression Is Incorrect \n The Image Must Have No Compression Used \n The Image Currently has the ${compressionMethod} Compression Method`
      );
      this.errors.push('Incorrect Compression');
    } else {
      console.log('✅ Hooray No Compression Was Used!');
    }

    this.offset = offset;
  }

  // Reads the header from the BMP Image
  // Some values are more important than others
  // Most importantly we need the OFFSET and the BytesPerPixel and FORMAT
  readBMPHeader(buffer: Buffer) {
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
