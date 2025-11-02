export type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
      </div>
    </header>
  );
}

export default PageHeader;
