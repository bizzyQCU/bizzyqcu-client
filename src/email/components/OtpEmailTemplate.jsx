import { OTP_EMAIL_COPY } from '../otpEmailConfig';
import beeLogo from '../bizzyqcu-bee-logo.png';
import '../email.css';

/**
 * Frontend representation of the BizzyQCU OTP email template
 * (shares email.css and bizzyqcu-bee-logo.png with bizzyqcu-server/src/utils/email.ts).
 */
export default function OtpEmailTemplate({ otp = '492149', purpose = 'login' }) {
  const copy = OTP_EMAIL_COPY[purpose] || OTP_EMAIL_COPY.login;
  const displayOtp = otp.trim() || '000000';

  return (
    <div className="email-canvas">
      <div className="email-card">
        <div className="email-top-stripe" />

        {/* Brand Logo Header */}
        <div className="email-header">
          <div className="email-brand">
            <img
              src={beeLogo}
              alt="BizzyQCU"
              width="54"
              height="46"
              className="block shrink-0"
            />
            <div className="email-wordmark">
              <span className="email-wordmark-bizzy">Bizzy</span>{' '}
              <span className="email-wordmark-qcu">QCU</span>
            </div>
          </div>
          <p className="email-subtitle">Quezon City University Community Portal</p>
        </div>

        <div className="email-divider" />

        {/* Main Body Content */}
        <div className="email-body">
          <div>
            <span className="email-purpose-badge">{copy.badge}</span>
          </div>

          <h1 className="email-heading">{copy.heading}</h1>
          <p className="email-intro">{copy.intro}</p>

          <div className="email-otp-box">
            <span className="email-otp-label">ONE-TIME PASSCODE</span>
            <div className="email-otp-code">{displayOtp}</div>
          </div>

          <div className="email-expiry-wrap">
            <div className="email-expiry-pill">
              &#9201; This code expires in <strong style={{ color: '#0B132B' }}>5 minutes</strong>.
            </div>
          </div>

          <div className="email-warning-box">
            <strong style={{ color: '#92400E' }}>Security Reminder:</strong> Do not share this code with anyone.
            BizzyQCU staff or student admins will never ask for your verification code.
          </div>
        </div>

        {/* Footer */}
        <div className="email-footer">
          <p className="email-footer-note">{copy.actionNote}</p>
          <p className="email-footer-copy">
            &copy; {new Date().getFullYear()}{' '}
            <strong style={{ color: '#1D3B8B' }}>Bizzy</strong>
            <strong style={{ color: '#F7A600' }}>QCU</strong> &bull; Automated Security Notification
          </p>
        </div>
      </div>
    </div>
  );
}
