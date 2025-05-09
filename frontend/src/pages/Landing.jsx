
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '../components/Footer';

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-card shadow-sm border-b">
        <div className="volo-container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary flex items-center">
            <span className="mr-2">🤝</span>
            VoloConnect
          </Link>
          <div className="flex space-x-4">
            <Button asChild variant="ghost">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16 md:py-24">
          <div className="volo-container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Connect with Meaningful <span className="text-primary">Volunteer</span> Opportunities
              </h1>
              <p className="text-lg mb-8 text-muted-foreground">
                VoloConnect helps you discover local volunteer events, manage your own initiatives, and make a positive impact in your community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/signup">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8">
                  <Link to="/login">I'm Already a Volunteer</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="/placeholder.svg"
                alt="Volunteering illustration"
                className="rounded-lg shadow-lg max-w-full h-auto"
                style={{ maxHeight: '400px' }}
              />
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 bg-background">
          <div className="volo-container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Use VoloConnect?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Find Opportunities</h3>
                <p className="text-muted-foreground">Discover volunteer events in your area that match your interests and availability.</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
                <div className="bg-secondary/10 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Events</h3>
                <p className="text-muted-foreground">Organize your own volunteer initiatives and recruit passionate volunteers.</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
                <div className="bg-accent/10 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Stay Connected</h3>
                <p className="text-muted-foreground">Communicate with organizers and other volunteers to coordinate efforts effectively.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-16 bg-muted/50">
          <div className="volo-container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Volunteers Say</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm border">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <span className="text-lg font-bold text-primary">JD</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Jane Doe</h4>
                    <p className="text-sm text-muted-foreground">Regular Volunteer</p>
                  </div>
                </div>
                <p className="text-muted-foreground">"VoloConnect made it so easy to find meaningful volunteer opportunities in my area. I've participated in 5 events so far and met amazing people!"</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm border">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mr-4">
                    <span className="text-lg font-bold text-secondary">MS</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Mike Smith</h4>
                    <p className="text-sm text-muted-foreground">Event Organizer</p>
                  </div>
                </div>
                <p className="text-muted-foreground">"As an organizer, I can easily create events and manage volunteers. The platform has helped our nonprofit reach more people and make a bigger impact."</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm border">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mr-4">
                    <span className="text-lg font-bold text-accent">SJ</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Sarah Johnson</h4>
                    <p className="text-sm text-muted-foreground">Community Leader</p>
                  </div>
                </div>
                <p className="text-muted-foreground">"Our community clean-up events are now much more organized and effective thanks to VoloConnect. Highly recommended for any volunteer initiative!"</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="py-16 bg-gradient-to-br from-primary to-secondary text-white">
          <div className="volo-container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">Join VoloConnect today and start connecting with meaningful volunteer opportunities in your community.</p>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/signup">Sign Up Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
