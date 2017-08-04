define(["d3", "twemoji", "jquery"], function(d3, emoji) {


    function scatterGraph() {

        // Data Model
        var data = {};
        var updateData;

        //Axis
        var x;
        var y = d3.scaleLinear();
        var yAxis = d3.axisRight(y);


        // Dimensions
        var width;
        var height;
        var updateWidth;

        //Initial Zoom Level
        var zoom;

        var tweetshow = d3.select("body")
            .append("div")
            .attr("class", "tweet")
            .style("opacity", 0);

        var emoji = d3.select("body")
            .append("div")
            .attr("class", "emoji")
            .style("opacity", 0)
            .style("position", "absolute");

        var positiveEmotions = {
            2: '1F60A',
            1: '1F601',
            0: '1F606'
        };

        var negetiveEmotions = {
            2: '1F612',
            1: '1F61E',
            0: '1F620'

        };


        function chart(selection) {
            selection.each(function() {

                var dom = d3.select(this);

                // Axis
                y.domain([0, 9]).range([height, 0]);

                var scatter = dom.append("g")
                    .attr("class", "scatter-chart");

                var scatterdots = scatter.selectAll(".series")
                    .data(data)
                    .enter().append("g")
                    .attr("class", "series")
                    .selectAll(".point")
                    .data(function(d) { return d; })
                    .enter().append("g")
                    .attr("class", "point");

                var setCircleSize = 10;


                //Clip Circles
                var clipCircles = scatterdots.append("svg:clipPath")
                    .attr("id", function(d, i) {
                        return "clip-circle-" + d.x + d.y.sentiment_index;
                    })
                    .append("circle")
                    .attr("r", setCircleSize)
                    .attr("cx", function(d) { return x(d.x); })
                    .attr("cy", function(d) { return y(d.y.sentiment_index); })
                    .attr("transform", function() {
                        return "translate" + "(" + setCircleSize + "," + setCircleSize + ")";
                    });

                //Image
                var image = scatterdots.append("image")
                    .attr("class", "point-image")
                    .attr("x", function(d) { return x(d.x); })
                    .attr("y", function(d) { return y(d.y.sentiment_index); })
                    .attr("width", (setCircleSize * 2) + "px")
                    .attr("height", (setCircleSize * 2) + "px")
                    .attr("xlink:href", function(d, i) {
                        return "https://randomuser.me/api/portraits/thumb/men/" + Math.floor(Math.random() * 50) + ".jpg";
                    })
                    .attr("clip-path", function(d, i) {
                        return 'url(#clip-circle-' + d.x + d.y.sentiment_index + ")";

                    })
                    .on("click", click);

                // Stroke Circles
                var strokeCircles = scatterdots.append("circle")
                    .attr("class", "point-image-circle")
                    .attr("r", setCircleSize)
                    .attr("cx", function(d) { return x(d.x); })
                    .attr("cy", function(d) { return y(d.y.sentiment_index); })
                    .attr("transform", function() {
                        return "translate" + "(" + setCircleSize + "," + setCircleSize + ")";
                    })
                    .style("fill", "none")
                    .style("stroke", function(d) {
                        if (d.y.type == "-") {
                            return "red";
                        } else {
                            return "green";
                        }
                    });


                var coords = [];

                scatter.append("g")
                    .attr("class", "axis axis--y")
                    .call(yAxis.tickValues(d3.range(0, 9, 3)));

                scatter.selectAll(".tick").each(function(data) {
                    var tick = d3.select(this);
                    var transform = tick.attr("transform");
                    var c = transform.substring(transform.indexOf("(") + 1, transform.indexOf(")")).split(",")[1];
                    coords.push(parseInt(c));
                });


                coords.push(0);
                coords = coords.sort();
                coords.splice(coords.length - 1, 1);

                var heightGrid = coords[1] - coords[0];


                var maskGroup = scatter.append("g")
                    .attr("class", "mask-rect");

                var mask = maskGroup.append("defs").append("mask").attr("id", "mymask");

                var maskRect = mask.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height)
                    .style("fill", "white")
                    .style("opacity", 0.9);

                var maskCircle = mask.append("circle");


                var overlayRect = maskGroup
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", 0)
                    .attr("mask", "url(#mymask)")
                    .style("fill", "rgba(54, 61, 82, 5)");



                updateScatterData = function() {


                    var t = d3.transition().duration(750);

                    var update = scatter.selectAll(".series")
                        .data(data);


                    update.exit().remove();

                    // var point = update.enter()
                    //     .append("g")
                    //     .attr("class", "series")
                    //     .merge(update)
                    //     .selectAll(".point")
                    //     .data(function(d) { return d; })
                    //     .enter().append("g")
                    //     .attr("class", "point");


                    // dots
                    //     .attr("cy", function(d) { return y(d.y.sentiment_index); })
                    //     .attr("cx", x.range()[1]) // Transistion from the extreme right to the screen
                    //     .transition(t)
                    //     .attr("cx", function(d) { return x(d.x); })
                    //     .style("stroke", function(d) {
                    //         if (d.y.type == "-") {
                    //             return "red";
                    //         } else {
                    //             return "green";
                    //         }
                    //     });

                    // dots.on("click", click);

                    // var alldots = scatter.selectAll(".series")
                    //     .selectAll(".point")
                    //     .attr("cy", function(d) { return y(d.y.sentiment_index); })
                    //     .transition(t)
                    //     .attr("cx", function(d) { return x(d.x); });



                };

                zoomScatter = function() {
                    resizeScatter();
                };

                resizeScatter = function() {

                    clipCircles
                        .attr("r", function() {
                            var width = setScatterAttr();
                            return width;
                        })
                        .attr("cx", function(d) { return x(d.x); })
                        .attr("transform", function() {

                            var translate = setScatterAttr();
                            return "translate(" + (translate) + "," + (translate) + ")";

                        });


                    //Image
                    image
                        .attr("x", function(d) { return x(d.x); })
                        .attr("width", function() {
                            var width = setScatterAttr();
                            return width * 2;
                        })
                        .attr("height", function() {
                            var height = setScatterAttr();
                            return height * 2;

                        });

                    strokeCircles
                        .attr("r", function() {
                            var width = setScatterAttr();
                            return width;
                        })
                        .attr("cx", function(d) { return x(d.x); })
                        .attr("transform", function() {
                            var translate = setScatterAttr();
                            return "translate(" + (translate) + "," + (translate) + ")";

                        });

                };

                updateWidthScatter = function() {

                    maskRect.attr("width", width);
                    overlayRect.attr("width", width);
                };



                function click(d) {

                    var circleCords = d3.select(this.parentNode).select(".point-image-circle");

                    maskCircle
                        .attr("cx", circleCords.attr("cx"))
                        .attr("cy", circleCords.attr("cy"))
                        .attr("r", parseInt(circleCords.attr("r")) + 5)
                        .attr("transform", circleCords.attr("transform"));


                    overlayRect
                        .transition()
                        .attr("height", height);


                    var yClick = d3.mouse(this)[1];
                    var coordsLocal = coords.slice();

                    tweetshow.transition()
                        .duration(200)
                        .style("opacity", 0.9);

                    tweetshow.html(d.y.text)
                        .style("left", (width / 2) + "px")
                        .style("top", (height / 2) + "px");

                    emoji.transition()
                        .duration(200)
                        .style("opacity", 0.9);


                    var segmentClicked = d3.bisectRight(coordsLocal, yClick) - 1;

                    var text = d.y.type == "-" ? negetiveEmotions[segmentClicked] : positiveEmotions[segmentClicked];

                    emoji.html(twemoji.convert.fromCodePoint(text))
                        .style("left", (5) + "px")
                        .style("top", (coordsLocal[segmentClicked] + heightGrid / 2 + 50) + "px");


                    setTimeout(function() {

                        tweetshow.transition()
                            .duration(500)
                            .style("opacity", 0);

                        emoji.transition()
                            .duration(500)
                            .style("opacity", 0);

                        overlayRect
                            .transition()
                            .duration(500)
                            .attr("height", 0);


                    }, 2000);


                }

                function setScatterAttr() {
                    return setCircleSize * zoom.k > 30 ? 30 : setCircleSize * zoom.k;
                }


            });
        }

        chart.data = function(value) {
            if (!arguments.length) return data;
            data = value;
            if (typeof updateScatterData === 'function') updateScatterData();
            return chart;
        };


        chart.zoom = function(value) {
            if (!arguments.length) return zoom;
            zoom = value;
            if (typeof zoomScatter === 'function') zoomScatter();
            return chart;
        };


        chart.width = function(value) {
            if (!arguments.length) return 960;
            width = value;
            if (typeof updateWidthScatter === 'function') updateWidthScatter();
            return chart;
        };

        chart.height = function(value) {
            if (!arguments.length) return 500;
            height = value;
            return chart;
        };

        chart.x = function(commonXAxis) {
            if (!arguments.length) return d3.scaleTime();
            x = commonXAxis;
            if (typeof resizeScatter === 'function') resizeScatter();
            return chart;
        };

        return chart;
    }



    return {
        init: scatterGraph
    };
});