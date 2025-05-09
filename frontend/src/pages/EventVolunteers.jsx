
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '../components/AuthProvider';
import { getEventById, getEventVolunteers, getEventQueries } from '../services/eventService';
import QueryResponseForm from '../components/QueryResponseForm';

const EventVolunteers = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("volunteers");

  useEffect(() => {
    const fetchEventAndVolunteers = async () => {
      setIsLoading(true);
      try {
        const eventData = getEventById(eventId);
        
        if (!eventData) {
          navigate('/my-events');
          toast.error('Event not found');
          return;
        }
        
        // Check if user is the organizer
        if (eventData.organizerId !== user.id) {
          navigate('/my-events');
          toast.error('You do not have permission to view this page');
          return;
        }
        
        setEvent(eventData);
        
        // Get volunteers for this event
        const eventVolunteers = getEventVolunteers(eventId);
        setVolunteers(eventVolunteers);
        
        // Get queries for this event
        const eventQueries = getEventQueries(eventId);
        setQueries(eventQueries);
      } catch (error) {
        console.error('Failed to fetch event details:', error);
        toast.error('Failed to load volunteer information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventAndVolunteers();
  }, [eventId, navigate, user.id]);

  const refreshQueries = () => {
    const updatedQueries = getEventQueries(eventId);
    setQueries(updatedQueries);
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

  // Format date for display
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-muted/20 py-8">
        <div className="volo-container mx-auto px-4 max-w-7xl">
          <div className="mb-6 flex items-center">
            <Link to={`/my-events`} className="text-primary hover:underline flex items-center gap-1 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Back to My Events
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to={`/events/${eventId}`} className="text-primary hover:underline ml-2">
              Event Details
            </Link>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl md:text-3xl">{event.name} - Management</CardTitle>
                  <CardDescription className="text-base mt-1">{formattedDate}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-primary">{event.category}</Badge>
                  <Badge variant="outline">{event.volunteersJoined}/{event.volunteersRequired} volunteers</Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
              <TabsTrigger value="queries">Questions & Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="volunteers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Volunteer List</CardTitle>
                  <CardDescription>
                    {volunteers.length > 0 
                      ? `${volunteers.length} volunteer${volunteers.length === 1 ? '' : 's'} have joined this event.`
                      : 'No volunteers have joined this event yet.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {volunteers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Profession</TableHead>
                          <TableHead>Joined On</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {volunteers.map((volunteer) => (
                          <TableRow key={volunteer.id}>
                            <TableCell className="font-medium">{volunteer.name}</TableCell>
                            <TableCell>{volunteer.email}</TableCell>
                            <TableCell>{volunteer.profession}</TableCell>
                            <TableCell>{volunteer.joinedAt}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="48" 
                        height="48" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mx-auto mb-4 text-muted-foreground"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <p className="text-lg font-medium">No volunteers yet</p>
                      <p className="text-muted-foreground mt-1">When volunteers join your event, they'll appear here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="queries" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Questions & Messages</CardTitle>
                  <CardDescription>
                    {queries.length > 0 
                      ? `${queries.length} question${queries.length === 1 ? '' : 's'} from volunteers`
                      : 'No questions have been asked yet.'}
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
                            <div className="bg-muted/30 p-3 rounded-md">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Your response</span>
                                <span className="text-sm text-muted-foreground">
                                  {query.respondedAt ? new Date(query.respondedAt).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <p>{query.response}</p>
                            </div>
                          ) : (
                            <QueryResponseForm queryId={query.id} onResponseSubmit={refreshQueries} />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="48" 
                        height="48" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mx-auto mb-4 text-muted-foreground"
                      >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                      <p className="text-lg font-medium">No questions yet</p>
                      <p className="text-muted-foreground mt-1">When volunteers ask questions, they'll appear here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline">
              <Link to={`/events/${eventId}`}>
                Back to Event Details
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EventVolunteers;
