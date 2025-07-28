import Fuse from "fuse.js";
import { fuseOptions } from "../constants";
import { LazyStore } from "@tauri-apps/plugin-store";

/**
 * Parses quoted and unquoted search terms
 * e.g. input: `tag:vehicle "driver phone"` → ['tag:vehicle', 'driver phone']
 * @param {string} input
 * @returns {string[]}
 */
export function parseSearchTerms(input) {
  const regex = /"([^"]+)"|(\S+)/g;
  const terms = [];
  let match;
  while ((match = regex.exec(input))) {
    terms.push(match[1] ?? match[2]);
  }
  return terms;
}

/**
 * Creates a new Fuse.js instance
 * @param {any[]} items
 * @returns {Fuse<any>}
 */
export function createFuse(items) {
  return new Fuse(items, fuseOptions);
}

/**
 * Filters a list of animations based on search terms and options
 * @param {any[]} animations - The full list of animations
 * @param {string} search - The debounced search string
 * @param {boolean} showAdult - Whether to include adult-tagged items
 * @param {Fuse<any> | null} fuse - A Fuse.js instance
 * @returns {any[]} - The filtered list of animations
 */
export function getFilteredAnimations(animations, search, showAdult, fuse) {
  if (!search.trim()) return animations;

  const terms = parseSearchTerms(search.toLowerCase());

  const regularTerms = terms.filter(
    (t) => !t.includes(":") && !t.startsWith("-")
  );
  const advancedTerms = terms.filter(
    (t) => t.includes(":") || t.startsWith("-")
  );

  let results = animations;

  if (regularTerms.length > 0 && fuse) {
    results = fuse.search(regularTerms.join(" ")).map((r) => r.item);
  }

  if (!showAdult) {
    results = results.filter(
      (cmd) => !cmd.tags?.map((/** @type {string} */ t) => t.toLowerCase()).includes("adult")
    );
  }

  return results.filter((cmd) => {
    const name = (cmd.name ?? "").toLowerCase();
    const command = (cmd.command ?? "").toLowerCase();
    const tags = (cmd.tags ?? []).map((/** @type {string} */ t) => t.toLowerCase());

    return advancedTerms.every((term) => {
      const isNegated = term.startsWith("-");
      const [prefix, rawValue] = term.replace("-", "").split(":", 2);
      const value = rawValue?.trim();

      let match = false;

      switch (prefix) {
        case "tag":
          match = tags.some((/** @type {string | string[]} */ t) => t.includes(value));
          break;
        case "name":
          match = name.includes(value);
          break;
        case "command":
          match = command.includes(value);
          break;
        default:
          match =
            name.includes(term) ||
            command.includes(term) ||
            tags.some((/** @type {string | string[]} */ t) => t.includes(term));
      }

      return isNegated ? !match : match;
    });
  });
}
