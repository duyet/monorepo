'use client'

import { useAuth0 } from '@auth0/auth0-react'

import { cn } from '@duyet/libs/utils'

type CommentFormProps = {
  text: string
  setText: Function
  onSubmit: (e: React.FormEvent) => Promise<void>
}

const btnClasses = cn(
  'py-2 px-4 rounded disabled:opacity-40 hover:bg-gray-200',
  'bg-gray-100 dark:bg-slate-800 dark:text-slate-50',
  'text-gray text-sm',
)

const textareaClasses = cn(
  'flex w-full max-h-40 p-3 rounded resize-y text-gray-900',
  'border-t border-gray-200 dark:border-gray-700 dark:bg-transparent',
)

export default function CommentForm({
  text,
  setText,
  onSubmit,
}: CommentFormProps) {
  const { isAuthenticated, user, logout, loginWithPopup } = useAuth0()

  return (
    <form onSubmit={onSubmit}>
      <textarea
        className={textareaClasses}
        rows={2}
        placeholder={
          isAuthenticated
            ? `What are your thoughts?`
            : 'Please login to leave a comment'
        }
        onChange={(e) => setText(e.target.value)}
        onClick={!isAuthenticated ? () => loginWithPopup() : undefined}
        value={text}
      />

      <div className="flex items-center mt-2">
        {isAuthenticated ? (
          <div className="flex items-center space-x-6 justify-between w-full">
            <button className={btnClasses}>Send</button>

            <div>
              <span className="text-sm">{user?.name}</span>
              <button
                className={cn(
                  btnClasses,
                  'bg-transparent dark:bg-transparent dark:text-slate-50',
                )}
                onClick={() =>
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }
              >
                Log Out
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className={btnClasses}
            onClick={() => loginWithPopup()}
          >
            Log In
          </button>
        )}
      </div>
    </form>
  )
}
