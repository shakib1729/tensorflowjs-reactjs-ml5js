// ml5.js: Pose Estimation with PoseNet
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/learning/ml5/7.1-posenet.html
// https://youtu.be/OIo-DIOkNVg
// https://editor.p5js.org/codingtrain/sketches/ULA97pJXR

let video;
let poseNet;
let pose;
let skeleton;

let brain;
let poseLabel = 'Y';

let state = 'waiting';

let targetLabel;

// 'keyPressed' is an in-build function of p5.js
// which is called each time a key is pressed
// function keyPressed() {
//   if (key == 's') {
//     // save the dataset to a file
//     brain.saveData();
//   } else {
//     targetLabel = key;
//     console.log(targetLabel);

//     // Add a delay so hat we can properly go to the front of the camera
//     // Set the state to 'collecting' after 10 seconds, and then after 10 seconds
//     // set the state back to 'waiting
//     setTimeout(function () {
//       console.log('collecting');
//       state = 'collecting';

//       setTimeout(function () {
//         console.log('not collecting');
//         state = 'waiting';
//       }, 10000);
//     }, 10000);
//   }
// }

// 'setup' runs once when the program starts
function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
  // Load the previously collected data
  // brain.loadData('ymca.json', dataReady);

  // Load the previously trained model
  const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin',
  };

  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  console.log('pose classification ready');
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }

    brain.classify(inputs, gotResult);
  } else {
    // If it doesn't detect a pose,
    // then don't stop, check again after 100 ms
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  // Only update the label if the confidence is above a given threshold
  if (results[0].confidence > 0.65) {
    poseLabel = results[0].label.toUpperCase();
  }

  console.log(results[0].confidence);
  classifyPose();
}

function dataReady() {
  brain.normalizeData();
  brain.train({ epochs: 50 }, finished);
}

function finished() {
  console.log('Model trained');
  // Save the model
  brain.save();
}

function gotPoses(poses) {
  // console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;

    // Keep on adding the data only when we are in 'collecting' state
    if (state == 'collecting') {
      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }

      let target = [targetLabel];

      brain.addData(inputs, target);
    }
  }
}

function modelLoaded() {
  // console.log('poseNet ready');
}

function draw() {
  push();

  translate(video.width, 0);
  // scale(-1, 1) makes the x-axis going to other direction
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0],
        b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 16, 16);
    }
  }

  pop();

  fill(255, 0, 255);
  noStroke();
  textSize(256);
  textAlign(CENTER, CENTER);
  text(poseLabel, width / 2, height / 2);
}
