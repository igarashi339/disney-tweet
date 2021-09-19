/**
 * エントリーポイント。
 * 直近のツイートを分析し、フォロー対象を管理するスプレッドシートを更新する。
 */
function UpdateUserSheet() {
  const tweetIdList = SearchRecentTweets()
  const userIdList = SearchUserIdFromTweetIdList(tweetIdList)
  const userInfoList = FetchUserInfoFromId(userIdList)
  console.log(userInfoList)
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
 * 直近7日間のツイートから、指定したワードを含むものを抽出し、Tweet IDをリストにして返す。
 */
function SearchRecentTweets() {
  // APIをたたく
  const numOfTweets = "10"
  const targetString = "TDR_now OR ディズニー OR Dオタ"
  const url = "https://api.twitter.com/2/tweets/search/recent?query=" + targetString + "&max_results=" + numOfTweets
  const response = GetAPI(url)
  
  // APIの返却値を成形
  var data = response["data"]
  var idList = []
  for (var i = 0; i < data.length; ++i) {
    var tweet = data[i]
    idList.push(tweet["id"])
  }
  return idList
}

/**
 * Tweet IDのリストからUser Idのリストに変換する。
 * ユーザIDに重複がある場合はここで取り除く。
 */
function SearchUserIdFromTweetIdList(tweetIdList) {
  var userIdList = []
  for (var i = 0; i < tweetIdList.length; ++i) {
    const url = "https://api.twitter.com/2/tweets/" + tweetIdList[i] + "?tweet.fields=author_id"
    const response = GetAPI(url)
    var authorId = response["data"]["author_id"]
    userIdList.push(authorId)
  }

  // 重複を削除してかえす 
  var userIdSet = new Set(userIdList)
  return Array.from(userIdSet)
}

/**
 * User IDからユーザ情報に変換する。
 */
function FetchUserInfoFromId(userIdList) {
  var userInfoList = []
  for (var i = 0; i < userIdList.length; ++i) {
    // APIをたたく
    const url = "https://api.twitter.com/2/users/" + userIdList[i] + "?user.fields=public_metrics"
    const response = GetAPI(url)
    const obj = {
      "id": response["data"]["id"],
      "username": response["data"]["username"],
      "name": response["data"]["name"],
      "followers_count": response["data"]["public_metrics"]["followers_count"],
      "following_count": response["data"]["public_metrics"]["following_count"]
    }
    userInfoList.push(obj)
  }
  return userInfoList
}
