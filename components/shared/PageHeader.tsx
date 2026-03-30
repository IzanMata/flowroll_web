interface PageHeaderProps {
  /** Small label shown above the title in uppercase, e.g. "Academia" */
  eyebrow: string;
  title: string;
  /** Optional subtitle — pass a React node for dynamic content */
  subtitle?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
