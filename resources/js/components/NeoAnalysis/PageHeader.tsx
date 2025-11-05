export interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl text-center sm:text-start font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-prose">
          Track and analyse Near-Earth Objects (NEOs) using NASA's API. View daily summaries of asteroid close approaches, explore analytical insights including average diameters, velocities, and miss distances. Use the filters to query historical data by date range.
        </p>
      </div>
    </header>
  );
}

export default PageHeader;
