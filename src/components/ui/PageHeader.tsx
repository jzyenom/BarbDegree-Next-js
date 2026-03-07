"use client";

import React from "react";

type PageHeaderProps = {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  titleClassName?: string;
};

/**
 * AUTO-FUNCTION-COMMENT: PageHeader
 * Purpose: Handles page header.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<header`.
 * 3. Executes `className={\`flex items-center justify-between bg-white p-4 ${className}\`}`.
 * 4. Executes `>`.
 * 5. Executes `<div className="flex items-center justify-start">{left}</div>`.
 * 6. Executes `<h1 className={\`flex-1 text-center font-bold ${titleClassName}\`}>`.
 * 7. Executes `{title}`.
 * 8. Executes `</h1>`.
 * 9. Executes `<div className="flex items-center justify-end">{right}</div>`.
 * 10. Executes `</header>`.
 * 11. Executes `);`.
 */
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
