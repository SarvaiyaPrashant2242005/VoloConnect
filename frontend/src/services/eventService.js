
// Initial mock data for events
const generateMockEvents = () => {
  const categories = ['Community Service', 'Environmental', 'Education', 'Health', 'Animal Welfare', 'Arts & Culture'];
  const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA'];
  
  const events = Array.from({ length: 15 }, (_, i) => ({
    id: `event-${i + 1}`,
    name: `${categories[i % categories.length]} Volunteer Event ${i + 1}`,
    description: `Join us for this amazing volunteer opportunity to make a difference in your community. This is a great way to give back and meet new people!`,
    date: new Date(Date.now() + (i * 2 + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Future dates
    location: locations[i % locations.length],
    category: categories[i % categories.length],
    volunteersRequired: Math.floor(Math.random() * 20) + 5,
    volunteersJoined: Math.floor(Math.random() * 5),
    organizerId: i < 5 ? 'user-abc123' : `user-${Math.random().toString(36).substring(2, 9)}`, // First 5 events are the demo user's
    posterUrl: i % 3 === 0 ? '/placeholder.svg' : null, // Some events have posters, some don't
    createdAt: new Date(Date.now() - (i * 3) * 24 * 60 * 60 * 1000).toISOString(), // Past dates for creation
  }));
  
  return events;
};

// Generate some mock queries
const generateMockQueries = () => {
  const userNames = ['Sarah Johnson', 'Michael Lee', 'Emily Chen', 'David Rodriguez', 'Olivia Patel'];
  const messages = [
    'What kind of skills are required for this event?',
    'Is there parking available at the location?',
    'Will lunch be provided during this event?',
    'How long will the event last?',
    'Do I need to bring any special equipment?',
    'Is this event suitable for beginners?',
    'Can I bring a friend who isn\'t registered?'
  ];
  
  const queries = [];
  
  // Add some random queries for the first 3 events
  for (let i = 1; i <= 3; i++) {
    const eventId = `event-${i}`;
    const queryCount = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < queryCount; j++) {
      const userName = userNames[Math.floor(Math.random() * userNames.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString();
      const hasResponse = Math.random() > 0.5;
      
      queries.push({
        id: `query-${i}-${j}`,
        eventId,
        userId: `user-${Math.random().toString(36).substring(2, 9)}`,
        userName,
        message,
        createdAt,
        response: hasResponse ? `Thank you for your question! ${Math.random() > 0.5 ? 'Yes, that\'s available.' : 'Please check the event details for more information.'}` : null,
        respondedAt: hasResponse ? new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString() : null
      });
    }
  }
  
  return queries;
};

// Function to initialize event data in localStorage if it doesn't exist
const initializeEventData = () => {
  if (!localStorage.getItem('volo-events')) {
    localStorage.setItem('volo-events', JSON.stringify(generateMockEvents()));
  }
  if (!localStorage.getItem('volo-event-participants')) {
    localStorage.setItem('volo-event-participants', JSON.stringify([]));
  }
  if (!localStorage.getItem('volo-event-queries')) {
    localStorage.setItem('volo-event-queries', JSON.stringify(generateMockQueries()));
  }
};

// Initialize data
initializeEventData();

// Get all events from localStorage
export const getAllEvents = () => {
  const events = JSON.parse(localStorage.getItem('volo-events') || '[]');
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const getEventById = (eventId) => {
  const events = getAllEvents();
  return events.find(event => event.id === eventId) || null;
};

export const getEventsByUser = (userId) => {
  const events = getAllEvents();
  return events.filter(event => event.organizerId === userId);
};

export const createEvent = (eventData, userId) => {
  const events = getAllEvents();
  const newEvent = {
    id: `event-${Date.now()}`,
    ...eventData,
    organizerId: userId,
    volunteersJoined: 0,
    createdAt: new Date().toISOString(),
  };
  
  events.push(newEvent);
  localStorage.setItem('volo-events', JSON.stringify(events));
  return newEvent;
};

export const updateEvent = (eventId, eventData) => {
  let events = getAllEvents();
  const eventIndex = events.findIndex(event => event.id === eventId);
  
  if (eventIndex === -1) {
    throw new Error('Event not found');
  }
  
  events[eventIndex] = { ...events[eventIndex], ...eventData };
  localStorage.setItem('volo-events', JSON.stringify(events));
  return events[eventIndex];
};

export const deleteEvent = (eventId) => {
  let events = getAllEvents();
  const filteredEvents = events.filter(event => event.id !== eventId);
  
  if (filteredEvents.length === events.length) {
    throw new Error('Event not found');
  }
  
  // Also remove any participation records for this event
  let participants = JSON.parse(localStorage.getItem('volo-event-participants') || '[]');
  participants = participants.filter(p => p.eventId !== eventId);
  
  // And remove any queries related to this event
  let queries = JSON.parse(localStorage.getItem('volo-event-queries') || '[]');
  queries = queries.filter(q => q.eventId !== eventId);
  
  localStorage.setItem('volo-events', JSON.stringify(filteredEvents));
  localStorage.setItem('volo-event-participants', JSON.stringify(participants));
  localStorage.setItem('volo-event-queries', JSON.stringify(queries));
  
  return true;
};

export const joinEvent = (eventId, userId) => {
  const event = getEventById(eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }
  
  // Check if already joined
  const participants = JSON.parse(localStorage.getItem('volo-event-participants') || '[]');
  const isAlreadyJoined = participants.some(p => p.eventId === eventId && p.userId === userId);
  
  if (isAlreadyJoined) {
    throw new Error('You have already joined this event');
  }
  
  // Check if event is full
  if (event.volunteersJoined >= event.volunteersRequired) {
    throw new Error('Event is already full');
  }
  
  // Update event volunteersJoined count
  updateEvent(eventId, { volunteersJoined: event.volunteersJoined + 1 });
  
  // Add to participants
  const newParticipant = {
    id: `participant-${Date.now()}`,
    eventId,
    userId,
    joinedAt: new Date().toISOString(),
  };
  
  participants.push(newParticipant);
  localStorage.setItem('volo-event-participants', JSON.stringify(participants));
  
  return newParticipant;
};

export const leaveEvent = (eventId, userId) => {
  const event = getEventById(eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }
  
  // Check if joined
  const participants = JSON.parse(localStorage.getItem('volo-event-participants') || '[]');
  const participantIndex = participants.findIndex(p => p.eventId === eventId && p.userId === userId);
  
  if (participantIndex === -1) {
    throw new Error('You have not joined this event');
  }
  
  // Update event volunteersJoined count
  updateEvent(eventId, { volunteersJoined: Math.max(0, event.volunteersJoined - 1) });
  
  // Remove from participants
  participants.splice(participantIndex, 1);
  localStorage.setItem('volo-event-participants', JSON.stringify(participants));
  
  return true;
};

export const getJoinedEvents = (userId) => {
  const participants = JSON.parse(localStorage.getItem('volo-event-participants') || '[]');
  const events = getAllEvents();
  
  const joinedEventIds = participants
    .filter(p => p.userId === userId)
    .map(p => p.eventId);
  
  return events.filter(event => joinedEventIds.includes(event.id));
};

export const hasJoinedEvent = (eventId, userId) => {
  const participants = JSON.parse(localStorage.getItem('volo-event-participants') || '[]');
  return participants.some(p => p.eventId === eventId && p.userId === userId);
};

// Enhanced query methods
export const createEventQuery = (eventId, userId, message) => {
  const event = getEventById(eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }
  
  // Mock user name for the query
  const mockUserNames = ['Alex Smith', 'Jamie Johnson', 'Taylor Brown', 'Jordan Wilson'];
  const userName = mockUserNames[Math.floor(Math.random() * mockUserNames.length)];
  
  const queries = JSON.parse(localStorage.getItem('volo-event-queries') || '[]');
  const newQuery = {
    id: `query-${Date.now()}`,
    eventId,
    userId,
    userName, // Use mock name for display purposes
    message,
    response: null,
    createdAt: new Date().toISOString(),
    respondedAt: null,
  };
  
  queries.push(newQuery);
  localStorage.setItem('volo-event-queries', JSON.stringify(queries));
  
  return newQuery;
};

export const respondToEventQuery = (queryId, response) => {
  const queries = JSON.parse(localStorage.getItem('volo-event-queries') || '[]');
  const queryIndex = queries.findIndex(q => q.id === queryId);
  
  if (queryIndex === -1) {
    throw new Error('Query not found');
  }
  
  queries[queryIndex].response = response;
  queries[queryIndex].respondedAt = new Date().toISOString();
  
  localStorage.setItem('volo-event-queries', JSON.stringify(queries));
  
  return queries[queryIndex];
};

export const getEventQueries = (eventId) => {
  const queries = JSON.parse(localStorage.getItem('volo-event-queries') || '[]');
  return queries.filter(q => q.eventId === eventId);
};

export const getUserQueries = (userId) => {
  const queries = JSON.parse(localStorage.getItem('volo-event-queries') || '[]');
  return queries.filter(q => q.userId === userId);
};

export const getOrganizerQueries = (userId) => {
  const userEvents = getEventsByUser(userId);
  const userEventIds = userEvents.map(event => event.id);
  
  const queries = JSON.parse(localStorage.getItem('volo-event-queries') || '[]');
  return queries.filter(q => userEventIds.includes(q.eventId));
};

export const getEventVolunteers = (eventId) => {
  const participants = JSON.parse(localStorage.getItem('volo-event-participants') || '[]');
  const eventParticipants = participants.filter(p => p.eventId === eventId);
  
  // For demo purposes, generate some mock user data for these participants
  const users = [
    { id: 'user-abc123', name: 'John Doe', email: 'john@example.com', profession: 'Software Engineer' },
    { id: 'user-def456', name: 'Jane Smith', email: 'jane@example.com', profession: 'Teacher' },
    { id: 'user-ghi789', name: 'Michael Brown', email: 'michael@example.com', profession: 'Doctor' },
    { id: 'user-jkl012', name: 'Emily Wilson', email: 'emily@example.com', profession: 'Designer' },
    { id: 'user-mno345', name: 'David Chen', email: 'david@example.com', profession: 'Student' },
  ];
  
  // Map participant IDs to user data
  return eventParticipants.map(participant => {
    // Find a matching user or create generic data
    const matchingUser = users.find(u => u.id === participant.userId) || 
      { name: `Volunteer ${participant.userId.slice(-4)}`, email: `volunteer${participant.userId.slice(-4)}@example.com`, profession: 'Volunteer' };
    
    return {
      ...participant,
      name: matchingUser.name,
      email: matchingUser.email,
      profession: matchingUser.profession,
      joinedAt: new Date(participant.joinedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    };
  });
};
