"use client";

import Image from "next/image";

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
        <Image
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          width={170}
          height={144}
          unoptimized
        />
      </div>
      <div className="pt-3">
        {/* show text */}
        <p className="text-base font-semibold text-[#181411]">{title}</p>
        {/* show text */}
        <p className="text-sm text-[#8a7560]">{subtitle}</p>
      </div>
    </div>
  );
}
