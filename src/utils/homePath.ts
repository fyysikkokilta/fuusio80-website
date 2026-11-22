// The page with this path is shown at the site root (/fi, /en). It is a normal page in the
// Pages collection, so it looks and is edited like every other page.
export const HOME_PATH = 'home'

/** Site path of a page, without the locale. The home page is the site root, never `/home`. */
export const pageHref = (path: string) => (path === HOME_PATH ? '/' : `/${path}`)
