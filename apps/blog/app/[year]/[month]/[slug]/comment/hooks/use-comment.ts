'use client'

import { useAuth0 } from '@auth0/auth0-react'
import type { Comment } from '@duyet/interfaces'
import { fetcher } from '@duyet/libs/fetcher'
import type React from 'react'
import { useState } from 'react'
import useSWR from 'swr'

export default function useComments() {
  const { getAccessTokenSilently } = useAuth0()
  const [text, setText] = useState('')

  const { data: comments, mutate } = useSWR<Comment[]>(
    '/api/comment',
    fetcher,
    { fallbackData: [] },
  )

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = await getAccessTokenSilently()

    try {
      await fetch('/api/comment', {
        method: 'POST',
        body: JSON.stringify({ text }),
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      })
      setText('')
      await mutate()
    } catch (err) {
      console.error(err)
    }
  }

  const onDelete = async (comment: Comment) => {
    const token = await getAccessTokenSilently()

    try {
      await fetch('/api/comment', {
        method: 'DELETE',
        body: JSON.stringify({ comment }),
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      })
      await mutate()
    } catch (err) {
      console.error(err)
    }
  }

  return { text, setText, comments, onSubmit, onDelete }
}
