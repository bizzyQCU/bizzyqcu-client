import { useEffect, useState } from "react";

const QUERY = "(max-width: 767px)";

// True on phone-width screens. Updates when the window is resized or rotated.
export default function useIsMobile() {
  const supported = typeof window !== "undefined" && typeof window.matchMedia === "function";
  const [mobile, setMobile] = useState(() => (supported ? window.matchMedia(QUERY).matches : false));

  useEffect(() => {
    if (!supported) return;
    const mq = window.matchMedia(QUERY);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [supported]);

  return mobile;
}
