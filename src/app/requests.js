import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Requests() {
  const [requests, setRequests] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase.from('plant_requests').select('*')
        if (error) throw error
        setRequests(data)
      } catch (error) {
        console.error('Error fetching requests:', error)
      }
    }
    fetchRequests()
  }, [])

  const filteredRequests = requests.filter((request) => {
    return (
      request.plantName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (locationFilter === '' || request.location === locationFilter) &&
      (typeFilter === '' || request.type === typeFilter)
    )
  })

  const handleInterested = async (request) => {
    try {
      const { data: interestedData, error: interestedError } = await supabase
        .from('interested_users')
        .insert({
          request_id: request.id,
          contact_details: prompt('Enter your contact details:'),
        })
      if (interestedError) throw interestedError
  
      // Send an email to the original poster
      const { data: posterData, error: posterError } = await supabase
        .from('plant_requests')
        .select('email')
        .eq('id', request.id)
        .single()
      if (posterError) throw posterError
  
      // Use a third-party email service (e.g., SendGrid, Mailgun) to send the email
      // Replace the following code with your email service integration
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: posterData.email,
          subject: `Someone is interested in your plant request: ${request.plantName}`,
          text: `A user has expressed interest in your plant request. Their contact details: ${interestedData.contact_details}`,
        }),
      })
  
      alert('Your interest has been recorded. The original poster will be notified.')
    } catch (error) {
      console.error('Error recording interest:', error)
      alert('Error recording interest. Please try again.')
    }
  }

  return (
    <main>
      <div>
        <h1>Plant Requests</h1>
        <div>
          <input
            type="text"
            placeholder="Search by plant name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">Filter by location</option>
            {[...new Set(requests.map((request) => request.location))].map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Filter by type</option>
            <option value="share">Share</option>
            <option value="request">Request</option>
          </select>
        </div>
        <ul>
          {filteredRequests.map((request) => (
            <li key={request.id}>
              <h3>{request.plantName}</h3>
              <p>{request.description}</p>
              <p>Location: {request.location}</p>
              <p>Pincode: {request.pincode}</p>
              <p>Type: {request.type}</p>
              <button onClick={() => handleInterested(request)}>
                I'm Interested
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}