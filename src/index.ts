import BMPBuffer from './BMPBuffer';

const main = async (imageName: string) => {
  let image = new BMPBuffer(imageName);
  await image.init();
  await image.createNegativeBMP();
};

/* 
  Try any of these sample images. 
  To use your own BMP image 
  - Add a .BMP photo to the images folder and 
  - type the name of the file in a string

  '/images/sample_1280x853.bmp'
  '/images/testPic001.bmp'
 
*/

main('images/testPic001.bmp');
