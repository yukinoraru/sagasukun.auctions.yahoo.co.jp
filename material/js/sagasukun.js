window.sagasukun = (function() {

  //  条件式の解析と実行
  //  condition: 下記の書式が指定できる
  //   - "all"         すべてに合致
  //   - "{$n}hours"   $n時間以前に合致
  //   - "tomorrow"    明日以降に合致
  //   - "bid > {$n}"  入札数がn以上
  //  n, unit:
  //  b:
  var analyzer = function(condition, n, unit, b) {
    // パターン1. 全てを表示する場合
    if (condition == 'all') {
      return false;
    }

    // パターン2. 時間が指定されたとき
    if (condition.indexOf('hours') > -1 || condition.indexOf('tomorrow') > -1) {

      // 明日以降が指定された場合は残り時間単位が"日"であればすべて
      if (condition == 'tomorrow') {
        if (unit == '日') {
          return false;
        } else {
          return true;
        }
      }

      // 時間が指定された場合は、残り時間単位が "分" または "時間"で
      // かつ"時間"が指定時間以内の場合のみ
      else if (condition.indexOf('hours') > -1) {
        var match = condition.match(/(\d+)hours/);
        var condHour = parseInt(match[1]);
        if ((unit == '分' || unit == '時間') && n < condHour) {
          return false;
        } else {
          return true;
        }
      } else {
        console.error('time parse error. condition=' + condition);
        return false;
      }

      // パターン3. 入札件数が指定されたとき
    } else if (condition.indexOf('bid') > -1) {
      var match = condition.match(/bid\s+([=><])\s+(\d+)/);

      var operator = match[1];
      var bid = parseInt(match[2]);

      switch (operator) {
        case '>':
          if (b >= bid) {
            return false;
          } else {
            return true;
          }
          break;

        default:
          console.error('bid parse error. condition=' + condition);
          return true;
      }

    } else {
      console.error('bid parse error. condition=' + condition);
      return false;
    }
  }

  return function(condition) {
    // TODO: 毎回セレクタ参照があるため減らす
    $('table tr').each(function() {

      // 時間の取得
      var tdTime = $(this).find('td[class=ti]');
      var time = tdTime.text().match(/(\d+)(.+)/);
      if (time == null) {
        return true;
      }

      // 時間の数字部分をn, 単位をunitへ分解
      var n = parseInt(time[1]) || null;
      var unit = time[2] || null;

      // 入札数の取得
      var tdBid = $(this).find('td[class=bi]');
      var bid = parseInt(tdBid.text());
      bid = (bid === NaN) ? 0 : bid;

      // 条件式の解析と実行
      if (analyzer(condition, n, unit, bid)) {
        $(this).hide('slow');
        $(this).next('tr').hide('slow'); // ウォッチリスト部分
      } else {
        $(this).show('slow');
        $(this).next('tr').show('slow'); // ウォッチリスト部分
      }
    });

  };
})();
