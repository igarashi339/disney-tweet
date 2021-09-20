/**
 * エントリーポイント。
 * 直近のツイートを分析し、フォロー対象を管理するスプレッドシートを更新する。
 */
function UpdateUserSheet() {
  // 直近のツイートからフォロー候補を取得する
  const targetString = "%23twitter上にいるDヲタ全員と繋がるのが密かな夢だったりするのでとりあえずこれを見たDヲタはRTもしくはフォローしていただけると全力でフォローしに行きます"
  const numOfTweets = "100"
  var candidateUsers = GetRecentTweetUserInfoList(targetString, numOfTweets)
  var selectedUsers = SelectUsers(candidateUsers)
  console.log(selectedUsers)
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

  // すでにフォロー申請済のユーザの場合はスキップ
  const ssUserData = GetAllData("users")
  for (var i = 0; i < candidateUsers.length; ++i) {  
    const candidateUser = candidateUsers[i]
    if (IsContain(candidateUser["id"], ssUserData)) {
      continue
    }
    filteredUsers.push(candidateUser)
  }

  // Following/Follower比が1に近い順にソート
  for (var i = 0; i < filteredUsers.length - 1; ++i) {
    for (var j = i + 1; j < filteredUsers.length; ++j) {
      var left = filteredUsers[i]
      var right = filteredUsers[j]
      var leftFFRatio = left["followers_count"] / left["following_count"]
      var rightFFRatio = right["followers_count"] / right["following_count"]
      if (Math.abs(1 - leftFFRatio) > Math.abs(1 - rightFFRatio)) {
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