import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '../components/AuthProvider';
import { getEventById, hasJoinedEvent, joinEvent, leaveEvent, createEventQuery, getEventQueries } from '../services/eventService';

const EventDetail = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [queryMessage, setQueryMessage] = useState('');
  const [sendingQuery, setSendingQuery] = useState(false);
  const [queries, setQueries] = useState([]);
  
  useEffect(() => {
    const fetchEventDetails = () => {
      setIsLoading(true);
      try {
        const eventData = getEventById(eventId);
        if (!eventData) {
          navigate('/events');
          toast.error('Event not found');
          return;
        }
        
        setEvent(eventData);
        if (user) {
          setIsJoined(hasJoinedEvent(eventId, user.id));
        }
        
        // Fetch queries for this event
        const eventQueries = getEventQueries(eventId);
        setQueries(eventQueries);
      } catch (error) {
        console.error('Failed to fetch event details:', error);
        toast.error('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [eventId, navigate, user]);
  
  const handleJoinEvent = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setJoinLoading(true);
    try {
      await joinEvent(eventId, user.id);
      setIsJoined(true);
      
      const updatedEvent = getEventById(eventId);
      setEvent(updatedEvent);
      
      toast.success('Successfully joined the event!');
    } catch (error) {
      console.error('Failed to join event:', error);
      toast.error(error.message || 'Failed to join event');
    } finally {
      setJoinLoading(false);
    }
  };
  
  const handleLeaveEvent = async () => {
    setJoinLoading(true);
    try {
      await leaveEvent(eventId, user.id);
      setIsJoined(false);
      
      const updatedEvent = getEventById(eventId);
      setEvent(updatedEvent);
      
      toast.success('Successfully left the event');
    } catch (error) {
      console.error('Failed to leave event:', error);
      toast.error(error.message || 'Failed to leave event');
    } finally {
      setJoinLoading(false);
    }
  };
  
  const handleSendQuery = async () => {
    if (!queryMessage.trim()) {
      toast.error('Please enter your question or message');
      return;
    }
    
    setSendingQuery(true);
    try {
      await createEventQuery(eventId, user.id, queryMessage);
      toast.success('Your query has been sent to the organizer');
      setQueryMessage('');
      
      // Refresh the queries
      const updatedQueries = getEventQueries(eventId);
      setQueries(updatedQueries);
    } catch (error) {
      console.error('Failed to send query:', error);
      toast.error('Failed to send your query');
    } finally {
      setSendingQuery(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!event) {
    return null; // This should not happen as we navigate away in useEffect
  }
  
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const isPastEvent = new Date(event.date) < new Date();
  
  const isFull = event.volunteersJoined >= event.volunteersRequired;
  
  const isOrganizer = user?.id === event.organizerId;
  
  const filledPercentage = Math.min(100, Math.round((event.volunteersJoined / event.volunteersRequired) * 100));
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-muted/20 py-8">
        <div className="volo-container mx-auto px-4">
          <div className="mb-6">
            <Link to="/events" className="text-primary hover:underline flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Back to Events
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="mb-8">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-3xl">{event.name}</CardTitle>
                      <CardDescription className="text-lg mt-1">{formattedDate}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-primary">{event.category}</Badge>
                      {isPastEvent && (
                        <Badge variant="outline" className="text-muted-foreground">Past Event</Badge>
                      )}
                      {isFull && !isPastEvent && (
                        <Badge className="bg-accent">Full</Badge>
                      )}
                      {isOrganizer && (
                        <Badge className="bg-secondary">Organizer</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div className="flex items-center mb-4 md:mb-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mr-2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span className="text-muted-foreground">{formattedDate}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mr-2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      <span className="text-muted-foreground">{event.location}</span>
                    </div>
                  </div>
                  
                  {event.posterUrl && (
                    <div className="mb-6 flex justify-center">
                      <img 
                        src={event.posterUrl} 
                        alt={event.name} 
                        className="rounded-md max-h-72 object-contain"
                      />
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="font-semibold text-lg mb-3">About This Event</h3>
                    <p className="whitespace-pre-line">{event.description}</p>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="location">
                      <AccordionTrigger>Location Details</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-2">{event.location}</p>
                        <div className="bg-muted h-64 rounded-md flex items-center justify-center">
                          <span className="text-muted-foreground">Map placeholder</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="volunteer-info">
                      <AccordionTrigger>Volunteer Information</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">What to expect as a volunteer:</p>
                        <ul className="list-disc pl-5 space-y-2">
                          <li>Please arrive 15 minutes before the event starts for orientation</li>
                          <li>Wear comfortable clothing appropriate for the activities</li>
                          <li>Bring a water bottle and any personal items you might need</li>
                          <li>Training will be provided on site</li>
                          <li>Feel free to ask questions to the event organizer</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Questions & Answers</CardTitle>
                  <CardDescription>
                    {isOrganizer 
                      ? "View and respond to questions from volunteers" 
                      : "Ask questions about this event"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {queries.length > 0 ? (
                    <div className="space-y-6">
                      {queries.map((query) => (
                        <div key={query.id} className="border rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{query.userName || 'Volunteer'}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(query.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mb-4">{query.message}</p>
                          
                          {query.response ? (
                            <div className="bg-muted/30 p-3 rounded-md mt-3">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Response from organizer</span>
                                <span className="text-sm text-muted-foreground">
                                  {query.respondedAt ? new Date(query.respondedAt).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <p>{query.response}</p>
                            </div>
                          ) : isOrganizer ? (
                            <div className="mt-3">
                              <QueryResponseForm queryId={query.id} onResponseSubmit={() => {
                                // Refresh queries after response
                                const updatedQueries = getEventQueries(eventId);
                                setQueries(updatedQueries);
                              }} />
                            </div>
                          ) : (
                            <div className="text-sm italic text-muted-foreground mt-2">
                              Awaiting organizer response
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mx-auto mb-3 text-muted-foreground"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <p className="text-muted-foreground">No questions yet</p>
                    </div>
                  )}
                </CardContent>

                {!isOrganizer && (
                  <>
                    <CardFooter className="flex-col">
                      <div className="w-full mb-4">
                        <Textarea 
                          placeholder="Type your question or message here..." 
                          rows={4}
                          value={queryMessage}
                          onChange={(e) => setQueryMessage(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end w-full">
                        <Button 
                          onClick={handleSendQuery} 
                          disabled={sendingQuery || !queryMessage.trim() || !isJoined}
                        >
                          {sendingQuery ? 'Sending...' : 'Send Question'}
                        </Button>
                      </div>
                      {!isJoined && (
                        <p className="text-sm text-muted-foreground mt-2">
                          You need to join this event to ask questions
                        </p>
                      )}
                    </CardFooter>
                  </>
                )}
              </Card>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Volunteer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground mb-1">Spots filled</p>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${filledPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{event.volunteersJoined}/{event.volunteersRequired}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      {isPastEvent ? (
                        <Alert variant="default" className="bg-muted/50">
                          <AlertTitle>This event has already taken place</AlertTitle>
                          <AlertDescription>Check out upcoming events instead.</AlertDescription>
                        </Alert>
                      ) : isOrganizer ? (
                        <div className="space-y-4">
                          <Alert variant="default" className="bg-secondary/10">
                            <AlertTitle>You're the organizer</AlertTitle>
                            <AlertDescription>You can manage this event from your dashboard.</AlertDescription>
                          </Alert>
                          
                          <Button asChild variant="outline" className="w-full">
                            <Link to={`/my-events/edit/${event.id}`}>Manage Event</Link>
                          </Button>
                        </div>
                      ) : isJoined ? (
                        <div className="space-y-4">
                          <Alert variant="default" className="bg-primary/10">
                            <AlertTitle>You're volunteering!</AlertTitle>
                            <AlertDescription>We look forward to seeing you at this event.</AlertDescription>
                          </Alert>
                          
                          <Button 
                            variant="outline" 
                            className="w-full text-destructive hover:bg-destructive/10"
                            onClick={handleLeaveEvent}
                            disabled={joinLoading}
                          >
                            {joinLoading ? 'Processing...' : 'Leave Event'}
                          </Button>
                        </div>
                      ) : isFull ? (
                        <Alert variant="default" className="bg-accent/10">
                          <AlertTitle>Event is full</AlertTitle>
                          <AlertDescription>All volunteer positions have been filled for this event.</AlertDescription>
                        </Alert>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={handleJoinEvent}
                          disabled={joinLoading}
                        >
                          {joinLoading ? 'Joining...' : 'Join as Volunteer'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div>
                      <p className="font-medium">{isOrganizer ? 'You' : 'Event Organizer'}</p>
                      <p className="text-sm text-muted-foreground">Contact via message</p>
                    </div>
                  </div>
                  
                  {isOrganizer && (
                    <div className="mt-4">
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/my-events/volunteers/${event.id}`} className="flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 1 0 7.75"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          View Volunteer List
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Share Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="icon" className="rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EventDetail;
