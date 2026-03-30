import { dateFormat } from "@duyet/libs/date";

interface IsNewPostProps {
  date: Date | undefined;
}

export function IsNewPost({ date }: IsNewPostProps) {
  const today = new Date();

  if (!date || dateFormat(date, "yyyy-MM") !== dateFormat(today, "yyyy-MM")) {
    return null;
  }

  return (
    <span className="ml-2 rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
      New
    </span>
  );
}

interface IsFeaturedProps {
  featured: boolean;
}

export function IsFeatured({ featured }: IsFeaturedProps) {
  if (!featured) {
    return null;
  }

  return (
    <span className="ml-2 rounded-full bg-purple-100 dark:bg-purple-900 px-2 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-200">
      Featured
    </span>
  );
}
