// Product flies from its button into the cart icon, then the cart badge pulses.
export function flyToCart(fromEl, targetId = "cart-button") {
  const cart = document.getElementById(targetId);
  if (!fromEl || !cart) return;
  const a = fromEl.getBoundingClientRect();
  const b = cart.getBoundingClientRect();
  const dot = document.createElement("div");
  dot.textContent = "+1";
  dot.className = "pointer-events-none fixed z-[60] flex h-9 w-9 items-center justify-center rounded-full bg-[#0284C7] text-xs font-bold text-white shadow-lg";
  dot.style.left = `${a.left + a.width / 2 - 18}px`;
  dot.style.top = `${a.top + a.height / 2 - 18}px`;
  document.body.appendChild(dot);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const anim = dot.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 90}px) scale(1.1)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0.4 },
    ],
    { duration: 750, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
  );
  anim.onfinish = () => {
    dot.remove();
    cart.animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 350 });
  };
}
