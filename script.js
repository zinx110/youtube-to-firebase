const { ytdown } = require("nayan-media-downloader")
const { initializeApp, cert } = require("firebase-admin/app");
const admin = require('firebase-admin');
const { https } = require('follow-redirects');


// Initialize Firebase
const serviceAccount = require("./.secrets/serviceAccountKey.json");
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "shop-project-342e5.appspot.com",
});

async function downloadAndUpload(youtubeURL, uploadPath) {
    const bucket = admin.storage().bucket()
  const file = bucket.file(uploadPath);
  // Temporary file path
  try {
    let URL = await ytdown(youtubeURL)
    const downloadURL = URL?.data?.video||""
    console.log(downloadURL)


     https.get(downloadURL, (response) => {
        if (response.statusCode === 200) {
  
            const firebaseStream = file.createWriteStream({contentType:"video/mp4"})
            response.pipe(firebaseStream);

            firebaseStream.on("finish",()=>console.log("Uploading in firebase done"))
            
            firebaseStream.on('error', (error) => {
                console.error('Error during download:', error);
            });
        } else {
        console.error('Failed to download video. Status Code:', response.statusCode);
        }
        }).on('error', (error) => {
            console.error('Error making request:', error);
        });
   
  } catch (error) {
    console.error("Error during process:", error);
  } 
}

// Example usage
downloadAndUpload(
  "https://www.youtube.com/watch?v=FAyKDaXEAgc",
  "uploaded_video/vid2.mp4"
);
