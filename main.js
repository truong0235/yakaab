const kahoot = require("kahoot.js-latest");
require('dotenv').config()

var env = process.env;

const ID = env.ROOMID; 
const gamePin = env.ROOMPIN; 
const name = JSON.parse(env.USERNAMES) 

const minDelay = env.MINDELAY;
const maxDelay = env.MAXDELAY;

var botlist = [];

const baseDelay = 250; //dont change this, max delay to get 1k ponit per answer
var delay = () => {
    return parseInt(baseDelay + minDelay + Math.random() * maxDelay)
};

// function sleep(ms){
//     console.log("sleep for " + ms + " ms")
//     var waitTill = new Date(new Date().getTime() + ms);
//     while(waitTill > new Date()){}
// }

async function getAssestRaw(ID) {
        const answerResource = `https://play.kahoot.it/rest/kahoots/${ID}`;
        const response = await fetch(answerResource);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        return result;
}

async function getAnswersList(ID) {
        const answers = await getAssestRaw(ID);
        var result = answers.questions;
        if (result == null)
            throw new Error("cant retrieve answers list")
        return result
}

async function isRoomExist(gamePin){
    var flag = false;
    try{
        const response = await fetch(`https://kahoot.it/reserve/session/${gamePin}`);
        if (response.ok)
            flag = true;
    } catch(error){
        console.log(error);
    } finally {
        return flag;
    }
}

async function createBot(accountName, answers){
        const client = new kahoot();
        // console.log(client)
        client.join(gamePin, accountName)
            .catch(err =>{console.log(err)});
        client.on("Joined", () => {
            console.log(`${accountName} joined Kahoot`);
        });
        client.on("QuizStart", () => {
            console.log("Quiz started!");
        });
        client.on("QuestionStart", (question) => {
            var wait = delay();
            var currQuestionIndex = question.gameBlockIndex;
            var answerList = answers[currQuestionIndex].choices;
            setTimeout(() => {
                console.log(`waited for ${wait}ms`);
                for(let i = 0; i < question.numberOfChoices; i++){
                    if (answerList[i].correct == true){
                        console.log(`${accountName} choose answer ${i}`);
                        question.answer(i);
                    }
                }}, wait);
        });
        client.on("QuizEnd", () => {
            console.log("The quiz has ended.");
        });
        return client;
}

async function main(){
    try{
        const answers = await getAnswersList(ID);

        const checkGamePin = await isRoomExist(gamePin);

        if (!checkGamePin){
            throw new Error("game pin doesnt exist");
        }

        //create array of active accounts
        for (let i = 0; i < name.length; i++){
            botlist[i] = await createBot(name[i], answers);
        }

    } catch(error){
        console.log(error);
    }
}
main()

process.on("SIGINT", () => {
    console.log("recieve kill signal, terminating account sessions...");
    for(i = 0; i < botlist.length; i++){
        botlist[i].leave();
    }
    console.log("cleaning bot complete")
})
