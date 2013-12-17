var data, dataSet, mapping, view1, view2;

function load() {
  data = [
    ['a', 0],
    ['b', 1],
    [{value: 10}, 2],
    ['d', 3],
    [1, 4],
    [2, 5],
    [3, 6],
    [{value: 10}, 7],
    ['2', 8],
    ['3', 9]
  ];

  dataSet = new anychart.data.Set(data);
  mapping = dataSet.mapAs();
  view1 = mapping.prepare('x');
  view2 = mapping.prepare('x', ['a', 'd', 1, '1', '2', 2]);
}

function toArray(view, opt_fieldName) {
  var res = [];
  var iter = view.getIterator();
  while (iter.advance())
    res.push(opt_fieldName ? iter.get(opt_fieldName) : view.row(iter.getIndex()));
  return res;
}
