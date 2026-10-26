import { Link } from 'react-router-dom';
import logoImage from '../assets/BizzyQcuLogo.png';

/**
 * AuthLogo - Logo component for auth pages
 * Displays in the top-left corner
 */
export default function AuthLogo() {
  return (
    <div className="absolute top-6 left-6 z-10">
      <Link to="/" className="block transition-opacity hover:opacity-80">
        <img 
          src={logoImage} 
          alt="BizzyQCU Logo" 
          className="h-12 w-auto"
        />
      </Link>
    </div>
  );
}
