import { createContext, useContext, useState } from 'react'

const ModalContext = createContext(null)

export const ModalProvider = ({ children }) => {
  const [selectedMovieId, setSelectedMovieId] = useState(null)
  const openModal = (id) => setSelectedMovieId(id)
  const closeModal = () => setSelectedMovieId(null)

  return (
    <ModalContext.Provider value={{ selectedMovieId, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}
