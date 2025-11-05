import { Star } from "lucide-react";

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
