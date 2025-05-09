import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Checkbox } from '@/components/ui/checkbox';
import MultiSelect from '@/components/ui/multiselect'; // You may need a custom component or library

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact: '',
    department: '',
    enrollment: '',
    profile_picture: '',
    interests: []
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { name, email, password, confirmPassword, contact, department, enrollment, profile_picture, interests } = formData;
  
    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }
  
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
  
    if (!agreedToTerms) {
      toast.error('You must agree to the Terms of Service and Privacy Policy');
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Remove confirmPassword from the data sent to the server
      const { confirmPassword: _, ...signupData } = formData;
      await signup(signupData);
      navigate('/home');
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg border p-8">
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-bold text-primary inline-flex items-center">
              <span className="mr-2">🤝</span>
              VoloConnect
            </Link>
            <h1 className="text-2xl font-bold mt-6">Create an Account</h1>
            <p className="text-muted-foreground mt-2">Sign up to start volunteering</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="contact">Contact</Label>
              <Input id="contact" name="contact" type="text" value={formData.contact} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" value={formData.department} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="enrollment">Enrollment</Label>
              <Input id="enrollment" name="enrollment" value={formData.enrollment} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="profile_picture">Profile Picture URL</Label>
              <Input id="profile_picture" name="profile_picture" value={formData.profile_picture} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="interests">Interests</Label>
              <MultiSelect
                options={['Environment', 'Education', 'Health', 'Animal Care', 'Tech Support']}
                selected={formData.interests}
                onChange={(selected) => setFormData(prev => ({ ...prev, interests: selected }))}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <label htmlFor="terms" className="text-sm">
                I agree to the{' '}
                <Link to="#" className="text-primary underline">Terms of Service</Link> and{' '}
                <Link to="#" className="text-primary underline">Privacy Policy</Link>
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
