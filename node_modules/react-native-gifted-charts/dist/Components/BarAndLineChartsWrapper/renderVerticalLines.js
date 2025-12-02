var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx } from "react/jsx-runtime";
import { createElement as _createElement } from "react";
import { View } from 'react-native';
import { chartTypes } from 'gifted-charts-core';
import { Line, Svg } from 'react-native-svg';
var RenderVerticalLines = function (props) {
    var showVerticalLines = props.showVerticalLines, // this is the value passed by user (note that it's not the effective value that is computed by traversing through the data array and finding any item for which showVerticalLines is true)
    verticalLinesAr = props.verticalLinesAr, verticalLinesSpacing = props.verticalLinesSpacing, spacing = props.spacing, initialSpacing = props.initialSpacing, verticalLinesZIndex = props.verticalLinesZIndex, verticalLinesHeight = props.verticalLinesHeight, verticalLinesThickness = props.verticalLinesThickness, verticalLinesColor = props.verticalLinesColor, verticalLinesStrokeDashArray = props.verticalLinesStrokeDashArray, verticalLinesShift = props.verticalLinesShift, verticalLinesUptoDataPoint = props.verticalLinesUptoDataPoint, verticalLinesStrokeLinecap = props.verticalLinesStrokeLinecap, xAxisThickness = props.xAxisThickness, labelsExtraHeight = props.labelsExtraHeight, containerHeight = props.containerHeight, data = props.data, stackData = props.stackData, barWidth = props.barWidth, maxValue = props.maxValue, chartType = props.chartType, containerHeightIncludingBelowXAxis = props.containerHeightIncludingBelowXAxis, totalWidth = props.totalWidth, xAxisLabelsVerticalShift = props.xAxisLabelsVerticalShift;
    var getHeightOfVerticalLine = function (index) {
        if (verticalLinesUptoDataPoint) {
            if (index < data.length) {
                return ((data[index].value * containerHeight) / maxValue - xAxisThickness);
            }
            else {
                return verticalLinesHeight !== null && verticalLinesHeight !== void 0 ? verticalLinesHeight : 0;
            }
        }
        else {
            return (verticalLinesHeight ||
                containerHeightIncludingBelowXAxis - xAxisThickness);
        }
    };
    var extendedContainerHeight = containerHeight + 10 + labelsExtraHeight;
    var thickness = verticalLinesThickness || 2;
    var heightAdjustmentDueToStrokeLinecap = verticalLinesStrokeLinecap === 'round' ||
        verticalLinesStrokeLinecap === 'square'
        ? thickness / 2
        : 0;
    return (_jsx(View, { style: {
            position: 'absolute',
            height: containerHeightIncludingBelowXAxis,
            bottom: 60 + xAxisLabelsVerticalShift, //stepHeight * -0.5 + xAxisThickness,
            left: 0,
            width: totalWidth,
            zIndex: verticalLinesZIndex || -1,
        }, children: _jsx(Svg, { height: containerHeightIncludingBelowXAxis, width: totalWidth, children: verticalLinesAr.map(function (item, index) {
                var _a, _b, _c, _d, _e, _f;
                var totalSpacing = initialSpacing;
                if (verticalLinesSpacing) {
                    totalSpacing = verticalLinesSpacing * (index + 1);
                }
                else {
                    if (stackData) {
                        totalSpacing += (stackData[0].barWidth || barWidth || 30) / 2;
                    }
                    else {
                        totalSpacing += (data[0].barWidth || barWidth || 30) / 2;
                    }
                    for (var i = 0; i < index; i++) {
                        var actualSpacing = spacing;
                        if (stackData) {
                            if (i >= stackData.length - 1) {
                                actualSpacing += (barWidth || 30) / 2;
                            }
                            else {
                                if (stackData[i].spacing || stackData[i].spacing === 0) {
                                    actualSpacing = stackData[i].spacing;
                                }
                                if (stackData[i + 1].barWidth) {
                                    actualSpacing += stackData[i + 1].barWidth;
                                }
                                else {
                                    actualSpacing += barWidth || 30;
                                }
                            }
                        }
                        else {
                            if (i >= data.length - 1) {
                                actualSpacing += (barWidth || 30) / 2;
                            }
                            else {
                                if (data[i].spacing || data[i].spacing === 0) {
                                    actualSpacing = data[i].spacing;
                                }
                                if (data[i + 1].barWidth) {
                                    actualSpacing += data[i + 1].barWidth;
                                }
                                else {
                                    actualSpacing += barWidth || 30;
                                }
                            }
                        }
                        totalSpacing += actualSpacing;
                    }
                }
                if (!showVerticalLines && !item.showVerticalLine) {
                    return null;
                }
                var verticalLinesShiftLocal = chartType === chartTypes.BAR
                    ? ((_a = item.verticalLineShift) !== null && _a !== void 0 ? _a : verticalLinesShift)
                    : verticalLinesShift;
                var x = verticalLinesShiftLocal +
                    1 +
                    (chartType === chartTypes.BAR // This logic exists because we have renderSpecificVerticalLines in Line Charts which I would love to deprecate at the earliest, because that functionality gets handled here elegantly
                        ? totalSpacing - 1
                        : verticalLinesSpacing
                            ? verticalLinesSpacing * (index + 1)
                            : index * spacing + (initialSpacing - 2));
                var lineProps = chartType === chartTypes.BAR // This logic exists because we have renderSpecificVerticalLines in Line Charts which I would love to deprecate at the earliest, because that functionality gets handled here elegantly
                    ? {
                        y2: containerHeightIncludingBelowXAxis -
                            heightAdjustmentDueToStrokeLinecap,
                        stroke: ((_b = item.verticalLineColor) !== null && _b !== void 0 ? _b : verticalLinesColor) ||
                            'lightgray',
                        strokeWidth: ((_c = item.verticalLineThickness) !== null && _c !== void 0 ? _c : verticalLinesThickness) || 2,
                        strokeDasharray: (_e = (_d = item.verticalLineStrokeDashArray) !== null && _d !== void 0 ? _d : verticalLinesStrokeDashArray) !== null && _e !== void 0 ? _e : '',
                        strokeLinecap: (_f = item.verticalLineStrokeLinecap) !== null && _f !== void 0 ? _f : verticalLinesStrokeLinecap,
                    }
                    : {
                        y2: containerHeightIncludingBelowXAxis -
                            heightAdjustmentDueToStrokeLinecap,
                        stroke: verticalLinesColor || 'lightgray',
                        strokeWidth: verticalLinesThickness || 2,
                        strokeDasharray: verticalLinesStrokeDashArray !== null && verticalLinesStrokeDashArray !== void 0 ? verticalLinesStrokeDashArray : '',
                        strokeLinecap: verticalLinesStrokeLinecap,
                    };
                return (_createElement(Line, __assign({}, lineProps, { key: index, x1: x, y1: extendedContainerHeight -
                        getHeightOfVerticalLine(index) +
                        heightAdjustmentDueToStrokeLinecap, x2: x })));
            }) }) }));
};
export default RenderVerticalLines;
