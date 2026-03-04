"use client";

import React from "react";

type PageHeaderProps = {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  titleClassName?: string;
};

export default function PageHeader({
  title,
  left,
  right,
  className = "",
  titleClassName = "",
}: PageHeaderProps) {
  return (
    <header
      className={`flex items-center justify-between bg-white p-4 ${className}`}
    >
      <div className="flex items-center justify-start">{left}</div>
      <h1 className={`flex-1 text-center font-bold ${titleClassName}`}>
        {title}
      </h1>
      <div className="flex items-center justify-end">{right}</div>
    </header>
  );
}
