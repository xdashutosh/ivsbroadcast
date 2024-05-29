import React, { useEffect, useState } from 'react'
import IVSBroadcastClient from 'amazon-ivs-web-broadcast'
const App = () => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastClientOne, setBroadcastClientOne] = useState(null);
  const [buttonText, setButtonText] = useState('Start Live');
useEffect(()=>{

  const init = async()=>{

    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const client = IVSBroadcastClient.create({
      streamConfig: IVSBroadcastClient.STANDARD_LANDSCAPE,
      ingestEndpoint: 'rtmps://07369bd3d991.global-contribute.live-video.net:443/app/',
    });
    setBroadcastClientOne(client);
    
    const previewEl = document.getElementById('preview');
    client.attachPreview(previewEl);
    
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    const audioDevices = devices.filter(d => d.kind === 'audioinput');
    
    
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: videoDevices[0].deviceId },
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
      },
    });
    
    const microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: audioDevices[0].deviceId },
    });
    
    client.addVideoInputDevice(cameraStream, 'camera1', { index: 0 });
    client.addAudioInputDevice(microphoneStream, 'mic1');
    const Events = IVSBroadcastClient.BroadcastClientEvents;
    
    
    // client.on(Events.CONNECTION_STATE_CHANGE, (state) => {
    //   document.getElementById('connection-state-one').innerHTML = state;
    //   isBroadcasting = state === IVSBroadcastClient.ConnectionState.CONNECTED;
    // });

    client.on(Events.CONNECTION_STATE_CHANGE, (state) => {
      document.getElementById('connection-state-one').innerHTML = state;
      setIsBroadcasting(state === IVSBroadcastClient.ConnectionState.CONNECTED);
      setButtonText(state === IVSBroadcastClient.ConnectionState.CONNECTED ? 'Stop Live' : 'Start Live');
    });
    
    client.on(IVSBroadcastClient.BroadcastClientEvents.ERROR, (evt) => {
      console.error(evt)
    });
    
    let isBroadcasting = false;
    let isCameraOn = true;
    let isMicrophoneOn = true;
    
    document.getElementById('toggle-camera-btn').addEventListener('click', (evt) => {
      if (isCameraOn) {
        // Turn off the camera
        cameraStream.getTracks().forEach(track => {
          track.enabled = false;
        });
        isCameraOn = false;
      } else {
        // Turn on the camera
        cameraStream.getTracks().forEach(track => {
          track.enabled = true;
        });
        isCameraOn = true;
      }
    });

    document.getElementById('toggle-microphone-btn').addEventListener('click', (evt) => {
      if (isMicrophoneOn) {
        // Mute the microphone
        microphoneStream.getTracks().forEach(track => {
          track.enabled = false;
        });
        isMicrophoneOn = false;
      } else {
        // Unmute the microphone
        microphoneStream.getTracks().forEach(track => {
          track.enabled = true;
        });
        isMicrophoneOn = true;
      }
    });

    document.getElementById('toggle-screen-share-btn').addEventListener('click', async (evt) => {
      try {
       
       const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        client.addVideoInputDevice(screenStream, 'screen1', { index: 1 });
      } catch (err) {
        console.error('Error accessing screen:', err);
      }
    });



    
    document.getElementById('toggle-broadcast-btn').addEventListener('click', (evt) => {
      if (!isBroadcasting) {
        client.startBroadcast('sk_ap-south-1_mtjNWuXIIyth_iaoVfcCb4BPXP5M3NywkOhJBmQRd92')
        setIsBroadcasting(true);
      } else {
        client.stopBroadcast();
        setIsBroadcasting(false);

      }
    });
    
  }

  init();
    
  },[])
  
  const handleToggleBroadcast = () => {
    if (!isBroadcasting) {
      // broadcastClientOne.startBroadcast(sec);
      // setIsBlinking(true);
    } else {
      broadcastClientOne.stopBroadcast();
      // setIsBlinking(false);
    }
  };

  return (
    <>
    <div>
    <p>
      Connection State (Channel One): <span id="connection-state-one"></span>
    </p>
  </div>
  <div>
    <canvas id="preview" style={{width: "800px", "height": "450px"}}></canvas>
  </div>
  <div>
   
    <button type="button" id="toggle-camera-btn">Toggle Camera</button>
    <button type="button" id="toggle-microphone-btn">Toggle Microphone</button>
    <button type="button" id="toggle-screen-share-btn">Start Screen Share</button>
    <button type="button" id="toggle-broadcast-btn" onClick={handleToggleBroadcast}>{buttonText}</button>
  </div>
    </>
  )
}

export default App