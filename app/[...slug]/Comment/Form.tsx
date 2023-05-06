import { useAuth0 } from '@auth0/auth0-react'

type CommentFormProps = {
  text: string
  setText: Function
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export default function CommentForm({
  text,
  setText,
  onSubmit,
}: CommentFormProps) {
  const { isAuthenticated, user, logout, loginWithPopup } = useAuth0()

  return (
    <form onSubmit={onSubmit}>
      <textarea
        className='flex w-full max-h-40 p-3 rounded resize-y bg-gray-100 text-gray-900 placeholder-gray-500'
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

      <div className='flex items-center mt-4'>
        {isAuthenticated ? (
          <div className='flex items-center space-x-6 justify-between w-full'>
            <button className='py-2 px-4 rounded bg-gray-100 text-gray disabled:opacity-40 hover:bg-gray-200'>
              Send
            </button>

            <div>
              <span className='text-sm'>{user?.name}</span>
              <button
                className='py-2 px-4 text-gray-500 text-sm'
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
            type='button'
            className='py-2 px-4 rounded bg-gray-100 text-gray disabled:opacity-40 hover:bg-gray-200'
            onClick={() => loginWithPopup()}
          >
            Log In
          </button>
        )}
      </div>
    </form>
  )
}
