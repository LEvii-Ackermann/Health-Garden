import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/common/Button';

const BasicInformation = ({ onNavigate }) => {
  const { getCurrentLanguage } = useLanguage();
  const currentLang = getCurrentLanguage();

  // Form state
  const [formData, setFormData] = useState({
    ageGroup: '',
    gender: '',
    location: '',
    emergencyContact: ''
  });

  const [errors, setErrors] = useState({});

  // Multilingual content
  const content = {
    en: {
      title: "Basic Information",
      subtitle: "Help us provide better assistance",
      ageGroup: {
        label: "Age Group",
        options: [
          { value: 'child', label: '0-12 years', icon: '👶' },
          { value: 'teen', label: '13-19 years', icon: '👦' },
          { value: 'adult', label: '20-59 years', icon: '👨' },
          { value: 'senior', label: '60+ years', icon: '👴' }
        ]
      },
      gender: {
        label: "Gender (Optional)",
        options: [
          { value: 'male', label: 'Male', icon: '👨' },
          { value: 'female', label: 'Female', icon: '👩' },
          { value: 'other', label: 'Other', icon: '👤' },
          { value: 'prefer-not-to-say', label: 'Prefer not to say', icon: '🤐' }
        ]
      },
      location: {
        label: "Location (City, State)",
        placeholder: "e.g., Mumbai, Maharashtra"
      },
      emergencyContact: {
        label: "Emergency Contact (Optional)",
        placeholder: "Phone number of family member"
      },
      continue: "Continue to Symptoms",
      back: "← Back",
      required: "This field is required",
      privacy: "🔒 Your information is kept private and secure"
    },
    hi: {
      title: "बुनियादी जानकारी",
      subtitle: "बेहतर सहायता के लिए हमारी मदद करें",
      ageGroup: {
        label: "आयु समूह",
        options: [
          { value: 'child', label: '0-12 साल', icon: '👶' },
          { value: 'teen', label: '13-19 साल', icon: '👦' },
          { value: 'adult', label: '20-59 साल', icon: '👨' },
          { value: 'senior', label: '60+ साल', icon: '👴' }
        ]
      },
      gender: {
        label: "लिंग (वैकल्पिक)",
        options: [
          { value: 'male', label: 'पुरुष', icon: '👨' },
          { value: 'female', label: 'महिला', icon: '👩' },
          { value: 'other', label: 'अन्य', icon: '👤' },
          { value: 'prefer-not-to-say', label: 'नहीं बताना चाहते', icon: '🤐' }
        ]
      },
      location: {
        label: "स्थान (शहर, राज्य)",
        placeholder: "जैसे मुंबई, महाराष्ट्र"
      },
      emergencyContact: {
        label: "आपातकालीन संपर्क (वैकल्पिक)",
        placeholder: "परिवार के सदस्य का फोन नंबर"
      },
      continue: "लक्षणों के लिए जारी रखें",
      back: "← वापस",
      required: "यह फ़ील्ड आवश्यक है",
      privacy: "🔒 आपकी जानकारी निजी और सुरक्षित रखी जाती है"
    }
  };

  const currentContent = content[currentLang?.code] || content.en;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ageGroup) {
      newErrors.ageGroup = currentContent.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // FIXED: Store in patientData (not userBasicInfo) and include readable age label
      const ageGroupLabel = currentContent.ageGroup.options.find(
        opt => opt.value === formData.ageGroup
      )?.label || formData.ageGroup;

      const patientInfo = {
        ageGroup: formData.ageGroup,
        ageGroupLabel: ageGroupLabel, // Human-readable age
        gender: formData.gender,
        location: formData.location,
        emergencyContact: formData.emergencyContact,
        timestamp: new Date().toISOString()
      };

      // Store with consistent key name
      localStorage.setItem('patientData', JSON.stringify(patientInfo));
      
      console.log('Stored patient data:', patientInfo); // Debug log
      
      onNavigate('symptom-input');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '600px',
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

        {/* Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Age Group */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '1.2rem', 
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              {currentContent.ageGroup.label} *
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '1rem'
            }}>
              {currentContent.ageGroup.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('ageGroup', option.value)}
                  style={{
                    background: formData.ageGroup === option.value 
                      ? 'rgba(76, 175, 80, 0.3)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    border: formData.ageGroup === option.value
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
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {option.icon}
                  </div>
                  <div style={{ fontSize: '0.9rem' }}>
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
            {errors.ageGroup && (
              <p style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {errors.ageGroup}
              </p>
            )}
          </div>

          {/* Gender */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '1.2rem', 
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              {currentContent.gender.label}
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '1rem'
            }}>
              {currentContent.gender.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('gender', option.value)}
                  style={{
                    background: formData.gender === option.value 
                      ? 'rgba(76, 175, 80, 0.3)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    border: formData.gender === option.value
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
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                    {option.icon}
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '1.2rem', 
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              {currentContent.location.label}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder={currentContent.location.placeholder}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '10px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Emergency Contact */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '1.2rem', 
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              {currentContent.emergencyContact.label}
            </label>
            <input
              type="tel"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder={currentContent.emergencyContact.placeholder}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '10px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Privacy Notice */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            opacity: 0.8
          }}>
            {currentContent.privacy}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}>
            <Button 
              onClick={() => onNavigate('language-selection')}
              variant="outline"
            >
              {currentContent.back}
            </Button>
            
            <Button 
              onClick={handleContinue}
              variant="primary"
              size="large"
            >
              {currentContent.continue}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInformation;