const handleSubmit = async e => {
  e.preventDefault()

  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    })

    if (!response.ok) throw new Error('Failed to submit feedback')

    // Handle successful response
    setFeedback('')
    setIsSubmitting(false)
    setShowSuccess(true)
  } catch (error) {
    // Handle error state
    setIsSubmitting(false)
    setShowError(true)
  }
}
