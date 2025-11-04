const kahoot = require("kahoot.js-latest");


const ID = "7d3c5fd8-9e02-4abe-ada3-4mb4tuk4m24d"; //must have this id to get answers, should be on teacher's url while screenshare or projecting
const gamePin = "1234567"; //put the room's gamepin here
const name = "abcdef" //change your name here

//change min and max delay to get different score range, default will get 1000 ~ 980 score per question
const maxDelay = 400;
const minDelay = 0;



const baseDelay = 250; //dont change this, max delay to get 1k ponit per answer
var delay = () => {
    return parseInt(baseDelay + minDelay + Math.random() * maxDelay)
};

function sleep(ms){
    console.log("sleep for " + ms + " ms")
    var waitTill = new Date(new Date().getTime() + ms);
    while(waitTill > new Date()){}
}

async function getAssestRaw(ID) {
        const answerResource = `https://play.kahoot.it/rest/kahoots/${ID}`;
        const response = await fetch(answerResource);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        return result;
}

async function getQuestionsList(ID) {
        const answers = await getAssestRaw(ID);
        var result = answers.questions;
        if (result == null)
            throw new Error("cant retrieve answers list")
        return result
}

async function main() {
        const answers = await getQuestionsList(ID);
        
        const client = new kahoot();
        client.join(gamePin, name)
            .catch(err =>{console.log(err)})
        
        client.on("Joined", () => {
            console.log(name + " joined the Kahoot!");
        });
        client.on("QuizStart", () => {
            console.log("The quiz has started!");
        });
        client.on("QuestionStart", (question) => {
            var currQuestionIndex = question.gameBlockIndex;
            var answerList = answers[currQuestionIndex].choices;
            sleep(delay())
            for(let i = 0; i < question.numberOfChoices; i++){
                if (answerList[i].correct == true){
                    console.log("answer choose: " + i);
                    question.answer(i);
                }
            }
            console.log("question answered by " + name);
        });
        client.on("QuizEnd", () => {
            console.log("The quiz has ended.");
        });
}

main()

