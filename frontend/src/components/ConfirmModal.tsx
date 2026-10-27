import Modal from "./Modal";
import "./Modal.css";
import "./Form.css";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function ConfirmModal({ title, message, confirmLabel = "Excluir", onConfirm, onClose, loading }: ConfirmModalProps) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="modal-icon modal-icon--danger">!</div>
      <p className="modal-card__body">{message}</p>
      <div className="modal-card__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Excluindo..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

interface InfoModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

export function InfoModal({ title, message, onClose }: InfoModalProps) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="modal-icon modal-icon--blocked">i</div>
      <p className="modal-card__body">{message}</p>
      <div className="modal-card__actions">
        <button type="button" className="btn btn--primary" onClick={onClose}>
          Entendi
        </button>
      </div>
    </Modal>
  );
}
