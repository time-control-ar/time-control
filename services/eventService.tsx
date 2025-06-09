export async function createEvent(formData: FormData) {
  try {
    const res = await fetch("/api/events", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) throw new Error("Error creando evento")

    const result = await res.json()
    return result
  } catch (error) {
    console.error("Error en eventService:", error)
    throw error
  }
}
