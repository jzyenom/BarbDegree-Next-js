/**
 * AUTO-FILE-COMMENT: src/components/Client/RebookCard.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
"use client";

type RebookCardProps = {
  title: string;
  subtitle: string;
  imageUrl: string;
};

/**
 * AUTO-FUNCTION-COMMENT: RebookCard
 * Purpose: Handles rebook card.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<div className="min-w-[170px] max-w-[170px]">`.
 * 3. Executes `<div className="h-36 w-full overflow-hidden rounded-2xl bg-[#f5f2f0]">`.
 * 4. Executes `<img`.
 * 5. Executes `src={imageUrl}`.
 * 6. Executes `alt={title}`.
 * 7. Executes `className="h-full w-full object-cover"`.
 * 8. Executes `loading="lazy"`.
 * 9. Executes `/>`.
 * 10. Executes `</div>`.
 * 11. Executes `<div className="pt-3">`.
 * 12. Executes `<p className="text-base font-semibold text-[#181411]">{title}</p>`.
 * 13. Executes `<p className="text-sm text-[#8a7560]">{subtitle}</p>`.
 * 14. Executes `</div>`.
 * 15. Executes `</div>`.
 * 16. Executes `);`.
 */
export default function RebookCard({
  title,
  subtitle,
  imageUrl,
}: RebookCardProps) {
  return (
    <div className="min-w-[170px] max-w-[170px]">
      <div className="h-36 w-full overflow-hidden rounded-2xl bg-[#f5f2f0]">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="pt-3">
        <p className="text-base font-semibold text-[#181411]">{title}</p>
        <p className="text-sm text-[#8a7560]">{subtitle}</p>
      </div>
    </div>
  );
}
