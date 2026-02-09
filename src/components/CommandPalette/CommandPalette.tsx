import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { FiCommand, FiCornerDownLeft } from "react-icons/fi";
import {
  filterCommands,
  CATEGORY_LABELS,
  type Command,
  type CommandCategory,
} from "./commands";
import TerminalMode from "./TerminalMode";

/* ── Helpers ── */

/** Group commands by category, preserving order */
function groupByCategory(cmds: Command[]) {
  const groups: { category: CommandCategory; items: Command[] }[] = [];
  const seen = new Set<CommandCategory>();

  for (const cmd of cmds) {
    if (!seen.has(cmd.category)) {
      seen.add(cmd.category);
      groups.push({ category: cmd.category, items: [] });
    }
    groups.find((g) => g.category === cmd.category)!.items.push(cmd);
  }
  return groups;
}

const IS_MAC =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

type PaletteView = "commands" | "terminal";

/* ── Component ── */

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<PaletteView>("commands");
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  /** Maps command id → feedback text while it's visible */
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const feedbackTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const filtered = useMemo(() => filterCommands(query), [query]);
  const groups = useMemo(() => groupByCategory(filtered), [filtered]);

  /* Build flat index for keyboard nav */
  const flatList = useMemo(() => filtered, [filtered]);

  const isTerminal = view === "terminal";

  /* ── Open / Close ── */

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setView("commands");
  }, []);

  /* ── Global shortcut: Cmd+K / Ctrl+K ── */

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) close();
        else open();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, open, close]);

  /* ── Body scroll lock ── */

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  /* ── Auto-focus input (commands mode only) ── */

  useEffect(() => {
    if (isOpen && view === "commands") {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen, view]);

  /* ── Reset selection when query changes ── */

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  /* ── Show inline feedback for a command ── */

  const showFeedback = useCallback((cmdId: string, text: string) => {
    if (feedbackTimers.current[cmdId]) clearTimeout(feedbackTimers.current[cmdId]);
    setFeedbackMap((prev) => ({ ...prev, [cmdId]: text }));
    feedbackTimers.current[cmdId] = setTimeout(() => {
      setFeedbackMap((prev) => {
        const next = { ...prev };
        delete next[cmdId];
        return next;
      });
      delete feedbackTimers.current[cmdId];
    }, 2000);
  }, []);

  /* ── Execute command ── */

  const execute = useCallback(
    async (cmd: Command) => {
      // Special: open terminal mode
      if (cmd.id === "terminal") {
        setView("terminal");
        return;
      }

      await cmd.action();

      if (cmd.stayOpen && cmd.feedback) {
        showFeedback(cmd.id, cmd.feedback);
        // Re-focus input so user can keep typing
        requestAnimationFrame(() => inputRef.current?.focus());
      } else {
        close();
      }
    },
    [close, showFeedback]
  );

  /* ── Keyboard navigation inside palette ── */

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (flatList[selectedIndex]) execute(flatList[selectedIndex]);
          break;
        case "Escape":
          e.preventDefault();
          close();
          break;
      }
    },
    [flatList, selectedIndex, execute, close]
  );

  /* ── Scroll selected item into view ── */

  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  /* ── Cleanup feedback timers ── */

  useEffect(() => {
    const timers = feedbackTimers.current;
    return () => {
      for (const id of Object.keys(timers)) clearTimeout(timers[id]);
    };
  }, []);

  /* ── Clear feedback when palette closes ── */

  useEffect(() => {
    if (!isOpen) setFeedbackMap({});
  }, [isOpen]);

  /* ── Track flat index offset per group for rendering ── */

  let flatIndex = 0;

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* ── Backdrop ── */}
      <div
        className="cmd-palette-backdrop fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Dialog ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isTerminal ? "Terminal" : "Command palette"}
        className={`cmd-palette-dialog fixed inset-0 z-[101] flex items-start justify-center px-4 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isTerminal
            ? "pt-[min(10vh,80px)]"
            : "pt-[min(20vh,160px)]"
        }`}
        onClick={close}
      >
        <div
          className={`cmd-palette-panel relative w-full bg-surface-raised border border-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden transition-[max-width] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isTerminal
              ? "max-w-[640px]"
              : "max-w-[540px]"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scan-line texture overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-[0.025]"
            aria-hidden="true"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)",
            }}
          />

          {/* Top gradient accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px gradient-bg"
            aria-hidden="true"
          />

          {/* ── Conditional content ── */}
          {isTerminal ? (
            <TerminalMode onExit={close} />
          ) : (
            <>
              {/* ── Input area ── */}
              <div className="relative z-20 flex items-center gap-3 px-5 py-4 border-b border-border">
                {/* Gradient prompt character */}
                <span
                  className="gradient-text font-bold text-lg select-none shrink-0"
                  style={{
                    fontFamily:
                      'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
                  }}
                  aria-hidden="true"
                >
                  {">"}
                </span>

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted text-sm outline-none caret-accent-lime"
                  style={{
                    fontFamily:
                      'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
                  }}
                  placeholder="Type a command..."
                  role="combobox"
                  aria-expanded={filtered.length > 0}
                  aria-controls="cmd-palette-list"
                  aria-activedescendant={
                    flatList[selectedIndex]
                      ? `cmd-${flatList[selectedIndex].id}`
                      : undefined
                  }
                  aria-autocomplete="list"
                  autoComplete="off"
                  spellCheck={false}
                />

                {/* Shortcut badge */}
                <kbd className="hidden sm:flex items-center gap-1 text-[11px] text-text-muted font-body tracking-wide px-2 py-1 rounded-md bg-surface border border-border select-none shrink-0">
                  esc
                </kbd>
              </div>

              {/* ── Command list ── */}
              <ul
                id="cmd-palette-list"
                ref={listRef}
                role="listbox"
                className="relative z-20 max-h-[min(50vh,360px)] overflow-y-auto py-2 scroll-smooth"
                style={{ scrollbarGutter: "stable" }}
              >
                {filtered.length === 0 ? (
                  <li className="px-5 py-8 text-center">
                    <p
                      className="text-text-muted text-sm"
                      style={{
                        fontFamily:
                          'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
                      }}
                    >
                      No commands found
                    </p>
                  </li>
                ) : (
                  groups.map((group) => {
                    const groupItems = group.items.map((cmd) => {
                      const itemIndex = flatIndex++;
                      const isActive = itemIndex === selectedIndex;

                      const feedback = feedbackMap[cmd.id];

                      return (
                        <li
                          key={cmd.id}
                          id={`cmd-${cmd.id}`}
                          role="option"
                          aria-selected={isActive}
                          data-active={isActive}
                          className={`group mx-2 px-3 py-2.5 rounded-lg flex items-center gap-3 cursor-pointer transition-colors duration-150 ${
                            isActive
                              ? "bg-surface-hover"
                              : "hover:bg-surface-hover/50"
                          }`}
                          onClick={() => execute(cmd)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                        >
                          {/* Command name */}
                          <span
                            className={`text-sm font-medium transition-colors duration-150 shrink-0 ${
                              isActive
                                ? "text-text-primary"
                                : "text-text-secondary"
                            }`}
                            style={{
                              fontFamily:
                                'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
                            }}
                          >
                            {cmd.name}
                          </span>

                          {/* Inline feedback badge OR description */}
                          {feedback ? (
                            <span
                              className="inline-flex items-center gap-1.5 text-[11px] font-body font-500 text-accent-lime animate-fade-in"
                              role="status"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              {feedback}
                            </span>
                          ) : (
                            <span className="text-xs text-text-muted truncate font-body">
                              {cmd.description}
                            </span>
                          )}

                          {/* Enter indicator on active */}
                          <FiCornerDownLeft
                            className={`ml-auto w-3.5 h-3.5 shrink-0 transition-opacity duration-150 ${
                              isActive
                                ? "opacity-40"
                                : "opacity-0"
                            }`}
                            aria-hidden="true"
                          />
                        </li>
                      );
                    });

                    return (
                      <li key={group.category} role="presentation">
                        {/* Category header */}
                        <div className="px-5 pt-3 pb-1.5 first:pt-1">
                          <span className="text-[10px] font-body font-500 tracking-[0.2em] uppercase text-text-muted">
                            {CATEGORY_LABELS[group.category]}
                          </span>
                        </div>
                        <ul role="group" aria-label={CATEGORY_LABELS[group.category]}>
                          {groupItems}
                        </ul>
                      </li>
                    );
                  })
                )}
              </ul>

              {/* ── Footer hints ── */}
              <div className="relative z-20 flex items-center gap-4 px-5 py-3 border-t border-border text-[11px] text-text-muted font-body">
                <span className="flex items-center gap-1.5">
                  <kbd className="inline-flex items-center justify-center w-5 h-5 rounded bg-surface border border-border text-[10px]">
                    {"↑"}
                  </kbd>
                  <kbd className="inline-flex items-center justify-center w-5 h-5 rounded bg-surface border border-border text-[10px]">
                    {"↓"}
                  </kbd>
                  <span className="ml-0.5">navigate</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-surface border border-border text-[10px]">
                    {"↵"}
                  </kbd>
                  <span className="ml-0.5">select</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-surface border border-border text-[10px]">
                    esc
                  </kbd>
                  <span className="ml-0.5">close</span>
                </span>
              </div>
            </>
          )}
        </div>
      </div>

    </>,
    document.body
  );
};

/* ── Nav trigger button (exported for Navigation to use) ── */

export function CommandPaletteTrigger({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="hidden md:flex items-center gap-2 font-body text-text-muted hover:text-text-secondary border border-border hover:border-border-hover rounded-full px-4 py-2 transition-all duration-300 cursor-pointer"
      aria-label="Open command palette"
    >
      <FiCommand className="w-3.5 h-3.5" />
      <span
        className="text-xs tracking-wide"
        style={{
          fontFamily:
            'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
        }}
      >
        {IS_MAC ? "⌘K" : "Ctrl+K"}
      </span>
    </button>
  );
}

export default CommandPalette;
