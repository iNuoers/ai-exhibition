import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
    name: "Exhibition Dashboard",
    version: packageJson.version,
    copyright: `© ${currentYear}, AI Exhibition.`,
    meta: {
        title: "Exhibition Dashboard",
    },
};
