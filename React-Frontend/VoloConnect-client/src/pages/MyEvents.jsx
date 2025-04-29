
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getEventsByUser, deleteEvent, getOrganizerQueries } from '../services/eventService';
import { toast } from '@/components/ui/sonner';

const MyEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    const fetchEvents = () => {
      setIsLoading(true);
      try {
        const userEvents = getEventsByUser(user.id);
        setEvents(userEvents);
        
        // Get queries for all events organized by the user
        const eventQueries = getOrganizerQueries(user.id);
        setQueries(eventQueries);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast.error('Failed to load your events');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [user.id]);
  
  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      setEvents(events.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully');
      setEventToDelete(null); // Reset after deletion
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };
  
  // Filter events for different tabs
  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date());
  const pastEvents = events.filter(event => new Date(event.date) < new Date());
  
  // Get pending queries (no response yet)
  const pendingQueries = queries.filter(query => !query.response);
  
  // Group events by date for upcoming events
  const groupEventsByDate = (eventsToGroup) => {
    const groups = {};
    
    eventsToGroup.forEach(event => {
      const date = event.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
    });
    
    // Sort dates
    return Object.keys(groups)
      .sort((a, b) => new Date(a) - new Date(b))
      .map(date => ({
        date,
        events: groups[date]
      }));
  };
  
  const groupedUpcomingEvents = groupEventsByDate(upcomingEvents);
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-muted/20 py-8">
        <div className="volo-container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Events</h1>
              <p className="text-muted-foreground">Manage the events you have created</p>
            </div>
            <Button asChild className="mt-4 md:mt-0">
              <Link to="/create-event">Create New Event</Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {pendingQueries.length > 0 && (
                <Card className="mb-8 border-accent bg-accent/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-accent"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                      You have {pendingQueries.length} unanswered {pendingQueries.length === 1 ? 'question' : 'questions'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Volunteers have questions about your events. Answer them to provide more information.
                    </p>
                    <Button asChild>
                      <Link to="/my-events/queries">View Questions</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                  <TabsTrigger value="past">Past Events</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-8 mt-6">
                      {groupedUpcomingEvents.map(group => (
                        <div key={group.date} className="space-y-4">
                          <h2 className="text-xl font-semibold">{formatDate(group.date)}</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {group.events.map(event => (
                              <EventCard 
                                key={event.id} 
                                event={event} 
                                onDelete={() => setEventToDelete(event)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-card rounded-lg shadow mt-6">
                      <h3 className="text-xl font-semibold mb-2">No upcoming events</h3>
                      <p className="text-muted-foreground mb-6">You haven't created any upcoming events yet</p>
                      <Button asChild>
                        <Link to="/create-event">Create New Event</Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="past">
                  {pastEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                      {pastEvents.map(event => (
                        <EventCard 
                          key={event.id} 
                          event={event} 
                          isPast={true}
                          onDelete={() => setEventToDelete(event)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-card rounded-lg shadow mt-6">
                      <h3 className="text-xl font-semibold mb-2">No past events</h3>
                      <p className="text-muted-foreground mb-4">Your event history will appear here after events are completed</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              {/* Confirm Delete Dialog */}
              <AlertDialog 
                open={!!eventToDelete} 
                onOpenChange={(open) => !open && setEventToDelete(null)}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the event "{eventToDelete?.name}" and remove all associated volunteer registrations and queries.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteEvent(eventToDelete.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Event Card component specifically for My Events page
const EventCard = ({ event, isPast = false, onDelete }) => {
  // Format date for display
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{event.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/events/${event.id}`} className="cursor-pointer w-full">
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/my-events/volunteers/${event.id}`} className="cursor-pointer w-full">
                  View Volunteers
                </Link>
              </DropdownMenuItem>
              {!isPast && (
                <DropdownMenuItem asChild>
                  <Link to={`/my-events/edit/${event.id}`} className="cursor-pointer w-full">
                    Edit Event
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive cursor-pointer">
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>{formattedDate} • {event.location}</CardDescription>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <p className="text-sm line-clamp-2 mb-3">{event.description}</p>
        
        <div className="flex items-center justify-between">
          <Badge>{event.category}</Badge>
          <span className="text-sm text-muted-foreground">
            {event.volunteersJoined}/{event.volunteersRequired} volunteers
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between">
        {isPast ? (
          <Badge variant="outline" className="text-muted-foreground">Completed</Badge>
        ) : (
          <Badge className="bg-primary">Upcoming</Badge>
        )}
        
        <div className="flex gap-2">
          <Button 
            asChild 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Link to={`/my-events/volunteers/${event.id}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span className="hidden sm:inline">Volunteers</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/events/${event.id}`}>Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MyEvents;
