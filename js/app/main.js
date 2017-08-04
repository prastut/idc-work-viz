define(["jquery", "d3",
        "./utils/helper", "./utils/data",
        "./utils/graph", "./utils/linegraph", "./utils/scattergraph", "./utils/events", "./utils/players"
    ],
    function($, d3, helper, data, graph, lineGraph, scatterGraph, eventsGraph, playersGraph) {


        var lineData = {};
        var scatterData = {};

        $(function() {

            var params = {};
            var channel = "germany";
            params.start_timestamp = 1499019290;
            params.end_timestamp = 1499021000;
            params.user_type = "FAMOUS";


            var width = Math.round(parseInt(d3.select("#chart_container").style("width")));
            var height = Math.round(parseInt(d3.select("#chart_container").style("height")));

            var modelChart = graph.chart().width(width).height(height);
            d3.select('#chart_container').call(modelChart);

            //Data

            helper.pL(lineData, channel, helper.fakeDataFormatter(data.fakeLine, params.start_timestamp));
            helper.pS(scatterData, channel, helper.fakeDataFormatterScatter(data.fakeLine, 1499019288));


            //Axis
            var commonXAxis = d3.scaleTime()
                .domain([params.start_timestamp * 1000, params.end_timestamp * 1000])
                .range([0, helper.widthDependingOnPage(width)]);


            var commonXZoomAxis = d3.scaleTime()
                .domain(commonXAxis.domain())
                .range(commonXAxis.range());

            var svg = d3.select(".chart");

            var transform = d3.zoomIdentity;

            var overallZoom = d3.zoom()
                .scaleExtent([1, 10])
                .translateExtent([
                    [0, 0],
                    [helper.widthDependingOnPage(width), height]
                ])
                .extent([
                    [0, 0],
                    [helper.widthDependingOnPage(width), height]
                ])
                .on("zoom", zoomHandler);


            var lineChart = lineGraph.init()
                .x(commonXAxis)
                .height(height * 0.70)
                .data(lineData[channel]);

            var scatterChart = scatterGraph.init()
                .height(height * 0.70)
                .width(helper.widthDependingOnPage(width))
                .x(commonXAxis)
                .data(scatterData[channel])
                .zoom(d3.zoomIdentity);

            svg.call(lineChart).call(scatterChart);

            var eventsChart = eventsGraph.init()
                .yPos($('.axis--y')[0].getBoundingClientRect().height + 20)
                .height(height)
                .width(helper.widthDependingOnPage(width))
                .x(commonXAxis)
                .data(lineData[channel].events)
                .zoom(d3.zoomIdentity);


            svg.call(eventsChart);

            svg.call(overallZoom);

            d3.select(window).on('resize', resize);





            function zoomHandler() {

                transform = d3.event.transform;
                // console.log(transform);
                commonXAxis.domain(transform.rescaleX(commonXZoomAxis).domain());
                updateCharts();


            }

            function updateCharts() {
                lineChart.x(commonXAxis);
                scatterChart.width(helper.widthDependingOnPage(width)).x(commonXAxis).zoom(transform);
                eventsChart.width(helper.widthDependingOnPage(width)).x(commonXAxis).zoom(transform);

            }



            // // overallZoom.scaleTo(svg, 1);
            // // overallZoom.translateBy(svg, -width, -height);



            // function zoomHandler() {
            //     // live("stop");

            //     transform = d3.event.transform;
            //     // console.log(transform);
            //     commonXAxis.domain(transform.rescaleX(commonXZoomAxis).domain());
            //     updateCharts();


            // }

            // //Going Live


            // var liveData = helper.fakeDataFormatter(data.liveFakeLine,
            //     lineData[channel].timestamps[lineData[channel].timestamps.length - 1] / 1000,
            //     "seconds");

            // console.log(liveData);

            // // // Update Common Axis
            // var xAxisLive;
            // var scatterLive;
            // var lineLive;

            // var minTime = 1499019468000;
            // var maxTime = 1499020728000;

            // function live(state) {


            //     if (!(xAxisLive || scatterLive || lineLive)) {

            //         xAxisLive = setInterval(function() {

            //             maxTime = maxTime + 1 * 1000;
            //             commonXAxis.domain([minTime, maxTime]);
            //             commonXZoomAxis.domain(commonXAxis.domain());
            //             commonXAxis.domain(transform.rescaleX(commonXZoomAxis).domain());
            //         }, 1000);




            //         scatterLive = setInterval(function() {

            //             console.log("Scatter UPDATE");

            //             // var liveScatter = [];

            //             // liveScatter.push({
            //             //     time: scatterTime,
            //             //     joshua_kimmich: [{
            //             //         sentiment_index: -Math.random() * 10,
            //             //         text: "Tweet 2",
            //             //     }, {
            //             //         sentiment_index: +Math.random() * 10,
            //             //         text: "Tweet 3"
            //             //     }]
            //             // });

            //             // scatterTime = scatterTime + 1;



            //             // helper.pS(scatterData, channel, liveScatter);
            //             scatterChart.x(commonXAxis).data(scatterData[channel]);

            //             // svg.call(overallZoom);


            //         }, 1000);

            //         // Update Line Chart Data

            //         lineLive = setInterval(function() {

            //             console.log("Line + Events");

            //             var x = liveData.shift();
            //             if (x) {
            //                 helper.pL(lineData, channel, [x]);
            //                 lineChart.x(commonXAxis).data(lineData[channel]);
            //                 eventsChart.x(commonXAxis).data(lineData[channel].events);
            //             } else {
            //                 console.log("STOPPED");
            //                 liveStop();
            //                 maxTime = maxTime + 100 * 1000;
            //                 commonXAxis.domain([minTime, maxTime]);
            //                 commonXZoomAxis.domain(commonXAxis.domain());
            //                 eventsChart.x(commonXAxis).data(lineData[channel].events);

            //             }

            //         }, 1000);

            //     }


            // }

            // function liveStop() {

            //     clearInterval(xAxisLive);
            //     clearInterval(scatterLive);
            //     clearInterval(lineLive);

            // }


            // // live();
            // // liveStop();








            function resize() {

                width = Math.round(parseInt(d3.select("#chart_container").style("width")));

                //Container Update
                modelChart.width(width);

                // Axis Update
                commonXAxis.range([0, helper.widthDependingOnPage(width)]);
                commonXZoomAxis.range(commonXAxis.range());

                // Charts Update
                updateCharts();

            }


            var iframetimer;

            function mousemoveIframe() {

                d3.select("body").style("background", "rgba(54, 61, 82, 0.2)");
                d3.select("#chart_container").style("opacity", "1");


                if (iframetimer) clearTimeout(iframetimer);
                iframetimer = setTimeout(function() {
                    d3.select("#chart_container").transition().style("opacity", "0");
                    d3.select("body").style("background", "none");
                }, 2000);

            }


        });
    });