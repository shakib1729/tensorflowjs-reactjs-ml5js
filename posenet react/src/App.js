import React, { useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
import Webcam from 'react-webcam';
import { drawKeypoints, drawSkeleton } from './utilities';

import { CSVLink } from 'react-csv';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [intervalVar, setIntervalVar] = useState(null);
  const [label, setLabel] = useState('');

  const [datasetX, setDatasetX] = useState([]);
  const [datasetY, setDatasetY] = useState([]);

  // Creating a reference of 'dataset' state so that we can change
  // state inside of setInterval() function
  const datasetXRef = useRef(datasetX);
  datasetXRef.current = datasetX;

  const datasetYRef = useRef(datasetY);
  datasetYRef.current = datasetY;

  const runPosenet = async () => {
    const net = await posenet.load({
      inputResolution: { width: 426, height: 240 },
      scale: 0.5,
    });
    const newInterval = setInterval(() => {
      detect(net);
    }, 100);
    setIntervalVar(newInterval);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState == 4 &&
      typeof canvasRef.current !== 'undefined' &&
      canvasRef.current !== null
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width (because when we are working with webcam we need to force the height and width)
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Make detections
      const pose = await net.estimateSinglePose(video, {
        flipHorizontal: true,
      });
      let currDataPointX = [];
      for (let i = 0; i < pose['keypoints'].length; i++) {
        currDataPointX.push(pose['keypoints'][i]['position'].x);
        currDataPointX.push(pose['keypoints'][i]['position'].y);
      }
      setDatasetX([...datasetXRef.current, currDataPointX]);
      let currDataPointY = [label];
      setDatasetY([...datasetYRef.current, currDataPointY]);
      // console.log(currDataPoint);
      requestAnimationFrame(() => {
        drawCanvas(pose, videoWidth, videoHeight, canvasRef);
      });
    }
  };

  const drawCanvas = (pose, videoWidth, videoHeight, canvas) => {
    if (canvas.current !== null) {
      const ctx = canvas.current.getContext('2d');
      canvas.current.width = videoWidth;
      canvas.current.height = videoHeight;

      drawKeypoints(pose['keypoints'], 0.5, ctx);
      drawSkeleton(pose['keypoints'], 0.5, ctx);
    }
  };

  const changeIsDetecting = () => {
    if (isDetecting) {
      setIsDetecting(false);
      // console.log(intervalVar);
      clearInterval(intervalVar);
    } else {
      if (label.length == 0) {
        alert('Please enter a label');
      } else {
        setIsDetecting(true);
        runPosenet();
      }
    }
  };

  const clearDataset = () => {
    setDatasetX([]);
    setDatasetY([]);
    setLabel('');
  };

  const onChange = (e) => setLabel(e.target.value);

  return (
    <div className='App'>
      <input
        type='text'
        name='text'
        placeholder='Enter label...'
        value={label}
        onChange={onChange}
      />
      <button onClick={changeIsDetecting}>
        <h4> {isDetecting ? 'Stop collecting' : 'Start Collecting'} </h4>
      </button>
      <button>
        <CSVLink data={datasetX} filename={'X.csv'}>
          <h4>Download the datasetX</h4>
        </CSVLink>
      </button>
      <button>
        <CSVLink data={datasetY} filename={'Y.csv'}>
          <h4>Download the datasetY</h4>
        </CSVLink>
      </button>
      <button onClick={clearDataset}>
        <h4> Clear dataset </h4>
      </button>
      <h3>Number of collected data points: {datasetX.length}</h3>
      <header className='App-header'>
        {isDetecting ? (
          <>
            <Webcam
              ref={webcamRef}
              mirrored
              style={{
                position: 'absolute',
                marginLeft: 'auto',
                marginRight: 'auto',
                left: 0,
                right: 0,
                textAlign: 'center',
                zindex: 9,
                width: 426,
                height: 240,
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
                width: 426,
                height: 240,
              }}
            />
          </>
        ) : (
          <p>Turn On</p>
        )}
      </header>
    </div>
  );
}

export default App;
