function LinearFit(xData, yData) {

  var xBar = 0;
  var yBar = 0;
  var xxBar = 0;
  var xyBar = 0;
  var n = 0;
  var m = 0;
  var b = 0;
  var yFit = [];
  var ssTot = 0;
  var ssReg = 0;
  var fittedData = [];
  var xVar = 0;
  var cov = 0;
  
  
 for (var j = 0; j < xData.length; j++) {
    xBar += xData[j];
    yBar += yData[j];
    xxBar += xData[j] * xData[j];
    xyBar += xData[j] * yData[j];
    n += 1;
  };

  m = (n * xyBar - xBar * yBar) / (n * xxBar - xBar * xBar);
  b = (yBar - m * xBar) / n
 
 for (var j = 0; j < xData.length; j++) {
    xVar += (xData[j] - xBar / n) * (xData[j] - xBar / n);
    ssTot += (yData[j] - yBar / n) * (yData[j] - yBar / n);
    cov += (xData[j] - xBar / n) * (yData[j] - yBar / n);
    yFit[j] = m * xData[j] + b;
    ssReg += (m * xData[j] + b - yBar / n) * (m * xData[j] + b - yBar / n);
    fittedData.push({"x": xData[j], "y": yFit[j]});
  };

  var rSquare = ssReg / ssTot;
  var corr = cov / (Math.pow(xVar,0.5) * Math.pow(ssTot,0.5));

  //console.log("Slope: " + m);
  //console.log("Intercept: " + b);
  //console.log("R-Square: " + rSquare);
  //console.log(corr);
  
  return [m, b, rSquare, corr, fittedData];
};