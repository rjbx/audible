# Audible
Plays and records musical notes. Backend made with Web Audio and MediaStream Recording APIs; UI made with Bootstrap Flexgrid. CodePen: [https://codepen.io/rjbx/pen/Lwgrqg](https://codepen.io/rjbx/pen/Lwgrqg).

## Walkthrough: [Generate and record sounds with Oscillator and MediaRecorder	](https://coded.art/generate-and-record-sounds-with-oscillator-and-mediarecorder/)

This walkthrough addresses recording programmatically-generated sounds with the [Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) and [MediaStream Recording](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API) APIs, as demonstrated by a simple [synthesizer app](https://rjbx.github.io/audible) written with jQuery. For those unfamiliar with jQuery syntax, an [interactive tutorial](https://learn.freecodecamp.org/front-end-libraries/jquery) is available at [FreeCodeCamp](https://learn.freecodecamp.org/front-end-libraries/). Walkthroughs from [Soledad Penadés](https://soledadpenades.com/) and [Marc Gauthier](http://marcgg.com/) are reliable resources for understanding, independently, the sound –[recording](https://hacks.mozilla.org/2016/04/record-almost-everything-in-the-browser-with-mediarecorder/) and –[generating](http://marcgg.com/blog/2016/11/01/javascript-audio/) processes in greater detail.

*Firefox Users: A [bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1435625) currently prevents gain ramping. Until the bug is resolved, a Chromium-based browser is recommended.*

### Setup

#### Create views

Consider what actions comprise each broader functionality. While generated sounds may be fed directly to the recorder, playing back the sounds as they are being recorded makes sense, as does providing options for generating different sounds and controlling the length of the recording.

In the context of a synthesizer app, views correspond to keys for playing different musical notes, in addition to the aforementioned controls.

#### Create global fields

The Web Audio API is built around [`AudioContext`](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext), which handles the creation as well as storage of one or a series of a processing module called an [`AudioNode`](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode). Examples of an `AudioNode`, which is covered later, include a source such as an `Oscillator`, an intermediate processor such as `BiquadFilter` and `Gain`, and a destination which represents the result of all audio in the context. Because the audio in this example has two destinations — speaker and recorder — corresponding nodes are created.

```
 // I/O  
 let context = false;  
 let speakerNode = false;  
 let recorderNode = false;  
  
 // Prefs  
 /* _e.g. wave type, pitch_ */  
  
 // View IDs  
 /* _e.g. play, stop, record, player, display, sounds, etc. _*/  
```

#### Define permission event

A common browser policy discourages developers from playing sounds prior to obtaining user permission. A developer is free to approach this objective in the manner they see fit, so long as their solution involves user engagement with the page; without which, an error is likely to be thrown. A straightforward implementation might involve listening for a click or key event before attempting to play sounds.

```
$(document).ready(function() {  
  if (!context) {   
    $(display).on('click', initializeAudioContext);  
    $(document).on('keypress', initializeAudioContext);  
  }  
}  
```

#### Request AudioContext from browser with Promise

A [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) provides a convenient interface for associating asynchronous action with dependent logic. A `Promise` is constructed with an executor that accepts as arguments a handler for, each, resolution and rejection of the action.

```
function getAudioContext() {  
   return new Promise((resolve, reject) = {   
       resolve(  
         new (window.AudioContext || window.webkitAudioContext)()  
       )  
       reject(  
         "Your browser rejected a request to access the Web Audio API, a required component"  
       )  
     }  
   );  
 }  
```

When the asynchronous action is complete, the `Promise` is said to be settled — either fulfilled or rejected. If the `Promise` is fulfilled, the value resulting from the executor resolvehandler is accessible from the `.then()` method handler argument, where it can be accessed by dependent logic. Likewise, a rejected `Promise` avails the reason resulting from the executor reject handler by way of the `.catch()` method which also accepts a handler argument, and these method calls are chained from the root `Promise`.

```
function initializeAudioContext(listener) {
  getAudioContext()
    .then(
      value = {
        context = value;
        speakerNode = context.destination;
        connectAudioDestination();
        ...
    }).catch(
      reason = {
        console.log(reason);
    });
}
```

### Generate sounds

#### Instantiate Oscillator from AudioContext

An [`Oscillator`](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode) produces a constant tone representing a periodic waveform at a certain frequency. A sine waveform at a frequency of 440Hz is the default. The `.start()` method indicates the time at which the `Oscillator` should begin playing the tone, which is immediately if no argument is provided.

```
let osc = context.createOscillator();  
osc.connect(speakerNode);  
osc.start();
```

#### Configure Oscillator to produce distinct sounds

Assigning distinct values to the type and frequency properties changes the tone. [`Gain`](https://developer.mozilla.org/en-US/docs/Web/API/GainNode) affects the volume of the tone, which is instantiated by invoking `createGain()` from the given `AudioContext`.

`Gain` inherits methods from the [`AudioParam`](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam) interface that gradually increase or decrease the property value — in this case, volume — over time. Each method accepts two arguments: the targeted value, and the number of seconds from the previous processing event to reach the target. Invoking one of these methods from gain can be useful for fading out volume.

As, [in nature](https://en.wikipedia.org/wiki/Sound_intensity#Inverse-square_law) and generally-speaking, sound intensity decreases at an exponential rate between two points, an exponential rather than a linear ramp is more suitable.

```
function frequencyToSound(frequency) {  
  ...  

  osc.connect(speakerNode);    
  let  gain = context.createGain();  
  gain.gain.exponentialRampToValueAtTime(  
    0.00001, context.currentTime + 3.5  
  );  
  gain.connect(speakerNode);  
  osc.connect(gain);  
  osc.type = 'sine'; // can also be 'square', 'triangle', 'sawtooth', or 'custom'  
  osc.frequency.value = frequency; // can be between -22050 and 22050 inclusive  
  ...  
}
```

For greater control, intermediate processing can be augmented by a [`BiquadFilterNode`](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode).

#### Associate views with sound output

In the context of a synthesizer app, where views correspond to keys that correspond to notes on a musical scale, view interactions can be handled to identify the note by its [frequency](https://www.audiology.org/sites/default/files/ChasinConversionChart.pdf) from, for example, a switch method or key-value object associating frequencies with view IDs. Other properties including waveform type and pitch (as a frequency multiplier) could be extrapolated by the same means.

```
$(sound).on('click', () = {
  let id = '#' + event.target.id;
  ...
  playPad(id);
})
  
$(document).keypress(e = {
  let key = e.which;
  ...
  playPad(id);
})

function playPad(id) {
  let frequency = idToFrequency(id);
  let sound = frequencyToSound(frequency);
  sound.start(0);
}

function idToFrequency(id) {
  switch(id) {
    case viewId: return 1047;
    ...
    default: return 0;
  }
}
```

### Record sounds

#### Instantiate MediaRecorder from MediaStream

A [`MediaRecorder`](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) captures an audio or video [`MediaStream`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) and saves it as a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) of media data that can be decoded by a media player. Calls to the `start()`, `pause()`, `resume()` and `stop()` methods control the length of the recording, with corresponding handlers fired at each call. A `MediaStream` can be generated as a destination from a sensory device or a compatible source node.

```
function captureMediaStream(stream) {  
  let recorder = new MediaRecorder(stream);   
  recorder.start();  
  ...  
}
```

The `getUserMedia()` method attempts to gain access to a `MediaStream` from the sensory devices detected from the browser, which by default should generate a prompt requesting user permission. The return value is a `Promise` which, if fulfilled, resolves the stream to any dependent logic from the `then()` method handler argument.

```
function getUserMedia() {
  return navigator.mediaDevices.getUserMedia({ audio: true, video: true });
}

getUserMedia().then(stream = captureMediaStream(stream));
```

In the next section, the stream will be provided by an output node generated from the `AudioContext` associated with the sound-generating `Oscillator`.

#### Configure MediaRecorder for playback and download

Before the recording can be played back or downloaded, the data must be compiled. A data set can be built from `ondataavailable` and finalized in `onstop`.

The `ondataavailable` handler passes a data-storing event that spans the time since, either, the previous handler callback, or, the recording began. The callback occurs either when the recording ends, as well as during the recording if, either, `start()` is passed a timeslice interval argument or `requestData()` is invoked. Storing the event data in an array makes sense where multiple data chunks may be returned during a single recording.

The `onstop` handler accesses the data array to instantiate a data `Blob` that is accessed from a URL created with `URL.createObjectURL()`. The URL can then be assigned to the source attribute of an audio player element and hyperlink reference attribute of an anchordownload element.

```
let chunks = [];

recorder.ondataavailable = e =&gt; chunks.push(e.data));

recorder.onstop = e =&gt; {
  let blob = new Blob(
    chunks, { 'type' : 'audio/ogg; codecs=opus' }
  );
  chunks = [];
  let url = URL.createObjectURL(blob);
  $(player).attr('src', url);
  $(download).attr('href', url);
  ...
};
```

#### Associate views with sound recording

At a minimum, the recording should be started and stopped, and can also be paused and resumed. View action handlers can be associated with each call.

```
$(start).on('click', () =&gt; {  
  ...  
  recorder.start();  
  $(display).text(...);  
});  
  
$(stop).on('click', () =&gt; {  
  ...  
  recorder.stop();  
  $(display).text(...);  
});  
  
...
```

### Record generated sounds

A few minor modifications to the process for creating the sound generator and recorder establishes a connection between the two elements. The difference stems from adding an extra destination node.

The `AudioContext` destination property is assigned an [`AudioDestinationNode`](https://developer.mozilla.org/en-US/docs/Web/API/AudioDestinationNode), while the `getMediaStreamDestination()` method returns a [`MediaStreamAudioDestinationNode`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioDestinationNode). The `AudioDestinationNode` outputs directly to the speaker, while the `MediaStreamAudioDestinationNode` contains a stream properly that can be fed to the recorder.

#### Save instance of MediaStream destination node

###### See also: Setup — Create global fields

Save a reference to the MediaStream destination node that can be accessed from the logic involving both `Oscillator` and `MediaRecorder`.

```
function initializeAudioContext(listener) {  
  getAudioContext().then(value =&gt; {  
    context = value;  
    recorderNode = context.getMediaStreamDestination();  

speakerNode = context.destination;  
    ...  
  });  
}
```

#### Connect MediaStream node to generated sound

###### See also: Generate sounds — Configure Oscillator to produce distinct sounds

Connecting the `Gain` to the `MediaStream` destination node copies the sound output to the recorder stream.

```
function frequencyToSound(frequency) {  
  ...  
  gain.connect(recorderNode);  
  gain.connect(speakerNode);  
}
```

#### Instantiate recorder from MediaStream node

###### See also: Record sounds — Instantiate MediaRecorder from MediaStream

Feed the stream to the `MediaRecorder`. That’s it!

```
captureMediaStream(recorderNode.stream);  
  
function captureMediaStream(stream) {  
  let recorder = new MediaRecorder(stream);  
  ...  
}
```

#### Additional features

Guidance on further enhancements involving visualizations and additional controls can be found in the links below.

##### Useful links

[Web Audio Intro](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API), [Web Audio Usage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API), [Web Audio Walkthrough](http://marcgg.com/blog/2016/11/01/javascript-audio/), [MediaStream Recording Intro](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API), [MediaStream Recording Usage](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API), [MediaStream Recording Walkthrough](https://hacks.mozilla.org/2016/04/record-almost-everything-in-the-browser-with-mediarecorder/)
