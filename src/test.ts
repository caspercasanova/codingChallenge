// buf.equals(otherBuffer)
import BMPBuffer from './BMPBuffer';

let image1: BMPBuffer | null = null;
beforeAll(async () => {
  image1 = new BMPBuffer('images/testPic001.bmp');
  await image1.init();
  await image1.createNegativeBMP();
});
let image2: BMPBuffer | null = null;
beforeEach(async () => {
  image2 = new BMPBuffer('negatives/testPic001-negative.bmp');
  await image1!.init();
  await image1!.createNegativeBMP();
});
describe('checks if the negative of a negative photo equals original', function () {
  it('reversed image should match oringal bytes', async () => {
    // the inverted inverted image buffer is contained within the BufferTemp Variable of img 2
    if (image1 && image1?.buffer && image2?.bufferTemp) {
      expect(image1.buffer.equals(image2.bufferTemp)).toBeTruthy();
    }

    // image1.ogImageBuffer.equals(invertedTwicePic.)
  });
});
