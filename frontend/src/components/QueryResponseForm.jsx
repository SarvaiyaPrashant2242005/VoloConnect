
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { respondToEventQuery } from '../services/eventService';

const QueryResponseForm = ({ queryId, onResponseSubmit }) => {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setIsSubmitting(true);
    try {
      await respondToEventQuery(queryId, response);
      toast.success('Response sent successfully');
      setResponse('');
      if (onResponseSubmit) onResponseSubmit();
    } catch (error) {
      console.error('Failed to send response:', error);
      toast.error('Failed to send response');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Type your response..."
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        rows={3}
      />
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !response.trim()}
        >
          {isSubmitting ? 'Sending...' : 'Send Response'}
        </Button>
      </div>
    </div>
  );
};

export default QueryResponseForm;
