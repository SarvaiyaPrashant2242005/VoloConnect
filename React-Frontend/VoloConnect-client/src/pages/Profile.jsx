
import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from '@/components/ui/sonner';

const Profile = () => {
  const { user } = useAuth();
  
  // Mock user profile data
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    bio: 'I am passionate about volunteering and making a positive impact in my community.',
    phoneNumber: '(123) 456-7890',
    location: 'New York, NY',
    skills: 'Leadership, Communication, Event Planning',
    interests: 'Environmental Conservation, Education, Animal Welfare',
    profilePicture: null
  });
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    eventReminders: true,
    newEvents: true,
    messages: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };
  
  const handleNotificationChange = (key, value) => {
    setNotifications({
      ...notifications,
      [key]: value
    });
  };
  
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Profile updated successfully');
    }, 1000);
  };
  
  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Notification preferences updated');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-muted/20 py-8">
        <div className="volo-container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card className="mb-6 sticky top-24">
                <CardHeader>
                  <div className="flex flex-col items-center">
                    <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      {profile.profilePicture ? (
                        <img 
                          src={profile.profilePicture} 
                          alt="Profile"
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <CardDescription className="text-center mt-1">{profile.email}</CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">Location</Label>
                      <p>{profile.location || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Bio</Label>
                      <p>{profile.bio || 'No bio provided'}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Interests</Label>
                      <p>{profile.interests || 'None specified'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Skills</Label>
                      <p>{profile.skills || 'None specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList>
                  <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <Card>
                    <form onSubmit={handleSaveProfile}>
                      <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                          Update your profile information and how others see you on VoloConnect
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={profile.name}
                            onChange={handleProfileChange}
                            placeholder="Your full name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profile.email}
                            onChange={handleProfileChange}
                            placeholder="your.email@example.com"
                          />
                          <p className="text-sm text-muted-foreground">This email is used for notifications and login</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={profile.bio}
                            onChange={handleProfileChange}
                            placeholder="Tell others about yourself"
                            rows={4}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                              id="phoneNumber"
                              name="phoneNumber"
                              value={profile.phoneNumber}
                              onChange={handleProfileChange}
                              placeholder="(123) 456-7890"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              name="location"
                              value={profile.location}
                              onChange={handleProfileChange}
                              placeholder="City, State"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="skills">Skills</Label>
                          <Textarea
                            id="skills"
                            name="skills"
                            value={profile.skills}
                            onChange={handleProfileChange}
                            placeholder="Enter skills separated by commas"
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="interests">Interests</Label>
                          <Textarea
                            id="interests"
                            name="interests"
                            value={profile.interests}
                            onChange={handleProfileChange}
                            placeholder="Enter interests separated by commas"
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="profilePicture">Profile Picture</Label>
                          <div className="flex items-center justify-center p-4 border-2 border-dashed border-border rounded-md">
                            <div className="text-center">
                              {profile.profilePicture ? (
                                <img
                                  src={profile.profilePicture}
                                  alt="Profile"
                                  className="mx-auto h-32 w-32 rounded-full object-cover mb-4"
                                />
                              ) : (
                                <div className="h-32 w-32 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </div>
                              )}
                              <p className="text-sm text-muted-foreground mb-2">
                                Upload feature coming soon
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex justify-end">
                        <Button 
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <Card>
                    <form onSubmit={handleSaveNotifications}>
                      <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>
                          Manage how and when you receive notifications
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="emailNotifications">Email Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive notifications via email
                              </p>
                            </div>
                            <Switch
                              id="emailNotifications"
                              checked={notifications.email}
                              onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                            />
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="eventReminders">Event Reminders</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive reminders before events you've joined
                              </p>
                            </div>
                            <Switch
                              id="eventReminders"
                              checked={notifications.eventReminders}
                              onCheckedChange={(checked) => handleNotificationChange('eventReminders', checked)}
                            />
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="newEvents">New Events</Label>
                              <p className="text-sm text-muted-foreground">
                                Be notified when new events matching your interests are posted
                              </p>
                            </div>
                            <Switch
                              id="newEvents"
                              checked={notifications.newEvents}
                              onCheckedChange={(checked) => handleNotificationChange('newEvents', checked)}
                            />
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="messages">Messages</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive notifications for new messages and responses
                              </p>
                            </div>
                            <Switch
                              id="messages"
                              checked={notifications.messages}
                              onCheckedChange={(checked) => handleNotificationChange('messages', checked)}
                            />
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex justify-end">
                        <Button 
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Preferences'}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>
                
                <TabsContent value="account">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account settings and password
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <Button className="w-full">Update Password</Button>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button variant="destructive">Delete Account</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
