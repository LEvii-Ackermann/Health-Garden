import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/common/Button';
import VoiceRecorder from '../components/symptom/VoiceRecorder';
import geminiService from '../services/api/geminiService';

const SymptomInput = ({ onNavigate, patientData, updatePatientData }) => {
  const { getCurrentLanguage } = useLanguage();
  const currentLang = getCurrentLanguage();

  // Load existing patient data from localStorage on mount
  useEffect(() => {
    const storedPatientData = localStorage.getItem('patientData');
    if (storedPatientData) {
      try {
        const parsed = JSON.parse(storedPatientData);
        console.log('Loaded patient data in SymptomInput:', parsed);
      } catch (error) {
        console.error('Error loading patient data:', error);
      }
    }
  }, []);

  // State management - Initialize with existing data
  const [symptomText, setSymptomText] = useState(patientData?.symptoms || '');
  const [selectedSymptoms, setSelectedSymptoms] = useState(patientData?.selectedSymptoms || []);
  const [severity, setSeverity] = useState(patientData?.severity || 5);
  const [duration, setDuration] = useState(patientData?.duration || '');
  const [isRecording, setIsRecording] = useState(false);
  const [emergencyDetected, setEmergencyDetected] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  
  // Prevent repeated emergency warnings
  const [emergencyWarningShown, setEmergencyWarningShown] = useState(false);
  const [lastWarningSymptoms, setLastWarningSymptoms] = useState('');

  // Emergency detection timeout
  const emergencyTimeoutRef = useRef(null);

  // Multilingual content (keeping your existing content structure)
  const content = {
    en: {
      title: "Describe Your Symptoms",
      subtitle: "Tell us what you're experiencing",
      textInput: {
        label: "Describe your symptoms in detail",
        placeholder: "I have been experiencing headache and fever since yesterday..."
      },
      voiceInput: {
        label: "Or record your voice",
        button: "🎤 Record Voice",
        recording: "🔴 Recording... Click to stop",
        recorded: "✅ Voice recorded successfully"
      },
      commonSymptoms: {
        label: "Common Symptoms (Select all that apply)",
        symptoms: [
          { id: 'fever', name: 'Fever', icon: '🌡️' },
          { id: 'headache', name: 'Headache', icon: '🤕' },
          { id: 'cough', name: 'Cough', icon: '😷' },
          { id: 'fatigue', name: 'Fatigue', icon: '😴' },
          { id: 'nausea', name: 'Nausea', icon: '🤢' },
          { id: 'stomach-pain', name: 'Stomach Pain', icon: '🫃' },
          { id: 'chest-pain', name: 'Chest Pain', icon: '💔' },
          { id: 'breathing', name: 'Breathing Issues', icon: '🫁' },
          { id: 'dizziness', name: 'Dizziness', icon: '😵‍💫' },
          { id: 'rash', name: 'Skin Rash', icon: '🟤' }
        ]
      },
      severity: {
        label: "How severe are your symptoms? (1-10)",
        levels: ['Mild', 'Moderate', 'Severe']
      },
      duration: {
        label: "How long have you had these symptoms?",
        options: [
          { value: 'few-hours', label: 'A few hours' },
          { value: 'today', label: 'Since today' },
          { value: '1-2-days', label: '1-2 days' },
          { value: '3-7-days', label: '3-7 days' },
          { value: 'over-week', label: 'More than a week' },
          { value: 'chronic', label: 'Chronic (ongoing)' }
        ]
      },
      analyze: "Analyze Symptoms",
      back: "← Back",
      emergency: "🚨 If this is an emergency, call 108 immediately",
      emergencyModal: {
        title: "⚠️ POTENTIAL EMERGENCY DETECTED",
        subtitle: "Your symptoms may require immediate medical attention",
        callEmergency: "🚨 Call Emergency Services",
        continueAnalysis: "Continue with Analysis",
        goToEmergency: "Emergency Guidance",
        description: "Based on your symptoms, this may be a medical emergency. Consider seeking immediate professional medical help."
      }
    },
    hi: {
      title: "अपने लक्षणों का वर्णन करें",
      subtitle: "बताएं कि आप क्या अनुभव कर रहे हैं",
      textInput: {
        label: "अपने लक्षणों का विस्तार से वर्णन करें",
        placeholder: "कल से मुझे सिरदर्द और बुखार आ रहा है..."
      },
      voiceInput: {
        label: "या अपनी आवाज रिकॉर्ड करें",
        button: "🎤 आवाज रिकॉर्ड करें",
        recording: "🔴 रिकॉर्डिंग... रोकने के लिए क्लिक करें",
        recorded: "✅ आवाज सफलतापूर्वक रिकॉर्ड हुई"
      },
      commonSymptoms: {
        label: "आम लक्षण (जो लागू हों सभी चुनें)",
        symptoms: [
          { id: 'fever', name: 'बुखार', icon: '🌡️' },
          { id: 'headache', name: 'सिरदर्द', icon: '🤕' },
          { id: 'cough', name: 'खांसी', icon: '😷' },
          { id: 'fatigue', name: 'थकान', icon: '😴' },
          { id: 'nausea', name: 'जी मिचलाना', icon: '🤢' },
          { id: 'stomach-pain', name: 'पेट दर्द', icon: '🫃' },
          { id: 'chest-pain', name: 'छाती में दर्द', icon: '💔' },
          { id: 'breathing', name: 'सांस की समस्या', icon: '🫁' },
          { id: 'dizziness', name: 'चक्कर आना', icon: '😵‍💫' },
          { id: 'rash', name: 'त्वचा पर चकत्ते', icon: '🟤' }
        ]
      },
      severity: {
        label: "आपके लक्षण कितने गंभीर हैं? (1-10)",
        levels: ['हल्के', 'मध्यम', 'गंभीर']
      },
      duration: {
        label: "आपको ये लक्षण कब से हैं?",
        options: [
          { value: 'few-hours', label: 'कुछ घंटों से' },
          { value: 'today', label: 'आज से' },
          { value: '1-2-days', label: '1-2 दिन से' },
          { value: '3-7-days', label: '3-7 दिन से' },
          { value: 'over-week', label: 'एक सप्ताह से अधिक' },
          { value: 'chronic', label: 'पुराना (चल रहा)' }
        ]
      },
      analyze: "लक्षणों का विश्लेषण करें",
      back: "← वापस",
      emergency: "🚨 यदि यह आपातकाल है, तो तुरंत 108 पर कॉल करें",
      emergencyModal: {
        title: "⚠️ संभावित आपातकाल का पता चला",
        subtitle: "आपके लक्षणों के लिए तत्काल चिकित्सा सहायता की आवश्यकता हो सकती है",
        callEmergency: "🚨 आपातकालीन सेवाओं को कॉल करें",
        continueAnalysis: "विश्लेषण जारी रखें",
        goToEmergency: "आपातकालीन मार्गदर्शन",
        description: "आपके लक्षणों के आधार पर, यह एक चिकित्सा आपातकाल हो सकता है। तत्काल पेशेवर चिकित्सा सहायता लेने पर विचार करें।"
      }
    }
  };

  const currentContent = content[currentLang?.code] || content.en;

  // Emergency detection effect
  useEffect(() => {
    const checkForEmergency = async () => {
      if (symptomText.trim() || selectedSymptoms.length > 0) {
        if (emergencyTimeoutRef.current) {
          clearTimeout(emergencyTimeoutRef.current);
        }

        emergencyTimeoutRef.current = setTimeout(async () => {
          const allSymptoms = [
            symptomText,
            ...selectedSymptoms.map(id => {
              const symptom = currentContent.commonSymptoms.symptoms.find(s => s.id === id);
              return symptom?.name || id;
            })
          ].filter(Boolean).join(', ');

          if (allSymptoms.trim()) {
            try {
              // FIXED: Load patient data for emergency detection
              const storedPatientData = localStorage.getItem('patientData');
              const basicInfo = storedPatientData ? JSON.parse(storedPatientData) : {};
              
              const emergency = geminiService.detectEmergency({
                symptoms: allSymptoms,
                severity: severity,
                duration: duration,
                ageGroup: basicInfo.ageGroup || patientData?.ageGroup,
                selectedSymptoms: selectedSymptoms
              });
              
              if (emergency.isEmergency && emergency.confidence > 0.7 && !emergencyWarningShown) {
                setEmergencyDetected(emergency);
                setShowEmergencyModal(true);
                setEmergencyWarningShown(true);
                setLastWarningSymptoms(allSymptoms);
              }
            } catch (error) {
              console.error('Emergency detection error:', error);
            }
          }
        }, 2000);
      }
    };

    checkForEmergency();

    return () => {
      if (emergencyTimeoutRef.current) {
        clearTimeout(emergencyTimeoutRef.current);
      }
    };
  }, [symptomText, selectedSymptoms, severity, patientData?.ageGroup, currentContent, emergencyWarningShown]);

  const handleSymptomTextChange = (text) => {
    if (emergencyWarningShown && Math.abs(text.length - symptomText.length) > 10) {
      setEmergencyWarningShown(false);
      setLastWarningSymptoms('');
    }
    
    setSymptomText(text);
    if (updatePatientData) updatePatientData({ symptoms: text });
  };

  const toggleSymptom = (symptomId) => {
    const newSelectedSymptoms = selectedSymptoms.includes(symptomId) 
      ? selectedSymptoms.filter(s => s !== symptomId)
      : [...selectedSymptoms, symptomId];
    
    if (emergencyWarningShown && Math.abs(newSelectedSymptoms.length - selectedSymptoms.length) > 0) {
      const emergencySymptomIds = ['chest-pain', 'breathing'];
      const removedEmergencySymptom = emergencySymptomIds.some(id => 
        selectedSymptoms.includes(id) && !newSelectedSymptoms.includes(id)
      );
      
      if (removedEmergencySymptom) {
        setEmergencyWarningShown(false);
        setLastWarningSymptoms('');
      }
    }
    
    setSelectedSymptoms(newSelectedSymptoms);
    if (updatePatientData) updatePatientData({ selectedSymptoms: newSelectedSymptoms });
  };

  const handleSeverityChange = (newSeverity) => {
    setSeverity(newSeverity);
    if (updatePatientData) updatePatientData({ severity: newSeverity });
  };

  const handleDurationChange = (newDuration) => {
    setDuration(newDuration);
    if (updatePatientData) updatePatientData({ duration: newDuration });
  };

  const handleEmergencyCall = () => {
    window.open('tel:108');
    setShowEmergencyModal(false);
  };

  const handleEmergencyGuidance = () => {
    if (updatePatientData) {
      updatePatientData({
        emergencyDetected: true,
        emergencyType: emergencyDetected.type,
        emergencyConfidence: emergencyDetected.confidence
      });
    }
    setShowEmergencyModal(false);
    onNavigate('emergency-triage');
  };

  const handleContinueAnalysis = () => {
    setShowEmergencyModal(false);
  };

  // FIXED: Handle form submission with merged data
  const handleAnalyze = () => {
    // Load basic information from localStorage
    const storedPatientData = localStorage.getItem('patientData');
    let basicInfo = {};
    
    if (storedPatientData) {
      try {
        basicInfo = JSON.parse(storedPatientData);
        console.log('Retrieved basic info:', basicInfo);
      } catch (error) {
        console.error('Error parsing patient data:', error);
      }
    }

    // Get readable duration label
    const durationLabel = currentContent.duration.options.find(
      opt => opt.value === duration
    )?.label || duration;

    // Get readable symptom names
    const selectedSymptomNames = selectedSymptoms.map(id => {
      const symptom = currentContent.commonSymptoms.symptoms.find(s => s.id === id);
      return symptom?.name || id;
    });

    // FIXED: Merge all data together
    const completePatientData = {
      // Basic information
      ageGroup: basicInfo.ageGroup,
      ageGroupLabel: basicInfo.ageGroupLabel,
      age: basicInfo.ageGroupLabel, // For display
      gender: basicInfo.gender,
      location: basicInfo.location,
      emergencyContact: basicInfo.emergencyContact,
      
      // Symptom information
      symptoms: symptomText,
      selectedSymptoms: selectedSymptoms,
      selectedSymptomNames: selectedSymptomNames,
      severity: severity,
      duration: duration,
      durationLabel: durationLabel,
      
      // Metadata
      timestamp: new Date().toISOString(),
      language: currentLang?.code
    };

    console.log('Complete patient data for analysis:', completePatientData);

    // Store the complete merged data
    localStorage.setItem('patientData', JSON.stringify(completePatientData));
    
    // Update parent component if callback provided
    if (updatePatientData) {
      updatePatientData(completePatientData);
    }
    
    // Navigate to loading/analysis page
    onNavigate('analysis-loading');
  };

  const getSeverityColor = (value) => {
    if (value <= 3) return '#4CAF50';
    if (value <= 7) return '#FF9800';
    return '#f44336';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {currentContent.title}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            {currentContent.subtitle}
          </p>
        </div>

        {/* Emergency Banner */}
        <div style={{
          background: 'rgba(244, 67, 54, 0.2)',
          border: '2px solid #f44336',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          {currentContent.emergency}
        </div>

        {/* Main Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '2rem'
        }}>
          {/* Text Input */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '1.2rem', 
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              {currentContent.textInput.label}
            </label>
            <textarea
              value={symptomText}
              onChange={(e) => handleSymptomTextChange(e.target.value)}
              placeholder={currentContent.textInput.placeholder}
              rows={4}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '10px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Voice Input */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '1.2rem', 
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              {currentContent.voiceInput.label}
            </label>
            <VoiceRecorder
              onRecordingComplete={(audioBlob) => {
                console.log('Voice recorded:', audioBlob);
                if (updatePatientData) updatePatientData({ voiceRecording: audioBlob });
              }}
              currentContent={currentContent.voiceInput}
            />
          </div>

          {/* Common Symptoms */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '1.2rem', 
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              {currentContent.commonSymptoms.label}
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              {currentContent.commonSymptoms.symptoms.map((symptom) => (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  style={{
                    background: selectedSymptoms.includes(symptom.id)
                      ? 'rgba(76, 175, 80, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: selectedSymptoms.includes(symptom.id)
                      ? '2px solid #4CAF50'
                      : '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {symptom.icon}
                  </div>
                  <div style={{ fontSize: '0.9rem' }}>
                    {symptom.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Severity Scale */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '1.2rem', 
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              {currentContent.severity.label}
            </label>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '1.5rem',
              borderRadius: '12px'
            }}>
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => handleSeverityChange(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  background: `linear-gradient(to right, #4CAF50 0%, #FF9800 50%, #f44336 100%)`,
                  borderRadius: '5px',
                  outline: 'none'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1rem',
                fontSize: '0.9rem'
              }}>
                <span>1 - {currentContent.severity.levels[0]}</span>
                <span style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: getSeverityColor(severity)
                }}>
                  {severity}
                </span>
                <span>10 - {currentContent.severity.levels[2]}</span>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '1.2rem', 
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              {currentContent.duration.label}
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem'
            }}>
              {currentContent.duration.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDurationChange(option.value)}
                  style={{
                    background: duration === option.value
                      ? 'rgba(76, 175, 80, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: duration === option.value
                      ? '2px solid #4CAF50'
                      : '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '10px',
                    padding: '1rem',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <Button 
            onClick={() => onNavigate('basic-info')}
            variant="outline"
          >
            {currentContent.back}
          </Button>
          
          <Button 
            onClick={handleAnalyze}
            variant="primary"
            size="large"
            disabled={!symptomText.trim() && selectedSymptoms.length === 0}
          >
            {currentContent.analyze}
          </Button>
        </div>
      </div>

      {/* Emergency Detection Modal */}
      {showEmergencyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f44336, #d32f2f)',
            padding: '2rem',
            borderRadius: '15px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            color: 'white',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              {currentContent.emergencyModal.title}
            </h2>
            <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
              {currentContent.emergencyModal.subtitle}
            </p>
            <p style={{ marginBottom: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
              {currentContent.emergencyModal.description}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={handleEmergencyCall}
                style={{
                  background: '#fff',
                  color: '#f44336',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {currentContent.emergencyModal.callEmergency}
              </button>
              
              <button
                onClick={handleEmergencyGuidance}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {currentContent.emergencyModal.goToEmergency}
              </button>
              
              <button
                onClick={handleContinueAnalysis}
                style={{
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.7)',
                  border: 'none',
                  padding: '0.5rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {currentContent.emergencyModal.continueAnalysis}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomInput;