import { useState, useEffect } from 'react';
import apiClient, {
  updateStoreSettings,
  updateSettingField,
  updateUserEmail,
  updatePassword,
  uploadLogo,
  getErrorMessage,
} from '../../../../../api';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const DEFAULT_COOLDOWNS = {
  name: 0,
  location: 0,
  bio: 0,
  email: 0,
  contact: 0,
  password: 0,
};

const getStoredCooldowns = () => {
  try {
    const saved = localStorage.getItem('bizzy_settings_field_cooldowns');
    if (!saved) return { ...DEFAULT_COOLDOWNS };
    const parsed = JSON.parse(saved);
    const now = Date.now();
    const result = { ...DEFAULT_COOLDOWNS };
    Object.keys(DEFAULT_COOLDOWNS).forEach((field) => {
      const val = Number(parsed[field]);
      if (!isNaN(val) && val > now) {
        result[field] = val;
      } else {
        result[field] = 0;
      }
    });
    return result;
  } catch {
    return { ...DEFAULT_COOLDOWNS };
  }
};

const calculateInitialTimeLefts = (cds) => {
  const now = Date.now();
  const result = { ...DEFAULT_COOLDOWNS };
  Object.keys(DEFAULT_COOLDOWNS).forEach((field) => {
    const end = cds[field] || 0;
    const diff = end - now;
    result[field] = diff > 0 ? diff : 0;
  });
  return result;
};

export function useAccountSettings() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [modalError, setModalError] = useState('');

  // Per-field cooldown state (persisted in localStorage)
  const [cooldowns, setCooldowns] = useState(getStoredCooldowns);
  const [timeLefts, setTimeLefts] = useState(() =>
    calculateInitialTimeLefts(getStoredCooldowns())
  );

  // Form States - cleanly initialized without mock data
  const [orgInfo, setOrgInfo] = useState({
    name: '',
    location: '',
    bio: '',
  });

  const [credentials, setCredentials] = useState({
    email: '',
    contact: '',
  });

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Modal States
  const [activeModal, setActiveModal] = useState(null);
  const [modalInput, setModalInput] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Per-Field Cooldown Timer Interval Effect
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTimeLefts((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.keys(DEFAULT_COOLDOWNS).forEach((field) => {
          const end = cooldowns[field] || 0;
          const diff = end - now;
          const newTime = diff > 0 ? diff : 0;
          if (prev[field] !== newTime) {
            next[field] = newTime;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldowns]);

  // Actual API Call using useEffect and apiClient.get() to fetch real user/organization data
  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        let org = null;
        let store = null;
        let user = null;

        // Fetch real data from backend endpoints in parallel
        const results = await Promise.allSettled([
          apiClient.get('/organization/profile'),
          apiClient.get('/marketplace/stores/me'),
          apiClient.get('/auth/profile'),
        ]);

        if (results[0].status === 'fulfilled') {
          org = results[0].value.data?.data || results[0].value.data;
        }
        if (results[1].status === 'fulfilled') {
          store = results[1].value.data?.data || results[1].value.data;
        }
        if (results[2].status === 'fulfilled') {
          user = results[2].value.data?.data || results[2].value.data;
        }

        if (!isMounted) return;

        const realName = org?.name || store?.name || user?.fullName || '';
        const realLocation = org?.location || store?.pickupLocation || '';
        const realBio = org?.bio || store?.description || '';
        const realEmail = org?.email || user?.email || '';
        const realContact = org?.contactNumber || user?.contactNumber || store?.contactNumber || '';
        const realLogo = org?.logoUrl || store?.logoUrl || null;

        setOrgInfo({
          name: realName,
          location: realLocation,
          bio: realBio,
        });

        setCredentials({
          email: realEmail,
          contact: realContact,
        });

        if (realLogo) {
          setAvatarPreview(realLogo);
        }

        // Synchronize server-side cooldown timestamps if returned
        const cooldownsData = org?.cooldowns;
        if (cooldownsData) {
          const now = Date.now();
          const serverCooldowns = {};
          for (const key of ['name', 'location', 'bio', 'email', 'contact', 'password']) {
            if (cooldownsData[key]) {
              const expireTime = new Date(cooldownsData[key]).getTime() + SEVEN_DAYS_MS;
              if (expireTime > now) {
                serverCooldowns[key] = expireTime;
              }
            }
          }
          if (Object.keys(serverCooldowns).length > 0) {
            setCooldowns((prev) => {
              const merged = { ...prev, ...serverCooldowns };
              try {
                localStorage.setItem('bizzy_settings_field_cooldowns', JSON.stringify(merged));
              } catch (e) {
                console.error('Failed to save cooldowns:', e);
              }
              return merged;
            });
          }
        }
      } catch (err) {
        console.error('Failed to load settings data from server:', err);
        if (isMounted) {
          setErrorMessage(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatTime = (ms) => {
    if (!ms || isNaN(ms) || ms <= 0) return '0s';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  // Helper to trigger a 7-day cooldown for an individual field
  const applyFieldCooldown = (field) => {
    const end = Date.now() + SEVEN_DAYS_MS;
    setCooldowns((prev) => {
      const updated = { ...prev, [field]: end };
      try {
        localStorage.setItem('bizzy_settings_field_cooldowns', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save field cooldowns:', e);
      }
      return updated;
    });
    setTimeLefts((prev) => ({
      ...prev,
      [field]: SEVEN_DAYS_MS,
    }));
  };

  // Password Strength & Match Logic
  const passLength = newPassword.length >= 8;
  const passSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const passNumber = /[0-9]/.test(newPassword);
  const passUpper = /[A-Z]/.test(newPassword);
  const strengthScore = [passLength, passSymbol, passNumber, passUpper].filter(Boolean).length;

  const isMatched = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
  const isMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  // Button is clickable only when all 4 rules pass, passwords match, current password is provided, and password is not on cooldown
  const isPasswordValid =
    strengthScore === 4 &&
    isMatched &&
    currentPassword.trim().length > 0 &&
    (timeLefts.password || 0) === 0;

  // Password Update Handler
  const handleUpdatePassword = async () => {
    if (!isPasswordValid || timeLefts.password > 0) return;
    setIsVerifying(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      await updatePassword({
        currentPassword,
        newPassword,
      });

      applyFieldCooldown('password');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage('Password updated successfully! 7-day cooldown started for Password.');
      alert('Password updated successfully! 7-day cooldown started.');
    } catch (err) {
      console.error('Password update error:', err);
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      alert(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  // Contact Number Validation: Digits only, starts with 09, exactly 11 digits
  const validateContact = (val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      return 'Contact number is required.';
    }
    if (!/^\d+$/.test(trimmed)) {
      return 'Only digits are allowed (no letters or symbols).';
    }
    if (!trimmed.startsWith('09')) {
      return 'Contact number must start with 09.';
    }
    if (trimmed.length !== 11) {
      return 'Contact number must be exactly 11 digits long.';
    }
    return '';
  };

  // Modal Handlers
  const handleOpenModal = (type) => {
    if (timeLefts[type] > 0) return;
    setActiveModal(type);
    setModalError('');
    if (type === 'email' || type === 'contact') {
      setModalInput(credentials[type] || '');
    } else {
      setModalInput(orgInfo[type] || '');
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setModalInput('');
    setModalError('');
  };

  const handleConfirmChange = async (e) => {
    e.preventDefault();
    if (!activeModal || timeLefts[activeModal] > 0) return;

    const trimmed = modalInput.trim();

    // Field-specific validation
    if (activeModal === 'contact') {
      const contactErr = validateContact(trimmed);
      if (contactErr) {
        setModalError(contactErr);
        return;
      }
    } else if (!trimmed) {
      setModalError('This field cannot be empty.');
      return;
    }

    if (activeModal === 'name' && trimmed.length < 3) {
      setModalError('Organization name must be at least 3 characters.');
      return;
    }

    if (activeModal === 'bio' && trimmed.length < 10) {
      setModalError('Short bio must be at least 10 characters.');
      return;
    }

    setIsVerifying(true);
    setModalError('');
    setErrorMessage('');
    setStatusMessage('');

    try {
      await updateSettingField(activeModal, trimmed);

      if (activeModal === 'contact') {
        setCredentials((prev) => ({
          ...prev,
          contact: trimmed,
        }));
        setStatusMessage('Contact number updated successfully.');
      } else if (activeModal === 'email') {
        setCredentials((prev) => ({
          ...prev,
          email: trimmed,
        }));
        setStatusMessage('Institutional email updated successfully.');
      } else {
        setOrgInfo((prev) => ({
          ...prev,
          ...(activeModal === 'name' ? { name: trimmed } : {}),
          ...(activeModal === 'location' ? { location: trimmed } : {}),
          ...(activeModal === 'bio' ? { bio: trimmed } : {}),
        }));
        setStatusMessage('Organization profile updated successfully.');
      }

      // Apply 7-day cooldown strictly to this field only!
      applyFieldCooldown(activeModal);
      handleCloseModal();
    } catch (err) {
      console.error('Settings update error:', err);
      const msg = getErrorMessage(err);
      setModalError(msg);
      setErrorMessage(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  // Upload Logo Handler
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);

    setIsVerifying(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const uploadRes = await uploadLogo(file);
      const uploadedUrl = uploadRes?.url;

      if (uploadedUrl) {
        await updateStoreSettings({ logoUrl: uploadedUrl });
        setAvatarPreview(uploadedUrl);
        setStatusMessage('Organization logo uploaded and saved successfully.');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      alert(`Logo upload failed: ${msg}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isLoading,
    isVerifying,
    errorMessage,
    statusMessage,
    modalError,
    setModalError,
    timeLefts,
    formatTime,
    orgInfo,
    credentials,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    activeModal,
    modalInput,
    setModalInput,
    avatarPreview,
    strengthScore,
    passLength,
    passSymbol,
    passNumber,
    passUpper,
    isMatched,
    isMismatch,
    isPasswordValid,
    validateContact,
    handleUpdatePassword,
    handleOpenModal,
    handleCloseModal,
    handleConfirmChange,
    handleFileChange,
  };
}
