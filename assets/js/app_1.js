var svgWidth = 900;
var svgHeight = 600;

var margin = {top: 30, right: 30, bottom: 30, left: 30};

var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

var svg = d3.select(".chart")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

var chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("assets/data/data.csv").then(function(getData, err) {

  getData.forEach(function(data) {
    data.xVal = +data.poverty;
    data.yVal = +data.healthcare;
  });

  var xScale = d3.scaleLinear()
    .domain([d3.min(getData, d => d.xVal) * 0.95, d3.max(getData, d => d.xVal) * 1.05])
    .range([0, width]);

  var yScale = d3.scaleLinear()
    .domain([d3.min(getData, d => d.yVal) * 0.95, d3.max(getData, d => d.yVal) * 1.05])
    .range([height, 0]);

  var bottomAxis = d3.axisBottom(xScale);
  var leftAxis = d3.axisLeft(yScale);

  chartGroup.append("g").attr("transform", `translate(0, ${height})`).call(bottomAxis);
  chartGroup.append("g").call(leftAxis);

  chartGroup.selectAll("circle")
    .data(getData)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.xVal))
    .attr("cy", d => yScale(d.yVal))
    .attr("r", "10")
    .style("fill", "rgb(0, 100, 250)")
    .attr("opacity", ".5");

  chartGroup.selectAll("text")
    .data(getData)
    .enter()
    .append("text")
    .attr("x", d => xScale(d.xVal) - 7.5)
    .attr("y", d => yScale(d.yVal) + 2.5)
    .text(d => d.abbr)
    .attr("font-family", "sans-serif")
    .attr("font-size", "10")
    .attr("fill", "black");

}).catch(function(error) {
  console.log(error);
});

