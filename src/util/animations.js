/**
 * Animation utility functions for enhanced functionality
 */

/**
 * Formats animation name for display
 * @param {Object} animation - The animation object
 * @returns {string} Formatted name
 */
export function formatAnimationName(animation) {
  let result = animation.name ?? animation.command.split(" ")[1];
  result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
  return result;
}

/**
 * Formats image name from command
 * @param {string} command - The animation command
 * @returns {string} Image name
 */
export function formatImageName(command) {
  return command.split(" ")[1];
}

/**
 * Gets animation statistics
 * @param {Array} animations - All animations
 * @param {Array} filteredAnimations - Filtered animations
 * @param {Set} favorites - Set of favorite commands
 * @returns {Object} Statistics object
 */
export function getAnimationStats(animations, filteredAnimations, favorites) {
  const total = animations.length;
  const filtered = filteredAnimations.length;
  const favoriteCount = favorites.size;
  const favoriteFiltered = filteredAnimations.filter(anim => 
    favorites.has(anim.command)
  ).length;

  return {
    total,
    filtered,
    favoriteCount,
    favoriteFiltered,
    isFiltered: filtered !== total,
    hasFavorites: favoriteCount > 0
  };
}

/**
 * Groups animations by category for better organization
 * @param {Array} animations - Array of animations
 * @returns {Object} Grouped animations
 */
export function groupAnimationsByCategory(animations) {
  const groups = {};
  
  animations.forEach(anim => {
    const primaryTag = anim.tags?.[0]?.toLowerCase() || 'other';
    if (!groups[primaryTag]) {
      groups[primaryTag] = [];
    }
    groups[primaryTag].push(anim);
  });
  
  return groups;
}

/**
 * Sorts animations by various criteria
 * @param {Array} animations - Array of animations
 * @param {string} sortBy - Sort criteria ('name', 'command', 'tags')
 * @param {string} sortOrder - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted animations
 */
export function sortAnimations(animations, sortBy = 'name', sortOrder = 'asc') {
  const sorted = [...animations];
  
  sorted.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = formatAnimationName(a).toLowerCase();
        bValue = formatAnimationName(b).toLowerCase();
        break;
      case 'command':
        aValue = a.command.toLowerCase();
        bValue = b.command.toLowerCase();
        break;
      case 'tags':
        aValue = a.tags?.join(' ').toLowerCase() || '';
        bValue = b.tags?.join(' ').toLowerCase() || '';
        break;
      default:
        aValue = formatAnimationName(a).toLowerCase();
        bValue = formatAnimationName(b).toLowerCase();
    }
    
    if (sortOrder === 'desc') {
      return bValue.localeCompare(aValue);
    }
    return aValue.localeCompare(bValue);
  });
  
  return sorted;
}

/**
 * Gets popular tags from animations
 * @param {Array} animations - Array of animations
 * @param {number} limit - Maximum number of tags to return
 * @returns {Array} Popular tags with counts
 */
export function getPopularTags(animations, limit = 10) {
  const tagCounts = {};
  
  animations.forEach(anim => {
    anim.tags?.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      tagCounts[lowerTag] = (tagCounts[lowerTag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Validates animation data structure
 * @param {Object} animation - Animation object to validate
 * @returns {boolean} Whether the animation is valid
 */
export function validateAnimation(animation) {
  return (
    animation &&
    typeof animation.command === 'string' &&
    animation.command.trim() !== '' &&
    Array.isArray(animation.tags)
  );
}

/**
 * Creates a search suggestion based on current input
 * @param {string} input - Current search input
 * @param {Array} allTags - All available tags
 * @returns {Array} Search suggestions
 */
export function getSearchSuggestions(input, allTags) {
  if (!input.trim()) return [];
  
  const suggestions = [];
  const lowerInput = input.toLowerCase();
  
  // Add tag suggestions
  allTags.forEach(tag => {
    if (tag.toLowerCase().includes(lowerInput)) {
      suggestions.push(`tag:${tag}`);
    }
  });
  
  // Add common search patterns
  const commonPatterns = [
    'tag:female',
    'tag:male', 
    'tag:dance',
    'tag:pose',
    'tag:adult',
    'tag:vehicle'
  ];
  
  commonPatterns.forEach(pattern => {
    if (pattern.includes(lowerInput)) {
      suggestions.push(pattern);
    }
  });
  
  return suggestions.slice(0, 5);
}
