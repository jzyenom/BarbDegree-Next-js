"use client";

type RebookCardProps = {
  title: string;
  subtitle: string;
  imageUrl: string;
};

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
