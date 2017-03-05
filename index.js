import ReactDOM from "react-dom";
import React from "react";
import map from "lodash.map";
import first from "lodash.first";
import last from "lodash.last";
import times from "lodash.times";
import {line} from "d3-shape";
import * as scale from "d3-scale";
import myData from "./test_data";
import simplify from "simplify-js";

const randomData = [];

times(100000, t => randomData.push({
    x: t,
    y: t + Math.random() * t / 10
}));

const linear = scale.scaleLinear;

const chartWidth = 500;
const chartHeight = 500;

const data = [
    {
        x: 10,
        y: 10,
        r: 5
    },
    {
        x: 100,
        y: 100,
        r: 30
    },
    {
        x: 200,
        y: 300,
        r: 60
    }
]; 

function MyCircles() {
    const data = simplify(randomData, 5000);
    const sortedData = data.slice(0).sort((a, b) => a.y - b.y);
    const minY = first(sortedData).y;
    const maxY = last(sortedData).y;

    const sortedXData = data.slice(0).sort((a, b) => a.x - b.x);
    const minX = first(sortedXData).x;
    const maxX = last(sortedXData).x;

    const yScale = linear()
        .domain([minY, maxY])
        .range([0, chartHeight]);

    const xScale = linear()
        .domain([minX, maxX])
        .range([0, chartWidth]);

    const myLine = line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));

    return (
        <svg width={chartWidth} height={chartHeight}>
            <path fill="transparent" stroke="black" d={myLine(data)} />
        </svg>
    );
}

ReactDOM.render(
    <MyCircles />,
    document.getElementById("root")
)

/*
var svg = d3.select("svg");



debugger;

var circle = svg.selectAll("circle")
    .data(data);

circle.enter().append("circle")
    .attr("cy", d => d.y)
    .attr("cx", d => d.x)
    .attr("r", d => d.r);

circle.exit().remove();
*/