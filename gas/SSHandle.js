/**
 * シート名称を指定してすべてのデータを2次元配列型式で取得する。
 */
function GetAllData(sheetName) {
  const [sheet, lastCol, lastRow] = GetSheetInfo(sheetName)
  return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues()
}

/**
 * シートをクリアする。ただし、見出し行は残す。
 */
function Clear(sheetName) {
  const [sheet, lastCol, lastRow] = GetSheetInfo(sheetName)
  if (lastRow == 1) {
    return
  }
  sheet.getRange(2, 1, lastRow - 1, lastCol).clear()
}

/**
 * シートの内容を上書きする。
 */
function SetAllData(sheetName, dataList) {
  const [sheet, dummy, dummy2] = GetSheetInfo(sheetName)
  sheet.getRange(2, 1, dataList.length, dataList[0].length).setValues(dataList)
}

/**
 * シートの末尾に情報を追加する。
 */
function AddData(sheetName, dataList) {
  const [sheet, dummy, dummy2] = GetSheetInfo(sheetName)
  const targetRow = sheet.getLastRow() + 1
  sheet.getRange(targetRow, 1, dataList.length, dataList[0].length).setValues(dataList)
}

/**
 * 内部関数
 * 指定されたワークブック・シートの内容を取得する。
 */
function GetSheetInfo(sheetName) {
  const workBookId = PropertiesService.getScriptProperties().getProperty('WORKBOOK_ID')
  const ss = SpreadsheetApp.openById(workBookId)
  const sheet = ss.getSheetByName(sheetName)
  const lastCol = sheet.getLastColumn()
  const lastRow = sheet.getLastRow()
  return [sheet, lastCol, lastRow]
}