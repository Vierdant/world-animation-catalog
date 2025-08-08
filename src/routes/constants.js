export const GITHUB_IMAGE_REPO =
    "https://raw.githubusercontent.com/Vierdant/world-animation-catalog/main/images/";
export const GITHUB_JSON_URL =
    "https://raw.githubusercontent.com/Vierdant/world-animation-catalog/main/animations.json";

export const fuseOptions = {
    keys: ["name", "command", "tags"],
    threshold: 0.4, // Increased threshold for better performance
    includeScore: false,
    ignoreLocation: true,
    minMatchCharLength: 2,
    // Performance optimizations
    useExtendedSearch: false,
    findAllMatches: false,
    location: 0,
    distance: 100,
    // Limit results for better performance
    limit: 500,
    // Cache results
    cache: true,
    // Use faster matching
    isCaseSensitive: false,
    shouldSort: true,
    // Optimize for large datasets
    tokenize: true,
    matchAllTokens: false,
    includeMatches: false,
    // Reduce memory usage
    id: null,
    // Faster search with these options
    getFn: (obj, key) => {
        const value = obj[key];
        return Array.isArray(value) ? value.join(' ') : value;
    }
};

/** @type {Record<string, string>} */
export const tagColors = {
    // Gender-based tags
    female: "#EB6E7D",
    male: "#3184A0",
    
    // Content type tags
    adult: "#BD1E1E",
    scene: "#242042",
    
    // Animation type tags
    loop: "#5C4622",
    pose: "#33665F",
    dance: "#8B5CF6",
    regular_dances: "#8B5CF6",
    rave_dances: "#EC4899",
    professional_dances: "#06B6D4",
    
    // Position tags
    sitting: "#059669",
    laying: "#7C3AED",
    standing: "#DC2626",
    ground: "#F59E0B",
    walking: "#10B981",
    leaning: "#6366F1",
    
    // Activity tags
    working: "#1F2937",
    food: "#F97316",
    smoking: "#6B7280",
    phone: "#3B82F6",
    vehicle: "#059669",
    fighting: "#DC2626",
    exercises: "#10B981",
    tactical: "#1F2937",
    
    // Expression tags
    expressions: "#F59E0B",
    gestures: "#8B5CF6",
    
    // Social tags
    social: "#3B82F6",
    surrender: "#EF4444",
    
    // Item tags
    items: "#6B7280",
    
    // Gang tags
    gangsigns: "#7C2D12",
    
    // Default fallback
    default: "#464646"
};

// Animation categories for better organization
export const animationCategories = {
    dances: {
        name: "Dances",
        tags: ["dance", "regular_dances", "rave_dances", "professional_dances"],
        color: "#8B5CF6"
    },
    poses: {
        name: "Poses",
        tags: ["pose", "sitting", "laying", "standing", "leaning"],
        color: "#33665F"
    },
    activities: {
        name: "Activities",
        tags: ["working", "food", "smoking", "phone", "vehicle", "exercises"],
        color: "#10B981"
    },
    combat: {
        name: "Combat",
        tags: ["fighting", "tactical", "surrender"],
        color: "#DC2626"
    },
    social: {
        name: "Social",
        tags: ["social", "gestures", "expressions"],
        color: "#3B82F6"
    },
    adult: {
        name: "Adult",
        tags: ["adult"],
        color: "#BD1E1E"
    }
};

// Search shortcuts for quick access
export const searchShortcuts = [
    { label: "All Dances", query: "tag:dance" },
    { label: "Female Animations", query: "tag:female" },
    { label: "Male Animations", query: "tag:male" },
    { label: "Poses", query: "tag:pose" },
    { label: "Sitting", query: "tag:sitting" },
    { label: "Laying", query: "tag:laying" },
    { label: "Vehicle", query: "tag:vehicle" },
    { label: "Phone", query: "tag:phone" },
    { label: "Food", query: "tag:food" },
    { label: "Smoking", query: "tag:smoking" }
];

// App configuration - Optimized for performance
export const appConfig = {
    maxSearchResults: 500, // Reduced from 1000 for better performance
    debounceDelay: 300, // Increased from 100ms
    imageRetryAttempts: 3,
    favoritesStorageKey: "world-animation-favorites",
    defaultSortBy: "name",
    defaultSortOrder: "asc",
    // Performance settings
    enableVirtualScrolling: true,
    batchSize: 50, // Number of items to render at once
    enableImageLazyLoading: true,
    enableSearchCaching: true,
    maxCacheSize: 100 // Maximum number of cached search results
};