import { useState } from "react"
import Modal from "../../components/ui/Modal.jsx"
import Button from "../../components/ui/Button.jsx"
export default function ExamplePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)
  const handleAccept = () => {
    console.log("Acción de aceptar")
    handleCloseModal()
  }
  return (
    <div style={{ padding: "20px" }}>
      <Button onClick={handleOpenModal} text={'Abrir Modal'} type={"button"} />
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Ejemplo de Modal"
        showCancel={true}
        showAccept={true}
        onCancel={() => console.log("Cancelado")}
        onAccept={handleAccept}
        cancelText="Cerrar"
        acceptText="Guardar"
        size="large"
      >
        <p>Este es el contenido de la modal. se puede poner cualquier cosa aquí.</p>
      </Modal>
    </div>
  )
}