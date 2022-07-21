// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: robot;
// name: worx-mower-widget.js
// description: A scriptable widget which displays the latest information from your worx landmower
// original author: Matthes Schlichte
// email: matthes@schlichte.dev
let PARAM = args.widgetParameter;
let fm = FileManager.iCloud();
let dir = fm.joinPath(fm.documentsDirectory(), "worx-landroid-widget");
if (!fm.fileExists(dir)) fm.createDirectory(dir);
let landroidData = await getLandroidData();
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
  listWidget.setPadding(10, 0, 10, 10);
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

async function getLandroidData() {
  let productId = ""; //PRODUCT ID HERE

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
  BearerTokenRequest.addParameterToMultipart(
    "username",
    "" //Email here
  );
  BearerTokenRequest.addParameterToMultipart("password", ""); //Password here
  BearerTokenRequest.addParameterToMultipart("client_id", "1");
  BearerTokenRequest.addParameterToMultipart("scope", "*");
  BearerTokenRequest.addParameterToMultipart(
    "client_secret",
    "" //Client secret here
  );

  let tokenResponse = await BearerTokenRequest.loadJSON();
  let StatusInformationRequest = new Request(
    "https://api.worxlandroid.com/api/v2/product-items/" + productId + "/status"
  );
  StatusInformationRequest.method = "GET";
  StatusInformationRequest.headers = {
    Authorization: "Bearer " + tokenResponse.access_token,
  };
  return await StatusInformationRequest.loadJSON();
}

async function getStatusImage() {
  let image = "status_4.png";
  if (landroidData.dat.ls == 1) {
    image = "status_1.png";
  } else if (landroidData.dat.ls == 2) {
    image = "status_2.png";
  }

  let fm = FileManager.local();
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir, image);
  if (fm.fileExists(path)) {
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
  let imgs = {
    status_1:
      "https://raw.githubusercontent.com/oza-c/Worx-Widget/main/images/Status_1.png?token=GHSAT0AAAAAABWYJFXHVWZPZVDTKWVZW4YEYWZB4XA",
    status_2:
      "https://raw.githubusercontent.com/oza-c/Worx-Widget/main/images/Status_1.png?token=GHSAT0AAAAAABWYJFXHVWZPZVDTKWVZW4YEYWZB4XA",
    status_3:
      "https://raw.githubusercontent.com/oza-c/Worx-Widget/main/images/Status_1.png?token=GHSAT0AAAAAABWYJFXHVWZPZVDTKWVZW4YEYWZB4XA",
    status_4:
      "https://raw.githubusercontent.com/oza-c/Worx-Widget/main/images/Status_1.png?token=GHSAT0AAAAAABWYJFXHVWZPZVDTKWVZW4YEYWZB4XA",
    status_5:
      "https://raw.githubusercontent.com/oza-c/Worx-Widget/main/images/Status_1.png?token=GHSAT0AAAAAABWYJFXHVWZPZVDTKWVZW4YEYWZB4XA",
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
