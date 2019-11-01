const express = require("express");
const app = express();
const cors = require("cors");
// const debug = require('debug')('myapp:server');
const path = require("path");
const multer = require("multer");
const extract = require("extract-zip");
var fs = require("fs");
const lineReader = require("line-reader");
// const logger = require('morgan');
// const serveIndex = require('serve-index')
const extractPluginPath =
  "/Users/surendranadh/rogue-application/yoofoo_frontend/src/extract_plugins";
const projectFolderPath =
  "/Users/surendranadh/rogue-application/yoofoo_frontend/";

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${extractPluginPath}`);
  },
  filename: (req, file, cb) => {
    console.log("file", file);
    cb(
      null,
      file.originalname //+ "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

//will be using this for uplading
const upload = multer({ storage: storage });

//get the router
// const userRouter =require('./routes/user.route');

// app.use(logger('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(express.static('public'));
// app.use('/ftp', express.static('public'), serveIndex('public', {'icons': true}));

app.get("/", function(req, res) {
  return res.send("hello from my app express server!");
});
function get_line(filename, line_no, callback) {
  var data = fs.readFileSync(filename, "utf8");
  var lines = data.split("\n");

  if (+line_no > lines.length) {
    throw new Error("File end reached without finding line");
  }

  callback(null, lines[+line_no]);
}
app.post("/un-zip", upload.single("file"), function(req, res) {
  // debug(req.file);
  console.log(
    "storage location is ",
    req.hostname + "/" + req.file.path,
    req.file.filename
  );
  const splitFileName = req.file.filename.split(".");
  console.log("Splitted File Name", splitFileName[0]);
  const folder_name = splitFileName[0];
  extract(
    req.file.path,
    {
      dir: `${extractPluginPath}`
    },
    function(err) {
      // extraction is complete. make sure to handle the err
      if (err) throw err;
      //pwd /Users/surendranadh/rogue-application/yoofoo_frontend/src/login/root.component.js
    }
  );

  // Check Manifest file and get menu names and bind to plugin
  const chkManfiestFile = fs
    .readFileSync(`${extractPluginPath}/${splitFileName[0]}/manifest.json`)
    .toString();
  const parseManifest = JSON.parse(chkManfiestFile);
  console.log("----Menu Extraction-----", parseManifest.menu);
  const loadMenuFrmManifest = parseManifest.menu;

  let menuItems = [];
  let importMenuPath = [];
  let routesPath = [];
  loadMenuFrmManifest.map(menuName => {
    // console.log("------Menu List----", menuName.Comissions);
    console.log(Object.entries(menuName));
    for (const [key, value] of Object.entries(menuName)) {
       // "a 5", "b 7", "c 9";
      const splitMenuVal = value.split("./");
      console.log(`${key} ${value}`, splitMenuVal[1]);
      const v = `<li><i className="fa fa-caret-right rightarrow" aria-hidden="true"></i> <Link to="/${splitMenuVal[1]}">${key}</Link></li>`;
      console.log("---Menu Link---", v);
      const itrMenuPath = `import ${key} from "../extract_plugins/${folder_name}/${splitMenuVal[1]}";`;
      const itrRoutePath = `<Route exact path="/${splitMenuVal[1]}" component={${key}} />`
      importMenuPath.push(itrMenuPath);
      routesPath.push(itrRoutePath);
      menuItems.push(v);
    }
  });
  const splitMenuVal = menuItems.join("\n");
  const importMenuVal = importMenuPath.join("\n");
  const routesPathVal = routesPath.join("\n");
  const formatMenu = `<Card>
                          <Accordion.Toggle as={Card.Header} eventKey="3">
                            ${parseManifest.plugin_name} <i className="fa fa-angle-down dwnarrow" aria-hidden="true"></i>
                          </Accordion.Toggle>
                          <Accordion.Collapse eventKey="3">
                            <Card.Body>
                              <div className="leftnavlinks">
                                <ul>
                                  <input type="hidden" id="3" />
                                  ${splitMenuVal}
                                </ul>
                              </div>
                            </Card.Body>
                          </Accordion.Collapse>
                        </Card>`;
  const sidNavPlug = fs
    .readFileSync(`${projectFolderPath}src/login/sidebar.js`)
    .toString();
  //.split("\n");
  //Sub menu adding -----------------------
  const sideNavAppendData = `<input type="hidden" id="1" />`;  
  const indxOfSideNav = sidNavPlug.indexOf(sideNavAppendData);
  //const newDta =sidNavPlug.substr(0, indxOfSideNav+sideNavAppendData.length) + "\n" +splitMenuVal + (sidNavPlug.substr(indxOfSideNav+sideNavAppendData.length));
  //Sub menu adding -----------------------
  // sidNavPlug.slice(
  //   indxOfSideNav,
  //   0,
  //   splitMenuVal
  // );
  
  //var webtext1 = sidNavPlug.join("\n");
  const findtext = "</Accordion>";
  const lastIndex = sidNavPlug.lastIndexOf(findtext);
  const lastindexData =
    sidNavPlug.substr(0, lastIndex) +
    formatMenu +
    "\n" +
    sidNavPlug.substr(lastIndex);
  fs.writeFile(
    `${projectFolderPath}src/login/sidebar.js`,
    lastindexData,
    function(err) {
      if (err) return console.log(err);
    }
  );
  // import CommissionsScreen from "../extract_plugins/comission/comission-screen";

  const dataPlugin = fs
    .readFileSync(`${projectFolderPath}src/login/root.component.js`)
    .toString()
    .split("\n");

  // console.log('fileLine', fileLine);
  const appendData = importMenuVal;
  var dta = dataPlugin.indexOf(appendData);
  if (dta === -1) {
    dataPlugin.splice(
      dataPlugin.findIndex(x => x === "  constructor() {") - 2,
      0,
      appendData
    );
    dataPlugin.splice(
      dataPlugin.findIndex(x => x === "      </HashRouter>") - 1,
      0,
      routesPathVal
    );
    var webtext = dataPlugin.join("\n");
    //const text = fileArray.join("\n");
    fs.writeFile(
      `${projectFolderPath}src/login/root.component.js`,
      webtext,
      function(err) {
        if (err) return console.log(err);
      }
    );
  }

  return res.send(req.file);
});

app.post("/uninstallapp", function(req, res) {
  console.log("Request ", req.body);
  const pa = "/commissions";
  const dataPlugin = fs
    .readFileSync(`${projectFolderPath}src/login/root.component.js`)
    .toString()
    .split("\n");
  const a = req.body;
  const appendData = `import CommissionsScreen from "../extract_plugins/comission/comission-screen";`;
  const routPathData = `<Route exact path="${pa}" component={CommissionsScreen} />`;
  const inxOfRoutePath = dataPlugin.indexOf(routPathData);
  var dta = dataPlugin.indexOf(appendData);
  if (dta !== -1 && inxOfRoutePath !== -1) {
    var test = dataPlugin.splice(dta, 1);

    var webtext = dataPlugin.join("\n");
    //const text = fileArray.join("\n");
    var test1 = dataPlugin.splice(inxOfRoutePath - 1, 1);
    var webtext = dataPlugin.join("\n");
    fs.writeFile(
      `${projectFolderPath}src/login/root.component.js`,
      webtext,
      function(err) {
        if (err) return console.log(err);
      }
    );
  }
  const sidNavPlugDt = fs
    .readFileSync(`${projectFolderPath}src/login/sidebar.js`)
    .toString()
    .split("\n");
  const sideMenuPath = `<li><i className="fa fa-caret-right rightarrow" aria-hidden="true"></i> <Link to="/commissions">COMMISSIONS</Link></li>`;
  const inxOfSideMenuPath = sidNavPlugDt.indexOf(sideMenuPath);
  var side1 = sidNavPlugDt.splice(inxOfSideMenuPath, 1);
  var side2 = sidNavPlugDt.join("\n");
  fs.writeFile(`${projectFolderPath}src/login/sidebar.js`, side2, function(
    err
  ) {
    if (err) return console.log(err);
  });

  return res.send("test");
});
//if end point is /users/, use the router.
// app.use('/users', userRouter);

const port = process.env.PORT || 9002;
app.listen(port, () => {
  console.log("Server is up and running on port ", port);
});

// const path = require("path");
// const multer = require("multer");
// const express = require("express");
// const cors = require("cors");
// var fs = require("fs");
// const unzip = require("unzip")

// const app = express();

// console.log("Server Started");
// app.use(cors());
// app.use(express.json());
// // app.use(bodyParser);
// const storage = multer.diskStorage({
//   destination: `/Users/surendranadh/rogue-application/yoofoo_frontend/src/extract_plugins`,
//   filename: function (req, file, cb) {
//     // cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
//     cb(null, file.originalname);
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 1000000 }
// }).single("file");

// app.get('/hello', function(req, res){
//    res.send("Hello World!");
// });

// app.post("/un-zip", async function (req, res) {
//   upload(req, res, async function (err) {

//     if(err) throw err;

//     if(req.file){
//       console.log("The current working directory is " + req.file.path);
//       // console.log('path----', "*********", req.files.upload.path)
//       // var filepath = path.join(req.file.destination, req.file.filename);
//       // const splitextension = req.file.filename.split(".");
//       // const dir = req.file.destination + "/" + splitextension[0];
//       fs.createReadStream(req.file.originalname).pipe(unzip.Extract({ path: '/Users/surendranadh/rogue-application/yoofoo_frontend/src/extract_plugins/' }));
//     }
//   })
// })

// app.listen(9002);
