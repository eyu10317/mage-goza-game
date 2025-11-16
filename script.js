let chips = 1000000;
let isRolling = false;
let currentSeason;

const BET_AMOUNT = 100000;
const CLEAR_AMOUNT = 10000000;

const seasons = [
    { name: "春の始まり", bonus: 1, seasonMul: 1, startEndMul: 2 },
    { name: "春の終わり", bonus: 1, seasonMul: 1, startEndMul: 1 },
    { name: "夏の始まり", bonus: 1, seasonMul: 2, startEndMul: 2 },
    { name: "夏の終わり", bonus: 0, seasonMul: 2, startEndMul: 1 },
    { name: "秋の始まり", bonus: 0, seasonMul: 3, startEndMul: 2 },
    { name: "秋の終わり", bonus: 0, seasonMul: 3, startEndMul: 1 },
    { name: "冬の始まり", bonus: 1, seasonMul: 4, startEndMul: 2 },
    { name: "冬の終わり", bonus: 0, seasonMul: 4, startEndMul: 1 }
];

let roadmap = [];
let currentColumn = 0;
let currentRow = 0;
const MAX_ROWS = 6;
const MAX_COLS  = 30;

const seBet = document.getElementById("se-bet");
const seDon = document.getElementById("se-don");

function play(se){
    se.currentTime = 0;
    se.play();
}

drawRoadmap();
setSeason();
updateChips();

function setSeason(){
    currentSeason = seasons[Math.floor(Math.random()*seasons.length)];
    document.getElementById("season").textContent = currentSeason.name;
}

function bet(choice){
    if(isRolling) return;
    if(chips < BET_AMOUNT) return;

    chips -= BET_AMOUNT;
    updateChips();

    play(seBet);
    rollDice(choice, true);
}

function spinFree(){
    if(isRolling) return;
    play(seBet);
    rollDice(null, false);
}

function showCutin(){
    const c = document.getElementById("cutin");
    c.style.opacity = 1;
    setTimeout(()=> c.style.opacity=0 , 1000);
}

function rollDice(choice, isBet){

    document.getElementById("result-text").textContent = "結果：";
    document.getElementById("win-lose-text").textContent = "判定：";

    show0 , 7000 , 700();

    isRolling = true;
    disableButtons(true);

    startDiceAnimation();

    setTimeout(()=>{

        const d1 = Math.floor(Math.random()*6)+1;
        const d2 = Math.floor(Math.random()*6)+1;

        showDice(d1, d2);

        const total = d1 + d2 + currentSeason.bonus;
        const result = (total % 2 === 0) ? "mage" : "goza";

        const delay = Math.floor(Math.random()*5)+1;

        setTimeout(()=>{

            play(seDon);

            let bonusText = "";
            let profit = 0;

            if(isBet){

                if(result === choice){

                    let payout = BET_AMOUNT * 2;

                    if(d1 === d2){
                        const mul = d1*d1 * currentSeason.seasonMul * currentSeason.startEndMul;
                        payout = BET_AMOUNT * mul;
                        bonusText = ` ×${mul}倍返し`;
                    }

                    profit = payout - BET_AMOUNT;
                    chips += payout;
                    updateChips();

                    if(chips >= CLEAR_AMOUNT){
                        document.getElementById("win-lose-text").textContent =
                            `COMPLETE！（+${profit.toLocaleString()}）${bonusText}`;
                    } else {
                        document.getElementById("win-lose-text").textContent =
                            `判定：あたり（+${profit.toLocaleString()}）${bonusText}`;
                    }

                }else{
                    document.getElementById("win-lose-text").textContent="判定：はずれ";
                }

            }else{
                document.getElementById("win-lose-text").textContent="判定：-（賭けなし）";
            }

            document.getElementById("result-text").textContent =
                "結果：" + (result==="mage"?"まげ":"ござ");

            updateRoadmap(result);
            checkGameEnd();

            isRolling = false;
            disableButtons(false);
            setSeason();

        }, delay*1000);

    },800);
}

function startDiceAnimation(){
    let count = 0;
    const interval = setInterval(()=>{
        document.getElementById("dice1").textContent = Math.floor(Math.random()*6)+1;
        document.getElementById("dice2").textContent = Math.floor(Math.random()*6)+1;
        count++;
        if(count>10) clearInterval(interval);
    },70);
}

function showDice(a,b){
    document.getElementById("dice1").textContent = a;
    document.getElementById("dice2").textContent = b;
}

function updateRoadmap(result){

    if(roadmap.length===0){
        roadmap.push([result]);
        currentColumn=0;
        currentRow=0;
        drawRoadmap();
        return;
    }

    const last = roadmap[currentColumn];

    if(last[last.length-1]===result && currentRow < MAX_ROWS-1){
        last.push(result);
        currentRow++;
    }else{
        currentColumn++;
        if(currentColumn>=MAX_COLS) return;
        roadmap[currentColumn] = [result];
        currentRow = 0;
    }

    drawRoadmap();
}

function drawRoadmap(){

    const area = document.getElementById("roadmap");
    area.innerHTML="";

    for(let col=0; col<MAX_COLS; col++){
        for(let row=0; row<MAX_ROWS; row++){

            const cell=document.createElement("div");
            cell.classList.add("road-cell");

            cell.style.gridColumnStart = col+1;
            cell.style.gridRowStart    = row+1;

            if(roadmap[col] && roadmap[col][row]){
                const dot=document.createElement("div");
                dot.classList.add("dot");
                dot.style.background =
                    roadmap[col][row]==="mage" ? "blue":"red";
                cell.appendChild(dot);
            }

            area.appendChild(cell);
        }
    }
}

function disableButtons(flag){
    document.getElementById("btn-mage").disabled = flag;
    document.getElementById("btn-goza").disabled = flag;
    document.getElementById("btn-free").disabled = flag;
}

function updateChips(){
    document.getElementById("chips").textContent = chips.toLocaleString();
}

function checkGameEnd(){
    if(chips <= 0){
        document.getElementById("win-lose-text").textContent = "GAME OVER";
        disableButtons(true);
    }
    if(chips >= CLEAR_AMOUNT){
        disableButtons(true);
    }
}

function resetGame(){
    chips = 1000000;

    roadmap=[];
    currentColumn=0;
    currentRow=0;

    drawRoadmap();
    updateChips();

    document.getElementById("result-text").textContent="結果：";
    document.getElementById("win-lose-text").textContent="判定：";

    disableButtons(false);
    setSeason();
}
