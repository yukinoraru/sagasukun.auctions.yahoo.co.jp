window.sagasukun = (function() {

  // "時間で絞る"が有効かどうか
  var filteredByTime = false;

  // "入札数で絞る"が有効かどうか
  var filteredByBid = false;

  //  条件式の解析と実行
  //  condition: 下記の書式が指定できる
  //   - "all"         すべてに合致
  //   - "{$n}hours"   $n時間以前に合致
  //   - "tomorrow"    明日以降に合致
  //   - "bid > {$n}"  入札数がn以上
  //  params:
  var analyzer = function(condition, params) {
    // パターン1. 全てを表示する場合
    if (condition == 'all') {
      filteredByTime = false;
      filteredByBid = false;
      return false;
    }

    // パターン2. 時間が指定されたとき
    if (condition.indexOf('hours') > -1 || condition.indexOf('tomorrow') > -1) {
      filteredByTime = true;

      // 明日以降が指定された場合は残り時間単位が"日"であればすべて
      if (condition == 'tomorrow') {
        if (params.unit == '日') {
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
        if ((params.unit == '分' || params.unit == '時間') && params.n < condHour) {
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
      filteredByBid = true;

      var match = condition.match(/bid\s+([=><])\s+(\d+)/);
      var operator = match[1];
      var condBid = parseInt(match[2]);

      switch (operator) {
        case '>':
          if (params.bid >= condBid) {
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

  // 高速化のため現在の一覧画面をハッシュに変換して保持
  var virtualRows = Array(300);
  $('table tr').each(function(i) {
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
    bid = (bid !== NaN) ? bid : 0;

    // 状態を保存
    virtualRows[i] = {
      n: n,
      unit: unit,
      bid: bid,
      elem: $(this),
      elem_next: $(this).next('tr')
    };
  });

  return function(caller, condition) {

    // 絞り込みボタンの状態をトグル
    // $(caller).siblings().each(function(){
    //   $(this).removeClass('disable');
    // });
    // $(caller).addClass('disable');

    //
    $.each(virtualRows, function(i, row) {
      if(row === undefined){
        return true;
      }

      // TODO: どちらかの絞り込みが有効になっている場合はAND検索を実行する

      // 条件式の解析と実行
      if (analyzer(condition, {n: row.n, unit: row.unit, bid: row.bid})) {
        row.elem.hide();
        row.elem_next.hide(); // ウォッチリスト部分
      } else {
        row.elem.show();
        row.elem_next.show(); // ウォッチリスト部分
      }

      // 絞り込みがないときはボタンの状態をリセット
      if(!filteredByBid && !filteredByTime){
        $('.sagasukun a').each(function(){
          row.elem.removeClass('disable');
        });
      }

    });

  };
})();
