import extract from "extract-zip";
import multer from "multer";


const storage = multer.diskStorage({
    destination:"/Users/surendranadh/rogue-application/yoofoo_frontend/src/extract_plugins",
    filename: function (req, file, cb) {
      // cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
      cb(null, file.originalname);
    }
  });
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }
  }).single("myImage");

export const unzipFolder = (req, h) => {
  try {
    const data = req.payload;
    console.log('File-----', data.file);
    extract("/Users/surendranadh/Downloads/UploadFile.zip", { dir: "/Users/surendranadh/rogue-application/yoofoo_frontend/src/extract_plugins" }, function(
        err
      ) {
        // extraction is complete. make sure to handle the err
        if (err) return console.log(err);
        else return "File Extracted";
      });
    
    // upload(req, res, async function (err) {
        // if (req.file) {
            // const data = request.payload;
            // console.log('req.file', data.file.hapi.filename);
            // var filepath = path.join(req.file.destination, req.file.filename);
            
        // }
        
    // })
    
    return "File Extracted";
  } catch (error) {
    return h.response(error).code(500);
  }
};
