const Chartscii = require('chartscii')
const SerialPort = require('serialport')
const Delimiter = SerialPort.parsers.Delimiter
Tail = require('tail').Tail;

let tracking = {}

const drawChart = () => {

    // what charts do we want?
    // - Most total time spent in functions overall
    // - Longest individual function calls
    // - Time spent in each call
    let totalCalls = []
    let totalTime = []
    let timePerCall = []

    // chartscii accepts data in objects or simply an array of numeric values
    // [{ value: 2, label: 'some_label' }, { value: 2, label: 'some_label' }]


    for (const [mark, value] of Object.entries(tracking)) {

        totalCalls.push({value: value.totalCalls, label: `${mark}: ${value.totalCalls}`})
        totalTime.push({value: value.totalTimeForMarkOverall, label: `${mark}: ${value.totalTimeForMarkOverall}`})

        for (const callTime of value.completedCalls) {

            timePerCall.push({value: callTime, label: `${mark}: ${callTime}`})
        }
    }

    const chart1 = new Chartscii(totalCalls, {
        label: 'Total calls',
        theme: 'pastel',
        width: 50,
        char: '■',
        sort: true,
        reverse: true,
        color: 'green'
    })

    const chart2 = new Chartscii(totalTime, {
        label: 'Total time',
        theme: 'pastel',
        width: 50,
        char: '■',
        sort: true,
        reverse: true,
        color: 'green'
    })

    const chart3 = new Chartscii(totalTime, {
        label: 'Time per call',
        theme: 'pastel',
        width: 50,
        char: '■',
        sort: true,
        reverse: true,
        color: 'green'
    })

    console.log(`totalCalls`)
    console.log(totalCalls)
    console.log(`totalTime`)
    console.log(totalTime)
    console.log(`totalTime`)
    console.log(totalTime)

    console.log(chart1.create())
    console.log(chart2.create())
    console.log(chart3.create())
}

const handleData = (value) => {

    console.log(`handle value: ${value}`)

    if (value.includes(`PROFILE_START`)) {

        let mark = value.split(`PROFILE_START `)[1]

        if (!tracking[mark]) {

            tracking[mark] = {
                totalCalls: 0,
                totalTimeForMarkOverall: 0,
                openCallTracking: [],
                completedCalls: []
            }
        }

        tracking[mark].totalCalls++
        tracking[mark].openCallTracking.push({
            timeStart: new Date()
        })

        return
    }

    if (value.includes(`PROFILE_END`)) {

        let mark = value.split(`PROFILE_END `)[1]

        if (!tracking[mark]) {

            console.log(`error: no tracking info found for ${mark}, but END was just called`)

            return
        }

        // always take the last open call -- this should work even in recursive situations i think
        let openCallTracking = tracking[mark].openCallTracking.pop()
        let totalTimeForCall = new Date() - openCallTracking.timeStart

        tracking[mark].totalTimeForMarkOverall += totalTimeForCall
        tracking[mark].completedCalls.push(totalTimeForCall)

        return
    }

    if (value.includes(`PROFILE_COMPLETE`)) {

        console.log(JSON.stringify(tracking))

        drawChart()

        tracking = {}

        return
    }

    console.log(`bad profile value`)

    return
}

if (process.env.USE_SERIAL) {

    const MESSAGE_DELIMITER = `;;@@&&`

    const parser = new Delimiter({
      delimiter: MESSAGE_DELIMITER,
      includeDelimiter: false
    })
    
    const SERIAL_PORT = process.env.SERIAL_PORT || '/dev/ttys000'
    
    const port = new SerialPort(SERIAL_PORT, {
      baudRate: 28800
    })


    port.pipe(parser)

    parser.on('data', function (data) {
        handleData(new String(data))
    })

    port.on('error', function(err) {
        console.log('Error: ', err.message)
    })
} else {

    tail = new Tail(process.env.FILE_PATH)

    tail.on("line", function(data) {

        handleData(new String(data))
    })
}