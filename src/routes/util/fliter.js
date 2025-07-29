import Fuse from "fuse.js";
import { fuseOptions } from "../constants";

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
 * Filters a list of animations based on search terms and options.
 * Prioritizes favorites if search is active.
 * 
 * @param {any[]} animations - The full list of animations
 * @param {string} search - The debounced search string
 * @param {boolean} showAdult - Whether to include adult-tagged items
 * @param {Fuse<any> | null} fuse - A Fuse.js instance
 * @param {Set<string>} favorites - Set of favorite animation names
 * @param {boolean} showOnlyFavorites - Whether to show only a list of favorites
 * @returns {any[]} - The filtered and prioritized list
 */
export function getFilteredAnimations(animations, search, showAdult, fuse, favorites, showOnlyFavorites) {
  const trimmedSearch = search.trim().toLowerCase();
  const terms = parseSearchTerms(trimmedSearch);
  const regularTerms = terms.filter(t => !t.includes(":") && !t.startsWith("-"));
  const advancedTerms = terms.filter(t => t.includes(":") || t.startsWith("-"));

  let results = animations;

  if (regularTerms.length > 0 && fuse) {
    const fuseResults = fuse.search(regularTerms.join(" "));

    // Sort by: favorites first, then lowest Fuse score
    fuseResults.sort((a, b) => {
      const aFav = favorites.has(a.item.command);
      const bFav = favorites.has(b.item.command);

      if (aFav !== bFav) return bFav ? 1 : -1; // favorited items come first
      return (a.score ?? 0) - (b.score ?? 0); // lower score = better match
    });

    results = fuseResults.map(r => r.item);
  }

  if (!showAdult) {
    results = results.filter(cmd =>
      !cmd.tags?.map((/** @type {string} */ t) => t.toLowerCase()).includes("adult")
    );
  }

  // Apply advanced tag:name:command filtering
  results = results.filter((cmd) => {
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

  if (showOnlyFavorites) {
    results = results.filter(cmd => favorites.has(cmd.command))
  }

  return results;
}
