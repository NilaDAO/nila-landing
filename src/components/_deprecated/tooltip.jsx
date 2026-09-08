import React from "react";
import Tippy from "@tippyjs/react";

const Tooltip = ({ children, content, customClass = "top" }) => {
  return (
    <Tippy
      content={<span className="block text-xs font-medium text-slate-100">{content}</span>}
      className="rounded-2xl bg-slate-950/90 px-4 py-2 text-xs text-slate-100 shadow-xl shadow-slate-950/50 ring-1 ring-white/10 backdrop-blur"
      placement={customClass}
      arrow={false}
      animation="shift-away-subtle"
      offset={[0, 12]}
    >
      {children}
    </Tippy>
  );
};

export default Tooltip;
