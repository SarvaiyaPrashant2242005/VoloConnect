
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getJoinedEvents, getEventsByUser } from '../services/eventService';
import { toast } from '@/components/ui/sonner';

const History = () => {
  const { user } = useAuth();
  const [participatedEvents, setParticipatedEvents] = useState([]);
  const [organizedEvents, setOrganizedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('participated');
  
  useEffect(() => {
    const fetchEventHistory = () => {
      setIsLoading(true);
      try {
        // Get events the user has joined
        const joinedEvents = getJoinedEvents(user.id)
          .filter(event => new Date(event.date) < new Date())
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Get events the user has organized
        const userEvents = getEventsByUser(user.id)
          .filter(event => new Date(event.date) < new Date())
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setParticipatedEvents(joinedEvents);
        setOrganizedEvents(userEvents);
      } catch (error) {
        console.error('Failed to fetch event history:', error);
        toast.error('Failed to load event history');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventHistory();
  }, [user.id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-muted/20 py-8">
        <div className="volo-container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Volunteer History</h1>
          <p className="text-muted-foreground mb-8">View your past volunteer activities and contributions</p>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="participated">Events I Participated In</TabsTrigger>
              <TabsTrigger value="organized">Events I Organized</TabsTrigger>
            </TabsList>
            
            <TabsContent value="participated">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : participatedEvents.length > 0 ? (
                <div className="space-y-6 mt-6">
                  {participatedEvents.map(event => (
                    <EventHistoryCard key={event.id} event={event} type="participated" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-lg shadow mt-6">
                  <h3 className="text-xl font-semibold mb-2">No participation history yet</h3>
                  <p className="text-muted-foreground mb-6">You haven't participated in any events yet</p>
                  <Button asChild>
                    <Link to="/events">Browse Events</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="organized">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : organizedEvents.length > 0 ? (
                <div className="space-y-6 mt-6">
                  {organizedEvents.map(event => (
                    <EventHistoryCard key={event.id} event={event} type="organized" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-lg shadow mt-6">
                  <h3 className="text-xl font-semibold mb-2">No organized events yet</h3>
                  <p className="text-muted-foreground mb-6">You haven't organized any events yet</p>
                  <Button asChild>
                    <Link to="/create-event">Create an Event</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

const EventHistoryCard = ({ event, type }) => {
  // Format date for display
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <CardTitle className="text-xl">{event.name}</CardTitle>
            <CardDescription>{formattedDate}</CardDescription>
          </div>
          <Badge
            className={
              type === 'participated' ? 'bg-primary' : 'bg-secondary'
            }
          >
            {type === 'participated' ? 'Participated' : 'Organized'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mr-1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{event.location}</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mr-1"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
              <span>{event.category}</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mr-1"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <span>{event.volunteersJoined}/{event.volunteersRequired} volunteers</span>
            </div>
          </div>
          
          <p className="text-muted-foreground line-clamp-2">{event.description}</p>
          
          <Button asChild variant="outline" className="mt-2">
            <Link to={`/events/${event.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default History;
