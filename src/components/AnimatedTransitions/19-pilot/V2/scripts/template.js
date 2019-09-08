const me = document.URL.split("/").reverse()[0].slice(0,this.length-5);

///////////// Seite ////////////////
d3.select("div.layout")
  .append("p")
  .attr("name", "nummer")
  .text(aufgabenCounter(me))
  .style("text-align", "center");

d3.select("div.layout")
  .append("h1")
  .text("Deutung der Transition " + romanize(aufgabenNr(me)));
  
d3.select("div.layout")
  .append("p")
  .attr("name", "anweisung")
  .text("Schaue dir folgende Transition an! Was passiert hier? Beschreibe es in Worten. Wie findest du die Animation? Was könnte man besser machen?");

/////////////// Schieberegeler TransDuration ///////////
var schieberegler = new Schieberegler();
  schieberegler.editSchieberegler();

//////////// Animationsart /////////////  
var selection = new DropDown(d3.select("div.layout"), animCases);

//////////// Buttons /////////////
var form = d3.select("div.layout").append("form")
  .attr("class", "formular");

var timeZeroBtn = new Button(form, function(){return callAusgangszustand();}, "⊲ Startzustand");
//new LinkButton(me, deleteDatas, -1, "zurück", null);
var bereitBtn = new Button(form, function(){
  animDatas.push({animArt: animArt, dauer: transDuration});
  update();
  }, "Bereit");

//////////////// Datasets ////////////////
var oldDataset = [], newDataset = [];
var pos, id, gerade, clusterNo, researchArea, year, keywords;
var datas = [
  [[5,6,0], [10,6,0], [9,10,0], [6,9,0]], // cluster 0
  [[3,1,1], [6,1,1], [5,3,1]] // cluster 1
];
for(var c in datas){
  for (var p in datas[c]) {
    pos = new Position(datas[c][p][0], datas[c][p][1]);
    id = +datas[c][p][2] * 10 + parseInt(p);
    clusterNo = c;
    oldDataset.push(new Knoten(pos, id, clusterNo, {}, 2019, ""));
  }
}
var oldNests = new Nest(oldDataset);

datas = [
  [[7,5,0], [10,6,0], [9,10,0], [6,9,0]], // cluster 0
  [[1,1,1], [4,1,1], [3,3,1]] // cluster 1
  ];

for(var c in datas){
  for (var p in datas[c]) {
    pos = new Position(datas[c][p][0], datas[c][p][1]);
    id = 10 * datas[c][p][2] + parseInt(p);
    clusterNo = +c;
    newDataset.push(new Knoten(pos, id, clusterNo, {}, 2019, ""));
  }
}

var newNests = new Nest(newDataset);

//////////////// Scaling ////////////////////
var scale = new Scale(oldDataset);
  scale.setDomain(oldDataset);
  
var transTable = oldNests.createTransitionNests(newNests);

  
//////////////// SVG //////////////////// 
var svg = new SVG("svg");
new Kreise (oldDataset, svg, "projekt", scale);
new Pfade (oldNests, svg, "huelle", scale)


//////////// UPDATE /////////////
function update(){// nach einmaliger Betätigung erscheinen Buttons
  transitions(svg, newDataset, newNests, transTable, scale);
  
  var t0 = d3.transition()
    .delay(transDuration)
    .duration(1)
    .on("end", createForm);
    
  // Formular
  function createForm() {
    bereitBtn.btn
      .text("↻ Replay")
      .on("click", function(){
        animDatas.push({animArt: animArt, dauer: transDuration});
        replay();
      });
    // https://www.toptal.com/designers/htmlarrows/arrows/
    
    var result = animDatas.map(d => d.animArt + ';' + d.dauer)
      .join(';');
    var weiterBtn = new LinkButton(me, storeDatas, +1, "Zur nächsten Aufgabe ⊳", result);
    //     weiterBtn.btn
    //       .on("click", function(){// wird ersetzt
    //         var optionsList = document.getElementsByName("animCases");
    //         var selected = undefined;
    //         for (var i in optionsList) {
    //           if (optionsList[i].selected) {
    //             selected = optionsList[i];
    //             break;
    //           }
    //         }
    //         if (selected != undefined) {
    //           storeDatas(me, "Bevorzugte Zeit;" + selected.value + "; ; ;Antworten;" + cases.join(";"));
    //           var index = (websites.indexOf(me)+1) % websites.length;
    //           window.location.href = "sites/" + websites[index]+".html"; // https://www.w3schools.com/howto/howto_js_redirect_webpage.asp
    //         }
    //         else
    //           alert("Bitte wähle eine Antwort aus.");
    //       });
  }
}

function callAusgangszustand(){
  ausgangszustand(svg, oldDataset, oldNests, scale);
}

function replay(){
  ausgangszustand(svg, oldDataset, oldNests, scale);
  transitions(svg, newDataset, newNests, transTable, scale);
//   var t0 = d3.transition().duration(0)
//     .on("end", transitions);
}