let shift = 1;
let type = "sine";

function idToShift(id) {
  switch (id) {
    case "raise-pad":return shift * 2;
    case "lower-pad":return shift * 0.5;
    default:return shift;}

}

function idToType(id) {
  switch (id) {
    case "sine-pad":return "sine";
    case "square-pad":return "square";
    case "triangle-pad":return "triangle";
    case "sawtooth-pad":return "sawtooth";
    default:return type;}

}

function keydownToId(key) {
  switch (key) {
    case 65:return "c-pad";
    case 87:return "cs-pad";
    case 83:return "d-pad";
    case 69:return "ef-pad";
    case 68:return "e-pad";
    case 70:return "f-pad";
    case 71:return "fs-pad";
    case 74:return "g-pad";
    case 73:return "gs-pad";
    case 75:return "a-pad";
    case 79:return "bf-pad";
    case 76:return "b-pad";
    case 222:return "raise-pad";
    case 186:return "lower-pad";
    case 90:return "sine-pad";
    case 88:return "square-pad";
    case 188:return "triangle-pad";
    case 190:return "sawtooth-pad";
    default:return "";}

}

function keypressToId(key) {
  switch (key) {
    case 097:return "c-pad";
    case 119:return "cs-pad";
    case 115:return "d-pad";
    case 101:return "ef-pad";
    case 100:return "e-pad";
    case 102:return "f-pad";
    case 103:return "fs-pad";
    case 106:return "g-pad";
    case 105:return "gs-pad";
    case 107:return "a-pad";
    case 111:return "bf-pad";
    case 108:return "b-pad";
    case 039:return "raise-pad";
    case 059:return "lower-pad";
    case 122:return "sine-pad";
    case 120:return "square-pad";
    case 044:return "triangle-pad";
    case 046:return "sawtooth-pad";
    default:return "";}

}

function idToFrequency(id) {
  switch (id) {
    case "c-pad":return 1047;
    case "cs-pad":return 1109;
    case "d-pad":return 1175;
    case "ef-pad":return 1245;
    case "e-pad":return 1319;
    case "f-pad":return 1397;
    case "fs-pad":return 1480;
    case "g-pad":return 1568;
    case "gs-pad":return 1661;
    case "a-pad":return 1760;
    case "bf-pad":return 1865;
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
  gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 3);
  osc.frequency.value = frequency;
  osc.type = type;
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
    type = idToType(id);
    playPad(id);
  });

  $(document).keypress(e => {
    let key = e.which;
    let id = keypressToId(key);
    type = idToType(id);
    playPad(id);
  });

  $(document).keydown(e => {
    let key = e.which;
    console.log(key);
    let id = keydownToId(key);
    $('#' + id).addClass('active');
    shift = idToShift(id);
  });

  $(document).keyup(e => {
    let key = e.which;
    let id = keydownToId(key);
    $('#' + id).removeClass('active');
    if (key == 186 || key == 222) shift = 1;
  });
});