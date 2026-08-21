interface PlaceholderPageProps {
  title: string;
  section?: string;
  description?: string;
}

export function PlaceholderPage({
  title,
  section,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-3xl p-8">
      {section && (
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-500">
          {section}
        </p>
      )}
      <h1 className="mb-4 text-3xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-600">
        {description ??
          "This page is a placeholder. Full UI will be implemented in a later sprint."}
      </p>
    </div>
  );
}
