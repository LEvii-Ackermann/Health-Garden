// import React, { useState, useRef } from 'react';
// import Button from '../common/Button';

// const VoiceRecorder = ({ onRecordingComplete, currentContent }) => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [hasRecording, setHasRecording] = useState(false);
//   const [recordingTime, setRecordingTime] = useState(0);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const timerRef = useRef(null);

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = mediaRecorder;
//       audioChunksRef.current = [];

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorder.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
//         onRecordingComplete(audioBlob);
//         setHasRecording(true);
        
//         // Stop all tracks to release microphone
//         stream.getTracks().forEach(track => track.stop());
//       };

//       mediaRecorder.start();
//       setIsRecording(true);
//       setRecordingTime(0);

//       // Start timer
//       timerRef.current = setInterval(() => {
//         setRecordingTime(prev => prev + 1);
//       }, 1000);

//     } catch (error) {
//       console.error('Error accessing microphone:', error);
//       alert('Unable to access microphone. Please check permissions.');
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//       clearInterval(timerRef.current);
//     }
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   return (
//     <div style={{
//       background: 'rgba(255, 255, 255, 0.1)',
//       padding: '1.5rem',
//       borderRadius: '12px',
//       textAlign: 'center'
//     }}>
//       {!isRecording ? (
//         <Button
//           onClick={startRecording}
//           variant={hasRecording ? "secondary" : "primary"}
//           size="large"
//         >
//           {hasRecording ? "🎤 Record Again" : currentContent.button}
//         </Button>
//       ) : (
//         <div>
//           <Button
//             onClick={stopRecording}
//             variant="emergency"
//             size="large"
//           >
//             {currentContent.recording}
//           </Button>
//           <div style={{
//             marginTop: '1rem',
//             fontSize: '1.2rem',
//             fontWeight: 'bold'
//           }}>
//             {formatTime(recordingTime)}
//           </div>
//         </div>
//       )}

//       {hasRecording && !isRecording && (
//         <div style={{
//           marginTop: '1rem',
//           color: '#4CAF50',
//           fontWeight: 'bold'
//         }}>
//           {currentContent.recorded}
//         </div>
//       )}
//     </div>
//   );
// };

// export default VoiceRecorder;


import React, { useState, useRef } from 'react';
import Button from '../common/Button';

const VoiceRecorder = ({ onRecordingComplete, currentContent }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        setHasRecording(true);

        // Send audio to Gemini API
        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.wav");

          const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();
          console.log("Gemini response:", result);
        } catch (err) {
          console.error("Error sending audio to Gemini:", err);
        }

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '1.5rem',
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      {!isRecording ? (
        <Button
          onClick={startRecording}
          variant={hasRecording ? "secondary" : "primary"}
          size="large"
        >
          {hasRecording ? "🎤 Record Again" : currentContent.button}
        </Button>
      ) : (
        <div>
          <Button
            onClick={stopRecording}
            variant="emergency"
            size="large"
          >
            {currentContent.recording}
          </Button>
          <div style={{
            marginTop: '1rem',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            {formatTime(recordingTime)}
          </div>
        </div>
      )}

      {hasRecording && !isRecording && (
        <div style={{
          marginTop: '1rem',
          color: '#4CAF50',
          fontWeight: 'bold'
        }}>
          {currentContent.recorded}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
