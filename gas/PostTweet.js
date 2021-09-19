//認証用インスタンスの生成
var twitter = TwitterWebService.getInstance(
  PropertiesService.getScriptProperties().getProperty('TWITTER_API_KEY'),//API Key
  PropertiesService.getScriptProperties().getProperty('TWITTER_API_SECRET')//API secret key
);
 
//アプリを連携認証する
function authorize() {
  twitter.authorize();
}
 
//認証を解除する
function reset() {
  twitter.reset();
}
 
//認証後のコールバック
function authCallback(request) {
  return twitter.authCallback(request);
}

var service        = twitter.getService();
var endPointStatus = 'https://api.twitter.com/1.1/statuses/update.json';
var endPointMedia  = 'https://upload.twitter.com/1.1/media/upload.json';

function mediaTweet(){ 
  //ツイート本文と画像のURL  
  var twText = "ステップ♪"
  const fileId = "1igmoT8hfwLF8kmkKHyvXMDi2uSKW5xNt"
  const fileByApp = DriveApp.getFileById(fileId)
    
  //画像の取得
  const base64Data = Utilities.base64Encode(fileByApp.getBlob().getBytes());
  var img_option = { 
    'method' : "POST",
    'payload': {
      'media_data': base64Data
    } 
  };
  var image_upload = JSON.parse(service.fetch(endPointMedia, img_option)); 
  var sendoption = { 
    'status'   : twText, 
    'media_ids': image_upload['media_id_string']
  };
  service.fetch(endPointStatus, {method: 'post', payload: sendoption});
}