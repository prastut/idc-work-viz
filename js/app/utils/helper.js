define(function() {

    function pushLineData(lineData, channel, data, live) {
        live = live == "live" ? true : false;

        var timestamps = [];
        var max;


        if (!(channel in lineData)) {
            lineData[channel] = {};
            lineData[channel].neg = [];
            lineData[channel].pos = [];
            lineData[channel].events = [];
            lineData[channel].timestamps = [];
            max = 0;
        } else {
            max = lineData[channel].max;
        }


        for (var i in data) {

            var time = data[i].time * 1000;

            lineData[channel].neg.push({
                sentiment: data[i][channel].neg,
                time: time
            });

            lineData[channel].pos.push({
                sentiment: data[i][channel].pos,
                time: time
            });

            if (data[i][channel].event) {
                lineData[channel].events.push({
                    event: data[i][channel].event,
                    time: time,
                    timeDisplay: data[i].timeDisplay,
                    type: data[i][channel].event.split('<br>')[0].split(':')[0],
                    country: data[i][channel].event.split('<br>')[1]
                });
            }

            max = Math.max(max, Math.max(parseFloat(data[i][channel].pos), parseFloat(data[i][channel].neg)));
            lineData[channel].timestamps.push(time);

        }

        lineData[channel].max = max;
    }


    function urlGenerator(url) {
        return "https://api.bubble.social/" + url;
    }


    function pushScatterData(scatterData, channel, data, live) {


        var series = [];
        var i;

        for (i in data) {

            var obj = {};
            var array = [];

            for (var tweet in data[i][channel]) {

                var sentiment = Math.abs(data[i][channel][tweet].sentiment_index);
                var sign = data[i][channel][tweet].sentiment_index < 0 ? '-' : '+';

                array.push({
                    'sentiment_index': sentiment,
                    'text': data[i][channel][tweet].text,
                    'type': sign
                });
            }

            obj.x = data[i].time * 1000;
            obj.y = array;

            series.push(obj);

        }


        var scatterSeries = [];
        var max = 0;

        for (i = 0; i < series.length; i++) {

            len = series[i].y.length;
            max = Math.max(max, len);
        }

        for (i = 0; i < max; i++) {
            scatterSeries.push([]);
        }

        for (i = 0; i < series.length; i++) {
            len = series[i].y.length;
            x = series[i].x;

            for (var j = 0; j < len; j++) {
                y = series[i].y[j];
                scatterSeries[j].push({
                    x: x,
                    y: y
                });

            }
        }


        // First Time Updating
        if (!(channel in scatterData)) {
            scatterData[channel] = scatterSeries;
            // console.log("FIRST TIME", scatterData[channel]);


        } else { //Live Updating

            // console.log("NEW DATA", scatterSeries);

            var prevDataLength = scatterData[channel].length;
            var newDataLength = scatterSeries.length;

            var minLength = Math.min(scatterData[channel].length, scatterSeries.length);

            if (minLength == newDataLength) {
                // Old Data has larger number of independent arrays

                for (i = 0; i < minLength; i++) {

                    scatterData[channel][i] = scatterData[channel][i].concat(scatterSeries[i]);
                }
            } else {
                // New Data has large number of independent arrays
                var compartmentsToBeAdded = newDataLength - prevDataLength;

                for (i = 0; i < compartmentsToBeAdded; i++) {

                    scatterData[channel].push([]);
                }

                for (i = 0; i < newDataLength; i++) {

                    scatterData[channel][i] = scatterData[channel][i].concat(scatterSeries[i]);
                }

            }

            // console.log("UPDATED", scatterData[channel]);

        }


    }

    function fakeDataFormatter(data, startTime, seconds) {
        seconds = seconds || false;

        var prettyData = [];


        for (var i in data) {
            var obj = {};

            if (seconds) {
                obj.time = startTime + parseInt(data[i].Time);
                obj.timeDisplay = {};
                obj.timeDisplay.time = parseInt(data[i].Time);
                obj.timeDisplay.unit = "seconds";
            } else {
                obj.time = startTime + parseInt(data[i].Time) * 60;
                obj.timeDisplay = {};
                obj.timeDisplay.time = parseInt(data[i].Time);
                obj.timeDisplay.unit = "minutes";
            }


            obj.germany = {};
            obj.germany.neg = data[i].Neg;
            obj.germany.pos = data[i].Pos;
            obj.germany.event = data[i].Event;

            prettyData.push(obj);

        }

        // console.log(prettyData);

        return prettyData;

    }

    function fakeDataFormatterScatter(data, startTime, seconds) {


        var prettyData = [];


        var sample = {
            time: 1499019290,
            joshua_kimmich: [{
                sentiment_index: 2.3,
                text: "Hello World",
            }, {
                sentiment_index: 4.5,
                text: "Hello 2"
            }]
        }



        var signs = [-1, 1];

        for (var i = 0; i < data.length; i++) {

            if (data[i + 1]) {

                var timeDiff = parseInt(data[i + 1].Time) - parseInt(data[i].Time);

                var totalnoOfTweets = timeDiff < 5 ? Math.ceil(Math.random() * 2) : Math.floor(Math.random() * 5);

                var obj = {};
                obj.time = startTime;
                obj.time += seconds ? parseInt(data[i].Time) : parseInt(data[i].Time) * 60;
                obj.germany = [];



                for (var j = 0; j < totalnoOfTweets; j++) {

                    var tweet = {};
                    tweet.sentiment_index = Math.random() * 10 * signs[Math.floor(Math.random() * 2)];
                    tweet.text = "Tweet Content will be shown here";
                    obj.germany.push(tweet);


                }

                prettyData.push(obj);

            }


        }


        return prettyData;

    }

    function widthDependingOnPage(w) {
        return window.location.pathname == "/get-video-overlay" ? w * 0.70 : w;
    }


    return {
        pL: pushLineData,
        pS: pushScatterData,
        url: urlGenerator,
        fakeDataFormatter: fakeDataFormatter,
        fakeDataFormatterScatter: fakeDataFormatterScatter,
        widthDependingOnPage: widthDependingOnPage

    };


});