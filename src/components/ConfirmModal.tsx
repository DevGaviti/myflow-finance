type Props = {
    open: boolean;
  
    title: string;
  
    description: string;
  
    confirmText?: string;
  
    cancelText?: string;
  
    loading?: boolean;
  
    onConfirm: () => void;
  
    onCancel: () => void;
  };
  
  export default function ConfirmModal({
    open,
  
    title,
  
    description,
  
    confirmText = 'Confirmar',
  
    cancelText = 'Cancelar',
  
    loading = false,
  
    onConfirm,
  
    onCancel,
  }: Props) {
    if (!open) {
      return null;
    }
  
    return (
      <div className="modal-overlay">
        <div className="confirm-modal">
          <h2>{title}</h2>
  
          <p className="delete-text">
            {description}
          </p>
  
          <div className="modal-actions">
            <button
              className="secondary-btn"
              disabled={loading}
              onClick={onCancel}
            >
              {cancelText}
            </button>
  
            <button
              className="danger-btn"
              disabled={loading}
              onClick={onConfirm}
            >
              {loading
                ? 'Processando...'
                : confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  }