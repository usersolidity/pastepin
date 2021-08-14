import React from 'react'
import ReactMarkdown from 'react-markdown'

interface Props {
  children: string
}

export default function Markdown({ children }: Props) {
  return (
    <article className="center py-32">
      <ReactMarkdown className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl">
        {children}
      </ReactMarkdown>
    </article>
  )
}
