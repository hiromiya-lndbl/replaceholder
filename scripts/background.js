
const regexp = /\$\{(.*?)\}/g;
const replaces = [
  {pattern: 'yy', replace: date => ('' + date.getFullYear()).substr(2)},
  {pattern: 'yyyy', replace: date => '' + date.getFullYear()},
  {pattern: 'M', replace: date => '' + (date.getMonth() + 1)},
  {pattern: 'MM', replace: date => toPadZero(date.getMonth() + 1, 2)},
  {pattern: 'MMM', replace: date => 
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]},
  {pattern: 'MMMMM', replace: date => 
    ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()]},
  {pattern: 'JM', replace: date => 
    ['睦月', '如月', '弥生', '卯月', '皐月', '水無月',
      '文月', '葉月', '長月', '神無月', '霜月', '師走'][date.getMonth()]},
  {pattern: 'd', replace: date => '' + date.getDate()},
  {pattern: 'dd', replace: date => toPadZero(date.getDate(), 2)},
  {pattern: 'E', replace: date => 
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]},
  {pattern: 'EEE', replace: date => 
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]},
  {pattern: 'EEEE', replace: date => 
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]},
  {pattern: 'JE', replace: date => 
    ['日', '月', '火', '水','木', '金', '土'][date.getDay()]},
  {pattern: 'H', replace: date => '' + date.getHours()},
  {pattern: 'HH', replace: date => toPadZero(date.getHours(), 2)},
  {pattern: 'k', replace: date => '' + (date.getHours() === 0? 24 : date.getHours())},
  {pattern: 'kk', replace: date => toPadZero(date.getHours() === 0? 24 : date.getHours(), 2)},
  {pattern: 'K', replace: date =>
    '' + (date.getHours() > 11? date.getHours() - 12 : date.getHours())},
  {pattern: 'KK', replace: date =>
    toPadZero(date.getHours() > 11? date.getHours() - 12 : date.getHours(), 2)},
  {pattern: 'h', replace: date =>
    '' + (date.getHours() === 0? 12 :
      date.getHours() > 12? date.getHours() - 12 : date.getHours())},
  {pattern: 'hh', replace: date =>
    toPadZero(date.getHours() === 0? 12 :
      date.getHours() > 12? date.getHours() - 12 : date.getHours(), 2)},
  {pattern: 'm', replace: date => '' + date.getMinutes()},
  {pattern: 'mm', replace: date => toPadZero(date.getMinutes(), 2)},
  {pattern: 's', replace: date => '' + date.getSeconds()},
  {pattern: 'ss', replace: date => toPadZero(date.getSeconds(), 2)},
  {pattern: 'S', replace: date => '' + date.getMilliseconds()},
  {pattern: 'SSS', replace: date => toPadZero(date.getMilliseconds(), 3)},
];

replaces.sort((a, b) =>
  a.pattern.length > b.pattern.length? -1 : a.pattern.length < b.pattern.length? 1 : 0);

browser.composeAction.onClicked.addListener(async tab => {
  const details = await browser.compose.getComposeDetails(tab.id);
  
  const date = new Date();
  const newDetails = {subject: replaceTemplate(details.subject, date)};
  if (details.isPlainText) {
    newDetails.plainTextBody = replaceTemplate(details.plainTextBody, date);
  } else {
    newDetails.body = replaceTemplate(details.body, date);
  }

  browser.compose.setComposeDetails(tab.id, newDetails);
});

/**
 * @param {number} num 
 * @param {number} length 
 */
function toPadZero(num, length) {
  return ('' + num).padStart(length, '0');
}

/**
 * @param {string} replaceString
 * @param {Date} date
 */
function replaceTemplate (replaceString, date) {
  let text = replaceString.replaceAll(regexp, (all, p1) => {
    let result = p1;
    replaces.forEach(o => {
      let idx = -1;
      do {
        // パターンを検索 前回検索した位置に+1する
        idx = result.indexOf(o.pattern, idx + 1);
        if (idx > -1) {
          // 検索した位置の前の文字が\であれば置換後の文字列の一部なので置換しない
          if (idx > 0 && result.charAt(idx - 1) == '\\') {
            continue;
          }
          // 置換文字列を作成 置換後の文字列と分かるように\を入れる
          const repSt = o.replace(date).split('').join('\\');
          // 実際に置換する
          result = result.substring(0, idx) + repSt + result.substring(idx + o.pattern.length);
        }
        // パターンが出現しなくなるまで繰り返す
      } while(idx > -1);
    });
    // 最終的な文字列の\を消してから返却
    return result.split('\\').join('');
  });

  // browser.compose.setComposeDetails後に再度browser.compose.getComposeDetailsで読み込むと
  // \r\nが2倍になるため、対策として\nに変換する。
  text = text.replaceAll(/\r\n/g, '\n');

  return text;
}
