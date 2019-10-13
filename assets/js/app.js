// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select(".chart").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  };

// Set SVG (width, height), margins, and variable
var initWidth = window.innerWidth;
var initHeight = window.innerHeight;

var svgWidth = initWidth * .6;
var svgHeight = initHeight * .9;

var margin = {top: 50, right: 50, bottom: 100, left: 100};

var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

svg = d3.select(".chart")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

var chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

// Set inital variables
var slope;
var intercept;
var rsquare;
var corr;
var fitData;
var XAxis = "poverty";
var YAxis = "health";

// X Scale Function
function xScaleFun(dData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
      .domain([d3.min(dData, d => d[chosenXAxis]) * 0.95, d3.max(dData, d => d[chosenXAxis]) * 1.05])
      .range([0, width]);

      return xLinearScale;
};

function renderXAxes(newXScale, newxAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  newxAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return newxAxis;
};

function renderYAxes(newYScale, newyAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  newyAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return newyAxis;
};

// Y Scale Function
function yScaleFun(dData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
  .domain([d3.min(dData, d => d[chosenYAxis]) * 0.95, d3.max(dData, d => d[chosenYAxis]) * 1.05])
  .range([height, 0]);
      return yLinearScale;
};

function renderCircles(cGroup, dData, chosenXAxis, chosenYAxis) {
  var xS = xScaleFun(dData, chosenXAxis);
  var yS = yScaleFun(dData, chosenYAxis);

  cGroup.transition()
    .duration(1000)
    .attr("cx", d => xS(d[chosenXAxis]))
    .attr("cy", d => yS(d[chosenYAxis]));

  return cGroup;
};

function renderAbbr(cGroup, dData, chosenXAxis, chosenYAxis) {
  var xS = xScaleFun(dData, chosenXAxis);
  var yS = yScaleFun(dData, chosenYAxis);

  cGroup.transition()
    .duration(1000)
    .attr("x", d => xS(d[chosenXAxis]) - 7.5)
    .attr("y", d => yS(d[chosenYAxis]) + 3.0);

  return cGroup;
};

function fitLine(dData, chosenXAxis, chosenYAxis) {

  var x = [];
  var y = [];
  
  dData.forEach(function(d) {
    x.push(d[chosenXAxis]);
    y.push(d[chosenYAxis]);
  });

  return LinearFit(x,y);
};

function updateTooltip(cGroup, chosenXAxis, chosenYAxis) {
  // Step 1: Initialize Tooltip
  var xlabel;
  var ylabel;
  var toolTip;

  if (chosenXAxis === "poverty") {xlabel = "% in Poverty";}
  if (chosenXAxis === "age") {xlabel = "Age";};
  if (chosenXAxis === "income") {xlabel = "Medium Income";};
  
  if (chosenYAxis === "health") {ylabel = "% without Healthcare";};
  if (chosenYAxis === "obese") {ylabel = "% Obese";};
  if (chosenYAxis === "smokes") {ylabel = "% Smokes";};

  if(chosenXAxis === "poverty") {
    toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {return (`${d.state}<br>${xlabel} ${d[XAxis]}%<br>${ylabel} ${d[YAxis]}%`);});

  } else {
    toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {return (`${d.state}<br>${xlabel} ${d[XAxis]}<br>${ylabel} ${d[YAxis]}%`);});
  }
  // Step 2: Create the tooltip in chartGroup.
  cGroup.call(toolTip);

  // Step 3: Create "mouseover" event listener to display tooltip
  cGroup.on("mouseover", function(d) {toolTip.show(d, this);})
    .on("mouseout", function(d) {toolTip.hide(d);});
  
return cGroup
};  

// Get data and plot
d3.csv("assets/data/data.csv").then(function(getData, err) {

  // convert data from strings to numbers
  getData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income / 1000;
    data.health = +data.healthcare;
    data.obese = +data.obesity;
    data.smokes = +data.smokes;
  });

  // x-axis and label creation
  var xScale = xScaleFun(getData, XAxis);
  var bottomAxis = d3.axisBottom(xScale);

  // y-axis and label creation
  var yScale = yScaleFun(getData, YAxis);
  var leftAxis = d3.axisLeft(yScale);

  // Create Axes
  var xAxis = chartGroup.append("g").attr("transform", `translate(0, ${height})`).call(bottomAxis);
  var yAxis = chartGroup.append("g").call(leftAxis);

  // Initialize Plot
  var valueCircles = chartGroup.append("g").selectAll("circle")
    .data(getData)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d[XAxis]))
    .attr("cy", d => yScale(d[YAxis]))
    .attr("r", "10")
    .style("fill", "rgb(0, 100, 250)")
    .attr("opacity", ".5");
  
  var abbrCircles = chartGroup.append("g").selectAll("text")
    .data(getData)
    .enter()
    .append("text")
    .attr("x", d => xScale(d[XAxis])- 7.5)
    .attr("y", d => yScale(d[YAxis]) + 3.0)
    .attr("font-family", "sans-serif")
    .attr("font-size", "10")
    .attr("fill", "black")
    .text(d => d.abbr);

  var returnData = fitLine(getData, XAxis, YAxis);
    slope = returnData[0].toFixed(3);
    intercept = returnData[1].toFixed(3);
    rsquare = returnData[2].toFixed(3);
    corr = returnData[3].toFixed(3);
    fitData = returnData[4];

  var fitText1 = "Linear Fit: Slope = " + slope + ", Intercept = " + intercept;
  var fitText2 = "R-square = " + rsquare + ", Correlation = " + corr;

  var lineText1 = chartGroup.append("g")
    .append("text")
    .attr("x", 40)
    .attr("y", 5)
    .text(fitText1)
    .attr("font-family", "sans-serif")
    .attr("font-size", "12")
    .attr("fill", "red");

  var lineText2 = chartGroup.append("g")
    .append("text")
    .attr("x", 60)
    .attr("y", 20)
    .text(fitText2)
    .attr("font-family", "sans-serif")
    .attr("font-size", "12")
    .attr("fill", "red");    
  // line generator
  var line = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y));

  // append line
  var lineGroup = chartGroup.append("path")
    .data([fitData])
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "red");
    
  // Apply labels
  var labelsXGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("% in poverty");

  var ageLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age");

  var incomeLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Medium Income (in 000's)");

  var labelsYGroup = chartGroup.append("g");
  
  var healthLabel = labelsYGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "health") // value to grab for event listener
    .classed("active", true)
    .classed("axis-text", true)
    .text("% without Healthcare");
  
  var obeseLabel = labelsYGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 20 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obese") // value to grab for event listener
    .classed("inactive", true)
    .classed("axis-text", true)
    .text("% Obese");

  var smokesLabel = labelsYGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 40 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .classed("axis-text", true)
    .text("% Smokes");

  valueCircles = updateTooltip(valueCircles, XAxis, YAxis);

  labelsXGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
     
      if (value !== XAxis) {

        XAxis = value;
        if (XAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        if (XAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        if (XAxis === "income") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }

        xScale = xScaleFun(getData, XAxis);
        xAxis = renderXAxes(xScale, xAxis);
        valueCircles = renderCircles(valueCircles, getData, XAxis, YAxis);
        abbrCircles = renderAbbr(abbrCircles, getData, XAxis, YAxis);
        valueCircles = updateTooltip(valueCircles, XAxis, YAxis);

        returnData = fitLine(getData, XAxis, YAxis);
        
        returnData = fitLine(getData, XAxis, YAxis);
        slope = returnData[0].toFixed(3);
        intercept = returnData[1].toFixed(3);
        rsquare = returnData[2].toFixed(3);
        corr = returnData[3].toFixed(3);
        fitData = returnData[4];
        fitText1 = "Linear Fit: Slope = " + slope + ", Intercept = " + intercept
        fitText2 = "R-square = " + rsquare + ", Correlation = " + corr;
  
        lineText1.remove();
        lineText1 = chartGroup.append("g")
          .append("text")
          .attr("x", 40)
          .attr("y", 5)
          .text(fitText1)
          .attr("font-family", "sans-serif")
          .attr("font-size", "12")
          .attr("fill", "red");
      
        lineText2.remove();
        lineText2 = chartGroup.append("g")
          .append("text")
          .attr("x", 60)
          .attr("y", 20)
          .text(fitText2)
          .attr("font-family", "sans-serif")
          .attr("font-size", "12")
          .attr("fill", "red");
        
        // line generator
        line = d3.line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y));

        // append line
        lineGroup.remove();
        lineGroup = chartGroup.append("path")
          .data([fitData])
          .attr("d", line)
          .attr("fill", "none")
          .attr("stroke", "red");
      }
    });

  labelsYGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
  
      if (value !== YAxis) {

        YAxis = value;
        if (YAxis === "health") {
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        if (YAxis === "obese") {
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        if (YAxis === "smokes") {
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        }

        yScale = yScaleFun(getData, YAxis);
        yAxis = renderYAxes(yScale, yAxis);
        valueCircles = renderCircles(valueCircles, getData, XAxis, YAxis);
        abbrCircles = renderAbbr(abbrCircles, getData, XAxis, YAxis);
        valueCircles = updateTooltip(valueCircles, XAxis, YAxis);

        returnData = fitLine(getData, XAxis, YAxis);
        slope = returnData[0].toFixed(3);
        intercept = returnData[1].toFixed(3);
        rsquare = returnData[2].toFixed(3);
        corr = returnData[3].toFixed(3);
        fitData = returnData[4];
        fitText1 = "Linear Fit: Slope = " + slope + ", Intercept = " + intercept
        fitText2 = "R-square = " + rsquare + ", Correlation = " + corr;
  
        lineText1.remove();
        lineText1 = chartGroup.append("g")
          .append("text")
          .attr("x", 40)
          .attr("y", 5)
          .text(fitText1)
          .attr("font-family", "sans-serif")
          .attr("font-size", "12")
          .attr("fill", "red");
      
        lineText2.remove();
        lineText2 = chartGroup.append("g")
          .append("text")
          .attr("x", 60)
          .attr("y", 20)
          .text(fitText2)
          .attr("font-family", "sans-serif")
          .attr("font-size", "12")
          .attr("fill", "red");
        // line generator
        line = d3.line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y));

        // append line
        lineGroup.remove();
        lineGroup = chartGroup.append("path")
          .data([fitData])
          .attr("d", line)
          .attr("fill", "none")
          .attr("stroke", "red");
      }
    });


}).catch(function(error) {
  console.log(error);
});

};

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
