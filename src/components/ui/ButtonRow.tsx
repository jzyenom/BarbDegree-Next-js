interface ButtonRowProps {
  onEdit: () => void;
  onConfirm: () => void;
}

export default function ButtonRow({ onEdit, onConfirm }: ButtonRowProps) {
  return (
    <div className="flex flex-1 gap-3 px-4 py-3 justify-between">
      <button
        onClick={onEdit}
        className="flex flex-1 items-center justify-center h-12 bg-[#f5f2f0] text-[#181411] font-bold rounded-lg"
      >
        Edit
      </button>
      <button
        onClick={onConfirm}
        className="flex flex-1 items-center justify-center h-12 bg-[#f2800d] text-[#181411] font-bold rounded-lg"
      >
        Confirm Booking
      </button>
    </div>
  );
}
