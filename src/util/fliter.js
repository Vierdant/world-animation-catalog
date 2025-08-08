import Fuse from "fuse.js";
import { fuseOptions } from "../routes/constants";

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

// Cache for parsed search terms
const searchTermsCache = new Map();

/**
 * Filters a list of animations based on search terms and options.
 * Optimized with caching and reduced computational overhead.
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
  
  // Early return if no search and no filters
  if (!trimmedSearch && showAdult && !showOnlyFavorites) {
    return animations;
  }

  // Cache parsed search terms
  let terms;
  if (searchTermsCache.has(trimmedSearch)) {
    terms = searchTermsCache.get(trimmedSearch);
  } else {
    terms = parseSearchTerms(trimmedSearch);
    searchTermsCache.set(trimmedSearch, terms);
  }

  const regularTerms = terms.filter(t => !t.includes(":") && !t.startsWith("-"));
  const advancedTerms = terms.filter(t => t.includes(":") || t.startsWith("-"));

  let results = animations;

  // Apply Fuse.js search only if there are regular terms
  if (regularTerms.length > 0 && fuse) {
    const searchQuery = regularTerms.join(" ");
    const fuseResults = fuse.search(searchQuery);

    // Optimize sorting by pre-computing favorite status
    const favoriteSet = new Set(favorites);
    fuseResults.sort((a, b) => {
      const aFav = favoriteSet.has(a.item.command);
      const bFav = favoriteSet.has(b.item.command);

      if (aFav !== bFav) return bFav ? 1 : -1; // favorited items come first
      return (a.score ?? 0) - (b.score ?? 0); // lower score = better match
    });

    results = fuseResults.map(r => r.item);
  }

  // Apply adult filter
  if (!showAdult) {
    results = results.filter(cmd => {
      const tags = cmd.tags;
      if (!tags || !Array.isArray(tags)) return true;
      return !tags.some(tag => tag.toLowerCase() === "adult");
    });
  }

  // Apply advanced filtering only if there are advanced terms
  if (advancedTerms.length > 0) {
    results = results.filter((cmd) => {
      const name = (cmd.name ?? "").toLowerCase();
      const command = (cmd.command ?? "").toLowerCase();
      const tags = (cmd.tags ?? []).map(t => t.toLowerCase());

      return advancedTerms.every((term) => {
        const isNegated = term.startsWith("-");
        const [prefix, rawValue] = term.replace("-", "").split(":", 2);
        const value = rawValue?.trim();

        let match = false;

        switch (prefix) {
          case "tag":
            match = tags.some(t => t.includes(value));
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
              tags.some(t => t.includes(term));
        }

        return isNegated ? !match : match;
      });
    });
  }

  // Apply favorites filter
  if (showOnlyFavorites) {
    const favoriteSet = new Set(favorites);
    results = results.filter(cmd => favoriteSet.has(cmd.command));
  }

  return results;
}
