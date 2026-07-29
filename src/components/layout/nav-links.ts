export interface NavLink {
  label: string;
  href: string;
}

export const PRIMARY_NAV: NavLink[] = [
  { label: "Shop Parts", href: "/parts" },
  { label: "Categories", href: "/categories" },
  { label: "Sell With Us", href: "/sell" },
];
