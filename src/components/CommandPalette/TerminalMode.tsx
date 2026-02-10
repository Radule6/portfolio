import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  createTerminalCommands,
  findCommand,
  unknownCommand,
  filterTerminalCommands,
  type TerminalCommandDef,
} from "./terminalCommands";
import { LogoReveal } from "./AsciiAnimation";

const MONO_FONT =
  'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace';

const MAX_HISTORY = 100;

interface TerminalEntry {
  id: number;
  command: string | null; // null = system message (welcome)
  output: ReactNode;
}

interface TerminalModeProps {
  onExit: () => void;
}

const TerminalMode: React.FC<TerminalModeProps> = ({ onExit }) => {
  const { t } = useTranslation("terminal");
  const [ready, setReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const terminalCommands = useMemo(() => createTerminalCommands(t), [t]);

  const welcomeMessage = useMemo(
    () => (
      <div className="space-y-1 animate-fade-in">
        <p>
          <span className="gradient-text font-bold">RADULE.DEV</span>{" "}
          <span className="text-text-muted">{t("welcome.title")}</span>
        </p>
        <p className="text-text-muted">
          {t("welcome.hint")
            .split(/<cmd>|<\/cmd>/)
            .map((part, i) =>
              i === 1 ? (
                <span key={i} className="text-text-primary">{part}</span>
              ) : (
                part
              )
            )}
        </p>
      </div>
    ),
    [t]
  );

  const [history, setHistory] = useState<TerminalEntry[]>([
    { id: 0, command: null, output: welcomeMessage },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [suggestions, setSuggestions] = useState<TerminalCommandDef[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const nextId = useRef(1);

  // Update welcome message when language changes
  useEffect(() => {
    setHistory((prev) => {
      const updated = [...prev];
      if (updated[0] && updated[0].command === null) {
        updated[0] = { ...updated[0], output: welcomeMessage };
      }
      return updated;
    });
  }, [welcomeMessage]);

  /* ── Auto-focus input once preloader finishes ── */
  useEffect(() => {
    if (ready) requestAnimationFrame(() => inputRef.current?.focus());
  }, [ready]);

  /* ── Recompute autocomplete suggestions (capped to visible max) ── */
  const MAX_SUGGESTIONS = 6;
  useEffect(() => {
    const firstWord = inputValue.split(/\s+/)[0] ?? "";
    const matches = filterTerminalCommands(firstWord, terminalCommands).slice(0, MAX_SUGGESTIONS);
    setSuggestions(matches);
    setSuggestionIndex(-1);
  }, [inputValue, terminalCommands]);

  /* ── Scroll active suggestion into view ── */
  useEffect(() => {
    if (suggestionIndex < 0 || !suggestionsRef.current) return;
    const active = suggestionsRef.current.children[suggestionIndex] as HTMLElement | undefined;
    active?.scrollIntoView({ block: "nearest" });
  }, [suggestionIndex]);

  /* ── Auto-scroll to bottom on new entries ── */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  /* ── Execute terminal command ── */
  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const parts = trimmed.split(/\s+/);
      const name = parts[0].toLowerCase();
      const args = parts.slice(1);

      // Special: clear
      if (name === "clear" || name === "cls" || name === "reset") {
        nextId.current = 1;
        setHistory([
          { id: 0, command: null, output: welcomeMessage },
        ]);
        setInputValue("");
        setCommandHistory((prev) => [...prev, trimmed]);
        setHistoryIndex(-1);
        return;
      }

      // Special: exit
      if (name === "exit" || name === "quit" || name === "close" || name === "q") {
        onExit();
        return;
      }

      const cmd = findCommand(name, terminalCommands);
      const output = cmd ? cmd.handler(args) : unknownCommand(name, t);

      const entry: TerminalEntry = {
        id: nextId.current++,
        command: trimmed,
        output,
      };

      setHistory((prev) => {
        const next = [...prev, entry];
        return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
      });

      setInputValue("");
      setCommandHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(-1);
    },
    [onExit, terminalCommands, welcomeMessage, t]
  );

  /* ── Accept a suggestion into the input ── */
  const acceptSuggestion = useCallback(
    (cmd: TerminalCommandDef) => {
      setInputValue(cmd.name + " ");
      setSuggestions([]);
      setSuggestionIndex(-1);
      inputRef.current?.focus();
    },
    []
  );

  /* ── Keyboard handling ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const hasSuggestions = suggestions.length > 0;

      // ── Tab: accept highlighted suggestion ──
      if (e.key === "Tab" && hasSuggestions) {
        e.preventDefault();
        const idx = suggestionIndex >= 0 ? suggestionIndex : 0;
        acceptSuggestion(suggestions[idx]);
        return;
      }

      // ── Enter ──
      if (e.key === "Enter") {
        e.preventDefault();
        if (hasSuggestions && suggestionIndex >= 0) {
          acceptSuggestion(suggestions[suggestionIndex]);
        } else {
          runCommand(inputValue);
        }
        return;
      }

      // ── Escape: dismiss suggestions first, then exit ──
      if (e.key === "Escape") {
        e.preventDefault();
        if (hasSuggestions) {
          setSuggestions([]);
          setSuggestionIndex(-1);
        } else {
          onExit();
        }
        return;
      }

      // ── Arrow keys ──
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (hasSuggestions) {
          setSuggestionIndex((prev) =>
            prev <= 0 ? suggestions.length - 1 : prev - 1
          );
        } else {
          if (commandHistory.length === 0) return;
          const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
          setHistoryIndex(newIndex);
          setInputValue(commandHistory[commandHistory.length - 1 - newIndex]);
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (hasSuggestions) {
          setSuggestionIndex((prev) =>
            prev >= suggestions.length - 1 ? 0 : prev + 1
          );
        } else {
          if (historyIndex <= 0) {
            setHistoryIndex(-1);
            setInputValue("");
            return;
          }
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInputValue(commandHistory[commandHistory.length - 1 - newIndex]);
        }
        return;
      }
    },
    [inputValue, commandHistory, historyIndex, suggestions, suggestionIndex, runCommand, onExit, acceptSuggestion]
  );

  if (!ready) {
    return (
      <div
        className="relative z-20 flex items-center justify-center"
        style={{ height: "min(70vh, 560px)", fontFamily: MONO_FONT }}
      >
        <LogoReveal duration={4800} onComplete={() => setReady(true)} />
      </div>
    );
  }

  return (
    <div
      className="relative z-20 flex flex-col animate-fade-in"
      style={{ height: "min(70vh, 560px)", fontFamily: MONO_FONT }}
    >
      {/* ── Scrollable history ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        aria-live="polite"
        aria-label={t("output.aria")}
      >
        {history.map((entry) => (
          <div key={entry.id} className="animate-terminal-line-in">
            {entry.command !== null && (
              <div className="flex items-center gap-2 mb-1.5">
                <span className="gradient-text font-bold text-sm select-none">
                  {">"}
                </span>
                <span className="text-text-primary text-sm">{entry.command}</span>
              </div>
            )}
            <div className="text-sm text-text-secondary pl-4">
              {entry.output}
            </div>
          </div>
        ))}
      </div>

      {/* ── Input area (pinned to bottom) with autocomplete ── */}
      <div className="relative">
        {/* ── Autocomplete dropdown (above input) ── */}
        {suggestions.length > 0 && (
          <ul
            ref={suggestionsRef}
            role="listbox"
            aria-label={t("output.suggestionsAria")}
            className="absolute bottom-full left-0 right-0 max-h-48 overflow-y-auto border-t border-border bg-surface"
          >
            {suggestions.map((cmd, i) => (
              <li
                key={cmd.name}
                role="option"
                aria-selected={i === suggestionIndex}
                onMouseDown={(e) => {
                  e.preventDefault(); // keep input focused
                  acceptSuggestion(cmd);
                }}
                onMouseEnter={() => setSuggestionIndex(i)}
                className={`flex items-center justify-between px-5 py-2 cursor-pointer text-sm transition-colors ${
                  i === suggestionIndex
                    ? "bg-surface-hover text-text-primary"
                    : "text-text-secondary"
                }`}
              >
                <span className="font-medium">{cmd.name}</span>
                <span className="text-text-muted text-xs truncate ml-4">
                  {cmd.description}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-border px-5 py-3 flex items-center gap-2">
        <span
          className="gradient-text font-bold text-lg select-none shrink-0"
          aria-hidden="true"
        >
          {">"}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setHistoryIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-text-primary text-sm outline-none caret-accent-lime"
          placeholder={t("input.placeholder")}
          autoComplete="off"
          spellCheck={false}
          aria-label={t("input.aria")}
        />
        </div>
      </div>
    </div>
  );
};

export default TerminalMode;
