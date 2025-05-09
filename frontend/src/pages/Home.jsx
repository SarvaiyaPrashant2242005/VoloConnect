
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import { useAuth } from '../components/AuthProvider';
import { getAllEvents, getJoinedEvents, getEventsByUser } from '../services/eventService';

const Home = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get all events
        const allEvents = getAllEvents();
        
        // Sort events by date
        const upcomingEvents = allEvents
          .filter(event => new Date(event.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Get recent events (past events, most recent first)
        const recentEvents = allEvents
          .filter(event => new Date(event.date) < new Date())
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Get user's events
        const myEvents = getEventsByUser(user.id);
        
        // Get events the user has joined
        const eventsJoined = getJoinedEvents(user.id);
        
        setEvents([...upcomingEvents, ...recentEvents.slice(0, 3)]);
        setUserEvents(myEvents);
        setJoinedEvents(eventsJoined);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user.id]);
  
  // Filter events for different tabs
  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date());
  const recentEvents = events.filter(event => new Date(event.date) < new Date());

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
          <div className="volo-container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
                <p className="text-muted-foreground">Find opportunities to volunteer and make a difference.</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button asChild size="lg">
                  <Link to="/create-event">Create Event</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Main Content */}
        <section className="py-8">
          <div className="volo-container mx-auto px-4">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Events</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="my-events">My Events</TabsTrigger>
                  <TabsTrigger value="joined">Joined Events</TabsTrigger>
                </TabsList>
                
                <div>
                  <Button asChild variant="outline">
                    <Link to="/events">View All Events</Link>
                  </Button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <TabsContent value="all" className="mt-0">
                    {events.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.slice(0, 6).map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">No events found. Be the first to create one!</p>
                        <Button asChild>
                          <Link to="/create-event">Create Event</Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="upcoming" className="mt-0">
                    {upcomingEvents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingEvents.slice(0, 6).map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">No upcoming events found.</p>
                        <Button asChild>
                          <Link to="/create-event">Create Event</Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="recent" className="mt-0">
                    {recentEvents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentEvents.slice(0, 6).map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No recent events found.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="my-events" className="mt-0">
                    {userEvents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userEvents.map((event) => (
                          <EventCard key={event.id} event={event} showJoin={false} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">You haven't created any events yet.</p>
                        <Button asChild>
                          <Link to="/create-event">Create Event</Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="joined" className="mt-0">
                    {joinedEvents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {joinedEvents.map((event) => (
                          <EventCard key={event.id} event={event} showJoin={false} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">You haven't joined any events yet.</p>
                        <Button asChild>
                          <Link to="/events">Browse Events</Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-12 mt-6">
          <div className="volo-container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to make a difference?</h2>
            <p className="mb-6 max-w-2xl mx-auto">Create your own volunteer event and invite others to join, or browse existing opportunities in your area.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <Link to="/create-event" className="min-w-[150px]">Create Event</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/events" className="min-w-[150px]">Browse Events</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
