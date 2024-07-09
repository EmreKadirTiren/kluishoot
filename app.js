const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const events = require('events')
const timeUpEvent = new events.EventEmitter()

io.on('connection', (socket) => {
    console.log("A user connected!")
})

app.use(express.static('public'))
http.listen(3000, () => {
    console.log('listening on *:3000')
})

const questions = [{
    text: "In Python, what symbol is used to start a comment?",
    time: 10,
    answers: [
        "#",
        "//",
        "/*",
        "%"
    ],
    correctAnswer: "#"
},
{
    text: "Which language is primarily used for web development?",
    time: 10,
    answers: [
        "Python",
        "C++",
        "JavaScript",
        "Java"
    ],
    correctAnswer: "JavaScript"
},
{
    text: "In HTML, which tag is used to create a hyperlink?",
    time: 10,
    answers: [
        "<link>",
        "<a>",
        "<href>",
        "<url>"
    ],
    correctAnswer: "<a>"
},
{
    text: "Which keyword is used to define a function in Python?",
    time: 10,
    answers: [
        "function",
        "def",
        "fun",
        "define"
    ],
    correctAnswer: "def"
},
{
    text: "What does CSS stand for?",
    time: 10,
    answers: [
        "Cascading Style Sheets",
        "Computer Style Sheets",
        "Creative Style Sheets",
        "Colorful Style Sheets"
    ],
    correctAnswer: "Cascading Style Sheets"
},
{
    text: "In JavaScript, which operator is used to assign a value to a variable?",
    time: 10,
    answers: [
        "==",
        "===",
        ":",
        "="
    ],
    correctAnswer: "="
},
{
    text: "What does HTML stand for?",
    time: 10,
    answers: [
        "Hyper Trainer Marking Language",
        "Hyper Text Marketing Language",
        "Hyper Text Markup Language",
        "Hyper Text Markup Leveler"
    ],
    correctAnswer: "Hyper Text Markup Language"
},
{
    text: "In CSS, how do you select an element with the id 'header'?",
    time: 10,
    answers: [
        "#header",
        ".header",
        "header",
        "*header"
    ],
    correctAnswer: "#header"
},
{
    text: "What is the correct syntax to output 'Hello, World!' in Python?",
    time: 10,
    answers: [
        "echo 'Hello, World!'",
        "print('Hello, World!')",
        "console.log('Hello, World!')",
        "System.out.println('Hello, World!')"
    ],
    correctAnswer: "print('Hello, World!')"
},
{
    text: "Which company developed the Java programming language?",
    time: 10,
    answers: [
        "Microsoft",
        "Apple",
        "Sun Microsystems",
        "Google"
    ],
    correctAnswer: "Sun Microsystems"
},
]

let userPointsMap = {

}

io.on('connection', (socket) => {
    let attempt = ""

    console.log('A user connected')
    socket.emit('connected')
    socket.once("name", (name) => {
        userPointsMap[socket.id] = [name, 0]
        io.emit("name", name)
    })

    socket.once("start", async () => {
        for (const question of questions) {
            await new Promise(async (resolve) => {
                const toSend = { ...question }

                setTimeout(() => {
                    timeUpEvent.emit("timeUp", question.correctAnswer)
                    const sortedValues = Object.values(userPointsMap).sort(([, a], [, b]) => b - a)
                    const top5 = sortedValues.slice(0, 5)

                    io.emit("timeUp", top5)

                    socket.once("next", () => {
                        resolve()
                    })
                }, question.time * 1000)

                delete toSend.correctAnswer
                io.emit('question', toSend)
            })
        }
        const sortedValues = Object.values(userPointsMap).sort(([, a], [, b]) => b - a)
        io.emit("gameover", sortedValues)
        process.exit(0)
    })

    socket.on("answer", answer => {
        attempt = answer
    })

    timeUpEvent.on("timeUp", (correctAnswer) => {
        if (attempt) {
            if (attempt === correctAnswer) {
                userPointsMap[socket.id][1]++
                socket.emit("correct")
            } else {
                socket.emit("incorrect")
            }
            attempt = ""
        } else {
            socket.emit("noAnswer")
        }
    })
})




