// HANDPOSE
// 1. Install dependencies --> tfjs, handpose model, react-webcam DONE
// 2. Import dependencies DONE
// 3. Setup webcam and canvas DONE
// 4. Define reference to those DONE
// 5. Load handpose DONE
// 6. Detect function DONE
// 7. Drawing utilities DONE
// 8. Draw function DONE

// GESTURE RECOGNITION using fingerpose
// 0. Intsall fingerpose DONE
// 1. Add useState DONE
// 2. Import emojis and fingerpose DONE
// 3. Update detect function for gesture handling DONE
// 4. Setup hook and emoji object DONE
// 5. Add emoji display to the screen DONE

import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam';
import './App.css';
import { drawHand } from './utilities';

// Import new stuffs
import * as fp from 'fingerpose';
import victory from './victory.png';
import thumbs_up from './thumbs_up.png';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [emoji, setEmoji] = useState(null);
  const images = { thumbs_up: thumbs_up, victory: victory };

  const runHandpose = async () => {
    const net = await handpose.load();
    // console.log('Handpose model loaded');

    // Loop and to continuously detect hands in the frame
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    // Check if data is available

    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set(force) video height and width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make detections
      const hand = await net.estimateHands(video);
      // console.log(hand);

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
        ]);

        // Pass the predictions from handpose model and minimum confidence level
        const gesture = await GE.estimate(hand[0].landmarks, 8);
        // console.log(gesture);

        // Now with this gesture, do something
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          // If more than 1 gestures detected,
          // take the one with the highest confidence

          // 'confidence' is an array of confidences of gestures
          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );

          // Get the index of maximum confidence
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );

          // console.log(gesture.gestures[maxConfidence].name);
          setEmoji(gesture.gestures[maxConfidence].name);
          console.log(emoji);
        }
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext('2d');
      drawHand(hand, ctx);
    }
  };
  runHandpose();

  return (
    <div className='App'>
      <header className='App-header'>
        <Webcam
          ref={webcamRef}
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            zindex: 9,
            width: 640,
            heiht: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            zindex: 9,
            width: 640,
            heiht: 480,
          }}
        />

        {emoji !== null ? (
          <img
            src={images[emoji]}
            style={{
              position: 'absolute',
              marginLeft: 'auto',
              marginRight: 'auto',
              left: 400,
              bottom: 500,
              right: 0,
              textAlign: 'center',
              height: 100,
            }}
          />
        ) : (
          ''
        )}
      </header>
    </div>
  );
}

export default App;
