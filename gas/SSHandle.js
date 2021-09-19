/**
 * ワークブックIDとシート名称を指定してすべてのデータを2次元配列型式で取得する。
 */
function GetAllData(wordBookId, sheetName) {
  const [sheet, lastCol, lastRow] = GetSheetInfo(wordBookId, sheetName)
  return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues()
}

/**
 * シートをクリアする。ただし、見出し行は残す。
 */
function Clear(wordBookId, sheetName) {
  const [sheet, lastCol, lastRow] = GetSheetInfo(wordBookId, sheetName)
  if (lastRow == 1) {
    return
  }
  sheet.getRange(2, 1, lastRow - 1, lastCol).clear()
}

/**
 * シートの内容を上書きする。
 */
function SetAllData(wordBookId, sheetName, dataList) {
  const [sheet, dummy, dummy2] = GetSheetInfo(wordBookId, sheetName)
  sheet.getRange(2, 1, dataList.length, dataList[0].length).setValues(dataList)
}

function GetSheetInfo(wordBookId, sheetName) {
  const ss = SpreadsheetApp.openById(wordBookId)
  const sheet = ss.getSheetByName(sheetName)
  const lastCol = sheet.getLastColumn()
  const lastRow = sheet.getLastRow()
  return [sheet, lastCol, lastRow]
}