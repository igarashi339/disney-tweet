/**
 * エントリーポイント。
 * 直近のツイートを分析し、フォロー対象を管理するスプレッドシートを更新する。
 */
function UpdateUserSheet() {
  // 夜は何もしない
  if (IsNightTime()) {
    return
  }
  
  // 直近のツイートからフォロー候補を取得する
  const targetStringList = [
    "%23twitter上にいるDヲタ全員と繋がるのが密かな夢だったりするのでとりあえずこれを見たDヲタはRTもしくはフォローしていただけると全力でフォローしに行きます",
    "%23twitter上にいるDヲタ全員と繋がるのが密かな夢だったりするのでとりあえずこれを見たDヲタはRTもしくはフォロー",
    "%23ディズニー好きな人と繋がりたい",
    "%23Dオタと繋がりたい",
    "%23Dオタさんと繋がりたい"
  ]
  var followQuota = 3 // 1回の実行でフォローする人数
  const date = new Date()
  const todayStr = Utilities.formatDate( date, 'Asia/Tokyo', 'yyyy-MM-dd')
  for (let targetString of targetStringList) {
    const numOfTweets = "50"
    var candidateUsers = GetRecentTweetUserInfoList(targetString, numOfTweets)
    var selectedUsers = SelectUsers(candidateUsers)
    for (let selectedUser of selectedUsers) {
      if (followQuota <= 0) {
        break
      }
      sleep(10000)
      Follow(selectedUser.username)
      // LikePinnedTweetIfExists(selectedUser.username)
      console.log('follow: ' + selectedUser.username)
      AddData('users', [[selectedUser.id, selectedUser.username, todayStr]])
      followQuota = followQuota - 1
    }
    if (followQuota <= 0) {
      break
    }
  }
  console.log("finish!")
}

function sleep(ms) {
  const d1 = new Date();
  while (true) {
    const d2 = new Date();
    if (d2 - d1 > ms) {
      break;
    }
  }
}

/**
 * 直近のツイートから指定された語を含むものを取得し、ツイートしたユーザ情報をリストで返す。
 */
function GetRecentTweetUserInfoList(targetString, numOfTweets) {
  // 直近のツイートを検索しユーザIDを取得
  const tweetList = SearchRecentTweet(targetString, numOfTweets)
  var userIdList = []
  for (var i = 0; i < tweetList.length; ++i) {
    const authorId = tweetList[i]["author_id"]
    userIdList.push(authorId)
  }
  
  // ユーザIDの重複を削除
  var userIdSet = new Set(userIdList)
  userIdList = Array.from(userIdSet)
  
  // ユーザIDからユーザ情報を取得して返す
  var userInfoList = []
  for (var i = 0; i < userIdList.length; ++i) {
    const userInfo = LookupUserByID(userIdList[i])
    userInfoList.push({
      "id": userInfo["id"],
      "username": userInfo["username"],
      "name": userInfo["name"],
      "followers_count": userInfo["public_metrics"]["followers_count"],
      "following_count": userInfo["public_metrics"]["following_count"]
    })
  }
  return userInfoList
}

/**
 * 候補となるユーザにフィルタをかける。
 */
function SelectUsers(candidateUsers) {
  var filteredUsers = []

  const ssUserData = GetAllData("users")
  for (var i = 0; i < candidateUsers.length; ++i) {  
    const candidateUser = candidateUsers[i]
    // すでにフォロー申請済の場合はスキップ
    if (IsContain(candidateUser["id"], ssUserData)) {
      continue
    }
    filteredUsers.push(candidateUser)
  }

  // Follower - Following 比が小さい順にソート
  for (var i = 0; i < filteredUsers.length - 1; ++i) {
    for (var j = i + 1; j < filteredUsers.length; ++j) {
      var left = filteredUsers[i]
      var right = filteredUsers[j]
      var leftFFRatio = left["followers_count"] - left["following_count"]
      var rightFFRatio = right["followers_count"] - right["following_count"]
      if (leftFFRatio > rightFFRatio) {
        var tmp = filteredUsers[i]
        filteredUsers[i] = filteredUsers[j]
        filteredUsers[j] = tmp
      }
    }
  }
  return filteredUsers
}

/**
 * スプレッドシートのユーザ一覧に、当該ユーザが含まれる場合Trueを返す。
 */
function IsContain(targetId, ssUserData) {
  for (var i = 0; i < ssUserData.length; ++i) {
    if (targetId == ssUserData[i][0]) {
      return true
    }
  }
  return false
}

/**
 * 夜間であればTrueを返す。
 */
function IsNightTime() {
  const date = new Date()
  const hour = Utilities.formatDate( date, 'Asia/Tokyo', 'HH')
  if (hour < 8 || 21 < hour) {
    return true
  }
  return false
}