import { useState } from 'react';
import { ArrowLeft, User, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface BookingFormProps {
  onSubmit: (name: string, email: string) => void;
  onBack: () => void;
}

export function BookingForm({ onSubmit, onBack }: BookingFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    onSubmit(name.trim(), email.trim());
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex min-h-11 items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <h2 className="text-lg text-gray-900 mb-4">Enter Details</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Doe"
              className="h-11 min-h-11 w-full min-w-0 rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-base outline-none focus:border-transparent focus:ring-2 focus:ring-[#006bff]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="h-11 min-h-11 w-full min-w-0 rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-base outline-none focus:border-transparent focus:ring-2 focus:ring-[#006bff]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="h-11 min-h-11 w-full rounded-lg bg-[#006bff] px-6 text-sm font-medium text-white transition-colors hover:bg-[#0056CC]"
        >
          Schedule Event
        </button>
      </form>
    </div>
  );
}
