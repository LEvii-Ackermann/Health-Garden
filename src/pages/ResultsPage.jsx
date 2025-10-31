import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

const ResultsPage = ({ onNavigate }) => {
  const { currentLanguage, translations } = useContext(LanguageContext);

  const [analysisResults, setAnalysisResults] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  const text = {
    en: {
      title: "Your AI Health Analysis",
      subtitle: "Based on the symptoms and information you provided",
      possibleConditions: "Possible Conditions",
      recommendations: "AI Recommendations",
      whenToSeekHelp: "When to Seek Medical Help Immediately",
      findProviders: "Find Healthcare Providers",
      getSecondOpinion: "Chat for More Info",
      chatForInfo: "Chat for More Info",
      disclaimer: "Important Medical Disclaimer",
      backToSymptoms: "Add More Symptoms",
      probability: "Match",
      analysisBy: "Analysis powered by AI",
      patientInfo: "Your Information",
      newAnalysis: "Start New Analysis",
      ageGroup: "Age Group",
      gender: "Gender",
      location: "Location",
      severity: "Severity",
      duration: "Duration",
      symptoms: "Symptoms"
    },
    hi: {
      title: "आपका AI स्वास्थ्य विश्लेषण",
      subtitle: "आपके द्वारा प्रदान किए गए लक्षणों और जानकारी के आधार पर",
      possibleConditions: "संभावित स्थितियां",
      recommendations: "AI सुझाव",
      whenToSeekHelp: "तत्काल चिकित्सा सहायता कब लें",
      findProviders: "स्वास्थ्य सेवा प्रदाता खोजें",
      getSecondOpinion: "अधिक जानकारी के लिए चैट करें",
      chatForInfo: "अधिक जानकारी के लिए चैट करें",
      disclaimer: "महत्वपूर्ण चिकित्सा अस्वीकरण",
      backToSymptoms: "और लक्षण जोड़ें",
      probability: "मिलान",
      analysisBy: "AI द्वारा संचालित विश्लेषण",
      patientInfo: "आपकी जानकारी",
      newAnalysis: "नया विश्लेषण शुरू करें",
      ageGroup: "आयु समूह",
      gender: "लिंग",
      location: "स्थान",
      severity: "गंभीरता",
      duration: "अवधि",
      symptoms: "लक्षण"
    }
  };

  const getText = (key) => {
    const currentText = text[currentLanguage] || text.en;
    return currentText[key] || text.en[key] || key;
  };

  useEffect(() => {
    const storedResults = localStorage.getItem('analysisResults');
    const storedPatientData = localStorage.getItem('patientData');

    console.log('Loading data - Results:', storedResults);
    console.log('Loading data - Patient:', storedPatientData);

    if (storedResults && storedPatientData) {
      try {
        const results = JSON.parse(storedResults);
        const patient = JSON.parse(storedPatientData);
        
        console.log('Parsed patient data:', patient);
        
        setAnalysisResults(results);
        setPatientData(patient);
      } catch (error) {
        console.error('Error parsing stored data:', error);
        setAnalysisResults(getDefaultResults());
      }
    } else {
      console.warn('Missing stored data');
      setAnalysisResults(getDefaultResults());
    }
    setLoading(false);
  }, []);

  const getDefaultResults = () => ({
    urgencyLevel: 'moderate',
    possibleConditions: [
      {
        condition: 'Medical Consultation Recommended',
        probability: 80,
        description: 'Professional medical evaluation is recommended based on your symptoms'
      }
    ],
    recommendations: [
      { action: 'Schedule appointment with healthcare provider', priority: 'high' },
      { action: 'Monitor symptoms and note any changes', priority: 'medium' }
    ],
    whenToSeekHelp: [
      'Symptoms worsen or persist',
      'New concerning symptoms develop',
      'You feel worried about your condition'
    ],
    disclaimer: 'This analysis is for informational purposes only. Always consult healthcare professionals.'
  });

  const getUrgencyColor = (level) => {
    switch(level) {
      case 'low': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'high': return '#FF5722';
      case 'emergency': return '#F44336';
      default: return '#2196F3';
    }
  };

  const getUrgencyText = (level) => {
    const urgencyTexts = {
      en: {
        low: 'Low Priority - Monitor Symptoms',
        moderate: 'Moderate Priority - Consider Medical Consultation',
        high: 'High Priority - Seek Medical Care Soon',
        emergency: 'Emergency - Seek Immediate Medical Care'
      },
      hi: {
        low: 'कम प्राथमिकता - लक्षणों पर नज़र रखें',
        moderate: 'मध्यम प्राथमिकता - चिकित्सा सलाह लें',
        high: 'उच्च प्राथमिकता - जल्द चिकित्सा देखभाल लें',
        emergency: 'आपातकाल - तत्काल चिकित्सा देखभाल लें'
      }
    };
    return urgencyTexts[currentLanguage]?.[level] || urgencyTexts.en[level];
  };

  // FIXED: Helper to format gender display
  const formatGender = (gender) => {
    const genderMap = {
      en: {
        male: 'Male',
        female: 'Female',
        other: 'Other',
        'prefer-not-to-say': 'Prefer not to say'
      },
      hi: {
        male: 'पुरुष',
        female: 'महिला',
        other: 'अन्य',
        'prefer-not-to-say': 'नहीं बताना चाहते'
      }
    };
    return genderMap[currentLanguage]?.[gender] || genderMap.en[gender] || gender;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading results...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        color: 'white'
      }}>
        {/* Header with Patient Info */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2.2rem',
            marginBottom: '0.5rem',
            fontWeight: '300'
          }}>
            {getText('title')}
          </h1>
          <p style={{
            opacity: 0.8,
            fontSize: '1rem',
            marginBottom: '1rem'
          }}>
            {getText('subtitle')}
          </p>
          
          {/* Analysis Info */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            fontSize: '0.9rem'
          }}>
            <span>🤖 {getText('analysisBy')}</span>
            <span style={{ opacity: 0.6 }}>•</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* FIXED: Enhanced Patient Summary Card with all demographic info */}
        {patientData && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ 
              marginBottom: '1rem', 
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              👤 {getText('patientInfo')}
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1rem'
            }}>
              {/* Age Group */}
              {patientData.ageGroupLabel && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>🎂</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      {getText('ageGroup')}
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      {patientData.ageGroupLabel}
                    </div>
                  </div>
                </div>
              )}

              {/* Gender */}
              {patientData.gender && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>
                    {patientData.gender === 'male' ? '👨' : 
                     patientData.gender === 'female' ? '👩' : '👤'}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      {getText('gender')}
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      {formatGender(patientData.gender)}
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              {patientData.location && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>📍</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      {getText('location')}
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      {patientData.location}
                    </div>
                  </div>
                </div>
              )}

              {/* Severity */}
              {patientData.severity && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>⚡</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      {getText('severity')}
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      {patientData.severity}/10
                    </div>
                  </div>
                </div>
              )}

              {/* Duration */}
              {patientData.durationLabel && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>⏰</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      {getText('duration')}
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      {patientData.durationLabel}
                    </div>
                  </div>
                </div>
              )}

              {/* Symptoms Preview */}
              {(patientData.symptoms || patientData.selectedSymptomNames) && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  gridColumn: 'span 2'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>🔍</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.3rem' }}>
                      {getText('symptoms')}
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      {patientData.selectedSymptomNames && patientData.selectedSymptomNames.length > 0 && (
                        <div style={{ marginBottom: '0.3rem' }}>
                          <strong>Selected:</strong> {patientData.selectedSymptomNames.join(', ')}
                        </div>
                      )}
                      {patientData.symptoms && (
                        <div style={{ opacity: 0.8 }}>
                          {patientData.symptoms.substring(0, 100)}
                          {patientData.symptoms.length > 100 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Urgency Indicator */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            borderRadius: '25px',
            backgroundColor: getUrgencyColor(analysisResults.urgencyLevel),
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            {getUrgencyText(analysisResults.urgencyLevel)}
          </div>
        </div>

        {/* Possible Conditions */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.4rem', display: 'flex', alignItems: 'center' }}>
            🎯 {getText('possibleConditions')}
          </h2>
          
          {analysisResults.possibleConditions?.map((condition, index) => (
            <div key={index} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.2rem',
              marginBottom: index < analysisResults.possibleConditions.length - 1 ? '1rem' : '0',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              transition: 'transform 0.2s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.8rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                  {condition.condition}
                </h3>
                <span style={{
                  backgroundColor: condition.probability >= 70 ? '#4CAF50' : condition.probability >= 50 ? '#FF9800' : '#FF5722',
                  color: 'white',
                  padding: '0.3rem 1rem',
                  borderRadius: '15px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  {condition.probability}% {getText('probability')}
                </span>
              </div>
              <p style={{
                margin: 0,
                opacity: 0.85,
                fontSize: '1rem',
                lineHeight: '1.4'
              }}>
                {condition.description}
              </p>
            </div>
          ))}
        </div>

        {/* AI Recommendations */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.4rem', display: 'flex', alignItems: 'center' }}>
            💡 {getText('recommendations')}
          </h2>
          
          {analysisResults.recommendations?.map((rec, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '0.8rem 0',
              borderBottom: index < analysisResults.recommendations.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: rec.priority === 'high' ? '#4CAF50' : rec.priority === 'medium' ? '#FF9800' : '#2196F3',
                marginRight: '1rem',
                marginTop: '0.3rem',
                flexShrink: 0
              }}></div>
              <span style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                {rec.action}
              </span>
            </div>
          ))}
        </div>

        {/* When to Seek Help */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.4rem', display: 'flex', alignItems: 'center' }}>
            🚨 {getText('whenToSeekHelp')}
          </h2>
          
          {analysisResults.whenToSeekHelp?.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '0.8rem 0',
              borderBottom: index < analysisResults.whenToSeekHelp.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
            }}>
              <span style={{
                fontSize: '1.2rem',
                marginRight: '1rem',
                marginTop: '0.1rem'
              }}>⚠️</span>
              <span style={{ fontSize: '1rem', lineHeight: '1.5' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => onNavigate('provider-listing')}
            style={{
              padding: '1.2rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#4CAF50',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#45a049';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4CAF50';
              e.target.style.transform = 'translateY(0px)';
            }}
          >
            🏥 {getText('findProviders')}
          </button>
          
          <button
            onClick={() => onNavigate('chat')}
            style={{
              background: 'linear-gradient(135deg, #2196F3, #1976D2)',
              border: 'none',
              borderRadius: '12px',
              padding: '1.2rem',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(33, 150, 243, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>💬</span>
            {getText('chatForInfo')}
          </button>
        </div>

        {/* Navigation Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => onNavigate('symptom-input')}
            style={{
              padding: '0.8rem 2rem',
              borderRadius: '25px',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              backgroundColor: 'transparent',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            ← {getText('backToSymptoms')}
          </button>
          
          <button
            onClick={() => {
              localStorage.removeItem('analysisResults');
              localStorage.removeItem('patientData');
              onNavigate('landing');
            }}
            style={{
              padding: '0.8rem 2rem',
              borderRadius: '25px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              backgroundColor: 'transparent',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: 0.8
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.opacity = '0.8';
            }}
          >
            {getText('newAnalysis')}
          </button>
        </div>

        {/* Enhanced Disclaimer */}
        <div style={{
          backgroundColor: 'rgba(255, 193, 7, 0.2)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(255, 193, 7, 0.5)',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
            ⚠️ {getText('disclaimer')}
          </h3>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {analysisResults.disclaimer || "This AI analysis is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers for proper diagnosis and treatment. If you're experiencing a medical emergency, call your local emergency services immediately."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;