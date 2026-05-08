let currentBalls = [];
let isOut = false;
let dismissalType = "";
let outBy = "";

let matches =
JSON.parse(localStorage.getItem("matches") || "[]");
matches = matches.map(m => ({
  ...m,
  fours: m.fours || 0,
  sixes: m.sixes || 0,
  dots: m.dots || 0
}));
// ================= BAT =================
function addBall(run){
  currentBalls.push({ type:"run", value:run });
  updateScore();
}

// ================= EXTRAS =================
function addWide(){
  currentBalls.push({ type:"wide", value:1 });
  updateScore();
}

function addNoBall(){
  let batRun = Number(prompt("Runs on No Ball?")) || 0;

  currentBalls.push({
    type:"noball",
    value:batRun + 1,
    batRun:batRun
  });

  updateScore();
}

function addBye(){
  let byeRun = Number(prompt("Bye Runs?")) || 1;

  currentBalls.push({
    type:"bye",
    value:byeRun
  });

  updateScore();
}

function addLegBye(){
  let lbRun = Number(prompt("Leg Bye Runs?")) || 1;

  currentBalls.push({
    type:"legbye",
    value:lbRun
  });

  updateScore();
}

// ================= WICKET =================
function markOut(){

  if(isOut) return;

  dismissalType =
    document.getElementById("dismissalType").value;

  outBy =
    document.getElementById("outBy").value;

  isOut = true;

  currentBalls.push({
    type:"wicket",
    mode:"out"
  });

  updateScore();
}

// ================= STATS =================
function calculateStats(){

  let runs=0;
  let balls=0;
  let fours=0;
  let sixes=0;
  let dots=0;

  currentBalls.forEach(ball=>{

    if(ball.type==="run"){
      runs += ball.value;
      balls++;

      if(ball.value===4) fours++;
      if(ball.value===6) sixes++;
      if(ball.value===0) dots++;
    }

    else if(ball.type==="wide"){
      runs += 0;
    }

    else if(ball.type==="noball"){
      runs += ball.value;
      if(ball.batRun===4) fours++;
      if(ball.batRun===6) sixes++;
    }

    else if(ball.type==="bye" || ball.type==="legbye"){
      balls++;
    }

    else if(ball.type==="wicket"){
      balls++;
    }

  });

  let sr = balls ? ((runs/balls)*100).toFixed(2) : "0.00";

  return {runs,balls,sr,fours,sixes,dots};
}

// ================= UI =================
function updateScore(){

  const stats = calculateStats();

  document.getElementById("scoreText").innerText =
    isOut
    ? `${stats.runs} (${stats.balls})`
    : `${stats.runs}* (${stats.balls})`;

  document.getElementById("strikeRateText").innerText =
    `SR: ${stats.sr}`;

  let timeline = document.getElementById("timeline");
  timeline.innerHTML = "";

  currentBalls.forEach(ball=>{

    let label="";

    if(ball.type==="run") label=ball.value;
    else if(ball.type==="wide") label="WD";
    else if(ball.type==="noball") label=`NB+${ball.batRun}`;
    else if(ball.type==="bye") label=`B${ball.value}`;
    else if(ball.type==="legbye") label=`LB${ball.value}`;
    else if(ball.type==="wicket") label="W";

    timeline.innerHTML += `
      <div class="ball ${ball.type}">
        ${label}
      </div>
    `;
  });
}

// ================= SAVE =================
function saveMatch(){

  if(currentBalls.length===0){
    alert("Add innings first");
    return;
  }

  const stats = calculateStats();

  matches.push({
    opponent:document.getElementById("opponent").value,
    location:document.getElementById("location").value,
    date:document.getElementById("matchDate").value,
    ballCondition:document.getElementById("ballCondition").value,
    ballColor:document.getElementById("ballColor").value,
    boundaryType:document.getElementById("boundaryType").value,

    dismissalType,
    outBy,
    out:isOut,

    runs:stats.runs,
    balls:stats.balls,
    strikeRate:stats.sr,
    fours:stats.fours,
    sixes:stats.sixes,
    dots:stats.dots,

    timeline:[...currentBalls]
  });

  localStorage.setItem("matches",JSON.stringify(matches));

  renderMatches();
  updateCareerStats();
  clearInnings();

  alert("Saved!");
}

// ================= RENDER =================
function renderMatches(){

  let container=document.getElementById("matchesContainer");
  container.innerHTML="";

  [...matches].reverse().forEach((m,i)=>{

    container.innerHTML += `
      <div class="match-card">

        <h3>Match #${matches.length-i}</h3>

        <p>vs ${m.opponent}</p>
        <p>${m.location}</p>

        <h2>${m.out ? m.runs : m.runs+"*" } (${m.balls})</h2>

        <p>SR: ${m.strikeRate}</p>
        <p>4s:${m.fours} | 6s:${m.sixes}</p>

        <p>
        ${m.out ? `${m.dismissalType} b ${m.outBy}` : "Not Out"}
        </p>

      </div>
    `;
  });
}

// ================= CAREER =================
function updateCareerStats(){

  let runs=0,balls=0,outs=0;
  let fours = 0;
let sixes = 0;

  matches.forEach(m=>{
    runs+=m.runs;
    balls+=m.balls;
    fours += m.fours || 0;
    sixes += m.sixes || 0;
    if(m.out) outs++;
  });

  let avg = outs ? (runs/outs).toFixed(2) : runs;
  let sr = balls ? ((runs/balls)*100).toFixed(2) : "0.00";

  document.getElementById("careerRuns").innerText=runs;
  document.getElementById("careerAverage").innerText=avg;
  document.getElementById("careerStrikeRate").innerText=sr;
  document.getElementById("careerMatches").innerText=matches.length;
  document.getElementById("careerFours").innerText = fours;
document.getElementById("careerSixes").innerText = sixes;
}

// ================= UTILS =================
function undoBall(){
  currentBalls.pop();
  updateScore();
}

function clearInnings(){
  currentBalls=[];
  isOut=false;
  dismissalType="";
  outBy="";
  updateScore();
}

renderMatches();
updateCareerStats();
updateScore();