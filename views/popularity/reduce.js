function(keys, values, rereduce) {
  // !code vendor/couchapp/date.js
  
  /* we use reddit algorithm to calculate scores
  http://blog.linkibol.com/post/How-to-Build-a-Popularity-Algorithm-You-can-be-Proud-of.aspx
  http://news.ycombinator.com/item?id=231168 */
  
  // all started at this date
  
  var score = 0;
  if (!rereduce) {
    var B = new Date("Thu May 28 11:16:49 2009 +0200").valueOf();
    var A = new Date().setRFC3339(values[0].d).valueOf()

    var t = A - B;
    var x = 0;
    for (var i in values)
      x += values[i].v;

    if (x > 0) {
      y = 1;
    } else if (x == 0) {
      y = 0;
    } else {
      y = -1;
    }

    z = (Math.abs(x) >=1 && x || 1);
    score = Math.log(z) + (y*t)/45000;
  } else {
    score = values[0];
    for (var i=0; i<values.length; i++) {
      if (values[i] > score)
        score = values[i];
    }
  }
  
  

  return score;
}