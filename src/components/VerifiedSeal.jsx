import seal from "../assets/verified-seal.png";

// Gold verified seal used for every verified mark in the app.
export default function VerifiedSeal({ className = "h-4 w-4" }) {
  return <img src={seal} alt="Verified" className={`inline-block shrink-0 object-contain ${className}`} />;
}
