function Test() {
  const users = SelfFollowingUsers(200)
  for (let user of users) {
    console.log(user.username)
  }
}

/**
 * Twitter APIをたたいてResponse結果を返す。
 */
function GetAPI(url) {
  const bearer = PropertiesService.getScriptProperties().getProperty('TWITTER_BEARER_TOKEN')
  const header = {
    "Authorization": "Bearer " + bearer
  }
  const options = {
    "method": "get",
    "headers": header
  }
  const response = UrlFetchApp.fetch(url, options)
  return JSON.parse(response)
}

/**
 * キーワードと件数を指定して直近のツイート情報を取得する。
 * ただしリツイートは除く。
 * 
 * Responseの形式：
 * [ 
 * {  lang: 'ja',
      created_at: '2021-09-20T03:59:45.000Z',
      text: 'ツイート本文',
      id: '1439801427824496641',
      source: 'Twitter for iPhone',
      entities: { annotations: [Object], urls: [Object] },
      possibly_sensitive: false,
      author_id: '106789876556' },
    ...
  ]
 */
function SearchRecentTweet(keyword, tweetNum) {
  const url = "https://api.twitter.com/2/tweets/search/recent?query=" + keyword + "&max_results=" + String(tweetNum) + "&tweet.fields=author_id,created_at,entities,geo,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source"
  const rawData = GetAPI(url)["data"]
  var retweetRemovedData = []
  for (var i = 0; i < rawData.length; ++i) {
    if (["referenced_tweets"] in rawData[i]) {
      continue
    }
    retweetRemovedData.push(rawData[i])
  }
  return retweetRemovedData
}

/**
 * ユーザID(文字列)を指定して、当該ユーザの情報を取得する。
 * 
 * Responseの形式：
 * {  id: '104t76567898352256',
      protected: false,
      name: 'ユーザ名',
      public_metrics: 
      { followers_count: 380,
        following_count: 634,
        tweet_count: 23156,
        listed_count: 6 },
      verified: false,
      profile_image_url: 'https://pbs.twimg.com/profile_images/67656765677/hogehoge.jpg',
      description: '自己紹介文',
      url: '',
      created_at: '2018-10-06T09:46:54.000Z',
      username: 'usernamehogehoge' }
 */
function LookupUserByID(userIdStr) {
  const url = "https://api.twitter.com/2/users/" + userIdStr + "?user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld"
  return GetAPI(url)["data"]
}

/**
 * ユーザ名を指定して、当該ユーザの情報を取得する。
 * 
 * Responseの形式：
 * [ { verified: false,
    description: '千葉在住のアラサーエンジニアです。',
    created_at: '2021-09-17T15:17:27.000Z',
    id: '1438884652119322626',
    profile_image_url: 'https://pbs.twimg.com/profile_images/1462733139923865600/hoge.jpg',
    public_metrics: 
     { followers_count: 99,
       following_count: 187,
       tweet_count: 20,
       listed_count: 0 },
    pinned_tweet_id: '14627364234543097',
    username: 'hoge',
    entities: { description: [Object] },
    protected: false,
    name: 'hoge',
    url: '' } ]
 */
function LookupUserByUsername(userName) {
  const url = "https://api.twitter.com/2/users/by?usernames=" + userName + "&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld&expansions=pinned_tweet_id&tweet.fields=author_id,created_at"
  return GetAPI(url)["data"]
}

/**
 * ユーザIDとツイート件数を指定して、当該ユーザがいいねしたツイートの情報をとってくる。
 * 
 * Responseの形式：
 * [ {  source: 'Twitter for iPhone',
        id: '1439530656735687',
        possibly_sensitive: false,
        text: 'テキスト',
        author_id: '1430362323456761',
        public_metrics: 
        { retweet_count: 2,
          reply_count: 2,
          like_count: 57,
          quote_count: 0 },
        conversation_id: '143953056767',
        lang: 'ja',
        created_at: '2021-09-19T10:04:01.000Z' },
    ...
    ]
 */
function LikedTweets(userIdStr, tweetNum) {
  const url = "https://api.twitter.com/2/users/" + userIdStr + "/liked_tweets?user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld&tweet.fields=attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,public_metrics,referenced_tweets,source,text,withheld&max_results=" + String(tweetNum)
  return GetAPI(url)["data"]
}

/**
 * 自分自身がいいねしたツイートの情報をとってくる。
 */
function SelfLikedTweets(tweetNum) {
  const userIdStr = PropertiesService.getScriptProperties().getProperty('SELF_TWITTER_ID')
  return LikedTweets(userIdStr, tweetNum)
}

/**
 * 該当ユーザがフォロー中のユーザを一覧で返す。
 * maxResultsの最大値は5000.
 */
function GetFollowingUsers(userId, mexResults) {
  const url = "https://api.twitter.com/2/users/" + String(userId) + "/following?max_results=" + String(mexResults) + "&user.fields=public_metrics"
  return GetAPI(url)["data"]
}

/**
 * 自分自身がフォローしているユーザ一覧を返す。
 * maxResultsの最大値は5000.
 */
function SelfFollowingUsers(mexResults) {
  const userIdStr = PropertiesService.getScriptProperties().getProperty('SELF_TWITTER_ID')
  return GetFollowingUsers(userIdStr, mexResults)
}

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

/**
 * 画像付きでツイートを投稿する。
 * 画像はGoogle Driveから取得する。
 * 
 * txText: ツイート本文
 * gdFileId: Google Driveにアップロード済のファイルのID
 */
function PostMediaTweet(twText, gdFileId){
  var service        = twitter.getService();

  // 画像アップロード
  const fileByApp = DriveApp.getFileById(gdFileId)
  const base64Data = Utilities.base64Encode(fileByApp.getBlob().getBytes());
  var img_option = { 
    'method' : "POST",
    'payload': {
      'media_data': base64Data
    } 
  };
  var endPointMedia  = 'https://upload.twitter.com/1.1/media/upload.json'; 
  var image_upload = JSON.parse(service.fetch(endPointMedia, img_option));

  // ツイート実行
  var sendoption = { 
    'status'   : twText, 
    'media_ids': image_upload['media_id_string']
  };
  var endPointStatus = 'https://api.twitter.com/1.1/statuses/update.json';
  service.fetch(endPointStatus, {method: 'post', payload: sendoption});
}

/**
 * 文字だけのツイートを投稿する。
 */
function PostTweet(message) {
  var endpoint = "https://api.twitter.com/1.1/statuses/update.json";
  var service = twitter.getService()
  var options = {
    "method": "post",
    "payload": {
      status: message
    }
  }
  service.fetch(endpoint, options)
}

/**
 * ユーザ名称を指定してユーザをフォローする。
 * ※ユーザIDではないので注意。
 */
function Follow(username) {
  var service = twitter.getService()
  var endpoint = "https://api.twitter.com/1.1/friendships/create.json"
  var options = {
    "method": "post",
    "payload": {
      "screen_name": username
    }
  }
  service.fetch(endpoint, options)
}

/**
 * ユーザ名称を指定してユーザをアンフォローする。
 * ※ユーザIDではないので注意。
 */
function UnFollow(username) {
  var service = twitter.getService()
  var endpoint = "https://api.twitter.com/1.1/friendships/destroy.json"
  var options = {
    "method": "post",
    "payload": {
      "screen_name": username
    }
  }
  service.fetch(endpoint, options)
}

/**
 * ツイートIDを指定していいねする。
 */
function LikeTweetByTweetId(tweetId) {
  var service = twitter.getService()
  const endpoint = `https://api.twitter.com/1.1/favorites/create.json?id=` + tweetId
  console.log(endpoint)
  var options = {
    "method": "post",
  }
  service.fetch(endpoint, options)
}

function GetTweetStatusbyTweetId(tweetId) {
  const url = "https://api.twitter.com/1.1/statuses/show.json?id=" + tweetId
  return GetAPI(url)
}

/**
 * ユーザ名を指定し、固定ツイートがあればいいねする。
 */
function LikePinnedTweetIfExists(userName) {
  const userInfo = LookupUserByUsername(userName)
  if (`pinned_tweet_id` in userInfo[0]) {
    try {
      LikeTweetByTweetId(userInfo[0][`pinned_tweet_id`])
    } catch(e) {
      console.log(e.message)
    }
  }  
}

