import {
  Finger,
  FingerCurl,
  FingerDirection,
  GestureDescription,
} from 'fingerpose';

// Define Gesture Description
export const loveYouGesture = new GestureDescription('i_love_you');

// Thumb
// There should be no curl and we want to be 100 % confidence of this
loveYouGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
// Thumb can be pointing to left or right
// We don't want to be strict
loveYouGesture.addDirection(Finger.thumb, FingerDirection.HorizontalLeft, 0.25);
loveYouGesture.addDirection(
  Finger.thumb,
  FingerDirection.HorizontalRight,
  0.25
);

// No curl on index and pinky fingers and they should be vertically upwards

// Index
loveYouGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
loveYouGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.25);

// Pinky
loveYouGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
loveYouGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.25);

// 2 middle fingers --> full curl and vertically down
for (let finger of [Finger.Middle, Finger.Ring]) {
  loveYouGesture.addCurl(finger, FingerCurl.FullCurl, 0.75);
  loveYouGesture.addDirection(finger, FingerDirection.VerticalDown, 0.25);
}
