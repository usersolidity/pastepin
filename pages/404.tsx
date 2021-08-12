import React from 'react'
import List from '../components/List'
import Nav from '../components/Nav'

export default function Home() {
  return (
    <>
      <Nav />
      <section>
        <h1>404</h1>
      </section>
      <style jsx>{`
        section {
          min-height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        h1 {
          font-size: 5rem;
        }
      `}</style>
      <List />
    </>
  )
}
