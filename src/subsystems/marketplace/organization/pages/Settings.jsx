import React, { useRef } from 'react';
import { useAccountSettings } from '../components/settings/settings';
import Sidebar from '../components/Sidebar';

export default function Settings() {
  const fileInputRef = useRef(null);

  const {
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
  } = useAccountSettings();

  return (
    <div className="fixed inset-0 z-[999] flex bg-[#f8fafc] font-sans text-slate-800 overflow-hidden">
      {/* SIDEBAR ON THE LEFT */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 lg:p-10 overflow-y-auto h-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Account Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your organization profile, contact info, and security credentials.</p>
        </div>

        {/* NOTIFICATION BANNERS */}
        {statusMessage && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{statusMessage}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center p-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-500">Loading settings from server...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pb-10">
            {/* LEFT: ORGANIZATION PROFILE */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-1">Organization Profile</h2>
              <p className="text-xs text-slate-500 mb-6">Your public seller information.</p>

              <div className="flex flex-col items-center mb-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Org Logo" className="w-full h-full object-cover" />
                    ) : orgInfo.name ? (
                      <span className="text-2xl font-bold text-slate-500">
                        {orgInfo.name.trim().substring(0, 2).toUpperCase()}
                      </span>
                    ) : (
                      <svg className="w-10 h-10 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-white">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isVerifying}
                  type="button"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {isVerifying ? 'Uploading Logo...' : 'Upload Org Logo'}
                </button>
              </div>

              <div className="space-y-4">
                {/* ORGANIZATION NAME */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Organization Name
                    </label>
                    {timeLefts.name > 0 ? (
                      <span className="text-[10px] font-semibold text-slate-400">Locked ({formatTime(timeLefts.name)})</span>
                    ) : (
                      <button
                        onClick={() => handleOpenModal('name')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {orgInfo.name || 'Not set'}
                  </p>
                </div>

                {/* CAMPUS LOCATION */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Campus Location
                    </label>
                    {timeLefts.location > 0 ? (
                      <span className="text-[10px] font-semibold text-slate-400">Locked ({formatTime(timeLefts.location)})</span>
                    ) : (
                      <button
                        onClick={() => handleOpenModal('location')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {orgInfo.location || 'Not set'}
                  </p>
                </div>

                {/* SHORT BIO */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Short Bio</label>
                    {timeLefts.bio > 0 ? (
                      <span className="text-[10px] font-semibold text-slate-400">Locked ({formatTime(timeLefts.bio)})</span>
                    ) : (
                      <button
                        onClick={() => handleOpenModal('bio')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {orgInfo.bio || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SECURITY & CONTACT/EMAIL */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* SECURITY & PASSWORD MANAGEMENT */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Security & Password Management</h2>
                </div>

                <div className="space-y-5">
                  {/* CURRENT PASSWORD INPUT WITH LOCK ICON */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-700">Current Password</label>
                      <a href="#" className="text-[10px] text-blue-500 hover:underline">
                        Forgot student password?
                      </a>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={timeLefts.password > 0 || isVerifying}
                        placeholder="Enter current password"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* NEW PASSWORD */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={timeLefts.password > 0 || isVerifying}
                        placeholder="Create new password"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                      />
                    </div>

                    {/* CONFIRM NEW PASSWORD */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={timeLefts.password > 0 || isVerifying}
                        placeholder="Repeat new password"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* LIVE PASSWORD MATCHING STATUS */}
                  {isMatched && (
                    <p className="text-xs text-green-600 font-semibold flex items-center gap-1.5 animate-fade-in">
                      <svg className="w-4 h-4 shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Passwords match!</span>
                    </p>
                  )}

                  {isMismatch && (
                    <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5 animate-fade-in">
                      <svg className="w-4 h-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Passwords do not match.</span>
                    </p>
                  )}

                  {/* PASSWORD STRENGTH METER */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Password Strength</label>
                    <div className="flex gap-1 h-1.5 mb-2">
                      <div
                        className={`flex-1 rounded-full transition-colors ${
                          strengthScore > 0 ? 'bg-red-400' : 'bg-slate-200'
                        }`}
                      ></div>
                      <div
                        className={`flex-1 rounded-full transition-colors ${
                          strengthScore > 1 ? 'bg-amber-400' : 'bg-slate-200'
                        }`}
                      ></div>
                      <div
                        className={`flex-1 rounded-full transition-colors ${
                          strengthScore > 2 ? 'bg-green-400' : 'bg-slate-200'
                        }`}
                      ></div>
                      <div
                        className={`flex-1 rounded-full transition-colors ${
                          strengthScore > 3 ? 'bg-green-500' : 'bg-slate-200'
                        }`}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-4">
                      <span>Weak</span>
                      <span>Strong</span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${passLength ? 'bg-green-500' : 'bg-slate-300'}`}
                        ></span>{' '}
                        8+ Characters
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${passSymbol ? 'bg-green-500' : 'bg-slate-300'}`}
                        ></span>{' '}
                        Special symbol (!@#$)
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${passNumber ? 'bg-green-500' : 'bg-slate-300'}`}
                        ></span>{' '}
                        At least 1 number
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${passUpper ? 'bg-green-500' : 'bg-slate-300'}`}
                        ></span>{' '}
                        At least 1 uppercase
                      </div>
                    </div>
                  </div>

                  {/* COOLDOWN VISUAL INDICATOR TEXT */}
                  {timeLefts.password > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-800 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Password change is on cooldown. Try again in {formatTime(timeLefts.password)}.</span>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end border-t border-slate-100">
                    <button
                      onClick={handleUpdatePassword}
                      disabled={!isPasswordValid || isVerifying}
                      className={`px-6 py-2.5 rounded-lg text-white font-bold text-xs shadow-sm transition-all ${
                        !isPasswordValid || isVerifying
                          ? 'bg-slate-300 cursor-not-allowed opacity-70'
                          : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                      }`}
                    >
                      {isVerifying ? 'Updating...' : timeLefts.password > 0 ? `Locked (${formatTime(timeLefts.password)})` : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>

              {/* CONTACT & INSTITUTIONAL CREDENTIALS */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Contact & Institutional Credentials</h2>

                {/* CONTACT NUMBER FIELD (RIGHT ABOVE EMAIL ADDRESS) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Contact Number</label>
                    {timeLefts.contact > 0 ? (
                      <span className="text-[10px] font-semibold text-slate-400">Locked ({formatTime(timeLefts.contact)})</span>
                    ) : (
                      <button
                        onClick={() => handleOpenModal('contact')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {/* PHONE ICON */}
                    <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-slate-800">
                      {credentials.contact || 'No contact number provided'}
                    </span>
                    {credentials.contact && (
                      <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* INSTITUTIONAL EMAIL ADDRESS */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                    {timeLefts.email > 0 ? (
                      <span className="text-[10px] font-semibold text-slate-400">Locked ({formatTime(timeLefts.email)})</span>
                    ) : (
                      <button
                        onClick={() => handleOpenModal('email')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-slate-800">
                      {credentials.email || 'No email registered'}
                    </span>
                    <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* MODAL FOR PER-FIELD UPDATES */}
      {activeModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#11183c] mb-2">
                Change{' '}
                {activeModal === 'name'
                  ? 'Organization Name'
                  : activeModal === 'location'
                  ? 'Campus Location'
                  : activeModal === 'bio'
                  ? 'Short Bio'
                  : activeModal === 'contact'
                  ? 'Contact Number'
                  : 'Email Address'}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Update your details. This action starts a 7-day cooldown for this field.
              </p>

              <form onSubmit={handleConfirmChange}>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-[#11183c] mb-2">
                    New{' '}
                    {activeModal === 'name'
                      ? 'Organization Name (Min 3 characters)'
                      : activeModal === 'location'
                      ? 'Campus Location'
                      : activeModal === 'bio'
                      ? 'Short Bio (Min 10 characters)'
                      : activeModal === 'contact'
                      ? 'Contact Number (09XXXXXXXXX)'
                      : 'Email Address'}
                  </label>

                  {activeModal === 'bio' ? (
                    <textarea
                      required
                      value={modalInput}
                      onChange={(e) => {
                        setModalInput(e.target.value);
                        if (e.target.value.trim().length < 10) {
                          setModalError('Short bio must be at least 10 characters.');
                        } else {
                          setModalError('');
                        }
                      }}
                      rows="3"
                      placeholder="Describe your student organization (min 10 characters)..."
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm focus:ring-2 outline-none resize-none ${
                        modalError ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                  ) : activeModal === 'contact' ? (
                    <input
                      type="tel"
                      inputMode="numeric"
                      required
                      maxLength={11}
                      value={modalInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setModalInput(val);
                        setModalError(validateContact(val));
                      }}
                      placeholder="09XXXXXXXXX"
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm focus:ring-2 outline-none ${
                        modalError ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                  ) : (
                    <input
                      type={activeModal === 'email' ? 'email' : 'text'}
                      required
                      value={modalInput}
                      onChange={(e) => {
                        setModalInput(e.target.value);
                        setModalError('');
                      }}
                      placeholder={`Enter new ${
                        activeModal === 'name'
                          ? 'organization name'
                          : activeModal === 'location'
                          ? 'campus location'
                          : 'email address'
                      }`}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm focus:ring-2 outline-none ${
                        modalError ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                  )}

                  {/* INLINE ERROR MESSAGE IN MODAL */}
                  {modalError && (
                    <p className="text-xs text-red-500 font-semibold mt-2 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{modalError}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isVerifying}
                    className="px-5 py-2.5 rounded-lg text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying || !!modalError}
                    className={`px-5 py-2.5 rounded-lg text-white font-semibold text-xs transition-colors ${
                      isVerifying || !!modalError
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-[#1e2746] hover:bg-[#161c33]'
                    }`}
                  >
                    {isVerifying ? 'Saving...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
