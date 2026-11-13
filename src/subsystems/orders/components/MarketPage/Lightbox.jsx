import Icon from "../../../../components/Icon.jsx";
import ModalShell from "../Dialogs/ModalShell.jsx";
import ProductGallery from "./ProductGallery.jsx";

// Photo viewer: same modal behaviour as every other dialog, with a frosted backdrop.
export default function Lightbox({ open, onClose, title, images }) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      label={title}
      overlayClassName="bg-white/30 backdrop-blur-xl"
      panelClassName="w-full max-w-xl"
    >
      <div className="cascade mb-3 flex items-center justify-between" style={{ "--d": "0ms" }}>
        <span className="text-sm font-bold text-slate-900">{title}</span>
        <button type="button" aria-label="Close photos" onClick={onClose} className="rounded-full bg-white p-1.5 text-slate-600 transition hover:text-slate-900">
          <Icon name="x" className="h-4 w-4" />
        </button>
      </div>
      <div className="cascade" style={{ "--d": "90ms" }}>
        <ProductGallery images={images} />
      </div>
    </ModalShell>
  );
}
