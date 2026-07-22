import type { ReactNode } from "react";
import { Container } from "./container";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

interface PageHeaderProps {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
}

/** Standard top band for interior pages: breadcrumbs + title + optional actions. */
export function PageHeader({ title, description, crumbs, children }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-neutral-50">
      <Container className="py-8 sm:py-10">
        {crumbs && crumbs.length > 0 && <Breadcrumbs items={crumbs} className="mb-4" />}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
            )}
          </div>
          {children}
        </div>
      </Container>
    </div>
  );
}
