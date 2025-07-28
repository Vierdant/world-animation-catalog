export const GITHUB_IMAGE_REPO =
    "https://raw.githubusercontent.com/Vierdant/world-animation-catalog/main/images/";
export const GITHUB_JSON_URL =
    "https://raw.githubusercontent.com/Vierdant/world-animation-catalog/main/animations.json";

export const fuseOptions = {
    keys: ["name", "command", "tags"],
    threshold: 0.3,
    includeScore: false,
    ignoreLocation: true,
    minMatchCharLength: 2,
};

/** @type {Record<string, string>} */
export const tagColors = {
    female: "#EB6E7D",
    male: "#3184A0",
    scene: "#242042",
    loop: "#5C4622",
    pose: "#33665F",
    sitting: "#212121",
    laying: "#212121",
    standing: "#212121",
    food: "#212121",
    working: "#212121",
    expressions: "#212121",
    gangsigns: "#212121",
    phone: "#212121",
    ground: "#212121",
    walking: "#212121",
    smoking: "#212121",
    leaning: "#212121",
    surrender: "#212121",
    social: "#212121",
    regular_dances: "#212121",
    rave_dances: "#212121",
    professional_dances: "#212121",
    adult: "#BD1E1E",
    items: "#212121",
    gestures: "#212121",
    fighting: "#212121",
    exercises: "#212121",
    poses: "#212121",
    tactical: "#212121",
    vehicle: "#212121",
};