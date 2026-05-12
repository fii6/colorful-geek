/**
 * Based on the discussion at https://github.com/expressive-code/expressive-code/issues/153#issuecomment-2282218684
 * Ported from Fuwari.
 */
import { definePlugin } from "@expressive-code/core";

export function pluginLanguageBadge() {
  return definePlugin({
    name: "Language Badge",
    // @ts-expect-error -- baseStyles signature varies across EC versions
    baseStyles: () => `
      [data-language]::before {
        position: absolute;
        z-index: 2;
        right: 0.5rem;
        top: 0.5rem;
        padding: 0.1rem 0.5rem;
        content: attr(data-language);
        font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);
        font-size: 0.75rem;
        font-weight: bold;
        text-transform: uppercase;
        color: var(--code-gutter-fg, #bdc4cc);
        background: var(--codeblock-topbar-bg, #151b23);
        border: 1px solid var(--code-border, #3d444d);
        border-radius: 0.5rem;
        pointer-events: none;
        transition: opacity 0.3s;
        opacity: 0;
      }
      .frame:not(.has-title):not(.is-terminal) {
        @media (hover: none) {
          & [data-language]::before {
            opacity: 1;
            margin-right: 3rem;
          }
          & [data-language]:active::before {
            opacity: 0;
          }
        }
        @media (hover: hover) {
          & [data-language]::before {
            opacity: 1;
          }
          &:hover [data-language]::before {
            opacity: 0;
          }
        }
      }
    `,
  });
}
