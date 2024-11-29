const Jimp = require("jimp");

const testJimp = async () => {
  const imagePath = "./tmp/1732837694220-cica2.jpg"; // Ścieżka do pliku tymczasowego
  try {
    const image = await Jimp.read(imagePath);
    console.log("Image loaded successfully");

    const outputPath = "./tmp/test-output.jpg"; // Ścieżka wyjściowa
    await image.resize(250, 250).writeAsync(outputPath);
    console.log("Image resized and saved to:", outputPath);
  } catch (error) {
    console.error("Error processing image:", error.message);
  }
};

testJimp();
