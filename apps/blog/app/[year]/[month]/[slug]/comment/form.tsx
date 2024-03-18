import { useAuth0 } from '@auth0/auth0-react';
import { cn } from '@duyet/libs/utils';

interface CommentFormProps {
  text: string;
  setText: (s: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

const btnClasses = cn(
  'rounded px-4 py-2 hover:bg-gray-200 disabled:opacity-40',
  'bg-gray-100 dark:bg-slate-800 dark:text-slate-50',
  'text-gray text-sm',
);

const textareaClasses = cn(
  'flex max-h-40 w-full resize-y rounded p-3 text-gray-900',
  'border-t border-gray-200 dark:border-gray-700 dark:bg-transparent',
);

export default function CommentForm({
  text,
  setText,
  onSubmit,
}: CommentFormProps) {
  const { isAuthenticated, user, logout, loginWithPopup } = useAuth0();

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises -- TODO: fix this
    <form onSubmit={onSubmit}>
      <textarea
        className={textareaClasses}
        onChange={(e) => {
          setText(e.target.value);
        }}
        onClick={!isAuthenticated ? () => loginWithPopup() : undefined}
        placeholder={
          isAuthenticated
            ? `What are your thoughts?`
            : 'Please login to leave a comment'
        }
        rows={2}
        value={text}
      />

      <div className="mt-2 flex items-center">
        {isAuthenticated ? (
          <div className="flex w-full items-center justify-between space-x-6">
            <button className={btnClasses} type="button">
              Send
            </button>

            <div>
              <span className="text-sm">{user?.name}</span>
              <button
                className={cn(
                  btnClasses,
                  'bg-transparent dark:bg-transparent dark:text-slate-50',
                )}
                onClick={() => {
                  logout({
                    logoutParams: { returnTo: window.location.origin },
                  });
                }}
                type="button"
              >
                Log Out
              </button>
            </div>
          </div>
        ) : (
          <button
            className={btnClasses}
            onClick={() => loginWithPopup()} // eslint-disable-line @typescript-eslint/no-misused-promises -- TODO: fix this
            type="button"
          >
            Log In
          </button>
        )}
      </div>
    </form>
  );
}
