import ReactDOM from "react-dom";
import React from "react";
import map from "lodash.map";
import first from "lodash.first";
import last from "lodash.last";
import times from "lodash.times";
import throttle from "lodash.throttle";
import { line } from "d3-shape";
import * as scale from "d3-scale";
import myData from "./test_data";
import simplify from "simplify-js";

window.NODE_ENV = "production";

const mappedMyData = map(myData, d => ({ x: d[0], y: d[1] }));

const linear = scale.scaleLinear;

const chartWidth = 500;
const chartHeight = 500;
const svgWidth = 600;
const svgHeight = 600;

class FirstLineChart extends React.PureComponent {
    constructor(props) {
        super(props);

        const data = this.props.data;
        const ySortedData = data.slice(0).sort((a, b) => a.y - b.y);

        const minY = first(ySortedData).y;
        const maxY = last(ySortedData).y;
        const minX = first(data).x;
        const maxX = last(data).x;

        this.yScale = linear()
            .domain([minY, maxY])
            .range([chartHeight, 0]);

        this.xScale = linear()
            .domain([minX, maxX])
            .range([0, chartWidth]);

        this.line = line()
            .x(d => this.xScale(d.x))
            .y(d => this.yScale(d.y));
    }

    render() {
        const data = this.props.data;

        return (
            <svg width={svgWidth} 
                 height={svgHeight}>
                <Ticks yScale={this.yScale}
                       xScale={this.xScale} />
                <path fill="transparent"
                      stroke="black" 
                      d={this.line(data)} />
                <Tooltip xScale={this.xScale}
                         yScale={this.yScale}
                         data={data}  />
            </svg>
        );
    }
}

class Tooltip extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            mouseMove: false,
            x: null
        };
        this.xScale = props.xScale;
        this.yScale = props.yScale;
    }

    render() {
        const {data} = this.props;
        const onMouseMove = evt => {
            this.setState({
                mouseMove: true,
                x: evt.clientX
            });
        };
        const onMouseOut = evt => {
            this.setState({
                mouseMove: false,
                x: null
            });
        };

        let scaledClosestPoint, closestPoint;
        if (this.state.mouseMove) {
            closestPoint = data[searchForClosest(data, this.xScale.invert(this.state.x))];
            scaledClosestPoint = {
                x: this.xScale(closestPoint.x),
                y: this.yScale(closestPoint.y)
            }
        }
        
        return (
            <g>
                {this.state.mouseMove &&
                        <g>
                            <text x={scaledClosestPoint.x + 10}
                                y={scaledClosestPoint.y - 10}>
                                {closestPoint.x}ms
                            </text>
                            <text x={scaledClosestPoint.x + 10}
                                y={scaledClosestPoint.y + 10}>
                                {closestPoint.y}
                            </text>
                            <circle cx={scaledClosestPoint.x}
                                    cy={scaledClosestPoint.y} r={10} />
                            <line stroke="black"
                                x1={scaledClosestPoint.x}
                                y1={0} 
                                x2={scaledClosestPoint.x} 
                                y2={chartHeight} />
                        </g>
                    }
                <rect fill="transparent" stroke="none"
                    onMouseOut={onMouseOut} 
                    onMouseMove={onMouseMove}
                    width={chartWidth}
                    height={chartHeight}
                    x={0}
                    y={0} />
            </g>
        );
    }
}

function Ticks({yScale}) {
    const tickCount = 10;
    const ticks = yScale.ticks(tickCount);
    const tickFormat = yScale.tickFormat(tickCount);
    return (
        <g>
            {map(ticks, (t, i) =>
                <line key={"line-" + i}
                      stroke="black"
                      x1={0} 
                      x2={chartWidth}
                      y1={yScale(t)} 
                      y2={yScale(t)} />)}
            {map(ticks, (t, i) => 
                <text key={"text-" + i} 
                      x={chartWidth + 10} 
                      y={yScale(t)}>
                    {tickFormat(t)}
                </text>)}
        </g>
    );    
}

const binSearch = (list, val, begin, middle, end) => {
    const diff =  - val;
    const middleVal = list[middle].x;
    if (begin == middle) {
        const indices = [begin, middle, end];
        const values = [Math.abs(val - list[begin].x), Math.abs(val - list[middle].x), Math.abs(val - list[end].x)];
        const index = values.indexOf(Math.min.apply(Math, values));
        return indices[index];
    }

    if (middleVal == val) {
        return middle;
    }
    if (val < middleVal) {
        return binSearch(list, val, begin, middle - (middle - begin) / 2 | 0, middle);
    }
    if (middleVal < val) {
        return binSearch(list, val, middle, middle + Math.ceil((end - middle) / 2), end);
    }
};

const searchForClosest = (list, val) => {
    return binSearch(list, val, 0, list.length / 2 | 0, list.length - 1);
};

ReactDOM.render(
    <FirstLineChart data={mappedMyData} />,
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