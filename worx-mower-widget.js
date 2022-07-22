// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: robot;
// name: worx-mower-widget.js
// description: A scriptable widget which displays the latest information from your worx landmower
// original author: Matthes Schlichte
// email: matthes@schlichte.dev

// Credentials (Kann hier per Hand gesetzt werden oder über die Scriptable Widget Parameter (siehe GitHub Repo))//
let c_email = "";
let c_password = "";
let c_deviceId = "";
let c_client_secret = "";

let argInput = args.widgetParameter;

if (argInput !== null) {
  [c_email, c_password, c_deviceId, c_client_secret] = argInput.split("|");
} else if (c_email !== null || c_password !== null || c_deviceId !== null) {
  throw new Error(
    "Es müssen Parameter angegeben werden, falls du hier Probleme hast schaue gerne nochmal in die GitHub Repo"
  );
}
////////////////

// CONFIG ZONE //
let UpdateTimeInterval = 180; //In Sekunden

//DONT CHANGE ANYTHING ! OWN RISK //
let scriptURL =
  "https://raw.githubusercontent.com/oza-c/Worx-Widget/main/worx-mower-widget.js";
let PARAM = args.widgetParameter;
let fm = FileManager.iCloud();
let uCheck = await updateCheck(1.0);
log(`${uCheck} to update available`);
////////////////////////////////////

//// Images //////////////////////////////////
let imgs = {
  status_1:
    "https://raw.githubusercontent.com/oza-c/Worx-Widget/main/images/Status_1.png?token=GHSAT0AAAAAABWYJFXGSJ35FBT2YIBZZCPWYWZRBZA",
  status_4:
    "https://raw.githubusercontent.com/oza-c/Worx-Widget/main/images/Status_4.png?token=GHSAT0AAAAAABWYJFXHTAATUF2WCBEDEGCMYWZRCHQ",
  status_7:
    "https://raw.githubusercontent.com/oza-c/Worx-Widget/main/images/Status_7.png?token=GHSAT0AAAAAABWYJFXGMA2M7MBCFKHNMHNOYWZRC2A",
  status_error:
    "https://raw.githubusercontent.com/oza-c/Worx-Widget/main/images/Status_error.png?token=GHSAT0AAAAAABWYJFXHI7ODLKSS6PQHM672YWZRDIQ",
  status_loading:
    "https://raw.githubusercontent.com/oza-c/Worx-Widget/main/images/Status_loading.png?token=GHSAT0AAAAAABWYJFXGEXN3P6PVVAZMMOKKYWZRDVQ",
  status_rain:
    "https://raw.githubusercontent.com/oza-c/Worx-Widget/main/images/status_rain.png?token=GHSAT0AAAAAABWYJFXHESZEW2YJON5P5NXMYWZRBDA",
};

/// Status Enums ///
const LastStatus = {
  0: "Steht",
  1: "zu Hause",
  2: "Startvorgang",
  3: "Verlässt Zuhause",
  4: "Folgt Kabel",
  5: "Fährt zur Station",
  6: "Sucht Kabel",
  7: "Mäht",
  8: "Start nach Anheben",
};

const ErrorStatus = {
  0: "Fehlerfrei",
  1: "Festgefahren",
  2: "Angehoben",
  3: "Kein Kabelkontakt",
  4: "Über Begrenzung",
  5: "Regnet",
  11: "Über Kopf",
  12: "Baterie leer",
  14: "Ladefehler",
  16: "Gesperrt",
  17: "Überhitzt",
  19: "Klappe offen",
};

const LadeStatus = {
  0: "Fertig geladen",
  1: "Lädt",
  2: "Ladefehler",
};
///////////////////////////

let dir = fm.joinPath(fm.documentsDirectory(), "worx-landroid-widget");
if (!fm.fileExists(dir)) fm.createDirectory(dir);
let landroidData = await getLandroidData();
console.log(landroidData);

await saveImages();

const widget = await createWidget();

if (!config.runsInWidget) {
  await widget.presentMedium();
} else {
  Script.setWidget(widget);
}
Script.complete();

async function createWidget() {
  let listWidget = new ListWidget();
  listWidget.backgroundColor = new Color("1B2430");
  listWidget.refreshAfterDate = new Date(
    Date.now() + 1000 * UpdateTimeInterval
  );
  listWidget.setPadding(10, 5, 10, 5);
  listWidget.addSpacer(10);

  const wrap = listWidget.addStack();
  wrap.layoutHorizontally();
  wrap.topAlignContent();
  wrap.spacing = 15;

  const column0 = wrap.addStack();
  column0.layoutVertically();

  const icon = await getStatusImage();

  let CarStack = column0.addStack();
  let iconImg = CarStack.addImage(icon);
  iconImg.centerAlignImage();

  const column1 = wrap.addStack();
  column1.layoutVertically();

  let BatteryStack = column1.addStack();
  BatteryStack.layoutVertically();
  const batteryStatusLabel = BatteryStack.addText("Status");
  batteryStatusLabel.font = Font.mediumSystemFont(11);
  const batteryStatusVal = BatteryStack.addText(getStatusText());
  batteryStatusVal.font = Font.boldSystemFont(13);
  column1.addSpacer(10);

  let BatteryVol = column1.addStack();
  BatteryVol.Spacing = 2;
  BatteryVol.layoutVertically();
  const BatteryVolLabel = BatteryVol.addText("Batterie Spannung");
  BatteryVolLabel.font = Font.mediumSystemFont(12);
  const BatteryVolVal = BatteryVol.addText(landroidData.dat.bt.v + " V");
  BatteryVolVal.font = Font.boldSystemFont(15);
  column1.addSpacer(10);

  const column2 = wrap.addStack();
  column2.layoutVertically();

  let RangeStack = column2.addStack();
  RangeStack.layoutVertically();
  const RangeStatusLabel = RangeStack.addText("Ladestand");
  RangeStatusLabel.font = Font.mediumSystemFont(11);
  const RangeStatusVal = RangeStack.addText(landroidData.dat.bt.p + " %");
  RangeStatusVal.font = Font.boldSystemFont(15);
  RangeStatusVal.textColor = getTextColor(landroidData.dat.bt.p);
  column2.addSpacer(10);

  let LastUpdateStack = column2.addStack();
  LastUpdateStack.Spacing = 2;
  LastUpdateStack.layoutVertically();
  const LastUpdateLabel = LastUpdateStack.addText("Letzter Status");
  LastUpdateLabel.font = Font.mediumSystemFont(12);
  const LastUpdateVal = LastUpdateStack.addText(
    new Date().toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );
  LastUpdateVal.font = Font.boldSystemFont(15);
  column2.addSpacer(10);

  return listWidget;
}

function getStatusText() {
  let statusText = "";
  if (landroidData.dat.le == 0) {
    if (landroidData.dat.bt.c != 0) {
      statusText = LadeStatus[landroidData.dat.bt.c];
    } else {
      statusText = LastStatus[landroidData.dat.ls];
    }
  } else {
    statusText = ErrorStatus[landroidData.dat.le];
  }
  return statusText;
}

async function getLandroidData() {
  let BearerTokenRequest = new Request(
    "https://api.worxlandroid.com/api/v2/oauth/token"
  );
  BearerTokenRequest.method = "POST";
  BearerTokenRequest.headers = {
    Accept: "*/* ",
    "Content-Type": "multipart/form-data;",
    "Accept-Encoding": "gzip, deflate, br",
  };
  BearerTokenRequest.addParameterToMultipart("grant_type", "password");
  BearerTokenRequest.addParameterToMultipart("username", c_email);
  BearerTokenRequest.addParameterToMultipart("password", c_password);
  BearerTokenRequest.addParameterToMultipart("client_id", "1");
  BearerTokenRequest.addParameterToMultipart("scope", "*");
  BearerTokenRequest.addParameterToMultipart("client_secret", c_secret);

  let tokenResponse = await BearerTokenRequest.loadJSON();
  let StatusInformationRequest = new Request(
    "https://api.worxlandroid.com/api/v2/product-items/" +
      c_productId +
      "/status"
  );
  StatusInformationRequest.method = "GET";
  StatusInformationRequest.headers = {
    Authorization: "Bearer " + tokenResponse.access_token,
  };

  return await StatusInformationRequest.loadJSON();
}

async function getStatusImage() {
  console.log("ErrorCode: " + landroidData.dat.le);
  console.log("StatusCode: " + landroidData.dat.ls);
  console.log("LoadingCode: " + landroidData.dat.bt.c);
  if (landroidData.dat.le == 0) {
    if (landroidData.dat.bt.c != 0) {
      if (landroidData.dat.bt.c == 1) {
        image = "status_loading.png";
      } else {
        image = "status_1.png";
      }
    } else {
      if (imgs["status_" + landroidData.dat.ls]) {
        image = "status_" + landroidData.dat.ls + ".png";
      } else image = "status_1.png";
    }
  } else {
    if (landroidData.dat.le == 5) {
      image = "status_rain.png";
    } else {
      image = "status_error.png";
    }
  }
  let path = fm.joinPath(dir, image);
  if (fm.fileExists(path)) {
    console.log(path);
    return getImageFor(image);
  }
}

function getTextColor(data) {
  if (data > 75) {
    return Color.green();
  } else if (data > 50) {
    return Color.yellow();
  } else if (data > 30) {
    return Color.orange();
  } else {
    return Color.red();
  }
}

async function saveImages() {
  for (img in imgs) {
    imgName = img + ".png";
    imgPath = fm.joinPath(dir, imgName);
    if (!fm.fileExists(imgPath)) {
      req = new Request(imgs[img]);
      img = await req.loadImage();
      fm.writeImage(imgPath, img);
    }
  }
}

async function getImageFor(name) {
  imgPath = fm.joinPath(dir, name);
  console.log(imgPath);
  await fm.downloadFileFromiCloud(imgPath);
  img = await fm.readImage(imgPath);
  return img;
}

// helper function to download an image from a given url
async function loadImage(imgUrl) {
  const req = new Request(imgUrl);
  return await req.loadImage();
}

async function updateCheck(version) {
  let uC;
  try {
    let updateCheck = new Request(`${scriptURL}on`);
    uC = await updateCheck.loadJSON();
  } catch (e) {
    return log(e);
  }
  log(uC);
  log(uC.version);
  let needUpdate = false;
  if (uC.version != version) {
    needUpdate = true;
    log("Server version available");
    if (!config.runsInWidget) {
      log("running standalone");

      let upd = new Alert();
      upd.title = "Server Version Available";
      upd.addAction("OK");
      upd.addDestructiveAction("Later");
      upd.message =
        "Changes:\n" + uC.notes + "\n\nPress OK to get the update from GitHub";
      if ((await upd.present()) == 0) {
        let r = new Request(scriptURL);
        //download the updated script file
        let updatedCode = await r.loadString();
        let path = fm.joinPath(fm.documentsDirectory(), `${Script.name()}.js`);
        log(path);
        fm.writeString(path, updatedCode);
        throw new Error("Update Complete!");
      }
    }
  } else {
    log("up to date");
  }
  return needUpdate;
}
