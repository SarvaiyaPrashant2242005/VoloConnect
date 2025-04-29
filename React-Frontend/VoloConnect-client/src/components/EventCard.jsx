
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from './AuthProvider';
import { hasJoinedEvent } from '../services/eventService';
import { Badge } from "@/components/ui/badge";

const EventCard = ({ event, showJoin = true }) => {
  const { user } = useAuth();
  const isOrganizer = user?.id === event.organizerId;
  const hasJoined = user ? hasJoinedEvent(event.id, user.id) : false;
  
  // Calculate if event is in the past
  const isPastEvent = new Date(event.date) < new Date();
  
  // Calculate if event is full
  const isFull = event.volunteersJoined >= event.volunteersRequired;
  
  // Format date for display
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg md:text-xl line-clamp-2">{event.name}</CardTitle>
            <CardDescription className="text-sm mt-1">{formattedDate} • {event.location}</CardDescription>
          </div>
          
          <div className="flex gap-1">
            {isPastEvent && (
              <Badge variant="outline" className="text-muted-foreground">Past</Badge>
            )}
            {isOrganizer && (
              <Badge className="bg-secondary text-secondary-foreground">Organizer</Badge>
            )}
            {hasJoined && !isOrganizer && (
              <Badge className="bg-primary text-primary-foreground">Joined</Badge>
            )}
            {isFull && !isPastEvent && (
              <Badge variant="outline" className="text-accent">Full</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <p className="text-sm line-clamp-3">{event.description}</p>
        
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            <span className="font-medium">{event.category}</span>
          </div>
          <div>
            <span className="font-medium">{event.volunteersJoined}/{event.volunteersRequired}</span> volunteers
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="w-full flex justify-between">
          <Button asChild variant="outline">
            <Link to={`/events/${event.id}`}>View Details</Link>
          </Button>
          
          {showJoin && !isOrganizer && !hasJoined && !isPastEvent && !isFull && (
            <Button asChild>
              <Link to={`/events/${event.id}`}>Join Now</Link>
            </Button>
          )}
          
          {isOrganizer && (
            <Button asChild variant="secondary">
              <Link to={`/my-events/edit/${event.id}`}>Manage</Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
