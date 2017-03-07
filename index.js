import ReactDOM from "react-dom";
import React from "react";
import map from "lodash.map";
import first from "lodash.first";
import last from "lodash.last";
import times from "lodash.times";
import throttle from "lodash.throttle";
import {area} from "d3-shape";
import * as scale from "d3-scale";
import myData from "./test_data";
import simplify from "simplify-js";

window.NODE_ENV = "production";

const mappedMyData = map(myData, d => ({ x: d[0], y: d[1] }));

const linear = scale.scaleLinear;

const chartWidth = 500;
const chartHeight = 500;
const svgWidth = 2000;
const svgHeight = 2000;

class FirstLineChart extends React.PureComponent {
    constructor(props) {
        super(props);
        const {x, y, height, width} = this.props;

        const data = this.props.data;
        const ySortedData = data.slice(0).sort((a, b) => a.y - b.y);

        const minY = first(ySortedData).y;
        const maxY = last(ySortedData).y;
        const minX = first(data).x;
        const maxX = last(data).x;

        this.yScale = linear()
            .domain([minY, maxY])
            .range([y + height, y]);

        this.xScale = linear()
            .domain([minX, maxX])
            .range([x, x + width]);

        this.area = area()
            .x(d => this.xScale(d.x))
            .y0(y + height)
            .y1(d => this.yScale(d.y));
    }

    render() {
        const data = this.props.data;

        return (
            <g>
                <Ticks yScale={this.yScale}
                       xScale={this.xScale} />
                <path className="area"
                      fill="transparent"
                      stroke="black" 
                      d={this.area(data)} />
                <Tooltip width={this.props.width}
                         height={this.props.height}
                         x={this.props.x}
                         y={this.props.y}
                         xScale={this.xScale}
                         yScale={this.yScale}
                         data={data}  />
            </g>
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
                            <line stroke="black"
                                x1={scaledClosestPoint.x}
                                y1={this.props.y} 
                                x2={scaledClosestPoint.x} 
                                y2={this.props.y + this.props.height} />
                            <circle cx={scaledClosestPoint.x}
                                    cy={scaledClosestPoint.y} r={10} />
                        </g>
                    }
                <rect fill="transparent" stroke="none"
                    onMouseOut={onMouseOut} 
                    onMouseMove={onMouseMove}
                    width={this.props.width}
                    height={this.props.height}
                    x={this.props.x}
                    y={this.props.y} />
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
        const middleDist = Math.abs(val - list[middle].x);
        const endDist = Math.abs(val - list[end].x)
        if (middleDist < endDist) {
            return middle;
        }
        return end;
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

class Charts extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <svg width={svgWidth} height={svgHeight}>
                <FirstLineChart x={0} y={10} width={chartWidth} height={chartHeight} data={mappedMyData} />
                <FirstLineChart x={0} y={10 + chartHeight} width={chartWidth} height={chartHeight} data={mappedMyData} />
            </svg>
        ); 
    }
}

ReactDOM.render(
    <Charts />,
    document.getElementById("root")
)
