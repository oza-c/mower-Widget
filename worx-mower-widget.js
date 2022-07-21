// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: robot;
// name: worx-mower-widget.js
// description: A scriptable widget which displays the latest information from your worx landmower
// original author: Matthes Schlichte
// email: matthes@schlichte.dev
let PARAM = args.widgetParameter;
let landroidData;
let fm = FileManager.iCloud();
let dir = fm.joinPath(fm.documentsDirectory(), "worx-landroid-widget");

await saveImages();

async function getLandroidData() {
  let productId = ""; //PRODUCT ID HERE
  let formdata = {
    username: "", // ACCOUNT EMAIL HERE
    password: "", //ACCOUNT PASSWORD HERE
    grant_type: "password",
    client_id: "1",
    scope: "*",
    client_secret: "", //CLIENT SECRET HERE
  };

  let BearerTokenRequest = new Request(
    "https://api.worxlandroid.com/api/v2/oauth/token"
  );
  BearerTokenRequest.method = "POST";
  BearerTokenRequest.body = JSON.stringify(formdata);
  let tokenResponse = await BearerTokenRequest.loadJSON();

  let StatusInformationRequest = new Request(
    "https://api.worxlandroid.com/api/v2/product-items/" + productId + "/status"
  );
}

const widget = await createWidget();

if (!config.runsInWidget) {
  await widget.presentMedium();
} else {
  Script.setWidget(widget);
}
Script.complete();

async function createWidget() {
  landroidData = await getLandroidData();

  let listWidget = new ListWidget();
  listWidget.backgroundColor = new Color("1B2430");
  listWidget.setPadding(10, 0, 10, 10);
  listWidget.addSpacer(10);

  const wrap = listWidget.addStack();
  wrap.layoutHorizontally();
  wrap.topAlignContent();
  wrap.spacing = 15;

  const column0 = wrap.addStack();
  column0.layoutVertically();

  const icon = await getStatusImage("status_" + landroidData.dat.ls + ".png");

  let CarStack = column0.addStack();
  let iconImg = CarStack.addImage(icon);
  iconImg.centerAlignImage();

  const column1 = wrap.addStack();
  column1.layoutVertically();

  let BatteryStack = column1.addStack();
  BatteryStack.layoutVertically();
  const batteryStatusLabel = BatteryStack.addText("Status");
  batteryStatusLabel.font = Font.mediumSystemFont(11);
  const batteryStatusVal = BatteryStack.addText("Ladevorgang");
  batteryStatusVal.font = Font.boldSystemFont(16);
  column1.addSpacer(10);

  let BatteryVol = column1.addStack();
  BatteryVol.Spacing = 2;
  BatteryVol.layoutVertically();
  const BatteryVolLabel = BatteryVol.addText("Batterie Spannung");
  BatteryVolLabel.font = Font.mediumSystemFont(12);
  const BatteryVolVal = BatteryVol.addText(12.5 + " V");
  BatteryVolVal.font = Font.boldSystemFont(15);
  column1.addSpacer(10);

  const column2 = wrap.addStack();
  column2.layoutVertically();

  let RangeStack = column2.addStack();
  RangeStack.layoutVertically();
  const RangeStatusLabel = RangeStack.addText("Ladestand");
  RangeStatusLabel.font = Font.mediumSystemFont(11);
  const RangeStatusVal = RangeStack.addText(25 + " %");
  RangeStatusVal.font = Font.boldSystemFont(15);
  RangeStatusVal.textColor = getTextColor(25);
  column2.addSpacer(10);

  let LastUpdateStack = column2.addStack();
  LastUpdateStack.Spacing = 2;
  LastUpdateStack.layoutVertically();
  const LastUpdateLabel = LastUpdateStack.addText("Letzter Status");
  LastUpdateLabel.font = Font.mediumSystemFont(12);
  const LastUpdateVal = LastUpdateStack.addText("14:07");
  LastUpdateVal.font = Font.boldSystemFont(15);
  column2.addSpacer(10);

  return listWidget;
}

async function getStatusImage(image) {
  let fm = FileManager.local();
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir, image);
  if (fm.fileExists(path)) {
    return fm.readImage(path);
    //fm.remove(path)
  } else {
    // download once
    let iconImage = await loadImage(
      "https://eu.worx.com/wp-content/themes/worx/dist/images/pages/landroid-pillar/box-1.png"
    );
    fm.writeImage(path, iconImage);
    return iconImage;
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
  let imgs = {
    status_1:
      "https://github.com/oza-c/Worx-Widget/blob/main/images/Status_1.png?raw=true",
    status_2:
      "https://github.com/oza-c/Worx-Widget/blob/main/images/Status_2.png?raw=true",
    status_3:
      "https://github.com/oza-c/Worx-Widget/blob/main/images/Status_3.png?raw=true",
    status_4:
      "https://github.com/oza-c/Worx-Widget/blob/main/images/Status_4.png?raw=true",
    status_5:
      "https://github.com/oza-c/Worx-Widget/blob/main/images/Status_5.png?raw=true",
  };
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
  imgPath = fm.joinPath(dir, name + ".png");
  await fm.downloadFileFromiCloud(imgPath);
  img = await fm.readImage(imgPath);
  return img;
}

// helper function to download an image from a given url
async function loadImage(imgUrl) {
  const req = new Request(imgUrl);
  return await req.loadImage();
}
