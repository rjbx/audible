let shift = 1;
function idToShift(id) {
  switch (id) {
    case "raise-pad":return shift * 2;
    case "lower-pad":return shift * 0.5;
    default:return shift;}

}

function keyToId(key) {
  switch (key) {
    case 097:return "c-pad";
    case 119:return "c#-pad";
    case 115:return "d-pad";
    case 101:return "e-pad";
    case 100:return "eb-pad";
    case 102:return "f-pad";
    case 103:return "f#-pad";
    case 106:return "g-pad";
    case 105:return "g#-pad";
    case 107:return "a-pad";
    case 111:return "bb-pad";
    case 108:return "b-pad";
    case 222:return "raise-pad";
    case 186:return "lower-pad";
    default:return "";}

}

function idToFrequency(id) {
  switch (id) {
    case "c-pad":return 1047;
    case "c#-pad":return 1109;
    case "d-pad":return 1175;
    case "e-pad":return 1245;
    case "eb-pad":return 1319;
    case "f-pad":return 1397;
    case "f#-pad":return 1480;
    case "g-pad":return 1568;
    case "g#-pad":return 1661;
    case "a-pad":return 1760;
    case "bb-pad":return 1865;
    case "b-pad":return 1976;
    default:return 0;}

}

function frequencyToSound(frequency) {
  // Credit to: 
  // https://marcgg.com/blog/2016/11/01/javascript-audio/ 
  // for the tutorial on AudioContext
  let context = new AudioContext();
  let osc = context.createOscillator();
  let gain = context.createGain();
  osc.connect(gain);
  gain.connect(context.destination);
  gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 5);
  osc.frequency.value = frequency;
  return osc;
}

function frequencyToNote(frequency) {
  switch (frequency) {
    case 1047:return 'C';
    case 1175:return 'D';
    case 1245:return 'Eb';
    case 1319:return 'E';
    case 1397:return 'F';
    case 1568:return 'G';
    case 1760:return 'A';
    case 1865:return 'Bb';
    case 1976:return 'B';
    default:return '';}

}

function playPad(id) {
  let frequency = Math.floor(idToFrequency(id) * shift);
  let sound = frequencyToSound(frequency);
  let note = frequencyToNote(frequency);
  sound.start(0);
  $('#key-indicator').text(note);
}

$(document).ready(function () {
  $('.drum-pad').on('click', () => {
    let id = event.target.id;
    shift = idToShift(id);
    playPad(id);
  });

  $(document).keypress(e => {
    let key = e.which;
    let id = keyToId(key);
    playPad(id);
  });

  $(document).keydown(e => {
    let key = e.which;
    let id = keyToId(key);
    shift = idToShift(id);
  });

  $(document).keyup(e => {
    let key = e.which;
    if (key == 186 || key == 222) shift = 1;
  });
});