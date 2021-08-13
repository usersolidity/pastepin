import React from 'react'
import ReactMarkdown from 'react-markdown'

interface Props {
  children: string
}

export default function Markdown({ children }: Props) {
  return <ReactMarkdown className="content">{children}</ReactMarkdown>
}
