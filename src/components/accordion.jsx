import { ChevronUp, ChevronDown } from "lucide-react";

const AccordionItem = ({ title, content, isOpen, onClick, index}) => {
  const contentId = `accordion-panel-${index}`;
  return (
    <div
      className="rounded-3xl transition-all duration-300 overflow-hidden"
      style={{
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
      }}
    >
      <button
        className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left transition bg-slate-400"
        style={{ borderRadius: isOpen ? "1.5rem 1.5rem 0 0" : "1.5rem" }}
        onClick={onClick}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <strong className="text-sm text-primary">{title}</strong>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} />
        )}
      </button>
      {isOpen && (
        <div id={contentId} className="px-6 pb-6 pt-4 text-sm text-primary leading-relaxed bg-slate-300">
          {content}
        </div>
      )}
    </div>
  );
};

const Accordion = ({ items, handleItemClick, openIndex, itemClassName = "" }) => {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          index={index}
          title={item.title}
          content={item.content}
          isOpen={openIndex === index}
          onClick={() => handleItemClick(index)}
        />
      ))}
    </div>
  );
};

export default Accordion;
