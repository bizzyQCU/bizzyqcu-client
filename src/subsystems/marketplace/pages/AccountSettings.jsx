import React, { useState, useEffect, useRef } from 'react';

export default function AccountSettings() {
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = useRef(null);

  // 7-Day Cooldown System
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const [cooldownEnd, setCooldownEnd] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Form States
  const [orgInfo, setOrgInfo] = useState({
    name: 'QCU Bookworms Guild',
    location: 'San Bartolome Campus (Main), IK Building, Booth 3',
    bio: 'Campus-approved pre-loved engineering textbooks and reviewers.',
  });

  const [credentials, setCredentials] = useState({
    email: 'bookworms@qcu.edu.ph',
  });

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Modal States
  const [activeModal, setActiveModal] = useState(null); 
  const [modalInput, setModalInput] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Cooldown Timer
  useEffect(() => {
    if (cooldownEnd === 0) {
      setTimeLeft(0);
      return;
    }
    const interval = setInterval(() => {
      const difference = cooldownEnd - Date.now();
      if (difference <= 0) {
        clearInterval(interval);
        setCooldownEnd(0);
        setTimeLeft(0);
      } else {
        setTimeLeft(difference);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownEnd]);

  const formatTime = (ms) => {
    if (ms <= 0) return '0s';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    result += `${seconds}s`;
    return result;
  };

  // Password Strength Logic
  const passLength = newPassword.length >= 8;
  const passSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const passNumber = /[0-9]/.test(newPassword);
  const passUpper = /[A-Z]/.test(newPassword);
  
  const strengthScore = [passLength, passSymbol, passNumber, passUpper].filter(Boolean).length;
  const isPasswordValid = strengthScore === 4 && newPassword === confirmPassword && currentPassword.length > 0;

  const handleUpdatePassword = () => {
    if (!isPasswordValid) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setCooldownEnd(Date.now() + SEVEN_DAYS_MS);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated successfully! 7-day cooldown started.');
    }, 1500);
  };

  // Org Info Handlers
  const handleOpenModal = (type) => {
    if (timeLeft > 0) return;
    setActiveModal(type);
    setModalInput(orgInfo[type] || credentials[type]);
  };

  const handleCloseModal = () => setActiveModal(null);

  const handleConfirmChange = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setCooldownEnd(Date.now() + SEVEN_DAYS_MS);
      if (activeModal === 'email') {
        setCredentials({ ...credentials, email: modalInput });
      } else {
        setOrgInfo({ ...orgInfo, [activeModal]: modalInput });
      }
      handleCloseModal();
    }, 1500);
  };

  const handleAvatarClick = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  return (
    // ITO ANG MAGIC: 'fixed inset-0 z-[999]' - sasakupin nito ang buong screen at tatakpan ang Navbar/Footer
    <div className="fixed inset-0 z-[999] flex bg-[#f8fafc] font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR (Fixed sa kaliwa) */}
      <aside className="w-[260px] bg-[#0f172a] text-white flex flex-col h-full shadow-xl shrink-0">
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            B
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-blue-500">Bizzy</span>QCU
          </span>
        </div>
        
        <div className="px-6 py-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          Student Org Seller Portal
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            Products
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            Inventory Management
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            Orders
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Reports & Analytics
          </a>
        </nav>
        
        {/* Bottom Nav (Account Settings & Log Out) */}
        <div className="p-4 border-t border-slate-800 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Account Settings
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Log Out
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT AREA (May sariling scroll) */}
      <main className="flex-1 p-8 lg:p-10 overflow-y-auto h-full">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Account Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your organization profile and security credentials.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pb-10">
          
          {/* LEFT: ORGANIZATION PROFILE */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Organization Profile</h2>
            <p className="text-xs text-slate-500 mb-6">Your public seller information.</p>
            
            <div className="flex flex-col items-center mb-6">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Org Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-slate-400">QB</span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
              </div>
              <button onClick={handleAvatarClick} type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Upload Org Logo</button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Organization Name</label>
                  {timeLeft === 0 ? (
                    <button onClick={() => handleOpenModal('name')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Change</button>
                  ) : <span className="text-[10px] font-semibold text-slate-400">Locked ({formatTime(timeLeft)})</span>}
                </div>
                <p className="text-sm font-bold text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">{orgInfo.name}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Campus Location</label>
                  {timeLeft === 0 ? (
                    <button onClick={() => handleOpenModal('location')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Change</button>
                  ) : <span className="text-[10px] font-semibold text-slate-400">Locked ({formatTime(timeLeft)})</span>}
                </div>
                <p className="text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">{orgInfo.location}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Short Bio</label>
                  {timeLeft === 0 ? (
                    <button onClick={() => handleOpenModal('bio')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Change</button>
                  ) : <span className="text-[10px] font-semibold text-slate-400">Locked ({formatTime(timeLeft)})</span>}
                </div>
                <p className="text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">{orgInfo.bio}</p>
              </div>
            </div>
          </div>

          {/* RIGHT: SECURITY & PASSWORD */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800">Security & Password Management</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">Current Password</label>
                    <a href="#" className="text-[10px] text-blue-500 hover:underline">Forgot student password?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <input 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={timeLeft > 0}
                      placeholder="Enter current password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={timeLeft > 0}
                      placeholder="Create new password" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={timeLeft > 0}
                      placeholder="Repeat new password" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" 
                    />
                  </div>
                </div>

                {/* PASSWORD STRENGTH METER */}
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-2 block">Password Strength</label>
                  <div className="flex gap-1 h-1.5 mb-2">
                    <div className={`flex-1 rounded-full transition-colors ${strengthScore > 0 ? 'bg-red-400' : 'bg-slate-200'}`}></div>
                    <div className={`flex-1 rounded-full transition-colors ${strengthScore > 1 ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
                    <div className={`flex-1 rounded-full transition-colors ${strengthScore > 2 ? 'bg-green-400' : 'bg-slate-200'}`}></div>
                    <div className={`flex-1 rounded-full transition-colors ${strengthScore > 3 ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-4">
                    <span>Weak</span>
                    <span>Strong</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${passLength ? 'bg-green-500' : 'bg-slate-300'}`}></span> 8+ Characters
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${passSymbol ? 'bg-green-500' : 'bg-slate-300'}`}></span> Special symbol (!@#$)
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${passNumber ? 'bg-green-500' : 'bg-slate-300'}`}></span> At least 1 number
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${passUpper ? 'bg-green-500' : 'bg-slate-300'}`}></span> At least 1 uppercase
                    </div>
                  </div>
                </div>

                {newPassword !== confirmPassword && confirmPassword.length > 0 && (
                  <p className="text-xs text-red-500 font-semibold">Passwords do not match.</p>
                )}

                <div className="pt-4 flex justify-end border-t border-slate-100">
                  <button 
                    onClick={handleUpdatePassword} 
                    disabled={!isPasswordValid || timeLeft > 0} 
                    className={`px-6 py-2.5 rounded-lg text-white font-bold text-xs shadow-sm transition-all ${(!isPasswordValid || timeLeft > 0) ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isVerifying ? 'Updating...' : timeLeft > 0 ? `Locked (${formatTime(timeLeft)})` : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>

            {/* EMAIL CREDENTIALS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Institutional Email</h2>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                  {timeLeft === 0 ? (
                    <button onClick={() => handleOpenModal('email')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Change</button>
                  ) : <span className="text-[10px] font-semibold text-slate-400">Locked ({formatTime(timeLeft)})</span>}
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <span className="text-sm font-medium text-slate-800">{credentials.email}</span>
                  <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">Verified</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* MODAL FOR ORG INFO ONLY (Short Bio, Name, Location, Email) */}
      {activeModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#11183c] mb-2">
                Change {activeModal === 'name' ? 'Organization Name' : activeModal === 'location' ? 'Campus Location' : activeModal === 'bio' ? 'Short Bio' : 'Email Address'}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Update your details. This action starts a 7-day cooldown.
              </p>
              
              <form onSubmit={handleConfirmChange}>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-[#11183c] mb-2">
                    New {activeModal === 'name' ? 'Organization Name' : activeModal === 'location' ? 'Campus Location' : activeModal === 'bio' ? 'Short Bio' : 'Email Address'}
                  </label>
                  {activeModal === 'bio' ? (
                    <textarea 
                      required 
                      value={modalInput} 
                      onChange={(e) => setModalInput(e.target.value)} 
                      rows="3"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                    />
                  ) : (
                    <input 
                      type={activeModal === 'email' ? 'email' : 'text'} 
                      required 
                      value={modalInput} 
                      onChange={(e) => setModalInput(e.target.value)} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  )}
                </div>
                
                <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                  <button type="button" onClick={handleCloseModal} disabled={isVerifying} className="px-5 py-2.5 rounded-lg text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isVerifying} className="px-5 py-2.5 rounded-lg bg-[#1e2746] text-white font-semibold text-xs hover:bg-[#161c33] transition-colors">{isVerifying ? 'Saving...' : 'Confirm'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}