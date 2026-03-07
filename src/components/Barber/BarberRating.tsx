/**
 * AUTO-FILE-COMMENT: src/components/Barber/BarberRating.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { Star } from "lucide-react";

/**
 * AUTO-FUNCTION-COMMENT: BarberRating
 * Purpose: Handles barber rating.
 * Line-by-line:
 * 1. Executes `const percentages = [70, 20, 5, 3, 2];`.
 * 2. Executes `return (`.
 * 3. Executes `<div className="flex flex-wrap gap-x-8 gap-y-6 pt-4">`.
 * 4. Executes `<div>`.
 * 5. Executes `<p className="text-4xl font-black">{rating}</p>`.
 * 6. Executes `<div className="flex gap-0.5 py-1">`.
 * 7. Executes `{[1, 2, 3, 4].map((_, i) => (`.
 * 8. Executes `<Star key={i} fill="#181411" stroke="#181411" size={18} />`.
 * 9. Executes `))}`.
 * 10. Executes `<Star size={18} stroke="#181411" />`.
 * 11. Executes `</div>`.
 * 12. Executes `<p className="text-sm">{totalReviews} reviews</p>`.
 * 13. Executes `</div>`.
 * 14. Executes `<div className="grid grid-cols-[20px_1fr_40px] flex-1 min-w-[200px] max-w-[400px] gap-y-2">`.
 * 15. Executes `{percentages.map((p, i) => (`.
 * 16. Executes `<div key={i} className="contents">`.
 * 17. Executes `<p className="text-sm">{5 - i}</p>`.
 * 18. Executes `<div className="h-2 rounded-full bg-[#e6e0db] overflow-hidden">`.
 * 19. Executes `<div`.
 * 20. Executes `className="h-2 bg-[#181411] rounded-full"`.
 * 21. Executes `style={{ width: \`${p}%\` }}`.
 * 22. Executes `/>`.
 * 23. Executes `</div>`.
 * 24. Executes `<p className="text-[#8a7560] text-sm text-right">{p}%</p>`.
 * 25. Executes `</div>`.
 * 26. Executes `))}`.
 * 27. Executes `</div>`.
 * 28. Executes `</div>`.
 * 29. Executes `);`.
 */
export default function BarberRating({
  rating,
  totalReviews,
}: {
  rating: number;
  totalReviews: number;
}) {
  const percentages = [70, 20, 5, 3, 2];

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-6 pt-4">
      <div>
        <p className="text-4xl font-black">{rating}</p>
        <div className="flex gap-0.5 py-1">
          {[1, 2, 3, 4].map((_, i) => (
            <Star key={i} fill="#181411" stroke="#181411" size={18} />
          ))}
          <Star size={18} stroke="#181411" />
        </div>
        <p className="text-sm">{totalReviews} reviews</p>
      </div>

      <div className="grid grid-cols-[20px_1fr_40px] flex-1 min-w-[200px] max-w-[400px] gap-y-2">
        {percentages.map((p, i) => (
          <div key={i} className="contents">
            <p className="text-sm">{5 - i}</p>
            <div className="h-2 rounded-full bg-[#e6e0db] overflow-hidden">
              <div
                className="h-2 bg-[#181411] rounded-full"
                style={{ width: `${p}%` }}
              />
            </div>
            <p className="text-[#8a7560] text-sm text-right">{p}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
